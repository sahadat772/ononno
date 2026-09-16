import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isLessonExamPassed, CURRICULUM_UNLOCK_THRESHOLD_PCT } from '@/lib/curriculum-unlock'
import { getUnlockedUpToNumber } from '@/lib/student-class-access'
import { evaluateClassForUser } from '@/lib/evaluate-class-completion-server'

/**
 * GET /api/student/progress-tracking
 * Unified progress: overall stats, subject breakdown, class unlock, recent activity.
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

    const [progressRes, profileRes, studentRes] = await Promise.all([
      supabase
        .from('learning_progress')
        .select(
          'lesson_id, subject_id, chapter_id, status, score, xp_earned, completed_at, updated_at',
        )
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(500),
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('student_profiles')
        .select('class_level, unlocked_class_level')
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

    const rows = progressRes.data || []
    const registered = studentRes.data?.class_level || null
    const unlocked =
      (studentRes.data as { unlocked_class_level?: string } | null)
        ?.unlocked_class_level || registered

    const completed = rows.filter(
      (r) =>
        r.status === 'completed' &&
        (r.score == null || isLessonExamPassed(Number(r.score))),
    )
    const scores = completed
      .map((r) => Number(r.score))
      .filter((s) => Number.isFinite(s))
    const totalXp = rows.reduce((s, r) => s + (Number(r.xp_earned) || 0), 0)
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null

    let strong = 0
    let medium = 0
    let weak = 0
    for (const s of scores) {
      if (s >= 80) strong++
      else if (s >= CURRICULUM_UNLOCK_THRESHOLD_PCT) medium++
      else weak++
    }

    const daySet = new Set<string>()
    for (const r of completed) {
      const d = (r.completed_at || r.updated_at) as string | null
      if (d) daySet.add(String(d).slice(0, 10))
    }
    let streak = 0
    const cursor = new Date()
    for (let i = 0; i < 60; i++) {
      const key = cursor.toISOString().slice(0, 10)
      if (daySet.has(key)) {
        streak++
        cursor.setUTCDate(cursor.getUTCDate() - 1)
      } else if (i === 0) {
        cursor.setUTCDate(cursor.getUTCDate() - 1)
        continue
      } else break
    }

    const bySubject: Record<
      string,
      { completed: number; total: number; xp: number; scores: number[] }
    > = {}
    for (const r of rows) {
      const sid = String(r.subject_id || 'unknown')
      if (!bySubject[sid]) {
        bySubject[sid] = { completed: 0, total: 0, xp: 0, scores: [] }
      }
      bySubject[sid].total += 1
      bySubject[sid].xp += Number(r.xp_earned) || 0
      if (
        r.status === 'completed' &&
        (r.score == null || isLessonExamPassed(Number(r.score)))
      ) {
        bySubject[sid].completed += 1
        if (r.score != null) bySubject[sid].scores.push(Number(r.score))
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

    const subjects = Object.entries(bySubject).map(([id, v]) => {
      const avg =
        v.scores.length > 0
          ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length)
          : null
      const percent =
        v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0
      return {
        subject_id: id,
        name: nameMap[id] || (id === 'unknown' ? 'অন্যান্য' : 'Subject'),
        completed: v.completed,
        tracked: v.total,
        percent,
        xp: v.xp,
        average_score: avg,
      }
    })
    subjects.sort((a, b) => b.percent - a.percent)

    let classCompletion = null
    if (unlocked) {
      try {
        const cc = await evaluateClassForUser(supabase, user.id, unlocked)
        classCompletion = {
          class_level: unlocked,
          isComplete: cc.isComplete,
          percent: cc.percent,
          completedSubjects: cc.completedSubjects,
          totalSubjects: cc.totalSubjects,
          classResolved: cc.classResolved,
        }
      } catch {
        classCompletion = null
      }
    }

    const recent = completed.slice(0, 8).map((r) => ({
      lesson_id: r.lesson_id,
      subject_id: r.subject_id,
      score: r.score,
      xp: r.xp_earned,
      at: r.completed_at || r.updated_at,
    }))

    const level = Math.max(1, Math.floor(totalXp / 500) + 1)
    const xpInLevel = totalXp % 500
    const xpToNext = 500 - xpInLevel
    const maxUnlocked = getUnlockedUpToNumber(registered, unlocked)

    return NextResponse.json({
      ok: true,
      profile: {
        name: profileRes.data?.full_name || 'Student',
        class_level: registered,
        unlocked_class_level: unlocked,
        max_unlocked_number: maxUnlocked,
      },
      overall: {
        lessons_completed: completed.length,
        lessons_tracked: rows.length,
        total_xp: totalXp,
        level,
        xp_in_level: xpInLevel,
        xp_to_next: xpToNext,
        average_score: avgScore,
        streak_days: streak,
        strong,
        medium,
        weak,
        threshold_pct: CURRICULUM_UNLOCK_THRESHOLD_PCT,
      },
      subjects,
      class_completion: classCompletion,
      recent,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 },
    )
  }
}
