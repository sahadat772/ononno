import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isLessonExamPassed, CURRICULUM_UNLOCK_THRESHOLD_PCT } from '@/lib/curriculum-unlock'
import { levelFromTotalXp } from '@/lib/xp'

/**
 * GET /api/student/report-card?period=week|month
 * M2: Shikho-style report card for student (and shared structure for parent).
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
    const period = url.searchParams.get('period') === 'month' ? 'month' : 'week'
    const days = period === 'month' ? 30 : 7

    const since = new Date()
    since.setUTCDate(since.getUTCDate() - (days - 1))
    since.setUTCHours(0, 0, 0, 0)
    const sinceIso = since.toISOString()

    const [progressRes, profileRes, studentRes] = await Promise.all([
      supabase
        .from('learning_progress')
        .select(
          'lesson_id, subject_id, status, score, xp_earned, completed_at, updated_at',
        )
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(500),
      supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
      supabase
        .from('student_profiles')
        .select('class_level')
        .eq('user_id', user.id)
        .maybeSingle(),
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
    const rowsPeriod = rows.filter(inPeriod)

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

    const xpPeriod = rowsPeriod.reduce((s, r) => s + (Number(r.xp_earned) || 0), 0)
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

    const bySubject: Record<
      string,
      { completed: number; scores: number[]; xp: number }
    > = {}
    for (const r of completedPeriod) {
      const sid = String(r.subject_id || 'unknown')
      if (!bySubject[sid]) bySubject[sid] = { completed: 0, scores: [], xp: 0 }
      bySubject[sid].completed++
      bySubject[sid].xp += Number(r.xp_earned) || 0
      if (r.score != null && Number.isFinite(Number(r.score))) {
        bySubject[sid].scores.push(Number(r.score))
      }
    }
    const subjectIds = Object.keys(bySubject).filter((id) => id !== 'unknown')
    const nameMap: Record<string, string> = {}
    if (subjectIds.length) {
      const { data: subjects } = await supabase
        .from('curriculum_subjects')
        .select('id, name, name_bn')
        .in('id', subjectIds)
      for (const s of subjects || []) {
        nameMap[s.id] = (s.name_bn || s.name || 'Subject') as string
      }
    }
    const subjects = Object.entries(bySubject)
      .map(([id, v]) => ({
        subject_id: id,
        name: nameMap[id] || (id === 'unknown' ? 'অন্যান্য / Kids' : 'Subject'),
        completed: v.completed,
        xp: v.xp,
        average_score:
          v.scores.length > 0
            ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length)
            : null,
      }))
      .sort((a, b) => b.completed - a.completed)

    const name = profileRes.data?.full_name?.split(' ')[0] || 'শিক্ষার্থী'
    const periodLabel = period === 'month' ? 'গত মাসে' : 'এই সপ্তাহে'
    let headline = ''
    let tip = ''
    if (completedPeriod.length === 0) {
      headline = `${name}, ${periodLabel} এখনো কোনো পাঠ শেষ হয়নি।`
      tip = 'আজকের Path থেকে একটা লেসন শুরু করো — streak জ্বলে উঠবে!'
    } else if (avgScore != null && avgScore >= 80 && streak >= 3) {
      headline = `${name} ${periodLabel} দুর্দান্ত! ${completedPeriod.length} পাঠ · গড় ${avgScore}% · 🔥${streak} দিন।`
      tip = 'এই গতি ধরে রাখো। দুর্বল টপিক থাকলে performance থেকে রিভিউ করো।'
    } else if (avgScore != null && avgScore < CURRICULUM_UNLOCK_THRESHOLD_PCT) {
      headline = `${name}, ${periodLabel} ${completedPeriod.length} পাঠ হয়েছে, গড় স্কোর ${avgScore}%.`
      tip = '৫০%-এর নিচের লেসন আবার পড়ো — Progress থেকে weak দেখো।'
    } else {
      headline = `${name} ${periodLabel} ${completedPeriod.length} পাঠ সম্পন্ন · গড় ${avgScore ?? '—'}% · Level ${level}.`
      tip =
        streak > 0
          ? `Streak ${streak} দিন চলছে — আজও একটা লেসন দিয়ে বাড়িয়ে নাও।`
          : 'প্রতিদিন একটা লেসন করলে streak শুরু হবে।'
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
      since: sinceIso.slice(0, 10),
      until: new Date().toISOString().slice(0, 10),
      profile: {
        name: profileRes.data?.full_name || 'Student',
        class_level: studentRes.data?.class_level || null,
      },
      summary: {
        lessons_completed: completedPeriod.length,
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
      },
      daily,
      subjects: subjects.slice(0, 6),
      narrative: { headline, tip },
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 },
    )
  }
}
