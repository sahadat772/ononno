/**
 * Progressive class unlock: only registered class open at start;
 * completing class unlocks the next.
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

export function classNumberToLevel(n: number): string {
  if (n <= 0) return 'nursery'
  if (n >= 1 && n <= 12) return `class_${n}`
  return 'class_12'
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

export function getUnlockedUpToNumber(
  registeredLevel: string | null | undefined,
  unlockedLevel: string | null | undefined,
): number | null {
  const start = classLevelToNumber(registeredLevel)
  const max = classLevelToNumber(unlockedLevel ?? registeredLevel)
  if (start == null && max == null) return null
  if (start == null) return max
  if (max == null) return start
  return Math.max(start, max)
}

export function studentCanAccessClassNumber(
  registeredLevel: string | null | undefined,
  classNumber: number | null | undefined,
  unlockedLevel?: string | null,
): boolean {
  if (classNumber == null) return true
  if (!registeredLevel) return true
  const start = classLevelToNumber(registeredLevel)
  if (start == null) return true
  if (start === 0) return classNumber === 0
  const max = getUnlockedUpToNumber(registeredLevel, unlockedLevel ?? registeredLevel) ?? start
  return classNumber >= start && classNumber <= max
}

export function studentCanAccessClassSlug(
  registeredLevel: string | null | undefined,
  classSlug: string,
  unlockedLevel?: string | null,
): boolean {
  if (!registeredLevel) return true
  const n = slugToClassNumber(classSlug)
  if (n == null) {
    const allowed = classLevelToSlug(registeredLevel)
    if (!allowed) return true
    return normalizeClassSlug(classSlug) === normalizeClassSlug(allowed)
  }
  return studentCanAccessClassNumber(registeredLevel, n, unlockedLevel)
}

export function nextClassLevel(
  registeredLevel: string | null | undefined,
  unlockedLevel?: string | null,
): string | null {
  const max =
    getUnlockedUpToNumber(registeredLevel, unlockedLevel) ?? classLevelToNumber(registeredLevel)
  if (max == null || max >= 12) return null
  if (max === 0) return 'class_1'
  return classNumberToLevel(max + 1)
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

export function lockReasonBn(
  registeredLevel: string | null | undefined,
  classNumber: number,
  unlockedLevel?: string | null,
): string {
  const start = classLevelToNumber(registeredLevel) ?? 1
  const max = getUnlockedUpToNumber(registeredLevel, unlockedLevel) ?? start
  if (classNumber < start) {
    return `আপনি ক্লাস ${start}-এ রেজিস্টার করেছেন — আগের ক্লাস এখানে লক`
  }
  if (classNumber > max) {
    return `ক্লাস ${max} এর সব বিষয় শেষ করে পরীক্ষায় পাস করলে ক্লাস ${classNumber} আনলক হবে`
  }
  return 'এই ক্লাস লক আছে'
}
