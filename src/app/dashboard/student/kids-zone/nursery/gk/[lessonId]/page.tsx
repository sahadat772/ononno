'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import LessonEngine from '@/components/kids/LessonEngine'
import { gkLessons } from '../lessons'

export default function GkLessonPage() {
  const params = useParams()
  const lessonId = typeof params.lessonId === 'string' ? params.lessonId : ''
  const lesson = gkLessons[lessonId]

  if (!lesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a1a] px-4 text-white">
        <p className="text-5xl">🌍</p>
        <h1 className="text-xl font-black">Lesson পাওয়া যায়নি</h1>
        <p className="text-sm text-slate-400">এই lesson ID সঠিক নয়: {lessonId}</p>
        <Link
          href="/dashboard/student/kids-zone/nursery/gk"
          className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white"
        >
          ← সাধারণ জ্ঞান এ ফিরে যাও
        </Link>
      </div>
    )
  }

  return <LessonEngine lesson={lesson} />
}
