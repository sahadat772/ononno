'use client'

import { useParams } from 'next/navigation'
import LessonEngine, { LessonConfig } from '@/components/kids/LessonEngine'

const lessons: Record<string, LessonConfig> = {

    // ─── স্বরবর্ণ ───────────────────────────────────────────────
    'swarabarna-a': {
        id: 'swarabarna-a',
        letter: 'অ',
        word: 'অজগর',
        wordEn: 'Python',
        emoji: '🐍',
        color: 'from-red-400 to-rose-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: 'চলো আজ অ শিখি!',
                voiceText: 'একদিন রিমা বনে ঘুরতে গিয়ে একটি বড় অজগর দেখল। অজগর শব্দটি অ দিয়ে শুরু হয়। আজ আমরা অ শিখব।',
                content: 'অ'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'আমার সাথে বলো',
                voiceText: 'অ... অজগর',
                content: 'অজগর'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো বন্ধু!',
                voiceText: 'অ',
                content: 'অ'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: 'অ কোথায়?',
                voiceText: 'অ বর্ণটি খুঁজে বের করো।',
                content: 'অ',
                options: ['অ', 'আ', 'ই', 'ক'],
                correctAnswer: 'অ'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'অ ধরো!',
                voiceText: 'অ লেখা বুদবুদটি ফাটাও।',
                content: 'অ',
                options: ['অ', 'আ', 'ই', 'ক'],
                correctAnswer: 'অ'
            },

            {
                id: 'e6',
                type: 'letter-puzzle',
                title: 'অজগর কোন বর্ণ দিয়ে শুরু?',
                voiceText: 'অজগরের প্রথম বর্ণটি বেছে নাও।',
                content: 'অ',
                options: ['অ', 'আ', 'ই', 'উ'],
                correctAnswer: 'অ'
            },

            {
                id: 'e7',
                type: 'word-builder',
                title: 'শব্দ সাজাও',
                voiceText: 'অজগর শব্দটি সাজাও।',
                content: 'অজগর',
                options: ['অ', 'জ', 'গ', 'র'],
                correctAnswer: 'অজগর'
            },

            {
                id: 'e8',
                type: 'matching',
                title: 'জোড়া মেলাও',
                voiceText: 'বর্ণের সাথে শব্দ মিলিয়ে দাও।',
                content: 'অ',
                options: [
                    'অ-অজগর',
                    'আ-আম',
                    'ই-ইলিশ',
                    'ঈ-ঈগল'
                ],
                correctAnswer: 'অ'
            },

            {
                id: 'e9',
                type: 'trace',
                title: 'চলো লিখি',
                voiceText: 'এবার সুন্দর করে অ লেখো।',
                content: 'অ'
            },

            {
                id: 'e10',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'অজগর কোন বর্ণ দিয়ে শুরু হয়?',
                content: 'অ',
                options: ['আ', 'অ', 'ই', 'উ'],
                correctAnswer: 'অ'
            },
        ],
    },
    'swarabarna-aa': {
        id: 'swarabarna-aa',
        letter: 'আ',
        word: 'আম',
        wordEn: 'Mango',
        emoji: '🥭',
        color: 'from-yellow-400 to-orange-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: 'চলো আজ আ শিখি!',
                voiceText: 'গরমের দিনে রিফাত গাছ থেকে একটি মিষ্টি আম পাড়ল। আম শব্দটি আ দিয়ে শুরু হয়। আজ আমরা আ শিখব।',
                content: 'আ'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'আমার সাথে বলো',
                voiceText: 'আ... আম',
                content: 'আম'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো বন্ধু!',
                voiceText: 'আ',
                content: 'আ'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: 'আ কোথায়?',
                voiceText: 'আ বর্ণটি খুঁজে বের করো।',
                content: 'আ',
                options: ['অ', 'আ', 'ই', 'ঈ'],
                correctAnswer: 'আ'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'আম ধরো!',
                voiceText: 'আ লেখা বুদবুদটি ফাটাও।',
                content: 'আ',
                options: ['অ', 'আ', 'ই', 'ঈ'],
                correctAnswer: 'আ'
            },

            {
                id: 'e6',
                type: 'letter-puzzle',
                title: 'আম কোন বর্ণ দিয়ে শুরু?',
                voiceText: 'আমের প্রথম বর্ণটি বেছে নাও।',
                content: 'আ',
                options: ['অ', 'আ', 'ই', 'ঈ'],
                correctAnswer: 'আ'
            },

            {
                id: 'e7',
                type: 'word-builder',
                title: 'শব্দ সাজাও',
                voiceText: 'আম শব্দটি সাজাও।',
                content: 'আম',
                options: ['আ', 'ম'],
                correctAnswer: 'আম'
            },

            {
                id: 'e8',
                type: 'matching',
                title: 'জোড়া মেলাও',
                voiceText: 'বর্ণের সাথে শব্দ মিলিয়ে দাও।',
                content: 'আ',
                options: ['অ-অজগর', 'আ-আম', 'ই-ইলিশ', 'ঈ-ঈদ'],
                correctAnswer: 'আ'
            },

            {
                id: 'e9',
                type: 'trace',
                title: 'চলো লিখি',
                voiceText: 'এবার সুন্দর করে আ লেখো।',
                content: 'আ'
            },

            {
                id: 'e10',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'আম কোন বর্ণ দিয়ে শুরু হয়?',
                content: 'আ',
                options: ['অ', 'আ', 'ই', 'ঈ'],
                correctAnswer: 'আ'
            },
        ],
    },

    'swarabarna-i': {
        id: 'swarabarna-i',
        letter: 'ই',
        word: 'ইলিশ',
        wordEn: 'Hilsa',
        emoji: '🐟',
        color: 'from-cyan-400 to-blue-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: 'চলো আজ ই শিখি!',
                voiceText: 'বাংলাদেশের জাতীয় মাছ ইলিশ। ইলিশ শব্দটি ই দিয়ে শুরু হয়। আজ আমরা ই শিখব।',
                content: 'ই'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'আমার সাথে বলো',
                voiceText: 'ই... ইলিশ',
                content: 'ইলিশ'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো বন্ধু!',
                voiceText: 'ই',
                content: 'ই'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: 'ই কোথায়?',
                voiceText: 'ই বর্ণটি খুঁজে বের করো।',
                content: 'ই',
                options: ['আ', 'ই', 'ঈ', 'উ'],
                correctAnswer: 'ই'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'ই ধরো!',
                voiceText: 'ই লেখা বুদবুদটি ফাটাও।',
                content: 'ই',
                options: ['আ', 'ই', 'ঈ', 'উ'],
                correctAnswer: 'ই'
            },

            {
                id: 'e6',
                type: 'letter-puzzle',
                title: 'ইলিশ কোন বর্ণ দিয়ে শুরু?',
                voiceText: 'ইলিশের প্রথম বর্ণটি বেছে নাও।',
                content: 'ই',
                options: ['আ', 'ই', 'ঈ', 'উ'],
                correctAnswer: 'ই'
            },

            {
                id: 'e7',
                type: 'word-builder',
                title: 'শব্দ সাজাও',
                voiceText: 'ইলিশ শব্দটি সাজাও।',
                content: 'ইলিশ',
                options: ['ই', 'ল', 'ি', 'শ'],
                correctAnswer: 'ইলিশ'
            },

            {
                id: 'e8',
                type: 'matching',
                title: 'জোড়া মেলাও',
                voiceText: 'বর্ণের সাথে শব্দ মিলিয়ে দাও।',
                content: 'ই',
                options: ['আ-আম', 'ই-ইলিশ', 'ঈ-ঈদ', 'উ-উট'],
                correctAnswer: 'ই'
            },

            {
                id: 'e9',
                type: 'trace',
                title: 'চলো লিখি',
                voiceText: 'এবার সুন্দর করে ই লেখো।',
                content: 'ই'
            },

            {
                id: 'e10',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'ইলিশ কোন বর্ণ দিয়ে শুরু হয়?',
                content: 'ই',
                options: ['আ', 'ই', 'ঈ', 'উ'],
                correctAnswer: 'ই'
            },
        ],
    },

    'swarabarna-ii': {
        id: 'swarabarna-ii',
        letter: 'ঈ',
        word: 'ঈদ',
        wordEn: 'Eid',
        emoji: '🌙',
        color: 'from-emerald-400 to-green-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: 'চলো আজ ঈ শিখি!',
                voiceText: 'ঈদের দিনে সবাই নতুন জামা পরে আনন্দ করে। ঈদ শব্দটি ঈ দিয়ে শুরু হয়। আজ আমরা ঈ শিখব।',
                content: 'ঈ'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'আমার সাথে বলো',
                voiceText: 'ঈ... ঈদ',
                content: 'ঈদ'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো বন্ধু!',
                voiceText: 'ঈ',
                content: 'ঈ'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: 'ঈ কোথায়?',
                voiceText: 'ঈ বর্ণটি খুঁজে বের করো।',
                content: 'ঈ',
                options: ['ই', 'ঈ', 'উ', 'ঊ'],
                correctAnswer: 'ঈ'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'ঈ ধরো!',
                voiceText: 'ঈ লেখা বুদবুদটি ফাটাও।',
                content: 'ঈ',
                options: ['ই', 'ঈ', 'উ', 'ঊ'],
                correctAnswer: 'ঈ'
            },

            {
                id: 'e6',
                type: 'letter-puzzle',
                title: 'ঈদ কোন বর্ণ দিয়ে শুরু?',
                voiceText: 'ঈদের প্রথম বর্ণটি বেছে নাও।',
                content: 'ঈ',
                options: ['ই', 'ঈ', 'উ', 'ঊ'],
                correctAnswer: 'ঈ'
            },

            {
                id: 'e7',
                type: 'word-builder',
                title: 'শব্দ সাজাও',
                voiceText: 'ঈদ শব্দটি সাজাও।',
                content: 'ঈদ',
                options: ['ঈ', 'দ'],
                correctAnswer: 'ঈদ'
            },

            {
                id: 'e8',
                type: 'matching',
                title: 'জোড়া মেলাও',
                voiceText: 'বর্ণের সাথে শব্দ মিলিয়ে দাও।',
                content: 'ঈ',
                options: ['ই-ইলিশ', 'ঈ-ঈদ', 'উ-উট', 'আ-আম'],
                correctAnswer: 'ঈ'
            },

            {
                id: 'e9',
                type: 'trace',
                title: 'চলো লিখি',
                voiceText: 'এবার সুন্দর করে ঈ লেখো।',
                content: 'ঈ'
            },

            {
                id: 'e10',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'ঈদ কোন বর্ণ দিয়ে শুরু হয়?',
                content: 'ঈ',
                options: ['ই', 'ঈ', 'উ', 'ঊ'],
                correctAnswer: 'ঈ'
            },
        ],
    },

    'swarabarna-u': {
        id: 'swarabarna-u',
        letter: 'উ',
        word: 'উট',
        wordEn: 'Camel',
        emoji: '🐪',
        color: 'from-orange-400 to-amber-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: 'চলো আজ উ শিখি!',
                voiceText: 'মরুভূমিতে উট মানুষের বন্ধু। উট শব্দটি উ দিয়ে শুরু হয়। আজ আমরা উ শিখব।',
                content: 'উ'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'আমার সাথে বলো',
                voiceText: 'উ... উট',
                content: 'উট'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো বন্ধু!',
                voiceText: 'উ',
                content: 'উ'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: 'উ কোথায়?',
                voiceText: 'উ বর্ণটি খুঁজে বের করো।',
                content: 'উ',
                options: ['ঈ', 'উ', 'ঊ', 'এ'],
                correctAnswer: 'উ'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'উ ধরো!',
                voiceText: 'উ লেখা বুদবুদটি ফাটাও।',
                content: 'উ',
                options: ['ঈ', 'উ', 'ঊ', 'এ'],
                correctAnswer: 'উ'
            },

            {
                id: 'e6',
                type: 'letter-puzzle',
                title: 'উট কোন বর্ণ দিয়ে শুরু?',
                voiceText: 'উটের প্রথম বর্ণটি বেছে নাও।',
                content: 'উ',
                options: ['ঈ', 'উ', 'ঊ', 'এ'],
                correctAnswer: 'উ'
            },

            {
                id: 'e7',
                type: 'word-builder',
                title: 'শব্দ সাজাও',
                voiceText: 'উট শব্দটি সাজাও।',
                content: 'উট',
                options: ['উ', 'ট'],
                correctAnswer: 'উট'
            },

            {
                id: 'e8',
                type: 'matching',
                title: 'জোড়া মেলাও',
                voiceText: 'বর্ণের সাথে শব্দ মিলিয়ে দাও।',
                content: 'উ',
                options: ['ঈ-ঈদ', 'উ-উট', 'আ-আম', 'ই-ইলিশ'],
                correctAnswer: 'উ'
            },

            {
                id: 'e9',
                type: 'trace',
                title: 'চলো লিখি',
                voiceText: 'এবার সুন্দর করে উ লেখো।',
                content: 'উ'
            },

            {
                id: 'e10',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'উট কোন বর্ণ দিয়ে শুরু হয়?',
                content: 'উ',
                options: ['ঈ', 'উ', 'ঊ', 'এ'],
                correctAnswer: 'উ'
            },
        ],
    },
    'swarabarna-uu': {
        id: 'swarabarna-uu', letter: 'ঊ', word: 'ঊষা', wordEn: 'Dawn', emoji: '🌅',
        color: 'from-red-400 to-rose-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঊ দিয়ে ঊষা', content: 'ঊ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ঊষা', voiceText: 'ঊষা', content: 'ঊষা' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঊ', content: 'ঊ' },
            { id: 'e4', type: 'tap-correct', title: 'ঊ কোথায়?', voiceText: 'ঊ খুঁজে বের করো', content: 'ঊ', options: ['উ', 'ঊ', 'ঋ', 'এ'], correctAnswer: 'ঊ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ঊ বুদবুদ ফাটাও', content: 'ঊ', options: ['উ', 'ঊ', 'ঋ', 'এ'], correctAnswer: 'ঊ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ঊ', options: ['উ', 'ঊ', 'ঋ', 'এ'], correctAnswer: 'ঊ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ঊষা বানাও', content: 'ঊষা', options: ['ঊ', 'ষ', 'া', 'ম'], correctAnswer: 'ঊষা' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ঊ', options: ['ঈ-ঈগল', 'উ-উট', 'ঊ-ঊষা', 'ঋ-ঋষি'], correctAnswer: 'ঊ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঊ', voiceText: 'ঊ লেখো', content: 'ঊ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ঊষা কোন বর্ণ দিয়ে শুরু?', content: 'ঊ', options: ['উ', 'ঊ', 'ঋ', 'এ'], correctAnswer: 'ঊ' },
        ],
    },
    'swarabarna-ri': {
        id: 'swarabarna-ri', letter: 'ঋ', word: 'ঋষি', wordEn: 'Sage', emoji: '📿',
        color: 'from-violet-400 to-purple-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঋ দিয়ে ঋষি', content: 'ঋ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ঋষি', voiceText: 'ঋষি', content: 'ঋষি' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঋ', content: 'ঋ' },
            { id: 'e4', type: 'tap-correct', title: 'ঋ কোথায়?', voiceText: 'ঋ খুঁজে বের করো', content: 'ঋ', options: ['ঊ', 'ঋ', 'এ', 'ঐ'], correctAnswer: 'ঋ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ঋ বুদবুদ ফাটাও', content: 'ঋ', options: ['ঊ', 'ঋ', 'এ', 'ঐ'], correctAnswer: 'ঋ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ঋ', options: ['ঊ', 'ঋ', 'এ', 'ঐ'], correctAnswer: 'ঋ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ঋষি বানাও', content: 'ঋষি', options: ['ঋ', 'ষ', 'ি', 'ম'], correctAnswer: 'ঋষি' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ঋ', options: ['উ-উট', 'ঊ-ঊষা', 'ঋ-ঋষি', 'এ-একতারা'], correctAnswer: 'ঋ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঋ', voiceText: 'ঋ লেখো', content: 'ঋ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ঋষি কোন বর্ণ দিয়ে শুরু?', content: 'ঋ', options: ['উ', 'ঊ', 'ঋ', 'এ'], correctAnswer: 'ঋ' },
        ],
    },
    'swarabarna-e': {
        id: 'swarabarna-e', letter: 'এ', word: 'একতারা', wordEn: 'Ektara', emoji: '🪕',
        color: 'from-lime-400 to-green-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'এ দিয়ে একতারা', content: 'এ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — একতারা', voiceText: 'একতারা', content: 'একতারা' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'এ', content: 'এ' },
            { id: 'e4', type: 'tap-correct', title: 'এ কোথায়?', voiceText: 'এ খুঁজে বের করো', content: 'এ', options: ['ঋ', 'এ', 'ঐ', 'ও'], correctAnswer: 'এ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'এ বুদবুদ ফাটাও', content: 'এ', options: ['ঋ', 'এ', 'ঐ', 'ও'], correctAnswer: 'এ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'এ', options: ['ঋ', 'এ', 'ঐ', 'ও'], correctAnswer: 'এ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'একতারা বানাও', content: 'একতারা', options: ['এ', 'ক', 'তা', 'রা'], correctAnswer: 'একতারা' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'এ', options: ['ঊ-ঊষা', 'ঋ-ঋষি', 'এ-একতারা', 'ঐ-ঐরাবত'], correctAnswer: 'এ' },
            { id: 'e10', type: 'trace', title: 'লিখি — এ', voiceText: 'এ লেখো', content: 'এ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'একতারা কোন বর্ণ দিয়ে শুরু?', content: 'এ', options: ['ঋ', 'এ', 'ঐ', 'ও'], correctAnswer: 'এ' },
        ],
    },
    'swarabarna-oi': {
        id: 'swarabarna-oi', letter: 'ঐ', word: 'ঐরাবত', wordEn: 'Elephant', emoji: '🐘',
        color: 'from-cyan-400 to-blue-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঐ দিয়ে ঐরাবত', content: 'ঐ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ঐরাবত', voiceText: 'ঐরাবত', content: 'ঐরাবত' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঐ', content: 'ঐ' },
            { id: 'e4', type: 'tap-correct', title: 'ঐ কোথায়?', voiceText: 'ঐ খুঁজে বের করো', content: 'ঐ', options: ['এ', 'ঐ', 'ও', 'ঔ'], correctAnswer: 'ঐ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ঐ বুদবুদ ফাটাও', content: 'ঐ', options: ['এ', 'ঐ', 'ও', 'ঔ'], correctAnswer: 'ঐ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ঐ', options: ['এ', 'ঐ', 'ও', 'ঔ'], correctAnswer: 'ঐ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ঐরাবত বানাও', content: 'ঐরাবত', options: ['ঐ', 'রা', 'ব', 'ত'], correctAnswer: 'ঐরাবত' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ঐ', options: ['ঋ-ঋষি', 'এ-একতারা', 'ঐ-ঐরাবত', 'ও-ওজন'], correctAnswer: 'ঐ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঐ', voiceText: 'ঐ লেখো', content: 'ঐ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ঐরাবত কোন বর্ণ দিয়ে শুরু?', content: 'ঐ', options: ['এ', 'ঐ', 'ও', 'উ'], correctAnswer: 'ঐ' },
        ],
    },
    'swarabarna-o': {
        id: 'swarabarna-o', letter: 'ও', word: 'ওল', wordEn: 'Yam', emoji: '🌿',
        color: 'from-orange-400 to-red-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ও দিয়ে ওল', content: 'ও' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ওল', voiceText: 'ওল', content: 'ওল' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ও', content: 'ও' },
            { id: 'e4', type: 'tap-correct', title: 'ও কোথায়?', voiceText: 'ও খুঁজে বের করো', content: 'ও', options: ['ঐ', 'ও', 'ঔ', 'ই'], correctAnswer: 'ও' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ও বুদবুদ ফাটাও', content: 'ও', options: ['ঐ', 'ও', 'ঔ', 'ই'], correctAnswer: 'ও' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ও', options: ['ঐ', 'ও', 'ঔ', 'ই'], correctAnswer: 'ও' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ওল বানাও', content: 'ওল', options: ['ও', 'ল', 'ম', 'ন'], correctAnswer: 'ওল' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ও', options: ['এ-একতারা', 'ঐ-ঐরাবত', 'ও-ওল', 'ঔ-ঔষধ'], correctAnswer: 'ও' },
            { id: 'e10', type: 'trace', title: 'লিখি — ও', voiceText: 'ও লেখো', content: 'ও' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ওল কোন বর্ণ দিয়ে শুরু?', content: 'ও', options: ['ঐ', 'ও', 'ঔ', 'আ'], correctAnswer: 'ও' },
        ],
    },
    'swarabarna-ou': {
        id: 'swarabarna-ou', letter: 'ঔ', word: 'ঔষধ', wordEn: 'Medicine', emoji: '💊',
        color: 'from-pink-400 to-rose-600', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঔ দিয়ে ঔষধ', content: 'ঔ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ঔষধ', voiceText: 'ঔষধ', content: 'ঔষধ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঔ', content: 'ঔ' },
            { id: 'e4', type: 'tap-correct', title: 'ঔ কোথায়?', voiceText: 'ঔ খুঁজে বের করো', content: 'ঔ', options: ['ঐ', 'ও', 'ঔ', 'উ'], correctAnswer: 'ঔ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ঔ বুদবুদ ফাটাও', content: 'ঔ', options: ['ঐ', 'ও', 'ঔ', 'উ'], correctAnswer: 'ঔ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ঔ', options: ['ঐ', 'ও', 'ঔ', 'উ'], correctAnswer: 'ঔ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ঔষধ বানাও', content: 'ঔষধ', options: ['ঔ', 'ষ', 'ধ', 'ম'], correctAnswer: 'ঔষধ' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ঔ', options: ['ঐ-ঐরাবত', 'ও-ওল', 'ঔ-ঔষধ', 'ই-ইলিশ'], correctAnswer: 'ঔ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঔ', voiceText: 'ঔ লেখো', content: 'ঔ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ঔষধ কোন বর্ণ দিয়ে শুরু?', content: 'ঔ', options: ['ঐ', 'ও', 'ঔ', 'এ'], correctAnswer: 'ঔ' },
        ],
    },

    // ─── ব্যঞ্জনবর্ণ ─────────────────────────────────────────────
    'banjonborno-ka': {
        id: 'banjonborno-ka',
        letter: 'ক',
        word: 'কাক',
        wordEn: 'Crow',
        emoji: '🐦',
        color: 'from-slate-500 to-gray-700',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',

        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো আজ ক শিখি!', voiceText: 'সকালে কাক কা কা করে ডাকছে। কাক শব্দটি ক দিয়ে শুরু হয়।', content: 'ক' },
            { id: 'e2', type: 'listen-repeat', title: 'আমার সাথে বলো', voiceText: 'ক... কাক', content: 'কাক' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ক', content: 'ক' },
            { id: 'e4', type: 'tap-correct', title: 'ক কোথায়?', voiceText: 'ক বর্ণটি খুঁজে বের করো।', content: 'ক', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'ক' },
            { id: 'e5', type: 'bubble-pop', title: 'ক ধরো!', voiceText: 'ক লেখা বুদবুদটি ফাটাও।', content: 'ক', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'ক' },
            { id: 'e6', type: 'letter-puzzle', title: 'কাক কোন বর্ণ দিয়ে শুরু?', voiceText: 'কাকের প্রথম বর্ণটি বেছে নাও।', content: 'ক', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'ক' },
            { id: 'e7', type: 'word-builder', title: 'শব্দ সাজাও', voiceText: 'কাক শব্দটি সাজাও।', content: 'কাক', options: ['ক', 'া', 'ক'], correctAnswer: 'কাক' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'বর্ণের সাথে শব্দ মিলাও।', content: 'ক', options: ['ক-কাক', 'খ-খরগোশ', 'গ-গরু', 'ঘ-ঘুড়ি'], correctAnswer: 'ক' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি', voiceText: 'সুন্দর করে ক লেখো।', content: 'ক' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন', voiceText: 'কাক কোন বর্ণ দিয়ে শুরু হয়?', content: 'ক', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'ক' },
        ],
    },
    'banjonborno-kha': {
        id: 'banjonborno-kha',
        letter: 'খ',
        word: 'খরগোশ',
        wordEn: 'Rabbit',
        emoji: '🐇',
        color: 'from-pink-400 to-rose-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',

        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো আজ খ শিখি!', voiceText: 'ছোট্ট খরগোশ লাফিয়ে লাফিয়ে দৌড়ায়। খরগোশ শব্দটি খ দিয়ে শুরু হয়।', content: 'খ' },
            { id: 'e2', type: 'listen-repeat', title: 'আমার সাথে বলো', voiceText: 'খ... খরগোশ', content: 'খরগোশ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'খ', content: 'খ' },
            { id: 'e4', type: 'tap-correct', title: 'খ কোথায়?', voiceText: 'খ বর্ণটি খুঁজে বের করো।', content: 'খ', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'খ' },
            { id: 'e5', type: 'bubble-pop', title: 'খ ধরো!', voiceText: 'খ লেখা বুদবুদটি ফাটাও।', content: 'খ', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'খ' },
            { id: 'e6', type: 'letter-puzzle', title: 'খরগোশ কোন বর্ণ দিয়ে শুরু?', voiceText: 'প্রথম বর্ণটি বেছে নাও।', content: 'খ', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'খ' },
            { id: 'e7', type: 'word-builder', title: 'শব্দ সাজাও', voiceText: 'খরগোশ সাজাও।', content: 'খরগোশ', options: ['খ', 'র', 'গ', 'ো', 'শ'], correctAnswer: 'খরগোশ' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'মিলিয়ে দাও।', content: 'খ', options: ['ক-কাক', 'খ-খরগোশ', 'গ-গরু', 'ঘ-ঘুড়ি'], correctAnswer: 'খ' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি', voiceText: 'খ লেখো।', content: 'খ' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন', voiceText: 'খরগোশ কোন বর্ণ দিয়ে শুরু?', content: 'খ', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'খ' },
        ],
    },
    'banjonborno-ga': {
        id: 'banjonborno-ga',
        letter: 'গ',
        word: 'গরু',
        wordEn: 'Cow',
        emoji: '🐄',
        color: 'from-green-400 to-emerald-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',

        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো আজ গ শিখি!', voiceText: 'মাঠে গরু ঘাস খাচ্ছে। গরু শব্দটি গ দিয়ে শুরু হয়।', content: 'গ' },
            { id: 'e2', type: 'listen-repeat', title: 'আমার সাথে বলো', voiceText: 'গ... গরু', content: 'গরু' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'গ', content: 'গ' },
            { id: 'e4', type: 'tap-correct', title: 'গ কোথায়?', voiceText: 'গ খুঁজে বের করো।', content: 'গ', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'গ' },
            { id: 'e5', type: 'bubble-pop', title: 'গ ধরো!', voiceText: 'গ লেখা বুদবুদটি ফাটাও।', content: 'গ', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'গ' },
            { id: 'e6', type: 'letter-puzzle', title: 'গরু কোন বর্ণ দিয়ে শুরু?', voiceText: 'সঠিক বর্ণটি বেছে নাও।', content: 'গ', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'গ' },
            { id: 'e7', type: 'word-builder', title: 'শব্দ সাজাও', voiceText: 'গরু সাজাও।', content: 'গরু', options: ['গ', 'র', 'ু'], correctAnswer: 'গরু' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'বর্ণের সাথে শব্দ মিলাও।', content: 'গ', options: ['ক-কাক', 'খ-খরগোশ', 'গ-গরু', 'ঘ-ঘুড়ি'], correctAnswer: 'গ' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি', voiceText: 'গ লেখো।', content: 'গ' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন', voiceText: 'গরু কোন বর্ণ দিয়ে শুরু?', content: 'গ', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'গ' },
        ],
    },
    'banjonborno-gha': {
        id: 'banjonborno-gha',
        letter: 'ঘ',
        word: 'ঘুড়ি',
        wordEn: 'Kite',
        emoji: '🪁',
        color: 'from-sky-400 to-cyan-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',

        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো আজ ঘ শিখি!', voiceText: 'নীল আকাশে রঙিন ঘুড়ি উড়ছে। ঘুড়ি শব্দটি ঘ দিয়ে শুরু হয়।', content: 'ঘ' },
            { id: 'e2', type: 'listen-repeat', title: 'আমার সাথে বলো', voiceText: 'ঘ... ঘুড়ি', content: 'ঘুড়ি' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঘ', content: 'ঘ' },
            { id: 'e4', type: 'tap-correct', title: 'ঘ কোথায়?', voiceText: 'ঘ খুঁজে বের করো।', content: 'ঘ', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'ঘ' },
            { id: 'e5', type: 'bubble-pop', title: 'ঘ ধরো!', voiceText: 'ঘ লেখা বুদবুদটি ফাটাও।', content: 'ঘ', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'ঘ' },
            { id: 'e6', type: 'letter-puzzle', title: 'ঘুড়ি কোন বর্ণ দিয়ে শুরু?', voiceText: 'প্রথম বর্ণটি বেছে নাও।', content: 'ঘ', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'ঘ' },
            { id: 'e7', type: 'word-builder', title: 'শব্দ সাজাও', voiceText: 'ঘুড়ি সাজাও।', content: 'ঘুড়ি', options: ['ঘ', 'ু', 'ড়', 'ি'], correctAnswer: 'ঘুড়ি' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'বর্ণের সাথে শব্দ মিলাও।', content: 'ঘ', options: ['ক-কাক', 'খ-খরগোশ', 'গ-গরু', 'ঘ-ঘুড়ি'], correctAnswer: 'ঘ' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি', voiceText: 'ঘ লেখো।', content: 'ঘ' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন', voiceText: 'ঘুড়ি কোন বর্ণ দিয়ে শুরু?', content: 'ঘ', options: ['ক', 'খ', 'গ', 'ঘ'], correctAnswer: 'ঘ' },
        ],
    },
    'banjonborno-nga': {
        id: 'banjonborno-nga',
        letter: 'ঙ',
        word: 'ঙ',
        wordEn: 'Nga',
        emoji: '🔤',
        color: 'from-indigo-400 to-violet-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',

        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো আজ ঙ শিখি!', voiceText: 'আজ আমরা নতুন একটি বর্ণ শিখব। এর নাম ঙ।', content: 'ঙ' },
            { id: 'e2', type: 'listen-repeat', title: 'আমার সাথে বলো', voiceText: 'ঙ', content: 'ঙ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঙ', content: 'ঙ' },
            { id: 'e4', type: 'tap-correct', title: 'ঙ কোথায়?', voiceText: 'ঙ বর্ণটি খুঁজে বের করো।', content: 'ঙ', options: ['ঘ', 'ঙ', 'চ', 'ছ'], correctAnswer: 'ঙ' },
            { id: 'e5', type: 'bubble-pop', title: 'ঙ ধরো!', voiceText: 'ঙ লেখা বুদবুদটি ফাটাও।', content: 'ঙ', options: ['ঘ', 'ঙ', 'চ', 'ছ'], correctAnswer: 'ঙ' },
            { id: 'e6', type: 'letter-puzzle', title: 'সঠিক বর্ণ বেছে নাও', voiceText: 'ঙ বেছে নাও।', content: 'ঙ', options: ['ঘ', 'ঙ', 'চ', 'ছ'], correctAnswer: 'ঙ' },
            { id: 'e7', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'ঙ বর্ণের সাথে মিলাও।', content: 'ঙ', options: ['ঘ-ঘুড়ি', 'ঙ-ঙ', 'চ-চাল', 'ছ-ছাতা'], correctAnswer: 'ঙ' },
            { id: 'e8', type: 'trace', title: 'চলো লিখি', voiceText: 'এবার ঙ লেখো।', content: 'ঙ' },
            { id: 'e9', type: 'quiz', title: 'শেষ প্রশ্ন', voiceText: 'এটি কোন বর্ণ?', content: 'ঙ', options: ['ঘ', 'ঙ', 'চ', 'ছ'], correctAnswer: 'ঙ' },
        ],
    },
    'banjanbarna-cha': {
        id: 'banjanbarna-cha', letter: 'চ', word: 'চাঁদ', wordEn: 'Moon', emoji: '🌙',
        color: 'from-indigo-400 to-violet-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'চ দিয়ে চাঁদ', content: 'চ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — চাঁদ', voiceText: 'চাঁদ', content: 'চাঁদ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'চ', content: 'চ' },
            { id: 'e4', type: 'tap-correct', title: 'চ কোথায়?', voiceText: 'চ খুঁজে বের করো', content: 'চ', options: ['ঘ', 'চ', 'ছ', 'জ'], correctAnswer: 'চ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'চ বুদবুদ ফাটাও', content: 'চ', options: ['ঘ', 'চ', 'ছ', 'জ'], correctAnswer: 'চ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'চ', options: ['ঘ', 'চ', 'ছ', 'জ'], correctAnswer: 'চ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'চাঁদ বানাও', content: 'চাঁদ', options: ['চ', 'া', 'ঁ', 'দ'], correctAnswer: 'চাঁদ' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'চ', options: ['ঘ-ঘড়ি', 'চ-চাঁদ', 'ছ-ছাগল', 'জ-জাহাজ'], correctAnswer: 'চ' },
            { id: 'e10', type: 'trace', title: 'লিখি — চ', voiceText: 'চ লেখো', content: 'চ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'চাঁদ কোন বর্ণ দিয়ে শুরু?', content: 'চ', options: ['ঘ', 'চ', 'ছ', 'জ'], correctAnswer: 'চ' },
        ],
    },
    'banjanbarna-chha': {
        id: 'banjanbarna-chha', letter: 'ছ', word: 'ছাগল', wordEn: 'Goat', emoji: '🐐',
        color: 'from-teal-400 to-cyan-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ছ দিয়ে ছাগল', content: 'ছ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ছাগল', voiceText: 'ছাগল', content: 'ছাগল' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ছ', content: 'ছ' },
            { id: 'e4', type: 'tap-correct', title: 'ছ কোথায়?', voiceText: 'ছ খুঁজে বের করো', content: 'ছ', options: ['চ', 'ছ', 'জ', 'ঝ'], correctAnswer: 'ছ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ছ বুদবুদ ফাটাও', content: 'ছ', options: ['চ', 'ছ', 'জ', 'ঝ'], correctAnswer: 'ছ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ছ', options: ['চ', 'ছ', 'জ', 'ঝ'], correctAnswer: 'ছ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ছাগল বানাও', content: 'ছাগল', options: ['ছ', 'া', 'গ', 'ল'], correctAnswer: 'ছাগল' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ছ', options: ['চ-চাঁদ', 'ছ-ছাগল', 'জ-জাহাজ', 'ঝ-ঝড়'], correctAnswer: 'ছ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ছ', voiceText: 'ছ লেখো', content: 'ছ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ছাগল কোন বর্ণ দিয়ে শুরু?', content: 'ছ', options: ['চ', 'ছ', 'জ', 'ঝ'], correctAnswer: 'ছ' },
        ],
    },
    'banjanbarna-ja': {
        id: 'banjanbarna-ja', letter: 'জ', word: 'জাহাজ', wordEn: 'Ship', emoji: '🚢',
        color: 'from-blue-400 to-cyan-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'জ দিয়ে জাহাজ', content: 'জ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — জাহাজ', voiceText: 'জাহাজ', content: 'জাহাজ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'জ', content: 'জ' },
            { id: 'e4', type: 'tap-correct', title: 'জ কোথায়?', voiceText: 'জ খুঁজে বের করো', content: 'জ', options: ['ছ', 'জ', 'ঝ', 'ট'], correctAnswer: 'জ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'জ বুদবুদ ফাটাও', content: 'জ', options: ['ছ', 'জ', 'ঝ', 'ট'], correctAnswer: 'জ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'জ', options: ['ছ', 'জ', 'ঝ', 'ট'], correctAnswer: 'জ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'জাহাজ বানাও', content: 'জাহাজ', options: ['জ', 'া', 'হ', 'জ'], correctAnswer: 'জাহাজ' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'জ', options: ['ছ-ছাগল', 'জ-জাহাজ', 'ঝ-ঝড়', 'ট-টমেটো'], correctAnswer: 'জ' },
            { id: 'e10', type: 'trace', title: 'লিখি — জ', voiceText: 'জ লেখো', content: 'জ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'জাহাজ কোন বর্ণ দিয়ে শুরু?', content: 'জ', options: ['ছ', 'জ', 'ঝ', 'ট'], correctAnswer: 'জ' },
        ],
    },
    'banjanbarna-jha': {
        id: 'banjanbarna-jha', letter: 'ঝ', word: 'ঝড়', wordEn: 'Storm', emoji: '⛈️',
        color: 'from-slate-400 to-gray-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঝ দিয়ে ঝড়', content: 'ঝ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ঝড়', voiceText: 'ঝড়', content: 'ঝড়' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঝ', content: 'ঝ' },
            { id: 'e4', type: 'tap-correct', title: 'ঝ কোথায়?', voiceText: 'ঝ খুঁজে বের করো', content: 'ঝ', options: ['জ', 'ঝ', 'ট', 'ঠ'], correctAnswer: 'ঝ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ঝ বুদবুদ ফাটাও', content: 'ঝ', options: ['জ', 'ঝ', 'ট', 'ঠ'], correctAnswer: 'ঝ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ঝ', options: ['জ', 'ঝ', 'ট', 'ঠ'], correctAnswer: 'ঝ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ঝড় বানাও', content: 'ঝড়', options: ['ঝ', 'ড়', 'ম', 'ন'], correctAnswer: 'ঝড়' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ঝ', options: ['জ-জাহাজ', 'ঝ-ঝড়', 'ট-টমেটো', 'ঠ-ঠাণ্ডা'], correctAnswer: 'ঝ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঝ', voiceText: 'ঝ লেখো', content: 'ঝ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ঝড় কোন বর্ণ দিয়ে শুরু?', content: 'ঝ', options: ['জ', 'ঝ', 'ট', 'ঠ'], correctAnswer: 'ঝ' },
        ],
    },
    'banjanbarna-nya': {
        id: 'banjanbarna-nya', letter: 'ঞ', word: 'মিঞা', wordEn: 'Mian', emoji: '👨',
        color: 'from-violet-400 to-purple-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঞ — মিঞা শব্দে আছে', content: 'ঞ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — মিঞা', voiceText: 'মিঞা', content: 'মিঞা' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঞ', content: 'ঞ' },
            { id: 'e4', type: 'tap-correct', title: 'ঞ কোথায়?', voiceText: 'ঞ খুঁজে বের করো', content: 'ঞ', options: ['জ', 'ঝ', 'ঞ', 'ট'], correctAnswer: 'ঞ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ঞ বুদবুদ ফাটাও', content: 'ঞ', options: ['জ', 'ঝ', 'ঞ', 'ট'], correctAnswer: 'ঞ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ঞ', options: ['জ', 'ঝ', 'ঞ', 'ট'], correctAnswer: 'ঞ' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ঞ', options: ['জ-জাহাজ', 'ঝ-ঝড়', 'ঞ-মিঞা', 'ট-টমেটো'], correctAnswer: 'ঞ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঞ', voiceText: 'ঞ লেখো', content: 'ঞ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'মিঞা শব্দে কোন বর্ণ আছে?', content: 'ঞ', options: ['জ', 'ঝ', 'ঞ', 'ট'], correctAnswer: 'ঞ' },
        ],
    },
    'banjanbarna-ta': {
        id: 'banjanbarna-ta', letter: 'ট', word: 'টমেটো', wordEn: 'Tomato', emoji: '🍅',
        color: 'from-red-400 to-rose-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ট দিয়ে টমেটো', content: 'ট' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — টমেটো', voiceText: 'টমেটো', content: 'টমেটো' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ট', content: 'ট' },
            { id: 'e4', type: 'tap-correct', title: 'ট কোথায়?', voiceText: 'ট খুঁজে বের করো', content: 'ট', options: ['ঝ', 'ট', 'ঠ', 'ড'], correctAnswer: 'ট' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ট বুদবুদ ফাটাও', content: 'ট', options: ['ঝ', 'ট', 'ঠ', 'ড'], correctAnswer: 'ট' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ট', options: ['ঝ', 'ট', 'ঠ', 'ড'], correctAnswer: 'ট' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'টমেটো বানাও', content: 'টমেটো', options: ['ট', 'ম', 'টো', 'ন'], correctAnswer: 'টমেটো' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ট', options: ['ঝ-ঝড়', 'ট-টমেটো', 'ঠ-ঠাণ্ডা', 'ড-ডিম'], correctAnswer: 'ট' },
            { id: 'e10', type: 'trace', title: 'লিখি — ট', voiceText: 'ট লেখো', content: 'ট' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'টমেটো কোন বর্ণ দিয়ে শুরু?', content: 'ট', options: ['ঝ', 'ট', 'ঠ', 'ড'], correctAnswer: 'ট' },
        ],
    },
    'banjanbarna-tha': {
        id: 'banjanbarna-tha', letter: 'ঠ', word: 'ঠোঁট', wordEn: 'Lip', emoji: '👄',
        color: 'from-rose-400 to-pink-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঠ দিয়ে ঠোঁট', content: 'ঠ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ঠোঁট', voiceText: 'ঠোঁট', content: 'ঠোঁট' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঠ', content: 'ঠ' },
            { id: 'e4', type: 'tap-correct', title: 'ঠ কোথায়?', voiceText: 'ঠ খুঁজে বের করো', content: 'ঠ', options: ['ট', 'ঠ', 'ড', 'ঢ'], correctAnswer: 'ঠ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ঠ বুদবুদ ফাটাও', content: 'ঠ', options: ['ট', 'ঠ', 'ড', 'ঢ'], correctAnswer: 'ঠ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ঠ', options: ['ট', 'ঠ', 'ড', 'ঢ'], correctAnswer: 'ঠ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ঠোঁট বানাও', content: 'ঠোঁট', options: ['ঠ', 'ো', 'ঁ', 'ট'], correctAnswer: 'ঠোঁট' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ঠ', options: ['ট-টমেটো', 'ঠ-ঠোঁট', 'ড-ডিম', 'ঢ-ঢোল'], correctAnswer: 'ঠ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঠ', voiceText: 'ঠ লেখো', content: 'ঠ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ঠোঁট কোন বর্ণ দিয়ে শুরু?', content: 'ঠ', options: ['ট', 'ঠ', 'ড', 'ঢ'], correctAnswer: 'ঠ' },
        ],
    },
    'banjanbarna-da': {
        id: 'banjanbarna-da', letter: 'ড', word: 'ডিম', wordEn: 'Egg', emoji: '🥚',
        color: 'from-amber-400 to-yellow-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ড দিয়ে ডিম', content: 'ড' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ডিম', voiceText: 'ডিম', content: 'ডিম' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ড', content: 'ড' },
            { id: 'e4', type: 'tap-correct', title: 'ড কোথায়?', voiceText: 'ড খুঁজে বের করো', content: 'ড', options: ['ট', 'ঠ', 'ড', 'ঢ'], correctAnswer: 'ড' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ড বুদবুদ ফাটাও', content: 'ড', options: ['ট', 'ঠ', 'ড', 'ঢ'], correctAnswer: 'ড' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ড', options: ['ট', 'ঠ', 'ড', 'ঢ'], correctAnswer: 'ড' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ডিম বানাও', content: 'ডিম', options: ['ড', 'ি', 'ম', 'ন'], correctAnswer: 'ডিম' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ড', options: ['ট-টমেটো', 'ড-ডিম', 'ঢ-ঢোল', 'ণ-নৌকা'], correctAnswer: 'ড' },
            { id: 'e10', type: 'trace', title: 'লিখি — ড', voiceText: 'ড লেখো', content: 'ড' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ডিম কোন বর্ণ দিয়ে শুরু?', content: 'ড', options: ['ট', 'ঠ', 'ড', 'ঢ'], correctAnswer: 'ড' },
        ],
    },
    'banjanbarna-dha': {
        id: 'banjanbarna-dha', letter: 'ঢ', word: 'ঢোল', wordEn: 'Drum', emoji: '🥁',
        color: 'from-amber-400 to-orange-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঢ দিয়ে ঢোল', content: 'ঢ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ঢোল', voiceText: 'ঢোল', content: 'ঢোল' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঢ', content: 'ঢ' },
            { id: 'e4', type: 'tap-correct', title: 'ঢ কোথায়?', voiceText: 'ঢ খুঁজে বের করো', content: 'ঢ', options: ['ট', 'ঠ', 'ড', 'ঢ'], correctAnswer: 'ঢ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ঢ বুদবুদ ফাটাও', content: 'ঢ', options: ['ট', 'ঠ', 'ড', 'ঢ'], correctAnswer: 'ঢ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ঢ', options: ['ট', 'ঠ', 'ড', 'ঢ'], correctAnswer: 'ঢ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ঢোল বানাও', content: 'ঢোল', options: ['ঢ', 'ো', 'ল', 'ম'], correctAnswer: 'ঢোল' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ঢ', options: ['ট-টমেটো', 'ঠ-ঠোঁট', 'ড-ডিম', 'ঢ-ঢোল'], correctAnswer: 'ঢ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঢ', voiceText: 'ঢ লেখো', content: 'ঢ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ঢোল কোন বর্ণ দিয়ে শুরু?', content: 'ঢ', options: ['ট', 'ঠ', 'ড', 'ঢ'], correctAnswer: 'ঢ' },
        ],
    },
    'banjanbarna2-na': {
        id: 'banjanbarna2-na', letter: 'ণ', word: 'মণি', wordEn: 'Gem', emoji: '💎',
        color: 'from-purple-400 to-violet-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ণ দিয়ে মণি', content: 'ণ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — মণি', voiceText: 'মণি', content: 'মণি' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ণ', content: 'ণ' },
            { id: 'e4', type: 'tap-correct', title: 'ণ কোথায়?', voiceText: 'ণ খুঁজে বের করো', content: 'ণ', options: ['ড', 'ঢ', 'ণ', 'ন'], correctAnswer: 'ণ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ণ বুদবুদ ফাটাও', content: 'ণ', options: ['ড', 'ঢ', 'ণ', 'ন'], correctAnswer: 'ণ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ণ', options: ['ড', 'ঢ', 'ণ', 'ন'], correctAnswer: 'ণ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'মণি বানাও', content: 'মণি', options: ['ম', 'ণ', 'ি', 'ন'], correctAnswer: 'মণি' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ণ', options: ['ড-ডিম', 'ণ-মণি', 'ন-নৌকা', 'প-পাখি'], correctAnswer: 'ণ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ণ', voiceText: 'ণ লেখো', content: 'ণ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'মণি শব্দে কোন বর্ণ আছে?', content: 'ণ', options: ['ড', 'ণ', 'ন', 'প'], correctAnswer: 'ণ' },
        ],
    },

    'banjanbarna2-da': {
        id: 'banjanbarna2-da', letter: 'ত', word: 'তরমুজ', wordEn: 'Watermelon', emoji: '🍉',
        color: 'from-green-400 to-red-400', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ত দিয়ে তরমুজ', content: 'ত' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — তরমুজ', voiceText: 'তরমুজ', content: 'তরমুজ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ত', content: 'ত' },
            { id: 'e4', type: 'tap-correct', title: 'ত কোথায়?', voiceText: 'ত খুঁজে বের করো', content: 'ত', options: ['ণ', 'ত', 'থ', 'দ'], correctAnswer: 'ত' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ত বুদবুদ ফাটাও', content: 'ত', options: ['ণ', 'ত', 'থ', 'দ'], correctAnswer: 'ত' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ত', options: ['ণ', 'ত', 'থ', 'দ'], correctAnswer: 'ত' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'তরমুজ বানাও', content: 'তরমুজ', options: ['ত', 'র', 'মু', 'জ'], correctAnswer: 'তরমুজ' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ত', options: ['ণ-মণি', 'ত-তরমুজ', 'থ-থালা', 'দ-দরজা'], correctAnswer: 'ত' },
            { id: 'e10', type: 'trace', title: 'লিখি — ত', voiceText: 'ত লেখো', content: 'ত' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'তরমুজ কোন বর্ণ দিয়ে শুরু?', content: 'ত', options: ['ণ', 'ত', 'থ', 'দ'], correctAnswer: 'ত' },
        ],
    },
    'banjanbarna2-ta': {
        id: 'banjanbarna2-ta', letter: 'থ', word: 'থালা', wordEn: 'Plate', emoji: '🍽️',
        color: 'from-slate-400 to-gray-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'থ দিয়ে থালা', content: 'থ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — থালা', voiceText: 'থালা', content: 'থালা' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'থ', content: 'থ' },
            { id: 'e4', type: 'tap-correct', title: 'থ কোথায়?', voiceText: 'থ খুঁজে বের করো', content: 'থ', options: ['ত', 'থ', 'দ', 'ধ'], correctAnswer: 'থ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'থ বুদবুদ ফাটাও', content: 'থ', options: ['ত', 'থ', 'দ', 'ধ'], correctAnswer: 'থ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'থ', options: ['ত', 'থ', 'দ', 'ধ'], correctAnswer: 'থ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'থালা বানাও', content: 'থালা', options: ['থ', 'া', 'ল', 'া'], correctAnswer: 'থালা' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'থ', options: ['ত-তরমুজ', 'থ-থালা', 'দ-দরজা', 'ধ-ধান'], correctAnswer: 'থ' },
            { id: 'e10', type: 'trace', title: 'লিখি — থ', voiceText: 'থ লেখো', content: 'থ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'থালা কোন বর্ণ দিয়ে শুরু?', content: 'থ', options: ['ত', 'থ', 'দ', 'ধ'], correctAnswer: 'থ' },
        ],
    },
    'banjanbarna2-dha': {
        id: 'banjanbarna2-dha', letter: 'দ', word: 'দরজা', wordEn: 'Door', emoji: '🚪',
        color: 'from-blue-400 to-indigo-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'দ দিয়ে দরজা', content: 'দ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — দরজা', voiceText: 'দরজা', content: 'দরজা' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'দ', content: 'দ' },
            { id: 'e4', type: 'tap-correct', title: 'দ কোথায়?', voiceText: 'দ খুঁজে বের করো', content: 'দ', options: ['ত', 'থ', 'দ', 'ধ'], correctAnswer: 'দ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'দ বুদবুদ ফাটাও', content: 'দ', options: ['ত', 'থ', 'দ', 'ধ'], correctAnswer: 'দ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'দ', options: ['ত', 'থ', 'দ', 'ধ'], correctAnswer: 'দ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'দরজা বানাও', content: 'দরজা', options: ['দ', 'র', 'জ', 'া'], correctAnswer: 'দরজা' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'দ', options: ['ত-তরমুজ', 'থ-থালা', 'দ-দরজা', 'ধ-ধান'], correctAnswer: 'দ' },
            { id: 'e10', type: 'trace', title: 'লিখি — দ', voiceText: 'দ লেখো', content: 'দ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'দরজা কোন বর্ণ দিয়ে শুরু?', content: 'দ', options: ['ত', 'থ', 'দ', 'ধ'], correctAnswer: 'দ' },
        ],
    },
    'banjanbarna2-dhha': {
        id: 'banjanbarna2-dhha', letter: 'ধ', word: 'ধান', wordEn: 'Rice Plant', emoji: '🌾',
        color: 'from-yellow-400 to-amber-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ধ দিয়ে ধান', content: 'ধ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ধান', voiceText: 'ধান', content: 'ধান' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ধ', content: 'ধ' },
            { id: 'e4', type: 'tap-correct', title: 'ধ কোথায়?', voiceText: 'ধ খুঁজে বের করো', content: 'ধ', options: ['ত', 'থ', 'দ', 'ধ'], correctAnswer: 'ধ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ধ বুদবুদ ফাটাও', content: 'ধ', options: ['ত', 'থ', 'দ', 'ধ'], correctAnswer: 'ধ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ধ', options: ['ত', 'থ', 'দ', 'ধ'], correctAnswer: 'ধ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ধান বানাও', content: 'ধান', options: ['ধ', 'া', 'ন', 'ম'], correctAnswer: 'ধান' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ধ', options: ['ত-তরমুজ', 'থ-থালা', 'দ-দরজা', 'ধ-ধান'], correctAnswer: 'ধ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ধ', voiceText: 'ধ লেখো', content: 'ধ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ধান কোন বর্ণ দিয়ে শুরু?', content: 'ধ', options: ['ত', 'থ', 'দ', 'ধ'], correctAnswer: 'ধ' },
        ],
    },
    'banjanbarna-na': {
        id: 'banjanbarna-na', letter: 'ন', word: 'নৌকা', wordEn: 'Boat', emoji: '⛵',
        color: 'from-cyan-400 to-blue-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ন দিয়ে নৌকা', content: 'ন' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — নৌকা', voiceText: 'নৌকা', content: 'নৌকা' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ন', content: 'ন' },
            { id: 'e4', type: 'tap-correct', title: 'ন কোথায়?', voiceText: 'ন খুঁজে বের করো', content: 'ন', options: ['ড', 'ঢ', 'ণ', 'ন'], correctAnswer: 'ন' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ন বুদবুদ ফাটাও', content: 'ন', options: ['ড', 'ঢ', 'ণ', 'ন'], correctAnswer: 'ন' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ন', options: ['ড', 'ঢ', 'ণ', 'ন'], correctAnswer: 'ন' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'নৌকা বানাও', content: 'নৌকা', options: ['ন', 'ৌ', 'ক', 'া'], correctAnswer: 'নৌকা' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ন', options: ['ড-ডিম', 'ণ-মণি', 'ন-নৌকা', 'প-পাখি'], correctAnswer: 'ন' },
            { id: 'e10', type: 'trace', title: 'লিখি — ন', voiceText: 'ন লেখো', content: 'ন' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'নৌকা কোন বর্ণ দিয়ে শুরু?', content: 'ন', options: ['ড', 'ণ', 'ন', 'প'], correctAnswer: 'ন' },
        ],
    },


    // ─── ব্যঞ্জনবর্ণ ২ ──────────────────────────────────────────
    'banjanbarna2-pa': {
        id: 'banjanbarna2-pa', letter: 'প', word: 'পাখি', wordEn: 'Bird', emoji: '🐦',
        color: 'from-emerald-400 to-teal-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'প দিয়ে পাখি', content: 'প' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — পাখি', voiceText: 'পাখি', content: 'পাখি' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'প', content: 'প' },
            { id: 'e4', type: 'tap-correct', title: 'প কোথায়?', voiceText: 'প খুঁজে বের করো', content: 'প', options: ['ন', 'প', 'ফ', 'ব'], correctAnswer: 'প' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'প বুদবুদ ফাটাও', content: 'প', options: ['ন', 'প', 'ফ', 'ব'], correctAnswer: 'প' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'প', options: ['ন', 'প', 'ফ', 'ব'], correctAnswer: 'প' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'পাখি বানাও', content: 'পাখি', options: ['প', 'া', 'খ', 'ি'], correctAnswer: 'পাখি' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'প', options: ['ন-নৌকা', 'প-পাখি', 'ফ-ফুল', 'ব-বাঘ'], correctAnswer: 'প' },
            { id: 'e10', type: 'trace', title: 'লিখি — প', voiceText: 'প লেখো', content: 'প' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'পাখি কোন বর্ণ দিয়ে শুরু?', content: 'প', options: ['ন', 'প', 'ফ', 'ব'], correctAnswer: 'প' },
        ],
    },
    'banjanbarna2-pha': {
        id: 'banjanbarna2-pha', letter: 'ফ', word: 'ফুল', wordEn: 'Flower', emoji: '🌸',
        color: 'from-pink-400 to-rose-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ফ দিয়ে ফুল', content: 'ফ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ফুল', voiceText: 'ফুল', content: 'ফুল' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ফ', content: 'ফ' },
            { id: 'e4', type: 'tap-correct', title: 'ফ কোথায়?', voiceText: 'ফ খুঁজে বের করো', content: 'ফ', options: ['প', 'ফ', 'ব', 'ভ'], correctAnswer: 'ফ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ফ বুদবুদ ফাটাও', content: 'ফ', options: ['প', 'ফ', 'ব', 'ভ'], correctAnswer: 'ফ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ফ', options: ['প', 'ফ', 'ব', 'ভ'], correctAnswer: 'ফ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ফুল বানাও', content: 'ফুল', options: ['ফ', 'ু', 'ল', 'ম'], correctAnswer: 'ফুল' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ফ', options: ['প-পাখি', 'ফ-ফুল', 'ব-বাঘ', 'ভ-ভালুক'], correctAnswer: 'ফ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ফ', voiceText: 'ফ লেখো', content: 'ফ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ফুল কোন বর্ণ দিয়ে শুরু?', content: 'ফ', options: ['প', 'ফ', 'ব', 'ভ'], correctAnswer: 'ফ' },
        ],
    },
    'banjanbarna2-ba': {
        id: 'banjanbarna2-ba', letter: 'ব', word: 'বাঘ', wordEn: 'Tiger', emoji: '🐯',
        color: 'from-orange-400 to-amber-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ব দিয়ে বাঘ', content: 'ব' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — বাঘ', voiceText: 'বাঘ', content: 'বাঘ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ব', content: 'ব' },
            { id: 'e4', type: 'tap-correct', title: 'ব কোথায়?', voiceText: 'ব খুঁজে বের করো', content: 'ব', options: ['ফ', 'ব', 'ভ', 'ম'], correctAnswer: 'ব' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ব বুদবুদ ফাটাও', content: 'ব', options: ['ফ', 'ব', 'ভ', 'ম'], correctAnswer: 'ব' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ব', options: ['ফ', 'ব', 'ভ', 'ম'], correctAnswer: 'ব' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'বাঘ বানাও', content: 'বাঘ', options: ['ব', 'া', 'ঘ', 'ম'], correctAnswer: 'বাঘ' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ব', options: ['ফ-ফুল', 'ব-বাঘ', 'ভ-ভালুক', 'ম-মাছ'], correctAnswer: 'ব' },
            { id: 'e10', type: 'trace', title: 'লিখি — ব', voiceText: 'ব লেখো', content: 'ব' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'বাঘ কোন বর্ণ দিয়ে শুরু?', content: 'ব', options: ['ফ', 'ব', 'ভ', 'ম'], correctAnswer: 'ব' },
        ],
    },
    'banjanbarna2-bha': {
        id: 'banjanbarna2-bha', letter: 'ভ', word: 'ভালুক', wordEn: 'Bear', emoji: '🐻',
        color: 'from-brown-400 to-amber-700', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ভ দিয়ে ভালুক', content: 'ভ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ভালুক', voiceText: 'ভালুক', content: 'ভালুক' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ভ', content: 'ভ' },
            { id: 'e4', type: 'tap-correct', title: 'ভ কোথায়?', voiceText: 'ভ খুঁজে বের করো', content: 'ভ', options: ['ব', 'ভ', 'ম', 'য'], correctAnswer: 'ভ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ভ বুদবুদ ফাটাও', content: 'ভ', options: ['ব', 'ভ', 'ম', 'য'], correctAnswer: 'ভ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ভ', options: ['ব', 'ভ', 'ম', 'য'], correctAnswer: 'ভ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ভালুক বানাও', content: 'ভালুক', options: ['ভ', 'া', 'লু', 'ক'], correctAnswer: 'ভালুক' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ভ', options: ['ব-বাঘ', 'ভ-ভালুক', 'ম-মাছ', 'য-যন্ত্র'], correctAnswer: 'ভ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ভ', voiceText: 'ভ লেখো', content: 'ভ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ভালুক কোন বর্ণ দিয়ে শুরু?', content: 'ভ', options: ['ব', 'ভ', 'ম', 'য'], correctAnswer: 'ভ' },
        ],
    },
    'banjanbarna2-ma': {
        id: 'banjanbarna2-ma', letter: 'ম', word: 'মাছ', wordEn: 'Fish', emoji: '🐟',
        color: 'from-blue-400 to-cyan-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ম দিয়ে মাছ', content: 'ম' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — মাছ', voiceText: 'মাছ', content: 'মাছ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ম', content: 'ম' },
            { id: 'e4', type: 'tap-correct', title: 'ম কোথায়?', voiceText: 'ম খুঁজে বের করো', content: 'ম', options: ['ভ', 'ম', 'য', 'র'], correctAnswer: 'ম' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ম বুদবুদ ফাটাও', content: 'ম', options: ['ভ', 'ম', 'য', 'র'], correctAnswer: 'ম' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ম', options: ['ভ', 'ম', 'য', 'র'], correctAnswer: 'ম' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'মাছ বানাও', content: 'মাছ', options: ['ম', 'া', 'ছ', 'ন'], correctAnswer: 'মাছ' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ম', options: ['ভ-ভালুক', 'ম-মাছ', 'য-যন্ত্র', 'র-রকেট'], correctAnswer: 'ম' },
            { id: 'e10', type: 'trace', title: 'লিখি — ম', voiceText: 'ম লেখো', content: 'ম' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'মাছ কোন বর্ণ দিয়ে শুরু?', content: 'ম', options: ['ভ', 'ম', 'য', 'র'], correctAnswer: 'ম' },
        ],
    },



    // ─── ব্যঞ্জনবর্ণ ৩ ──────────────────────────────────────────
    'banjanbarna3-ya': {
        id: 'banjanbarna3-ya', letter: 'য', word: 'যন্ত্র', wordEn: 'Machine', emoji: '⚙️',
        color: 'from-gray-400 to-slate-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'য দিয়ে যন্ত্র', content: 'য' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — যন্ত্র', voiceText: 'যন্ত্র', content: 'যন্ত্র' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'য', content: 'য' },
            { id: 'e4', type: 'tap-correct', title: 'য কোথায়?', voiceText: 'য খুঁজে বের করো', content: 'য', options: ['ম', 'য', 'র', 'ল'], correctAnswer: 'য' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'য বুদবুদ ফাটাও', content: 'য', options: ['ম', 'য', 'র', 'ল'], correctAnswer: 'য' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'য', options: ['ম', 'য', 'র', 'ল'], correctAnswer: 'য' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'যন্ত্র বানাও', content: 'যন্ত্র', options: ['য', 'ন', 'ত', 'র'], correctAnswer: 'যন্ত্র' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'য', options: ['ম-মাছ', 'য-যন্ত্র', 'র-রকেট', 'ল-লাউ'], correctAnswer: 'য' },
            { id: 'e10', type: 'trace', title: 'লিখি — য', voiceText: 'য লেখো', content: 'য' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'যন্ত্র কোন বর্ণ দিয়ে শুরু?', content: 'য', options: ['ম', 'য', 'র', 'ল'], correctAnswer: 'য' },
        ],
    },
    'banjanbarna3-ra': {
        id: 'banjanbarna3-ra', letter: 'র', word: 'রকেট', wordEn: 'Rocket', emoji: '🚀',
        color: 'from-red-400 to-orange-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'র দিয়ে রকেট', content: 'র' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — রকেট', voiceText: 'রকেট', content: 'রকেট' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'র', content: 'র' },
            { id: 'e4', type: 'tap-correct', title: 'র কোথায়?', voiceText: 'র খুঁজে বের করো', content: 'র', options: ['য', 'র', 'ল', 'শ'], correctAnswer: 'র' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'র বুদবুদ ফাটাও', content: 'র', options: ['য', 'র', 'ল', 'শ'], correctAnswer: 'র' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'র', options: ['য', 'র', 'ল', 'শ'], correctAnswer: 'র' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'রকেট বানাও', content: 'রকেট', options: ['র', 'ক', 'ট', 'ম'], correctAnswer: 'রকেট' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'র', options: ['য-যন্ত্র', 'র-রকেট', 'ল-লাউ', 'শ-শিয়াল'], correctAnswer: 'র' },
            { id: 'e10', type: 'trace', title: 'লিখি — র', voiceText: 'র লেখো', content: 'র' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'রকেট কোন বর্ণ দিয়ে শুরু?', content: 'র', options: ['য', 'র', 'ল', 'শ'], correctAnswer: 'র' },
        ],
    },
    'banjanbarna3-la': {
        id: 'banjanbarna3-la', letter: 'ল', word: 'লাউ', wordEn: 'Gourd', emoji: '🥬',
        color: 'from-green-400 to-lime-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ল দিয়ে লাউ', content: 'ল' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — লাউ', voiceText: 'লাউ', content: 'লাউ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ল', content: 'ল' },
            { id: 'e4', type: 'tap-correct', title: 'ল কোথায়?', voiceText: 'ল খুঁজে বের করো', content: 'ল', options: ['র', 'ল', 'শ', 'ষ'], correctAnswer: 'ল' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ল বুদবুদ ফাটাও', content: 'ল', options: ['র', 'ল', 'শ', 'ষ'], correctAnswer: 'ল' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ল', options: ['র', 'ল', 'শ', 'ষ'], correctAnswer: 'ল' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'লাউ বানাও', content: 'লাউ', options: ['ল', 'া', 'উ', 'ম'], correctAnswer: 'লাউ' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ল', options: ['র-রকেট', 'ল-লাউ', 'শ-শিয়াল', 'ষ-ষাঁড়'], correctAnswer: 'ল' },
            { id: 'e10', type: 'trace', title: 'লিখি — ল', voiceText: 'ল লেখো', content: 'ল' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'লাউ কোন বর্ণ দিয়ে শুরু?', content: 'ল', options: ['র', 'ল', 'শ', 'ষ'], correctAnswer: 'ল' },
        ],
    },

    'banjanbarna3-sha': {
        id: 'banjanbarna3-sha', letter: 'শ', word: 'শিয়াল', wordEn: 'Fox', emoji: '🦊',
        color: 'from-orange-400 to-red-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'শ দিয়ে শিয়াল', content: 'শ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — শিয়াল', voiceText: 'শিয়াল', content: 'শিয়াল' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'শ', content: 'শ' },
            { id: 'e4', type: 'tap-correct', title: 'শ কোথায়?', voiceText: 'শ খুঁজে বের করো', content: 'শ', options: ['ল', 'শ', 'ষ', 'স'], correctAnswer: 'শ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'শ বুদবুদ ফাটাও', content: 'শ', options: ['ল', 'শ', 'ষ', 'স'], correctAnswer: 'শ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'শ', options: ['ল', 'শ', 'ষ', 'স'], correctAnswer: 'শ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'শিয়াল বানাও', content: 'শিয়াল', options: ['শ', 'ি', 'য়া', 'ল'], correctAnswer: 'শিয়াল' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'শ', options: ['ল-লাউ', 'শ-শিয়াল', 'ষ-ষাঁড়', 'স-সাপ'], correctAnswer: 'শ' },
            { id: 'e10', type: 'trace', title: 'লিখি — শ', voiceText: 'শ লেখো', content: 'শ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'শিয়াল কোন বর্ণ দিয়ে শুরু?', content: 'শ', options: ['ল', 'শ', 'ষ', 'স'], correctAnswer: 'শ' },
        ],
    },
    'banjanbarna3-sha2': {
        id: 'banjanbarna3-sha2', letter: 'ষ', word: 'ষাঁড়', wordEn: 'Bull', emoji: '🐂',
        color: 'from-orange-400 to-red-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ষ দিয়ে ষাঁড়', content: 'ষ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ষাঁড়', voiceText: 'ষাঁড়', content: 'ষাঁড়' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ষ', content: 'ষ' },
            { id: 'e4', type: 'tap-correct', title: 'ষ কোথায়?', voiceText: 'ষ খুঁজে বের করো', content: 'ষ', options: ['শ', 'ষ', 'স', 'হ'], correctAnswer: 'ষ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ষ বুদবুদ ফাটাও', content: 'ষ', options: ['শ', 'ষ', 'স', 'হ'], correctAnswer: 'ষ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ষ', options: ['শ', 'ষ', 'স', 'হ'], correctAnswer: 'ষ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'ষাঁড় বানাও', content: 'ষাঁড়', options: ['ষ', 'া', 'ঁ', 'ড়'], correctAnswer: 'ষাঁড়' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ষ', options: ['শ-শিয়াল', 'ষ-ষাঁড়', 'স-সাপ', 'হ-হাতি'], correctAnswer: 'ষ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ষ', voiceText: 'ষ লেখো', content: 'ষ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ষাঁড় কোন বর্ণ দিয়ে শুরু?', content: 'ষ', options: ['শ', 'ষ', 'স', 'হ'], correctAnswer: 'ষ' },
        ],
    },
    'banjanbarna3-sa': {
        id: 'banjanbarna3-sa', letter: 'স', word: 'সাপ', wordEn: 'Snake', emoji: '🐍',
        color: 'from-lime-400 to-green-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'স দিয়ে সাপ', content: 'স' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — সাপ', voiceText: 'সাপ', content: 'সাপ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'স', content: 'স' },
            { id: 'e4', type: 'tap-correct', title: 'স কোথায়?', voiceText: 'স খুঁজে বের করো', content: 'স', options: ['শ', 'ষ', 'স', 'হ'], correctAnswer: 'স' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'স বুদবুদ ফাটাও', content: 'স', options: ['শ', 'ষ', 'স', 'হ'], correctAnswer: 'স' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'স', options: ['শ', 'ষ', 'স', 'হ'], correctAnswer: 'স' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'সাপ বানাও', content: 'সাপ', options: ['স', 'া', 'প', 'ম'], correctAnswer: 'সাপ' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'স', options: ['শ-শিয়াল', 'ষ-ষাঁড়', 'স-সাপ', 'হ-হাতি'], correctAnswer: 'স' },
            { id: 'e10', type: 'trace', title: 'লিখি — স', voiceText: 'স লেখো', content: 'স' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'সাপ কোন বর্ণ দিয়ে শুরু?', content: 'স', options: ['শ', 'ষ', 'স', 'হ'], correctAnswer: 'স' },
        ],
    },
    'banjanbarna3-ha': {
        id: 'banjanbarna3-ha', letter: 'হ', word: 'হাতি', wordEn: 'Elephant', emoji: '🐘',
        color: 'from-gray-400 to-slate-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'হ দিয়ে হাতি', content: 'হ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — হাতি', voiceText: 'হাতি', content: 'হাতি' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'হ', content: 'হ' },
            { id: 'e4', type: 'tap-correct', title: 'হ কোথায়?', voiceText: 'হ খুঁজে বের করো', content: 'হ', options: ['স', 'হ', 'ড়', 'য়'], correctAnswer: 'হ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'হ বুদবুদ ফাটাও', content: 'হ', options: ['স', 'হ', 'ড়', 'য়'], correctAnswer: 'হ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'হ', options: ['স', 'হ', 'ড়', 'য়'], correctAnswer: 'হ' },
            { id: 'e8', type: 'word-builder', title: 'শব্দ বানাও!', voiceText: 'হাতি বানাও', content: 'হাতি', options: ['হ', 'া', 'ত', 'ি'], correctAnswer: 'হাতি' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'হ', options: ['স-সাপ', 'হ-হাতি', 'ড়-গড়', 'য়-ময়ূর'], correctAnswer: 'হ' },
            { id: 'e10', type: 'trace', title: 'লিখি — হ', voiceText: 'হ লেখো', content: 'হ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'হাতি কোন বর্ণ দিয়ে শুরু?', content: 'হ', options: ['স', 'হ', 'ড়', 'য়'], correctAnswer: 'হ' },
        ],
    },
    'banjanbarna3-rra': {
        id: 'banjanbarna3-rra', letter: 'ড়', word: 'ড়শি', wordEn: 'Rope', emoji: '🪢',
        color: 'from-amber-400 to-orange-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ড় এর উচ্চারণ শিখি', content: 'ড়' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — গড়', voiceText: 'গড়', content: 'গড়' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ড়', content: 'ড়' },
            { id: 'e4', type: 'tap-correct', title: 'ড় কোথায়?', voiceText: 'ড় খুঁজে বের করো', content: 'ড়', options: ['ড', 'ঢ', 'ড়', 'ঢ়'], correctAnswer: 'ড়' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ড় বুদবুদ ফাটাও', content: 'ড়', options: ['ড', 'ঢ', 'ড়', 'ঢ়'], correctAnswer: 'ড়' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ড়', options: ['ড', 'ঢ', 'ড়', 'ঢ়'], correctAnswer: 'ড়' },
            { id: 'e10', type: 'trace', title: 'লিখি — ড়', voiceText: 'ড় লেখো', content: 'ড়' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'গড় শব্দে কোন বর্ণ আছে?', content: 'ড়', options: ['ড', 'ঢ', 'ড়', 'র'], correctAnswer: 'ড়' },
        ],
    },
    'banjanbarna3-rha': {
        id: 'banjanbarna3-rha', letter: 'ঢ়', word: 'ঢেঁড়স', wordEn: 'Okra', emoji: '🥬',
        color: 'from-green-400 to-teal-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঢ় — ঢেঁড়স শব্দে আছে', content: 'ঢ়' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ঢেঁড়স', voiceText: 'ঢেঁড়স', content: 'ঢেঁড়স' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঢ়', content: 'ঢ়' },
            { id: 'e4', type: 'tap-correct', title: 'ঢ় কোথায়?', voiceText: 'ঢ় খুঁজে বের করো', content: 'ঢ়', options: ['ড', 'ঢ', 'ড়', 'ঢ়'], correctAnswer: 'ঢ়' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ঢ় বুদবুদ ফাটাও', content: 'ঢ়', options: ['ড', 'ঢ', 'ড়', 'ঢ়'], correctAnswer: 'ঢ়' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ঢ়', options: ['ড', 'ঢ', 'ড়', 'ঢ়'], correctAnswer: 'ঢ়' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ঢ়', options: ['ড-ডিম', 'ঢ-ঢোল', 'ড়-গড়', 'ঢ়-ঢেঁড়স'], correctAnswer: 'ঢ়' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঢ়', voiceText: 'ঢ় লেখো', content: 'ঢ়' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ঢেঁড়স শব্দে কোন বর্ণ আছে?', content: 'ঢ়', options: ['ড', 'ঢ', 'ড়', 'ঢ়'], correctAnswer: 'ঢ়' },
        ],
    },
    'banjanbarna3-yya': {
        id: 'banjanbarna3-yya', letter: 'য়', word: 'ময়ূর', wordEn: 'Peacock', emoji: '🦚',
        color: 'from-cyan-400 to-blue-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'য় — ময়ূর শব্দে আছে', content: 'য়' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ময়ূর', voiceText: 'ময়ূর', content: 'ময়ূর' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'য়', content: 'য়' },
            { id: 'e4', type: 'tap-correct', title: 'য় কোথায়?', voiceText: 'য় খুঁজে বের করো', content: 'য়', options: ['য', 'র', 'ড়', 'য়'], correctAnswer: 'য়' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'য় বুদবুদ ফাটাও', content: 'য়', options: ['য', 'র', 'ড়', 'য়'], correctAnswer: 'য়' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'য়', options: ['য', 'র', 'ড়', 'য়'], correctAnswer: 'য়' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'য়', options: ['য-যন্ত্র', 'র-রকেট', 'ড়-গড়', 'য়-ময়ূর'], correctAnswer: 'য়' },
            { id: 'e10', type: 'trace', title: 'লিখি — য়', voiceText: 'য় লেখো', content: 'য়' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ময়ূর শব্দে কোন বর্ণ আছে?', content: 'য়', options: ['য', 'র', 'ড়', 'য়'], correctAnswer: 'য়' },
        ],
    },
    'banjanbarna3-kha': {
        id: 'banjanbarna3-kha', letter: 'ৎ', word: 'উৎস', wordEn: 'Source', emoji: '💧',
        color: 'from-indigo-400 to-violet-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ৎ — উৎস শব্দে আছে', content: 'ৎ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — উৎস', voiceText: 'উৎস', content: 'উৎস' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ৎ', content: 'ৎ' },
            { id: 'e4', type: 'tap-correct', title: 'ৎ কোথায়?', voiceText: 'ৎ খুঁজে বের করো', content: 'ৎ', options: ['ত', 'ট', 'ৎ', 'ন'], correctAnswer: 'ৎ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ৎ বুদবুদ ফাটাও', content: 'ৎ', options: ['ত', 'ট', 'ৎ', 'ন'], correctAnswer: 'ৎ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক বর্ণ বেছে নাও', content: 'ৎ', options: ['ত', 'ট', 'ৎ', 'ন'], correctAnswer: 'ৎ' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'বর্ণ আর শব্দ মেলাও', content: 'ৎ', options: ['ত-তরমুজ', 'ট-টমেটো', 'ৎ-উৎস', 'ন-নৌকা'], correctAnswer: 'ৎ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ৎ', voiceText: 'ৎ লেখো', content: 'ৎ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'উৎস শব্দে কোন বর্ণ আছে?', content: 'ৎ', options: ['ত', 'ট', 'ৎ', 'ন'], correctAnswer: 'ৎ' },
        ],
    },

    // ─── বিশেষ চিহ্ন ─────────────────────────────────────────────
    'bishesh-anuswara': {
        id: 'bishesh-anuswara', letter: 'ং', word: 'বাংলাদেশ', wordEn: 'Bangladesh', emoji: '🇧🇩',
        color: 'from-green-400 to-emerald-600', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ং — অনুস্বার, বাংলাদেশ শব্দে আছে', content: 'ং' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — বাংলাদেশ', voiceText: 'বাংলাদেশ', content: 'বাংলাদেশ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ং', content: 'ং' },
            { id: 'e4', type: 'tap-correct', title: 'ং কোথায়?', voiceText: 'ং খুঁজে বের করো', content: 'ং', options: ['ঙ', 'ং', 'ঃ', 'ঁ'], correctAnswer: 'ং' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ং বুদবুদ ফাটাও', content: 'ং', options: ['ঙ', 'ং', 'ঃ', 'ঁ'], correctAnswer: 'ং' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক চিহ্ন বেছে নাও', content: 'ং', options: ['ঙ', 'ং', 'ঃ', 'ঁ'], correctAnswer: 'ং' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'চিহ্ন আর শব্দ মেলাও', content: 'ং', options: ['ং-বাংলা', 'ঃ-দুঃখ', 'ঁ-চাঁদ', 'ঙ-বাংলা'], correctAnswer: 'ং' },
            { id: 'e10', type: 'trace', title: 'লিখি — ং', voiceText: 'ং লেখো', content: 'ং' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'বাংলাদেশ শব্দে কোন চিহ্ন আছে?', content: 'ং', options: ['ঙ', 'ং', 'ঃ', 'ঁ'], correctAnswer: 'ং' },
        ],
    },
    'bishesh-visarga': {
        id: 'bishesh-visarga', letter: 'ঃ', word: 'দুঃখ', wordEn: 'Sorrow', emoji: '😢',
        color: 'from-blue-400 to-indigo-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঃ — বিসর্গ, দুঃখ শব্দে আছে', content: 'ঃ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — দুঃখ', voiceText: 'দুঃখ', content: 'দুঃখ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঃ', content: 'ঃ' },
            { id: 'e4', type: 'tap-correct', title: 'ঃ কোথায়?', voiceText: 'ঃ খুঁজে বের করো', content: 'ঃ', options: ['ঙ', 'ং', 'ঃ', 'ঁ'], correctAnswer: 'ঃ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ঃ বুদবুদ ফাটাও', content: 'ঃ', options: ['ঙ', 'ং', 'ঃ', 'ঁ'], correctAnswer: 'ঃ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক চিহ্ন বেছে নাও', content: 'ঃ', options: ['ঙ', 'ং', 'ঃ', 'ঁ'], correctAnswer: 'ঃ' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'চিহ্ন আর শব্দ মেলাও', content: 'ঃ', options: ['ং-বাংলা', 'ঃ-দুঃখ', 'ঁ-চাঁদ', 'ঙ-রং'], correctAnswer: 'ঃ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঃ', voiceText: 'ঃ লেখো', content: 'ঃ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'দুঃখ শব্দে কোন চিহ্ন আছে?', content: 'ঃ', options: ['ঙ', 'ং', 'ঃ', 'ঁ'], correctAnswer: 'ঃ' },
        ],
    },
    'bishesh-chandrabindu': {
        id: 'bishesh-chandrabindu', letter: 'ঁ', word: 'চাঁদ', wordEn: 'Moon', emoji: '🌙',
        color: 'from-violet-400 to-purple-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ঁ — চন্দ্রবিন্দু, চাঁদ শব্দে আছে', content: 'ঁ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — চাঁদ', voiceText: 'চাঁদ', content: 'চাঁদ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ঁ', content: 'ঁ' },
            { id: 'e4', type: 'tap-correct', title: 'ঁ কোথায়?', voiceText: 'ঁ খুঁজে বের করো', content: 'ঁ', options: ['ঙ', 'ং', 'ঃ', 'ঁ'], correctAnswer: 'ঁ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ঁ বুদবুদ ফাটাও', content: 'ঁ', options: ['ঙ', 'ং', 'ঃ', 'ঁ'], correctAnswer: 'ঁ' },
            { id: 'e7', type: 'letter-puzzle', title: 'ধাঁধা মেলাও!', voiceText: 'সঠিক চিহ্ন বেছে নাও', content: 'ঁ', options: ['ঙ', 'ং', 'ঃ', 'ঁ'], correctAnswer: 'ঁ' },
            { id: 'e9', type: 'matching', title: 'মেলাও!', voiceText: 'চিহ্ন আর শব্দ মেলাও', content: 'ঁ', options: ['ং-বাংলা', 'ঃ-দুঃখ', 'ঁ-চাঁদ', 'ঙ-রং'], correctAnswer: 'ঁ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ঁ', voiceText: 'ঁ লেখো', content: 'ঁ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'চাঁদ শব্দে কোন চিহ্ন আছে?', content: 'ঁ', options: ['ঙ', 'ং', 'ঃ', 'ঁ'], correctAnswer: 'ঁ' },
        ],
    },

    // ─── যুক্তবর্ণ ───────────────────────────────────────────────
    'jukta-ksha': {
        id: 'jukta-ksha', letter: 'ক্ষ', word: 'ক্ষমা', wordEn: 'Forgiveness', emoji: '🤝',
        color: 'from-violet-400 to-purple-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ক্ষ দিয়ে ক্ষমা', content: 'ক্ষ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ক্ষমা', voiceText: 'ক্ষমা', content: 'ক্ষমা' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ক্ষ', content: 'ক্ষ' },
            { id: 'e4', type: 'tap-correct', title: 'ক্ষ কোথায়?', voiceText: 'ক্ষ খুঁজে বের করো', content: 'ক্ষ', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'ক্ষ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ক্ষ বুদবুদ ফাটাও', content: 'ক্ষ', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'ক্ষ' },
            { id: 'e10', type: 'trace', title: 'লিখি — ক্ষ', voiceText: 'ক্ষ লেখো', content: 'ক্ষ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ক্ষমা কোন বর্ণ দিয়ে শুরু?', content: 'ক্ষ', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'ক্ষ' },
        ],
    },
    'jukta-gya': {
        id: 'jukta-gya', letter: 'জ্ঞ', word: 'জ্ঞান', wordEn: 'Knowledge', emoji: '📖',
        color: 'from-amber-400 to-yellow-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'জ্ঞ দিয়ে জ্ঞান', content: 'জ্ঞ' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — জ্ঞান', voiceText: 'জ্ঞান', content: 'জ্ঞান' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'জ্ঞান', content: 'জ্ঞ' },
            { id: 'e4', type: 'tap-correct', title: 'জ্ঞ কোথায়?', voiceText: 'জ্ঞ খুঁজে বের করো', content: 'জ্ঞ', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'জ্ঞ' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'জ্ঞ বুদবুদ ফাটাও', content: 'জ্ঞ', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'জ্ঞ' },
            { id: 'e10', type: 'trace', title: 'লিখি — জ্ঞ', voiceText: 'জ্ঞ লেখো', content: 'জ্ঞ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'জ্ঞান কোন বর্ণ দিয়ে শুরু?', content: 'জ্ঞ', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'জ্ঞ' },
        ],
    },
    'jukta-tra': {
        id: 'jukta-tra', letter: 'ত্র', word: 'ত্রিভুজ', wordEn: 'Triangle', emoji: '🔺',
        color: 'from-red-400 to-rose-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'ত্র দিয়ে ত্রিভুজ', content: 'ত্র' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — ত্রিভুজ', voiceText: 'ত্রিভুজ', content: 'ত্রিভুজ' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'ত্র', content: 'ত্র' },
            { id: 'e4', type: 'tap-correct', title: 'ত্র কোথায়?', voiceText: 'ত্র খুঁজে বের করো', content: 'ত্র', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'ত্র' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'ত্র বুদবুদ ফাটাও', content: 'ত্র', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'ত্র' },
            { id: 'e10', type: 'trace', title: 'লিখি — ত্র', voiceText: 'ত্র লেখো', content: 'ত্র' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'ত্রিভুজ কোন বর্ণ দিয়ে শুরু?', content: 'ত্র', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'ত্র' },
        ],
    },
    'jukta-shra': {
        id: 'jukta-shra', letter: 'শ্র', word: 'শ্রম', wordEn: 'Labour', emoji: '💪',
        color: 'from-blue-400 to-indigo-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'এটি কী?', voiceText: 'শ্র দিয়ে শ্রম', content: 'শ্র' },
            { id: 'e2', type: 'listen-repeat', title: 'বলো — শ্রম', voiceText: 'শ্রম', content: 'শ্রম' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'শ্র', content: 'শ্র' },
            { id: 'e4', type: 'tap-correct', title: 'শ্র কোথায়?', voiceText: 'শ্র খুঁজে বের করো', content: 'শ্র', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'শ্র' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'শ্র বুদবুদ ফাটাও', content: 'শ্র', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'শ্র' },
            { id: 'e10', type: 'trace', title: 'লিখি — শ্র', voiceText: 'শ্র লেখো', content: 'শ্র' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'শ্রম কোন বর্ণ দিয়ে শুরু?', content: 'শ্র', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'শ্র' },
        ],
    },
    'jukta-review': {
        id: 'jukta-review', letter: '★', word: 'রিভিশন', wordEn: 'Review', emoji: '🌟',
        color: 'from-yellow-400 to-amber-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/bangla',
        exercises: [
            { id: 'e1', type: 'intro', title: 'সব যুক্তবর্ণ', voiceText: 'সব যুক্তবর্ণ রিভিশন করি', content: '★' },
            { id: 'e4', type: 'tap-correct', title: 'ক্ষমা কোন বর্ণ?', voiceText: 'ক্ষমা কোন বর্ণ দিয়ে শুরু?', content: 'ক্ষ', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'ক্ষ' },
            { id: 'e5', type: 'tap-correct', title: 'জ্ঞান কোন বর্ণ?', voiceText: 'জ্ঞান কোন বর্ণ দিয়ে শুরু?', content: 'জ্ঞ', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'জ্ঞ' },
            { id: 'e6', type: 'tap-correct', title: 'ত্রিভুজ কোন বর্ণ?', voiceText: 'ত্রিভুজ কোন বর্ণ দিয়ে শুরু?', content: 'ত্র', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'ত্র' },
            { id: 'e7', type: 'matching', title: 'সব মেলাও!', voiceText: 'যুক্তবর্ণ আর শব্দ মেলাও', content: '★', options: ['ক্ষ-ক্ষমা', 'জ্ঞ-জ্ঞান', 'ত্র-ত্রিভুজ', 'শ্র-শ্রম'], correctAnswer: 'ক্ষ' },
            { id: 'e11', type: 'quiz', title: 'শেষ প্রশ্ন!', voiceText: 'শ্রম কোন বর্ণ দিয়ে শুরু?', content: 'শ্র', options: ['ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র'], correctAnswer: 'শ্র' },
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
                <p className="text-gray-400 mb-2">Lesson পাওয়া যায়নি</p>
                <p className="text-gray-600 text-sm">ID: {lessonId}</p>
            </div>
        </div>
    )

    return <LessonEngine lesson={lesson} />
}