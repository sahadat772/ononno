import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase-admin'
import {
  DEFAULT_PARENT_PREFS,
  mergePrefs,
  type ParentPrefs,
} from '@/lib/parent-preferences'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let db
    try {
      db = createServiceRoleClient()
    } catch {
      db = supabase
    }

    const { data: row } = await db
      .from('parent_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const raw =
      row && typeof row === 'object' && 'notification_prefs' in row
        ? (row as { notification_prefs?: Partial<ParentPrefs> }).notification_prefs
        : null

    return NextResponse.json({
      prefs: mergePrefs(raw),
      source: raw ? 'db' : 'default',
      quiet_note_bn: 'নীরব সময় ডিফল্ট: রাত ১০টা – সকাল ৭টা (Asia/Dhaka)',
    })
  } catch (e) {
    return NextResponse.json({
      prefs: DEFAULT_PARENT_PREFS,
      source: 'default',
      error: e instanceof Error ? e.message : 'error',
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const prefs = mergePrefs(body.prefs || body)

    let db
    try {
      db = createServiceRoleClient()
    } catch {
      db = supabase
    }

    try {
      await db.from('parent_profiles').upsert(
        {
          user_id: user.id,
          notification_prefs: { ...prefs, updated_at: new Date().toISOString() },
        },
        { onConflict: 'user_id' },
      )
    } catch {
      /* column may be missing — client still has localStorage */
    }

    return NextResponse.json({ ok: true, prefs })
  } catch (e) {
    return NextResponse.json({
      ok: true,
      prefs: DEFAULT_PARENT_PREFS,
      persisted: false,
      detail: e instanceof Error ? e.message : 'local_only',
    })
  }
}
