'use client'

import { useParams } from 'next/navigation'
import LessonEngine, { LessonConfig } from '@/components/kids/LessonEngine'

const lessons: Record<string, LessonConfig> = {
    'math-1': {
        id: 'math-1', letter: '১', word: 'এক', wordEn: 'One', emoji: '☝️',
        color: 'from-amber-400 to-orange-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: '১ মানে এক', content: '১' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — এক', voiceText: 'এক', content: 'এক' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: '১ মানে এক', content: '১' },
            { id: 'e4', type: 'tap-correct', title: '১ কোথায়?', voiceText: 'এক খুঁজে বের করো', content: '১', options: ['১', '২', '৩', '৪'], correctAnswer: '১' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক সংখ্যার বুদবুদ ফাটাও', content: '১', options: ['১', '২', '৩', '৪'], correctAnswer: '১' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক সংখ্যায় আঘাত করো', content: '১', options: ['১', '২', '৩', '৪'], correctAnswer: '১' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যা বেছে নাও', content: '১', options: ['১', '২', '৩', '৪'], correctAnswer: '১' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'সংখ্যা আর নাম মেলাও', content: '১', options: ['১-এক', '২-দুই', '৩-তিন', '৪-চার'], correctAnswer: '১' },
            { id: 'e9', type: 'trace', title: 'লিখি — ১', voiceText: 'এক লেখো', content: '১' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'এক আঙুল মানে কত?', content: '১', options: ['২', '১', '৩', '৪'], correctAnswer: '১' },
        ],
    },
    'math-2': {
        id: 'math-2', letter: '২', word: 'দুই', wordEn: 'Two', emoji: '✌️',
        color: 'from-rose-400 to-pink-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: '২ মানে দুই', content: '২' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — দুই', voiceText: 'দুই', content: 'দুই' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: '২ মানে দুই', content: '২' },
            { id: 'e4', type: 'tap-correct', title: '২ কোথায়?', voiceText: 'দুই খুঁজে বের করো', content: '২', options: ['১', '২', '৩', '৫'], correctAnswer: '২' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক সংখ্যার বুদবুদ ফাটাও', content: '২', options: ['১', '২', '৩', '৫'], correctAnswer: '২' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক সংখ্যায় আঘাত করো', content: '২', options: ['১', '২', '৩', '৫'], correctAnswer: '২' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যা বেছে নাও', content: '২', options: ['১', '২', '৩', '৫'], correctAnswer: '২' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'সংখ্যা আর নাম মেলাও', content: '২', options: ['১-এক', '২-দুই', '৩-তিন', '৪-চার'], correctAnswer: '২' },
            { id: 'e9', type: 'trace', title: 'লিখি — ২', voiceText: 'দুই লেখো', content: '২' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'দুটো চোখ মানে কত?', content: '২', options: ['১', '৩', '২', '৪'], correctAnswer: '২' },
        ],
    },
    'math-3': {
        id: 'math-3', letter: '৩', word: 'তিন', wordEn: 'Three', emoji: '🤟',
        color: 'from-violet-400 to-purple-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: '৩ মানে তিন', content: '৩' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — তিন', voiceText: 'তিন', content: 'তিন' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: '৩ মানে তিন', content: '৩' },
            { id: 'e4', type: 'tap-correct', title: '৩ কোথায়?', voiceText: 'তিন খুঁজে বের করো', content: '৩', options: ['২', '৩', '৪', '৬'], correctAnswer: '৩' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক সংখ্যার বুদবুদ ফাটাও', content: '৩', options: ['২', '৩', '৪', '৬'], correctAnswer: '৩' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক সংখ্যায় আঘাত করো', content: '৩', options: ['২', '৩', '৪', '৬'], correctAnswer: '৩' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যা বেছে নাও', content: '৩', options: ['২', '৩', '৪', '৬'], correctAnswer: '৩' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'সংখ্যা আর নাম মেলাও', content: '৩', options: ['১-এক', '২-দুই', '৩-তিন', '৪-চার'], correctAnswer: '৩' },
            { id: 'e9', type: 'trace', title: 'লিখি — ৩', voiceText: 'তিন লেখো', content: '৩' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'তিনটা আম মানে কত?', content: '৩', options: ['২', '৪', '৩', '৫'], correctAnswer: '৩' },
        ],
    },
    'math-4': {
        id: 'math-4', letter: '৪', word: 'চার', wordEn: 'Four', emoji: '🖖',
        color: 'from-blue-400 to-cyan-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: '৪ মানে চার', content: '৪' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — চার', voiceText: 'চার', content: 'চার' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: '৪ মানে চার', content: '৪' },
            { id: 'e4', type: 'tap-correct', title: '৪ কোথায়?', voiceText: 'চার খুঁজে বের করো', content: '৪', options: ['৩', '৪', '৫', '৭'], correctAnswer: '৪' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক সংখ্যার বুদবুদ ফাটাও', content: '৪', options: ['৩', '৪', '৫', '৭'], correctAnswer: '৪' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক সংখ্যায় আঘাত করো', content: '৪', options: ['৩', '৪', '৫', '৭'], correctAnswer: '৪' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যা বেছে নাও', content: '৪', options: ['৩', '৪', '৫', '৭'], correctAnswer: '৪' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'সংখ্যা আর নাম মেলাও', content: '৪', options: ['১-এক', '২-দুই', '৩-তিন', '৪-চার'], correctAnswer: '৪' },
            { id: 'e9', type: 'trace', title: 'লিখি — ৪', voiceText: 'চার লেখো', content: '৪' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'গাড়ির চাকা কয়টা?', content: '৪', options: ['৩', '৫', '৬', '৪'], correctAnswer: '৪' },
        ],
    },
    'math-5': {
        id: 'math-5', letter: '৫', word: 'পাঁচ', wordEn: 'Five', emoji: '🖐️',
        color: 'from-emerald-400 to-teal-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: '৫ মানে পাঁচ', content: '৫' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — পাঁচ', voiceText: 'পাঁচ', content: 'পাঁচ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: '৫ মানে পাঁচ', content: '৫' },
            { id: 'e4', type: 'tap-correct', title: '৫ কোথায়?', voiceText: 'পাঁচ খুঁজে বের করো', content: '৫', options: ['৪', '৫', '৬', '৮'], correctAnswer: '৫' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক সংখ্যার বুদবুদ ফাটাও', content: '৫', options: ['৪', '৫', '৬', '৮'], correctAnswer: '৫' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক সংখ্যায় আঘাত করো', content: '৫', options: ['৪', '৫', '৬', '৮'], correctAnswer: '৫' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যা বেছে নাও', content: '৫', options: ['৪', '৫', '৬', '৮'], correctAnswer: '৫' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'সংখ্যা আর নাম মেলাও', content: '৫', options: ['৫-পাঁচ', '৬-ছয়', '৭-সাত', '৮-আট'], correctAnswer: '৫' },
            { id: 'e9', type: 'trace', title: 'লিখি — ৫', voiceText: 'পাঁচ লেখো', content: '৫' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'এক হাতে কয়টা আঙুল?', content: '৫', options: ['৪', '৬', '৫', '৭'], correctAnswer: '৫' },
        ],
    },
    'math-6': {
        id: 'math-6', letter: '৬', word: 'ছয়', wordEn: 'Six', emoji: '🎲',
        color: 'from-lime-400 to-green-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: '৬ মানে ছয়', content: '৬' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ছয়', voiceText: 'ছয়', content: 'ছয়' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: '৬ মানে ছয়', content: '৬' },
            { id: 'e4', type: 'tap-correct', title: '৬ কোথায়?', voiceText: 'ছয় খুঁজে বের করো', content: '৬', options: ['৫', '৬', '৭', '৯'], correctAnswer: '৬' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক সংখ্যার বুদবুদ ফাটাও', content: '৬', options: ['৫', '৬', '৭', '৯'], correctAnswer: '৬' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক সংখ্যায় আঘাত করো', content: '৬', options: ['৫', '৬', '৭', '৯'], correctAnswer: '৬' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যা বেছে নাও', content: '৬', options: ['৫', '৬', '৭', '৯'], correctAnswer: '৬' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'সংখ্যা আর নাম মেলাও', content: '৬', options: ['৫-পাঁচ', '৬-ছয়', '৭-সাত', '৮-আট'], correctAnswer: '৬' },
            { id: 'e9', type: 'trace', title: 'লিখি — ৬', voiceText: 'ছয় লেখো', content: '৬' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'পোকার ছয়টা কী আছে?', content: '৬', options: ['৫', '৭', '৬', '৮'], correctAnswer: '৬' },
        ],
    },
    'math-7': {
        id: 'math-7', letter: '৭', word: 'সাত', wordEn: 'Seven', emoji: '🌈',
        color: 'from-red-400 to-rose-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: '৭ মানে সাত', content: '৭' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — সাত', voiceText: 'সাত', content: 'সাত' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: '৭ মানে সাত', content: '৭' },
            { id: 'e4', type: 'tap-correct', title: '৭ কোথায়?', voiceText: 'সাত খুঁজে বের করো', content: '৭', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৭' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক সংখ্যার বুদবুদ ফাটাও', content: '৭', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৭' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক সংখ্যায় আঘাত করো', content: '৭', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৭' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যা বেছে নাও', content: '৭', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৭' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'সংখ্যা আর নাম মেলাও', content: '৭', options: ['৫-পাঁচ', '৬-ছয়', '৭-সাত', '৮-আট'], correctAnswer: '৭' },
            { id: 'e9', type: 'trace', title: 'লিখি — ৭', voiceText: 'সাত লেখো', content: '৭' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'রংধনুতে কয়টা রং?', content: '৭', options: ['৬', '৮', '৭', '৯'], correctAnswer: '৭' },
        ],
    },
    'math-8': {
        id: 'math-8', letter: '৮', word: 'আট', wordEn: 'Eight', emoji: '🕷️',
        color: 'from-cyan-400 to-blue-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: '৮ মানে আট', content: '৮' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — আট', voiceText: 'আট', content: 'আট' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: '৮ মানে আট', content: '৮' },
            { id: 'e4', type: 'tap-correct', title: '৮ কোথায়?', voiceText: 'আট খুঁজে বের করো', content: '৮', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৮' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক সংখ্যার বুদবুদ ফাটাও', content: '৮', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৮' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক সংখ্যায় আঘাত করো', content: '৮', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৮' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যা বেছে নাও', content: '৮', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৮' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'সংখ্যা আর নাম মেলাও', content: '৮', options: ['৫-পাঁচ', '৬-ছয়', '৭-সাত', '৮-আট'], correctAnswer: '৮' },
            { id: 'e9', type: 'trace', title: 'লিখি — ৮', voiceText: 'আট লেখো', content: '৮' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'মাকড়সার কয়টা পা?', content: '৮', options: ['৬', '৭', '৮', '৯'], correctAnswer: '৮' },
        ],
    },
    'math-9': {
        id: 'math-9', letter: '৯', word: 'নয়', wordEn: 'Nine', emoji: '🌙',
        color: 'from-indigo-400 to-violet-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: '৯ মানে নয়', content: '৯' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — নয়', voiceText: 'নয়', content: 'নয়' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: '৯ মানে নয়', content: '৯' },
            { id: 'e4', type: 'tap-correct', title: '৯ কোথায়?', voiceText: 'নয় খুঁজে বের করো', content: '৯', options: ['৭', '৮', '৯', '১০'], correctAnswer: '৯' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক সংখ্যার বুদবুদ ফাটাও', content: '৯', options: ['৭', '৮', '৯', '১০'], correctAnswer: '৯' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক সংখ্যায় আঘাত করো', content: '৯', options: ['৭', '৮', '৯', '১০'], correctAnswer: '৯' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যা বেছে নাও', content: '৯', options: ['৭', '৮', '৯', '১০'], correctAnswer: '৯' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'সংখ্যা আর নাম মেলাও', content: '৯', options: ['৭-সাত', '৮-আট', '৯-নয়', '১০-দশ'], correctAnswer: '৯' },
            { id: 'e9', type: 'trace', title: 'লিখি — ৯', voiceText: 'নয় লেখো', content: '৯' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'দশের আগের সংখ্যা কত?', content: '৯', options: ['৭', '৮', '৯', '১০'], correctAnswer: '৯' },
        ],
    },
    'math-10': {
        id: 'math-10', letter: '১০', word: 'দশ', wordEn: 'Ten', emoji: '🔟',
        color: 'from-amber-400 to-orange-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: '১০ মানে দশ', content: '১০' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — দশ', voiceText: 'দশ', content: 'দশ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: '১০ মানে দশ', content: '১০' },
            { id: 'e4', type: 'tap-correct', title: '১০ কোথায়?', voiceText: 'দশ খুঁজে বের করো', content: '১০', options: ['৭', '৮', '৯', '১০'], correctAnswer: '১০' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সঠিক সংখ্যার বুদবুদ ফাটাও', content: '১০', options: ['৭', '৮', '৯', '১০'], correctAnswer: '১০' },
            { id: 'e6', type: 'archery-target', title: 'লক্ষ্যে আঘাত করো!', voiceText: 'সঠিক সংখ্যায় আঘাত করো', content: '১০', options: ['৭', '৮', '৯', '১০'], correctAnswer: '১০' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক সংখ্যা বেছে নাও', content: '১০', options: ['৭', '৮', '৯', '১০'], correctAnswer: '১০' },
            { id: 'e8', type: 'matching', title: 'মেলাও!', voiceText: 'সংখ্যা আর নাম মেলাও', content: '১০', options: ['৭-সাত', '৮-আট', '৯-নয়', '১০-দশ'], correctAnswer: '১০' },
            { id: 'e9', type: 'trace', title: 'লিখি — ১০', voiceText: 'দশ লেখো', content: '১০' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'দুই হাতে কয়টা আঙুল?', content: '১০', options: ['৮', '৯', '১০', '১১'], correctAnswer: '১০' },
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