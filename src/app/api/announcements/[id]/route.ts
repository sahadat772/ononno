import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

// PATCH — publish/unpublish বা update
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params
        const body = await req.json()

        const { data, error } = await supabase
            .from('announcements')
            .update({ ...body, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        // Publish হলে সব targeted user কে notification পাঠাও
        if (body.is_published === true) {
            const { data: users } = await supabase
                .from('profiles')
                .select('id, role')
                .neq('id', user.id)

            if (users) {
                const targeted = users.filter(u =>
                    body.target_role === 'all' || u.role === body.target_role
                )

                await supabase.from('notifications').insert(
                    targeted.map(u => ({
                        user_id: u.id,
                        title: `📢 ${data.title}`,
                        message: data.message,
                        type: 'announcement',
                        is_read: false,
                    }))
                )
            }
        }

        return NextResponse.json({ announcement: data })
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

// DELETE — announcement delete
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params

        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}