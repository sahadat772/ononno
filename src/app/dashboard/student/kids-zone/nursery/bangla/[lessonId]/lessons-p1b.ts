import type { LessonConfig } from '@/components/kids/LessonEngine'

export const banglaLessonsP1b: Record<string, LessonConfig> = {

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
            { id: 'e1', type: 'intro', title: 'চলো আজ উ শিখি!', voiceText: 'মরুভূমিতে উট মানুষের বন্ধু। উট শব্দটি উ দিয়ে শুরু হয়। আজ আমরা উ শিখব।', content: 'উ' },
            { id: 'e2', type: 'listen-repeat', title: 'আমার সাথে বলো', voiceText: 'উ... উট', content: 'উট' },
            { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: 'উ', content: 'উ' },
            { id: 'e4', type: 'tap-correct', title: 'উ কোথায়?', voiceText: 'উ বর্ণটি খুঁজে বের করো।', content: 'উ', options: ['ঈ', 'উ', 'ঊ', 'এ'], correctAnswer: 'উ' },
            { id: 'e5', type: 'bubble-pop', title: 'উ ধরো!', voiceText: 'উ লেখা বুদবুদটি ফাটাও।', content: 'উ', options: ['ঈ', 'উ', 'ঊ', 'এ'], correctAnswer: 'উ' },
            { id: 'e6', type: 'letter-puzzle', title: 'উট কোন বর্ণ?', voiceText: 'উট এর সাথে সম্পর্কিত বর্ণটি বেছে নাও।', content: 'উ', options: ['ঈ', 'উ', 'ঊ', 'এ'], correctAnswer: 'উ' },
            { id: 'e7', type: 'word-builder', title: 'শব্দ সাজাও', voiceText: 'উট শব্দটি সাজাও।', content: 'উট', options: ['উ', 'ট'], correctAnswer: 'উট' },
            { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'বর্ণের সাথে শব্দ মিলিয়ে দাও।', content: 'উ', options: ['ঈ-ঈগল', 'উ-উট', 'ঊ-ঊষা', 'এ-একতারা'], correctAnswer: 'উ' },
            { id: 'e9', type: 'trace', title: 'চলো লিখি', voiceText: 'এবার সুন্দর করে উ লেখো।', content: 'উ' },
            { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন', voiceText: 'উট কোন বর্ণের সাথে জড়িত?', content: 'উ', options: ['ঈ', 'উ', 'ঊ', 'এ'], correctAnswer: 'উ' },
        ],
    },
}
