import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { chat } from '@/lib/groq'

const HADITH_EXPLAIN_SYSTEM_PROMPT = `তুমি Ononno প্ল্যাটফর্মের Hadith Explanation AI।

নিয়মাবলী:
1. হাদিসের ব্যাখ্যা সহজ বাংলায় দাও
2. Student এর বয়স অনুযায়ী ভাষা adjust করো
3. বাস্তব জীবনের উদাহরণ দাও
4. ইসলামিক scholars দের মতামত উল্লেখ করো
5. শুধু JSON দাও, আর কিছু না`

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()

        // Auth check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { hadith_text, hadith_source, student_age = '12' } = body

        if (!hadith_text?.trim()) {
            return NextResponse.json(
                { error: 'hadith_text দরকার' },
                { status: 400 }
            )
        }

        const prompt = `হাদিস: "${hadith_text}"
${hadith_source ? `সূত্র: ${hadith_source}` : ''}
Student এর বয়স: ${student_age} বছর

এই হাদিসটা ${student_age} বছর বয়সী বাংলাদেশী ছাত্রের জন্য ব্যাখ্যা করো।
শুধু এই JSON দাও:
{
  "main_lesson": "হাদিসের মূল শিক্ষা (২-৩ বাক্য)",
  "simple_explanation": "সহজ বাংলায় ব্যাখ্যা (বয়স অনুযায়ী)",
  "real_life_example": "বাংলাদেশের প্রেক্ষাপটে বাস্তব উদাহরণ",
  "how_to_apply": [
    "দৈনন্দিন জীবনে প্রয়োগ ১",
    "দৈনন্দিন জীবনে প্রয়োগ ২",
    "দৈনন্দিন জীবনে প্রয়োগ ৩"
  ],
  "memory_tip": "এই হাদিস মনে রাখার সহজ উপায়",
  "related_quran_ayah": "সম্পর্কিত কুরআনের আয়াত (যদি থাকে)",
  "scholars_view": "ইসলামিক scholars দের মতামত সংক্ষেপে",
  "du_a": "এই হাদিস পড়ার পর কোন দোয়া পড়া যায়"
}`

        const response = await chat(
            [{ role: 'user', content: prompt }],
            HADITH_EXPLAIN_SYSTEM_PROMPT
        )

        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json(
                { error: 'AI response parse failed' },
                { status: 500 }
            )
        }

        const explanation = JSON.parse(jsonMatch[0])

        // Daily tracker — hadith_read +1
        const today = new Date().toISOString().split('T')[0]
        const { data: tracker } = await supabase
            .from('daily_islamic_tracker')
            .select('hadith_read')
            .eq('student_id', user.id)
            .eq('date', today)
            .single()

        await supabase
            .from('daily_islamic_tracker')
            .upsert({
                student_id: user.id,
                date: today,
                hadith_read: (tracker?.hadith_read || 0) + 1,
            }, {
                onConflict: 'student_id,date',
                ignoreDuplicates: false,
            })

        // Islamic progress update
        await supabase
            .from('islamic_progress')
            .upsert({
                student_id: user.id,
                content_type: 'hadith',
                content_id: hadith_source || hadith_text.slice(0, 50),
                status: 'completed',
                attempts: 1,
                last_practiced_at: new Date().toISOString(),
            }, {
                onConflict: 'student_id,content_type,content_id',
                ignoreDuplicates: false,
            })

        return NextResponse.json({
            hadith_text,
            hadith_source,
            student_age,
            explanation,
        })

    } catch (error) {
        console.error('Hadith explain error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}