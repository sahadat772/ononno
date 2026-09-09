/**
 * Production error monitoring (Step 5).
 * - Always logs server-side (Vercel / Node logs)
 * - Client reports go to POST /api/errors
 * - If SENTRY_DSN is set, events are also forwarded to Sentry store API
 *   (no @sentry/nextjs package required — soft-launch friendly)
 */

export type ErrorLevel = 'fatal' | 'error' | 'warning' | 'info'

export type ErrorReport = {
  message: string
  level?: ErrorLevel
  stack?: string
  url?: string
  route?: string
  userId?: string
  tags?: Record<string, string>
  extra?: Record<string, unknown>
  source?: 'client' | 'server' | 'edge'
}

function sentryDsnParts(dsn: string): {
  publicKey: string
  host: string
  projectId: string
} | null {
  try {
    const u = new URL(dsn)
    const publicKey = u.username
    const host = u.host
    const projectId = u.pathname.replace(/^\//, '').split('/')[0]
    if (!publicKey || !host || !projectId) return null
    return { publicKey, host, projectId }
  } catch {
    return null
  }
}

/** Forward to Sentry if SENTRY_DSN is configured */
export async function forwardToSentry(report: ErrorReport): Promise<boolean> {
  const dsn = process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()
  if (!dsn) return false

  const parts = sentryDsnParts(dsn)
  if (!parts) return false

  const eventId = crypto.randomUUID().replace(/-/g, '')
  const event = {
    event_id: eventId,
    timestamp: Date.now() / 1000,
    platform: 'javascript',
    level: report.level || 'error',
    server_name: process.env.VERCEL_URL || 'ononno',
    environment:
      process.env.SENTRY_ENVIRONMENT ||
      process.env.VERCEL_ENV ||
      process.env.NODE_ENV ||
      'production',
    release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || undefined,
    message: report.message,
    exception: report.stack
      ? {
          values: [
            {
              type: 'Error',
              value: report.message,
              stacktrace: {
                frames: report.stack
                  .split('\n')
                  .slice(0, 30)
                  .map((line) => ({ filename: line.trim() })),
              },
            },
          ],
        }
      : undefined,
    tags: {
      source: report.source || 'server',
      ...(report.route ? { route: report.route } : {}),
      ...(report.tags || {}),
    },
    extra: {
      url: report.url,
      ...(report.extra || {}),
    },
    user: report.userId ? { id: report.userId } : undefined,
  }

  const url = `https://${parts.host}/api/${parts.projectId}/store/`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': [
          'Sentry sentry_version=7',
          `sentry_client=ononno-monitor/1.0`,
          `sentry_key=${parts.publicKey}`,
        ].join(', '),
      },
      body: JSON.stringify(event),
    })
    return res.ok
  } catch (e) {
    console.error('[monitoring] Sentry forward failed', e)
    return false
  }
}

/** Server-side report — safe to call from API routes / RSC */
export async function reportError(
  err: unknown,
  context?: Omit<ErrorReport, 'message' | 'stack'>,
): Promise<void> {
  const message =
    err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error'
  const stack = err instanceof Error ? err.stack : undefined

  const report: ErrorReport = {
    message,
    stack,
    level: context?.level || 'error',
    source: context?.source || 'server',
    ...context,
  }

  console.error('[ononno:error]', {
    message: report.message,
    route: report.route,
    source: report.source,
    tags: report.tags,
    stack: report.stack?.slice(0, 800),
  })

  await forwardToSentry(report)
}

export async function reportMessage(
  message: string,
  context?: Omit<ErrorReport, 'message'>,
): Promise<void> {
  const report: ErrorReport = {
    message,
    level: context?.level || 'info',
    source: context?.source || 'server',
    ...context,
  }
  if (report.level === 'error' || report.level === 'fatal' || report.level === 'warning') {
    console.warn('[ononno:message]', report.message, report.tags)
  }
  await forwardToSentry(report)
}
