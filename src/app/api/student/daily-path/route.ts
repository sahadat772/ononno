import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { levelFromTotalXp } from '@/lib/xp'
import { isLessonExamPassed } from '@/lib/curriculum-unlock'
import { scoreToBand } from '@/lib/quiz-performance'

/**
 * GET /api/student/daily-path
 * M1: streak + daily goal + next step
 * M3: weak-area revision priority for learning loop
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
      .select(
        'lesson_id, subject_id, chapter_id, status, score, xp_earned, completed_at, updated_at',
      )
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

    // --- M3: weak-area revision priority ---
    const byLesson = new Map<string, (typeof list)[0]>()
    for (const r of list) {
      if (!r.lesson_id) continue
      if (!byLesson.has(r.lesson_id)) byLesson.set(r.lesson_id, r)
    }
    const weakRows = [...byLesson.values()]
      .filter((r) => scoreToBand(r.score) === 'weak')
      .sort((a, b) => Number(a.score ?? 0) - Number(b.score ?? 0))
    const mediumRows = [...byLesson.values()].filter(
      (r) => scoreToBand(r.score) === 'medium',
    )

    let revision: {
      lesson_id: string
      title: string
      title_bn: string | null
      score: number
      band: 'weak' | 'medium'
      href: string
    } | null = null
    let weakCount = 0
    let mediumCount = 0

    const candidateIds = weakRows.map((r) => r.lesson_id).filter(Boolean)
    if (candidateIds.length > 0) {
      const { data: lessons } = await supabase
        .from('curriculum_lessons')
        .select(
          'id, title, title_bn, subject_id, chapter_id, class_id, is_published',
        )
        .in('id', candidateIds.slice(0, 20))
        .eq('is_published', true)

      const published = lessons || []
      weakCount = published.length
      // medium count from published medium if we resolve later; approximate from rows
      mediumCount = mediumRows.length

      if (published.length > 0) {
        // pick lowest score among published
        const scoreById = new Map(
          weakRows.map((r) => [r.lesson_id, Number(r.score ?? 0)]),
        )
        published.sort(
          (a, b) => (scoreById.get(a.id) ?? 99) - (scoreById.get(b.id) ?? 99),
        )
        const top = published[0]
        const classIds = [top.class_id].filter(Boolean)
        const { data: classes } =
          classIds.length > 0
            ? await supabase
                .from('curriculum_classes')
                .select('id, slug')
                .in('id', classIds)
            : { data: [] as { id: string; slug: string }[] }
        const classSlug =
          (classes || []).find((c) => c.id === top.class_id)?.slug || 'class-1'
        const subjectId = top.subject_id
        const chapterId = top.chapter_id
        if (subjectId && chapterId) {
          revision = {
            lesson_id: top.id,
            title: top.title || 'Lesson',
            title_bn: top.title_bn,
            score: scoreById.get(top.id) ?? 0,
            band: 'weak',
            href: `/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}/${top.id}`,
          }
          // Prefer revision as next step when goal already done OR no recent path
          if (goalDone || !lastId) {
            nextHref = revision.href
            nextLabel = 'Revision'
            nextLabelBn = `রিভিশন · ${revision.title_bn || revision.title}`
          }
        }
      }
    } else {
      mediumCount = mediumRows.length
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
      revision,
      weak_count: weakCount,
      medium_count: mediumCount,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 },
    )
  }
}
