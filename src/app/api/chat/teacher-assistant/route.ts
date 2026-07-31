import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { chat } from '@/lib/groq'
import { requireRole } from '@/lib/api-auth'
import { TeacherAssistantSchema, validateBody } from '@/lib/validation'
import { rateLimit, rateLimitDefaults } from '@/lib/rateLimiter'
import { audit } from '@/lib/audit'

export async function POST(req: NextRequest) {
    try {
        const auth = await requireRole(['teacher'])
        if ('error' in auth) return auth.error

        const rateError = await rateLimit(`teacher-ai-assistant:${auth.user.id}`, { ...rateLimitDefaults.adminAI, tokens: 100 })
        if (rateError) return rateError

        const body = await validateBody(TeacherAssistantSchema, req)
        if (body instanceof NextResponse) return body

        const { question, conversation_history = [] } = body
        const teacher_id = auth.user.id
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: teacherStudents } = await adminSupabase
            .from('teacher_students')
            .select('student_id')
            .eq('teacher_id', teacher_id)

        const studentIds = (teacherStudents || []).map((ts) => ts.student_id)

        // Students এর profiles fetch
        const { data: studentProfiles } = await adminSupabase
            .from('profiles')
            .select('id, full_name')
            .in('id', studentIds)

        // Students এর recent progress fetch
        const { data: allProgress } = await adminSupabase
            .from('learning_progress')
            .select(`
        user_id,
        status,
        score,
        created_at,
        class_lessons (
          title,
          chapters (
            subjects ( name )
          )
        )
      `)
            .in('user_id', studentIds)
            .order('created_at', { ascending: false })
            .limit(100)

        // Students এর sessions fetch
        const { data: allSessions } = await adminSupabase
            .from('user_sessions')
            .select('user_id, login_at, duration_minutes')
            .in('user_id', studentIds)
            .order('login_at', { ascending: false })
            .limit(50)

        // Data summary তৈরি করো
        const studentsSummary = (studentProfiles || []).map((sp) => {
            const studentProgress = (allProgress || []).filter(
                (p) => p.user_id === sp.id
            )
            const studentSessions = (allSessions || []).filter(
                (s) => s.user_id === sp.id
            )

            const scores = studentProgress
                .filter((p) => p.score !== null)
                .map((p) => p.score as number)

            const avgScore = scores.length > 0
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : 0

            const totalMinutes = studentSessions.reduce(
                (acc, s) => acc + (s.duration_minutes || 0), 0
            )

            const lastLogin = studentSessions[0]?.login_at || null

            return {
                name: sp.full_name,
                completed_lessons: studentProgress.filter((p) => p.status === 'completed').length,
                avg_score: avgScore,
                total_study_minutes: totalMinutes,
                last_login: lastLogin,
                low_score_lessons: studentProgress
                    .filter((p) => p.score !== null && (p.score as number) < 60)
                    .length,
            }
        })

        const systemPrompt = `তুমি Ononno প্ল্যাটফর্মের Teacher AI Assistant।

Teacher এর class এর সব student এর data:
${JSON.stringify(studentsSummary, null, 2)}

মোট students: ${studentsSummary.length}
গড় class score: ${studentsSummary.length > 0
                ? Math.round(studentsSummary.reduce((a, b) => a + b.avg_score, 0) / studentsSummary.length)
                : 0}%

নির্দেশনা:
- সবসময় বাংলায় উত্তর দাও
- data এর উপর ভিত্তি করে সঠিক তথ্য দাও
- Teacher কে helpful পরামর্শ দাও
- সংক্ষিপ্ত কিন্তু তথ্যবহুল উত্তর দাও
- প্রয়োজনে student এর নাম উল্লেখ করো`

        const messages = [
            ...conversation_history,
            { role: 'user' as const, content: question },
        ]

        const response = await chat(messages, systemPrompt)

        await audit('teacher_ai_assistant', auth.user.id, {
            studentCount: studentsSummary.length,
            questionLength: question.length,
        })

        return NextResponse.json({
            answer: response,
            students_count: studentsSummary.length,
        }, { status: 200 })

    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}