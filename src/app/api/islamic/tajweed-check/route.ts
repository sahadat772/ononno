import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { TajweedRuleId } from '@/types/database'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()

        // Auth check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const audio = formData.get('audio') as File
        const ayahText = formData.get('ayah_text') as string
        const ruleId = formData.get('rule_id') as TajweedRuleId

        if (!audio || !ayahText || !ruleId) {
            return NextResponse.json(
                { error: 'audio, ayah_text, rule_id — সবগুলো দরকার' },
                { status: 400 }
            )
        }

        // Step 1: Groq Whisper দিয়ে Arabic audio transcribe
        const transcription = await groq.audio.transcriptions.create({
            file: audio,
            model: 'whisper-large-v3-turbo',
            language: 'ar',
            response_format: 'verbose_json',
            temperature: 0.0,
        })

        const transcript = transcription.text?.trim() || ''

        // Step 2: Groq LLaMA দিয়ে Tajweed analyze
        const analysisPrompt = `তুমি একজন বিশেষজ্ঞ Tajweed শিক্ষক।

মূল আয়াত: ${ayahText}
Student এর তেলাওয়াত (transcribed): ${transcript}
Practice করা Tajweed rule: ${ruleId}

Student এর তেলাওয়াত বিশ্লেষণ করো এবং শুধু এই JSON দাও:
{
  "score": 0-100 সংখ্যা,
  "mistakes": [
    {
      "word": "ভুল হওয়া আরবি শব্দ",
      "error": "কী ভুল হয়েছে বাংলায়",
      "correction": "কীভাবে সঠিক করতে হবে বাংলায়"
    }
  ],
  "feedback": "সামগ্রিক feedback বাংলায় (২-৩ বাক্য)",
  "encouragement": "উৎসাহমূলক বার্তা বাংলায়",
  "rule_applied_correctly": true অথবা false
}`

        const analysis = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'তুমি Tajweed বিশেষজ্ঞ। শুধু valid JSON দাও, আর কিছু না।'
                },
                {
                    role: 'user',
                    content: analysisPrompt
                }
            ],
            temperature: 0.3,
            max_tokens: 1024,
        })

        const rawResponse = analysis.choices[0]?.message?.content || ''
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json(
                { error: 'AI response parse failed' },
                { status: 500 }
            )
        }

        const result = JSON.parse(jsonMatch[0])

        // Step 3: Database এ session save করো
        await supabase
            .from('tajweed_sessions')
            .insert({
                student_id: user.id,
                rule_id: ruleId,
                ayah_text: ayahText,
                ai_score: result.score,
                ai_feedback: result.feedback,
                mistakes: result.mistakes,
            })

        // Step 4: Islamic progress update করো
        await supabase
            .from('islamic_progress')
            .upsert({
                student_id: user.id,
                content_type: 'tajweed',
                content_id: ruleId,
                status: result.score >= 80 ? 'completed' : 'in_progress',
                score: result.score,
                attempts: 1,
                last_practiced_at: new Date().toISOString(),
            }, {
                onConflict: 'student_id,content_type,content_id',
                ignoreDuplicates: false,
            })

        return NextResponse.json({
            transcript,
            score: result.score,
            mistakes: result.mistakes,
            feedback: result.feedback,
            encouragement: result.encouragement,
            rule_applied_correctly: result.rule_applied_correctly,
        })

    } catch (error) {
        console.error('Tajweed check error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}