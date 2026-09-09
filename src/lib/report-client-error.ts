/**
 * Browser-safe error reporter → POST /api/errors
 */

export function reportClientError(input: {
  message: string
  stack?: string
  digest?: string
  route?: string
  level?: 'fatal' | 'error' | 'warning' | 'info'
}): void {
  if (typeof window === 'undefined') return

  const payload = {
    message: input.message.slice(0, 500),
    stack: input.stack?.slice(0, 4000),
    digest: input.digest,
    route: input.route || window.location.pathname,
    url: window.location.href,
    level: input.level || 'error',
  }

  try {
    const body = JSON.stringify(payload)
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon('/api/errors', blob)
      return
    }
    void fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    })
  } catch {
    // ignore secondary failures
  }
}
