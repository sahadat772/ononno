import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase-admin'
import {
  canAccess,
  isStaffAdmin,
  type ProfileLike,
  normalizePermissions,
  type AdminPermission,
} from '@/lib/admin-access'

type InviteBody = {
  email?: string
  full_name?: string
  role?: string
  password?: string
  class_level?: string | null
  admin_permissions?: string[]
  send_invite_email?: boolean
}

const ALLOWED_ROLES = new Set([
  'student',
  'parent',
  'teacher',
  'adult',
  'sub_admin',
  'admin',
])

/**
 * POST /api/admin/users/invite
 * Super-admin (or users-permission staff) creates accounts via service role.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let profile: ProfileLike = null
    {
      const full = await supabase
        .from('profiles')
        .select('role, admin_permissions')
        .eq('id', user.id)
        .maybeSingle()
      if (full.data) {
        profile = {
          role: full.data.role,
          admin_permissions: normalizePermissions(full.data.admin_permissions),
        }
      }
    }

    const isSuper = profile?.role === 'admin'
    const allowed =
      isSuper || (isStaffAdmin(profile) && canAccess(profile, 'users'))
    if (!allowed) {
      return NextResponse.json({ error: 'Invite করার অনুমতি নেই' }, { status: 403 })
    }

    const body = (await request.json()) as InviteBody
    const email = body.email?.trim().toLowerCase()
    const full_name = body.full_name?.trim() || email?.split('@')[0] || 'User'
    const role = (body.role || 'student').toLowerCase()
    const class_level = body.class_level || null
    const sendInvite = body.send_invite_email !== false

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'সঠিক ইমেইল দিন' }, { status: 400 })
    }
    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: 'অবৈধ role' }, { status: 400 })
    }
    if (role === 'admin' && !isSuper) {
      return NextResponse.json(
        { error: 'শুধু Super Admin নতুন Admin তৈরি করতে পারে' },
        { status: 403 },
      )
    }

    let perms: AdminPermission[] = []
    if (role === 'sub_admin') {
      perms = normalizePermissions(body.admin_permissions)
    }

    const admin = createServiceRoleClient()
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://ononno-two.vercel.app'

    let createdUserId: string | null = null
    let tempPassword: string | null = null
    let method: 'invite' | 'create' = 'create'

    if (sendInvite && !body.password) {
      method = 'invite'
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { full_name, role },
        redirectTo: `${origin}/auth/callback?next=/auth/redirect`,
      })
      if (error) {
        method = 'create'
        tempPassword = generateTempPassword()
        const created = await admin.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { full_name, role },
        })
        if (created.error) {
          return NextResponse.json(
            { error: error.message || created.error.message },
            { status: 400 },
          )
        }
        createdUserId = created.data.user?.id ?? null
      } else {
        createdUserId = data.user?.id ?? null
      }
    } else {
      tempPassword = body.password?.trim() || generateTempPassword()
      if (tempPassword.length < 6) {
        return NextResponse.json(
          { error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর' },
          { status: 400 },
        )
      }
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name, role },
      })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      createdUserId = data.user?.id ?? null
    }

    if (!createdUserId) {
      return NextResponse.json({ error: 'User create ব্যর্থ' }, { status: 500 })
    }

    const profileRow: Record<string, unknown> = {
      id: createdUserId,
      full_name,
      email,
      role,
    }
    if (role === 'sub_admin') {
      profileRow.admin_permissions = perms
    }

    await admin.from('profiles').upsert(profileRow)

    if (role === 'student' && class_level) {
      await admin.from('student_profiles').upsert({
        user_id: createdUserId,
        class_level,
      })
    }
    if (role === 'parent') {
      await admin.from('parent_profiles').upsert({ user_id: createdUserId })
    }

    return NextResponse.json({
      ok: true,
      user_id: createdUserId,
      email,
      role,
      method,
      temporary_password: method === 'create' ? tempPassword : null,
      message:
        method === 'invite'
          ? 'Invite email পাঠানো হয়েছে (SMTP থাকলে)।'
          : 'অ্যাকাউন্ট তৈরি হয়েছে। temporary_password শেয়ার করুন।',
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invite failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#'
  let s = 'On'
  for (let i = 0; i < 10; i++) {
    s += chars[Math.floor(Math.random() * chars.length)]
  }
  return s
}
