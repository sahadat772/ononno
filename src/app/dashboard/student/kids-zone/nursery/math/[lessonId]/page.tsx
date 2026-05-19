'use client'

import { useParams } from 'next/navigation'
import LessonEngine, { LessonConfig } from '@/components/kids/LessonEngine'

const lessons: Record<string, LessonConfig> = {
    'math-1': {
        id: 'math-1', letter: '১', word: 'এক', wordEn: 'One', emoji: '☝️',
        color: 'from-amber-400 to-orange-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো এক (১) চিনি!', voiceText: 'এটি হলো এক। যেমন একটি সূর্য!', content: '১' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো দেখি— এক', voiceText: 'এক', content: 'এক' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: '১ — এক', content: '১' },
            { id: 'e4', type: 'tap-correct', title: '১ কোথায় বলো তো?', voiceText: 'এক নম্বরটি খুঁজে বের করো তো!', content: '১', options: ['১', '২', '৩', '৪'], correctAnswer: '১' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'এক লেখা বুদবুদটি ফাটিয়ে দাও!', content: '১', options: ['১', '২', '৩', '৪'], correctAnswer: '১' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যাটি বেছে নাও', content: '১', options: ['১', '২', '৩', '৪'], correctAnswer: '১' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'সংখ্যার সাথে নাম মিলিয়ে দাও', content: '১', options: ['১-এক', '২-দুই', '৩-তিন', '৪-চার'], correctAnswer: '১' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি!', voiceText: 'স্ক্রিনে হাত ঘষিয়ে এক লেখো', content: '১' },
            { id: 'e10', type: 'quiz', title: 'সাবাশ! শেষ প্রশ্ন', voiceText: 'তোমার এক হাতের একটি আঙুল মানে কত?', content: '১', options: ['২', '১', '৩', '৪'], correctAnswer: '১' },
        ],
    },
    'math-2': {
        id: 'math-2', letter: '২', word: 'দুই', wordEn: 'Two', emoji: '✌️',
        color: 'from-rose-400 to-pink-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো দুই (২) চিনি!', voiceText: 'এটি হলো দুই। যেমন আমাদের দুটি চোখ!', content: '২' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো দেখি— দুই', voiceText: 'দুই', content: 'দুই' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: '২ — দুই', content: '২' },
            { id: 'e4', type: 'tap-correct', title: '২ কোথায় বলো তো?', voiceText: 'দুই নম্বরটি খুঁজে বের করো তো!', content: '২', options: ['১', '২', '৩', '৫'], correctAnswer: '২' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'দুই লেখা বুদবুদটি ফাটিয়ে দাও!', content: '২', options: ['১', '২', '৩', '৫'], correctAnswer: '২' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যাটি বেছে নাও', content: '২', options: ['১', '২', '৩', '৫'], correctAnswer: '২' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'সংখ্যার সাথে নাম মিলিয়ে দাও', content: '২', options: ['১-এক', '২-দুই', '৩-তিন', '৪-চার'], correctAnswer: '২' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি!', voiceText: 'স্ক্রিনে হাত ঘষিয়ে দুই লেখো', content: '২' },
            { id: 'e10', type: 'quiz', title: 'বাহ! শেষ প্রশ্ন', voiceText: 'আমাদের দুটো চোখ মানে কত?', content: '২', options: ['১', '৩', '২', '৪'], correctAnswer: '২' },
        ],
    },
    'math-3': {
        id: 'math-3', letter: '৩', word: 'তিন', wordEn: 'Three', emoji: '🤟',
        color: 'from-violet-400 to-purple-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো তিন (৩) চিনি!', voiceText: 'এটি তিন! তিনের তিনটি কোনা আছে।', content: '৩' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — তিন', voiceText: 'তিন', content: 'তিন' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: '৩ — তিন', content: '৩' },
            { id: 'e4', type: 'tap-correct', title: '৩ কোথায়?', voiceText: 'তিন খুঁজে বের করো তো!', content: '৩', options: ['২', '৩', '৪', '৬'], correctAnswer: '৩' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'তিন লেখা বুদবুদটি ফাটাও!', content: '৩', options: ['২', '৩', '৪', '৬'], correctAnswer: '৩' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যাটি বেছে নাও', content: '৩', options: ['২', '৩', '৪', '৬'], correctAnswer: '৩' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'সংখ্যার সাথে নাম মেলাও', content: '৩', options: ['১-এক', '২-দুই', '৩-তিন', '৪-চার'], correctAnswer: '৩' },
            { id: 'e9', type: 'trace', title: 'লিখি — ৩', voiceText: 'তিন লেখা প্র্যাকটিস করো', content: '৩' },
            { id: 'e10', type: 'quiz', title: 'বাহ! শেষ প্রশ্ন', voiceText: 'তিনটি আম মানে কত?', content: '৩', options: ['২', '৪', '৩', '৫'], correctAnswer: '৩' },
        ],
    },
    'math-4': {
        id: 'math-4', letter: '৪', word: 'চার', wordEn: 'Four', emoji: '🖖',
        color: 'from-blue-400 to-cyan-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো চার (৪) চিনি!', voiceText: 'এটি চার! একটি গাড়ির চারটি চাকা থাকে।', content: '৪' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — চার', voiceText: 'চার', content: 'চার' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: '৪ — চার', content: '৪' },
            { id: 'e4', type: 'tap-correct', title: '৪ কোথায়?', voiceText: 'চার খুঁজে বের করো তো!', content: '৪', options: ['৩', '৪', '৫', '৭'], correctAnswer: '৪' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'চার লেখা বুদবুদটি ফাটাও!', content: '৪', options: ['৩', '৪', '৫', '৭'], correctAnswer: '৪' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যাটি বেছে নাও', content: '৪', options: ['৩', '৪', '৫', '৭'], correctAnswer: '৪' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'সংখ্যার সাথে নাম মেলাও', content: '৪', options: ['১-এক', '২-দুই', '৩-তিন', '৪-চার'], correctAnswer: '৪' },
            { id: 'e9', type: 'trace', title: 'লিখি — ৪', voiceText: 'চার লেখা প্র্যাকটিস করো', content: '৪' },
            { id: 'e10', type: 'quiz', title: 'সাবাশ! শেষ প্রশ্ন', voiceText: 'গাড়ির চাকা কয়টি?', content: '৪', options: ['৩', '৫', '৬', '৪'], correctAnswer: '৪' },
        ],
    },
    'math-5': {
        id: 'math-5', letter: '৫', word: 'পাঁচ', wordEn: 'Five', emoji: '🖐️',
        color: 'from-emerald-400 to-teal-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো পাঁচ (৫) চিনি!', voiceText: 'এটি পাঁচ! আমাদের এক হাতে পাঁচটি আঙুল।', content: '৫' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — পাঁচ', voiceText: 'পাঁচ', content: 'পাঁচ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: '৫ — পাঁচ', content: '৫' },
            { id: 'e4', type: 'tap-correct', title: '৫ কোথায়?', voiceText: 'পাঁচ খুঁজে বের করো তো!', content: '৫', options: ['৪', '৫', '৬', '৮'], correctAnswer: '৫' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'পাঁচ লেখা বুদবুদটি ফাটাও!', content: '৫', options: ['৪', '৫', '৬', '৮'], correctAnswer: '৫' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যাটি বেছে নাও', content: '৫', options: ['৪', '৫', '৬', '৮'], correctAnswer: '৫' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'সংখ্যার সাথে নাম মেলাও', content: '৫', options: ['৫-পাঁচ', '৬-ছয়', '৭-সাত', '৮-আট'], correctAnswer: '৫' },
            { id: 'e9', type: 'trace', title: 'লিখি — ৫', voiceText: 'পাঁচ লেখা প্র্যাকটিস করো', content: '৫' },
            { id: 'e10', type: 'quiz', title: 'চমৎকার! শেষ প্রশ্ন', voiceText: 'এক হাতে কয়টি আঙুল?', content: '৫', options: ['৪', '৬', '৫', '৭'], correctAnswer: '৫' },
        ],
    },
    'math-6': {
        id: 'math-6', letter: '৬', word: 'ছয়', wordEn: 'Six', emoji: '🎲',
        color: 'from-lime-400 to-green-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো ছয় (৬) চিনি!', voiceText: 'এটি ছয়! লুডুর ছক্কায় ছয়টি ফোটা থাকে।', content: '৬' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ছয়', voiceText: 'ছয়', content: 'ছয়' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: '৬ — ছয়', content: '৬' },
            { id: 'e4', type: 'tap-correct', title: '৬ কোথায়?', voiceText: 'ছয় খুঁজে বের করো তো!', content: '৬', options: ['৫', '৬', '৭', '৯'], correctAnswer: '৬' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ছয় লেখা বুদবুদটি ফাটাও!', content: '৬', options: ['৫', '৬', '৭', '৯'], correctAnswer: '৬' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যাটি বেছে নাও', content: '৬', options: ['৫', '৬', '৭', '৯'], correctAnswer: '৬' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'সংখ্যার সাথে নাম মেলাও', content: '৬', options: ['৫-পাঁচ', '৬-ছয়', '৭-সাত', '৮-আট'], correctAnswer: '৬' },
            { id: 'e9', type: 'trace', title: 'লিখি — ৬', voiceText: 'ছয় লেখা প্র্যাকটিস করো', content: '৬' },
            { id: 'e10', type: 'quiz', title: 'দারুণ! শেষ প্রশ্ন', voiceText: 'ছয় মানে কত?', content: '৬', options: ['৫', '৭', '৬', '৮'], correctAnswer: '৬' },
        ],
    },
    'math-7': {
        id: 'math-7', letter: '৭', word: 'সাত', wordEn: 'Seven', emoji: '🌈',
        color: 'from-red-400 to-rose-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো সাত (৭) চিনি!', voiceText: 'এটি সাত! রংধনুতে সাতটি রং থাকে।', content: '৭' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — সাত', voiceText: 'সাত', content: 'সাত' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: '৭ — সাত', content: '৭' },
            { id: 'e4', type: 'tap-correct', title: '৭ কোথায়?', voiceText: 'সাত খুঁজে বের করো তো!', content: '৭', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৭' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সাত লেখা বুদবুদটি ফাটাও!', content: '৭', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৭' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যাটি বেছে নাও', content: '৭', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৭' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'সংখ্যার সাথে নাম মেলাও', content: '৭', options: ['৫-পাঁচ', '৬-ছয়', '৭-সাত', '৮-আট'], correctAnswer: '৭' },
            { id: 'e9', type: 'trace', title: 'লিখি — ৭', voiceText: 'সাত লেখা প্র্যাকটিস করো', content: '৭' },
            { id: 'e10', type: 'quiz', title: 'চমৎকার! শেষ প্রশ্ন', voiceText: 'রংধনুতে কয়টি রং?', content: '৭', options: ['৬', '৮', '৭', '৯'], correctAnswer: '৭' },
        ],
    },
    'math-8': {
        id: 'math-8', letter: '৮', word: 'আট', wordEn: 'Eight', emoji: '🕷️',
        color: 'from-cyan-400 to-blue-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো আট (৮) চিনি!', voiceText: 'এটি আট! মাকড়সার আটটি পা থাকে।', content: '৮' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — আট', voiceText: 'আট', content: 'আট' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: '৮ — আট', content: '৮' },
            { id: 'e4', type: 'tap-correct', title: '৮ কোথায়?', voiceText: 'আট খুঁজে বের করো তো!', content: '৮', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৮' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'আট লেখা বুদবুদটি ফাটাও!', content: '৮', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৮' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যাটি বেছে নাও', content: '৮', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৮' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'সংখ্যার সাথে নাম মেলাও', content: '৮', options: ['৫-পাঁচ', '৬-ছয়', '৭-সাত', '৮-আট'], correctAnswer: '৮' },
            { id: 'e9', type: 'trace', title: 'লিখি — ৮', voiceText: 'আট লেখা প্র্যাকটিস করো', content: '৮' },
            { id: 'e10', type: 'quiz', title: 'সাবাশ! শেষ প্রশ্ন', voiceText: 'মাকড়সার কয়টি পা?', content: '৮', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৮' },
        ],
    },
    'math-9': {
        id: 'math-9', letter: '৯', word: 'নয়', wordEn: 'Nine', emoji: '🌙',
        color: 'from-indigo-400 to-violet-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো নয় (৯) চিনি!', voiceText: 'এটি নয়! রাতের আকাশে চাঁদ দেখেছো?', content: '৯' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — নয়', voiceText: 'নয়', content: 'নয়' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: '৯ — নয়', content: '৯' },
            { id: 'e4', type: 'tap-correct', title: '৯ কোথায়?', voiceText: 'নয় খুঁজে বের করো তো!', content: '৯', options: ['৭', '৮', '৯', '১০'], correctAnswer: '৯' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'নয় লেখা বুদবুদটি ফাটাও!', content: '৯', options: ['৭', '৮', '৯', '১০'], correctAnswer: '৯' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যাটি বেছে নাও', content: '৯', options: ['৭', '৮', '৯', '১০'], correctAnswer: '৯' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'সংখ্যার সাথে নাম মেলাও', content: '৯', options: ['৭-সাত', '৮-আট', '৯-নয়', '১০-দশ'], correctAnswer: '৯' },
            { id: 'e9', type: 'trace', title: 'লিখি — ৯', voiceText: 'নয় লেখা প্র্যাকটিস করো', content: '৯' },
            { id: 'e10', type: 'quiz', title: 'দারুণ! শেষ প্রশ্ন', voiceText: 'দশ-এর আগের সংখ্যা কত?', content: '৯', options: ['৭', '৮', '৯', '১০'], correctAnswer: '৯' },
        ],
    },
    'math-10': {
        id: 'math-10', letter: '১০', word: 'দশ', wordEn: 'Ten', emoji: '🔟',
        color: 'from-amber-400 to-orange-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো দশ (১০) চিনি!', voiceText: 'এটি দশ! দুই হাতে আমাদের দশটি আঙুল।', content: '১০' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — দশ', voiceText: 'দশ', content: 'দশ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: '১০ — দশ', content: '১০' },
            { id: 'e4', type: 'tap-correct', title: '১০ কোথায়?', voiceText: 'দশ খুঁজে বের করো তো!', content: '১০', options: ['৭', '৮', '৯', '১০'], correctAnswer: '১০' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'দশ লেখা বুদবুদটি ফাটাও!', content: '১০', options: ['৭', '৮', '৯', '১০'], correctAnswer: '১০' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যাটি বেছে নাও', content: '১০', options: ['৭', '৮', '৯', '১০'], correctAnswer: '১০' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'সংখ্যার সাথে নাম মেলাও', content: '১০', options: ['৭-সাত', '৮-আট', '৯-নয়', '১০-দশ'], correctAnswer: '১০' },
            { id: 'e9', type: 'trace', title: 'লিখি — ১০', voiceText: 'দশ লেখা প্র্যাকটিস করো', content: '১০' },
            { id: 'e10', type: 'quiz', title: 'সাবাশ! শেষ প্রশ্ন', voiceText: 'দুই হাতে কয়টি আঙুল?', content: '১০', options: ['৮', '৯', '১০', '১১'], correctAnswer: '১০' },
        ],
    },
}

export default function MathLessonPage() {
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