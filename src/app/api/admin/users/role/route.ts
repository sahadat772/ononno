import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  ADMIN_PERMISSIONS,
  isSuperAdmin,
  normalizePermissions,
  type AdminPermission,
} from '@/lib/admin-access'

type Body = {
  userId?: string
  role?: string
  permissions?: string[]
}

const ASSIGNABLE_ROLES = new Set([
  'student',
  'teacher',
  'parent',
  'adult',
  'sub_admin',
  'admin',
])

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: actor } = await supabase
      .from('profiles')
      .select('id, role, admin_permissions')
      .eq('id', user.id)
      .single()

    if (!isSuperAdmin(actor)) {
      return NextResponse.json(
        { error: 'শুধু Super Admin role ও permission পরিবর্তন করতে পারেন।' },
        { status: 403 },
      )
    }

    const body = (await req.json()) as Body
    const userId = body.userId?.trim()
    const role = body.role?.trim()
    if (!userId || !role) {
      return NextResponse.json({ error: 'userId এবং role প্রয়োজন' }, { status: 400 })
    }
    if (!ASSIGNABLE_ROLES.has(role)) {
      return NextResponse.json({ error: `অবৈধ role: ${role}` }, { status: 400 })
    }
    if (userId === user.id && role !== 'admin') {
      return NextResponse.json(
        { error: 'নিজের Super Admin role সরানো যাবে না।' },
        { status: 400 },
      )
    }

    let permissions: AdminPermission[] = []
    if (role === 'sub_admin') {
      permissions = normalizePermissions(body.permissions ?? [])
      if (permissions.length === 0) {
        return NextResponse.json(
          {
            error: 'Sub-admin এর জন্য অন্তত একটি permission সিলেক্ট করুন।',
            allowed: ADMIN_PERMISSIONS,
          },
          { status: 400 },
        )
      }
    }

    const update: Record<string, unknown> = {
      role,
      admin_permissions: role === 'sub_admin' ? permissions : [],
    }

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', userId)
      .select('id, full_name, email, role, admin_permissions')
      .single()

    if (error) {
      if (error.message?.includes('admin_permissions') || error.code === 'PGRST204') {
        return NextResponse.json(
          {
            error:
              'admin_permissions কলাম নেই। Supabase-এ migration চালান: 20260910_sub_admin_permissions.sql',
            detail: error.message,
          },
          { status: 500 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      user: updated,
      message:
        role === 'sub_admin'
          ? `Sub-admin সেট হয়েছে (${permissions.join(', ')})`
          : `Role আপডেট: ${role}`,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
