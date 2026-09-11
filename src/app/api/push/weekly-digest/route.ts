import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase-admin'
import {
  isQuietHours,
  notifyUser,
} from '@/lib/push-notify'

/**
 * POST /api/push/weekly-digest
 * Auth: admin session OR Authorization: Bearer CRON_SECRET
 * Body: { force?: boolean }
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

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekIso = weekAgo.toISOString()

    const { data: links } = await db
      .from('parent_children')
      .select('parent_id, child_id')

    const byParent = new Map<string, string[]>()
    for (const row of links ?? []) {
      if (!row.parent_id || !row.child_id) continue
      const list = byParent.get(row.parent_id) || []
      list.push(row.child_id)
      byParent.set(row.parent_id, list)
    }

    let parentsNotified = 0
    let pushSent = 0

    for (const [parentId, childIds] of byParent) {
      const { count } = await db
        .from('learning_progress')
        .select('id', { count: 'exact', head: true })
        .in('user_id', childIds)
        .eq('status', 'completed')
        .gte('completed_at', weekIso)
      const weekDone = count ?? 0

      const { data: kids } = await db
        .from('profiles')
        .select('full_name')
        .in('id', childIds)
        .limit(3)
      const names =
        (kids ?? [])
          .map((k) => k.full_name?.split(' ')[0])
          .filter(Boolean)
          .join(', ') || 'সন্তান'

      const title = 'সাপ্তাহিক সারাংশ · অনন্য'
      const text =
        weekDone > 0
          ? `${names}: এই সপ্তাহে ${weekDone}টি পাঠ সম্পন্ন। বিস্তারিত Parent Hub-এ দেখুন।`
          : `${names}: এই সপ্তাহে এখনো পাঠ সম্পন্ন হয়নি — একসাথে একটু পড়ার পরিকল্পনা করুন।`

      const r = await notifyUser(parentId, {
        title,
        body: text,
        url: '/dashboard/parent',
        tag: 'weekly-digest',
      })
      parentsNotified += 1
      pushSent += r.sent
    }

    return NextResponse.json({
      ok: true,
      parents: parentsNotified,
      pushSent,
      mode: isCron ? 'cron' : 'admin',
    })
  } catch (e) {
    console.error('weekly-digest', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'error' },
      { status: 500 },
    )
  }
}
