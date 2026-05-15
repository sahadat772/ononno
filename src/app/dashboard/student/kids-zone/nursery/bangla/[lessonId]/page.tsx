'use client'

import { useParams } from 'next/navigation'
import LessonEngine, { LessonConfig } from '@/components/kids/LessonEngine'

const lessons: Record<string, LessonConfig> = {
    'swarabarna-a': {
        id: 'swarabarna-a', letter: 'অ', word: 'অজগর', wordEn: 'Python Snake', emoji: '🐍',
        color: 'from-red-400 to-rose-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'অ তে অজগর', content: 'অ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — অজগর', voiceText: 'অজগর', content: 'অজগর' },
            { id: 'e3', type: 'tap-correct', title: 'অ কোথায়?', voiceText: 'অ খুঁজে বের করো', content: 'অ', options: ['অ', 'আ', 'ই', 'ক'], correctAnswer: 'অ' },
            { id: 'e4', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক বর্ণের বুদবুদ ফাটাও', content: 'অ', options: ['অ', 'আ', 'ই', 'ক'], correctAnswer: 'অ' },
            { id: 'e5', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণটা বেছে নাও', content: 'অ', options: ['অ', 'আ', 'ই', 'ক'], correctAnswer: 'অ' },
            { id: 'e6', type: 'trace', title: 'লিখি — অ', voiceText: 'অ লেখো', content: 'অ' },
            { id: 'e7', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'অজগর কোন বর্ণ দিয়ে শুরু?', content: 'অ', options: ['আ', 'অ', 'ই', 'উ'], correctAnswer: 'অ' },
        ],
    },
    'swarabarna-aa': {
        id: 'swarabarna-aa', letter: 'আ', word: 'আম', wordEn: 'Mango', emoji: '🥭',
        color: 'from-orange-400 to-amber-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'আ তে আম', content: 'আ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — আম', voiceText: 'আম', content: 'আম' },
            { id: 'e3', type: 'tap-correct', title: 'আ কোথায়?', voiceText: 'আ খুঁজে বের করো', content: 'আ', options: ['অ', 'আ', 'ই', 'খ'], correctAnswer: 'আ' },
            { id: 'e4', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক বর্ণের বুদবুদ ফাটাও', content: 'আ', options: ['অ', 'আ', 'ই', 'খ'], correctAnswer: 'আ' },
            { id: 'e5', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণটা বেছে নাও', content: 'আ', options: ['অ', 'আ', 'ই', 'খ'], correctAnswer: 'আ' },
            { id: 'e6', type: 'trace', title: 'লিখি — আ', voiceText: 'আ লেখো', content: 'আ' },
            { id: 'e7', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'আম কোন বর্ণ দিয়ে শুরু?', content: 'আ', options: ['অ', 'আ', 'ক', 'ঘ'], correctAnswer: 'আ' },
        ],
    },
    'swarabarna-i': {
        id: 'swarabarna-i', letter: 'ই', word: 'ইলিশ', wordEn: 'Hilsa Fish', emoji: '🐟',
        color: 'from-yellow-400 to-lime-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ই তে ইলিশ', content: 'ই' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ইলিশ', voiceText: 'ইলিশ', content: 'ইলিশ' },
            { id: 'e3', type: 'tap-correct', title: 'ই কোথায়?', voiceText: 'ই খুঁজে বের করো', content: 'ই', options: ['ঈ', 'উ', 'ই', 'চ'], correctAnswer: 'ই' },
            { id: 'e4', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক বর্ণের বুদবুদ ফাটাও', content: 'ই', options: ['ঈ', 'উ', 'ই', 'চ'], correctAnswer: 'ই' },
            { id: 'e5', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণটা বেছে নাও', content: 'ই', options: ['ঈ', 'উ', 'ই', 'চ'], correctAnswer: 'ই' },
            { id: 'e6', type: 'trace', title: 'লিখি — ই', voiceText: 'ই লেখো', content: 'ই' },
            { id: 'e7', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ইলিশ কোন বর্ণ দিয়ে শুরু?', content: 'ই', options: ['ঈ', 'উ', 'ই', 'অ'], correctAnswer: 'ই' },
        ],
    },
}

export default function BanglaLessonPage() {
    const params = useParams()
    const lessonId = params.lessonId as string
    const lesson = lessons[lessonId]

    if (!lesson) return (
        <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center text-white">
            <div className="text-center">
                <div className="text-6xl mb-4">😕</div>
                <p className="mb-4">Lesson পাওয়া যায়নি</p>
            </div>
        </div>
    )

    return <LessonEngine lesson={lesson} />
}