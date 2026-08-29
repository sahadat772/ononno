import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/api-auth";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";
import { audit } from "@/lib/audit";
import { slugifyCurriculumLabel } from "@/lib/curriculum-import";
import { pageRangeWritePayload } from "@/lib/page-fields";

const LessonSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  titleBn: z.string().min(1).max(200).optional(),
  title_bn: z.string().min(1).max(200).optional(),
  lessonNumber: z.number().int().min(1).max(999).optional(),
  lesson_number: z.number().int().min(1).max(999).optional(),
  pageStart: z.number().int().min(1).optional(),
  pageEnd: z.number().int().min(1).optional(),
  page_start: z.number().int().min(1).optional(),
  page_end: z.number().int().min(1).optional(),
});

const ChapterSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  titleBn: z.string().min(1).max(200).optional(),
  title_bn: z.string().min(1).max(200).optional(),
  chapterNumber: z.number().int().min(1).max(999).optional(),
  chapter_number: z.number().int().min(1).max(999).optional(),
  pageStart: z.number().int().min(1).optional(),
  pageEnd: z.number().int().min(1).optional(),
  page_start: z.number().int().min(1).optional(),
  page_end: z.number().int().min(1).optional(),
  lessons: z.array(LessonSchema).default([]),
});

const CommitStructureBodySchema = z.object({
  chapters: z.array(ChapterSchema).min(1).optional(),
  structure: z.object({ chapters: z.array(ChapterSchema).min(1) }).optional(),
});

type RouteContext = { params: Promise<{ sourceId: string }> };

type NormalizedLesson = {
  title: string;
  titleBn: string;
  lessonNumber: number;
  pageStart?: number;
  pageEnd?: number;
};

type NormalizedChapter = {
  title: string;
  titleBn: string;
  chapterNumber: number;
  pageStart?: number;
  pageEnd?: number;
  lessons: NormalizedLesson[];
};

