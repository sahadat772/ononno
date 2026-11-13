import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isLessonExamPassed, CURRICULUM_UNLOCK_THRESHOLD_PCT } from '@/lib/curriculum-unlock'
import { levelFromTotalXp } from '@/lib/xp'

/**
 * GET /api/parent/child-report?childId=...&period=week|month
 * Parent-facing report card for a linked child (M2).
 */
export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const childId = url.searchParams.get('childId')
    if (!childId) {
      return NextResponse.json({ error: 'childId required' }, { status: 400 })
    }
    const period = url.searchParams.get('period') === 'month' ? 'month' : 'week'
    const days = period === 'month' ? 30 : 7

    const { data: relation } = await supabase
      .from('parent_children')
      .select('id')
      .eq('parent_id', user.id)
      .eq('child_id', childId)
      .maybeSingle()
    if (!relation) {
      return NextResponse.json({ error: 'Not linked' }, { status: 403 })
    }

    const since = new Date()
    since.setUTCDate(since.getUTCDate() - (days - 1))
    since.setUTCHours(0, 0, 0, 0)
    const sinceIso = since.toISOString()

    const [progressRes, profileRes, studentRes, sessionsRes] = await Promise.all([
      supabase
        .from('learning_progress')
        .select(
          'lesson_id, subject_id, status, score, xp_earned, completed_at, updated_at',
        )
        .eq('user_id', childId)
        .order('updated_at', { ascending: false })
        .limit(500),
      supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', childId)
        .maybeSingle(),
      supabase
        .from('student_profiles')
        .select('class_level')
        .eq('user_id', childId)
        .maybeSingle(),
      supabase
        .from('user_sessions')
        .select('login_at, duration_minutes')
        .eq('user_id', childId)
        .gte('login_at', sinceIso)
        .order('login_at', { ascending: false })
        .limit(20),
    ])

    const rows = progressRes.data || []
    const completedAll = rows.filter(
      (r) =>
        r.status === 'completed' &&
        (r.score == null || isLessonExamPassed(Number(r.score))),
    )
    const inPeriod = (r: (typeof rows)[0]) => {
      const d = r.completed_at || r.updated_at
      return d && String(d) >= sinceIso
    }
    const completedPeriod = completedAll.filter(inPeriod)
    const scoresPeriod = completedPeriod
      .map((r) => Number(r.score))
      .filter((s) => Number.isFinite(s))
    const avgScore =
      scoresPeriod.length > 0
        ? Math.round(scoresPeriod.reduce((a, b) => a + b, 0) / scoresPeriod.length)
        : null

    let strong = 0
    let medium = 0
    let weak = 0
    for (const s of scoresPeriod) {
      if (s >= 80) strong++
      else if (s >= CURRICULUM_UNLOCK_THRESHOLD_PCT) medium++
      else weak++
    }

    const xpPeriod = completedPeriod.reduce(
      (s, r) => s + (Number(r.xp_earned) || 0),
      0,
    )
    const totalXp = rows.reduce((s, r) => s + (Number(r.xp_earned) || 0), 0)
    const { level } = levelFromTotalXp(totalXp)

    const daySet = new Set<string>()
    for (const r of completedAll) {
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

    const dailyMap: Record<string, number> = {}
    for (let i = 0; i < days; i++) {
      const d = new Date(since)
      d.setUTCDate(since.getUTCDate() + i)
      dailyMap[d.toISOString().slice(0, 10)] = 0
    }
    for (const r of completedPeriod) {
      const key = String(r.completed_at || r.updated_at).slice(0, 10)
      if (key in dailyMap) dailyMap[key]++
    }
    const daily = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, lessons: count }))

    const sessionMinutes = (sessionsRes.data || []).reduce(
      (s, x) => s + (Number(x.duration_minutes) || 0),
      0,
    )
    const sessionCount = (sessionsRes.data || []).length

    const childName = profileRes.data?.full_name || 'সন্তান'
    const first = childName.split(' ')[0]
    const periodLabel = period === 'month' ? 'গত মাসে' : 'এই সপ্তাহে'
    let headline = ''
    let tip = ''
    if (completedPeriod.length === 0) {
      headline = `${first} ${periodLabel} কোনো পাঠ সম্পন্ন করেনি।`
      tip = 'প্রতিদিন ছোট একটা লক্ষ্য দিন — Kids Zone বা Academic থেকে একটা লেসন।'
    } else if (avgScore != null && avgScore >= 80) {
      headline = `${first} ${periodLabel} ভালো করছে: ${completedPeriod.length} পাঠ, গড় ${avgScore}%.`
      tip = 'প্রশংসা করুন এবং streak ধরে রাখতে উৎসাহ দিন।'
    } else if (weak > strong) {
      headline = `${first}-এর কিছু পাঠে স্কোর কম (${weak} টি দুর্বল)।`
      tip = 'দুর্বল টপিক আবার পড়তে বলুন — performance পেজে weak লিস্ট আছে।'
    } else {
      headline = `${first} ${periodLabel} ${completedPeriod.length} পাঠ শেষ করেছে · Level ${level}.`
      tip =
        streak > 0
          ? `বর্তমান streak ${streak} দিন — নিয়মিততা বজায় রাখতে সাহায্য করুন।`
          : 'নিয়মিত অভ্যাস গঠনে ছোট দৈনিক লক্ষ্য সেট করুন।'
    }

    const grade =
      avgScore == null
        ? null
        : avgScore >= 90
          ? 'A+'
          : avgScore >= 80
            ? 'A'
            : avgScore >= 70
              ? 'B'
              : avgScore >= 60
                ? 'C'
                : 'Needs work'

    return NextResponse.json({
      ok: true,
      period,
      days,
      child: {
        id: childId,
        name: childName,
        email: profileRes.data?.email || null,
        class_level: studentRes.data?.class_level || null,
      },
      summary: {
        lessons_completed: completedPeriod.length,
        lessons_all_time: completedAll.length,
        average_score: avgScore,
        grade,
        xp_earned: xpPeriod,
        total_xp: totalXp,
        level,
        streak_days: streak,
        strong,
        medium,
        weak,
        active_days: daily.filter((d) => d.lessons > 0).length,
        session_count: sessionCount,
        session_minutes: sessionMinutes,
      },
      daily,
      narrative: { headline, tip },
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 },
    )
  }
}
