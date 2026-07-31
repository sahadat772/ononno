import { NextResponse } from 'next/server'

type Bucket = {
  tokens: number
  lastRefill: number
}

type RateLimitOptions = {
  tokens: number
  windowSeconds: number
  message?: string
}

const globalRateMap = new Map<string, Bucket>()

function getBucket(key: string, capacity: number, windowSeconds: number): Bucket {
  const now = Date.now()
  const existing = globalRateMap.get(key)

  if (!existing || now - existing.lastRefill >= windowSeconds * 1000) {
    const bucket = { tokens: capacity, lastRefill: now }
    globalRateMap.set(key, bucket)
    return bucket
  }

  return existing
}

export async function rateLimit(key: string, options: RateLimitOptions): Promise<null | NextResponse> {
  const { tokens, windowSeconds, message } = options
  const bucket = getBucket(key, tokens, windowSeconds)

  if (bucket.tokens <= 0) {
    return NextResponse.json(
      {
        error: message || 'অনুরোধ সীমা অতিক্রম করেছে — পরে আবার চেষ্টা করুন।',
      },
      { status: 429 }
    )
  }

  bucket.tokens -= 1
  return null
}

export const rateLimitDefaults = {
  studentCreate: { tokens: 10, windowSeconds: 3600 },
  childCreate: { tokens: 20, windowSeconds: 86400 },
  adminAI: { tokens: 30, windowSeconds: 86400 },
  notificationSend: { tokens: 200, windowSeconds: 86400 },
}
