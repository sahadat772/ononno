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

    let profile: { role?: string | null; admin_permissions?: unknown } | null = null
    {
      const full = await supabase
        .from('profiles')
        .select('role, admin_permissions')
        .eq('id', user.id)
        .maybeSingle()
      if (full.error && /admin_permissions/i.test(full.error.message)) {
        const basic = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        profile = basic.data
      } else {
        profile = full.data
      }
    }

    const allowed =
      profile?.role === 'admin' ||
      (isStaffAdmin(profile) && canAccess(profile, 'users'))

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'এই পেজ দেখার অনুমতি নেই।',
          detail: `role=${profile?.role ?? 'null'}`,
        },
        { status: 403 },
      )
    }

    let usedServiceRole = false
    let db: ReturnType<typeof createServiceRoleClient> | typeof supabase = supabase
    try {
      db = createServiceRoleClient()
      usedServiceRole = true
    } catch (e) {
      console.warn('[admin/users] service role unavailable', e)
      usedServiceRole = false
    }

    const selectAttempts = [
      'id, full_name, email, role, created_at, class_level, is_active, admin_permissions',
      'id, full_name, email, role, created_at, is_active, admin_permissions',
      'id, full_name, email, role, created_at, admin_permissions',
      'id, full_name, email, role, created_at, class_level, is_active',
      'id, full_name, email, role, created_at',
      'id, full_name, role, created_at',
      'id, role, created_at',
      '*',
    ]

    let rows: Record<string, unknown>[] = []
    let lastError: string | null = null
    let warning: string | null = null

    for (const cols of selectAttempts) {
      const { data, error } = await db
        .from('profiles')
        .select(cols)
        .order('created_at', { ascending: false })
        .limit(500)

      if (!error) {
        rows = (data as Record<string, unknown>[] | null) ?? []
        if (cols !== selectAttempts[0] && cols !== '*') {
          warning = `কিছু column skip করা হয়েছে (select: ${cols})`
        }
        break
      }
      lastError = `${error.code ?? ''} ${error.message}`
      console.warn('[admin/users] select failed', cols, error.message)
    }

    if (rows.length === 0 && lastError) {
      return NextResponse.json(
        {
          error: 'Profiles load ব্যর্থ',
          detail: lastError,
          debug: { usedServiceRole, actorRole: profile?.role },
        },
        { status: 500 },
      )
    }

    const users = rows.map((r) => ({
      id: String(r.id ?? ''),
      full_name: String(r.full_name ?? r.name ?? '—'),
      email: String(r.email ?? ''),
      role: String(r.role ?? 'student'),
      created_at: String(r.created_at ?? new Date().toISOString()),
      class_level: r.class_level != null ? String(r.class_level) : undefined,
      is_active: r.is_active !== false,
      admin_permissions: Array.isArray(r.admin_permissions)
        ? r.admin_permissions
        : [],
    }))

    const stats = {
      total: users.length,
      students: users.filter((u) => u.role === 'student').length,
      teachers: users.filter((u) => u.role === 'teacher').length,
      parents: users.filter((u) => u.role === 'parent').length,
      adults: users.filter((u) => u.role === 'adult').length,
      subAdmins: users.filter((u) => u.role === 'sub_admin').length,
      admins: users.filter((u) => u.role === 'admin').length,
    }

    return NextResponse.json({
      users,
      stats,
      warning:
        warning ||
        (!usedServiceRole
          ? 'SUPABASE_SERVICE_ROLE_KEY runtime-এ পাওয়া যায়নি — redeploy করুন'
          : null),
      debug: {
        usedServiceRole,
        actorRole: profile?.role,
        count: users.length,
      },
    })
  } catch (e) {
    console.error('admin users list', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Server error' },
      { status: 500 },
    )
  }
}
