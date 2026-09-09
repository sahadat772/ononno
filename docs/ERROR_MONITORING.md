# Error monitoring (Step 5)

## What ships

| Piece | Role |
|-------|------|
| `src/lib/monitoring.ts` | Server `reportError` + optional Sentry forward |
| `POST /api/errors` | Client error intake (rate-limited) |
| `src/lib/report-client-error.ts` | Browser helper (`sendBeacon`) |
| `src/app/error.tsx` | Route error UI + report |
| `src/app/global-error.tsx` | Root crash UI + report |
| `src/instrumentation.ts` | Process-level rejection/exception logs |

## Without Sentry

Errors always appear in **Vercel Runtime Logs** / server console:

```text
[ononno:error] …
[ononno:client-error] …
```

## Optional Sentry

1. Create a project at [sentry.io](https://sentry.io)
2. Copy the **DSN**
3. Vercel → Project → Settings → Environment Variables:

```text
SENTRY_DSN=https://<key>@oXXXX.ingest.sentry.io/<project>
# optional
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=ononno@1.0.0
```

4. Redeploy. New reported errors will also POST to Sentry store API.

No `@sentry/nextjs` package is required for soft-launch.

## Verify

```bash
curl -X POST https://ononno-two.vercel.app/api/errors \
  -H 'Content-Type: application/json' \
  -d '{"message":"monitoring-smoke-test","level":"info"}'
```

Expect `{ "ok": true, "sentry": true|false }`.

## Code usage (server)

```ts
import { reportError } from '@/lib/monitoring'

try {
  // …
} catch (e) {
  await reportError(e, { route: '/api/example', tags: { area: 'payments' } })
  throw e
}
```
