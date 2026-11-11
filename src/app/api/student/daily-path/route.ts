import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { levelFromTotalXp } from '@/lib/xp'
import { isLessonExamPassed } from '@/lib/curriculum-unlock'

/**
 * GET /api/student/daily-path
 * M1: streak + daily goal status + next step for student dashboard.
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: rows } = await supabase
      .from('learning_progress')
      .select('lesson_id, status, score, xp_earned, completed_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(400)

    const list = rows || []
    const completed = list.filter(
      (r) =>
        r.status === 'completed' &&
        (r.score == null || isLessonExamPassed(Number(r.score))),
    )

    const daySet = new Set<string>()
    for (const r of completed) {
      const d = (r.completed_at || r.updated_at) as string | null
      if (d) daySet.add(String(d).slice(0, 10))
    }

    let streak = 0
    const cursor = new Date()
    for (let i = 0; i < 90; i++) {
      const key = cursor.toISOString().slice(0, 10)
      if (daySet.has(key)) {
        streak++
        cursor.setUTCDate(cursor.getUTCDate() - 1)
      } else if (i === 0) {
        cursor.setUTCDate(cursor.getUTCDate() - 1)
        continue
      } else break
    }

    const todayKey = new Date().toISOString().slice(0, 10)
    const lessonsToday = completed.filter((r) => {
      const d = String(r.completed_at || r.updated_at || '').slice(0, 10)
      return d === todayKey
    }).length

    const dailyGoal = 1
    const goalDone = lessonsToday >= dailyGoal
    const totalXp = list.reduce((s, r) => s + (Number(r.xp_earned) || 0), 0)
    const { level } = levelFromTotalXp(totalXp)

    const lastId = String(completed[0]?.lesson_id || '')
    const isKidsId =
      lastId.startsWith('gk-') ||
      lastId.startsWith('bn-') ||
      lastId.startsWith('en-') ||
      lastId.startsWith('ar-') ||
      lastId.startsWith('math-')

    let nextHref = '/dashboard/student/kids-zone'
    let nextLabel = 'Kids Zone'
    let nextLabelBn = 'কিডস জোন · আজকের লেসন'

    if (!isKidsId && lastId) {
      nextHref = '/dashboard/student/academic'
      nextLabel = 'Academic'
      nextLabelBn = 'একাডেমিক পাঠ চালিয়ে যাও'
    } else if (isKidsId && lastId.startsWith('gk-')) {
      nextHref = '/dashboard/student/kids-zone/nursery/gk'
      nextLabel = 'General Knowledge'
      nextLabelBn = 'সাধারণ জ্ঞান · পরের লেসন'
    }

    return NextResponse.json({
      ok: true,
      streak_days: streak,
      goal_done_today: goalDone,
      lessons_completed_today: lessonsToday,
      daily_goal: dailyGoal,
      total_xp: totalXp,
      level,
      next_href: nextHref,
      next_label: nextLabel,
      next_label_bn: nextLabelBn,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 },
    )
  }
}
