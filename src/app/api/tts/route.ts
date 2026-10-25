import { NextRequest, NextResponse } from 'next/server'
import { TtsQuerySchema } from '@/lib/validation'
import { rateLimit } from '@/lib/rateLimiter'
import { audit } from '@/lib/audit'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/** Google translate_tts accepts ~180 chars per request reliably. */
function chunkText(text: string, max = 160): string[] {
  const t = text.trim()
  if (t.length <= max) return [t]
  const parts: string[] = []
  let rest = t
  while (rest.length > 0) {
    if (rest.length <= max) {
      parts.push(rest)
      break
    }
    let cut = rest.lastIndexOf(' ', max)
    if (cut < 40) cut = max
    parts.push(rest.slice(0, cut).trim())
    rest = rest.slice(cut).trim()
  }
  return parts.filter(Boolean)
}

async function fetchGoogleTts(text: string, tl: string): Promise<ArrayBuffer | null> {
  const encoded = encodeURIComponent(text)
  const urls = [
    `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${tl}&client=tw-ob`,
    `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${tl}&client=gtx`,
  ]

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': UA,
          Referer: 'https://translate.google.com/',
          Accept: 'audio/mpeg, audio/*, */*',
        },
        next: { revalidate: 86400 },
      })
      if (!response.ok) continue
      const buffer = await response.arrayBuffer()
      if (buffer.byteLength < 100) continue
      return buffer
    } catch {
      /* try next */
    }
  }
  return null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const text = searchParams.get('text') || ''
  const lang = searchParams.get('lang') || 'bn'

  const parseResult = TtsQuerySchema.safeParse({ text, lang })
  if (!parseResult.success) {
    const message = parseResult.error.issues.map((issue) => issue.message).join(' ')
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anon'
  const rateError = await rateLimit(`tts:${ip}`, {
    tokens: 200,
    windowSeconds: 86400,
    message: 'TTS অনুরোধ সীমা অতিক্রম করেছে।',
  })
  if (rateError) return rateError

  const { text: safeText, lang: rawLang } = parseResult.data
  // Schema marks lang optional → always normalize to a definite string
  const safeLang = (rawLang || lang || 'bn').toLowerCase()
  // Normalize: bn / bn-BD → bn, ar → ar, en → en
  const tl =
    safeLang === 'ar' || safeLang.startsWith('ar')
      ? 'ar'
      : safeLang === 'en' || safeLang.startsWith('en')
        ? 'en'
        : 'bn'

  try {
    const chunks = chunkText(safeText)
    const buffers: ArrayBuffer[] = []

    for (const chunk of chunks) {
      const buf = await fetchGoogleTts(chunk, tl)
      if (!buf) {
        return NextResponse.json({ error: 'TTS failed' }, { status: 502 })
      }
      buffers.push(buf)
    }

    // Concatenate MPEG chunks (works for sequential Google TTS MP3s)
    const total = buffers.reduce((s, b) => s + b.byteLength, 0)
    const merged = new Uint8Array(total)
    let offset = 0
    for (const b of buffers) {
      merged.set(new Uint8Array(b), offset)
      offset += b.byteLength
    }

    try {
      await audit('tts_play', ip || 'anon', { textLength: safeText.length, lang: tl }, ip)
    } catch (auditErr) {
      console.warn('TTS audit failed:', auditErr)
    }

    return new NextResponse(merged, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (e) {
    console.error('[tts]', e)
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  }
}
