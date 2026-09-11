import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase-admin'
import { sendPushNotification, sendPushToMultiple } from '@/lib/firebase-admin'

/**
 * POST /api/admin/push/test
 * Body: { title?, body?, userId?, url? } — default sends to current admin tokens
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const title = (body.title as string) || 'অনন্য · Test Push'
    const text =
      (body.body as string) ||
      `Phase-1 test · ${new Date().toLocaleString('bn-BD')}`
    const targetUserId = (body.userId as string) || user.id
    const url = (body.url as string) || '/dashboard/admin'

    let adminDb
    try {
      adminDb = createServiceRoleClient()
    } catch {
      adminDb = supabase
    }

    const { data: rows, error } = await adminDb
      .from('fcm_tokens')
      .select('token')
      .eq('user_id', targetUserId)
      .eq('is_active', true)

    if (error) {
      return NextResponse.json(
        { error: 'Token query failed', detail: error.message },
        { status: 500 },
      )
    }

    const tokens = (rows ?? []).map((r) => r.token).filter(Boolean)
    if (tokens.length === 0) {
      return NextResponse.json(
        {
          error:
            'No FCM tokens for this user. Open dashboard and Allow notifications first.',
          userId: targetUserId,
        },
        { status: 400 },
      )
    }

    const data = { url, tag: 'admin-test' }

    if (tokens.length === 1) {
      const result = await sendPushNotification({
        token: tokens[0],
        title,
        body: text,
        data,
      })
      return NextResponse.json({
        ok: result.success,
        mode: 'single',
        tokens: tokens.length,
        result,
      })
    }

    const result = await sendPushToMultiple({
      tokens,
      title,
      body: text,
      data,
    })
    return NextResponse.json({
      ok: !!result.success,
      mode: 'multicast',
      tokens: tokens.length,
      result,
    })
  } catch (e) {
    console.error('admin push test', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 },
    )
  }
}
