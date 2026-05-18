import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const audio = formData.get('audio') as File
        const expected = formData.get('expected') as string
        const lang = formData.get('lang') as string || 'bn'

        if (!audio || !expected) {
            return NextResponse.json({ error: 'audio and expected required' }, { status: 400 })
        }

        // Groq Whisper দিয়ে transcribe
        const transcription = await groq.audio.transcriptions.create({
            file: audio,
            model: 'whisper-large-v3-turbo',
            language: lang === 'bn-BD' ? 'bn' : lang === 'ar-SA' ? 'ar' : 'en',
            response_format: 'verbose_json',
            temperature: 0.0,
        })

        const transcript = transcription.text?.trim().toLowerCase() || ''
        const expectedLower = expected.toLowerCase()

        // Similarity check
        const isCorrect = transcript.includes(expectedLower) ||
            expectedLower.includes(transcript) ||
            similarity(transcript, expectedLower) > 0.6

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