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
        const { student_id, subject } = body

        if (!student_id) {
            return NextResponse.json(
                { error: 'student_id required' },
                { status: 400 }
            )
        }

        // Last 4 weeks এর data fetch
        const fourWeeksAgo = new Date()
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

        const { data: recentProgress } = await adminSupabase
            .from('learning_progress')
            .select(`
        status,
        score,
        created_at,
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
            .gte('created_at', fourWeeksAgo.toISOString())
            .order('created_at', { ascending: false })

        // Session data fetch
        const { data: sessions } = await adminSupabase
            .from('user_sessions')
            .select('login_at, duration_minutes')
            .eq('user_id', student_id)
            .gte('login_at', fourWeeksAgo.toISOString())
            .order('login_at', { ascending: false })

        // Student profile fetch
        const { data: profile } = await adminSupabase
            .from('profiles')
            .select('full_name')
            .eq('id', student_id)
            .single()

        // Total study time calculate
        const totalStudyMinutes = (sessions || []).reduce(
            (acc, s) => acc + (s.duration_minutes || 0), 0
        )

        const avgScores = (recentProgress || [])
            .filter((p: { score: number | null }) => p.score !== null)
            .map((p: { score: number | null }) => p.score as number)

        const avgScore = avgScores.length > 0
            ? Math.round(avgScores.reduce((a, b) => a + b, 0) / avgScores.length)
            : 0

        const prompt = `তুমি Ononno প্ল্যাটফর্মের AI Performance Predictor।

শিক্ষার্থী: ${profile?.full_name || 'Unknown'}
${subject ? `বিষয়: ${subject}` : ''}

গত ৪ সপ্তাহের data:
- মোট পড়ার সময়: ${totalStudyMinutes} মিনিট
- গড় স্কোর: ${avgScore}%
- সম্পন্ন lesson: ${recentProgress?.length || 0}টি
- মোট session: ${sessions?.length || 0}টি

বিশ্লেষণ করো এবং নিচের JSON format এ দাও (শুধু JSON):
{
  "predicted_score": 75,
  "confidence_percent": 83,
  "grade": "B+",
  "weak_areas": ["দুর্বল এলাকা ১", "দুর্বল এলাকা ২"],
  "suggestion": "পরামর্শ (বাংলায়)",
  "study_recommendation": "সপ্তাহে কত ঘণ্টা পড়তে হবে",
  "improvement_tips": ["টিপস ১", "টিপস ২", "টিপস ৩"]
}`

        const response = await chat([{ role: 'user', content: prompt }])

        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json(
                { error: 'AI response parse failed' },
                { status: 500 }
            )
        }

        const prediction = JSON.parse(jsonMatch[0])

        // Database এ save করো
        await adminSupabase
            .from('performance_predictions')
            .insert({
                student_id,
                subject: subject || 'সকল বিষয়',
                predicted_score: prediction.predicted_score,
                confidence_percent: prediction.confidence_percent,
                weak_areas: prediction.weak_areas,
                suggestion: prediction.suggestion,
                predicted_for: new Date().toISOString().split('T')[0],
            })

        return NextResponse.json({
            student_id,
            student_name: profile?.full_name,
            prediction,
        }, { status: 200 })

    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}