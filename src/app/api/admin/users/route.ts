import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-admin'
import { canAccess, isStaffAdmin } from '@/lib/admin-access'
import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * List profiles for admin user management.
 * Service role bypasses RLS so admins can see all users.
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
      .select('role, admin_permissions')
      .eq('id', user.id)
      .single()

    if (!isStaffAdmin(profile) || !canAccess(profile, 'users')) {
      return NextResponse.json(
        { error: 'এই পেজ দেখার অনুমতি নেই।' },
        { status: 403 },
      )
    }

    let db: ReturnType<typeof createServiceRoleClient> | Awaited<
      ReturnType<typeof createServerSupabaseClient>
    >
    try {
      db = createServiceRoleClient()
    } catch {
      db = supabase
    }

    let rows: Record<string, unknown>[] = []
    let warning: string | null = null

    const full = await db
      .from('profiles')
      .select(
        'id, full_name, email, role, created_at, class_level, is_active, admin_permissions',
      )
      .order('created_at', { ascending: false })
      .limit(500)

    if (full.error) {
      const missingCol =
        /admin_permissions/i.test(full.error.message) ||
        full.error.code === 'PGRST204' ||
        full.error.code === '42703'

      if (missingCol) {
        warning =
          'admin_permissions কলাম নেই — Supabase-এ 20260910_sub_admin_permissions.sql চালান'
        const retry = await db
          .from('profiles')
          .select('id, full_name, email, role, created_at, class_level, is_active')
          .order('created_at', { ascending: false })
          .limit(500)
        if (retry.error) {
          return NextResponse.json(
            {
              error: 'Profiles load ব্যর্থ',
              detail: retry.error.message,
            },
            { status: 500 },
          )
        }
        rows = (retry.data ?? []).map((r) => ({
          ...r,
          admin_permissions: [],
        }))
      } else {
        return NextResponse.json(
          { error: 'Profiles load ব্যর্থ', detail: full.error.message },
          { status: 500 },
        )
      }
    } else {
      rows = full.data ?? []
    }

    const stats = {
      total: rows.length,
      students: rows.filter((u) => u.role === 'student').length,
      teachers: rows.filter((u) => u.role === 'teacher').length,
      parents: rows.filter((u) => u.role === 'parent').length,
      adults: rows.filter((u) => u.role === 'adult').length,
      subAdmins: rows.filter((u) => u.role === 'sub_admin').length,
      admins: rows.filter((u) => u.role === 'admin').length,
    }

    return NextResponse.json({ users: rows, stats, warning })
  } catch (e) {
    console.error('admin users list', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Server error' },
      { status: 500 },
    )
  }
}