function normalizeChapters(
  chapters: z.infer<typeof ChapterSchema>[],
): NormalizedChapter[] {
  return chapters.map((chapter, chapterIndex) => {
    const title =
      chapter.title?.trim() ||
      chapter.titleBn?.trim() ||
      chapter.title_bn?.trim() ||
      `Chapter ${chapterIndex + 1}`;
    const titleBn =
      chapter.titleBn?.trim() ||
      chapter.title_bn?.trim() ||
      chapter.title?.trim() ||
      `অধ্যায় ${chapterIndex + 1}`;
    return {
      title,
      titleBn,
      chapterNumber:
        chapter.chapterNumber ?? chapter.chapter_number ?? chapterIndex + 1,
      pageStart: chapter.pageStart ?? chapter.page_start,
      pageEnd: chapter.pageEnd ?? chapter.page_end,
      lessons: (chapter.lessons ?? []).map((lesson, lessonIndex) => {
        const lTitle =
          lesson.title?.trim() ||
          lesson.titleBn?.trim() ||
          lesson.title_bn?.trim() ||
          `Lesson ${lessonIndex + 1}`;
        const lTitleBn =
          lesson.titleBn?.trim() ||
          lesson.title_bn?.trim() ||
          lesson.title?.trim() ||
          `পাঠ ${lessonIndex + 1}`;
        return {
          title: lTitle,
          titleBn: lTitleBn,
          lessonNumber:
            lesson.lessonNumber ?? lesson.lesson_number ?? lessonIndex + 1,
          pageStart: lesson.pageStart ?? lesson.page_start,
          pageEnd: lesson.pageEnd ?? lesson.page_end,
        };
      }),
    };
  });
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { sourceId } = await context.params;
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;

  const rateError = await rateLimit(
    `admin-commit-structure:${auth.user.id}`,
    rateLimitDefaults.adminAI,
  );
  if (rateError) return rateError;

  if (!z.string().uuid().safeParse(sourceId).success) {
    return NextResponse.json(
      { error: "SOURCE_NOT_FOUND", message: "Invalid source id." },
      { status: 400 },
    );
  }

  try {
    const { data: source, error: sourceError } = await auth.supabase
      .from("curriculum_sources")
      .select("id, class_id, subject_id, extracted_structure, source_status")
      .eq("id", sourceId)
      .single();

    if (sourceError || !source) {
      return NextResponse.json(
        { error: "SOURCE_NOT_FOUND", message: "PDF source পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const bodyResult = CommitStructureBodySchema.safeParse(rawBody);

    let rawChapters: z.infer<typeof ChapterSchema>[] | null = null;
    if (bodyResult.success) {
      rawChapters =
        bodyResult.data.chapters ?? bodyResult.data.structure?.chapters ?? null;
    }
    if (!rawChapters || rawChapters.length === 0) {
      const stored = source.extracted_structure as
        | { chapters?: z.infer<typeof ChapterSchema>[] }
        | null;
      if (stored?.chapters && Array.isArray(stored.chapters)) {
        rawChapters = stored.chapters;
      }
    }
    if (!rawChapters || rawChapters.length === 0) {
      return NextResponse.json(
        {
          error: "STRUCTURE_VALIDATION_FAILED",
          message:
            "কোনো structure পাওয়া যায়নি। আগে extract-structure চালান অথবা body-তে chapters পাঠান।",
        },
        { status: 400 },
      );
    }

    const chapters = normalizeChapters(rawChapters);
    const classId = source.class_id as string;
    const subjectId = source.subject_id as string;

    let chapterCount = 0;
    let lessonCount = 0;
    let skippedChapters = 0;
    let skippedLessons = 0;
    const createdChapterIds: string[] = [];

    for (const chapter of chapters) {
      const slug = slugifyCurriculumLabel(
        chapter.title,
        `chapter-${chapter.chapterNumber}`,
      );

      const { data: existingChapter } = await auth.supabase
        .from("curriculum_chapters")
        .select("id")
        .eq("subject_id", subjectId)
        .or(`slug.eq.${slug},chapter_number.eq.${chapter.chapterNumber}`)
        .maybeSingle();

      let chapterId = existingChapter?.id as string | undefined;

      if (chapterId) {
        skippedChapters += 1;
        await auth.supabase
          .from("curriculum_chapters")
          .update({
            source_id: sourceId,
            ...pageRangeWritePayload(chapter.pageStart, chapter.pageEnd),
          })
          .eq("id", chapterId);
      } else {
        const { data: inserted, error: chapterError } = await auth.supabase
          .from("curriculum_chapters")
          .insert({
            subject_id: subjectId,
            class_id: classId,
            title: chapter.title,
            title_bn: chapter.titleBn,
            slug,
            chapter_number: chapter.chapterNumber,
            order_index: chapter.chapterNumber - 1,
            is_active: true,
            source_id: sourceId,
            workflow_status: "extracted",
            ...pageRangeWritePayload(chapter.pageStart, chapter.pageEnd),
          })
          .select("id")
          .single();

        if (chapterError || !inserted) {
          console.error("Chapter insert error:", chapterError);
          return NextResponse.json(
            {
              error: "STRUCTURE_COMMIT_FAILED",
              message: `Chapter "${chapter.titleBn}" save করা যায়নি।`,
              details: chapterError?.message,
            },
            { status: 500 },
          );
        }
        chapterId = inserted.id as string;
        chapterCount += 1;
        createdChapterIds.push(chapterId);
      }

      if (!chapterId) {
        return NextResponse.json(
          {
            error: "STRUCTURE_COMMIT_FAILED",
            message: `Chapter "${chapter.titleBn}" id resolve করা যায়নি।`,
          },
          { status: 500 },
        );
      }

      const resolvedChapterId: string = chapterId;

      for (const lesson of chapter.lessons) {
        const lessonSlug = slugifyCurriculumLabel(
          lesson.title,
          `lesson-${lesson.lessonNumber}`,
        );

        const { data: existingLesson } = await auth.supabase
          .from("curriculum_lessons")
          .select("id, is_published, workflow_status")
          .eq("chapter_id", resolvedChapterId)
          .or(`slug.eq.${lessonSlug},lesson_number.eq.${lesson.lessonNumber}`)
          .maybeSingle();

        if (existingLesson) {
          skippedLessons += 1;
          if (existingLesson.is_published) continue;
          await auth.supabase
            .from("curriculum_lessons")
            .update({
              source_id: sourceId,
              ...pageRangeWritePayload(lesson.pageStart, lesson.pageEnd),
            })
            .eq("id", existingLesson.id);
          continue;
        }

        const { error: lessonError } = await auth.supabase
          .from("curriculum_lessons")
          .insert({
            chapter_id: resolvedChapterId,
            subject_id: subjectId,
            class_id: classId,
            title: lesson.title,
            title_bn: lesson.titleBn,
            slug: lessonSlug,
            lesson_number: lesson.lessonNumber,
            order_index: lesson.lessonNumber - 1,
            duration_minutes: 30,
            xp_reward: 10,
            coin_reward: 5,
            is_free_preview: false,
            is_published: false,
            is_active: true,
            workflow_status: "extracted",
            source_id: sourceId,
            ...pageRangeWritePayload(lesson.pageStart, lesson.pageEnd),
          });

        if (lessonError) {
          console.error("Lesson insert error:", lessonError);
          return NextResponse.json(
            {
              error: "STRUCTURE_COMMIT_FAILED",
              message: `Lesson "${lesson.titleBn}" save করা যায়নি।`,
              details: lessonError.message,
            },
            { status: 500 },
          );
        }
        lessonCount += 1;
      }
    }

    await auth.supabase
      .from("curriculum_sources")
      .update({
        source_status: "reviewed",
        workflow_status: "reviewed",
        total_chapters: chapters.length,
        total_lessons: chapters.reduce((n, ch) => n + ch.lessons.length, 0),
      })
      .eq("id", sourceId);

    await audit("COMMIT_CURRICULUM_STRUCTURE", auth.user.id, {
      sourceId,
      chapterCount,
      lessonCount,
      skippedChapters,
      skippedLessons,
    });

    return NextResponse.json({
      sourceId,
      chapterCount,
      lessonCount,
      skippedChapters,
      skippedLessons,
      createdChapterIds,
      status: "reviewed",
    });
  } catch (error) {
    console.error("commit-structure error:", error);
    return NextResponse.json(
      {
        error: "STRUCTURE_COMMIT_FAILED",
        message: "Structure commit করা যায়নি।",
      },
      { status: 500 },
    );
  }
}
