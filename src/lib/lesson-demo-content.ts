/**
 * Rich NCTB-style demo lesson bodies for soft-launch.
 * Used by: academic fallback UI, curriculum seed (lesson_contents),
 * and student page when published lesson has empty content.
 */

export type DemoQuizQ = {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export type DemoLessonBody = {
  overview: string
  objectives: string[]
  main_content: string
  examples: string[]
  summary: string
  extra_notes: string
  quiz_questions: DemoQuizQ[]
}

function detectKind(text: string): string {
  const t = text.toLowerCase()
  if (/bangla|বাংলা|born|sworo|banjon|shobdo|pora/.test(t)) return 'bangla'
  if (/english|ইংরেজি|alphabet|abc|word|sentence/.test(t)) return 'english'
  if (/math|গণিত|number|sangkhya|jog|biy|shape|akriti/.test(t)) return 'math'
  if (/islam|ইসলাম|iman|dua|salam|adab|quran|allah/.test(t)) return 'islam'
  if (/science|বিজ্ঞান|body|plant|animal|weather|season|sense/.test(t)) return 'science'
  if (/quiz|কুইজ/.test(t)) return 'quiz'
  return 'general'
}

const KIND_FLAVOR: Record<
  string,
  { intro: string; tip: string; quizBase: DemoQuizQ[] }
> = {
  bangla: {
    intro: 'বাংলা বর্ণ, শব্দ ও বাক্য — ধাপে ধাপে শিখবে।',
    tip: 'জোরে পড়ো, তারপর নিজে লেখার চেষ্টা করো।',
    quizBase: [
      {
        question: 'বাংলা শেখার ভালো উপায় কোনটি?',
        options: ['পড়ে ও লিখে অনুশীলন', 'শুধু দেখা', 'মুখস্থ না করা', 'এড়িয়ে যাওয়া'],
        correct: 0,
        explanation: 'পড়া ও লেখার অনুশীলনে শেখা মজবুত হয়।',
      },
      {
        question: 'স্বরবর্ণের উদাহরণ কোনটি?',
        options: ['অ আ ই', 'ক খ গ', '১ ২ ৩', 'A B C'],
        correct: 0,
        explanation: 'অ আ ই — স্বরবর্ণ।',
      },
    ],
  },
  english: {
    intro: 'English letters, words and simple sentences for everyday use.',
    tip: 'Say the words aloud. Then try a short sentence.',
    quizBase: [
      {
        question: 'Which comes first in the alphabet?',
        options: ['A', 'Z', 'M', 'Q'],
        correct: 0,
        explanation: 'A is the first letter of the English alphabet.',
      },
      {
        question: '“I am a student” — এটি কী?',
        options: ['একটি সহজ বাক্য', 'শুধু একটি অক্ষর', 'একটি সংখ্যা', 'একটি রং'],
        correct: 0,
        explanation: 'It is a simple English sentence.',
      },
    ],
  },
  math: {
    intro: 'সংখ্যা, যোগ-বিয়োগ ও আকৃতি — মজার উদাহরণে শিখবে।',
    tip: 'আঙুল বা কাঠি দিয়ে গুনে দেখো, তারপর খাতায় লেখো।',
    quizBase: [
      {
        question: '২ + ৩ = ?',
        options: ['৫', '৪', '৬', '৩'],
        correct: 0,
        explanation: '২ এর সাথে ৩ যোগ করলে ৫ হয়।',
      },
      {
        question: 'গোল আকৃতির উদাহরণ কোনটি?',
        options: ['বল', 'বই', 'দরজা', 'পেনসিল'],
        correct: 0,
        explanation: 'বল গোল আকৃতির।',
      },
    ],
  },
  islam: {
    intro: 'ঈমান, দোয়া ও আদব — ছোটবেলা থেকেই ভালো অভ্যাস।',
    tip: 'দোয়া মুখস্থ করে প্রতিদিন ব্যবহার করো।',
    quizBase: [
      {
        question: 'খাওয়ার আগে কী বলি?',
        options: ['বিসমিল্লাহ', 'শুধু ধন্যবাদ', 'কিছু না', 'শুধু নাম'],
        correct: 0,
        explanation: 'খাওয়ার আগে বিসমিল্লাহ বলি।',
      },
      {
        question: 'সালামের অর্থ কীসের সাথে জড়িত?',
        options: ['শান্তি ও সম্মান', 'রাগ', 'মজা', 'খেলা'],
        correct: 0,
        explanation: 'সালাম শান্তি ও সম্মানের বার্তা।',
      },
    ],
  },
  science: {
    intro: 'শরীর, প্রকৃতি ও আবহাওয়া — চারপাশের জগৎ চিনি।',
    tip: 'বাইরে গিয়ে গাছ, আকাশ ও আবহাওয়া লক্ষ্য করো।',
    quizBase: [
      {
        question: 'দেখার জন্য কোন ইন্দ্রিয় ব্যবহার করি?',
        options: ['চোখ', 'কান', 'নাক', 'জিহ্বা'],
        correct: 0,
        explanation: 'দেখার জন্য চোখ ব্যবহার করি।',
      },
      {
        question: 'গাছ আমাদের কী দেয়?',
        options: ['অক্সিজেন ও ছায়া', 'শুধু শব্দ', 'শুধু আলো', 'কিছু না'],
        correct: 0,
        explanation: 'গাছ অক্সিজেন দেয় এবং ছায়া দেয়।',
      },
    ],
  },
  quiz: {
    intro: 'এই ধাপে যা শিখেছ তা মজার কুইজে যাচাই করো।',
    tip: 'তাড়াহুড়ো না করে পড়ে উত্তর দাও।',
    quizBase: [
      {
        question: 'কুইজের উদ্দেশ্য কী?',
        options: ['শেখা যাচাই করা', 'শুধু খেলা', 'এড়িয়ে যাওয়া', 'মুছে ফেলা'],
        correct: 0,
        explanation: 'কুইজ দিয়ে নিজের শেখা যাচাই করি।',
      },
      {
        question: 'ভুল উত্তর হলে কী করবে?',
        options: ['ব্যাখ্যা পড়ে আবার চেষ্টা', 'রাগ করা', 'বন্ধ করা', 'মুছে ফেলা'],
        correct: 0,
        explanation: 'ব্যাখ্যা পড়ে শিখে আবার চেষ্টা করাই ভালো।',
      },
    ],
  },
  general: {
    intro: 'এই পাঠে মূল ধারণা সহজ ভাষায় শিখবে।',
    tip: 'ধাপে ধাপে পড়ো, উদাহরণ দেখো, তারপর কুইজ দাও।',
    quizBase: [
      {
        question: 'এই পাঠের মূল লক্ষ্য কী?',
        options: ['শেখা ও অনুশীলন', 'শুধু পড়া', 'খেলা', 'ঘুমানো'],
        correct: 0,
        explanation: 'পাঠ পড়ে অনুশীলন করলে শেখা মজবুত হয়।',
      },
      {
        question: 'পরের ধাপে কী করবে?',
        options: ['কুইজ দেবে', 'বন্ধ করবে', 'মুছে ফেলবে', 'কিছু না'],
        correct: 0,
        explanation: 'শেখার পর কুইজ দিয়ে নিজেকে যাচাই করো।',
      },
    ],
  },
}

export function buildDemoLessonBody(input: {
  title: string
  titleBn?: string
  description?: string
  subjectHint?: string
  isQuiz?: boolean
}): DemoLessonBody {
  const title = input.titleBn || input.title
  const en = input.title
  const desc = input.description || ''
  const kind = input.isQuiz
    ? 'quiz'
    : detectKind(`${input.subjectHint || ''} ${en} ${title} ${desc}`)
  const flavor = KIND_FLAVOR[kind] || KIND_FLAVOR.general

  const overview = [`${title} — ${flavor.intro}`, desc ? `বিষয়: ${desc}` : null]
    .filter(Boolean)
    .join('\n')

  const objectives = [
    `${title} এর মূল ধারণা বোঝা`,
    'সহজ উদাহরণ দিয়ে অনুশীলন',
    'কুইজে নিজেকে যাচাই করা',
  ]

  const main_content = [
    `📖 ${title}`,
    '',
    flavor.intro,
    '',
    desc ? `👉 ${desc}` : `👉 আজকের বিষয়: ${en}`,
    '',
    'ধাপ ১: মনোযোগ দিয়ে পড়ো',
    'ধাপ ২: উদাহরণগুলো নিজে চিন্তা করো',
    'ধাপ ৩: সংক্ষিপ্ত সারাংশ মনে রাখো',
    '',
    `💡 টিপ: ${flavor.tip}`,
    '',
    'যখন প্রস্তুত, নিচের কুইজে যাও — ভুল হলেও শেখা চলবে!',
  ].join('\n')

  const examples = [
    `উদাহরণ ১: ${title} সম্পর্কে একটি সহজ বাক্য বলো বা লেখো।`,
    `উদাহরণ ২: আজকের পাঠ থেকে একটি নতুন জিনিস মনে রাখো।`,
    `উদাহরণ ৩: বন্ধু বা পরিবারকে একটি প্রশ্ন জিজ্ঞাসা করো।`,
  ]

  const summary = [
    `সারাংশ: ${title} শেখার মূল কথা মনে রাখো।`,
    flavor.tip,
    'পরের পাঠে এগিয়ে যেতে কুইজ সম্পন্ন করো।',
  ].join('\n')

  const quiz_questions: DemoQuizQ[] = [
    ...flavor.quizBase,
    {
      question: `"${title}" পাঠে তোমার করণীয় কী?`,
      options: ['পড়া, বোঝা, অনুশীলন', 'এড়িয়ে যাওয়া', 'শুধু স্কিপ', 'মুছে ফেলা'],
      correct: 0,
      explanation: 'পড়া, বোঝা ও অনুশীলন — এতেই শেখা হয়।',
    },
  ]

  return {
    overview,
    objectives,
    main_content,
    examples,
    summary,
    extra_notes: 'ডেমো/বেসলাইন কন্টেন্ট — অ্যাডমিন পরে পূর্ণ NCTB পাঠ যোগ করতে পারবেন।',
    quiz_questions,
  }
}
