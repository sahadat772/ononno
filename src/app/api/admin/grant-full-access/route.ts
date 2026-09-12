import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase-admin'

/**
 * POST /api/admin/grant-full-access
 * Body: { userId?: string } — default: current admin
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const targetId = (body.userId as string) || user.id

    let db
    try {
      db = createServiceRoleClient()
    } catch {
      db = supabase
    }

    const far = new Date()
    far.setFullYear(far.getFullYear() + 10)

    const { error: pErr } = await db
      .from('profiles')
      .update({
        is_free_tier: true,
        verified: true,
        free_reason: null,
      })
      .eq('id', targetId)

    if (pErr) {
      return NextResponse.json({ error: pErr.message }, { status: 500 })
    }

    const { data: sp } = await db
      .from('student_profiles')
      .select('id')
      .eq('user_id', targetId)
      .maybeSingle()

    if (sp) {
      await db
        .from('student_profiles')
        .update({
          subscription_plan: 'family',
          subscription_expires_at: far.toISOString(),
        })
        .eq('user_id', targetId)
    }

    return NextResponse.json({
      ok: true,
      userId: targetId,
      is_free_tier: true,
      verified: true,
      subscription_expires_at: far.toISOString(),
      message: 'Full free access granted (10 years / free tier)',
    })
  } catch (e) {
    console.error('grant-full-access', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'error' },
      { status: 500 },
    )
  }
}
