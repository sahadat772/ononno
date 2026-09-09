import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimiter'
import { forwardToSentry, type ErrorReport } from '@/lib/monitoring'

/**
 * POST /api/errors
 * Client-side error intake (error boundaries, window.onerror).
 * Rate-limited · no secrets · optional Sentry forward.
 */
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    const limited = await rateLimit(`client-errors:${ip}`, {
      tokens: 40,
      windowSeconds: 60,
      message: 'Error report rate limit',
    })
    if (limited) return limited

    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const message = String(body.message || '').slice(0, 500).trim()
    if (!message) {
      return NextResponse.json({ error: 'message required' }, { status: 400 })
    }

    const report: ErrorReport = {
      message,
      level: (body.level as ErrorReport['level']) || 'error',
      stack: body.stack ? String(body.stack).slice(0, 4000) : undefined,
      url: body.url ? String(body.url).slice(0, 500) : undefined,
      route: body.route ? String(body.route).slice(0, 200) : undefined,
      source: 'client',
      tags: {
        digest: body.digest ? String(body.digest).slice(0, 80) : '',
      },
    }

    console.error('[ononno:client-error]', {
      message: report.message,
      url: report.url,
      route: report.route,
      stack: report.stack?.slice(0, 500),
    })

    const sent = await forwardToSentry(report)

    return NextResponse.json({
      ok: true,
      sentry: sent,
    })
  } catch (e) {
    console.error('[api/errors]', e)
    return NextResponse.json({ error: 'Internal' }, { status: 500 })
  }
}
