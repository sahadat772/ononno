import type { LessonConfig } from '@/components/kids/LessonEngine'

export const arabicLessonsPart2: Record<string, LessonConfig> = {
    'arabic-sin': {
        id: 'arabic-sin', letter: 'س', word: 'سمك', wordEn: 'Fish', emoji: '🐟',
        color: 'from-cyan-400 to-blue-500', lang: 'bn-BD',
        backHref: '/dashboard/student/kids-zone/nursery/arabic',
        exercises: [
            { id: 'e1', type: 'intro', title: 'চলো সীন (س) শিখি!', voiceText: 'এটি সীন! সীন দিয়ে হয় সamakun - মানে মাছ!', content: 'س' },
            { id: 'e2', type: 'listen-repeat', title: 'মন দিয়ে শোনো', voiceText: 'সamakun - মাছ', content: 'سمك' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো!', voiceText: 'সীন', content: 'س' },
            { id: 'e4', type: 'tap-correct', title: 'সীন কোথায়?', voiceText: 'সীন হরফটি খুঁজে বের করো!', content: 'س', options: ['س', 'ش', 'ص', 'ض'], correctAnswer: 'س' },
            { id: 'e5', type: 'bubble-pop', title: 'বুদবুদ ফাটাও!', voiceText: 'সীন বুদবুদ ফাটাও!', content: 'س', options: ['س', 'ش', 'ص', 'ض'], correctAnswer: 'س' },
            { id: 'e6', type: 'letter-puzzle', title: 'ধাঁধা', voiceText: 'সঠিক হরফ বেছে নাও', content: 'س', options: ['س', 'ش', 'ص', 'ض'], correctAnswer: 'س' },
            { id: 'e7', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'হরফের সাথে শব্দ মেলাও', content: 'س', options: ['س-سمك', 'ش-شمس', 'ص-صقر', 'ض-ضفدع'], correctAnswer: 'س' },
            { id: 'e8', type: 'trace', title: 'চলো লিখি!', voiceText: 'সীন লেখো', content: 'س' },
            { id: 'e9', type: 'quiz', title: 'শেষ প্রশ্ন', voiceText: 'মাছ কোন হরফ দিয়ে শুরু?', content: 'س', options: ['ش', 'س', 'ص', 'ض'], correctAnswer: 'س' },
        ],
    },
}
