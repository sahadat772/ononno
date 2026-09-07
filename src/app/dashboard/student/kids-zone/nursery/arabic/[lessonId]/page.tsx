'use client'

import { useParams } from 'next/navigation'
import LessonEngine from '@/components/kids/LessonEngine'
import { arabicLessonsPart1 } from './lessons-part1'
import { arabicLessonsPart2 } from './lessons-part2'

const lessons = { ...arabicLessonsPart1, ...arabicLessonsPart2 }

export default function ArabicLessonPage() {
    const params = useParams()
    const lessonId = params.lessonId as string
    const lesson = lessons[lessonId]

    if (!lesson) return (
        <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center text-white p-6">
            <div className="text-center max-w-sm">
                <div className="text-6xl mb-4">😕</div>
                <p className="text-white font-bold text-lg mb-2">এই পাঠ এখনো তৈরি হয়নি</p>
                <p className="text-gray-400 text-sm mb-6">ID: {lessonId}</p>
                <a href="/dashboard/student/kids-zone/nursery/arabic"
                   className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-500 px-6 font-bold text-white">
                    ← আরবি তালিকায় ফিরে যাও
                </a>
            </div>
        </div>
    )

    return <LessonEngine lesson={lesson} />
}
