'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'

export type StudyLessonRef = {
  id: string
  subject_id: string
  chapter_id: string
  is_published?: boolean
  curriculum_classes?: { class_number: number; name?: string } | null
}

export function buildStudyHref(item: StudyLessonRef): string | null {
  if (!item.subject_id || !item.chapter_id || !item.id) return null
  const n = item.curriculum_classes?.class_number
  let classSlug = 'class-1'
  if (typeof n === 'number' && n >= 1 && n <= 12) classSlug = `class-${n}`
  else if (n === 0) classSlug = 'nursery'
  return `/dashboard/student/academic/learn/${classSlug}/${item.subject_id}/${item.chapter_id}/${item.id}?preview=1`
}

/** Admin → student study view (new tab). Works for draft if admin + preview=1 */
export default function ViewStudyLink({ item }: { item: StudyLessonRef }) {
  const href = buildStudyHref(item)
  if (!href) return null
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View Study"
      title={item.is_published ? 'Student study view' : 'Preview study (admin)'}
      className="grid size-8 place-items-center rounded-full border border-sky-500/40 bg-sky-500/15 text-sky-200 transition hover:bg-sky-500/25"
    >
      <Eye className="size-3.5" />
    </Link>
  )
}
