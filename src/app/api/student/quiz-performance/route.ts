import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  scoreToBand,
  toLessonPerformance,
  type LessonPerformance,
} from "@/lib/quiz-performance";

/**
 * GET /api/student/quiz-performance
 * Optional: ?subject_id=&weak_only=1
 * Returns performance rows from learning_progress + lesson titles.
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
  const subjectId = searchParams.get("subject_id");
  const weakOnly = searchParams.get("weak_only") === "1";

  let q = supabase
    .from("learning_progress")
    .select(
      "lesson_id, subject_id, chapter_id, score, xp_earned, status, completed_at",
    )
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  if (subjectId) q = q.eq("subject_id", subjectId);

  const { data: rows, error } = await q.limit(100);
  if (error) {
    return NextResponse.json(
      { error: "LOAD_FAILED", message: error.message },
      { status: 500 },
    );
  }

  const list = rows ?? [];
  const lessonIds = [...new Set(list.map((r) => r.lesson_id).filter(Boolean))];

  let titleMap = new Map<string, { title: string; title_bn: string | null }>();
  if (lessonIds.length > 0) {
    const { data: lessons } = await supabase
      .from("curriculum_lessons")
      .select("id, title, title_bn")
      .in("id", lessonIds);
    for (const l of lessons ?? []) {
      titleMap.set(l.id, { title: l.title, title_bn: l.title_bn });
    }
  }

  // Latest score per lesson
  const byLesson = new Map<string, (typeof list)[0]>();
  for (const r of list) {
    if (!r.lesson_id) continue;
    if (!byLesson.has(r.lesson_id)) byLesson.set(r.lesson_id, r);
  }

  let performances: LessonPerformance[] = [...byLesson.values()].map((r) => {
    const t = titleMap.get(r.lesson_id);
    return toLessonPerformance({
      ...r,
      title: t?.title,
      title_bn: t?.title_bn,
    });
  });

  if (weakOnly) {
    performances = performances.filter((p) => p.band === "weak");
  }

  const summary = {
    total: performances.length,
    strong: performances.filter((p) => p.band === "strong").length,
    medium: performances.filter((p) => p.band === "medium").length,
    weak: performances.filter((p) => p.band === "weak").length,
    average_score:
      performances.length === 0
        ? null
        : Math.round(
            performances.reduce((s, p) => s + p.score, 0) / performances.length,
          ),
  };

  return NextResponse.json({
    performances,
    summary,
    bands: {
      strong: "80–100%",
      medium: "50–79%",
      weak: "0–49%",
    },
  });
}
