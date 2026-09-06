import type { LessonConfig } from '@/components/kids/LessonEngine'

function tens(n: number, bn: string, en: string, emoji: string, color: string): LessonConfig {
  const prev = String(n - 10)
  const next = String(n + 10)
  return {
    id: `math-${n}`,
    letter: String(n),
    word: bn,
    wordEn: en,
    emoji,
    color,
    lang: 'bn-BD',
    backHref: '/dashboard/student/kids-zone/nursery/math',
    showDotCount: true,
    exercises: [
      { id: 'e1', type: 'intro', title: `চলো ${n} শিখি!`, voiceText: `আজ আমরা সংখ্যা ${bn} শিখবো। ${bn} মানে ${n}।`, content: `${emoji} ×${n}` },
      { id: 'e2', type: 'listen-repeat', title: 'আমার সাথে বলো', voiceText: `${bn}... ${bn}... ${n}`, content: bn },
      { id: 'e3', type: 'pronounce', title: 'জোরে বলো', voiceText: bn, content: bn },
      { id: 'e4', type: 'tap-correct', title: `${n} কোথায়?`, voiceText: `সংখ্যা ${n} খুঁজে বের করো।`, content: String(n), options: [prev, String(n), next, '5'], correctAnswer: String(n) },
      { id: 'e5', type: 'bubble-pop', title: `${n} ধরো!`, voiceText: `${n} লেখা বুদবুদটি ফাটাও।`, content: String(n), options: [prev, String(n), next, '10'], correctAnswer: String(n) },
      { id: 'e6', type: 'matching', title: 'জোড়া মেলাও', voiceText: 'সংখ্যার সাথে নাম মিলিয়ে দাও।', content: String(n), options: [`${n}-${bn}`, '10-দশ', '20-বিশ', '5-পাঁচ'], correctAnswer: String(n) },
      { id: 'e7', type: 'trace', title: 'চলো লিখি', voiceText: `এবার সুন্দর করে ${n} লেখো।`, content: String(n) },
      { id: 'e8', type: 'quiz', title: 'শেষ প্রশ্ন', voiceText: `${bn} কোন সংখ্যা?`, content: bn, options: [prev, String(n), next, '25'], correctAnswer: String(n) },
    ],
  }
}

/** Missing tens lessons merged by Math lesson page resolver */
export const mathExtraLessons: Record<string, LessonConfig> = {
  'math-30': tens(30, 'ত্রিশ', 'Thirty', '🎯', 'from-rose-400 to-pink-500'),
  'math-40': tens(40, 'চল্লিশ', 'Forty', '🎪', 'from-violet-400 to-purple-500'),
  'math-50': tens(50, 'পঞ্চাশ', 'Fifty', '🏅', 'from-amber-400 to-orange-500'),
}
