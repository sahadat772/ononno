import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

// GET — সব announcements (admin) বা নিজের (user)
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        let query = supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })

        // Admin সব দেখবে, বাকিরা শুধু published + valid
        if (profile?.role !== 'admin') {
            query = query
                .eq('is_published', true)
                .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
                .or(`target_role.eq.all,target_role.eq.${profile?.role}`)
        }

        const { data, error } = await query
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ announcements: data })
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

// POST — নতুন announcement create (admin only)
export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { title, message, target_role, expires_at } = await req.json()

        if (!title || !message) {
            return NextResponse.json({ error: 'Title ও message দাও' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('announcements')
            .insert({
                title,
                message,
                target_role: target_role || 'all',
                expires_at: expires_at || null,
                is_published: false,
                created_by: user.id,
            })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ announcement: data })
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}