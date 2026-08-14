// ==========================================================
// ONONNO AI Education Platform
// Curriculum Engine v1
// Author: ONONNO Team
// ==========================================================

/**
 * Supported Curriculum Boards
 */
export type CurriculumBoard =
  | "nctb"
  | "english_version"
  | "madrasa"
  | "technical";

/**
 * Supported Languages
 */
export type CurriculumLanguage = "bn" | "en";

/**
 * Difficulty Level
 */
export type LessonDifficulty = "easy" | "medium" | "hard";

/**
 * Resource Status
 */
export interface ResourceItem {
  enabled: boolean;
  required?: boolean;
}

/**
 * Lesson Optional Resources
 */
export interface LessonResources {
  aiTeacher: ResourceItem;
  story: ResourceItem;
  animation: ResourceItem;
  video: ResourceItem;
  voice: ResourceItem;
  pdf: ResourceItem;
  quiz: ResourceItem;
  assignment: ResourceItem;
  worksheet: ResourceItem;
  game: ResourceItem;
  puzzle: ResourceItem;
  virtualLab: ResourceItem;
  practice: ResourceItem;
  extraNotes: ResourceItem;
}

/**
 * Lesson
 */
export interface CurriculumLesson {
  id: string;

  /**
   * Stable Unique Code
   * Example:
   * C06-MATH-CH02-L03
   */
  code: string;

  slug: string;

  title: string;
  titleBn: string;

  description?: string;

  estimatedMinutes?: number;

  difficulty?: LessonDifficulty;

  learningObjectives?: string[];

  keywords?: string[];

  order: number;

  resources: LessonResources;
}

/**
 * Chapter
 */
export interface CurriculumChapter {
  id: string;

  /**
   * Example:
   * C06-MATH-CH02
   */
  code: string;

  slug: string;

  title: string;
  titleBn: string;

  description?: string;

  order: number;

  lessons: CurriculumLesson[];
}

/**
 * Subject
 */
export interface CurriculumSubject {
  id: string;

  /**
   * Example:
   * C06-MATH
   */
  code: string;

  slug: string;

  name: string;
  nameBn: string;

  icon?: string;

  color?: string;

  order: number;

  chapters: CurriculumChapter[];
}

/**
 * Class
 */
export interface CurriculumClass {
  id: string;

  /**
   * Example:
   * C01
   * C02
   * C10
   */
  code: string;

  slug: string;

  name: string;
  nameBn: string;

  order: number;

  subjects: CurriculumSubject[];
}

/**
 * Curriculum Version
 */
export type VersionStatus = "draft" | "published" | "archived";

export interface CurriculumVersion {
  id: string;

  slug: string;

  name: string;

  year: number;

  description?: string;

  status: VersionStatus;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;
}
