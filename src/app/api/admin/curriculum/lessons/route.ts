import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { validateBody, CreateCurriculumLessonSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapter_id");
    const subjectId = searchParams.get("subject_id");
    const classId = searchParams.get("class_id");

    // Admin list includes archived so restore is possible
    let query = auth.supabase
      .from("curriculum_lessons")
      .select(
        `
                *,
                curriculum_chapters(id, title, title_bn),
                curriculum_subjects(id, name, name_bn),
                curriculum_classes(id, name)
            `,
      )
      .order("order_index", { ascending: true });

    if (chapterId) query = query.eq("chapter_id", chapterId);
    if (subjectId) query = query.eq("subject_id", subjectId);
    if (classId) query = query.eq("class_id", classId);

    const { data, error } = await query;

    if (error) {
      console.error("Lessons GET error:", error);
      return NextResponse.json(
        { error: "Lesson তালিকা আনা যায়নি।" },
        { status: 500 },
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const rateError = await rateLimit(
      `admin-create-lesson:${auth.user.id}`,
      rateLimitDefaults.adminAI,
    );
    if (rateError) return rateError;

    const body = await validateBody(CreateCurriculumLessonSchema, req);
    if (body instanceof NextResponse) return body;

    const {
      chapterId,
      subjectId,
      classId,
      title,
      titleBn,
      slug,
      description,
      lessonNumber,
      durationMinutes,
      xpReward,
      coinReward,
      isFreePreview,
      orderIndex,
    } = body;

    const { data: existing } = await auth.supabase
      .from("curriculum_lessons")
      .select("id")
      .eq("chapter_id", chapterId)
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "এই slug দিয়ে lesson আগে থেকেই আছে।" },
        { status: 409 },
      );
    }

    const { data, error } = await auth.supabase
      .from("curriculum_lessons")
      .insert({
        chapter_id: chapterId,
        subject_id: subjectId,
        class_id: classId,
        title,
        title_bn: titleBn,
        slug,
        description,
        lesson_number: lessonNumber ?? 1,
        duration_minutes: durationMinutes ?? 30,
        xp_reward: xpReward ?? 10,
        coin_reward: coinReward ?? 5,
        is_free_preview: isFreePreview ?? false,
        is_published: false,
        order_index: orderIndex ?? 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Lesson POST error:", error);
      return NextResponse.json(
        { error: "Lesson তৈরি করা যায়নি।" },
        { status: 500 },
      );
    }

    await audit("CREATE_LESSON", auth.user.id, {
      title,
      slug,
      chapterId,
      subjectId,
      classId,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
