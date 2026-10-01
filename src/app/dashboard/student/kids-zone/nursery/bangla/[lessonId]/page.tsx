'use client'

import { useParams } from 'next/navigation'
import LessonEngine from '@/components/kids/LessonEngine'
import { banglaLessonsPart1 } from './lessons-part1'
import { banglaLessonsPart2 } from './lessons-part2'

const lessons = { ...banglaLessonsPart1, ...banglaLessonsPart2 }

export default function BanglaLessonPage() {
    const params = useParams()
    const lessonId = params.lessonId as string
    const lesson = lessons[lessonId]

    if (!lesson) return (
        <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center text-white">
            <div className="text-center">
                <div className="text-6xl mb-4">😕</div>
                <p className="text-gray-400 mb-2">Lesson পাওয়া যায়নি</p>
                <p className="text-gray-600 text-sm">ID: {lessonId}</p>
            </div>
        </div>
    )

    return <LessonEngine lesson={lesson} />
}
