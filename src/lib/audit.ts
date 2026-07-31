import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type AuditMeta = Record<string, unknown>

export async function audit(eventType: string, userId: string, meta: AuditMeta = {}, ip?: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Audit skipped because Supabase service role is not configured.')
    return
  }

  try {
    await adminSupabase.from('audit_logs').insert({
      user_id: userId,
      action: eventType,
      resource: eventType,
      payload: meta,
      ip,
    })
  } catch (error) {
    console.error('Audit log failed:', error)
  }
}
