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
    const { subject, class_level, chapter_title, lesson_title, lesson_id } = body

    if (!subject || !class_level || !chapter_title || !lesson_title) {
      return NextResponse.json(
        { error: 'subject, class_level, chapter_title, lesson_title required' },
        { status: 400 }
      )
    }

    const prompt = `তুমি Ononno প্ল্যাটফর্মের AI Content Generator।

নিচের তথ্য দিয়ে একটি সম্পূর্ণ lesson তৈরি করো:
- বিষয়: ${subject}
- শ্রেণী: ${class_level}
- অধ্যায়: ${chapter_title}
- পাঠ: ${lesson_title}

নিচের JSON format এ দাও (শুধু JSON, আর কিছু না):
{
  "lesson_body": "পাঠের মূল বিষয়বস্তু (বাংলায়, বিস্তারিত)",
  "key_points": ["মূল বিষয় ১", "মূল বিষয় ২", "মূল বিষয় ৩"],
  "real_life_example": "বাস্তব জীবনের উদাহরণ",
  "summary": "সংক্ষিপ্ত সারসংক্ষেপ",
  "quiz": [
    {
      "question": "প্রশ্ন ১",
      "options": ["ক) উত্তর ১", "খ) উত্তর ২", "গ) উত্তর ৩", "ঘ) উত্তর ৪"],
      "correct": "ক",
      "explanation": "ব্যাখ্যা"
    },
    {
      "question": "প্রশ্ন ২",
      "options": ["ক) উত্তর ১", "খ) উত্তর ২", "গ) উত্তর ৩", "ঘ) উত্তর ৪"],
      "correct": "খ",
      "explanation": "ব্যাখ্যা"
    },
    {
      "question": "প্রশ্ন ৩",
      "options": ["ক) উত্তর ১", "খ) উত্তর ২", "গ) উত্তর ৩", "ঘ) উত্তর ৪"],
      "correct": "গ",
      "explanation": "ব্যাখ্যা"
    },
    {
      "question": "প্রশ্ন ৪",
      "options": ["ক) উত্তর ১", "খ) উত্তর ২", "গ) উত্তর ৩", "ঘ) উত্তর ৪"],
      "correct": "ঘ",
      "explanation": "ব্যাখ্যা"
    },
    {
      "question": "প্রশ্ন ৫",
      "options": ["ক) উত্তর ১", "খ) উত্তর ২", "গ) উত্তর ৩", "ঘ) উত্তর ৪"],
      "correct": "ক",
      "explanation": "ব্যাখ্যা"
    }
  ]
}`

    const response = await chat([{ role: 'user', content: prompt }])

    // JSON parse করো
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'AI response parse failed' },
        { status: 500 }
      )
    }

    const generatedContent = JSON.parse(jsonMatch[0])

    // Database এ save করো
    if (lesson_id) {
      await adminSupabase
        .from('ai_generated_content')
        .insert({
          lesson_id,
          content_type: 'full_lesson',
          content: generatedContent,
          model_used: 'llama-3.3-70b-versatile',
        })
    }

    return NextResponse.json({
      content: generatedContent,
    }, { status: 200 })

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}