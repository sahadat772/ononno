/**
 * Sequential unlock rules for academic curriculum.
 * Chapter unlocks when previous chapter progress >= threshold.
 * Lesson unlocks when previous lesson is completed.
 */

export const CURRICULUM_UNLOCK_THRESHOLD_PCT = 60;

export function isChapterUnlockedByProgress(
  index: number,
  previousChapterProgressPct: number,
): boolean {
  if (index <= 0) return true;
  return previousChapterProgressPct >= CURRICULUM_UNLOCK_THRESHOLD_PCT;
}

export function isLessonUnlockedByCompletion(
  index: number,
  previousLessonCompleted: boolean,
): boolean {
  if (index <= 0) return true;
  return previousLessonCompleted;
}
