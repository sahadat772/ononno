import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase-admin'

/** GET /api/parent/related-suggestions */
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

    if (profile?.role !== 'parent' && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Parent only' }, { status: 403 })
    }

    let db
    try {
      db = createServiceRoleClient()
    } catch {
      db = supabase
    }

    const { data: links } = await db
      .from('parent_children')
      .select('child_id')
      .eq('parent_id', user.id)

    const linkedIds = (links ?? []).map((l) => l.child_id).filter(Boolean)
    if (!linkedIds.length) {
      return NextResponse.json({ suggestions: [], reason: 'no_children' })
    }

    const { data: childLevels } = await db
      .from('student_profiles')
      .select('user_id, class_level')
      .in('user_id', linkedIds)

    const levels = [
      ...new Set((childLevels ?? []).map((c) => c.class_level).filter(Boolean)),
    ] as string[]

    if (!levels.length) {
      return NextResponse.json({ suggestions: [], reason: 'no_class_level' })
    }

    const { data: peers } = await db
      .from('student_profiles')
      .select('user_id, class_level')
      .in('class_level', levels)
      .limit(80)

    const peerIds = (peers ?? [])
      .map((p) => p.user_id)
      .filter((id) => id && !linkedIds.includes(id))

    if (!peerIds.length) {
      return NextResponse.json({ suggestions: [], reason: 'no_peers' })
    }

    const { data: profiles } = await db
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .in('id', peerIds.slice(0, 40))
      .eq('role', 'student')

    const levelByUser = new Map(
      (peers ?? []).map((p) => [p.user_id, p.class_level] as const),
    )

    const suggestions = (profiles ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      first_name: p.full_name?.split(' ')[0] || 'Student',
      avatar_url: p.avatar_url,
      class_level: levelByUser.get(p.id) || null,
      reason: 'একই শ্রেণির অন্য শিক্ষার্থী',
    }))

    return NextResponse.json({
      suggestions: suggestions.slice(0, 12),
      based_on_levels: levels,
    })
  } catch (e) {
    console.error('related-suggestions', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'error' },
      { status: 500 },
    )
  }
}
