import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
    try {
        const { lessonTitle, lessonContent, lessonType } = await req.json()

        const prompt = `তুমি বাংলাদেশের একজন অভিজ্ঞ শিক্ষক। 

Lesson: "${lessonTitle}"
Content: "${lessonContent || 'এই topic সম্পর্কে বিস্তারিত শেখাও'}"

নিচের JSON format এ দাও (শুধু JSON):
{
  "content": "এই lesson এর সম্পূর্ণ বিষয়বস্তু সহজ বাংলায় লিখো — ৩-৫ paragraph, examples সহ, বাচ্চারা বুঝতে পারবে এভাবে",
  "questions": [
    {
      "question": "প্রশ্ন বাংলায়",
      "options": ["বিকল্প ১", "বিকল্প ২", "বিকল্প ৩", "বিকল্প ৪"],
      "correct": 0,
      "explanation": "সঠিক উত্তরের ব্যাখ্যা বাংলায়"
    }
  ]
}

৫টি প্রশ্ন দাও। শুধু JSON দাও, অন্য কিছু না।`

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'তুমি একজন শিক্ষক। শুধু valid JSON দাও।' },
                { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 2048,
        })

        const text = response.choices[0]?.message?.content || ''
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON found')

        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json(parsed)
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}