import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { PronunciationCheckSchema } from '@/lib/validation'
import { rateLimit, rateLimitDefaults } from '@/lib/rateLimiter'
import { audit } from '@/lib/audit'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
    try {
        const auth = await requireRole(['student', 'teacher', 'parent', 'admin'])
        if ('error' in auth) return auth.error

        const rateError = await rateLimit(`pronunciation-check:${auth.user.id}`, { ...rateLimitDefaults.adminAI, tokens: 60 })
        if (rateError) return rateError

        const formData = await req.formData()
        const audio = formData.get('audio') as File | null
        const expected = formData.get('expected')
        const lang = (formData.get('lang') as string | null) || 'bn'

        if (!audio || !(audio instanceof File) || typeof expected !== 'string' || !expected.trim()) {
            return NextResponse.json({ error: 'audio and expected required' }, { status: 400 })
        }

        if (audio.size > 8_000_000) {
            return NextResponse.json({ error: 'অডিও ফাইল খুব বড়। 8 MB-এর কম ফাইল দিন।' }, { status: 413 })
        }

        const schemaResult = PronunciationCheckSchema.safeParse({ expected, lang })
        if (!schemaResult.success) {
            const message = schemaResult.error.issues.map((issue) => issue.message).join(' ')
            return NextResponse.json({ error: message }, { status: 400 })
        }

        const { expected: expectedText, lang: validatedLang } = schemaResult.data

        // Groq Whisper দিয়ে transcribe
        const transcription = await groq.audio.transcriptions.create({
            file: audio,
            model: 'whisper-large-v3-turbo',
            language: validatedLang === 'bn-BD' ? 'bn' : validatedLang === 'ar-SA' ? 'ar' : 'en',
            response_format: 'verbose_json',
            temperature: 0.0,
        })

        const transcript = transcription.text?.trim().toLowerCase() || ''
        const expectedLower = expectedText.toLowerCase()

        const isCorrect = transcript.includes(expectedLower) ||
            expectedLower.includes(transcript) ||
            similarity(transcript, expectedLower) > 0.6

        await audit('pronunciation_check', auth.user.id, {
            expected: expectedLower,
            transcriptLength: transcript.length,
            isCorrect,
        })

        return NextResponse.json({
            transcript,
            expected: expectedLower,
            isCorrect,
            confidence: isCorrect ? 0.9 : 0.3,
        })
    } catch (error) {
        console.error('Pronunciation check error:', error)
        return NextResponse.json({ error: 'Check failed' }, { status: 500 })
    }
}

// Simple string similarity
function similarity(a: string, b: string): number {
    if (a === b) return 1
    if (a.length === 0 || b.length === 0) return 0
    const longer = a.length > b.length ? a : b
    const shorter = a.length > b.length ? b : a
    let matches = 0
    for (const char of shorter) {
        if (longer.includes(char)) matches++
    }
    return matches / longer.length
}