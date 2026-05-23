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
    },
    'arabic-ha': {
        id: 'arabic-ha', letter: ' ح - এটি হা!', word: 'حصان - হা দিয়ে হয় হিসানুন - মানে ঘোড়া!', wordEn: 'Horse', emoji: '🐴',
        color: 'from-teal-400 to-cyan-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো হা (ح) শিখি!', voiceText: 'এটি হা! হা দিয়ে হয় হিসানুন - মানে ঘোড়া!', content: 'ح' },
            { id: 'e2', type: 'listen-repeat', title: 'মন দিয়ে শোনো', voiceText: 'হিসানুন - ঘোড়া', content: 'حصان' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: 'হা — হিসানুন', content: 'ح' },
            { id: 'e4', type: 'tap-correct', title: 'হা (ح) কোথায়?', voiceText: 'হা হরফটি খুঁজে বের করো!', content: 'ح', options: ['ج', 'ح', 'خ', 'ع'], correctAnswer: 'ح' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটানো!', voiceText: 'হা হরফের বুদবুদগুলো ফাটাও!', content: 'ح', options: ['ج', 'ح', 'خ', 'ع'], correctAnswer: 'ح' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফটি বেছে নাও', content: 'ح', options: ['ج', 'ح', 'خ', 'ع'], correctAnswer: 'ح' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'হরফের সাথে শব্দ মেলাও', content: 'ح', options: ['ج-جمل', 'ح-حصان', 'خ-خروف', 'د-دب'], correctAnswer: 'ح' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি!', voiceText: 'হা লেখা প্র্যাকটিস করো', content: 'ح' },
            { id: 'e10', type: 'quiz', title: 'সাবাশ! শেষ প্রশ্ন', voiceText: 'ঘোড়া বা হিসানুন কোন হরফ দিয়ে শুরু?', content: 'ح', options: ['ج', 'خ', 'ح', 'ع'], correctAnswer: 'ح' },
        ],
    },
    'arabic-kha': {
        id: 'arabic-kho', letter: ' خ - এটি খ!', word: 'خروف - খ দিয়ে হয় খারুফুন - মানে ভেড়া!', wordEn: 'Sheep', emoji: '🐑',
        color: 'from-lime-400 to-green-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো খ (خ) শিখি!', voiceText: 'এটি খ! খ দিয়ে হয় খারুফুন - মানে ভেড়া!', content: 'خ' },
            { id: 'e2', type: 'listen-repeat', title: 'মন দিয়ে শোনো', voiceText: 'খারুফুন - ভেড়া', content: 'خروف' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: 'খ — খারুফুন', content: 'خ' },
            { id: 'e4', type: 'tap-correct', title: 'খা (خ) কোথায়?', voiceText: 'খ হরফটি খুঁজে বের করো!', content: 'خ', options: ['ج', 'ح', 'خ', 'ع'], correctAnswer: 'خ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটানো!', voiceText: 'খ হরফের বুদবুদগুলো ফাটাও!', content: 'خ', options: ['ج', 'ح', 'خ', 'ع'], correctAnswer: 'خ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফটি বেছে নাও', content: 'خ', options: ['ج', 'ح', 'خ', 'ع'], correctAnswer: 'خ' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'হরফের সাথে শব্দ মেলাও', content: 'خ', options: ['ج-جمل', 'ح-حصان', 'خ-خروف', 'د-دب'], correctAnswer: 'خ' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি!', voiceText: 'খ লেখা প্র্যাকটিস করো', content: 'خ' },
            { id: 'e10', type: 'quiz', title: 'দারুণ! শেষ প্রশ্ন', voiceText: 'ভেড়া বা খারুফুন কোন হরফ দিয়ে শুরু?', content: 'خ', options: ['ج', 'ح', 'ع', 'خ'], correctAnswer: 'خ' },
        ],
    },
    'arabic-dal': {
        id: 'arabic-dal', letter: ' د - এটি দাল!', word: 'دب - দাল দিয়ে হয় দুব্বুন - মানে ভালুক!', wordEn: 'Bear', emoji: '🐻',
        color: 'from-red-400 to-rose-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো দাল (د) শিখি!', voiceText: 'এটি দাল! দাল দিয়ে হয় দুব্বুন - মানে ভালুক!', content: 'د' },
            { id: 'e2', type: 'listen-repeat', title: 'মন দিয়ে শোনো', voiceText: 'দুব্বুন - ভালুক', content: 'دب' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: 'দাল — দুব্বুন', content: 'د' },
            { id: 'e4', type: 'tap-correct', title: 'দাল (د) কোথায়?', voiceText: 'দাল হরফটি খুঁজে বের করো!', content: 'د', options: ['د', 'ذ', 'ر', 'ز'], correctAnswer: 'د' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটানো!', voiceText: 'দাল হরফের বুদবুদগুলো ফাটাও!', content: 'د', options: ['د', 'ذ', 'ر', 'ز'], correctAnswer: 'د' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফটি বেছে নাও', content: 'د', options: ['د', 'ذ', 'ر', 'ز'], correctAnswer: 'د' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'হরফের সাথে শব্দ মেলাও', content: 'د', options: ['ج-جمل', 'ح-حصان', 'خ-خروف', 'د-دب'], correctAnswer: 'د' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি!', voiceText: 'দাল লেখা প্র্যাকটিস করো', content: 'د' },
            { id: 'e10', type: 'quiz', title: 'চমৎকার! শেষ প্রশ্ন', voiceText: 'ভালুক বা দুব্বুন কোন হরফ দিয়ে শুরু?', content: 'د', options: ['ذ', 'د', 'ر', 'ز'], correctAnswer: 'د' },
        ],
    },
    'arabic-dhal': {
        id: 'arabic-dhal', letter: ' ذ - এটি যাল!', word: 'ذرة - যাল দিয়ে হয় যুররাহ - মানে ভুট্টা!', wordEn: 'Corn', emoji: '🌽',
        color: 'from-orange-400 to-amber-500', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো যাল (ذ) শিখি!', voiceText: 'এটি যাল! যাল দিয়ে হয় যুররাহ - মানে ভুট্টা!', content: 'ذ' },
            { id: 'e2', type: 'listen-repeat', title: 'মন দিয়ে শোনো', voiceText: 'যুররাহ - ভুট্টা', content: 'ذرة' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: 'যাল — যুররাহ', content: 'ذ' },
            { id: 'e4', type: 'tap-correct', title: 'যাল (ذ) কোথায়?', voiceText: 'যাল হরফটি খুঁজে বের করো!', content: 'ذ', options: ['د', 'ذ', 'ر', 'ز'], correctAnswer: 'ذ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটানো!', voiceText: 'যাল হরফের বুদবুদগুলো ফাটাও!', content: 'ذ', options: ['د', 'ذ', 'ر', 'ز'], correctAnswer: 'ذ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফটি বেছে নাও', content: 'ذ', options: ['د', 'ذ', 'ر', 'ز'], correctAnswer: 'ذ' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'হরফের সাথে শব্দ মেলাও', content: 'ذ', options: ['ذ-ذرة', 'ر-رمان', 'ز-زرافة', 'س-سمكة'], correctAnswer: 'ذ' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি!', voiceText: 'যাল লেখা প্র্যাকটিস করো', content: 'ذ' },
            { id: 'e10', type: 'quiz', title: 'সাবাশ! শেষ প্রশ্ন', voiceText: 'ভুট্টা বা যুররাহ কোন হরফ দিয়ে শুরু?', content: 'ذ', options: ['د', 'ذ', 'ر', 'ز'], correctAnswer: 'ذ' },
        ],
    },
    'arabic-ra': {
        id: 'arabic-ra', letter: ' ر - এটি রা!', word: 'رمان - রা দিয়ে হয় রুম্মান - মানে ডালিম!', wordEn: 'Pomegranate', emoji: '🍎',
        color: 'from-red-500 to-rose-600', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো রা (ر) শিখি!', voiceText: 'এটি রা! রা দিয়ে হয় রুম্মান - মানে ডালিম!', content: 'ر' },
            { id: 'e2', type: 'listen-repeat', title: 'মন দিয়ে শোনো', voiceText: 'রুম্মান - ডালিম', content: 'رمان' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: 'রা — রুম্মান', content: 'ر' },
            { id: 'e4', type: 'tap-correct', title: 'রা (ر) কোথায়?', voiceText: 'রা হরফটি খুঁজে বের করো!', content: 'ر', options: ['ذ', 'ر', 'ز', 'س'], correctAnswer: 'ر' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটানো!', voiceText: 'রা হরফের বুদবুদগুলো ফাটাও!', content: 'ر', options: ['ذ', 'ر', 'ز', 'س'], correctAnswer: 'ر' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফটি বেছে নাও', content: 'ر', options: ['ذ', 'ر', 'ز', 'س'], correctAnswer: 'ر' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'হরফের সাথে শব্দ মেলাও', content: 'ر', options: ['ذ-ذرة', 'ر-رمان', 'ز-زرافة', 'س-سمكة'], correctAnswer: 'ر' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি!', voiceText: 'রা লেখা প্র্যাকটিস করো', content: 'ر' },
            { id: 'e10', type: 'quiz', title: 'দারুণ! শেষ প্রশ্ন', voiceText: 'ডালিম বা রুম্মান কোন হরফ দিয়ে শুরু?', content: 'ر', options: ['ذ', 'ر', 'ز', 'س'], correctAnswer: 'ر' },
        ],
    },
    'arabic-za': {
        id: 'arabic-za', letter: ' ز - এটি যা!', word: 'زرافة - যা দিয়ে হয় যি’রাফাহ - মানে জিরাফ!', wordEn: 'Giraffe', emoji: '🦒',
        color: 'from-yellow-400 to-amber-600', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো যা (ز) শিখি!', voiceText: 'এটি যা! যা দিয়ে হয় যি’রাফাহ - মানে জিরাফ!', content: 'ز' },
            { id: 'e2', type: 'listen-repeat', title: 'মন দিয়ে শোনো', voiceText: 'যি’রাফাহ - জিরাফ', content: 'زرافة' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: 'যা — যি’রাফাহ', content: 'ز' },
            { id: 'e4', type: 'tap-correct', title: 'যা (ز) কোথায়?', voiceText: 'যা হরফটি খুঁজে বের করো!', content: 'ز', options: ['ر', 'ز', 'س', 'ش'], correctAnswer: 'ز' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটানো!', voiceText: 'যা হরফের বুদবুদগুলো ফাটাও!', content: 'ز', options: ['ر', 'ز', 'س', 'ش'], correctAnswer: 'ز' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফটি বেছে নাও', content: 'ز', options: ['ر', 'ز', 'س', 'ش'], correctAnswer: 'ز' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'হরফের সাথে শব্দ মেলাও', content: 'ز', options: ['ذ-ذرة', 'ر-رمان', 'ز-زرافة', 'س-سمكة'], correctAnswer: 'ز' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি!', voiceText: 'যা লেখা প্র্যাকটিস করো', content: 'ز' },
            { id: 'e10', type: 'quiz', title: 'চমৎকার! শেষ প্রশ্ন', voiceText: 'জিরাফ বা যি’রাফাহ কোন হরফ দিয়ে শুরু?', content: 'ز', options: ['ر', 'ز', 'س', 'ش'], correctAnswer: 'ز' },
        ],
    },
    'arabic-sin': {
        id: 'arabic-sin', letter: ' س - এটি সিন!', word: 'سمكة - সিন দিয়ে হয় সামাকাহ - মানে মাছ!', wordEn: 'Fish', emoji: '🐟',
        color: 'from-indigo-400 to-blue-600', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো সিন (س) শিখি!', voiceText: 'এটি সিন! সিন দিয়ে হয় সামাকাহ - মানে মাছ!', content: 'س' },
            { id: 'e2', type: 'listen-repeat', title: 'মন দিয়ে শোনো', voiceText: 'সামাকাহ - মাছ', content: 'سمكة' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: 'সিন — সামাকাহ', content: 'س' },
            { id: 'e4', type: 'tap-correct', title: 'সিন (س) কোথায়?', voiceText: 'সিন হরফটি খুঁজে বের করো!', content: 'س', options: ['ز', 'س', 'ش', 'ص'], correctAnswer: 'س' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটানো!', voiceText: 'সিন হরফের বুদবুদগুলো ফাটাও!', content: 'س', options: ['ز', 'س', 'ش', 'ص'], correctAnswer: 'س' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফটি বেছে নাও', content: 'س', options: ['ز', 'س', 'ش', 'ص'], correctAnswer: 'س' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'হরফের সাথে শব্দ মেলাও', content: 'س', options: ['ذ-ذرة', 'ر-رمان', 'ز-زرافة', 'س-سمكة'], correctAnswer: 'س' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি!', voiceText: 'সিন লেখা প্র্যাকটিস করো', content: 'س' },
            { id: 'e10', type: 'quiz', title: 'অনেক ভালো! শেষ প্রশ্ন', voiceText: 'মাছ বা সামাকাহ কোন হরফ দিয়ে শুরু?', content: 'س', options: ['ز', 'س', 'ش', 'ص'], correctAnswer: 'س' },
        ],
    },
    'arabic-shin': {
        id: 'arabic-shin', letter: ' ش - এটি শিন!', word: 'شمس - শিন দিয়ে হয় শামস - মানে সূর্য!', wordEn: 'Sun', emoji: '☀️',
        color: 'from-purple-400 to-indigo-600', lang: 'ar-SA',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো শিন (ش) শিখি!', voiceText: 'এটি শিন! শিন দিয়ে হয় শামস - মানে সূর্য!', content: 'ش' },
            { id: 'e2', type: 'listen-repeat', title: 'মন দিয়ে শোনো', voiceText: 'শামস - সূর্য', content: 'شمس' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: 'শিন — শামস', content: 'ش' },
            { id: 'e4', type: 'tap-correct', title: 'শিন (ش) কোথায়?', voiceText: 'শিন হরফটি খুঁজে বের করো!', content: 'ش', options: ['س', 'ش', 'ص', 'ض'], correctAnswer: 'ش' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটানো!', voiceText: 'শিন হরফের বুদবুদগুলো ফাটাও!', content: 'ش', options: ['س', 'ش', 'ص', 'ض'], correctAnswer: 'ش' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক হরফটি বেছে নাও', content: 'ش', options: ['س', 'ش', 'ص', 'ض'], correctAnswer: 'ش' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'হরফের সাথে শব্দ মেলাও', content: 'ش', options: ['س-سمكة', 'ش-شمس', 'ص-صقر', 'ض-ضفدع'], correctAnswer: 'ش' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি!', voiceText: 'শিন লেখা প্র্যাকটিস করো', content: 'ش' },
            { id: 'e10', type: 'quiz', title: 'সাবাশ! শেষ প্রশ্ন', voiceText: 'সূর্য বা শামস কোন হরফ দিয়ে শুরু?', content: 'ش', options: ['س', 'ش', 'ص', 'ض'], correctAnswer: 'ش' },
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