import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const supabase =await createServerSupabaseClient()
        const body = await req.json()
        const {
            parent_id,
            email,
            password,
            full_name,
            class_level,
            phone,
        } = body

        if (!parent_id || !email || !password || !full_name || !class_level) {
            return NextResponse.json(
                { error: 'parent_id, email, password, full_name, class_level required' },
                { status: 400 }
            )
        }

        // Supabase Auth এ নতুন user বানাও
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name,
                role: 'student',
            },
        })

        if (authError || !authData.user) {
            return NextResponse.json(
                { error: authError?.message || 'User creation failed' },
                { status: 500 }
            )
        }

        const newUserId = authData.user.id

        // profiles table এ insert
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: newUserId,
                full_name,
                email,
                phone: phone || null,
                role: 'student',
            })

        if (profileError) {
            return NextResponse.json(
                { error: profileError.message },
                { status: 500 }
            )
        }

        // student_profiles table এ insert
        const { error: studentProfileError } = await supabase
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
        const { error: relationError } = await supabase
            .from('parent_children')
            .insert({
                parent_id,
                child_id: newUserId,
            })

        if (relationError) {
            return NextResponse.json(
                { error: relationError.message },
                { status: 500 }
            )
        }

        // Welcome notification child কে
        await supabase.from('notifications').insert({
            recipient_id: newUserId,
            sender_id: parent_id,
            type: 'welcome',
            title: 'স্বাগতম!',
            body: `${full_name}, তোমার account তৈরি হয়েছে। শেখা শুরু করো!`,
            is_read: false,
        })

        // Parent কেও notification
        await supabase.from('notifications').insert({
            recipient_id: parent_id,
            sender_id: newUserId,
            type: 'child_created',
            title: 'Child Account তৈরি হয়েছে',
            body: `${full_name} এর account সফলভাবে তৈরি হয়েছে।`,
            is_read: false,
        })

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