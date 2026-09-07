import { NextRequest, NextResponse } from 'next/server'

/**
 * Same-origin Quran audio proxy.
 * Avoids CDN 403 / CORS issues in the browser.
 *
 * GET /api/islamic/audio?qari=Alafasy_128kbps&surah=2&ayah=1
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const qari = searchParams.get('qari') || 'Alafasy_128kbps'
    const surah = Number(searchParams.get('surah') || '1')
    const ayah = Number(searchParams.get('ayah') || '1')

    if (!Number.isFinite(surah) || !Number.isFinite(ayah) || surah < 1 || surah > 114 || ayah < 1) {
      return NextResponse.json({ error: 'Invalid surah/ayah' }, { status: 400 })
    }

    // Allowlist qari folders (prevent open proxy abuse)
    const allowed = new Set([
      'Alafasy_128kbps',
      'Abdurrahmaan_As-Sudais_192kbps',
      'Husary_128kbps',
      'Minshawy_Murattal_128kbps',
      'Muhammad_Ayyoub_128kbps',
      'Alafasy_64kbps',
      'Husary_64kbps',
    ])
    const folder = allowed.has(qari) ? qari : 'Alafasy_128kbps'

    const code = `${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}`
    const sources = [
      `https://everyayah.com/data/${folder}/${code}.mp3`,
      `https://verses.quran.com/Alafasy/mp3/${code}.mp3`,
    ]

    let upstream: Response | null = null
    let lastStatus = 0
    for (const url of sources) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'ONONNO-QuranPlayer/1.0' },
          signal: AbortSignal.timeout(12000),
        })
        lastStatus = res.status
        if (res.ok && res.body) {
          upstream = res
          break
        }
      } catch {
        // try next
      }
    }

    if (!upstream?.body) {
      return NextResponse.json(
        { error: 'Audio upstream failed', status: lastStatus },
        { status: 502 }
      )
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        'Accept-Ranges': 'bytes',
      },
    })
  } catch (e) {
    console.error('audio proxy error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
