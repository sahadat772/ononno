import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { scoreToBand, bandLabelBn } from "@/lib/quiz-performance";

/**
 * GET /api/student/weak-areas
 * Returns weak (and optionally medium) lessons with deep links for revision.
 * Published curriculum only — no AI regenerate.
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from("learning_progress")
    .select(
      "lesson_id, subject_id, chapter_id, score, status, completed_at, xp_earned",
    )
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(150);

  if (error) {
    return NextResponse.json(
      { error: "LOAD_FAILED", message: error.message },
      { status: 500 },
    );
  }

  // Latest per lesson
  const byLesson = new Map<string, (typeof rows)[0]>();
  for (const r of rows ?? []) {
    if (!r.lesson_id) continue;
    if (!byLesson.has(r.lesson_id)) byLesson.set(r.lesson_id, r);
  }

  const weakOrMedium = [...byLesson.values()].filter((r) => {
    const band = scoreToBand(r.score);
    return band === "weak" || band === "medium";
  });

  const lessonIds = weakOrMedium.map((r) => r.lesson_id);
  if (lessonIds.length === 0) {
    return NextResponse.json({
      weak: [],
      medium: [],
      count: { weak: 0, medium: 0 },
      message: "কোনো weak/medium lesson নেই — মাশাআল্লাহ!",
    });
  }

  const { data: lessons } = await supabase
    .from("curriculum_lessons")
    .select(
      "id, title, title_bn, subject_id, chapter_id, class_id, is_published",
    )
    .in("id", lessonIds)
    .eq("is_published", true);

  const classIds = [
    ...new Set((lessons ?? []).map((l) => l.class_id).filter(Boolean)),
  ];
  const { data: classes } =
    classIds.length > 0
      ? await supabase
          .from("curriculum_classes")
          .select("id, slug, name")
          .in("id", classIds)
      : { data: [] as { id: string; slug: string; name: string }[] };

  const classSlugById = new Map(
    (classes ?? []).map((c) => [c.id, c.slug || "class-1"]),
  );

  const lessonMap = new Map((lessons ?? []).map((l) => [l.id, l]));

  const enrich = (r: (typeof weakOrMedium)[0]) => {
    const les = lessonMap.get(r.lesson_id);
    if (!les) return null;
    const band = scoreToBand(r.score);
    const classSlug = classSlugById.get(les.class_id) || "class-1";
    const subjectId = les.subject_id || r.subject_id;
    const chapterId = les.chapter_id || r.chapter_id;
    if (!subjectId || !chapterId) return null;
    return {
      lesson_id: r.lesson_id,
      title: les.title,
      title_bn: les.title_bn,
      score: Number(r.score ?? 0),
      band,
      band_label: bandLabelBn(band),
      subject_id: subjectId,
      chapter_id: chapterId,
      class_id: les.class_id,
      class_slug: classSlug,
      href: `/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}/${r.lesson_id}`,
      completed_at: r.completed_at,
    };
  };

  const enriched = weakOrMedium.map(enrich).filter(Boolean) as NonNullable<
    ReturnType<typeof enrich>
  >[];

  const weak = enriched.filter((e) => e.band === "weak");
  const medium = enriched.filter((e) => e.band === "medium");

  return NextResponse.json({
    weak,
    medium,
    count: { weak: weak.length, medium: medium.length },
    thresholds: { strong: "80+", medium: "50–79", weak: "0–49" },
  });
}
