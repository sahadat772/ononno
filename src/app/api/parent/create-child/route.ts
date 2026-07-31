import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { CreateChildSchema, validateBody } from '@/lib/validation'
import { audit } from '@/lib/audit'
import { rateLimit, rateLimitDefaults } from '@/lib/rateLimiter'

export async function POST(req: NextRequest) {
    try {
        const auth = await requireRole(['parent'])
        if ('error' in auth) return auth.error

        const rateError = await rateLimit(`create-child:${auth.user.id}`, rateLimitDefaults.childCreate)
        if (rateError) return rateError

        const body = await validateBody(CreateChildSchema, req)
        if (body instanceof NextResponse) return body

        const { email, password, full_name, class_level, phone } = body

        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name,
                role: 'student',
            },
        })

        if (authError || !authData.user) {
            const message = authError?.message?.includes('already been registered')
                ? 'এই email এ আগে থেকেই account আছে। অন্য email ব্যবহার করো।'
                : authError?.message || 'User creation failed'
            return NextResponse.json(
                { error: message },
                { status: 400 }
            )
        }

        const newUserId = authData.user.id

        // profiles table এ insert
        // profiles table এ upsert (আগে থেকে থাকলেও update হবে)
        const { error: profileError } = await adminSupabase
            .from('profiles')
            .upsert({
                id: newUserId,
                full_name,
                email,
                phone: phone || null,
                role: 'student',
            }, { onConflict: 'id' })

        if (profileError) {
            return NextResponse.json(
                { error: profileError.message },
                { status: 500 }
            )
        }

        // student_profiles table এ insert
        const { error: studentProfileError } = await adminSupabase
            .from('student_profiles')
            .insert({
                user_id: newUserId,
                class_level,
            })

        if (studentProfileError) {
            return NextResponse.json(
                { error: studentProfileError.message },
                { status: 500 }
            )
        }

        // parent_children relation add
        const { error: relationError } = await adminSupabase
            .from('parent_children')
            .insert({
                parent_id: auth.user.id,
                child_id: newUserId,
            })

        if (relationError) {
            return NextResponse.json(
                { error: relationError.message },
                { status: 500 }
            )
        }

        // Welcome notification child কে
        await adminSupabase.from('notifications').insert({
            recipient_id: newUserId,
            sender_id: auth.user.id,
            type: 'welcome',
            title: 'স্বাগতম!',
            body: `${full_name}, তোমার account তৈরি হয়েছে। শেখা শুরু করো!`,
            is_read: false,
        })

        // Parent কেও notification
        await adminSupabase.from('notifications').insert({
            recipient_id: auth.user.id,
            sender_id: newUserId,
            type: 'child_created',
            title: 'Child Account তৈরি হয়েছে',
            body: `${full_name} এর account সফলভাবে তৈরি হয়েছে।`,
            is_read: false,
        })

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined
        await audit('create_child', auth.user.id, {
            newChildId: newUserId,
            email,
            class_level,
        }, ip)

        return NextResponse.json({
            message: 'Child account created successfully',
            child_id: newUserId,
        }, { status: 201 })

    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
