'use client'

import { useParams } from 'next/navigation'
import LessonEngine from '@/components/kids/LessonEngine'
import { mathExtraLessons } from '../../[lessonId]/extra-lessons'

export default function MathTensLessonPage() {
  const params = useParams()
  const n = String(params.n || '')
  const lessonId = `math-${n}`
  const raw = mathExtraLessons[lessonId]

  const lesson = raw
    ? { ...raw, id: lessonId, backHref: '/dashboard/student/kids-zone/nursery/math' }
    : undefined

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a1a] p-6 text-white">
        <div className="max-w-sm text-center">
          <div className="mb-4 text-6xl">😕</div>
          <p className="mb-2 text-lg font-bold">এই সংখ্যা পাঠ নেই</p>
          <p className="mb-6 text-sm text-gray-400">ID: {lessonId}</p>
          <a
            href="/dashboard/student/kids-zone/nursery/math"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-amber-500 px-6 font-bold text-white"
          >
            ← গণিত তালিকায় ফিরে যাও
          </a>
        </div>
      </div>
    )
  }

  return <LessonEngine lesson={lesson} />
}
