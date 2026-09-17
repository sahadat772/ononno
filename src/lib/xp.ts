/**
 * ONONNO XP calculation
 *
 * xp_earned = round(xp_reward × scorePercent / 100)
 * If exam passed (score ≥ threshold): at least round(xp_reward × 0.6)
 * Failed exam still earns proportional XP (no min floor).
 */

import { CURRICULUM_UNLOCK_THRESHOLD_PCT } from '@/lib/curriculum-unlock'

export const DEFAULT_LESSON_XP_REWARD = 10
export const XP_PER_LEVEL = 500
/** Pass floor as fraction of base reward */
export const XP_PASS_MIN_FRACTION = 0.6

/**
 * Core formula — pure, no side effects.
 */
export function calculateXpEarned(
  scorePercent: number,
  xpReward: number = DEFAULT_LESSON_XP_REWARD,
  passThreshold: number = CURRICULUM_UNLOCK_THRESHOLD_PCT,
): number {
  const reward = Math.max(0, Number(xpReward) || DEFAULT_LESSON_XP_REWARD)
  const score = Math.min(100, Math.max(0, Number(scorePercent) || 0))

  let xp = Math.round((reward * score) / 100)

  if (score >= passThreshold) {
    const minPass = Math.round(reward * XP_PASS_MIN_FRACTION)
    xp = Math.max(xp, minPass)
  }

  return Math.max(0, xp)
}

/** Level from total XP (500 XP per level). */
export function levelFromTotalXp(totalXp: number): {
  level: number
  xpInLevel: number
  xpToNext: number
  totalXp: number
} {
  const total = Math.max(0, Math.floor(Number(totalXp) || 0))
  const level = Math.max(1, Math.floor(total / XP_PER_LEVEL) + 1)
  const xpInLevel = total % XP_PER_LEVEL
  const xpToNext = XP_PER_LEVEL - xpInLevel
  return { level, xpInLevel, xpToNext, totalXp: total }
}

/**
 * Resolve XP for a progress write.
 * Default: always use score × reward formula.
 * Set useFormula: false to force raw `xp` (kids engine).
 */
export function resolveXpForProgress(opts: {
  scorePercent: number
  xpReward?: number | null
  xp?: number | null
  useFormula?: boolean
}): number {
  if (
    opts.useFormula === false &&
    opts.xp != null &&
    Number.isFinite(Number(opts.xp))
  ) {
    return Math.max(0, Math.round(Number(opts.xp)))
  }
  return calculateXpEarned(
    opts.scorePercent,
    opts.xpReward ?? DEFAULT_LESSON_XP_REWARD,
  )
}
