import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { chat } from '@/lib/groq'

export async function POST(req: NextRequest) {
    try {
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const body = await req.json()
        const { student_id } = body

        if (!student_id) {
            return NextResponse.json(
                { error: 'student_id required' },
                { status: 400 }
            )
        }

        // Student এর activity logs fetch করো
        const { data: activities } = await adminSupabase
            .from('activity_logs')
            .select('action, metadata, created_at')
            .eq('user_id', student_id)
            .order('created_at', { ascending: false })
            .limit(50)

        // Student এর learning progress fetch করো
        const { data: progress } = await adminSupabase
            .from('learning_progress')
            .select(`
        status,
        score,
        class_lessons (
          title,
          chapters (
            title,
            subjects (
              name
            )
          )
        )
      `)
            .eq('user_id', student_id)
            .order('created_at', { ascending: false })
            .limit(50)

        // Student profile fetch
        const { data: profile } = await adminSupabase
            .from('profiles')
            .select('full_name')
            .eq('id', student_id)
            .single()

        if (!activities && !progress) {
            return NextResponse.json(
                { error: 'No data found for this student' },
                { status: 404 }
            )
        }

        // AI এর জন্য data prepare করো
        const progressSummary = (progress || []).map((p: {
            status: string
            score: number | null
            class_lessons: {
                title: string
                chapters: {
                    title: string
                    subjects: {
                        name: string
                    }[]
                }[]
            }[]
        }) => ({
            lesson: p.class_lessons?.[0]?.title || 'Unknown',
            chapter: p.class_lessons?.[0]?.chapters?.[0]?.title || 'Unknown',
            subject: p.class_lessons?.[0]?.chapters?.[0]?.subjects?.[0]?.name || 'Unknown',
            status: p.status,
            score: p.score,
        }))

        const prompt = `তুমি Ononno প্ল্যাটফর্মের AI Weakness Analyzer।

শিক্ষার্থী: ${profile?.full_name || 'Unknown'}

তার সাম্প্রতিক learning data:
${JSON.stringify(progressSummary, null, 2)}

বিশ্লেষণ করো এবং নিচের JSON format এ দাও (শুধু JSON):
{
  "weak_topics": ["দুর্বল বিষয় ১", "দুর্বল বিষয় ২"],
  "strong_topics": ["শক্তিশালী বিষয় ১", "শক্তিশালী বিষয় ২"],
  "weak_subjects": ["দুর্বল subject ১"],
  "strong_subjects": ["শক্তিশালী subject ১"],
  "ai_suggestion": "AI এর পরামর্শ (বাংলায়)",
  "predicted_next_score": "৭২%",
  "study_plan": ["আজ এটা করো", "এই সপ্তাহে এটা করো"],
  "priority_lessons": ["priority lesson ১", "priority lesson ২"]
}`

        const response = await chat([{ role: 'user', content: prompt }])

        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json(
                { error: 'AI response parse failed' },
                { status: 500 }
            )
        }

        const analysis = JSON.parse(jsonMatch[0])

        return NextResponse.json({
            student_id,
            student_name: profile?.full_name,
            analysis,
        }, { status: 200 })

    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}