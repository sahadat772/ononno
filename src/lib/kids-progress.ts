/**
 * Kids Zone (nursery) progress helpers.
 * Schema bridge: academic path uses `status`, older kids path used `completed` + `stars`.
 * We write BOTH and read BOTH so unlock works regardless of column set.
 */

import { createClient } from '@/lib/supabase'

const LS_KEY = 'ononno_kids_progress_v1'

export type KidsProgressRow = {
  lesson_id: string
  completed?: boolean | null
  status?: string | null
  stars?: number | null
  score?: number | null
}

export type KidsProgressMap = Record<string, { completed: boolean; stars: number }>

export function isRowCompleted(row: KidsProgressRow): boolean {
  if (row.completed === true) return true
  if (typeof row.status === 'string' && row.status.toLowerCase() === 'completed') return true
  return false
}

export function rowsToProgressMap(rows: KidsProgressRow[] | null | undefined): KidsProgressMap {
  const map: KidsProgressMap = {}
  if (!rows) return map
  for (const row of rows) {
    if (!row?.lesson_id) continue
    map[row.lesson_id] = {
      completed: isRowCompleted(row),
      stars: row.stars ?? 0,
    }
  }
  return map
}

/** localStorage fallback so unlock still works if RLS/upsert fails */
export function readLocalKidsProgress(userId: string): KidsProgressMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return {}
    const all = JSON.parse(raw) as Record<string, KidsProgressMap>
    return all[userId] || {}
  } catch {
    return {}
  }
}

export function writeLocalKidsProgress(
  userId: string,
  lessonId: string,
  data: { completed: boolean; stars: number; score?: number },
) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(LS_KEY)
    const all = (raw ? JSON.parse(raw) : {}) as Record<string, KidsProgressMap>
    const userMap = all[userId] || {}
    userMap[lessonId] = { completed: data.completed, stars: data.stars }
    all[userId] = userMap
    localStorage.setItem(LS_KEY, JSON.stringify(all))
  } catch {
    /* ignore quota */
  }
}

export function mergeProgressMaps(...maps: KidsProgressMap[]): KidsProgressMap {
  const out: KidsProgressMap = {}
  for (const m of maps) {
    for (const [id, v] of Object.entries(m)) {
      const prev = out[id]
      if (!prev) {
        out[id] = { ...v }
      } else {
        out[id] = {
          completed: prev.completed || v.completed,
          stars: Math.max(prev.stars || 0, v.stars || 0),
        }
      }
    }
  }
  return out
}

export async function loadKidsProgressFromDb(userId: string): Promise<{
  map: KidsProgressMap
  error: string | null
}> {
  const supabase = createClient()
  const attempts = [
    'lesson_id, completed, stars, score, status',
    'lesson_id, status, score, xp_earned, completed_at',
    'lesson_id, completed, stars, score',
    'lesson_id, status, score',
  ]
  let lastError: string | null = null
  for (const cols of attempts) {
    const { data, error } = await supabase
      .from('learning_progress')
      .select(cols)
      .eq('user_id', userId)
    if (!error) {
      // Dynamic select() makes TS infer GenericStringError[]; bridge via unknown
      const rows = (data as unknown as KidsProgressRow[] | null) || []
      return { map: rowsToProgressMap(rows), error: null }
    }
    lastError = error.message
  }
  return { map: {}, error: lastError }
}

export async function saveKidsLessonProgress(opts: {
  lessonId: string
  score: number
  stars: number
  subjectHint?: string
}): Promise<{ ok: boolean; error?: string; userId?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'লগইন নেই' }

  writeLocalKidsProgress(user.id, opts.lessonId, {
    completed: true,
    stars: opts.stars,
    score: opts.score,
  })

  const payload: Record<string, unknown> = {
    user_id: user.id,
    lesson_id: opts.lessonId,
    score: opts.score,
    stars: opts.stars,
    completed: true,
    status: 'completed',
    xp_earned: opts.score,
    completed_at: new Date().toISOString(),
  }
  if (opts.subjectHint) {
    payload.subject_id = opts.subjectHint
  }

  let { error } = await supabase.from('learning_progress').upsert(payload, {
    onConflict: 'user_id,lesson_id',
  })

  if (error) {
    const slim: Record<string, unknown> = {
      user_id: user.id,
      lesson_id: opts.lessonId,
      score: opts.score,
      status: 'completed',
      completed_at: new Date().toISOString(),
    }
    ;({ error } = await supabase.from('learning_progress').upsert(slim, {
      onConflict: 'user_id,lesson_id',
    }))
  }

  if (error) {
    const { error: insErr } = await supabase.from('learning_progress').insert({
      user_id: user.id,
      lesson_id: opts.lessonId,
      score: opts.score,
      status: 'completed',
      completed: true,
      completed_at: new Date().toISOString(),
    })
    if (insErr) {
      console.error('[kids-progress] save failed', insErr.message)
      return { ok: false, error: insErr.message, userId: user.id }
    }
  }

  return { ok: true, userId: user.id }
}
