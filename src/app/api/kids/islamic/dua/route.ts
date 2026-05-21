import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()

        const { data, error } = await supabase
            .from('kids_islamic_lessons')
            .select('*')
            .eq('type', 'dua')
            .eq('is_active', true)
            .order('order_index', { ascending: true })

        if (error) throw error

        return NextResponse.json({ lessons: data || [] })

    } catch (error) {
        console.error('Dua fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}