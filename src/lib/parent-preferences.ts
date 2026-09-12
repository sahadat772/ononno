/** Parent notification & engagement preferences (Priority 2) */

export type ParentPrefs = {
  lesson_done: boolean
  quiz_fail: boolean
  inactive_reminder: boolean
  weekly_digest: boolean
  quiet_hours: boolean
  quiet_start: number
  quiet_end: number
  updated_at?: string
}

export const DEFAULT_PARENT_PREFS: ParentPrefs = {
  lesson_done: true,
  quiz_fail: true,
  inactive_reminder: true,
  weekly_digest: true,
  quiet_hours: true,
  quiet_start: 22,
  quiet_end: 7,
}

export const PREFS_STORAGE_KEY = 'ononno_parent_prefs_v1'

export function mergePrefs(partial?: Partial<ParentPrefs> | null): ParentPrefs {
  return { ...DEFAULT_PARENT_PREFS, ...(partial || {}) }
}

export function dhakaHourNow(): number {
  try {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dhaka',
      hour: 'numeric',
      hour12: false,
    })
    return Number(fmt.format(new Date()))
  } catch {
    return (new Date().getUTCHours() + 6) % 24
  }
}

export function isInQuietWindow(
  prefs: ParentPrefs,
  hour = dhakaHourNow(),
): boolean {
  if (!prefs.quiet_hours) return false
  const start = prefs.quiet_start ?? 22
  const end = prefs.quiet_end ?? 7
  if (start === end) return false
  if (start > end) return hour >= start || hour < end
  return hour >= start && hour < end
}
