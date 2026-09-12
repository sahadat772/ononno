import type { SupabaseClient } from '@supabase/supabase-js'
import {
  evaluateClassCompletion,
  evaluateSubjectCompletion,
  type ProgressRow,
  type PublishedLesson,
  type ClassCompletionResult,
  type SubjectCompletionResult,
} from '@/lib/subject-completion'
import {
  classLevelToNumber,
  nextClassLevel,
} from '@/lib/student-class-access'

type Db = SupabaseClient

async function loadProgress(db: Db, userId: string): Promise<ProgressRow[]> {
  const { data } = await db
    .from('learning_progress')
    .select('lesson_id, subject_id, chapter_id, status, score')
    .eq('user_id', userId)
  return (data || []) as ProgressRow[]
}

export async function loadPublishedLessonsForSubject(
  db: Db,
  subjectId: string,
): Promise<PublishedLesson[]> {
  const { data: chapters } = await db
    .from('curriculum_chapters')
    .select('id')
    .eq('subject_id', subjectId)

  const chapterIds = (chapters || []).map((c) => c.id)
  if (!chapterIds.length) {
    const { data: lessons } = await db
      .from('curriculum_lessons')
      .select('id, chapter_id, is_published')
      .eq('subject_id', subjectId)
      .or('is_published.eq.true,workflow_status.eq.published')
    return (lessons || []).map((l) => ({
      id: String(l.id),
      chapter_id: l.chapter_id,
      subject_id: subjectId,
      is_published: true,
    }))
  }

  const { data: lessons } = await db
    .from('curriculum_lessons')
    .select('id, chapter_id, is_published, workflow_status')
    .in('chapter_id', chapterIds)

  return (lessons || [])
    .filter(
      (l) =>
        l.is_published === true ||
        l.workflow_status === 'published' ||
        (l.is_published == null && l.workflow_status == null),
    )
    .map((l) => ({
      id: String(l.id),
      chapter_id: l.chapter_id,
      subject_id: subjectId,
      is_published: true,
    }))
}

export async function evaluateSubjectForUser(
  db: Db,
  userId: string,
  subjectId: string,
): Promise<SubjectCompletionResult> {
  const [lessons, progress] = await Promise.all([
    loadPublishedLessonsForSubject(db, subjectId),
    loadProgress(db, userId),
  ])
  return evaluateSubjectCompletion(subjectId, lessons, progress)
}

export async function resolveCurriculumClass(
  db: Db,
  classLevel: string,
): Promise<{ id: string; class_number: number; slug?: string } | null> {
  const n = classLevelToNumber(classLevel)
  if (n == null) return null

  const { data } = await db
    .from('curriculum_classes')
    .select('id, class_number, slug')
    .eq('class_number', n)
    .limit(1)
    .maybeSingle()

  if (data) {
    return {
      id: data.id,
      class_number: data.class_number,
      slug: data.slug,
    }
  }

  const slug = `class-${n}`
  const { data: bySlug } = await db
    .from('curriculum_classes')
    .select('id, class_number, slug')
    .or(`slug.eq.${slug},slug.eq.class_${n}`)
    .limit(1)
    .maybeSingle()

  if (bySlug) {
    return {
      id: bySlug.id,
      class_number: bySlug.class_number ?? n,
      slug: bySlug.slug,
    }
  }
  return null
}

export async function evaluateClassForUser(
  db: Db,
  userId: string,
  classLevel: string,
): Promise<ClassCompletionResult & { classResolved: boolean }> {
  const klass = await resolveCurriculumClass(db, classLevel)
  if (!klass) {
    return {
      classResolved: false,
      classNumber: classLevelToNumber(classLevel) ?? undefined,
      subjects: [],
      totalSubjects: 0,
      completedSubjects: 0,
      percent: 0,
      isComplete: false,
    }
  }

  const { data: subjects } = await db
    .from('curriculum_subjects')
    .select('id')
    .eq('class_id', klass.id)

  const progress = await loadProgress(db, userId)
  const withLessons: { id: string; lessons: PublishedLesson[] }[] = []
  for (const s of subjects || []) {
    const lessons = await loadPublishedLessonsForSubject(db, s.id)
    withLessons.push({ id: s.id, lessons })
  }

  const result = evaluateClassCompletion(withLessons, progress, {
    classId: klass.id,
    classNumber: klass.class_number,
  })
  return { ...result, classResolved: true }
}

export async function tryUnlockNextClass(
  db: Db,
  userId: string,
): Promise<{
  unlocked: boolean
  previous?: string
  next?: string | null
  classCompletion: ClassCompletionResult & { classResolved: boolean }
  message?: string
}> {
  const { data: sp } = await db
    .from('student_profiles')
    .select('class_level, unlocked_class_level')
    .eq('user_id', userId)
    .maybeSingle()

  if (!sp?.class_level) {
    return {
      unlocked: false,
      classCompletion: {
        classResolved: false,
        subjects: [],
        totalSubjects: 0,
        completedSubjects: 0,
        percent: 0,
        isComplete: false,
      },
      message: 'Student profile missing',
    }
  }

  const registered = sp.class_level as string
  const unlocked =
    (sp as { unlocked_class_level?: string }).unlocked_class_level || registered

  const classCompletion = await evaluateClassForUser(db, userId, unlocked)

  if (!classCompletion.classResolved) {
    return {
      unlocked: false,
      previous: unlocked,
      next: nextClassLevel(registered, unlocked),
      classCompletion,
      message:
        'Curriculum class not found — subject completion cannot be verified yet',
    }
  }

  if (!classCompletion.isComplete) {
    return {
      unlocked: false,
      previous: unlocked,
      next: nextClassLevel(registered, unlocked),
      classCompletion,
      message: `ক্লাস অসম্পূর্ণ: ${classCompletion.completedSubjects}/${classCompletion.totalSubjects} বিষয় শেষ`,
    }
  }

  const next = nextClassLevel(registered, unlocked)
  if (!next) {
    return {
      unlocked: false,
      previous: unlocked,
      next: null,
      classCompletion,
      message: 'Already at highest class',
    }
  }

  const { error } = await db
    .from('student_profiles')
    .update({ unlocked_class_level: next })
    .eq('user_id', userId)

  if (error) {
    return {
      unlocked: false,
      previous: unlocked,
      next,
      classCompletion,
      message: error.message,
    }
  }

  return {
    unlocked: true,
    previous: unlocked,
    next,
    classCompletion,
    message: `ক্লাস আনলক: ${next}`,
  }
}
