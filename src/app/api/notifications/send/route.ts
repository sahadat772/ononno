import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const supabase =await createServerSupabaseClient()
        const body = await req.json()
        const { recipient_id, sender_id, type, title, body: notifBody } = body

        if (!recipient_id || !type || !title) {
            return NextResponse.json(
                { error: 'recipient_id, type and title required' },
                { status: 400 }
            )
        }

        // Single notification
        if (typeof recipient_id === 'string') {
            const { data, error } = await supabase
                .from('notifications')
                .insert({
                    recipient_id,
                    sender_id: sender_id || null,
                    type,
                    title,
                    body: notifBody || null,
                    is_read: false,
                })
                .select('id')
                .single()

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                )
            }

            return NextResponse.json(
                { notification_id: data.id },
                { status: 200 }
            )
        }

        // Multiple recipients
        if (Array.isArray(recipient_id)) {
            const { data, error } = await supabase
                .from('notifications')
                .insert(
                    recipient_id.map((id: string) => ({
                        recipient_id: id,
                        sender_id: sender_id || null,
                        type,
                        title,
                        body: notifBody || null,
                        is_read: false,
                    }))
                )
                .select('id')

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                )
            }

            return NextResponse.json(
                { notification_ids: data.map((d) => d.id) },
                { status: 200 }
            )
        }

        return NextResponse.json(
            { error: 'recipient_id must be string or array' },
            { status: 400 }
        )

    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}