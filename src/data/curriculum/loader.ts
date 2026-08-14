import { nctb2026 } from "./index";

import type {
  CurriculumClass,
  CurriculumSubject,
  CurriculumChapter,
  CurriculumLesson,
} from "@/types/curriculum";

export function getCurriculum() {
  return nctb2026;
}

export function getClasses(): CurriculumClass[] {
  return nctb2026.classes;
}

export function getClassBySlug(slug: string) {
  return nctb2026.classes.find((c) => c.slug === slug);
}

export function getSubject(
  classSlug: string,
  subjectSlug: string
): CurriculumSubject | undefined {

  return getClassBySlug(classSlug)?.subjects.find(
    (subject) => subject.slug === subjectSlug
  );
}

export function getChapter(
  classSlug: string,
  subjectSlug: string,
  chapterSlug: string
): CurriculumChapter | undefined {

  return getSubject(classSlug, subjectSlug)?.chapters.find(
    (chapter) => chapter.slug === chapterSlug
  );
}

export function getLesson(
  classSlug: string,
  subjectSlug: string,
  chapterSlug: string,
  lessonSlug: string
): CurriculumLesson | undefined {

  return getChapter(
    classSlug,
    subjectSlug,
    chapterSlug
  )?.lessons.find(
    (lesson) => lesson.slug === lessonSlug
  );
}