import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import { slugifyCurriculumLabel } from "@/lib/curriculum-import";
import { createServiceRoleClient } from "@/lib/supabase-admin";

const BodySchema = z.object({
  subject_id: z.string().uuid(),
  target_per_chapter: z.number().int().min(4).max(12).optional().default(7),
});

/**
 * POST { subject_id }
 * Takes all lessons of a subject (ordered), creates ~8 chapters, reassigns lessons.
 * Does not delete lesson content — only moves chapter_id / numbers.
 */
export async function POST(req: NextRequest) {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;

  const raw = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_BODY", message: "subject_id UUID লাগবে।" },
      { status: 400 },
    );
  }

  const { subject_id, target_per_chapter } = parsed.data;

  let db = auth.supabase;
  try {
    db = createServiceRoleClient() as typeof auth.supabase;
  } catch {
    // use session client
  }

  const { data: subject, error: subErr } = await db
    .from("curriculum_subjects")
    .select("id, class_id, name, name_bn")
    .eq("id", subject_id)
    .maybeSingle();

  if (subErr || !subject) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Subject পাওয়া যায়নি।" },
      { status: 404 },
    );
  }

  const classId = subject.class_id as string;

  const { data: lessons, error: lesErr } = await db
    .from("curriculum_lessons")
    .select("id, title, title_bn, order_index, lesson_number, chapter_id")
    .eq("subject_id", subject_id)
    .order("order_index", { ascending: true });

  if (lesErr) {
    return NextResponse.json(
      { error: "LOAD_FAILED", message: lesErr.message },
      { status: 500 },
    );
  }

  const list = lessons ?? [];
  if (list.length === 0) {
    return NextResponse.json(
      { error: "NO_LESSONS", message: "এই subject-এ lesson নেই।" },
      { status: 400 },
    );
  }

  // Sort stably
  list.sort(
    (a, b) =>
      (a.order_index ?? 0) - (b.order_index ?? 0) ||
      (a.lesson_number ?? 0) - (b.lesson_number ?? 0),
  );

  const desiredChapters = Math.min(
    12,
    Math.max(4, Math.ceil(list.length / target_per_chapter)),
  );
  const perChapter = Math.ceil(list.length / desiredChapters);

  // Delete existing chapters for subject (lessons will be reassigned first to avoid orphan FK issues)
  // Strategy: create new chapters, update lesson chapter_id, then delete old chapters not in new set.

  const { data: oldChapters } = await db
    .from("curriculum_chapters")
    .select("id")
    .eq("subject_id", subject_id);

  const oldIds = (oldChapters ?? []).map((c) => c.id as string);
  const newChapterIds: string[] = [];

  for (let c = 0; c < desiredChapters; c++) {
    const slice = list.slice(c * perChapter, (c + 1) * perChapter);
    if (slice.length === 0) break;

    const chapterNumber = c + 1;
    const hint =
      (slice[0]?.title_bn as string) ||
      (slice[0]?.title as string) ||
      `অধ্যায় ${chapterNumber}`;
    const title = `Chapter ${chapterNumber}`;
    const titleBn = `অধ্যায় ${chapterNumber}: ${hint}`.slice(0, 120);
    const slug = slugifyCurriculumLabel(titleBn, `chapter-${chapterNumber}`);

    const { data: inserted, error: insErr } = await db
      .from("curriculum_chapters")
      .insert({
        subject_id,
        class_id: classId,
        title,
        title_bn: titleBn,
        slug: `${slug}-${Date.now().toString(36).slice(-4)}`,
        chapter_number: chapterNumber,
        order_index: c,
        is_active: true,
        workflow_status: "extracted",
      })
      .select("id")
      .single();

    if (insErr || !inserted) {
      return NextResponse.json(
        {
          error: "CHAPTER_CREATE_FAILED",
          message: insErr?.message ?? "Chapter create failed",
        },
        { status: 500 },
      );
    }

    const chapterId = inserted.id as string;
    newChapterIds.push(chapterId);

    for (let i = 0; i < slice.length; i++) {
      const les = slice[i];
      await db
        .from("curriculum_lessons")
        .update({
          chapter_id: chapterId,
          lesson_number: i + 1,
          order_index: i,
        })
        .eq("id", les.id);
    }
  }

  // Remove old chapters (now empty of lessons or orphaned)
  if (oldIds.length > 0) {
    await db.from("curriculum_chapters").delete().in("id", oldIds);
  }

  await audit("REBALANCE_CHAPTERS", auth.user.id, {
    subject_id,
    lessonCount: list.length,
    chapterCount: newChapterIds.length,
  });

  return NextResponse.json({
    ok: true,
    subject_id,
    lessons: list.length,
    chapters: newChapterIds.length,
    perChapter,
    message: `${list.length} lesson → ${newChapterIds.length} chapter-এ ভাগ হয়েছে।`,
  });
}
