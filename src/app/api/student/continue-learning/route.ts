import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * GET /api/student/continue-learning
 * Soft-launch Step 8: where should this student resume academic learning?
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

    const { data: progressRows } = await supabase
      .from('learning_progress')
      .select('lesson_id, status, score, updated_at, completed_at')
      .eq('user_id', user.id)
      .not('lesson_id', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(30)

    const rows = progressRows ?? []
    const lessonIds = [...new Set(rows.map((r) => String(r.lesson_id)).filter(Boolean))]

    if (lessonIds.length === 0) {
      return NextResponse.json({
        hasProgress: false,
        recommendation: {
          title: 'একাডেমিক শুরু করো',
          title_bn: 'প্রথম শ্রেণি · বাংলা দিয়ে শুরু',
          href: '/dashboard/student/academic',
          reason: 'no_progress',
        },
      })
    }

    const { data: lessons } = await supabase
      .from('curriculum_lessons')
      .select(
        'id, title, title_bn, chapter_id, subject_id, class_id, is_published, is_active, slug',
      )
      .in('id', lessonIds)
      .eq('is_published', true)

    const lessonMap = new Map((lessons ?? []).map((l) => [String(l.id), l]))

    let pick: {
      lesson: {
        id: string
        title: string
        title_bn?: string | null
        chapter_id?: string | null
        subject_id?: string | null
        class_id?: string | null
        is_active?: boolean | null
      }
      status: string
    } | null = null

    for (const row of rows) {
      const les = lessonMap.get(String(row.lesson_id))
      if (!les || les.is_active === false) continue
      const st = String(row.status || '')
      if (st !== 'completed') {
        pick = { lesson: les, status: st || 'in_progress' }
        break
      }
    }

    if (!pick) {
      for (const row of rows) {
        const les = lessonMap.get(String(row.lesson_id))
        if (!les) continue
        pick = { lesson: les, status: 'completed' }
        break
      }
    }

    if (!pick?.lesson) {
      return NextResponse.json({
        hasProgress: true,
        recommendation: {
          title: 'একাডেমিক',
          title_bn: 'পাঠ্যক্রমে ফিরে যাও',
          href: '/dashboard/student/academic',
          reason: 'lesson_missing',
        },
      })
    }

    const les = pick.lesson
    let classSlug = 'class-1'

    if (les.class_id) {
      const { data: cls } = await supabase
        .from('curriculum_classes')
        .select('slug, class_number')
        .eq('id', les.class_id)
        .maybeSingle()
      if (cls?.slug) classSlug = cls.slug
      else if (cls?.class_number) classSlug = `class-${cls.class_number}`
    }

    const href =
      les.subject_id && les.chapter_id
        ? `/dashboard/student/academic/learn/${classSlug}/${les.subject_id}/${les.chapter_id}/${les.id}`
        : '/dashboard/student/academic'

    const completedCount = rows.filter((r) => r.status === 'completed').length

    return NextResponse.json({
      hasProgress: true,
      stats: {
        tracked_lessons: lessonIds.length,
        completed: completedCount,
      },
      recommendation: {
        title: les.title,
        title_bn: les.title_bn || les.title,
        href,
        status: pick.status,
        reason: pick.status === 'completed' ? 'last_completed' : 'resume_incomplete',
        class_slug: classSlug,
        lesson_id: les.id,
        chapter_id: les.chapter_id,
        subject_id: les.subject_id,
      },
    })
  } catch (e) {
    console.error('[continue-learning]', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
