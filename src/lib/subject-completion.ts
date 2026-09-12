/**
 * Subject & class completion logic (ONONNO plan)
 *
 * Lesson exam pass ≥ threshold → lesson completed
 * All published lessons in subject → subject complete
 * All subjects in class → class complete → unlock next class
 */

import {
  CURRICULUM_UNLOCK_THRESHOLD_PCT,
  isLessonExamPassed,
  chapterProgressPct,
} from '@/lib/curriculum-unlock'

export type ProgressRow = {
  lesson_id: string
  subject_id?: string | null
  chapter_id?: string | null
  status?: string | null
  score?: number | null
}

export type PublishedLesson = {
  id: string
  chapter_id?: string | null
  subject_id?: string | null
  is_published?: boolean | null
}

export function isLessonCompleted(
  row: ProgressRow | undefined,
  threshold = CURRICULUM_UNLOCK_THRESHOLD_PCT,
): boolean {
  if (!row) return false
  if (row.status !== 'completed') return false
  if (row.score == null) return true
  return isLessonExamPassed(row.score) || (row.score as number) >= threshold
}

export function buildCompletedLessonSet(
  rows: ProgressRow[],
  threshold = CURRICULUM_UNLOCK_THRESHOLD_PCT,
): Set<string> {
  const set = new Set<string>()
  for (const r of rows) {
    if (isLessonCompleted(r, threshold)) {
      set.add(String(r.lesson_id))
    }
  }
  return set
}

export type SubjectCompletionResult = {
  subjectId: string
  totalLessons: number
  completedLessons: number
  percent: number
  isComplete: boolean
  incompleteLessonIds: string[]
}

export function evaluateSubjectCompletion(
  subjectId: string,
  publishedLessons: PublishedLesson[],
  progressRows: ProgressRow[],
): SubjectCompletionResult {
  const ids = publishedLessons.map((l) => String(l.id)).filter(Boolean)
  const uniqueIds = [...new Set(ids)]
  const done = buildCompletedLessonSet(progressRows)
  const completedLessons = uniqueIds.filter((id) => done.has(id)).length
  const incompleteLessonIds = uniqueIds.filter((id) => !done.has(id))
  const totalLessons = uniqueIds.length
  const percent =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100)
  return {
    subjectId,
    totalLessons,
    completedLessons,
    percent,
    isComplete: totalLessons > 0 && incompleteLessonIds.length === 0,
    incompleteLessonIds,
  }
}

export type ClassCompletionResult = {
  classId?: string
  classNumber?: number
  subjects: SubjectCompletionResult[]
  totalSubjects: number
  completedSubjects: number
  percent: number
  isComplete: boolean
}

export function evaluateClassCompletion(
  subjects: { id: string; lessons: PublishedLesson[] }[],
  progressRows: ProgressRow[],
  meta?: { classId?: string; classNumber?: number },
): ClassCompletionResult {
  const results = subjects.map((s) =>
    evaluateSubjectCompletion(s.id, s.lessons, progressRows),
  )
  const withLessons = results.filter((r) => r.totalLessons > 0)
  const completedSubjects = withLessons.filter((r) => r.isComplete).length
  const totalSubjects = withLessons.length
  const percent =
    totalSubjects === 0
      ? 0
      : Math.round((completedSubjects / totalSubjects) * 100)
  return {
    classId: meta?.classId,
    classNumber: meta?.classNumber,
    subjects: results,
    totalSubjects,
    completedSubjects,
    percent,
    isComplete: totalSubjects > 0 && completedSubjects === totalSubjects,
  }
}

export function evaluateChapterCompletion(
  lessonIds: string[],
  progressRows: ProgressRow[],
): { percent: number; isComplete: boolean } {
  const done = buildCompletedLessonSet(progressRows)
  const percent = chapterProgressPct(lessonIds, done)
  return { percent, isComplete: lessonIds.length > 0 && percent >= 100 }
}
