import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase-admin'
import { isQuietHours, notifyParentsOfStudent, notifyUser } from '@/lib/push-notify'

/**
 * POST /api/push/inactive-reminder
 * Auth: admin or CRON_SECRET
 * Body: { days?: number (default 5), force?: boolean, limit?: number }
 */
export async function POST(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET
    const authHeader = req.headers.get('authorization') || ''
    const isCron =
      !!cronSecret &&
      (authHeader === `Bearer ${cronSecret}` ||
        req.headers.get('x-cron-secret') === cronSecret)

    const supabase = await createServerSupabaseClient()
    if (!isCron) {
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
        return NextResponse.json({ error: 'Admin or cron only' }, { status: 403 })
      }
    }

    const body = await req.json().catch(() => ({}))
    const days = Math.min(30, Math.max(3, Number(body.days) || 5))
    const limit = Math.min(200, Math.max(1, Number(body.limit) || 50))
    const force = body.force === true

    if (isQuietHours() && !force) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: 'quiet_hours_22_07_dhaka',
      })
    }

    let db
    try {
      db = createServiceRoleClient()
    } catch {
      db = supabase
    }

    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceIso = since.toISOString()

    const { data: students } = await db
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'student')
      .limit(500)

    let checked = 0
    let reminded = 0
    let pushSent = 0

    for (const st of students ?? []) {
      if (reminded >= limit) break
      checked += 1

      const { count } = await db
        .from('learning_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', st.id)
        .eq('status', 'completed')
        .gte('completed_at', sinceIso)

      if ((count ?? 0) > 0) continue

      const name = st.full_name?.split(' ')[0] || 'বন্ধু'

      const sr = await notifyUser(st.id, {
        title: 'আবার পড়া শুরু করো 📚',
        body: `${name}, ${days} দিন ধরে পাঠ সম্পন্ন হয়নি। আজ একটু সময় দাও — অনন্য অপেক্ষা করছে।`,
        url: '/dashboard/student',
        tag: 'inactive-student',
      })
      pushSent += sr.sent

      const pr = await notifyParentsOfStudent(st.id, {
        title: `${name} কিছুদিন পড়েনি`,
        body: `গত ${days} দিনে কোনো পাঠ সম্পন্ন হয়নি। একসাথে একটু উৎসাহ দিন।`,
        url: `/dashboard/parent/child/${st.id}`,
        tag: 'inactive-parent',
      })
      pushSent += pr.sent
      reminded += 1
    }

    return NextResponse.json({
      ok: true,
      days,
      checked,
      reminded,
      pushSent,
      mode: isCron ? 'cron' : 'admin',
    })
  } catch (e) {
    console.error('inactive-reminder', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'error' },
      { status: 500 },
    )
  }
}
