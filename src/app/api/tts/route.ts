import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
    try {
        const { text, lang } = await req.json()

        if (!text) {
            return NextResponse.json(
                { error: 'text required' },
                { status: 400 }
            )
        }

        // Groq TTS model
        const response = await groq.audio.speech.create({
            model: 'playai-tts',
            input: text,
            voice: lang === 'ar-SA' ? 'Arista-PlayAI' : 'Celeste-PlayAI',
            response_format: 'mp3',
        })

        // Audio buffer return করো
        const buffer = Buffer.from(await response.arrayBuffer())

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=86400', // 24 hour cache
            },
        })
    } catch (error) {
        console.error('TTS error:', error)
        return NextResponse.json(
            { error: 'TTS failed' },
            { status: 500 }
        )
    }
}