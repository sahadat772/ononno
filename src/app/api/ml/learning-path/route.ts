import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { chat } from '@/lib/groq'

export async function GET(req: NextRequest) {
    try {
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { searchParams } = new URL(req.url)
        const student_id = searchParams.get('student_id')

        if (!student_id) {
            return NextResponse.json(
                { error: 'student_id required' },
                { status: 400 }
            )
        }

        // আজকের learning path আছে কিনা check করো
        const today = new Date().toISOString().split('T')[0]

        const { data: existingPath } = await adminSupabase
            .from('learning_paths')
            .select('*')
            .eq('student_id', student_id)
            .eq('date', today)
            .single()

        if (existingPath) {
            return NextResponse.json({
                learning_path: existingPath,
                cached: true,
            }, { status: 200 })
        }

        // Student profile fetch
        const { data: profile } = await adminSupabase
            .from('profiles')
            .select('full_name')
            .eq('id', student_id)
            .single()

        // Student class level fetch
        const { data: studentProfile } = await adminSupabase
            .from('student_profiles')
            .select('class_level')
            .eq('user_id', student_id)
            .single()

        // Recent progress fetch
        const { data: recentProgress } = await adminSupabase
            .from('learning_progress')
            .select(`
        status,
        score,
        class_lessons (
          title,
          chapters (
            title,
            subjects ( name )
          )
        )
      `)
            .eq('user_id', student_id)
            .order('created_at', { ascending: false })
            .limit(20)


        const completedLessonTitles = (recentProgress || [])
            .filter((p: { status: string }) => p.status === 'completed')
            .map((p: {
                class_lessons: {
                    title: string
                    chapters: { title: string; subjects: { name: string }[] }[]
                }[]
            }) => p.class_lessons?.[0]?.title || '')

        const lowScoreLessons = (recentProgress || [])
            .filter((p: { score: number | null }) => p.score !== null && (p.score as number) < 60)
            .map((p: {
                score: number | null
                class_lessons: {
                    title: string
                    chapters: { title: string; subjects: { name: string }[] }[]
                }[]
            }) => ({
                title: p.class_lessons?.[0]?.title || '',
                score: p.score,
            }))

        const prompt = `তুমি Ononno প্ল্যাটফর্মের AI Learning Path Generator।

শিক্ষার্থী: ${profile?.full_name || 'Unknown'}
শ্রেণী: ${studentProfile?.class_level || 'Unknown'}

সম্পন্ন lessons: ${completedLessonTitles.slice(0, 5).join(', ') || 'কোনোটি নেই'}
কম স্কোর পাওয়া lessons: ${lowScoreLessons.map((l) => `${l.title} (${l.score}%)`).join(', ') || 'কোনোটি নেই'}

আজকের learning plan তৈরি করো। নিচের JSON format এ দাও (শুধু JSON):
{
  "today_plan": [
    {
      "type": "islamic",
      "title": "ইসলামিক পাঠ",
      "description": "বিবরণ",
      "priority": "high",
      "estimated_minutes": 15
    },
    {
      "type": "weak_topic",
      "title": "দুর্বল বিষয় revision",
      "description": "বিবরণ",
      "priority": "high",
      "estimated_minutes": 20
    },
    {
      "type": "new",
      "title": "নতুন পাঠ",
      "description": "বিবরণ",
      "priority": "medium",
      "estimated_minutes": 25
    }
  ],
  "ai_analysis": "আজকের জন্য AI এর বিশ্লেষণ ও পরামর্শ",
  "motivational_message": "উৎসাহমূলক বার্তা (বাংলায়)",
  "total_study_minutes": 60
}`

        const response = await chat([{ role: 'user', content: prompt }])

        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json(
                { error: 'AI response parse failed' },
                { status: 500 }
            )
        }

        const pathData = JSON.parse(jsonMatch[0])

        // Database এ save করো
        const { data: savedPath } = await adminSupabase
            .from('learning_paths')
            .insert({
                student_id,
                date: today,
                recommended_lessons: pathData.today_plan,
                ai_analysis: pathData.ai_analysis,
            })
            .select('*')
            .single()

        return NextResponse.json({
            learning_path: {
                ...savedPath,
                motivational_message: pathData.motivational_message,
                total_study_minutes: pathData.total_study_minutes,
                today_plan: pathData.today_plan,
            },
            cached: false,
        }, { status: 200 })

    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}