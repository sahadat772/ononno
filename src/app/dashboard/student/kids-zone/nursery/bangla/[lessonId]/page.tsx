'use client'

import { useParams } from 'next/navigation'
import LessonEngine from '@/components/kids/LessonEngine'
import { banglaLessonsP1 } from './lessons-p1'
import { banglaLessonsP1b } from './lessons-p1b'
import { banglaLessonsP1c } from './lessons-p1c'
// Remaining modules will be added as they are pushed:
// import { banglaLessonsP2 } from './lessons-p2'
// import { banglaLessonsP3 } from './lessons-p3'
// import { banglaLessonsP4 } from './lessons-p4'

const lessons = {
  ...banglaLessonsP1,
  ...banglaLessonsP1b,
  ...banglaLessonsP1c,
}

export default function BanglaLessonPage() {
  const params = useParams()
  const lessonId = params.lessonId as string
  const lesson = lessons[lessonId]

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-400 mb-2">Lesson পাওয়া যায়নি</p>
          <p className="text-gray-600 text-sm">ID: {lessonId}</p>
        </div>
      </div>
    )
  }

  return <LessonEngine lesson={lesson} />
}
