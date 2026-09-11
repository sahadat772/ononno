/**
 * Server-side FCM helpers (Phase 2–3).
 * Safe to call from API routes — never import in client components.
 */
import { createServiceRoleClient } from '@/lib/supabase-admin'
import { sendPushNotification, sendPushToMultiple } from '@/lib/firebase-admin'

export type PushPayload = {
  title: string
  body: string
  /** Deep link path, e.g. /dashboard/parent/child/xyz */
  url?: string
  tag?: string
}

async function tokensForUser(userId: string): Promise<string[]> {
  try {
    const db = createServiceRoleClient()
    const { data } = await db
      .from('fcm_tokens')
      .select('token')
      .eq('user_id', userId)
      .eq('is_active', true)
    return (data ?? []).map((r) => r.token).filter(Boolean)
  } catch (e) {
    console.error('[push] tokensForUser', e)
    return []
  }
}

async function sendToTokens(tokens: string[], payload: PushPayload) {
  if (!tokens.length) {
    return { ok: false as const, reason: 'no_tokens' as const, sent: 0 }
  }
  const data: Record<string, string> = {
    url: payload.url || '/',
    tag: payload.tag || 'ononno',
  }
  try {
    if (tokens.length === 1) {
      const r = await sendPushNotification({
        token: tokens[0],
        title: payload.title,
        body: payload.body,
        data,
      })
      return {
        ok: !!r.success,
        reason: r.success ? ('sent' as const) : ('fcm_error' as const),
        sent: r.success ? 1 : 0,
        detail: r,
      }
    }
    const r = await sendPushToMultiple({
      tokens,
      title: payload.title,
      body: payload.body,
      data,
    })
    return {
      ok: !!r.success,
      reason: 'sent' as const,
      sent: (r as { successCount?: number }).successCount ?? tokens.length,
      detail: r,
    }
  } catch (e) {
    console.error('[push] sendToTokens', e)
    return {
      ok: false as const,
      reason: 'exception' as const,
      sent: 0,
      detail: e instanceof Error ? e.message : e,
    }
  }
}

/** Push to a single user (all active web tokens). */
export async function notifyUser(userId: string, payload: PushPayload) {
  const tokens = await tokensForUser(userId)
  return sendToTokens(tokens, payload)
}

/** Push to all parents linked to this student. */
export async function notifyParentsOfStudent(
  studentId: string,
  payload: PushPayload,
) {
  try {
    const db = createServiceRoleClient()
    const { data: relations } = await db
      .from('parent_children')
      .select('parent_id')
      .eq('child_id', studentId)

    const parentIds = [
      ...new Set((relations ?? []).map((r) => r.parent_id).filter(Boolean)),
    ]
    if (!parentIds.length) {
      return { ok: false as const, reason: 'no_parents' as const, sent: 0 }
    }

    let sent = 0
    const results = []
    for (const pid of parentIds) {
      const tokens = await tokensForUser(pid)
      const r = await sendToTokens(tokens, payload)
      sent += r.sent
      results.push({ parentId: pid, ...r })
    }
    return {
      ok: sent > 0,
      reason: sent > 0 ? ('sent' as const) : ('no_tokens' as const),
      sent,
      parents: parentIds.length,
      results,
    }
  } catch (e) {
    console.error('[push] notifyParentsOfStudent', e)
    return {
      ok: false as const,
      reason: 'exception' as const,
      sent: 0,
      detail: e instanceof Error ? e.message : e,
    }
  }
}

/** Bangladesh local hour 0–23 */
export function dhakaHourNow(): number {
  try {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dhaka',
      hour: 'numeric',
      hour12: false,
    })
    return Number(fmt.format(new Date()))
  } catch {
    return new Date().getUTCHours() + 6
  }
}

/** Quiet hours: 22:00–07:00 Asia/Dhaka — skip non-critical digests */
export function isQuietHours(): boolean {
  const h = dhakaHourNow()
  return h >= 22 || h < 7
}
