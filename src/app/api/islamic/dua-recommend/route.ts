import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { chat } from '@/lib/groq'

const DUA_SYSTEM_PROMPT = `তুমি Ononno প্ল্যাটফর্মের Islamic Dua Specialist।

নিয়মাবলী:
1. শুধু কুরআন ও সহীহ হাদিস থেকে দোয়া দাও
2. Arabic text এ harakat (হরকত) সহ দাও
3. সঠিক বাংলা উচ্চারণ দাও
4. বাংলা অর্থ দাও
5. কোন কিতাব থেকে সেটা বলো
6. শুধু JSON দাও, আর কিছু না`

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()

        // Auth check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { situation } = body

        if (!situation?.trim()) {
            return NextResponse.json(
                { error: 'situation লিখুন' },
                { status: 400 }
            )
        }

        const prompt = `Student এর situation: "${situation}"

এই situation এর জন্য সবচেয়ে উপযুক্ত দোয়া দাও।
শুধু এই JSON দাও:
{
  "dua_arabic": "আরবি দোয়া harakat সহ",
  "dua_bangla_pronunciation": "বাংলা উচ্চারণ",
  "meaning": "বাংলা অর্থ",
  "source": "কোন কিতাব/সূরা থেকে (যেমন: সহীহ বুখারী ৬৩০৬, বা সূরা বাকারা ২:২৮৬)",
  "when_to_read": "কখন এবং কতবার পড়তে হয়",
  "virtue": "এই দোয়ার ফজিলত বাংলায়",
  "additional_duas": [
    {
      "dua_arabic": "সম্পর্কিত আরেকটি দোয়া",
      "dua_bangla_pronunciation": "উচ্চারণ",
      "meaning": "অর্থ",
      "source": "source"
    }
  ]
}`

        const response = await chat(
            [{ role: 'user', content: prompt }],
            DUA_SYSTEM_PROMPT
        )

        // JSON parse
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json(
                { error: 'AI response parse failed' },
                { status: 500 }
            )
        }

        const duaData = JSON.parse(jsonMatch[0])

        // Islamic progress update — dua practiced
        await supabase
            .from('islamic_progress')
            .upsert({
                student_id: user.id,
                content_type: 'dua',
                content_id: situation.slice(0, 50), // situation এর প্রথম ৫০ char
                status: 'in_progress',
                attempts: 1,
                last_practiced_at: new Date().toISOString(),
            }, {
                onConflict: 'student_id,content_type,content_id',
                ignoreDuplicates: false,
            })

        // Daily tracker update — duas_recited +1
        const today = new Date().toISOString().split('T')[0]
        const { data: tracker } = await supabase
            .from('daily_islamic_tracker')
            .select('duas_recited')
            .eq('student_id', user.id)
            .eq('date', today)
            .single()

        await supabase
            .from('daily_islamic_tracker')
            .upsert({
                student_id: user.id,
                date: today,
                duas_recited: (tracker?.duas_recited || 0) + 1,
            }, {
                onConflict: 'student_id,date',
                ignoreDuplicates: false,
            })

        return NextResponse.json(duaData)

    } catch (error) {
        console.error('Dua recommend error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}