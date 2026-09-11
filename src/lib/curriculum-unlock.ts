/**
 * Sequential unlock for academic curriculum.
 *
 * Lesson exam (AI quiz) pass = score >= CURRICULUM_UNLOCK_THRESHOLD_PCT
 *   → marks lesson completed
 *   → unlocks next lesson in same chapter (if any)
 *   → if last (or only) lesson in chapter → chapter 100% → next chapter unlocks
 *
 * Chapters may have 1 or many published lessons.
 */

export const CURRICULUM_UNLOCK_THRESHOLD_PCT = 60

export function isLessonExamPassed(scorePercent: number | null | undefined): boolean {
  if (scorePercent == null || !Number.isFinite(scorePercent)) return false
  return scorePercent >= CURRICULUM_UNLOCK_THRESHOLD_PCT
}

export function isChapterUnlockedByProgress(
  index: number,
  previousChapterProgressPct: number,
): boolean {
  if (index <= 0) return true
  // Previous chapter must be fully completed (all its published lessons exam-passed)
  return previousChapterProgressPct >= 100
}

export function isLessonUnlockedByCompletion(
  index: number,
  previousLessonCompleted: boolean,
): boolean {
  if (index <= 0) return true
  return previousLessonCompleted
}

/** % of lessons completed in a chapter (0–100). */
export function chapterProgressPct(
  lessonIds: string[],
  completedLessonIds: Set<string> | Iterable<string>,
): number {
  if (!lessonIds.length) return 0
  const done = new Set(
    [...completedLessonIds].map((id) => String(id)).filter(Boolean),
  )
  const n = lessonIds.filter((id) => done.has(String(id))).length
  return Math.round((n / lessonIds.length) * 100)
}

export type NextTarget =
  | {
      kind: 'lesson'
      chapterId: string
      lessonId: string
      label: string
    }
  | {
      kind: 'chapter'
      chapterId: string
      label: string
    }
  | {
      kind: 'subject_complete'
      label: string
    }

/**
 * After passing the current lesson exam, decide what unlocks next.
 */
export function resolveNextTarget(opts: {
  currentChapterId: string
  currentLessonId: string
  lessonsInChapter: { id: string; title?: string }[]
  chaptersInSubject: { id: string; title?: string }[]
}): NextTarget {
  const { currentChapterId, currentLessonId, lessonsInChapter, chaptersInSubject } =
    opts
  const idx = lessonsInChapter.findIndex((l) => String(l.id) === String(currentLessonId))
  if (idx >= 0 && idx < lessonsInChapter.length - 1) {
    const next = lessonsInChapter[idx + 1]
    return {
      kind: 'lesson',
      chapterId: currentChapterId,
      lessonId: String(next.id),
      label: next.title || 'পরের পাঠ',
    }
  }

  const cIdx = chaptersInSubject.findIndex(
    (c) => String(c.id) === String(currentChapterId),
  )
  if (cIdx >= 0 && cIdx < chaptersInSubject.length - 1) {
    const nextChap = chaptersInSubject[cIdx + 1]
    return {
      kind: 'chapter',
      chapterId: String(nextChap.id),
      label: nextChap.title || 'পরের অধ্যায়',
    }
  }

  return {
    kind: 'subject_complete',
    label: 'এই বিষয়ের সব অধ্যায় শেষ!',
  }
}
