import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

/**
 * GET ?class_id=&subject_id=&chapter_id=
 * Returns only scopes that have published lessons.
 */
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("class_id");
  const subjectId = searchParams.get("subject_id");
  const chapterId = searchParams.get("chapter_id");

  // Lessons that are published — derive available subjects/chapters
  let q = supabase
    .from("curriculum_lessons")
    .select(
      "id, title, title_bn, duration_minutes, chapter_id, subject_id, class_id, order_index, lesson_number",
    )
    .eq("is_published", true)
    .eq("is_active", true);

  if (classId) q = q.eq("class_id", classId);
  if (subjectId) q = q.eq("subject_id", subjectId);
  if (chapterId) q = q.eq("chapter_id", chapterId);

  const { data: lessons, error } = await q
    .order("order_index", { ascending: true })
    .limit(200);

  if (error) {
    return NextResponse.json(
      { error: "LOAD_FAILED", message: error.message },
      { status: 500 },
    );
  }

  const list = lessons ?? [];
  const classIds = [...new Set(list.map((l) => l.class_id).filter(Boolean))];
  const subjectIds = [...new Set(list.map((l) => l.subject_id).filter(Boolean))];
  const chapterIds = [...new Set(list.map((l) => l.chapter_id).filter(Boolean))];

  const [{ data: classes }, { data: subjects }, { data: chapters }] =
    await Promise.all([
      classIds.length
        ? supabase
            .from("curriculum_classes")
            .select("id, name, class_number")
            .in("id", classIds)
            .order("class_number")
        : Promise.resolve({ data: [] as { id: string; name: string; class_number: number }[] }),
      subjectIds.length
        ? supabase
            .from("curriculum_subjects")
            .select("id, name, name_bn, class_id")
            .in("id", subjectIds)
        : Promise.resolve({ data: [] as { id: string; name: string; name_bn: string; class_id: string }[] }),
      chapterIds.length
        ? supabase
            .from("curriculum_chapters")
            .select("id, title, title_bn, subject_id, chapter_number")
            .in("id", chapterIds)
            .order("chapter_number")
        : Promise.resolve({
            data: [] as {
              id: string;
              title: string;
              title_bn: string;
              subject_id: string;
              chapter_number: number;
            }[],
          }),
    ]);

  return NextResponse.json({
    classes: classes ?? [],
    subjects: subjects ?? [],
    chapters: chapters ?? [],
    lessons: list,
  });
}
