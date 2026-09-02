import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function startOfDayUTC(d = new Date()) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * GET /api/student/learning-insights
 * Today study minutes (sessions), streak days, weekly minutes by subject.
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = startOfDayUTC(now);
  const weekStart = new Date(todayStart);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);

  // Study sessions (last 60 days for streak)
  const lookback = new Date(todayStart);
  lookback.setUTCDate(lookback.getUTCDate() - 59);

  const { data: sessions, error: sessErr } = await supabase
    .from("study_sessions")
    .select(
      "id, planned_minutes, actual_seconds, status, subject_id, completed_at, started_at, created_at",
    )
    .eq("student_id", user.id)
    .gte("created_at", lookback.toISOString())
    .order("created_at", { ascending: false });

  if (sessErr) {
    // Table may be missing in some envs — soft fail
    return NextResponse.json({
      today: {
        planned_goal_minutes: 25,
        actual_minutes: 0,
        sessions: 0,
        progress_pct: 0,
      },
      streak_days: 0,
      weekly: { total_minutes: 0, by_subject: [] },
      warning: sessErr.message,
    });
  }

  const list = sessions ?? [];

  // Today: sum actual_seconds for sessions active/completed today
  const todayKey = dateKey(todayStart);
  let todaySeconds = 0;
  let todaySessions = 0;
  for (const s of list) {
    const ref = s.completed_at || s.started_at || s.created_at;
    if (!ref) continue;
    const k = String(ref).slice(0, 10);
    if (k === todayKey) {
      todaySeconds += Number(s.actual_seconds || 0);
      todaySessions += 1;
    }
  }
  const todayMinutes = Math.round(todaySeconds / 60);
  const goalMinutes = 25;
  const progressPct = Math.min(
    100,
    Math.round((todayMinutes / Math.max(goalMinutes, 1)) * 100),
  );

  // Streak: consecutive days with at least one completed/active session having actual > 0
  const daysWithStudy = new Set<string>();
  for (const s of list) {
    if ((s.actual_seconds || 0) <= 0 && s.status !== "completed") continue;
    const ref = s.completed_at || s.started_at || s.created_at;
    if (ref) daysWithStudy.add(String(ref).slice(0, 10));
  }

  let streak = 0;
  const cursor = new Date(todayStart);
  // If today has no study yet, still allow streak from yesterday
  if (!daysWithStudy.has(dateKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  for (let i = 0; i < 60; i++) {
    const k = dateKey(cursor);
    if (daysWithStudy.has(k)) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else break;
  }

  // Weekly minutes by subject
  const weekSecBySubject = new Map<string, number>();
  let weekTotalSec = 0;
  for (const s of list) {
    const ref = s.completed_at || s.started_at || s.created_at;
    if (!ref) continue;
    const t = new Date(ref);
    if (t < weekStart) continue;
    const sec = Number(s.actual_seconds || 0);
    weekTotalSec += sec;
    const sid = s.subject_id || "unknown";
    weekSecBySubject.set(sid, (weekSecBySubject.get(sid) || 0) + sec);
  }

  const subjectIds = [...weekSecBySubject.keys()].filter((id) => id !== "unknown");
  let nameMap = new Map<string, string>();
  if (subjectIds.length > 0) {
    const { data: subjects } = await supabase
      .from("curriculum_subjects")
      .select("id, name, name_bn")
      .in("id", subjectIds);
    for (const sub of subjects ?? []) {
      nameMap.set(sub.id, sub.name_bn || sub.name || "Subject");
    }
  }

  const by_subject = [...weekSecBySubject.entries()]
    .map(([id, sec]) => ({
      subject_id: id,
      name: nameMap.get(id) || (id === "unknown" ? "অন্যান্য" : "Subject"),
      minutes: Math.round(sec / 60),
    }))
    .sort((a, b) => b.minutes - a.minutes);

  // Quiz avg from learning_progress (optional insight)
  const { data: progress } = await supabase
    .from("learning_progress")
    .select("score, status")
    .eq("user_id", user.id)
    .limit(100);

  const scores = (progress ?? [])
    .map((p) => Number(p.score))
    .filter((n) => Number.isFinite(n));
  const avgQuiz =
    scores.length === 0
      ? null
      : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return NextResponse.json({
    today: {
      planned_goal_minutes: goalMinutes,
      actual_minutes: todayMinutes,
      sessions: todaySessions,
      progress_pct: progressPct,
    },
    streak_days: streak,
    weekly: {
      total_minutes: Math.round(weekTotalSec / 60),
      by_subject,
    },
    quiz_average: avgQuiz,
    lessons_tracked: scores.length,
  });
}
