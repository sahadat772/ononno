import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase-admin'
import { classLevelToSlug } from '@/lib/student-class-access'

const PASS = 60

/** GET /api/parent/insights — today, quiz alerts, weekly, filters */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'parent' && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let db
    try {
      db = createServiceRoleClient()
    } catch {
      db = supabase
    }

    const { searchParams } = new URL(req.url)
    const filterChild = searchParams.get('child_id')
    const filterSubject = searchParams.get('subject_id')

    const { data: relations } = await db
      .from('parent_children')
      .select('child_id')
      .eq('parent_id', user.id)

    let childIds = (relations ?? []).map((r) => r.child_id).filter(Boolean) as string[]
    if (filterChild) {
      if (!childIds.includes(filterChild) && profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Not your child' }, { status: 403 })
      }
      childIds = [filterChild]
    }

    if (!childIds.length) {
      return NextResponse.json({
        children: [],
        alerts: [],
        subjects: [],
        tip_bn: 'সন্তান লিংক করলে আজকের পড়া ও কুইজ অ্যালার্ট দেখাবে।',
      })
    }

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [{ data: profiles }, { data: studentProfiles }, { data: progress }] =
      await Promise.all([
        db.from('profiles').select('id, full_name, avatar_url').in('id', childIds),
        db
          .from('student_profiles')
          .select('user_id, class_level')
          .in('user_id', childIds),
        db
          .from('learning_progress')
          .select(
            'user_id, lesson_id, subject_id, chapter_id, score, status, updated_at, completed_at, xp_earned',
          )
          .in('user_id', childIds)
          .order('updated_at', { ascending: false })
          .limit(500),
      ])

    const nameById = new Map((profiles ?? []).map((p) => [p.id, p]))
    const classById = new Map(
      (studentProfiles ?? []).map((s) => [s.user_id, s.class_level] as const),
    )

    let rows = progress ?? []
    if (filterSubject) {
      rows = rows.filter((r) => r.subject_id === filterSubject)
    }

    const lessonIds = [
      ...new Set(rows.map((r) => r.lesson_id).filter(Boolean) as string[]),
    ]
    const subjectIds = [
      ...new Set(rows.map((r) => r.subject_id).filter(Boolean) as string[]),
    ]

    const [{ data: lessons }, { data: subjects }] = await Promise.all([
      lessonIds.length
        ? db
            .from('curriculum_lessons')
            .select(
              'id, title, title_bn, subject_id, chapter_id, class_id, slug, is_published',
            )
            .in('id', lessonIds)
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      subjectIds.length
        ? db
            .from('curriculum_subjects')
            .select('id, name, name_bn, class_id')
            .in('id', subjectIds)
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    ])

    const lessonMap = new Map((lessons ?? []).map((l) => [String(l.id), l]))
    const subjectMap = new Map((subjects ?? []).map((s) => [String(s.id), s]))

    const classIds = [
      ...new Set(
        (lessons ?? [])
          .map((l) => (l as { class_id?: string }).class_id)
          .filter(Boolean) as string[],
      ),
    ]
    let classSlugById = new Map<string, string>()
    if (classIds.length) {
      const { data: classes } = await db
        .from('curriculum_classes')
        .select('id, slug, class_number')
        .in('id', classIds)
      classSlugById = new Map(
        (classes ?? []).map((c) => [c.id, c.slug || `class-${c.class_number}`]),
      )
    }

    type ChildInsight = {
      child_id: string
      full_name: string
      avatar_url: string | null
      class_level: string | null
      class_slug: string | null
      today: {
        title: string
        title_bn: string | null
        status: string
        score: number | null
        href: string
        updated_at: string | null
      } | null
      week: {
        completed: number
        in_progress: number
        avg_score: number | null
        minutes_est: number
        weak_subjects: { id: string; name: string; avg: number }[]
      }
      quiz_alerts: {
        lesson_id: string
        title: string
        score: number
        subject_name: string
        updated_at: string | null
      }[]
      streak_days: number
    }

    const children: ChildInsight[] = []
    const allAlerts: {
      child_id: string
      child_name: string
      lesson_id: string
      title: string
      score: number
      subject_name: string
    }[] = []

    for (const cid of childIds) {
      const p = nameById.get(cid)
      const classLevel = classById.get(cid) || null
      const classSlug = classLevelToSlug(classLevel) || null
      const childRows = rows.filter((r) => r.user_id === cid)

      let today: ChildInsight['today'] = null
      const sorted = [...childRows].sort((a, b) => {
        const ta = new Date(a.updated_at || a.completed_at || 0).getTime()
        const tb = new Date(b.updated_at || b.completed_at || 0).getTime()
        return tb - ta
      })
      const inProg = sorted.find((r) => r.status !== 'completed' && r.lesson_id)
      const pick = inProg || sorted[0]
      if (pick?.lesson_id) {
        const les = lessonMap.get(String(pick.lesson_id)) as
          | {
              id: string
              title: string
              title_bn?: string | null
              subject_id?: string
              chapter_id?: string
              class_id?: string
            }
          | undefined
        if (les) {
          const cslug =
            (les.class_id && classSlugById.get(les.class_id)) || classSlug || 'class-1'
          const href = `/dashboard/student/academic/learn/${cslug}/${les.subject_id}/${les.chapter_id}/${les.id}`
          today = {
            title: les.title,
            title_bn: les.title_bn || null,
            status: String(pick.status || 'in_progress'),
            score: pick.score != null ? Number(pick.score) : null,
            href,
            updated_at: pick.updated_at || pick.completed_at || null,
          }
        }
      }

      const weekRows = childRows.filter((r) => {
        const t = r.completed_at || r.updated_at
        return t && new Date(t) >= weekAgo
      })
      const weekDone = weekRows.filter((r) => r.status === 'completed').length
      const weekProg = weekRows.filter((r) => r.status !== 'completed').length
      const scored = weekRows.filter((r) => r.score != null)
      const avg =
        scored.length > 0
          ? Math.round(scored.reduce((s, r) => s + Number(r.score), 0) / scored.length)
          : null

      const bySub = new Map<string, number[]>()
      for (const r of weekRows) {
        if (r.subject_id == null || r.score == null) continue
        const arr = bySub.get(r.subject_id) || []
        arr.push(Number(r.score))
        bySub.set(r.subject_id, arr)
      }
      const weak_subjects: ChildInsight['week']['weak_subjects'] = []
      for (const [sid, scores] of bySub) {
        const avgS = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        if (avgS < PASS) {
          const sub = subjectMap.get(sid) as { name?: string; name_bn?: string } | undefined
          weak_subjects.push({
            id: sid,
            name: sub?.name_bn || sub?.name || 'বিষয়',
            avg: avgS,
          })
        }
      }
      weak_subjects.sort((a, b) => a.avg - b.avg)

      const latestByLesson = new Map<string, (typeof childRows)[0]>()
      for (const r of childRows) {
        if (!r.lesson_id || r.score == null) continue
        if (!latestByLesson.has(r.lesson_id)) latestByLesson.set(r.lesson_id, r)
      }
      const quiz_alerts: ChildInsight['quiz_alerts'] = []
      for (const [lid, r] of latestByLesson) {
        const sc = Number(r.score)
        if (sc >= PASS) continue
        const les = lessonMap.get(lid) as
          | { title?: string; title_bn?: string }
          | undefined
        const sub = r.subject_id
          ? (subjectMap.get(r.subject_id) as { name?: string; name_bn?: string } | undefined)
          : undefined
        const title = les?.title_bn || les?.title || 'পাঠ'
        const subject_name = sub?.name_bn || sub?.name || 'বিষয়'
        quiz_alerts.push({
          lesson_id: lid,
          title,
          score: sc,
          subject_name,
          updated_at: r.updated_at || r.completed_at || null,
        })
        allAlerts.push({
          child_id: cid,
          child_name: p?.full_name || 'সন্তান',
          lesson_id: lid,
          title,
          score: sc,
          subject_name,
        })
      }
      quiz_alerts.sort((a, b) => a.score - b.score)

      const daySet = new Set<string>()
      for (const r of childRows) {
        const t = r.completed_at || r.updated_at
        if (!t) continue
        daySet.add(new Date(t).toISOString().slice(0, 10))
      }
      let streak = 0
      const d = new Date()
      for (let i = 0; i < 30; i++) {
        const key = d.toISOString().slice(0, 10)
        if (daySet.has(key)) {
          streak++
          d.setDate(d.getDate() - 1)
        } else if (i === 0) {
          d.setDate(d.getDate() - 1)
          continue
        } else break
      }

      children.push({
        child_id: cid,
        full_name: p?.full_name || 'সন্তান',
        avatar_url: p?.avatar_url || null,
        class_level: classLevel,
        class_slug: classSlug,
        today,
        week: {
          completed: weekDone,
          in_progress: weekProg,
          avg_score: avg,
          minutes_est: weekDone * 15 + weekProg * 8,
          weak_subjects: weak_subjects.slice(0, 4),
        },
        quiz_alerts: quiz_alerts.slice(0, 5),
        streak_days: streak,
      })
    }

    const subjectList = (subjects ?? []).map((s) => {
      const row = s as { id: string; name?: string; name_bn?: string }
      return { id: row.id, name: row.name_bn || row.name || 'বিষয়' }
    })

    return NextResponse.json({
      children,
      alerts: allAlerts.slice(0, 20),
      subjects: subjectList,
      pass_threshold: PASS,
      generated_at: new Date().toISOString(),
    })
  } catch (e) {
    console.error('parent insights', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'error' },
      { status: 500 },
    )
  }
}
