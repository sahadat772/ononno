import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SOFT_LAUNCH } from '@/lib/soft-launch'

/**
 * GET /api/parent/soft-launch-summary
 * Step 9: parent soft-launch snapshot of linked children.
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'parent') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: relations } = await supabase
      .from('parent_children')
      .select('child_id')
      .eq('parent_id', user.id)

    const childIds = (relations ?? []).map((r) => r.child_id).filter(Boolean)

    if (childIds.length === 0) {
      return NextResponse.json({
        phase: SOFT_LAUNCH.phase,
        children: [],
        totals: { children: 0, completed: 0, tracked: 0 },
        tip_bn: 'সন্তান লিংক করলে এখানে সাপ্তাহিক অগ্রগতি দেখাবে।',
      })
    }

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [{ data: profiles }, { data: progress }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, avatar_url').in('id', childIds),
      supabase
        .from('learning_progress')
        .select('user_id, status, updated_at, completed_at')
        .in('user_id', childIds),
    ])

    const nameById = new Map((profiles ?? []).map((p) => [p.id, p]))

    const children = childIds.map((id) => {
      const rows = (progress ?? []).filter((p) => p.user_id === id)
      const completed = rows.filter((r) => r.status === 'completed').length
      const weekCompleted = rows.filter((r) => {
        if (r.status !== 'completed') return false
        const t = r.completed_at || r.updated_at
        return t && new Date(t) >= weekAgo
      }).length
      const last = rows
        .map((r) => r.updated_at || r.completed_at)
        .filter(Boolean)
        .sort()
        .reverse()[0]
      const p = nameById.get(id)
      return {
        child_id: id,
        full_name: p?.full_name || 'সন্তান',
        avatar_url: p?.avatar_url || null,
        completed_lessons: completed,
        week_completed: weekCompleted,
        tracked_rows: rows.length,
        last_activity: last || null,
        href: `/dashboard/parent/child/${id}`,
      }
    })

    const totals = {
      children: children.length,
      completed: children.reduce((s, c) => s + c.completed_lessons, 0),
      tracked: children.reduce((s, c) => s + c.tracked_rows, 0),
      week_completed: children.reduce((s, c) => s + c.week_completed, 0),
    }

    return NextResponse.json({
      phase: SOFT_LAUNCH.phase,
      tagline_bn: SOFT_LAUNCH.taglineBn,
      children,
      totals,
      tip_bn:
        totals.week_completed > 0
          ? `এই সপ্তাহে ${totals.week_completed}টি পাঠ সম্পন্ন হয়েছে।`
          : 'এই সপ্তাহে নতুন সম্পন্ন পাঠ নেই — সন্তানকে একাডেমিক হাব খুলতে বলো।',
    })
  } catch (e) {
    console.error('[parent/soft-launch-summary]', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
