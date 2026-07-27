import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { UserRole } from '@/types/database'

export async function requireRole(allowedRoles: UserRole[]) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return {
            error: NextResponse.json(
                { error: 'এই কাজটি করতে আগে লগইন করুন।' },
                { status: 401 }
            ),
        }
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single()

    if (profileError || !profile || !allowedRoles.includes(profile.role as UserRole)) {
        return {
            error: NextResponse.json(
                { error: 'এই কাজটি করার অনুমতি আপনার নেই।' },
                { status: 403 }
            ),
        }
    }

    return { supabase, user, role: profile.role as UserRole }
}
