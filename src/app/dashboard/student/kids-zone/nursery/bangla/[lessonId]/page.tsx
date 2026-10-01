'use client'

import { useParams } from 'next/navigation'
import LessonEngine from '@/components/kids/LessonEngine'
import { banglaLessonsP1 } from './lessons-p1'
import { banglaLessonsP1b } from './lessons-p1b'
import { banglaLessonsP1c } from './lessons-p1c'
import { banglaLessonsP2a } from './lessons-p2a'
import { banglaLessonsP2b } from './lessons-p2b'
import { banglaLessonsP3a } from './lessons-p3a'
import { banglaLessonsP3b } from './lessons-p3b'
import { banglaLessonsP4a } from './lessons-p4a'
import { banglaLessonsP4b } from './lessons-p4b'

const lessons = {
  ...banglaLessonsP1,
  ...banglaLessonsP1b,
  ...banglaLessonsP1c,
  ...banglaLessonsP2a,
  ...banglaLessonsP2b,
  ...banglaLessonsP3a,
  ...banglaLessonsP3b,
  ...banglaLessonsP4a,
  ...banglaLessonsP4b,
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
