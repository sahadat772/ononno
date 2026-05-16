import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const supabase = await createServerSupabaseClient()
        const { userId } = await params

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 400 }
            )
        }

        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '20')
        const unreadOnly = searchParams.get('unread') === 'true'

        // Notifications fetch
        let query = supabase
            .from('notifications')
            .select(`
        *,
        sender:profiles!notifications_sender_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
            .eq('recipient_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (unreadOnly) {
            query = query.eq('is_read', false)
        }

        const { data: notifications, error } = await query

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        // Unread count
        const { count: unreadCount } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', userId)
            .eq('is_read', false)

        return NextResponse.json({
            notifications: notifications || [],
            unreadCount: unreadCount || 0,
        }, { status: 200 })

    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Mark as read
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const supabase = await createServerSupabaseClient()
        const { userId } = await params
        const body = await req.json()
        const { notification_id, mark_all } = body

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 400 }
            )
        }

        // সব notification mark as read
        if (mark_all) {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('recipient_id', userId)
                .eq('is_read', false)

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                )
            }

            return NextResponse.json(
                { message: 'All notifications marked as read' },
                { status: 200 }
            )
        }

        // Single notification mark as read
        if (notification_id) {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notification_id)
                .eq('recipient_id', userId)

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                )
            }

            return NextResponse.json(
                { message: 'Notification marked as read' },
                { status: 200 }
            )
        }

        return NextResponse.json(
            { error: 'notification_id or mark_all required' },
            { status: 400 }
        )

    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}