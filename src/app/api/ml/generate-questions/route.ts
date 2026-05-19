import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { topic, class_level, count = 10, difficulty = 'medium' } = body

    if (!topic || !class_level) {
      return NextResponse.json(
        { error: 'topic and class_level required' },
        { status: 400 }
      )
    }

    const difficultyBangla =
      difficulty === 'easy' ? 'সহজ' :
      difficulty === 'medium' ? 'মাঝারি' : 'কঠিন'

    const prompt = `তুমি Ononno প্ল্যাটফর্মের AI Question Generator।

নিচের তথ্য দিয়ে ${count}টি MCQ প্রশ্ন তৈরি করো:
- বিষয়/টপিক: ${topic}
- শ্রেণী: ${class_level}
- কঠিনত্ব: ${difficultyBangla}

নিচের JSON format এ দাও (শুধু JSON, আর কিছু না):
{
  "questions": [
    {
      "question": "প্রশ্ন",
      "options": ["ক) উত্তর ১", "খ) উত্তর ২", "গ) উত্তর ৩", "ঘ) উত্তর ৪"],
      "correct": "ক",
      "explanation": "সঠিক উত্তরের ব্যাখ্যা",
      "difficulty": "${difficulty}"
    }
  ]
}`

    const response = await chat([{ role: 'user', content: prompt }])

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'AI response parse failed' },
        { status: 500 }
      )
    }

    const generated = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      questions: generated.questions || [],
      topic,
      class_level,
      difficulty,
    }, { status: 200 })

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}