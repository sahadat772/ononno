import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  buildSessionPlan,
  clampStudyMinutes,
  MIN_STUDY_MINUTES,
  type PublishedLessonLite,
} from "@/lib/study-session";

const CreateBodySchema = z.object({
  planned_minutes: z.number().int().min(MIN_STUDY_MINUTES).max(240),
  class_id: z.string().uuid().optional().nullable(),
  subject_id: z.string().uuid(),
  chapter_id: z.string().uuid().optional().nullable(),
  lesson_ids: z.array(z.string().uuid()).optional(),
});

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("study_sessions")
    .select("id, planned_minutes, actual_seconds, status, subject_id, chapter_id, started_at, completed_at, created_at")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json(
      { error: "LOAD_FAILED", message: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ sessions: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const raw = await req.json().catch(() => ({}));
  const parsed = CreateBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "INVALID_BODY",
        message: `planned_minutes ≥ ${MIN_STUDY_MINUTES} এবং subject_id লাগবে।`,
      },
      { status: 400 },
    );
  }

  const planned = clampStudyMinutes(parsed.data.planned_minutes);
  const subjectId = parsed.data.subject_id;
  const chapterId = parsed.data.chapter_id ?? null;
  const classId = parsed.data.class_id ?? null;

  // Only published active lessons
  let lessonQuery = supabase
    .from("curriculum_lessons")
    .select(
      "id, title, title_bn, duration_minutes, chapter_id, subject_id, class_id, order_index, lesson_number",
    )
    .eq("subject_id", subjectId)
    .eq("is_published", true)
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (chapterId) {
    lessonQuery = lessonQuery.eq("chapter_id", chapterId);
  }

  const { data: published, error: lesErr } = await lessonQuery;
  if (lesErr) {
    return NextResponse.json(
      { error: "LESSON_LOAD_FAILED", message: lesErr.message },
      { status: 500 },
    );
  }

  let lessons = (published ?? []) as PublishedLessonLite[];

  if (parsed.data.lesson_ids?.length) {
    const set = new Set(parsed.data.lesson_ids);
    lessons = lessons.filter((l) => set.has(l.id));
  }

  if (lessons.length === 0) {
    return NextResponse.json(
      {
        error: "NO_PUBLISHED_LESSONS",
        message: "এই scope-এ published lesson নেই। Admin publish করুক।",
      },
      { status: 400 },
    );
  }

  const plan = buildSessionPlan({ plannedMinutes: planned, lessons });
  if (plan.length === 0) {
    return NextResponse.json(
      { error: "PLAN_EMPTY", message: "Session plan তৈরি হয়নি।" },
      { status: 400 },
    );
  }

  const resolvedClassId = classId || lessons[0]?.class_id || null;
  const resolvedChapterId = chapterId || lessons[0]?.chapter_id || null;

  const { data: session, error: sessErr } = await supabase
    .from("study_sessions")
    .insert({
      student_id: user.id,
      class_id: resolvedClassId,
      subject_id: subjectId,
      chapter_id: resolvedChapterId,
      planned_minutes: planned,
      actual_seconds: 0,
      status: "planned",
    })
    .select("*")
    .single();

  if (sessErr || !session) {
    return NextResponse.json(
      {
        error: "SESSION_CREATE_FAILED",
        message:
          sessErr?.message ??
          "study_sessions table আছে কি? Migration চালাও।",
      },
      { status: 500 },
    );
  }

  const rows = plan.map((p) => ({
    session_id: session.id,
    lesson_id: p.lesson_id,
    position: p.position,
    planned_minutes: p.planned_minutes,
    item_type: p.item_type,
    status: "pending",
  }));

  const { error: itemsErr } = await supabase
    .from("study_session_items")
    .insert(rows);

  if (itemsErr) {
    await supabase.from("study_sessions").delete().eq("id", session.id);
    return NextResponse.json(
      { error: "ITEMS_CREATE_FAILED", message: itemsErr.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    session,
    plan,
    message: `${planned} মিনিটের plan তৈরি হয়েছে (${plan.length} ধাপ)।`,
  });
}
