import type { LessonConfig } from '@/components/kids/LessonEngine'

export const banglaLessonsPart1: Record<string, LessonConfig> = {
  // SEE ARTIFACTS - full content will be pushed in follow-up if this is too large for tool
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
      { id: 'e1', type: 'intro', title: 'চলো আজ অ শিখি!', voiceText: 'একদিন রিমা বনে ঘুরতে গিয়ে একটি বড় অজগর দেখল। অজগর শব্দটি অ দিয়ে শুরু হয়। আজ আমরা অ শিখব।', content: 'অ' },
      { id: 'e2', type: 'listen-repeat', title: 'আমার সাথে বলো', voiceText: 'অ... অজগর', content: 'অজগর' },
      { id: 'e3', type: 'pronounce', title: 'জোরে বলো বন্ধু!', voiceText: 'অ', content: 'অ' },
      { id: 'e4', type: 'tap-correct', title: 'অ কোথায়?', voiceText: 'অ বর্ণটি খুঁজে বের করো।', content: 'অ', options: ['অ', 'আ', 'ই', 'ক'], correctAnswer: 'অ' },
      { id: 'e5', type: 'bubble-pop', title: 'অ ধরো!', voiceText: 'অ লেখা বুদবুদটি ফাটাও।', content: 'অ', options: ['অ', 'আ', 'ই', 'ক'], correctAnswer: 'অ' },
      { id: 'e6', type: 'letter-puzzle', title: 'অজগর কোন বর্ণ?', voiceText: 'অজগর এর সাথে সম্পর্কিত বর্ণটি বেছে নাও।', content: 'অ', options: ['অ', 'আ', 'ই', 'ক'], correctAnswer: 'অ' },
      { id: 'e7', type: 'word-builder', title: 'শব্দ সাজাও', voiceText: 'অজগর শব্দটি সাজাও।', content: 'অজগর', options: ['অ', 'জ', 'গ', 'র'], correctAnswer: 'অজগর' },
      { id: 'e8', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'বর্ণের সাথে শব্দ মিলিয়ে দাও।', content: 'অ', options: ['অ-অজগর', 'আ-আম', 'ই-ইলিশ', 'ঈ-ঈগল'], correctAnswer: 'অ' },
      { id: 'e9', type: 'trace', title: 'চলো লিখি', voiceText: 'এবার সুন্দর করে অ লেখো।', content: 'অ' },
      { id: 'e10', type: 'quiz', title: 'শেষ প্রশ্ন', voiceText: 'অজগর কোন বর্ণের সাথে জড়িত?', content: 'অ', options: ['অ', 'আ', 'ই', 'ক'], correctAnswer: 'অ' },
    ],
  },
}
