'use client'

import { useParams } from 'next/navigation'
import LessonEngine, { LessonConfig } from '@/components/kids/LessonEngine'

const lessons: Record<string, LessonConfig> = {
    'math-1': {
        id: 'math-1',
        letter: '১',
        word: 'এক',
        wordEn: 'One',
        emoji: '☀️',
        color: 'from-amber-400 to-orange-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',

        exercises: [

            // ১. পরিচিতি
            {
                id: 'e1',
                type: 'intro',
                title: '🌞 আজ আমরা শিখবো সংখ্যা ১',
                voiceText:
                    'হ্যালো বন্ধু! দেখো আকাশে একটি সূর্য উঠেছে। একটি সূর্য মানেই সংখ্যা এক। আজ আমরা মজার খেলায় খেলায় সংখ্যা এক শিখবো।',
                content: '☀️\n\n১'
            },

            // ২. শোনা
            {
                id: 'e2',
                type: 'listen-repeat',
                title: '🎤 আমার পরে বলো',
                voiceText:
                    'এক... এক... এক...',
                content: 'এক'
            },

            // ৩. উচ্চারণ
            {
                id: 'e3',
                type: 'pronounce',
                title: '😊 এবার তুমি বলো',
                voiceText:
                    'জোরে বলো... এক',
                content: '১'
            },

            // ৪. সঠিক সংখ্যা নির্বাচন
            {
                id: 'e4',
                type: 'tap-correct',
                title: '👆 এক নম্বরটি খুঁজে বের করো',
                voiceText:
                    'এক সংখ্যাটিতে চাপ দাও।',
                content: '☀️',
                options: ['৩', '১', '৪', '২'],
                correctAnswer: '১'
            },

            // ৫. Bubble Pop
            {
                id: 'e5',
                type: 'bubble-pop',
                title: '🎈 এক লেখা বেলুন ফাটাও',
                voiceText:
                    'যে বেলুনে এক লেখা আছে সেটি ফাটাও।',
                content: '১',
                options: ['২', '১', '৪', '৩'],
                correctAnswer: '১'
            },

            // ৬. Archery
            // {
            //     id: 'e6',
            //     type: 'archery-target',
            //     title: '🏹 লক্ষ্যভেদ',
            //     voiceText:
            //         'তীর ছুঁড়ে এক সংখ্যাটিতে লাগাও।',
            //     content: '১',
            //     options: ['৪', '১', '২', '৩'],
            //     correctAnswer: '১'
            // },

            // ৭. Puzzle
            {
                id: 'e7',
                type: 'letter-puzzle',
                title: '🧩 সঠিক সংখ্যাটি বেছে নাও',
                voiceText:
                    'এক সংখ্যাটি খুঁজে বের করো।',
                content: '🥚',
                options: ['২', '৪', '১', '৩'],
                correctAnswer: '১'
            },

            // ৮. Matching
            {
                id: 'e8',
                type: 'matching',
                title: '🤝 জোড়া মিলাও',
                voiceText:
                    'সংখ্যা আর নাম মিলিয়ে দাও।',
                content: '১',
                options: [
                    '১-এক',
                    '২-দুই',
                    '৩-তিন',
                    '৪-চার'
                ],
                correctAnswer: '১'
            },

            // ৯. লেখা
            {
                id: 'e9',
                type: 'trace',
                title: '✍️ এবার লিখি',
                voiceText:
                    'আঙুল দিয়ে সুন্দর করে এক লেখো।',
                content: '১'
            },

            // ১০. Quiz
            {
                id: 'e10',
                type: 'quiz',
                title: '⭐ শেষ প্রশ্ন',
                voiceText:
                    'একটি সূর্য মানে কত?',
                content: '☀️',
                options: [
                    '১',
                    '২',
                    '৩',
                    '৪'
                ],

                correctAnswer: '১'

            }

        ]
    },
    'math-2': {
        id: 'math-2',
        letter: '২',
        word: 'দুই',
        wordEn: 'Two',
        emoji: '🥭',
        color: 'from-green-400 to-emerald-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',

        exercises: [

            // ১. পরিচিতি
            {
                id: 'e1',
                type: 'intro',
                title: '🥭 আজ আমরা শিখবো সংখ্যা ২',
                voiceText:
                    'দেখো বন্ধু! এখানে দুটি মিষ্টি আম আছে। একটি... দুটি। তাই এটি সংখ্যা দুই।',
                content: '🥭 🥭\n\n২'
            },

            // ২. শোনা
            {
                id: 'e2',
                type: 'listen-repeat',
                title: '🎤 আমার পরে বলো',
                voiceText:
                    'দুই... দুই... দুই...',
                content: 'দুই'
            },

            // ৩. উচ্চারণ
            {
                id: 'e3',
                type: 'pronounce',
                title: '😊 এবার তুমি বলো',
                voiceText:
                    'জোরে বলো... দুই',
                content: '২'
            },

            // ৪. সঠিক সংখ্যা নির্বাচন
            {
                id: 'e4',
                type: 'tap-correct',
                title: '👆 দুই নম্বরটি খুঁজে বের করো',
                voiceText:
                    'দুই সংখ্যাটিতে চাপ দাও।',
                content: '🥭 🥭',
                options: ['১', '৪', '২', '৩'],
                correctAnswer: '২'
            },

            // ৫. Bubble Pop
            {
                id: 'e5',
                type: 'bubble-pop',
                title: '🎈 দুই লেখা বেলুন ফাটাও',
                voiceText:
                    'যে বেলুনে দুই লেখা আছে সেটি ফাটাও।',
                content: '২',
                options: ['৪', '২', '৩', '১'],
                correctAnswer: '২'
            },

            // ৬. Archery
            // {
            //     id: 'e6',
            //     type: 'archery-target',
            //     title: '🏹 লক্ষ্যভেদ',
            //     voiceText:
            //         'তীর ছুঁড়ে দুই সংখ্যাটিতে লাগাও।',
            //     content: '২',
            //     options: ['২', '১', '৪', '৩'],
            //     correctAnswer: '২'
            // },

            // ৭. Puzzle
            {
                id: 'e7',
                type: 'letter-puzzle',
                title: '🧩 সঠিক সংখ্যাটি বেছে নাও',
                voiceText:
                    'দুই সংখ্যাটি খুঁজে বের করো।',
                content: '🥭 🥭',
                options: ['১', '৩', '২', '৪'],
                correctAnswer: '২'
            },

            // ৮. Matching
            {
                id: 'e8',
                type: 'matching',
                title: '🤝 জোড়া মিলাও',
                voiceText:
                    'সংখ্যা আর নাম মিলিয়ে দাও।',
                content: '২',
                options: [
                    '১-এক',
                    '২-দুই',
                    '৩-তিন',
                    '৪-চার'
                ],
                correctAnswer: '২'
            },

            // ৯. লেখা
            {
                id: 'e9',
                type: 'trace',
                title: '✍️ এবার লিখি',
                voiceText:
                    'আঙুল দিয়ে সুন্দর করে দুই লেখো।',
                content: '২'
            },

            // ১০. Quiz
            {
                id: 'e10',
                type: 'quiz',
                title: '⭐ শেষ প্রশ্ন',
                voiceText:
                    'এখানে কয়টি আম আছে?',
                content: '🥭 🥭',
                options: [
                    '১',
                    '৩',
                    '২',
                    '৪'
                ],
                correctAnswer: '২'
            }

        ]
    },
    'math-3': {
        id: 'math-3',
        letter: '৩',
        word: 'তিন',
        wordEn: 'Three',
        emoji: '🐟',
        color: 'from-cyan-400 to-blue-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: '🐟 আজ আমরা শিখবো সংখ্যা ৩',
                voiceText:
                    'রিমি নদীর ধারে গেল। সেখানে তিনটি মাছ সাঁতার কাটছে। একটি... দুটি... তিনটি। তাই এটি সংখ্যা তিন।',
                content: '🐟 🐟 🐟\n\n৩'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: '🎤 আমার পরে বলো',
                voiceText: 'তিন... তিন... তিন...',
                content: 'তিন'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: '😊 এবার তুমি বলো',
                voiceText: 'জোরে বলো... তিন',
                content: '৩'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: '👆 তিন নম্বরটি খুঁজে বের করো',
                voiceText: 'তিন সংখ্যাটিতে চাপ দাও।',
                content: '🐟 🐟 🐟',
                options: ['৩', '১', '২', '৪'],
                correctAnswer: '৩'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: '🎈 তিন লেখা বেলুন ফাটাও',
                voiceText: 'তিন লেখা বেলুনটি ফাটাও।',
                content: '৩',
                options: ['৪', '২', '৩', '১'],
                correctAnswer: '৩'
            },

            // {
            //     id: 'e6',
            //     type: 'archery-target',
            //     title: '🏹 লক্ষ্যভেদ',
            //     voiceText: 'তিন সংখ্যাটিতে তীর ছুঁড়ো।',
            //     content: '৩',
            //     options: ['১', '৩', '৪', '২'],
            //     correctAnswer: '৩'
            // },

            {
                id: 'e7',
                type: 'letter-puzzle',
                title: '🧩 সঠিক সংখ্যাটি খুঁজে নাও',
                voiceText: 'তিন সংখ্যাটি খুঁজে বের করো।',
                content: '🐟 🐟 🐟',
                options: ['২', '৪', '১', '৩'],
                correctAnswer: '৩'
            },

            {
                id: 'e8',
                type: 'matching',
                title: '🤝 জোড়া মিলাও',
                voiceText: 'সংখ্যা আর নাম মিলিয়ে দাও।',
                content: '৩',
                options: ['১-এক', '২-দুই', '৩-তিন', '৪-চার'],
                correctAnswer: '৩'
            },

            {
                id: 'e9',
                type: 'trace',
                title: '✍️ এবার লিখি',
                voiceText: 'আঙুল দিয়ে তিন লেখো।',
                content: '৩'
            },

            {
                id: 'e10',
                type: 'quiz',
                title: '⭐ শেষ প্রশ্ন',
                voiceText: 'এখানে কয়টি মাছ আছে?',
                content: '🐟 🐟 🐟',
                options: ['২', '৪', '৩', '১'],
                correctAnswer: '৩'
            }
        ]
    },
    'math-4': {
        id: 'math-4',
        letter: '৪',
        word: 'চার',
        wordEn: 'Four',
        emoji: '🌸',
        color: 'from-pink-400 to-rose-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: '🌸 আজ আমরা শিখবো সংখ্যা ৪',
                voiceText:
                    'রিমি আর রাফি ফুলের বাগানে গেল। সেখানে চারটি সুন্দর ফুল ফুটে আছে। একটি... দুটি... তিনটি... চারটি। তাই এটি সংখ্যা চার।',
                content: '🌸 🌸 🌸 🌸\n\n৪'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: '🎤 আমার পরে বলো',
                voiceText: 'চার... চার... চার...',
                content: 'চার'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: '😊 এবার তুমি বলো',
                voiceText: 'জোরে বলো... চার',
                content: '৪'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: '👆 চার নম্বরটি খুঁজে বের করো',
                voiceText: 'চার সংখ্যাটিতে চাপ দাও।',
                content: '🌸 🌸 🌸 🌸',
                options: ['৩', '১', '৪', '২'],
                correctAnswer: '৪'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: '🎈 চার লেখা বেলুন ফাটাও',
                voiceText: 'চার লেখা বেলুনটি ফাটাও।',
                content: '৪',
                options: ['২', '৪', '১', '৩'],
                correctAnswer: '৪'
            },

            // {
            //     id: 'e6',
            //     type: 'archery-target',
            //     title: '🏹 লক্ষ্যভেদ',
            //     voiceText: 'চার সংখ্যাটিতে তীর ছুঁড়ো।',
            //     content: '৪',
            //     options: ['১', '২', '৪', '৩'],
            //     correctAnswer: '৪'
            // },

            {
                id: 'e7',
                type: 'letter-puzzle',
                title: '🧩 সঠিক সংখ্যাটি খুঁজে নাও',
                voiceText: 'চার সংখ্যাটি খুঁজে বের করো।',
                content: '🌸 🌸 🌸 🌸',
                options: ['১', '৩', '২', '৪'],
                correctAnswer: '৪'
            },

            {
                id: 'e8',
                type: 'matching',
                title: '🤝 জোড়া মিলাও',
                voiceText: 'সংখ্যা আর নাম মিলিয়ে দাও।',
                content: '৪',
                options: [
                    '১-এক',
                    '২-দুই',
                    '৩-তিন',
                    '৪-চার'
                ],
                correctAnswer: '৪'
            },

            {
                id: 'e9',
                type: 'trace',
                title: '✍️ এবার লিখি',
                voiceText: 'আঙুল দিয়ে সুন্দর করে চার লেখো।',
                content: '৪'
            },

            {
                id: 'e10',
                type: 'quiz',
                title: '⭐ শেষ প্রশ্ন',
                voiceText: 'এখানে কয়টি ফুল আছে?',
                content: '🌸 🌸 🌸 🌸',
                options: ['৪', '৩', '২', '৫'],
                correctAnswer: '৪'
            }

        ]
    },
    'math-5': {
        id: 'math-5',
        letter: '৫',
        word: 'পাঁচ',
        wordEn: 'Five',
        emoji: '🪁',
        color: 'from-sky-400 to-blue-600',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: '🪁 আজ আমরা শিখবো সংখ্যা ৫',
                voiceText:
                    'রাফি মাঠে এসে দেখলো পাঁচটি রঙিন ঘুড়ি আকাশে উড়ছে। একটি... দুটি... তিনটি... চারটি... পাঁচটি। তাই এটি সংখ্যা পাঁচ।',
                content: '🪁 🪁 🪁 🪁 🪁\n\n৫'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: '🎤 আমার পরে বলো',
                voiceText: 'পাঁচ... পাঁচ... পাঁচ...',
                content: 'পাঁচ'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: '😊 এবার তুমি বলো',
                voiceText: 'জোরে বলো... পাঁচ',
                content: '৫'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: '👆 পাঁচ নম্বরটি খুঁজে বের করো',
                voiceText: 'পাঁচ সংখ্যাটিতে চাপ দাও।',
                content: '🪁 🪁 🪁 🪁 🪁',
                options: ['৪', '৫', '২', '৩'],
                correctAnswer: '৫'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: '🎈 পাঁচ লেখা বেলুন ফাটাও',
                voiceText: 'পাঁচ লেখা বেলুনটি ফাটাও।',
                content: '৫',
                options: ['১', '৫', '৩', '৪'],
                correctAnswer: '৫'
            },

            // {
            //     id: 'e6',
            //     type: 'archery-target',
            //     title: '🏹 লক্ষ্যভেদ',
            //     voiceText: 'পাঁচ সংখ্যাটিতে তীর ছুঁড়ো।',
            //     content: '৫',
            //     options: ['২', '৫', '১', '৪'],
            //     correctAnswer: '৫'
            // },

            {
                id: 'e7',
                type: 'letter-puzzle',
                title: '🧩 সঠিক সংখ্যাটি খুঁজে নাও',
                voiceText: 'পাঁচ সংখ্যাটি খুঁজে বের করো।',
                content: '🪁 🪁 🪁 🪁 🪁',
                options: ['৫', '২', '৩', '৪'],
                correctAnswer: '৫'
            },

            {
                id: 'e8',
                type: 'matching',
                title: '🤝 জোড়া মিলাও',
                voiceText: 'সংখ্যা আর নাম মিলিয়ে দাও।',
                content: '৫',
                options: [
                    '২-দুই',
                    '৫-পাঁচ',
                    '৩-তিন',
                    '৪-চার'
                ],
                correctAnswer: '৫'
            },

            {
                id: 'e9',
                type: 'trace',
                title: '✍️ এবার লিখি',
                voiceText: 'আঙুল দিয়ে সুন্দর করে পাঁচ লেখো।',
                content: '৫'
            },

            {
                id: 'e10',
                type: 'quiz',
                title: '⭐ শেষ প্রশ্ন',
                voiceText: 'এখানে কয়টি ঘুড়ি উড়ছে?',
                content: '🪁 🪁 🪁 🪁 🪁',
                options: ['৪', '৬', '৫', '৩'],
                correctAnswer: '৫'
            }

        ]
    },
    'math-6': {
        id: 'math-6',
        letter: '৬',
        word: 'ছয়',
        wordEn: 'Six',
        emoji: '🦆',
        color: 'from-yellow-400 to-orange-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: '🦆 আজ আমরা শিখবো সংখ্যা ৬',
                voiceText: 'রাফি পুকুরের ধারে গেল। সেখানে ছয়টি হাঁস পানিতে ভাসছে। একটি... দুটি... তিনটি... চারটি... পাঁচটি... ছয়টি।',
                content: '🦆 🦆 🦆 🦆 🦆 🦆\n\n৬'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: '🎤 আমার পরে বলো',
                voiceText: 'ছয়... ছয়... ছয়...',
                content: 'ছয়'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: '😊 এবার তুমি বলো',
                voiceText: 'জোরে বলো... ছয়',
                content: '৬'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: '👆 ছয় খুঁজে বের করো',
                voiceText: 'ছয় সংখ্যাটিতে চাপ দাও।',
                content: '🦆 🦆 🦆 🦆 🦆 🦆',
                options: ['৫', '৭', '৬', '৪'],
                correctAnswer: '৬'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: '🎈 ছয় লেখা বেলুন ফাটাও',
                voiceText: 'ছয় লেখা বেলুনটি ফাটাও।',
                content: '৬',
                options: ['৬', '৫', '৪', '৭'],
                correctAnswer: '৬'
            },

            // {
            //     id: 'e6',
            //     type: 'archery-target',
            //     title: '🏹 লক্ষ্যভেদ',
            //     voiceText: 'ছয় সংখ্যাটিতে তীর ছুঁড়ো।',
            //     content: '৬',
            //     options: ['৭', '৬', '৫', '৪'],
            //     correctAnswer: '৬'
            // },

            {
                id: 'e7',
                type: 'letter-puzzle',
                title: '🧩 সঠিক সংখ্যাটি খুঁজে নাও',
                voiceText: 'ছয় সংখ্যাটি বেছে নাও।',
                content: '🦆 🦆 🦆 🦆 🦆 🦆',
                options: ['৪', '৬', '৫', '৭'],
                correctAnswer: '৬'
            },

            {
                id: 'e8',
                type: 'matching',
                title: '🤝 জোড়া মিলাও',
                voiceText: 'সংখ্যা আর নাম মিলিয়ে দাও।',
                content: '৬',
                options: ['৬-ছয়', '৫-পাঁচ', '৪-চার', '৭-সাত'],
                correctAnswer: '৬'
            },

            {
                id: 'e9',
                type: 'trace',
                title: '✍️ এবার লিখি',
                voiceText: 'আঙুল দিয়ে ছয় লেখো।',
                content: '৬'
            },

            {
                id: 'e10',
                type: 'quiz',
                title: '⭐ শেষ প্রশ্ন',
                voiceText: 'এখানে কয়টি হাঁস আছে?',
                content: '🦆 🦆 🦆 🦆 🦆 🦆',
                options: ['৬', '৫', '৭', '৪'],
                correctAnswer: '৬'
            }

        ]
    },
    'math-7': {
        id: 'math-7',
        letter: '৭',
        word: 'সাত',
        wordEn: 'Seven',
        emoji: '🌈',
        color: 'from-indigo-400 to-purple-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: '🌈 আজ আমরা শিখবো সংখ্যা ৭',
                voiceText: 'বৃষ্টির পরে আকাশে সুন্দর রংধনু দেখা গেল। রংধনুতে সাতটি রং থাকে।',
                content: '🌈\n\n৭'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: '🎤 আমার পরে বলো',
                voiceText: 'সাত... সাত... সাত...',
                content: 'সাত'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: '😊 এবার তুমি বলো',
                voiceText: 'জোরে বলো... সাত',
                content: '৭'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: '👆 সাত খুঁজে বের করো',
                voiceText: 'সাত সংখ্যাটিতে চাপ দাও।',
                content: '🌈',
                options: ['৮', '৬', '৭', '৫'],
                correctAnswer: '৭'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: '🎈 সাত লেখা বেলুন ফাটাও',
                voiceText: 'সাত লেখা বেলুনটি ফাটাও।',
                content: '৭',
                options: ['৭', '৮', '৫', '৬'],
                correctAnswer: '৭'
            },

            {
                id: 'e6',
                type: 'archery-target',
                title: '🏹 লক্ষ্যভেদ',
                voiceText: 'সাত সংখ্যাটিতে তীর ছুঁড়ো।',
                content: '৭',
                options: ['৬', '৭', '৫', '৮'],
                correctAnswer: '৭'
            },

            {
                id: 'e7',
                type: 'letter-puzzle',
                title: '🧩 সঠিক সংখ্যাটি খুঁজে নাও',
                voiceText: 'সাত সংখ্যাটি বেছে নাও।',
                content: '🌈',
                options: ['৮', '৫', '৭', '৬'],
                correctAnswer: '৭'
            },

            {
                id: 'e8',
                type: 'matching',
                title: '🤝 জোড়া মিলাও',
                voiceText: 'সংখ্যা আর নাম মিলিয়ে দাও।',
                content: '৭',
                options: ['৭-সাত', '৬-ছয়', '৫-পাঁচ', '৮-আট'],
                correctAnswer: '৭'
            },

            {
                id: 'e9',
                type: 'trace',
                title: '✍️ এবার লিখি',
                voiceText: 'আঙুল দিয়ে সাত লেখো।',
                content: '৭'
            },

            {
                id: 'e10',
                type: 'quiz',
                title: '⭐ শেষ প্রশ্ন',
                voiceText: 'রংধনুতে কয়টি রং থাকে?',
                content: '🌈',
                options: ['৬', '৭', '৮', '৫'],
                correctAnswer: '৭'
            }

        ]
    },
    'math-8': {
        id: 'math-8',
        letter: '৮',
        word: 'আট',
        wordEn: 'Eight',
        emoji: '🍎',
        color: 'from-red-400 to-pink-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: '🍎 আজ আমরা শিখবো সংখ্যা ৮',
                voiceText: 'রিমির ঝুড়িতে আটটি লাল আপেল আছে। চল একসাথে গুনি।',
                content: '🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎\n\n৮'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: '🎤 আমার পরে বলো',
                voiceText: 'আট... আট... আট...',
                content: 'আট'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: '😊 এবার তুমি বলো',
                voiceText: 'জোরে বলো... আট',
                content: '৮'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: '👆 আট খুঁজে বের করো',
                voiceText: 'আট সংখ্যাটিতে চাপ দাও।',
                content: '🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎',
                options: ['৮', '৭', '৬', '৯'],
                correctAnswer: '৮'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: '🎈 আট লেখা বেলুন ফাটাও',
                voiceText: 'আট লেখা বেলুনটি ফাটাও।',
                content: '৮',
                options: ['৯', '৮', '৭', '৬'],
                correctAnswer: '৮'
            },

            {
                id: 'e6',
                type: 'archery-target',
                title: '🏹 লক্ষ্যভেদ',
                voiceText: 'আট সংখ্যাটিতে তীর ছুঁড়ো।',
                content: '৮',
                options: ['৬', '৮', '৯', '৭'],
                correctAnswer: '৮'
            },

            {
                id: 'e7',
                type: 'letter-puzzle',
                title: '🧩 সঠিক সংখ্যাটি খুঁজে নাও',
                voiceText: 'আট সংখ্যাটি বেছে নাও।',
                content: '🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎',
                options: ['৭', '৯', '৮', '৬'],
                correctAnswer: '৮'
            },

            {
                id: 'e8',
                type: 'matching',
                title: '🤝 জোড়া মিলাও',
                voiceText: 'সংখ্যা আর নাম মিলিয়ে দাও।',
                content: '৮',
                options: ['৮-আট', '৭-সাত', '৬-ছয়', '৯-নয়'],
                correctAnswer: '৮'
            },

            {
                id: 'e9',
                type: 'trace',
                title: '✍️ এবার লিখি',
                voiceText: 'আঙুল দিয়ে আট লেখো।',
                content: '৮'
            },

            {
                id: 'e10',
                type: 'quiz',
                title: '⭐ শেষ প্রশ্ন',
                voiceText: 'ঝুড়িতে কয়টি আপেল আছে?',
                content: '🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎',
                options: ['৭', '৮', '৯', '৬'],
                correctAnswer: '৮'
            }

        ]
    },
    'math-9': {
        id: 'math-9',
        letter: '৯',
        word: 'নয়',
        wordEn: 'Nine',
        emoji: '🐄',
        color: 'from-green-500 to-lime-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: '🐄 আজ আমরা শিখবো সংখ্যা ৯',
                voiceText: 'রিমি আর রাফি গ্রামের মাঠে গেল। সেখানে নয়টি গরু ঘাস খাচ্ছে। চল একসাথে গুনি।',
                content: '🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄\n\n৯'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: '🎤 আমার পরে বলো',
                voiceText: 'নয়... নয়... নয়...',
                content: 'নয়'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: '😊 এবার তুমি বলো',
                voiceText: 'জোরে বলো... নয়',
                content: '৯'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: '👆 নয় খুঁজে বের করো',
                voiceText: 'নয় সংখ্যাটিতে চাপ দাও।',
                content: '🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄',
                options: ['৮', '১০', '৯', '৭'],
                correctAnswer: '৯'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: '🎈 নয় লেখা বেলুন ফাটাও',
                voiceText: 'নয় লেখা বেলুনটি ফাটাও।',
                content: '৯',
                options: ['১০', '৯', '৮', '৭'],
                correctAnswer: '৯'
            },

            {
                id: 'e6',
                type: 'archery-target',
                title: '🏹 লক্ষ্যভেদ',
                voiceText: 'নয় সংখ্যাটিতে তীর ছুঁড়ো।',
                content: '৯',
                options: ['৮', '৯', '১০', '৭'],
                correctAnswer: '৯'
            },

            {
                id: 'e7',
                type: 'letter-puzzle',
                title: '🧩 সঠিক সংখ্যাটি খুঁজে নাও',
                voiceText: 'নয় সংখ্যাটি বেছে নাও।',
                content: '🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄',
                options: ['১০', '৮', '৯', '৭'],
                correctAnswer: '৯'
            },

            {
                id: 'e8',
                type: 'matching',
                title: '🤝 জোড়া মিলাও',
                voiceText: 'সংখ্যা আর নাম মিলিয়ে দাও।',
                content: '৯',
                options: [
                    '৯-নয়',
                    '৮-আট',
                    '১০-দশ',
                    '৭-সাত'
                ],
                correctAnswer: '৯'
            },

            {
                id: 'e9',
                type: 'trace',
                title: '✍️ এবার লিখি',
                voiceText: 'আঙুল দিয়ে নয় লেখো।',
                content: '৯'
            },

            {
                id: 'e10',
                type: 'quiz',
                title: '⭐ শেষ প্রশ্ন',
                voiceText: 'এখানে কয়টি গরু আছে?',
                content: '🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄',
                options: ['৮', '১০', '৯', '৭'],
                correctAnswer: '৯'
            }

        ]
    },
    'math-10': {
        id: 'math-10',
        letter: '১০',
        word: 'দশ',
        wordEn: 'Ten',
        emoji: '🇧🇩',
        color: 'from-red-500 to-green-600',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: '🇧🇩 আজ আমরা শিখবো সংখ্যা ১০',
                voiceText: 'অভিনন্দন বন্ধু! তুমি এখন দশ শিখবে। এখানে দশটি ছোট্ট বাংলাদেশের পতাকা আছে। চল একসাথে গুনি।',
                content: '🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩\n\n১০'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: '🎤 আমার পরে বলো',
                voiceText: 'দশ... দশ... দশ...',
                content: 'দশ'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: '😊 এবার তুমি বলো',
                voiceText: 'জোরে বলো... দশ',
                content: '১০'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: '👆 দশ খুঁজে বের করো',
                voiceText: 'দশ সংখ্যাটিতে চাপ দাও।',
                content: '🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩',
                options: ['৯', '১০', '৮', '৭'],
                correctAnswer: '১০'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: '🎈 দশ লেখা বেলুন ফাটাও',
                voiceText: 'দশ লেখা বেলুনটি ফাটাও।',
                content: '১০',
                options: ['৮', '১০', '৯', '৭'],
                correctAnswer: '১০'
            },

            {
                id: 'e6',
                type: 'archery-target',
                title: '🏹 লক্ষ্যভেদ',
                voiceText: 'দশ সংখ্যাটিতে তীর ছুঁড়ো।',
                content: '১০',
                options: ['৯', '১০', '৮', '৭'],
                correctAnswer: '১০'
            },

            {
                id: 'e7',
                type: 'letter-puzzle',
                title: '🧩 সঠিক সংখ্যাটি খুঁজে নাও',
                voiceText: 'দশ সংখ্যাটি বেছে নাও।',
                content: '🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩',
                options: ['৮', '৯', '১০', '৭'],
                correctAnswer: '১০'
            },

            {
                id: 'e8',
                type: 'matching',
                title: '🤝 জোড়া মিলাও',
                voiceText: 'সংখ্যা আর নাম মিলিয়ে দাও।',
                content: '১০',
                options: [
                    '১০-দশ',
                    '৯-নয়',
                    '৮-আট',
                    '৭-সাত'
                ],
                correctAnswer: '১০'
            },

            {
                id: 'e9',
                type: 'trace',
                title: '✍️ এবার লিখি',
                voiceText: 'আঙুল দিয়ে দশ লেখো।',
                content: '১০'
            },

            {
                id: 'e10',
                type: 'quiz',
                title: '🏆 অভিনন্দন!',
                voiceText: 'এখানে কয়টি পতাকা আছে? সঠিক উত্তর দিলে তুমি ১ থেকে ১০ পর্যন্ত সংখ্যা শেখা শেষ করবে।',
                content: '🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩 🇧🇩',
                options: ['৯', '৮', '১০', '৭'],
                correctAnswer: '১০'
            }

        ]
    },

    // ─── ১১ থেকে ২০ ──────────────────────────────────────────────
    'math-11': {
        id: 'math-11',
        letter: '১১',
        word: 'এগারো',
        wordEn: 'Eleven',
        emoji: '🥭',
        color: 'from-yellow-400 to-orange-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'আম বাগানে চল!',
                voiceText: 'রিমি আর রাফি আম বাগানে গেল। তারা গুনে দেখল মোট এগারোটি পাকা আম গাছে ঝুলছে!',
                content: '🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'বলো দেখি',
                voiceText: 'এগারো',
                content: '১১ = এগারো'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো',
                voiceText: 'এগারো',
                content: '১১'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: 'কোনটি ১১?',
                voiceText: 'এগারো সংখ্যাটি খুঁজে বের করো।',
                content: '১১',
                options: ['৯', '১০', '১১', '১২'],
                correctAnswer: '১১'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'বুদবুদ ফাটাও',
                voiceText: '১১ লেখা বুদবুদটি ফাটাও।',
                content: '১১',
                options: ['১১', '১২', '৯', '১০'],
                correctAnswer: '১১'
            },

            {
                id: 'e6',
                type: 'matching',
                title: 'জোড়া মেলাও',
                voiceText: 'সংখ্যার সাথে নাম মিলাও।',
                content: '১১',
                options: [
                    '১১-এগারো',
                    '১২-বারো',
                    '১৩-তেরো',
                    '১৪-চৌদ্দ'
                ],
                correctAnswer: '১১'
            },

            {
                id: 'e7',
                type: 'letter-puzzle',
                title: 'ধাঁধা সমাধান',
                voiceText: 'সঠিক সংখ্যাটি বেছে নাও।',
                content: '🥭 × ১১',
                options: ['১০', '১১', '১২', '১৩'],
                correctAnswer: '১১'
            },

            {
                id: 'e8',
                type: 'trace',
                title: 'চলো লিখি',
                voiceText: 'আঙুল দিয়ে এগারো লেখো।',
                content: '১১'
            },

            {
                id: 'e9',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'যদি গাছে এগারোটি আম থাকে, তাহলে সংখ্যা কত হবে?',
                content: '🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭',
                options: ['১০', '১১', '১২', '১৩'],
                correctAnswer: '১১'
            },

            {
                id: 'e10',
                type: 'intro',
                title: 'সাবাশ!',
                voiceText: 'অসাধারণ! তুমি আজ এগারো চিনতে শিখে গেছো।',
                content: '🎉 ১১ = এগারো'
            },
        ],
    },
    'math-12': {
        id: 'math-12',
        letter: '১২',
        word: 'বারো',
        wordEn: 'Twelve',
        emoji: '🐟',
        color: 'from-cyan-400 to-blue-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'জেলের নৌকায় চল!',
                voiceText: 'একজন জেলে নদী থেকে বারোটি ইলিশ মাছ ধরেছে। চলো গুনে দেখি!',
                content: '🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'বলো দেখি',
                voiceText: 'বারো',
                content: '১২ = বারো'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো',
                voiceText: 'বারো',
                content: '১২'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: 'কোনটি ১২?',
                voiceText: 'বারো সংখ্যাটি খুঁজে বের করো।',
                content: '১২',
                options: ['১১', '১২', '১৩', '১৪'],
                correctAnswer: '১২'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'মাছ ধরো!',
                voiceText: '১২ লেখা বুদবুদটি ধরো।',
                content: '১২',
                options: ['১২', '১০', '১৪', '১৩'],
                correctAnswer: '১২'
            },

            {
                id: 'e6',
                type: 'matching',
                title: 'জোড়া মেলাও',
                voiceText: 'সংখ্যার সাথে নাম মিলাও।',
                content: '১২',
                options: [
                    '১১-এগারো',
                    '১২-বারো',
                    '১৩-তেরো',
                    '১৪-চৌদ্দ'
                ],
                correctAnswer: '১২'
            },

            {
                id: 'e7',
                type: 'letter-puzzle',
                title: 'ধাঁধা সমাধান',
                voiceText: 'সঠিক সংখ্যাটি বেছে নাও।',
                content: '🐟 × ১২',
                options: ['১১', '১২', '১৩', '১৪'],
                correctAnswer: '১২'
            },

            {
                id: 'e8',
                type: 'trace',
                title: 'চলো লিখি',
                voiceText: 'আঙুল দিয়ে বারো লেখো।',
                content: '১২'
            },

            {
                id: 'e9',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'জেলে যদি বারোটি মাছ ধরে, তাহলে সংখ্যা কত?',
                content: '🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟',
                options: ['১১', '১২', '১৩', '১৪'],
                correctAnswer: '১২'
            },

            {
                id: 'e10',
                type: 'intro',
                title: 'সাবাশ!',
                voiceText: 'দারুণ! তুমি আজ বারো চিনতে শিখে গেছো।',
                content: '🎉 ১২ = বারো'
            },
        ],
    },
    'math-13': {
        id: 'math-13',
        letter: '১৩',
        word: 'তেরো',
        wordEn: 'Thirteen',
        emoji: '🌸',
        color: 'from-pink-400 to-rose-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'শাপলা ফুলের গল্প',
                voiceText: 'রিমি সকালে পুকুরে গেল। সেখানে ফুটে আছে তেরোটি সুন্দর শাপলা ফুল। চলো গুনে দেখি!',
                content: '🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'বলো দেখি',
                voiceText: 'তেরো',
                content: '১৩ = তেরো'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো',
                voiceText: 'তেরো',
                content: '১৩'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: 'কোনটি ১৩?',
                voiceText: 'তেরো সংখ্যাটি খুঁজে বের করো।',
                content: '১৩',
                options: ['১২', '১৩', '১৪', '১৫'],
                correctAnswer: '১৩'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'শাপলা ধরো!',
                voiceText: '১৩ লেখা বুদবুদটি ফাটাও।',
                content: '১৩',
                options: ['১৩', '১১', '১৪', '১৫'],
                correctAnswer: '১৩'
            },

            {
                id: 'e6',
                type: 'matching',
                title: 'জোড়া মেলাও',
                voiceText: 'সংখ্যার সাথে নাম মিলাও।',
                content: '১৩',
                options: [
                    '১২-বারো',
                    '১৩-তেরো',
                    '১৪-চৌদ্দ',
                    '১৫-পনেরো'
                ],
                correctAnswer: '১৩'
            },

            {
                id: 'e7',
                type: 'letter-puzzle',
                title: 'ধাঁধা সমাধান',
                voiceText: 'সঠিক সংখ্যাটি বেছে নাও।',
                content: '🌸 × ১৩',
                options: ['১২', '১৩', '১৪', '১৫'],
                correctAnswer: '১৩'
            },

            {
                id: 'e8',
                type: 'trace',
                title: 'চলো লিখি',
                voiceText: 'আঙুল দিয়ে তেরো লেখো।',
                content: '১৩'
            },

            {
                id: 'e9',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'পুকুরে যদি তেরোটি শাপলা ফুল থাকে, তাহলে সংখ্যা কত?',
                content: '🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸',
                options: ['১২', '১৩', '১৪', '১৫'],
                correctAnswer: '১৩'
            },

            {
                id: 'e10',
                type: 'intro',
                title: 'সাবাশ!',
                voiceText: 'অসাধারণ! তুমি আজ তেরো চিনতে শিখে গেছো।',
                content: '🎉 ১৩ = তেরো'
            },
        ],
    },
    'math-14': {
        id: 'math-14',
        letter: '১৪',
        word: 'চৌদ্দ',
        wordEn: 'Fourteen',
        emoji: '🦆',
        color: 'from-sky-400 to-cyan-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'পুকুরের হাঁস',
                voiceText: 'সকালে গ্রামের পুকুরে চৌদ্দটি হাঁস সাঁতার কাটছে। চলো সবাই মিলে গুনে দেখি!',
                content: '🦆🦆🦆🦆🦆🦆🦆🦆🦆🦆🦆🦆🦆🦆'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'বলো দেখি',
                voiceText: 'চৌদ্দ',
                content: '১৪ = চৌদ্দ'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো',
                voiceText: 'চৌদ্দ',
                content: '১৪'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: 'কোনটি ১৪?',
                voiceText: 'চৌদ্দ সংখ্যাটি খুঁজে বের করো।',
                content: '১৪',
                options: ['১৩', '১৪', '১৫', '১৬'],
                correctAnswer: '১৪'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'হাঁস বাঁচাও!',
                voiceText: '১৪ লেখা বুদবুদটি ফাটাও।',
                content: '১৪',
                options: ['১৪', '১৩', '১৫', '১৬'],
                correctAnswer: '১৪'
            },

            {
                id: 'e6',
                type: 'matching',
                title: 'জোড়া মেলাও',
                voiceText: 'সংখ্যার সাথে নাম মিলাও।',
                content: '১৪',
                options: [
                    '১৩-তেরো',
                    '১৪-চৌদ্দ',
                    '১৫-পনেরো',
                    '১৬-ষোল'
                ],
                correctAnswer: '১৪'
            },

            {
                id: 'e7',
                type: 'letter-puzzle',
                title: 'ধাঁধা সমাধান',
                voiceText: 'সঠিক সংখ্যাটি বেছে নাও।',
                content: '🦆 × ১৪',
                options: ['১৩', '১৪', '১৫', '১৬'],
                correctAnswer: '১৪'
            },

            {
                id: 'e8',
                type: 'trace',
                title: 'চলো লিখি',
                voiceText: 'আঙুল দিয়ে চৌদ্দ লেখো।',
                content: '১৪'
            },

            {
                id: 'e9',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'পুকুরে যদি চৌদ্দটি হাঁস থাকে, তাহলে সংখ্যা কত?',
                content: '🦆🦆🦆🦆🦆🦆🦆🦆🦆🦆🦆🦆🦆🦆',
                options: ['১৩', '১৪', '১৫', '১৬'],
                correctAnswer: '১৪'
            },

            {
                id: 'e10',
                type: 'intro',
                title: 'সাবাশ!',
                voiceText: 'দারুণ! তুমি আজ চৌদ্দ চিনতে শিখে গেছো।',
                content: '🎉 ১৪ = চৌদ্দ'
            },
        ],
    },
    'math-15': {
        id: 'math-15',
        letter: '১৫',
        word: 'পনেরো',
        wordEn: 'Fifteen',
        emoji: '🥭',
        color: 'from-orange-400 to-amber-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'হাটে চল!',
                voiceText: 'বাবার সাথে রাফি গ্রামের হাটে গেল। তারা পনেরোটি মিষ্টি আম কিনল। চলো গুনে দেখি!',
                content: '🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'বলো দেখি',
                voiceText: 'পনেরো',
                content: '১৫ = পনেরো'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো',
                voiceText: 'পনেরো',
                content: '১৫'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: 'কোনটি ১৫?',
                voiceText: 'পনেরো সংখ্যাটি খুঁজে বের করো।',
                content: '১৫',
                options: ['১৪', '১৫', '১৬', '১৭'],
                correctAnswer: '১৫'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'আম সংগ্রহ করো!',
                voiceText: '১৫ লেখা বুদবুদটি ফাটাও।',
                content: '১৫',
                options: ['১৫', '১৩', '১৪', '১৬'],
                correctAnswer: '১৫'
            },

            {
                id: 'e6',
                type: 'matching',
                title: 'জোড়া মেলাও',
                voiceText: 'সংখ্যার সাথে নাম মিলাও।',
                content: '১৫',
                options: [
                    '১৪-চৌদ্দ',
                    '১৫-পনেরো',
                    '১৬-ষোল',
                    '১৭-সতেরো'
                ],
                correctAnswer: '১৫'
            },

            {
                id: 'e7',
                type: 'letter-puzzle',
                title: 'ধাঁধা সমাধান',
                voiceText: 'সঠিক সংখ্যাটি বেছে নাও।',
                content: '🥭 × ১৫',
                options: ['১৪', '১৫', '১৬', '১৭'],
                correctAnswer: '১৫'
            },

            {
                id: 'e8',
                type: 'trace',
                title: 'চলো লিখি',
                voiceText: 'আঙুল দিয়ে পনেরো লেখো।',
                content: '১৫'
            },

            {
                id: 'e9',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'রাফি যদি পনেরোটি আম কিনে, তাহলে সংখ্যা কত হবে?',
                content: '🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭🥭',
                options: ['১৪', '১৫', '১৬', '১৭'],
                correctAnswer: '১৫'
            },

            {
                id: 'e10',
                type: 'intro',
                title: 'সাবাশ!',
                voiceText: 'অসাধারণ! তুমি আজ পনেরো চিনতে শিখে গেছো।',
                content: '🎉 ১৫ = পনেরো'
            },
        ],
    },
    'math-16': {
        id: 'math-16',
        letter: '১৬',
        word: 'ষোল',
        wordEn: 'Sixteen',
        emoji: '🥭',
        color: 'from-yellow-400 to-orange-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'চলো ১৬ শিখি!',
                voiceText: 'দেখো! ঝুড়িতে আছে ষোলটি মিষ্টি আম।',
                content: '🥭🥭🥭🥭 🥭🥭🥭🥭 🥭🥭🥭🥭 🥭🥭🥭🥭'
            },
            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'আমার পরে বলো',
                voiceText: 'ষোল',
                content: '১৬ — ষোল'
            },
            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো',
                voiceText: 'ষোল',
                content: '১৬'
            },
            {
                id: 'e4',
                type: 'tap-correct',
                title: '১৬ খুঁজে বের করো',
                voiceText: 'ষোল কোথায়?',
                content: '১৬',
                options: ['১৫', '১৬', '১৭', '১৮'],
                correctAnswer: '১৬'
            },
            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'বুদবুদ ফাটাও',
                voiceText: '১৬ ধরো',
                content: '১৬',
                options: ['১৪', '১৬', '১৮', '২০'],
                correctAnswer: '১৬'
            },
            {
                id: 'e6',
                type: 'matching',
                title: 'মিল খুঁজে বের করো',
                voiceText: 'সংখ্যা ও নাম মিলাও',
                content: '১৬',
                options: ['১৬-ষোল', '১৭-সতেরো', '১৮-আঠারো', '১৯-উনিশ'],
                correctAnswer: '১৬'
            },
            {
                id: 'e7',
                type: 'trace',
                title: '১৬ লেখো',
                voiceText: 'আঙুল দিয়ে ১৬ লেখো',
                content: '১৬'
            },
            {
                id: 'e8',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'ঝুড়িতে কয়টি আম?',
                content: '🥭 ×১৬',
                options: ['১৫', '১৬', '১৭', '১৮'],
                correctAnswer: '১৬'
            }
        ]
    },
    'math-17': {
        id: 'math-17',
        letter: '১৭',
        word: 'সতেরো',
        wordEn: 'Seventeen',
        emoji: '🐟',
        color: 'from-cyan-400 to-blue-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'চলো ১৭ শিখি!',
                voiceText: 'পুকুরে সতেরোটি মাছ আনন্দে সাঁতার কাটছে।',
                content: '🐟 ×১৭'
            },
            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'আমার পরে বলো',
                voiceText: 'সতেরো',
                content: '১৭ — সতেরো'
            },
            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো',
                voiceText: 'সতেরো',
                content: '১৭'
            },
            {
                id: 'e4',
                type: 'tap-correct',
                title: '১৭ কোথায়?',
                voiceText: '১৭ খুঁজে বের করো',
                content: '১৭',
                options: ['১৭', '১৬', '১৯', '২০'],
                correctAnswer: '১৭'
            },
            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'বুদবুদ ধরো',
                voiceText: '১৭ ধরো',
                content: '১৭',
                options: ['১৪', '১৭', '১৮', '১৫'],
                correctAnswer: '১৭'
            },
            {
                id: 'e6',
                type: 'matching',
                title: 'জোড়া মেলাও',
                voiceText: 'মিলাও',
                content: '১৭',
                options: ['১৭-সতেরো', '১৮-আঠারো', '১৯-উনিশ', '২০-কুড়ি'],
                correctAnswer: '১৭'
            },
            {
                id: 'e7',
                type: 'trace',
                title: '১৭ লেখো',
                voiceText: 'সুন্দর করে লেখো',
                content: '১৭'
            },
            {
                id: 'e8',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'পুকুরে কয়টি মাছ?',
                content: '🐟',
                options: ['১৭', '১৬', '১৮', '১৫'],
                correctAnswer: '১৭'
            }
        ]
    },
    'math-18': {
        id: 'math-18',
        letter: '১৮',
        word: 'আঠারো',
        wordEn: 'Eighteen',
        emoji: '🪁',
        color: 'from-pink-400 to-red-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'চলো ১৮ শিখি!',
                voiceText: 'আকাশে আঠারোটি রঙিন ঘুড়ি উড়ছে।',
                content: '🪁 ×১৮'
            },
            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'বলো দেখি',
                voiceText: 'আঠারো',
                content: '১৮'
            },
            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো',
                voiceText: 'আঠারো',
                content: '১৮'
            },
            {
                id: 'e4',
                type: 'tap-correct',
                title: '১৮ ধরো',
                voiceText: '১৮ কোথায়?',
                content: '১৮',
                options: ['১৮', '১৭', '১৬', '২০'],
                correctAnswer: '১৮'
            },
            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'ঘুড়ি ধরো',
                voiceText: '১৮ ধরো',
                content: '১৮',
                options: ['১৫', '১৮', '১৪', '১৯'],
                correctAnswer: '১৮'
            },
            {
                id: 'e6',
                type: 'matching',
                title: 'মিল খুঁজে বের করো',
                voiceText: '১৮ এর নাম মিলাও',
                content: '১৮',
                options: ['১৮-আঠারো', '১৭-সতেরো', '১৬-ষোল', '২০-কুড়ি'],
                correctAnswer: '১৮'
            },
            {
                id: 'e7',
                type: 'trace',
                title: '১৮ লেখো',
                voiceText: 'আঙুল দিয়ে লেখো',
                content: '১৮'
            },
            {
                id: 'e8',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'কয়টি ঘুড়ি?',
                content: '🪁',
                options: ['১৭', '১৮', '১৯', '২০'],
                correctAnswer: '১৮'
            }
        ]
    },
    'math-19': {
        id: 'math-19',
        letter: '১৯',
        word: 'উনিশ',
        wordEn: 'Nineteen',
        emoji: '🥚',
        color: 'from-slate-400 to-gray-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'চলো ১৯ শিখি!',
                voiceText: 'ঝুড়িতে উনিশটি ডিম আছে।',
                content: '🥚 ×১৯'
            },
            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'বলো দেখি',
                voiceText: 'উনিশ',
                content: '১৯'
            },
            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো',
                voiceText: 'উনিশ',
                content: '১৯'
            },
            {
                id: 'e4',
                type: 'tap-correct',
                title: '১৯ খুঁজে বের করো',
                voiceText: '১৯ কোথায়?',
                content: '১৯',
                options: ['২০', '১৮', '১৯', '১৭'],
                correctAnswer: '১৯'
            },
            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'সঠিকটি ধরো',
                voiceText: '১৯ ধরো',
                content: '১৯',
                options: ['১৯', '১৫', '১৬', '২০'],
                correctAnswer: '১৯'
            },
            {
                id: 'e6',
                type: 'matching',
                title: 'জোড়া মেলাও',
                voiceText: 'সংখ্যা মিলাও',
                content: '১৯',
                options: ['১৯-উনিশ', '২০-কুড়ি', '১৮-আঠারো', '১৭-সতেরো'],
                correctAnswer: '১৯'
            },
            {
                id: 'e7',
                type: 'trace',
                title: '১৯ লেখো',
                voiceText: 'লিখে ফেলো',
                content: '১৯'
            },
            {
                id: 'e8',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'কয়টি ডিম?',
                content: '🥚',
                options: ['১৮', '২০', '১৯', '১৭'],
                correctAnswer: '১৯'
            }
        ]
    },
    'math-20': {
        id: 'math-20',
        letter: '২০',
        word: 'কুড়ি',
        wordEn: 'Twenty',
        emoji: '⚽',
        color: 'from-green-400 to-emerald-600',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'চলো ২০ শিখি!',
                voiceText: 'মাঠে কুড়িটি ফুটবল সাজানো আছে।',
                content: '⚽ ×২০'
            },
            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'আমার পরে বলো',
                voiceText: 'কুড়ি',
                content: '২০'
            },
            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো',
                voiceText: 'কুড়ি',
                content: '২০'
            },
            {
                id: 'e4',
                type: 'tap-correct',
                title: '২০ কোথায়?',
                voiceText: '২০ খুঁজে বের করো',
                content: '২০',
                options: ['১৮', '১৯', '২০', '২১'],
                correctAnswer: '২০'
            },
            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'বল ধরো',
                voiceText: '২০ ধরো',
                content: '২০',
                options: ['১৭', '২০', '১৮', '১৬'],
                correctAnswer: '২০'
            },
            {
                id: 'e6',
                type: 'matching',
                title: 'মিলাও',
                voiceText: 'সংখ্যা ও নাম মিলাও',
                content: '২০',
                options: ['২০-কুড়ি', '১৯-উনিশ', '১৮-আঠারো', '১৭-সতেরো'],
                correctAnswer: '২০'
            },
            {
                id: 'e7',
                type: 'trace',
                title: '২০ লেখো',
                voiceText: 'সুন্দর করে লেখো',
                content: '২০'
            },
            {
                id: 'e8',
                type: 'quiz',
                title: 'অভিনন্দন!',
                voiceText: 'মাঠে কয়টি বল আছে?',
                content: '⚽',
                options: ['১৯', '২০', '২১', '১৮'],
                correctAnswer: '২০'
            }
        ]
    },

    // ─── ২১ থেকে ৩০ ──────────────────────────────────────────────
    'add-1': {
        id: 'add-1',
        letter: '১+১',
        word: 'এক যোগ এক',
        wordEn: '1 + 1',
        emoji: '🍎',
        color: 'from-pink-400 to-red-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math/addition',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: '🍎 রিমার দুটি আম',
                voiceText:
                    'রিমার কাছে একটি আম ছিল। মা তাকে আরও একটি আম দিলেন। এখন রিমার কাছে মোট কয়টি আম?',
                content: '🍎 + 🍎'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'চলো একসাথে বলি',
                voiceText:
                    'একটি আম... আর একটি আম... মোট দুইটি আম। এক যোগ এক সমান দুই।',
                content: '১ + ১ = ২'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো বন্ধু!',
                voiceText:
                    'এক যোগ এক সমান দুই',
                content: '১ + ১ = ২'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: '🍎 কয়টি আম আছে?',
                voiceText:
                    'দেখো তো, এখানে মোট কয়টি আম আছে?',
                content: '🍎 🍎',
                options: ['১', '২', '৩', '৪'],
                correctAnswer: '২'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: '🎈 সঠিক উত্তর ফাটাও',
                voiceText:
                    'দুই সংখ্যাটি খুঁজে বের করে ফাটিয়ে দাও!',
                content: '🍎🍎',
                options: ['১', '২', '৩', '৪'],
                correctAnswer: '২'
            },

            {
                id: 'e6',
                type: 'letter-puzzle',
                title: '🧩 উত্তর সাজাও',
                voiceText:
                    'এক যোগ এক করলে কত হয়?',
                content: '১ + ১ = ?',
                options: ['১', '২', '৩', '৪'],
                correctAnswer: '২'
            },

            {
                id: 'e7',
                type: 'matching',
                title: '🤝 জোড়া মিলাও',
                voiceText:
                    'ছবির সাথে সঠিক সংখ্যা মিলিয়ে দাও।',
                content: '🍎🍎',
                options: [
                    '🍎🍎-২',
                    '🐟🐟🐟-৩',
                    '🌸🌸🌸🌸-৪',
                    '🥚-১'
                ],
                correctAnswer: '🍎🍎-২'
            },

            {
                id: 'e8',
                type: 'trace',
                title: '✍️ এবার ২ লিখি',
                voiceText:
                    'রিমার এখন দুইটি আম হয়েছে। এবার সুন্দর করে ২ লেখো।',
                content: '২'
            },

            {
                id: 'e9',
                type: 'quiz',
                title: '🏆 ছোট্ট কুইজ',
                voiceText:
                    'রাফির কাছে একটি আম ছিল। বাবা তাকে আরও একটি আম দিলেন। এখন রাফির কাছে কয়টি আম?',
                content: '🍎 + 🍎',
                options: ['১', '২', '৩', '৪'],
                correctAnswer: '২'
            }

        ]
    },
    'add-2': {
        id: 'add-2',
        letter: '২+১',
        word: 'দুই যোগ এক',
        wordEn: '2 + 1',
        emoji: '🥭',
        color: 'from-yellow-400 to-orange-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math/addition',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: '🥭 আম গাছে নতুন আম',
                voiceText:
                    'আম গাছে দুটি আম ছিল। পরে আরও একটি আম ধরলো। এখন মোট কয়টি আম?',
                content: '🥭🥭 + 🥭'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'চলো একসাথে বলি',
                voiceText:
                    'দুটি আম... আরও একটি আম... মোট তিনটি আম। দুই যোগ এক সমান তিন।',
                content: '২ + ১ = ৩'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো বন্ধু!',
                voiceText:
                    'দুই যোগ এক সমান তিন',
                content: '২ + ১ = ৩'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: '🥭 কয়টি আম আছে?',
                voiceText:
                    'সবগুলো আম গুনে সঠিক উত্তর বলো।',
                content: '🥭 🥭 🥭',
                options: ['২', '৩', '৪', '৫'],
                correctAnswer: '৩'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: '🎈 তিনকে ধরো',
                voiceText:
                    'তিন সংখ্যাটি খুঁজে বের করে ফাটিয়ে দাও।',
                content: '🥭🥭🥭',
                options: ['২', '৩', '৪', '৫'],
                correctAnswer: '৩'
            },

            {
                id: 'e6',
                type: 'letter-puzzle',
                title: '🧩 উত্তর সাজাও',
                voiceText:
                    'দুই যোগ এক করলে কত হয়?',
                content: '২ + ১ = ?',
                options: ['২', '৩', '৪', '৫'],
                correctAnswer: '৩'
            },

            {
                id: 'e7',
                type: 'matching',
                title: '🤝 জোড়া মিলাও',
                voiceText:
                    'ছবির সাথে সঠিক সংখ্যা মিলিয়ে দাও।',
                content: '🥭🥭🥭',
                options: [
                    '🥭🥭🥭-৩',
                    '🐟🐟-২',
                    '🌸🌸🌸🌸-৪',
                    '🥚🥚🥚🥚🥚-৫'
                ],
                correctAnswer: '🥭🥭🥭-৩'
            },

            {
                id: 'e8',
                type: 'trace',
                title: '✍️ এবার ৩ লিখি',
                voiceText:
                    'এখন তিনটি আম হয়েছে। সুন্দর করে ৩ লেখো।',
                content: '৩'
            },

            {
                id: 'e9',
                type: 'quiz',
                title: '🏆 ছোট্ট কুইজ',
                voiceText:
                    'সুমাইয়ার ঝুড়িতে দুটি আম ছিল। দাদু তাকে আরও একটি আম দিলেন। এখন ঝুড়িতে মোট কয়টি আম?',
                content: '🥭🥭 + 🥭',
                options: ['২', '৩', '৪', '৫'],
                correctAnswer: '৩'
            }

        ]
    },
    'add-3': {
        id: 'add-3',
        letter: '৩+১',
        word: 'তিন যোগ এক',
        wordEn: '3 + 1',
        emoji: '🐟',
        color: 'from-cyan-400 to-blue-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math/addition',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: '🐟 পুকুরে নতুন মাছ',
                voiceText:
                    'পুকুরে তিনটি মাছ সাঁতার কাটছিল। একটু পরে আরও একটি মাছ এসে যোগ দিল। এখন মোট কয়টি মাছ?',
                content: '🐟🐟🐟 + 🐟'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'চলো একসাথে বলি',
                voiceText:
                    'তিনটি মাছ... আরও একটি মাছ... মোট চারটি মাছ। তিন যোগ এক সমান চার।',
                content: '৩ + ১ = ৪'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো বন্ধু!',
                voiceText: 'তিন যোগ এক সমান চার',
                content: '৩ + ১ = ৪'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: '🐟 কয়টি মাছ আছে?',
                voiceText:
                    'সবগুলো মাছ গুনে সঠিক উত্তর চাপো।',
                content: '🐟 🐟 🐟 🐟',
                options: ['৩', '৪', '৫', '৬'],
                correctAnswer: '৪'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: '🎈 চারকে ধরো',
                voiceText:
                    'চার সংখ্যাটি খুঁজে বের করে ফাটিয়ে দাও।',
                content: '🐟🐟🐟🐟',
                options: ['৩', '৪', '৫', '৬'],
                correctAnswer: '৪'
            },

            {
                id: 'e6',
                type: 'letter-puzzle',
                title: '🧩 উত্তর সাজাও',
                voiceText:
                    'তিন যোগ এক করলে কত হয়?',
                content: '৩ + ১ = ?',
                options: ['৩', '৪', '৫', '৬'],
                correctAnswer: '৪'
            },

            {
                id: 'e7',
                type: 'matching',
                title: '🤝 জোড়া মিলাও',
                voiceText:
                    'ছবির সাথে সঠিক সংখ্যা মিলিয়ে দাও।',
                content: '🐟🐟🐟🐟',
                options: [
                    '🐟🐟🐟🐟-৪',
                    '🌸🌸🌸-৩',
                    '🥚🥚🥚🥚🥚-৫',
                    '🪁🪁🪁🪁🪁🪁-৬'
                ],
                correctAnswer: '🐟🐟🐟🐟-৪'
            },

            {
                id: 'e8',
                type: 'trace',
                title: '✍️ এবার ৪ লিখি',
                voiceText:
                    'এখন চারটি মাছ হয়েছে। সুন্দর করে ৪ লেখো।',
                content: '৪'
            },

            {
                id: 'e9',
                type: 'quiz',
                title: '🏆 ছোট্ট কুইজ',
                voiceText:
                    'পুকুরে তিনটি মাছ ছিল। পরে আরও একটি মাছ এলো। এখন মোট কয়টি মাছ?',
                content: '🐟🐟🐟 + 🐟',
                options: ['৩', '৪', '৫', '৬'],
                correctAnswer: '৪'
            }

        ]
    },
    'add-4': {
        id: 'add-4',
        letter: '৪+১',
        word: 'চার যোগ এক',
        wordEn: '4 + 1',
        emoji: '🌸',
        color: 'from-pink-400 to-rose-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math/addition',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: '🌸 ফুলের বাগানে নতুন ফুল',
                voiceText:
                    'বাগানে চারটি সুন্দর ফুল ফুটেছিল। সকালে আরও একটি ফুল ফুটলো। এখন মোট কয়টি ফুল?',
                content: '🌸🌸🌸🌸 + 🌸'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'চলো একসাথে বলি',
                voiceText:
                    'চারটি ফুল... আরও একটি ফুল... মোট পাঁচটি ফুল। চার যোগ এক সমান পাঁচ।',
                content: '৪ + ১ = ৫'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো বন্ধু!',
                voiceText: 'চার যোগ এক সমান পাঁচ',
                content: '৪ + ১ = ৫'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: '🌸 কয়টি ফুল আছে?',
                voiceText:
                    'সবগুলো ফুল গুনে সঠিক উত্তর চাপো।',
                content: '🌸 🌸 🌸 🌸 🌸',
                options: ['৪', '৫', '৬', '৭'],
                correctAnswer: '৫'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: '🎈 পাঁচকে ধরো',
                voiceText:
                    'পাঁচ সংখ্যাটি খুঁজে বের করে ফাটিয়ে দাও।',
                content: '🌸🌸🌸🌸🌸',
                options: ['৪', '৫', '৬', '৭'],
                correctAnswer: '৫'
            },

            {
                id: 'e6',
                type: 'letter-puzzle',
                title: '🧩 উত্তর সাজাও',
                voiceText:
                    'চার যোগ এক করলে কত হয়?',
                content: '৪ + ১ = ?',
                options: ['৪', '৫', '৬', '৭'],
                correctAnswer: '৫'
            },

            {
                id: 'e7',
                type: 'matching',
                title: '🤝 জোড়া মিলাও',
                voiceText:
                    'ছবির সাথে সঠিক সংখ্যা মিলিয়ে দাও।',
                content: '🌸🌸🌸🌸🌸',
                options: [
                    '🌸🌸🌸🌸🌸-৫',
                    '🐟🐟🐟🐟-৪',
                    '🥚🥚🥚🥚🥚🥚-৬',
                    '🪁🪁🪁-৩'
                ],
                correctAnswer: '🌸🌸🌸🌸🌸-৫'
            },

            {
                id: 'e8',
                type: 'trace',
                title: '✍️ এবার ৫ লিখি',
                voiceText:
                    'এখন পাঁচটি ফুল হয়েছে। সুন্দর করে ৫ লেখো।',
                content: '৫'
            },

            {
                id: 'e9',
                type: 'quiz',
                title: '🏆 ছোট্ট কুইজ',
                voiceText:
                    'মায়ার বাগানে চারটি ফুল ছিল। সকালে আরও একটি ফুল ফুটলো। এখন মোট কয়টি ফুল?',
                content: '🌸🌸🌸🌸 + 🌸',
                options: ['৪', '৫', '৬', '৭'],
                correctAnswer: '৫'
            }

        ]
    },
    'add-5': {
        id: 'add-5',
        letter: '৫+১',
        word: 'পাঁচ যোগ এক',
        wordEn: '5 + 1',
        emoji: '🪁',
        color: 'from-sky-400 to-indigo-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math/addition',

        exercises: [

            {
                id: 'e1',
                type: 'intro',
                title: '🪁 আকাশে নতুন ঘুড়ি',
                voiceText:
                    'আকাশে পাঁচটি রঙিন ঘুড়ি উড়ছিল। একটু পরে আরও একটি ঘুড়ি উড়লো। এখন আকাশে মোট কয়টি ঘুড়ি?',
                content: '🪁🪁🪁🪁🪁 + 🪁'
            },

            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'চলো একসাথে বলি',
                voiceText:
                    'পাঁচটি ঘুড়ি... আরও একটি ঘুড়ি... মোট ছয়টি ঘুড়ি। পাঁচ যোগ এক সমান ছয়।',
                content: '৫ + ১ = ৬'
            },

            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো বন্ধু!',
                voiceText:
                    'পাঁচ যোগ এক সমান ছয়',
                content: '৫ + ১ = ৬'
            },

            {
                id: 'e4',
                type: 'tap-correct',
                title: '🪁 কয়টি ঘুড়ি আছে?',
                voiceText:
                    'সবগুলো ঘুড়ি গুনে সঠিক উত্তর চাপো।',
                content: '🪁 🪁 🪁 🪁 🪁 🪁',
                options: ['৫', '৬', '৭', '৮'],
                correctAnswer: '৬'
            },

            {
                id: 'e5',
                type: 'bubble-pop',
                title: '🎈 ছয়কে ধরো',
                voiceText:
                    'ছয় সংখ্যাটি খুঁজে বের করে ফাটিয়ে দাও।',
                content: '🪁🪁🪁🪁🪁🪁',
                options: ['৫', '৬', '৭', '৮'],
                correctAnswer: '৬'
            },

            {
                id: 'e6',
                type: 'letter-puzzle',
                title: '🧩 উত্তর সাজাও',
                voiceText:
                    'পাঁচ যোগ এক করলে কত হয়?',
                content: '৫ + ১ = ?',
                options: ['৫', '৬', '৭', '৮'],
                correctAnswer: '৬'
            },

            {
                id: 'e7',
                type: 'matching',
                title: '🤝 জোড়া মিলাও',
                voiceText:
                    'ছবির সাথে সঠিক সংখ্যা মিলিয়ে দাও।',
                content: '🪁🪁🪁🪁🪁🪁',
                options: [
                    '🪁🪁🪁🪁🪁🪁-৬',
                    '🌸🌸🌸🌸🌸-৫',
                    '🐟🐟🐟🐟-৪',
                    '🥚🥚🥚🥚🥚🥚🥚-৭'
                ],
                correctAnswer: '🪁🪁🪁🪁🪁🪁-৬'
            },

            {
                id: 'e8',
                type: 'trace',
                title: '✍️ এবার ৬ লিখি',
                voiceText:
                    'এখন আকাশে ছয়টি ঘুড়ি। সুন্দর করে ৬ লেখো।',
                content: '৬'
            },

            {
                id: 'e9',
                type: 'quiz',
                title: '🏆 ছোট্ট কুইজ',
                voiceText:
                    'রাহাত পাঁচটি ঘুড়ি উড়াচ্ছিল। তার বন্ধু আরও একটি ঘুড়ি উড়ালো। এখন আকাশে মোট কয়টি ঘুড়ি?',
                content: '🪁🪁🪁🪁🪁 + 🪁',
                options: ['৫', '৬', '৭', '৮'],
                correctAnswer: '৬'
            }

        ]
    },

    // ─── বিয়োগ ───────────────────────────────────────────────────
    'math-sub-1': {
        id: 'math-sub-1',
        letter: '৫-১',
        word: '৫-১=৪',
        wordEn: '5-1=4',
        emoji: '🥭',
        color: 'from-red-400 to-rose-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        showDotCount: false,
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'আম গাছের গল্প!',
                voiceText: 'গাছে ছিল পাঁচটি মিষ্টি আম। একটি আম পেড়ে নিলে বাকি থাকে চারটি আম। তাই ৫ বিয়োগ ১ সমান ৪।',
                content: '🥭🥭🥭🥭🥭 ➜ 🥭🥭🥭🥭'
            },
            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'আমার সাথে বলো',
                voiceText: 'পাঁচ বিয়োগ এক সমান চার।',
                content: '৫-১=৪'
            },
            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো বন্ধু!',
                voiceText: 'পাঁচ বিয়োগ এক সমান চার',
                content: '৫-১=৪'
            },
            {
                id: 'e4',
                type: 'tap-correct',
                title: 'কত থাকে?',
                voiceText: 'পাঁচটা আম থেকে একটা নিলে কয়টা থাকে?',
                content: '🥭🥭🥭🥭🥭',
                options: ['৩', '৪', '৫', '৬'],
                correctAnswer: '৪'
            },
            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'সঠিক উত্তর ধরো!',
                voiceText: 'চার সংখ্যাটি ধরো।',
                content: '৪',
                options: ['৩', '৪', '৫', '৬'],
                correctAnswer: '৪'
            },
            {
                id: 'e7',
                type: 'letter-puzzle',
                title: 'বিয়োগ মিলাও',
                voiceText: 'সঠিক উত্তরটি বেছে নাও।',
                content: '৫-১',
                options: ['৪', '৩', '৫', '২'],
                correctAnswer: '৪'
            },
            {
                id: 'e8',
                type: 'matching',
                title: 'জোড়া মেলাও',
                voiceText: 'বিয়োগের সাথে উত্তর মিলাও।',
                content: '৪',
                options: ['৫-১=৪', '৬-২=৪', '৮-৩=৫', '১০-৫=৫'],
                correctAnswer: '৫-১=৪'
            },
            {
                id: 'e9',
                type: 'trace',
                title: 'চলো লিখি',
                voiceText: 'চার লেখো।',
                content: '৪'
            },
            {
                id: 'e10',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'পাঁচটি আম থেকে একটি আম খেলে কয়টি থাকে?',
                content: '৪',
                options: ['৩', '৪', '৫', '৬'],
                correctAnswer: '৪'
            }
        ]
    },

    'math-sub-2': {
        id: 'math-sub-2',
        letter: '৬-২',
        word: '৬-২=৪',
        wordEn: '6-2=4',
        emoji: '🎈',
        color: 'from-pink-400 to-rose-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        showDotCount: false,
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'বেলুন উড়ে গেল!',
                voiceText: 'ছয়টি বেলুন ছিল। দুটি উড়ে গেল। এখন থাকে চারটি বেলুন।',
                content: '🎈🎈🎈🎈🎈🎈 ➜ 🎈🎈🎈🎈'
            },
            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'বলো দেখি',
                voiceText: 'ছয় বিয়োগ দুই সমান চার।',
                content: '৬-২=৪'
            },
            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো',
                voiceText: 'ছয় বিয়োগ দুই সমান চার',
                content: '৬-২=৪'
            },
            {
                id: 'e4',
                type: 'tap-correct',
                title: 'কয়টি বেলুন রইলো?',
                voiceText: 'ছয়টা থেকে দুইটা উড়ে গেলে কত থাকে?',
                content: '🎈🎈🎈🎈🎈🎈',
                options: ['২', '৩', '৪', '৫'],
                correctAnswer: '৪'
            },
            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'সঠিক উত্তর ধরো!',
                voiceText: 'চার সংখ্যাটি ধরো।',
                content: '৪',
                options: ['২', '৩', '৪', '৫'],
                correctAnswer: '৪'
            },
            {
                id: 'e7',
                type: 'letter-puzzle',
                title: 'উত্তর খুঁজে বের করো',
                voiceText: '৬-২ কত?',
                content: '৬-২',
                options: ['৩', '৪', '৫', '২'],
                correctAnswer: '৪'
            },
            {
                id: 'e8',
                type: 'matching',
                title: 'মেলাও',
                voiceText: 'সঠিক জোড়া খুঁজে বের করো।',
                content: '৪',
                options: ['৫-১=৪', '৬-২=৪', '৮-৩=৫', '১০-৫=৫'],
                correctAnswer: '৬-২=৪'
            },
            {
                id: 'e9',
                type: 'trace',
                title: 'চার লেখো',
                voiceText: 'চার লিখে দেখাও।',
                content: '৪'
            },
            {
                id: 'e10',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'ছয়টা বেলুন থেকে দুইটা উড়ে গেলে কয়টা থাকে?',
                content: '৪',
                options: ['২', '৩', '৪', '৫'],
                correctAnswer: '৪'
            }
        ]
    },

    'math-sub-3': {
        id: 'math-sub-3',
        letter: '৮-৩',
        word: '৮-৩=৫',
        wordEn: '8-3=5',
        emoji: '🐟',
        color: 'from-cyan-400 to-blue-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        showDotCount: false,
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'পুকুরের মাছ',
                voiceText: 'পুকুরে ছিল আটটি মাছ। তিনটি সাঁতরে দূরে চলে গেল। এখন থাকে পাঁচটি মাছ।',
                content: '🐟🐟🐟🐟🐟🐟🐟🐟 ➜ 🐟🐟🐟🐟🐟'
            },
            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'আমার সাথে বলো',
                voiceText: 'আট বিয়োগ তিন সমান পাঁচ।',
                content: '৮-৩=৫'
            },
            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো',
                voiceText: 'আট বিয়োগ তিন সমান পাঁচ',
                content: '৮-৩=৫'
            },
            {
                id: 'e4',
                type: 'tap-correct',
                title: 'কতটি মাছ রইলো?',
                voiceText: 'আটটি মাছ থেকে তিনটি চলে গেলে কয়টি থাকে?',
                content: '🐟🐟🐟🐟🐟🐟🐟🐟',
                options: ['৪', '৫', '৬', '৭'],
                correctAnswer: '৫'
            },
            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'সঠিক উত্তর ধরো!',
                voiceText: 'পাঁচ সংখ্যাটি ধরো।',
                content: '৫',
                options: ['৪', '৫', '৬', '৭'],
                correctAnswer: '৫'
            },
            {
                id: 'e7',
                type: 'letter-puzzle',
                title: 'ধাঁধা সমাধান',
                voiceText: '৮-৩ কত?',
                content: '৮-৩',
                options: ['৪', '৫', '৬', '৩'],
                correctAnswer: '৫'
            },
            {
                id: 'e8',
                type: 'matching',
                title: 'মেলাও',
                voiceText: 'সঠিক উত্তর মিলাও।',
                content: '৫',
                options: ['৫-১=৪', '৬-২=৪', '৮-৩=৫', '১০-৫=৫'],
                correctAnswer: '৮-৩=৫'
            },
            {
                id: 'e9',
                type: 'trace',
                title: 'পাঁচ লেখো',
                voiceText: 'পাঁচ লিখে দেখাও।',
                content: '৫'
            },
            {
                id: 'e10',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'আটটি মাছ থেকে তিনটি চলে গেলে কয়টি থাকে?',
                content: '৫',
                options: ['৪', '৫', '৬', '৭'],
                correctAnswer: '৫'
            }
        ]
    },

    'math-sub-4': {
        id: 'math-sub-4',
        letter: '১০-৫',
        word: '১০-৫=৫',
        wordEn: '10-5=5',
        emoji: '🪁',
        color: 'from-emerald-400 to-teal-500',
        lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/math',
        showDotCount: false,
        exercises: [
            {
                id: 'e1',
                type: 'intro',
                title: 'ঘুড়ির মেলা',
                voiceText: 'দশটি ঘুড়ি ছিল। পাঁচটি উড়ে গেল। এখন থাকে পাঁচটি ঘুড়ি।',
                content: '🪁🪁🪁🪁🪁🪁🪁🪁🪁🪁 ➜ 🪁🪁🪁🪁🪁'
            },
            {
                id: 'e2',
                type: 'listen-repeat',
                title: 'বলো দেখি',
                voiceText: 'দশ বিয়োগ পাঁচ সমান পাঁচ।',
                content: '১০-৫=৫'
            },
            {
                id: 'e3',
                type: 'pronounce',
                title: 'জোরে বলো',
                voiceText: 'দশ বিয়োগ পাঁচ সমান পাঁচ',
                content: '১০-৫=৫'
            },
            {
                id: 'e4',
                type: 'tap-correct',
                title: 'কয়টি ঘুড়ি রইলো?',
                voiceText: 'দশটি ঘুড়ি থেকে পাঁচটি উড়ে গেলে কয়টি থাকে?',
                content: '🪁🪁🪁🪁🪁🪁🪁🪁🪁🪁',
                options: ['৪', '৫', '৬', '৭'],
                correctAnswer: '৫'
            },
            {
                id: 'e5',
                type: 'bubble-pop',
                title: 'সঠিক উত্তর ধরো!',
                voiceText: 'পাঁচ সংখ্যাটি ধরো।',
                content: '৫',
                options: ['৪', '৫', '৬', '৭'],
                correctAnswer: '৫'
            },
            {
                id: 'e7',
                type: 'letter-puzzle',
                title: 'ধাঁধা সমাধান',
                voiceText: '১০-৫ কত?',
                content: '১০-৫',
                options: ['৪', '৫', '৬', '৭'],
                correctAnswer: '৫'
            },
            {
                id: 'e8',
                type: 'matching',
                title: 'মেলাও',
                voiceText: 'সঠিক উত্তর মিলাও।',
                content: '৫',
                options: ['৫-১=৪', '৬-২=৪', '৮-৩=৫', '১০-৫=৫'],
                correctAnswer: '১০-৫=৫'
            },
            {
                id: 'e9',
                type: 'trace',
                title: 'পাঁচ লেখো',
                voiceText: 'পাঁচ লিখে দেখাও।',
                content: '৫'
            },
            {
                id: 'e10',
                type: 'quiz',
                title: 'শেষ প্রশ্ন',
                voiceText: 'দশটি ঘুড়ি থেকে পাঁচটি উড়ে গেলে কয়টি থাকে?',
                content: '৫',
                options: ['৪', '৫', '৬', '৭'],
                correctAnswer: '৫'
            }
        ]
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