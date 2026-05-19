'use client'

import { useParams } from 'next/navigation'
import LessonEngine, { LessonConfig } from '@/components/kids/LessonEngine'

const lessons: Record<string, LessonConfig> = {
    'arabic-alif': {
        id: 'arabic-alif', letter: ' এটি হলো আলিফ ا', word: 'أسد - আলিফ দিয়ে হয় আসাদুন - মানে সিংহ!', wordEn: 'Lion', emoji: '🦁',
        color: 'from-emerald-400 to-teal-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো আলিফ (ا) শিখি!', voiceText: 'এটি হলো আলিফ। আলিফ দিয়ে হয় আসাদুন - মানে সিংহ!', content: 'ا' },
            { id: 'e2', type: 'listen-repeat', title: 'মন দিয়ে শোনো', voiceText: 'আসাদুন - সিংহ', content: 'أسد' },
            { id: 'e3', type: 'pronounce', title: 'এবার তুমি বলো!', voiceText: 'আলিফ — আসাদুন', content: 'ا' },
            { id: 'e4', type: 'tap-correct', title: 'আলিফ (ا) কোথায়?', voiceText: 'আলিফ হরফটি খুঁজে বের করো !', content: 'ا', options: ['ا', 'ب', 'ت', 'ث'], correctAnswer: 'ا' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটানো!', voiceText: 'আলিফ হরফের বুদবুদগুলো ফাটাও!', content: 'ا', options: ['ا', 'ب', 'ت', 'ث'], correctAnswer: 'ا' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'আলিফ হরফটি চিনতে পেরেছ?', content: 'ا', options: ['ا', 'ب', 'ت', 'ث'], correctAnswer: 'ا' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'হরফের সাথে সঠিক শব্দটি মিলিয়ে দাও', content: 'ا', options: ['ا-أسد', 'ب-بطة', 'ت-تفاح', 'ث-ثعلب'], correctAnswer: 'ا' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি!', voiceText: 'আলিফ লেখা প্র্যাকটিস করো', content: 'ا' },
            { id: 'e10', type: 'quiz', title: 'সাবাশ! শেষ প্রশ্ন', voiceText: 'সিংহ বা আসাদুন কোন হরফ দিয়ে শুরু হয়?', content: 'ا', options: ['ب', 'ا', 'ت', 'ث'], correctAnswer: 'ا' },
        ],
    },
    'arabic-ba': {
        id: 'arabic-ba', letter: ' -এটি বা ب', word: 'بطة - বা দিয়ে হয় বত্বাতুন - মানে হাঁস!', wordEn: 'Duck', emoji: '🦆',
        color: 'from-blue-400 to-cyan-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো বা (ب) শিখি!', voiceText: 'এটি বা! বা দিয়ে হয় বত্বাতুন - মানে হাঁস!', content: 'ب' },
            { id: 'e2', type: 'listen-repeat', title: 'মন দিয়ে শোনো', voiceText: 'বত্বাতুন - হাঁস', content: 'بطة' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'বা — বত্বাতুন', content: 'ب' },
            { id: 'e4', type: 'tap-correct', title: 'বা (ب) কোথায়?', voiceText: 'বা হরফটি খুঁজে বের করো তো!', content: 'ب', options: ['ا', 'ب', 'ن', 'ي'], correctAnswer: 'ب' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটানো!', voiceText: 'বা হরফের বুদবুদগুলো ফাটাও!', content: 'ب', options: ['ا', 'ب', 'ن', 'ي'], correctAnswer: 'ب' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফটি বেছে নাও', content: 'ب', options: ['ا', 'ب', 'ن', 'ي'], correctAnswer: 'ب' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'হরফের সাথে শব্দ মেলাও', content: 'ب', options: ['ا-أسد', 'ب-بطة', 'ت-تفاح', 'ث-ثعلب'], correctAnswer: 'ب' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি!', voiceText: 'বা লেখা প্র্যাকটিস করো', content: 'ب' },
            { id: 'e10', type: 'quiz', title: 'চমৎকার! শেষ প্রশ্ন', voiceText: 'হাঁস বা বত্বাতুন কোন হরফ দিয়ে শুরু হয়?', content: 'ب', options: ['ا', 'ب', 'ن', 'ي'], correctAnswer: 'ب' },
        ],
    },
    'arabic-ta': {
        id: 'arabic-ta', letter: ' -এটি তা!ت', word: 'تفاح - তা দিয়ে হয় তুফফাহুন - মানে আপেল!', wordEn: 'Apple', emoji: '🍎',
        color: 'from-rose-400 to-pink-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো তা (ت) শিখি!', voiceText: 'এটি তা! তা দিয়ে হয় তুফফাহুন - মানে আপেল!', content: 'ت' },
            { id: 'e2', type: 'listen-repeat', title: 'মন দিয়ে শোনো', voiceText: 'তুফফাহুন - আপেল', content: 'تفاح' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'তা — তুফফাহুন', content: 'ت' },
            { id: 'e4', type: 'tap-correct', title: 'তা (ت) কোথায়?', voiceText: 'তা হরফটি খুঁজে বের করো তো!', content: 'ت', options: ['ب', 'ت', 'ث', 'ن'], correctAnswer: 'ت' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটানো!', voiceText: 'তা হরফের বুদবুদগুলো ফাটাও!', content: 'ت', options: ['ب', 'ت', 'ث', 'ن'], correctAnswer: 'ت' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফটি বেছে নাও', content: 'ت', options: ['ب', 'ت', 'ث', 'ن'], correctAnswer: 'ت' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'হরফের সাথে শব্দ মেলাও', content: 'ت', options: ['ا-أسد', 'ب-بطة', 'ت-تفاح', 'ث-ثعلب'], correctAnswer: 'ت' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি!', voiceText: 'তা লেখা প্র্যাকটিস করো', content: 'ت' },
            { id: 'e10', type: 'quiz', title: 'সাবাশ! শেষ প্রশ্ন', voiceText: 'আপেল বা তুফফাহুন কোন হরফ দিয়ে শুরু হয়?', content: 'ت', options: ['ب', 'ث', 'ت', 'ن'], correctAnswer: 'ت' },
        ],
    },
    'arabic-cha': {
        id: 'arabic-cha', letter: 'ث - এটি ছা!', word: 'ثعلب -ছা দিয়ে হয় সা’লাবুন - মানে শিয়াল!', wordEn: 'Fox', emoji: '🦊',
        color: 'from-amber-400 to-orange-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো ছা (ث) শিখি!', voiceText: 'এটি ছা! ছা দিয়ে হয় সা’লাবুন - মানে শিয়াল!', content: 'ث' },
            { id: 'e2', type: 'listen-repeat', title: 'মন দিয়ে শোনো', voiceText: 'সা’লাবুন - শিয়াল', content: 'ثعلب' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ছা — সা’লাবুন', content: 'ث' },
            { id: 'e4', type: 'tap-correct', title: 'ছা (ث) কোথায়?', voiceText: 'ছা হরফটি খুঁজে বের করো!', content: 'ث', options: ['ت', 'ث', 'ب', 'ن'], correctAnswer: 'ث' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটানো!', voiceText: 'ছা হরফের বুদবুদগুলো ফাটাও!', content: 'ث', options: ['ت', 'ث', 'ب', 'ن'], correctAnswer: 'ث' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফটি বেছে নাও', content: 'ث', options: ['ت', 'ث', 'ب', 'ن'], correctAnswer: 'ث' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'হরফের সাথে শব্দ মেলাও', content: 'ث', options: ['ا-أسد', 'ب-بطة', 'ت-تفاح', 'ث-ثعلب'], correctAnswer: 'ث' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি!', voiceText: 'ছা লেখা প্র্যাকটিস করো', content: 'ث' },
            { id: 'e10', type: 'quiz', title: 'দারুণ! শেষ প্রশ্ন', voiceText: 'শিয়াল বা সা’লাবুন কোন হরফ দিয়ে শুরু?', content: 'ث', options: ['ت', 'ب', 'ث', 'ن'], correctAnswer: 'ث' },
        ],
    },
    'arabic-jeem': {
        id: 'arabic-jeem', letter: ' ج - এটি জীম!', word: 'جمل - জীম দিয়ে হয় জামাালুন - মানে উট!', wordEn: 'Camel', emoji: '🐪',
        color: 'from-violet-400 to-purple-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো জীম (ج) শিখি!', voiceText: 'এটি জীম! জীম দিয়ে হয় জামাালুন - মানে উট!', content: 'ج' },
            { id: 'e2', type: 'listen-repeat', title: 'মন দিয়ে শোনো', voiceText: 'জামাালুন - উট', content: 'جمل' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'জীম — জামাালুন', content: 'ج' },
            { id: 'e4', type: 'tap-correct', title: 'জীম (ج) কোথায়?', voiceText: 'জীম হরফটি খুঁজে বের করো!', content: 'ج', options: ['ح', 'ج', 'خ', 'ع'], correctAnswer: 'ج' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটানো!', voiceText: 'জীম হরফের বুদবুদগুলো ফাটাও!', content: 'ج', options: ['ح', 'ج', 'خ', 'ع'], correctAnswer: 'ج' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফটি বেছে নাও', content: 'ج', options: ['ح', 'ج', 'خ', 'ع'], correctAnswer: 'ج' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'হরফের সাথে শব্দ মেলাও', content: 'ج', options: ['ج-جمل', 'ح-حصان', 'خ-خروف', 'د-دب'], correctAnswer: 'ج' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি!', voiceText: 'জীম লেখা প্র্যাকটিস করো', content: 'ج' },
            { id: 'e10', type: 'quiz', title: 'অনেক ভালো! শেষ প্রশ্ন', voiceText: 'উট বা জামাালুন কোন হরফ দিয়ে শুরু?', content: 'ج', options: ['ح', 'خ', 'ج', 'ع'], correctAnswer: 'ج' },
        ],
    }
    // আপনি একইভাবে বাকিগুলো ('ح', 'خ', 'د') একই ফরম্যাটে আপডেট করে নিন।
}

export default function ArabicLessonPage() {
    const params = useParams()
    const lessonId = params.lessonId as string
    const lesson = lessons[lessonId]

    if (!lesson) return (
        <div className="min-h-screen bg-linear-to-br from-indigo-900 to-purple-900 flex items-center justify-center text-white p-6">
            <div className="text-center bg-white/10 p-10 rounded-3xl backdrop-blur-md shadow-2xl">
                <div className="text-8xl mb-6">🐣</div>
                <h2 className="text-3xl font-bold mb-4">আসছে!</h2>
                <p className="text-lg">এই লেসনটি খুব শীঘ্রই আসছে। সাথে থাকো!</p>
            </div>
        </div>
    )

    return <LessonEngine lesson={lesson} />
}