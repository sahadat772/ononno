import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../lib/supabase-server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { action, email, password, full_name, phone, role, religion } =
            await request.json()

        // Register
        if (action === 'register') {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name, phone, role, religion },
                },
            })

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 })
            }

            // Profile তৈরি করো
            if (data.user) {
                await supabase.from('profiles').insert({
                    id: data.user.id,
                    full_name,
                    email,
                    phone: phone || null,
                    role: role || 'student',
                    religion: religion || 'muslim',
                })
            }

            return NextResponse.json({
                message: 'Registration successful',
                user: data.user,
            })
        }

        // Login
        if (action === 'login') {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 })
            }

            return NextResponse.json({
                message: 'Login successful',
                user: data.user,
                session: data.session,
            })
        }

        // Logout
        if (action === 'logout') {
            await supabase.auth.signOut()
            return NextResponse.json({ message: 'Logged out successfully' })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error) {
        console.error('Auth API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}