import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { NotificationSendSchema, validateBody } from '@/lib/validation'
import { audit } from '@/lib/audit'
import { rateLimit, rateLimitDefaults } from '@/lib/rateLimiter'

export async function POST(req: NextRequest) {
    try {
        const auth = await requireRole(['admin', 'teacher', 'parent'])
        if ('error' in auth) return auth.error

        const rateError = await rateLimit(`notifications-send:${auth.user.id}`, rateLimitDefaults.notificationSend)
        if (rateError) return rateError

        const { supabase, user, role } = auth
        const body = await validateBody(NotificationSendSchema, req)
        if (body instanceof NextResponse) return body

        const { recipient_id, type, title, body: notifBody } = body

        if (!recipient_id || !type || !title) {
            return NextResponse.json(
                { error: 'recipient_id, type and title required' },
                { status: 400 }
            )
        }

        const recipientIds = typeof recipient_id === 'string' ? [recipient_id] : recipient_id
        if (recipientIds.length === 0 || recipientIds.length > 100) {
            return NextResponse.json({ error: 'সর্বোচ্চ ১০০ জন প্রাপক নির্বাচন করা যাবে।' }, { status: 400 })
        }

        if (role === 'teacher' || role === 'parent') {
            const relationTable = role === 'teacher' ? 'teacher_students' : 'parent_children'
            const ownerColumn = role === 'teacher' ? 'teacher_id' : 'parent_id'
            const childColumn = role === 'teacher' ? 'student_id' : 'child_id'
            const { data: relations, error: relationError } = await supabase
                .from(relationTable)
                .select(childColumn)
                .eq(ownerColumn, user.id)
                .in(childColumn, recipientIds)

            if (relationError || !relations || relations.length !== recipientIds.length) {
                return NextResponse.json({ error: 'আপনি শুধু নিজের শিক্ষার্থী বা সন্তানের কাছে বার্তা পাঠাতে পারবেন।' }, { status: 403 })
            }
        }

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined
        await audit('send_notification', auth.user.id, {
            recipientCount: recipientIds.length,
            type,
            title,
        }, ip)

        // Single notification
        if (typeof recipient_id === 'string') {
            const { data, error } = await supabase
                .from('notifications')
                .insert({
                    recipient_id,
                    sender_id: user.id,
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
                        sender_id: user.id,
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
