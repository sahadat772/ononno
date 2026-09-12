import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { tryUnlockNextClass } from '@/lib/evaluate-class-completion-server'

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await tryUnlockNextClass(supabase, user.id)

    if (
      result.message?.includes('unlocked_class_level') ||
      result.message?.includes('column')
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: result.message,
          hint: 'alter table student_profiles add column if not exists unlocked_class_level text;',
        },
        { status: 503 },
      )
    }

    return NextResponse.json({
      ok: result.unlocked,
      unlocked: result.unlocked,
      unlocked_class_level: result.next || result.previous,
      previous: result.previous,
      next: result.next,
      message: result.message,
      classCompletion: {
        isComplete: result.classCompletion.isComplete,
        percent: result.classCompletion.percent,
        completedSubjects: result.classCompletion.completedSubjects,
        totalSubjects: result.classCompletion.totalSubjects,
        classResolved: result.classCompletion.classResolved,
        subjects: result.classCompletion.subjects.map((s) => ({
          subjectId: s.subjectId,
          percent: s.percent,
          isComplete: s.isComplete,
          completedLessons: s.completedLessons,
          totalLessons: s.totalLessons,
        })),
      },
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: sp } = await supabase
      .from('student_profiles')
      .select('class_level, unlocked_class_level')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!sp?.class_level) {
      return NextResponse.json({ error: 'No student profile' }, { status: 400 })
    }

    const unlocked =
      (sp as { unlocked_class_level?: string }).unlocked_class_level ||
      sp.class_level

    const { evaluateClassForUser } = await import(
      '@/lib/evaluate-class-completion-server'
    )
    const classCompletion = await evaluateClassForUser(
      supabase,
      user.id,
      unlocked as string,
    )

    return NextResponse.json({
      registered: sp.class_level,
      unlocked_class_level: unlocked,
      classCompletion,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 },
    )
  }
}
