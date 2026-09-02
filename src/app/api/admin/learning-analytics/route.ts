import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceRoleClient } from "@/lib/supabase-admin";
import { scoreToBand } from "@/lib/quiz-performance";

function startOfDayUTC(d = new Date()) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

async function requireAdmin() {
  const auth = await createServerSupabaseClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }) };

  const { data: profile } = await auth
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "FORBIDDEN" }, { status: 403 }) };
  }

  let db = auth;
  try {
    db = createServiceRoleClient() as typeof auth;
  } catch {
    /* session */
  }
  return { db, user };
}

/**
 * GET /api/admin/learning-analytics
 * Platform + subject + hard lessons from study_sessions + learning_progress.
 */
export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate && gate.error) return gate.error;
  const db = gate.db!;

  const today = startOfDayUTC();
  const weekAgo = new Date(today);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

  // Students with role student
  const { count: totalStudents } = await db
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "student");

  // Sessions
  const { data: sessions } = await db
    .from("study_sessions")
    .select(
      "id, student_id, subject_id, planned_minutes, actual_seconds, status, created_at, completed_at, started_at",
    )
    .order("created_at", { ascending: false })
    .limit(2000);

  const sess = sessions ?? [];
  const todayKey = today.toISOString().slice(0, 10);

  let sessionsToday = 0;
  let activeStudentsToday = new Set<string>();
  let totalActualSec = 0;
  let completedSessions = 0;

  for (const s of sess) {
    totalActualSec += Number(s.actual_seconds || 0);
    if (s.status === "completed") completedSessions += 1;
    const ref = s.completed_at || s.started_at || s.created_at;
    if (ref && String(ref).slice(0, 10) === todayKey) {
      sessionsToday += 1;
      if (s.student_id) activeStudentsToday.add(s.student_id);
    }
  }

  const avgStudyMinutes =
    sess.length === 0
      ? 0
      : Math.round(totalActualSec / sess.length / 60);

  const completionRate =
    sess.length === 0
      ? 0
      : Math.round((completedSessions / sess.length) * 100);

  // Progress / quiz
  const { data: progress } = await db
    .from("learning_progress")
    .select("lesson_id, subject_id, score, status, user_id")
    .limit(3000);

  const prog = progress ?? [];
  const scores = prog
    .map((p) => Number(p.score))
    .filter((n) => Number.isFinite(n));
  const quizAverage =
    scores.length === 0
      ? null
      : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Subject rollup from sessions + scores
  const subjectSec = new Map<string, number>();
  const subjectStudents = new Map<string, Set<string>>();
  for (const s of sess) {
    const sid = s.subject_id || "unknown";
    subjectSec.set(sid, (subjectSec.get(sid) || 0) + Number(s.actual_seconds || 0));
    if (!subjectStudents.has(sid)) subjectStudents.set(sid, new Set());
    if (s.student_id) subjectStudents.get(sid)!.add(s.student_id);
  }

  const subjectScores = new Map<string, number[]>();
  for (const p of prog) {
    if (!p.subject_id || !Number.isFinite(Number(p.score))) continue;
    if (!subjectScores.has(p.subject_id)) subjectScores.set(p.subject_id, []);
    subjectScores.get(p.subject_id)!.push(Number(p.score));
  }

  const allSubjectIds = [
    ...new Set([...subjectSec.keys(), ...subjectScores.keys()]),
  ].filter((id) => id !== "unknown");

  const { data: subjects } =
    allSubjectIds.length > 0
      ? await db
          .from("curriculum_subjects")
          .select("id, name, name_bn")
          .in("id", allSubjectIds)
      : { data: [] as { id: string; name: string; name_bn: string | null }[] };

  const subName = new Map(
    (subjects ?? []).map((s) => [s.id, s.name_bn || s.name]),
  );

  const by_subject = allSubjectIds
    .map((id) => {
      const sc = subjectScores.get(id) || [];
      const avg =
        sc.length === 0
          ? null
          : Math.round(sc.reduce((a, b) => a + b, 0) / sc.length);
      return {
        subject_id: id,
        name: subName.get(id) || "Subject",
        students: subjectStudents.get(id)?.size ?? 0,
        average_study_minutes: Math.round((subjectSec.get(id) || 0) / 60),
        average_quiz_score: avg,
        attempts: sc.length,
      };
    })
    .sort((a, b) => b.average_study_minutes - a.average_study_minutes);

  // Hardest lessons (lowest avg score, min 1 attempt)
  const byLesson = new Map<
    string,
    { scores: number[]; subject_id?: string | null }
  >();
  for (const p of prog) {
    if (!p.lesson_id || !Number.isFinite(Number(p.score))) continue;
    if (!byLesson.has(p.lesson_id)) {
      byLesson.set(p.lesson_id, { scores: [], subject_id: p.subject_id });
    }
    byLesson.get(p.lesson_id)!.scores.push(Number(p.score));
  }

  const lessonAvgs = [...byLesson.entries()].map(([id, v]) => ({
    lesson_id: id,
    subject_id: v.subject_id,
    average_score: Math.round(
      v.scores.reduce((a, b) => a + b, 0) / v.scores.length,
    ),
    attempts: v.scores.length,
    band: scoreToBand(
      Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length),
    ),
  }));

  lessonAvgs.sort((a, b) => a.average_score - b.average_score);
  const hardest = lessonAvgs.slice(0, 10);

  const hardIds = hardest.map((h) => h.lesson_id);
  const { data: lessonRows } =
    hardIds.length > 0
      ? await db
          .from("curriculum_lessons")
          .select("id, title, title_bn")
          .in("id", hardIds)
      : { data: [] as { id: string; title: string; title_bn: string | null }[] };

  const lesTitle = new Map(
    (lessonRows ?? []).map((l) => [l.id, l.title_bn || l.title]),
  );

  const hardest_lessons = hardest.map((h) => ({
    ...h,
    title: lesTitle.get(h.lesson_id) || "Lesson",
  }));

  const weakCount = lessonAvgs.filter((l) => l.band === "weak").length;

  return NextResponse.json({
    platform: {
      total_students: totalStudents ?? 0,
      active_today: activeStudentsToday.size,
      sessions_today: sessionsToday,
      total_sessions: sess.length,
      completed_sessions: completedSessions,
      completion_rate: completionRate,
      average_study_minutes: avgStudyMinutes,
      quiz_average: quizAverage,
      weak_lessons_count: weakCount,
    },
    by_subject,
    hardest_lessons,
  });
}
