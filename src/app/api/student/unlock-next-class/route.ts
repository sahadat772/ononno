import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  getUnlockedUpToNumber,
  nextClassLevel,
} from '@/lib/student-class-access'

export async function POST() {
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
      return NextResponse.json({ error: 'Student profile missing' }, { status: 400 })
    }

    const registered = sp.class_level as string
    const unlocked =
      (sp as { unlocked_class_level?: string }).unlocked_class_level || registered
    const next = nextClassLevel(registered, unlocked)
    if (!next) {
      return NextResponse.json({
        ok: true,
        message: 'Already at highest class',
        unlocked_class_level: unlocked,
      })
    }

    const { count } = await supabase
      .from('learning_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed')

    if ((count || 0) < 1) {
      return NextResponse.json(
        {
          error: 'ক্লাস আনলক করতে অন্তত কিছু পাঠ সম্পন্ন ও পরীক্ষায় পাস করতে হবে',
          completed: count || 0,
        },
        { status: 400 },
      )
    }

    const { error } = await supabase
      .from('student_profiles')
      .update({ unlocked_class_level: next })
      .eq('user_id', user.id)

    if (error) {
      if (/unlocked_class_level|column/i.test(error.message)) {
        return NextResponse.json(
          {
            ok: false,
            error: 'unlocked_class_level column নেই',
            hint: 'alter table student_profiles add column if not exists unlocked_class_level text;',
            next,
          },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      unlocked_class_level: next,
      previous: unlocked,
      max_number: getUnlockedUpToNumber(registered, next),
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 },
    )
  }
}
