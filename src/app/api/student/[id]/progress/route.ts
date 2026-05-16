import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabaseClient()
        const { id: studentId } = await params

        if (!studentId) {
            return NextResponse.json(
                { error: 'Student ID required' },
                { status: 400 }
            )
        }

        // Learning progress fetch
        const { data: progressData, error: progressError } = await supabase
            .from('learning_progress')
            .select(`
        *,
        class_lessons (
          id,
          title,
          chapter_id,
          chapters (
            id,
            title,
            subject_id,
            subjects (
              id,
              name
            )
          )
        )
      `)
            .eq('user_id', studentId)
            .order('created_at', { ascending: false })

        if (progressError) {
            return NextResponse.json(
                { error: progressError.message },
                { status: 500 }
            )
        }

        // Student stats fetch
        const { data: statsData, error: statsError } = await supabase
            .from('student_stats')
            .select('*')
            .eq('user_id', studentId)
            .single()

        if (statsError && statsError.code !== 'PGRST116') {
            return NextResponse.json(
                { error: statsError.message },
                { status: 500 }
            )
        }

        // Weekly activity fetch (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: weeklyActivity } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', studentId)
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: true })

        // Subject wise breakdown
        const subjectBreakdown: Record<string, { total: number; completed: number }> = {}

        progressData?.forEach((p: {
            status: string
            class_lessons?: {
                chapters?: {
                    subjects?: {
                        name?: string
                    }
                }
            }
        }) => {
            const subjectName = p.class_lessons?.chapters?.subjects?.name
            if (subjectName) {
                if (!subjectBreakdown[subjectName]) {
                    subjectBreakdown[subjectName] = { total: 0, completed: 0 }
                }
                subjectBreakdown[subjectName].total++
                if (p.status === 'completed') {
                    subjectBreakdown[subjectName].completed++
                }
            }
        })

        return NextResponse.json({
            progress: progressData || [],
            stats: statsData || null,
            weeklyActivity: weeklyActivity || [],
            subjectBreakdown,
        }, { status: 200 })

    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}