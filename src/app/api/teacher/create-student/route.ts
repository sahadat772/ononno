import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        const body = await req.json()
        const {
            teacher_id,
            email,
            password,
            full_name,
            class_level,
            phone,
        } = body

        if (!teacher_id || !email || !password || !full_name || !class_level) {
            return NextResponse.json(
                { error: 'teacher_id, email, password, full_name, class_level required' },
                { status: 400 }
            )
        }

        // Supabase Auth এ নতুন user বানাও
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

        // এটা দিয়ে replace করো
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

        // teacher_students relation add
        const { error: relationError } = await adminSupabase
            .from('teacher_students')
            .insert({
                teacher_id,
                student_id: newUserId,
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
            sender_id: teacher_id,
            type: 'welcome',
            title: 'স্বাগতম!',
            body: `${full_name}, তোমার account তৈরি হয়েছে। শেখা শুরু করো!`,
            is_read: false,
        })

        // Parent কেও notification
        await adminSupabase.from('notifications').insert({
            recipient_id: teacher_id,
            sender_id: newUserId,
            type: 'child_created',
            title: 'Child Account তৈরি হয়েছে',
            body: `${full_name} এর account সফলভাবে তৈরি হয়েছে।`,
            is_read: false,
        })

        return NextResponse.json({
            message: 'Student created successfully',
            student_id: newUserId,
        }, { status: 201 })

    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}