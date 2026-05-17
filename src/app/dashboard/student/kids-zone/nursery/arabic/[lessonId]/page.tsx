'use client'

import { useParams } from 'next/navigation'
import LessonEngine, { LessonConfig } from '@/components/kids/LessonEngine'

const lessons: Record<string, LessonConfig> = {
    'arabic-alif': {
        id: 'arabic-alif', letter: 'ا', word: 'أسد', wordEn: 'Lion', emoji: '🦁',
        color: 'from-emerald-400 to-teal-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ألف — أسد', content: 'ا' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — أسد', voiceText: 'أَسَد', content: 'أسد' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ألف — أسد', content: 'ا' },
            { id: 'e4', type: 'tap-correct', title: 'ا কোথায়?', voiceText: 'সঠিক হরফ খুঁজো', content: 'ا', options: ['ا', 'ب', 'ت', 'ث'], correctAnswer: 'ا' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক হরফের বুদবুদ ফাটাও', content: 'ا', options: ['ا', 'ب', 'ت', 'ث'], correctAnswer: 'ا' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক হরফে আঘাত করো', content: 'ا', options: ['ا', 'ب', 'ت', 'ث'], correctAnswer: 'ا' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফ বেছে নাও', content: 'ا', options: ['ا', 'ب', 'ت', 'ث'], correctAnswer: 'ا' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'হরফ আর শব্দ মেলাও', content: 'ا', options: ['ا-أسد', 'ب-بطة', 'ت-تفاح', 'ث-ثعلب'], correctAnswer: 'ا' },
            { id: 'e9', type: 'trace', title: 'লিখি — ا', voiceText: 'আলিফ লেখো', content: 'ا' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'أسد কোন হরফ দিয়ে শুরু?', content: 'ا', options: ['ب', 'ا', 'ت', 'ث'], correctAnswer: 'ا' },
        ],
    },
    'arabic-ba': {
        id: 'arabic-ba', letter: 'ب', word: 'بطة', wordEn: 'Duck', emoji: '🦆',
        color: 'from-blue-400 to-cyan-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'باء — بطة', content: 'ب' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — بطة', voiceText: 'بَطَّة', content: 'بطة' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'باء — بطة', content: 'ب' },
            { id: 'e4', type: 'tap-correct', title: 'ب কোথায়?', voiceText: 'সঠিক হরফ খুঁজো', content: 'ب', options: ['ا', 'ب', 'ن', 'ي'], correctAnswer: 'ب' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক হরফের বুদবুদ ফাটাও', content: 'ب', options: ['ا', 'ب', 'ن', 'ي'], correctAnswer: 'ب' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক হরফে আঘাত করো', content: 'ب', options: ['ا', 'ب', 'ن', 'ي'], correctAnswer: 'ب' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফ বেছে নাও', content: 'ب', options: ['ا', 'ب', 'ن', 'ي'], correctAnswer: 'ب' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'হরফ আর শব্দ মেলাও', content: 'ب', options: ['ا-أسد', 'ب-بطة', 'ت-تفاح', 'ث-ثعلب'], correctAnswer: 'ب' },
            { id: 'e9', type: 'trace', title: 'লিখি — ب', voiceText: 'বা লেখো', content: 'ب' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'بطة কোন হরফ দিয়ে শুরু?', content: 'ب', options: ['ا', 'ب', 'ن', 'ي'], correctAnswer: 'ب' },
        ],
    },
    'arabic-ta': {
        id: 'arabic-ta', letter: 'ت', word: 'تفاح', wordEn: 'Apple', emoji: '🍎',
        color: 'from-rose-400 to-pink-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'تاء — تفاح', content: 'ت' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — تفاح', voiceText: 'تُفَّاح', content: 'تفاح' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'تاء — تفاح', content: 'ت' },
            { id: 'e4', type: 'tap-correct', title: 'ت কোথায়?', voiceText: 'সঠিক হরফ খুঁজো', content: 'ت', options: ['ب', 'ت', 'ث', 'ن'], correctAnswer: 'ت' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক হরফের বুদবুদ ফাটাও', content: 'ت', options: ['ب', 'ت', 'ث', 'ن'], correctAnswer: 'ت' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক হরফে আঘাত করো', content: 'ت', options: ['ب', 'ت', 'ث', 'ن'], correctAnswer: 'ت' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফ বেছে নাও', content: 'ت', options: ['ب', 'ت', 'ث', 'ن'], correctAnswer: 'ت' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'হরফ আর শব্দ মেলাও', content: 'ت', options: ['ا-أسد', 'ب-بطة', 'ت-تفاح', 'ث-ثعلب'], correctAnswer: 'ت' },
            { id: 'e9', type: 'trace', title: 'লিখি — ت', voiceText: 'তা লেখো', content: 'ت' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'تفاح কোন হরফ দিয়ে শুরু?', content: 'ت', options: ['ب', 'ث', 'ت', 'ن'], correctAnswer: 'ت' },
        ],
    },
    'arabic-tha': {
        id: 'arabic-tha', letter: 'ث', word: 'ثعلب', wordEn: 'Fox', emoji: '🦊',
        color: 'from-amber-400 to-orange-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ثاء — ثعلب', content: 'ث' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ثعلب', voiceText: 'ثَعْلَب', content: 'ثعلب' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ثاء — ثعلب', content: 'ث' },
            { id: 'e4', type: 'tap-correct', title: 'ث কোথায়?', voiceText: 'সঠিক হরফ খুঁজো', content: 'ث', options: ['ت', 'ث', 'ب', 'ن'], correctAnswer: 'ث' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক হরফের বুদবুদ ফাটাও', content: 'ث', options: ['ت', 'ث', 'ب', 'ن'], correctAnswer: 'ث' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক হরফে আঘাত করো', content: 'ث', options: ['ت', 'ث', 'ب', 'ن'], correctAnswer: 'ث' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফ বেছে নাও', content: 'ث', options: ['ت', 'ث', 'ب', 'ن'], correctAnswer: 'ث' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'হরফ আর শব্দ মেলাও', content: 'ث', options: ['ا-أسد', 'ب-بطة', 'ت-تفاح', 'ث-ثعلب'], correctAnswer: 'ث' },
            { id: 'e9', type: 'trace', title: 'লিখি — ث', voiceText: 'ছা লেখো', content: 'ث' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ثعلب কোন হরফ দিয়ে শুরু?', content: 'ث', options: ['ت', 'ب', 'ث', 'ن'], correctAnswer: 'ث' },
        ],
    },
    'arabic-jeem': {
        id: 'arabic-jeem', letter: 'ج', word: 'جمل', wordEn: 'Camel', emoji: '🐪',
        color: 'from-violet-400 to-purple-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'جيم — جمل', content: 'ج' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — جمل', voiceText: 'جَمَل', content: 'جمل' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'جيم — جمل', content: 'ج' },
            { id: 'e4', type: 'tap-correct', title: 'ج কোথায়?', voiceText: 'সঠিক হরফ খুঁজো', content: 'ج', options: ['ح', 'ج', 'خ', 'ع'], correctAnswer: 'ج' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক হরফের বুদবুদ ফাটাও', content: 'ج', options: ['ح', 'ج', 'خ', 'ع'], correctAnswer: 'ج' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক হরফে আঘাত করো', content: 'ج', options: ['ح', 'ج', 'خ', 'ع'], correctAnswer: 'ج' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফ বেছে নাও', content: 'ج', options: ['ح', 'ج', 'خ', 'ع'], correctAnswer: 'ج' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'হরফ আর শব্দ মেলাও', content: 'ج', options: ['ج-جمل', 'ح-حصان', 'خ-خروف', 'د-دب'], correctAnswer: 'ج' },
            { id: 'e9', type: 'trace', title: 'লিখি — ج', voiceText: 'জীম লেখো', content: 'ج' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'جمل কোন হরফ দিয়ে শুরু?', content: 'ج', options: ['ح', 'خ', 'ج', 'ع'], correctAnswer: 'ج' },
        ],
    },
    'arabic-ha': {
        id: 'arabic-ha', letter: 'ح', word: 'حصان', wordEn: 'Horse', emoji: '🐴',
        color: 'from-teal-400 to-cyan-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'حاء — حصان', content: 'ح' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — حصان', voiceText: 'حِصَان', content: 'حصان' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'حاء — حصان', content: 'ح' },
            { id: 'e4', type: 'tap-correct', title: 'ح কোথায়?', voiceText: 'সঠিক হরফ খুঁজো', content: 'ح', options: ['ج', 'ح', 'خ', 'ع'], correctAnswer: 'ح' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক হরফের বুদবুদ ফাটাও', content: 'ح', options: ['ج', 'ح', 'خ', 'ع'], correctAnswer: 'ح' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক হরফে আঘাত করো', content: 'ح', options: ['ج', 'ح', 'خ', 'ع'], correctAnswer: 'ح' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফ বেছে নাও', content: 'ح', options: ['ج', 'ح', 'خ', 'ع'], correctAnswer: 'ح' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'হরফ আর শব্দ মেলাও', content: 'ح', options: ['ج-جمل', 'ح-حصان', 'خ-خروف', 'د-دب'], correctAnswer: 'ح' },
            { id: 'e9', type: 'trace', title: 'লিখি — ح', voiceText: 'হা লেখো', content: 'ح' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'حصان কোন হরফ দিয়ে শুরু?', content: 'ح', options: ['ج', 'خ', 'ح', 'ع'], correctAnswer: 'ح' },
        ],
    },
    'arabic-kha': {
        id: 'arabic-kha', letter: 'خ', word: 'خروف', wordEn: 'Sheep', emoji: '🐑',
        color: 'from-lime-400 to-green-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'خاء — خروف', content: 'خ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — خروف', voiceText: 'خَرُوف', content: 'خروف' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'خاء — خروف', content: 'خ' },
            { id: 'e4', type: 'tap-correct', title: 'خ কোথায়?', voiceText: 'সঠিক হরফ খুঁজো', content: 'خ', options: ['ج', 'ح', 'خ', 'ع'], correctAnswer: 'خ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক হরফের বুদবুদ ফাটাও', content: 'خ', options: ['ج', 'ح', 'خ', 'ع'], correctAnswer: 'خ' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক হরফে আঘাত করো', content: 'خ', options: ['ج', 'ح', 'خ', 'ع'], correctAnswer: 'خ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফ বেছে নাও', content: 'خ', options: ['ج', 'ح', 'خ', 'ع'], correctAnswer: 'خ' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'হরফ আর শব্দ মেলাও', content: 'خ', options: ['ج-جمل', 'ح-حصان', 'خ-خروف', 'د-دب'], correctAnswer: 'خ' },
            { id: 'e9', type: 'trace', title: 'লিখি — خ', voiceText: 'খা লেখো', content: 'خ' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'خروف কোন হরফ দিয়ে শুরু?', content: 'خ', options: ['ج', 'ح', 'ع', 'خ'], correctAnswer: 'خ' },
        ],
    },
    'arabic-dal': {
        id: 'arabic-dal', letter: 'د', word: 'دب', wordEn: 'Bear', emoji: '🐻',
        color: 'from-red-400 to-rose-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'دال — دب', content: 'د' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — دب', voiceText: 'دُب', content: 'دب' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'دال — دب', content: 'د' },
            { id: 'e4', type: 'tap-correct', title: 'د কোথায়?', voiceText: 'সঠিক হরফ খুঁজো', content: 'د', options: ['د', 'ذ', 'ر', 'ز'], correctAnswer: 'د' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক হরফের বুদবুদ ফাটাও', content: 'د', options: ['د', 'ذ', 'ر', 'ز'], correctAnswer: 'د' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক হরফে আঘাত করো', content: 'د', options: ['د', 'ذ', 'ر', 'ز'], correctAnswer: 'د' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফ বেছে নাও', content: 'د', options: ['د', 'ذ', 'ر', 'ز'], correctAnswer: 'د' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'হরফ আর শব্দ মেলাও', content: 'د', options: ['ج-جمل', 'ح-حصان', 'خ-خروف', 'د-دب'], correctAnswer: 'د' },
            { id: 'e9', type: 'trace', title: 'লিখি — د', voiceText: 'দাল লেখো', content: 'د' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'دب কোন হরফ দিয়ে শুরু?', content: 'د', options: ['ذ', 'د', 'ر', 'ز'], correctAnswer: 'د' },
        ],
    },
}

export default function ArabicLessonPage() {
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