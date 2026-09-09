/**
 * Next.js instrumentation — server boot hooks for production monitoring.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    process.on('unhandledRejection', (reason) => {
      console.error('[ononno:unhandledRejection]', reason)
    })
    process.on('uncaughtException', (err) => {
      console.error('[ononno:uncaughtException]', err)
    })

    if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
      console.info(
        '[ononno:monitoring] Sentry DSN detected — client/server errors will forward when reported',
      )
    } else {
      console.info('[ononno:monitoring] No SENTRY_DSN — errors log to Vercel/console only')
    }
  }
}
