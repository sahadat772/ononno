/**
 * Map student_profiles.class_level → curriculum class slug / number.
 * Students should only access matching class content.
 */

export type ClassLevelKey =
  | 'nursery'
  | 'kg'
  | 'class_1'
  | 'class_2'
  | 'class_3'
  | 'class_4'
  | 'class_5'
  | 'class_6'
  | 'class_7'
  | 'class_8'
  | 'class_9'
  | 'class_10'
  | 'class_11'
  | 'class_12'
  | 'university'
  | 'masters'
  | string

const LEVEL_TO_NUM: Record<string, number> = {
  nursery: 0,
  kg: 0,
  class_1: 1,
  class_2: 2,
  class_3: 3,
  class_4: 4,
  class_5: 5,
  class_6: 6,
  class_7: 7,
  class_8: 8,
  class_9: 9,
  class_10: 10,
  class_11: 11,
  class_12: 12,
}

const LEVEL_TO_SLUG: Record<string, string> = {
  nursery: 'nursery',
  kg: 'kg',
  class_1: 'class-1',
  class_2: 'class-2',
  class_3: 'class-3',
  class_4: 'class-4',
  class_5: 'class-5',
  class_6: 'class-6',
  class_7: 'class-7',
  class_8: 'class-8',
  class_9: 'class-9',
  class_10: 'class-10',
  class_11: 'class-11',
  class_12: 'class-12',
}

export function classLevelToNumber(level: string | null | undefined): number | null {
  if (!level) return null
  if (level in LEVEL_TO_NUM) return LEVEL_TO_NUM[level]
  const m = level.match(/(\d{1,2})/)
  if (m) {
    const n = parseInt(m[1], 10)
    if (n >= 1 && n <= 12) return n
  }
  return null
}

export function classLevelToSlug(level: string | null | undefined): string | null {
  if (!level) return null
  if (LEVEL_TO_SLUG[level]) return LEVEL_TO_SLUG[level]
  const n = classLevelToNumber(level)
  if (n && n >= 1) return `class-${n}`
  return null
}

export function slugToClassNumber(slug: string | null | undefined): number | null {
  if (!slug) return null
  const m = decodeURIComponent(slug).match(/(\d{1,2})/)
  if (!m) return null
  const n = parseInt(m[1], 10)
  return n >= 1 && n <= 12 ? n : null
}

export function normalizeClassSlug(raw: string): string {
  const s = decodeURIComponent(raw || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
  const n = slugToClassNumber(s)
  if (n) return `class-${n}`
  if (s.includes('nursery')) return 'nursery'
  if (s === 'kg' || s.includes('kindergarten')) return 'kg'
  return s
}

export function studentCanAccessClassSlug(
  classLevel: string | null | undefined,
  classSlug: string,
): boolean {
  if (!classLevel) return true
  const allowed = classLevelToSlug(classLevel)
  if (!allowed) return true
  return normalizeClassSlug(classSlug) === normalizeClassSlug(allowed)
}

export function studentCanAccessClassNumber(
  classLevel: string | null | undefined,
  classNumber: number | null | undefined,
): boolean {
  if (!classLevel || classNumber == null) return true
  const n = classLevelToNumber(classLevel)
  if (n == null) return true
  if (n === 0) return classNumber === 0 || classNumber === 1
  return n === classNumber
}

export function sectorForClassLevel(level: string | null | undefined): string | null {
  const n = classLevelToNumber(level)
  if (n == null) return null
  if (n === 0) return 'kids-zone'
  if (n <= 5) return 'primary'
  if (n <= 8) return 'secondary'
  if (n <= 10) return 'high-school'
  if (n <= 12) return 'hsc'
  return 'university'
}
