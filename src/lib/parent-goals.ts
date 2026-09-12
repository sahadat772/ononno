/** Weekly study goals for parent dashboard (Priority 3) */

export type ChildGoal = {
  child_id: string
  target_lessons: number
  target_avg_score: number
}

export type ParentGoalsState = {
  week_key: string
  goals: ChildGoal[]
  updated_at?: string
}

export const GOALS_STORAGE_KEY = 'ononno_parent_goals_v1'

export function currentWeekKey(d = new Date()): string {
  const year = d.getFullYear()
  const jan1 = new Date(year, 0, 1)
  const day = Math.floor((d.getTime() - jan1.getTime()) / 86400000)
  const week = Math.ceil((day + jan1.getDay() + 1) / 7)
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function loadGoals(): ParentGoalsState {
  if (typeof window === 'undefined') {
    return { week_key: currentWeekKey(), goals: [] }
  }
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY)
    if (!raw) return { week_key: currentWeekKey(), goals: [] }
    const parsed = JSON.parse(raw) as ParentGoalsState
    if (parsed.week_key !== currentWeekKey()) {
      return {
        week_key: currentWeekKey(),
        goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      }
    }
    return {
      week_key: parsed.week_key || currentWeekKey(),
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
    }
  } catch {
    return { week_key: currentWeekKey(), goals: [] }
  }
}

export function saveGoals(state: ParentGoalsState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      GOALS_STORAGE_KEY,
      JSON.stringify({ ...state, updated_at: new Date().toISOString() }),
    )
  } catch {
    /* ignore */
  }
}

export function getGoalForChild(
  state: ParentGoalsState,
  childId: string,
): ChildGoal {
  return (
    state.goals.find((g) => g.child_id === childId) || {
      child_id: childId,
      target_lessons: 5,
      target_avg_score: 70,
    }
  )
}
