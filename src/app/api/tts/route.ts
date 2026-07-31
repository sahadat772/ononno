import { NextRequest, NextResponse } from 'next/server'
import { TtsQuerySchema } from '@/lib/validation'
import { rateLimit } from '@/lib/rateLimiter'
import { audit } from '@/lib/audit'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const text = searchParams.get('text') || ''
    const lang = searchParams.get('lang') || 'bn'

    const parseResult = TtsQuerySchema.safeParse({ text, lang })
    if (!parseResult.success) {
        const message = parseResult.error.issues.map((issue) => issue.message).join(' ')
        return NextResponse.json({ error: message }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'anon'
    const rateError = await rateLimit(`tts:${ip}`, { tokens: 100, windowSeconds: 86400, message: 'TTS অনুরোধ সীমা অতিক্রম করেছে।' })
    if (rateError) return rateError

    const { text: safeText, lang: safeLang } = parseResult.data
    const encoded = encodeURIComponent(safeText)
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${safeLang}&client=tw-ob`

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://translate.google.com/',
            },
        })

        if (!response.ok) throw new Error('TTS failed')

        const buffer = await response.arrayBuffer()

        // Audit the TTS play request (use IP as identifier for public requests)
        try {
            await audit('tts_play', ip || 'anon', { textLength: safeText.length, lang: safeLang }, ip)
        } catch (auditErr) {
            console.warn('TTS audit failed:', auditErr)
        }

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=86400',
            },
        })
    } catch {
        return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
    }
}