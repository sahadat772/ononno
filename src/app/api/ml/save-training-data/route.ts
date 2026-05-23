import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()

        // User authenticated কিনা check করো
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const {
            lessonId,
            attempts,
            correctAnswers,
            wrongAnswers,
            timeSpentSeconds,
            xpEarned,
        } = await req.json()

        if (!lessonId) {
            return NextResponse.json(
                { error: 'lessonId required' },
                { status: 400 }
            )
        }

        // Already আছে কিনা check করো
        const { data: existing } = await supabase
            .from('ml_training_data')
            .select('id, attempts, correct_answers, wrong_answers')
            .eq('student_id', user.id)
            .eq('lesson_id', lessonId)
            .single()

        if (existing) {
            // Update করো — attempts বাড়াও
            const { error } = await supabase
                .from('ml_training_data')
                .update({
                    attempts: existing.attempts + (attempts || 1),
                    correct_answers: existing.correct_answers + (correctAnswers || 0),
                    wrong_answers: existing.wrong_answers + (wrongAnswers || 0),
                    time_spent_seconds: timeSpentSeconds || 0,
                    xp_earned: xpEarned || 0,
                    completed_at: new Date().toISOString(),
                })
                .eq('id', existing.id)

            if (error) {
                return NextResponse.json(
                    { error: 'Update failed' },
                    { status: 500 }
                )
            }
        } else {
            // নতুন insert করো
            const { error } = await supabase
                .from('ml_training_data')
                .insert({
                    student_id: user.id,
                    lesson_id: lessonId,
                    attempts: attempts || 1,
                    correct_answers: correctAnswers || 0,
                    wrong_answers: wrongAnswers || 0,
                    time_spent_seconds: timeSpentSeconds || 0,
                    xp_earned: xpEarned || 0,
                    completed_at: new Date().toISOString(),
                })

            if (error) {
                return NextResponse.json(
                    { error: 'Insert failed' },
                    { status: 500 }
                )
            }
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('ML training data error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}