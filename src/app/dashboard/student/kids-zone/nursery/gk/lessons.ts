import type { LessonConfig, Exercise } from '@/components/kids/LessonEngine'

const BACK = '/dashboard/student/kids-zone/nursery/gk'

type GkItem = {
  id: string
  word: string
  wordEn: string
  emoji: string
  color: string
  fact: string
  question: string
  /** Wrong answers for quizzes (same category) */
  distractors: string[]
}

/** Build a kid-friendly lesson that does NOT feel identical for every item. */
function buildGkLesson(item: GkItem, mates: GkItem[], variant: 0 | 1 | 2): LessonConfig {
  const { id, word, wordEn, emoji, color, fact, question, distractors } = item

  // 3 peer pairs for matching (emoji ↔ name)
  const peers = [item, ...mates.filter((m) => m.id !== id)].slice(0, 3)
  const matchOpts = peers.map((p) => `${p.emoji}-${p.word}`)

  const nameOpts = [word, ...distractors].slice(0, 4)
  // Shuffle-ish fixed order so not always first answer
  const mixedNames = [nameOpts[1] || distractors[0], word, nameOpts[2] || distractors[1], nameOpts[3] || distractors[0]].filter(
    Boolean,
  ) as string[]

  const intro: Exercise = {
    id: 'e1',
    type: 'intro',
    title: `${emoji} ${word}`,
    voiceText: `হ্যালো! আজ শিখবো ${word}। ইংরেজিতে বলে ${wordEn}। ${fact}`,
    content: `${emoji}\n\n${word}\n(${wordEn})\n\n📌 ${fact}`,
  }

  const listen: Exercise = {
    id: 'e2',
    type: 'listen-repeat',
    title: '🔊 শুনে বলো',
    voiceText: `${word}। ${word}।`,
    content: word,
  }

  const pronounce: Exercise = {
    id: 'e3',
    type: 'pronounce',
    title: '🎤 জোরে বলো',
    voiceText: `জোরে বলো ${word}`,
    content: word,
  }

  const findName: Exercise = {
    id: 'e4',
    type: 'tap-correct',
    title: `${emoji} সঠিক নাম বেছে নাও`,
    voiceText: `ছবি দেখে সঠিক নাম চাপ দাও। উত্তর ${word}।`,
    content: emoji,
    options: mixedNames,
    correctAnswer: word,
  }

  const findEmoji: Exercise = {
    id: 'e5',
    type: 'tap-correct',
    title: `কোনটি ${word}?`,
    voiceText: `${word} কোন ছবি? সঠিক ছবিতে চাপ দাও।`,
    content: word,
    options: peers.map((p) => p.emoji).concat(mates.slice(0, 1).map((m) => m.emoji)).slice(0, 4),
    correctAnswer: emoji,
  }

  // Ensure correct emoji is in options
  if (!findEmoji.options!.includes(emoji)) {
    findEmoji.options = [emoji, ...findEmoji.options!.filter((o) => o !== emoji)].slice(0, 4)
  }

  const bubble: Exercise = {
    id: 'e6',
    type: 'bubble-pop',
    title: `🎈 ${word} বেলুন ফাটাও`,
    voiceText: `যে বেলুনে ${word} লেখা সেটি ফাটাও।`,
    content: word,
    options: mixedNames,
    correctAnswer: word,
  }

  const match: Exercise = {
    id: 'e7',
    type: 'matching',
    title: '🔗 ছবি ও নাম মিলাও',
    voiceText: 'বামে ছবি, ডানে নাম — জোড়া মিলাও।',
    content: word,
    options: matchOpts,
    correctAnswer: word,
  }

  const factQuiz: Exercise = {
    id: 'e8',
    type: 'quiz',
    title: '❓ জ্ঞান পরীক্ষা',
    voiceText: question,
    content: question,
    options: mixedNames,
    correctAnswer: word,
  }

  // Variant changes order so lessons don't feel copy-pasted
  let exercises: Exercise[]
  if (variant === 0) {
    exercises = [intro, listen, pronounce, findName, bubble, match, factQuiz]
  } else if (variant === 1) {
    exercises = [intro, findEmoji, listen, pronounce, match, bubble, factQuiz]
  } else {
    exercises = [intro, listen, findName, pronounce, findEmoji, match, factQuiz]
  }

  return {
    id,
    letter: word.slice(0, 1),
    word,
    wordEn,
    emoji,
    color,
    lang: 'bn-BD',
    backHref: BACK,
    exercises,
  }
}

function pack(items: GkItem[]): Record<string, LessonConfig> {
  const out: Record<string, LessonConfig> = {}
  items.forEach((item, i) => {
    const mates = items.filter((m) => m.id !== item.id)
    out[item.id] = buildGkLesson(item, mates, (i % 3) as 0 | 1 | 2)
  })
  return out
}

const COLORS: GkItem[] = [
  {
    id: 'gk-color-red',
    word: 'লাল',
    wordEn: 'Red',
    emoji: '🔴',
    color: 'from-red-400 to-rose-600',
    fact: 'আপেল, গোলাপ আর রক্তের রং লাল।',
    question: 'আপেল সাধারণত কোন রঙের?',
    distractors: ['নীল', 'সবুজ', 'হলুদ'],
  },
  {
    id: 'gk-color-blue',
    word: 'নীল',
    wordEn: 'Blue',
    emoji: '🔵',
    color: 'from-blue-400 to-indigo-600',
    fact: 'আকাশ আর সমুদ্রের রং নীল।',
    question: 'আকাশ সাধারণত কোন রঙের?',
    distractors: ['লাল', 'সবুজ', 'হলুদ'],
  },
  {
    id: 'gk-color-green',
    word: 'সবুজ',
    wordEn: 'Green',
    emoji: '🟢',
    color: 'from-emerald-400 to-green-600',
    fact: 'পাতা, ঘাস আর বাংলাদেশের পতাকার বড় অংশ সবুজ।',
    question: 'ঘাস কোন রঙের?',
    distractors: ['লাল', 'নীল', 'হলুদ'],
  },
  {
    id: 'gk-color-yellow',
    word: 'হলুদ',
    wordEn: 'Yellow',
    emoji: '🟡',
    color: 'from-yellow-300 to-amber-500',
    fact: 'সূর্য আর পাকা কলার রং হলুদ।',
    question: 'পাকা কলা কোন রঙের?',
    distractors: ['লাল', 'নীল', 'সবুজ'],
  },
  {
    id: 'gk-color-orange',
    word: 'কমলা',
    wordEn: 'Orange',
    emoji: '🟠',
    color: 'from-orange-400 to-amber-600',
    fact: 'কমলা ফল আর সূর্যাস্তের রং কমলা।',
    question: 'কমলা ফলের রং কী?',
    distractors: ['লাল', 'হলুদ', 'সবুজ'],
  },
  {
    id: 'gk-color-purple',
    word: 'बैंगুনি',
    wordEn: 'Purple',
    emoji: '🟣',
    color: 'from-violet-400 to-purple-600',
    fact: 'বেগুন আর কিছু ফুল বেগুনি রঙের।',
    question: 'বেগুন সাধারণত কোন রঙের?',
    distractors: ['লাল', 'নীল', 'সবুজ'],
  },
  {
    id: 'gk-color-white',
    word: 'সাদা',
    wordEn: 'White',
    emoji: '⚪',
    color: 'from-slate-200 to-gray-400',
    fact: 'মেঘ, তুলো আর দুধ সাদা রঙের।',
    question: 'দুধ কোন রঙের?',
    distractors: ['কালো', 'লাল', 'নীল'],
  },
  {
    id: 'gk-color-black',
    word: 'কালো',
    wordEn: 'Black',
    emoji: '⚫',
    color: 'from-slate-600 to-zinc-900',
    fact: 'রাত আর কয়লার রং কালো।',
    question: 'কয়লা কোন রঙের?',
    distractors: ['সাদা', 'লাল', 'নীল'],
  },
]

const FRUITS: GkItem[] = [
  {
    id: 'gk-fruit-mango',
    word: 'আম',
    wordEn: 'Mango',
    emoji: '🥭',
    color: 'from-amber-400 to-orange-500',
    fact: 'আম বাংলাদেশের জাতীয় ফল। গ্রীষ্মে পাকে, মিষ্টি ও রসালো।',
    question: 'বাংলাদেশের জাতীয় ফল কোনটি?',
    distractors: ['কলা', 'আপেল', 'তরমুজ'],
  },
  {
    id: 'gk-fruit-banana',
    word: 'কলা',
    wordEn: 'Banana',
    emoji: '🍌',
    color: 'from-yellow-300 to-amber-500',
    fact: 'কলা হলুদ ও নরম। খেলে শক্তি বাড়ে।',
    question: 'কোন ফল হলুদ ও নরম?',
    distractors: ['আম', 'আপেল', 'তরমুজ'],
  },
  {
    id: 'gk-fruit-apple',
    word: 'আপেল',
    wordEn: 'Apple',
    emoji: '🍎',
    color: 'from-red-400 to-rose-500',
    fact: 'আপেল লাল বা সবুজ হতে পারে। স্বাস্থ্যের জন্য ভালো।',
    question: 'কোন ফল প্রায়ই লাল রঙের হয়?',
    distractors: ['আম', 'কলা', 'আঙ্গুর'],
  },
  {
    id: 'gk-fruit-orange',
    word: 'কমলা',
    wordEn: 'Orange',
    emoji: '🍊',
    color: 'from-orange-400 to-amber-600',
    fact: 'কমলায় ভিটামিন সি আছে। রস করে খাওয়া যায়।',
    question: 'কোন ফলে অনেক ভিটামিন সি থাকে?',
    distractors: ['আম', 'কলা', 'তরমুজ'],
  },
  {
    id: 'gk-fruit-grape',
    word: 'আঙ্গুর',
    wordEn: 'Grape',
    emoji: '🍇',
    color: 'from-violet-400 to-purple-600',
    fact: 'আঙ্গুর ছোট ছোট দলায় থাকে। মিষ্টি স্বাদ।',
    question: 'ছোট ছোট দলায় কোন ফল থাকে?',
    distractors: ['আম', 'কলা', 'আপেল'],
  },
  {
    id: 'gk-fruit-watermelon',
    word: 'তরমুজ',
    wordEn: 'Watermelon',
    emoji: '🍉',
    color: 'from-green-400 to-red-500',
    fact: 'তরমুজ বড় ও রসালো। গরমে খেতে খুব ভালো।',
    question: 'গরমে কোন বড় রসালো ফল খাই?',
    distractors: ['আম', 'কলা', 'কমলা'],
  },
  {
    id: 'gk-fruit-jackfruit',
    word: 'কাঁঠাল',
    wordEn: 'Jackfruit',
    emoji: '🍈',
    color: 'from-green-400 to-yellow-500',
    fact: 'কাঁঠাল খুব বড় ফল। ভিতরে মিষ্টি কোষ থাকে।',
    question: 'কোন ফল খুব বড় হয়?',
    distractors: ['আম', 'কলা', 'আপেল'],
  },
  {
    id: 'gk-fruit-guava',
    word: 'পেয়ারা',
    wordEn: 'Guava',
    emoji: '🥝',
    color: 'from-lime-400 to-green-600',
    fact: 'পেয়ারা সবুজ ও মিষ্টি। ভিটামিন সি সমৃদ্ধ।',
    question: 'সবুজ মিষ্টি কোন দেশী ফল?',
    distractors: ['আম', 'কলা', 'আপেল'],
  },
]

const ANIMALS: GkItem[] = [
  {
    id: 'gk-animal-tiger',
    word: 'বাঘ',
    wordEn: 'Tiger',
    emoji: '🐯',
    color: 'from-orange-400 to-amber-600',
    fact: 'বাঘ বাংলাদেশের জাতীয় পশু। সুন্দরবনে বাস করে।',
    question: 'বাংলাদেশের জাতীয় পশু কোনটি?',
    distractors: ['হাতি', 'গরু', 'বিড়াল'],
  },
  {
    id: 'gk-animal-elephant',
    word: 'হাতি',
    wordEn: 'Elephant',
    emoji: '🐘',
    color: 'from-slate-400 to-gray-600',
    fact: 'হাতির বড় কান আর লম্বা শুঁড় আছে।',
    question: 'কোন প্রাণীর লম্বা শুঁড় আছে?',
    distractors: ['বাঘ', 'গরু', 'কুকুর'],
  },
  {
    id: 'gk-animal-cow',
    word: 'গরু',
    wordEn: 'Cow',
    emoji: '🐄',
    color: 'from-amber-300 to-stone-500',
    fact: 'গরু দুধ দেয়। গ্রামে অনেক গরু দেখা যায়।',
    question: 'কোন প্রাণী আমাদের দুধ দেয়?',
    distractors: ['বাঘ', 'হাতি', 'বিড়াল'],
  },
  {
    id: 'gk-animal-cat',
    word: 'বিড়াল',
    wordEn: 'Cat',
    emoji: '🐱',
    color: 'from-rose-300 to-orange-400',
    fact: 'বিড়াল “মিউ মিউ” করে। অনেকের পোষা প্রাণী।',
    question: 'কোন প্রাণী মিউ মিউ করে?',
    distractors: ['কুকুর', 'গরু', 'পাখি'],
  },
  {
    id: 'gk-animal-dog',
    word: 'কুকুর',
    wordEn: 'Dog',
    emoji: '🐶',
    color: 'from-amber-400 to-yellow-600',
    fact: 'কুকুর বিশ্বস্ত বন্ধু। “ভাউ ভাউ” করে।',
    question: 'কোন প্রাণী ভাউ ভাউ করে?',
    distractors: ['বিড়াল', 'গরু', 'পাখি'],
  },
  {
    id: 'gk-animal-bird',
    word: 'পাখি',
    wordEn: 'Bird',
    emoji: '🐦',
    color: 'from-sky-400 to-cyan-500',
    fact: 'পাখি ডানা দিয়ে উড়ে। অনেক পাখি গান গায়।',
    question: 'কোন প্রাণী আকাশে উড়তে পারে?',
    distractors: ['বাঘ', 'বিড়াল', 'গরু'],
  },
  {
    id: 'gk-animal-fish',
    word: 'মাছ',
    wordEn: 'Fish',
    emoji: '🐟',
    color: 'from-cyan-400 to-blue-600',
    fact: 'মাছ পানিতে থাকে। ইলিশ আমাদের জাতীয় মাছ।',
    question: 'কোন প্রাণী পানিতে থাকে?',
    distractors: ['পাখি', 'গরু', 'বিড়াল'],
  },
  {
    id: 'gk-animal-rabbit',
    word: 'খরগোশ',
    wordEn: 'Rabbit',
    emoji: '🐰',
    color: 'from-pink-300 to-rose-400',
    fact: 'খরগোশের লম্বা কান। খুব দ্রুত লাফায়।',
    question: 'কোন প্রাণীর লম্বা কান আছে?',
    distractors: ['বিড়াল', 'কুকুর', 'পাখি'],
  },
]

const BODY: GkItem[] = [
  {
    id: 'gk-body-eye',
    word: 'চোখ',
    wordEn: 'Eye',
    emoji: '👁️',
    color: 'from-sky-400 to-blue-600',
    fact: 'চোখ দিয়ে আমরা দেখি। মানুষের দুটি চোখ আছে।',
    question: 'কোন অঙ্গ দিয়ে আমরা দেখি?',
    distractors: ['কান', 'নাক', 'হাত'],
  },
  {
    id: 'gk-body-ear',
    word: 'কান',
    wordEn: 'Ear',
    emoji: '👂',
    color: 'from-amber-400 to-orange-500',
    fact: 'কান দিয়ে আমরা শুনি। দুটি কান আছে।',
    question: 'কোন অঙ্গ দিয়ে আমরা শুনি?',
    distractors: ['চোখ', 'নাক', 'পা'],
  },
  {
    id: 'gk-body-hand',
    word: 'হাত',
    wordEn: 'Hand',
    emoji: '✋',
    color: 'from-rose-400 to-pink-500',
    fact: 'হাত দিয়ে ধরি, লিখি ও খেলি। প্রতি হাতে পাঁচ আঙুল।',
    question: 'কোন অঙ্গ দিয়ে আমরা লিখি?',
    distractors: ['পা', 'চোখ', 'নাক'],
  },
  {
    id: 'gk-body-foot',
    word: 'পা',
    wordEn: 'Foot',
    emoji: '🦶',
    color: 'from-violet-400 to-purple-500',
    fact: 'পা দিয়ে হাঁটি ও দৌড়াই।',
    question: 'কোন অঙ্গ দিয়ে আমরা হাঁটি?',
    distractors: ['হাত', 'চোখ', 'কান'],
  },
  {
    id: 'gk-body-nose',
    word: 'নাক',
    wordEn: 'Nose',
    emoji: '👃',
    color: 'from-emerald-400 to-teal-500',
    fact: 'নাক দিয়ে শ্বাস নিই ও গন্ধ পাই।',
    question: 'কোন অঙ্গ দিয়ে আমরা গন্ধ পাই?',
    distractors: ['চোখ', 'কান', 'হাত'],
  },
  {
    id: 'gk-body-mouth',
    word: 'মুখ',
    wordEn: 'Mouth',
    emoji: '👄',
    color: 'from-rose-400 to-red-500',
    fact: 'মুখ দিয়ে কথা বলি ও খাবার খাই।',
    question: 'কোন অঙ্গ দিয়ে আমরা কথা বলি?',
    distractors: ['নাক', 'চোখ', 'কান'],
  },
]

const VEHICLES: GkItem[] = [
  {
    id: 'gk-vehicle-bus',
    word: 'বাস',
    wordEn: 'Bus',
    emoji: '🚌',
    color: 'from-yellow-400 to-amber-600',
    fact: 'বাস অনেক যাত্রী নিয়ে রাস্তায় চলে।',
    question: 'অনেক যাত্রী নিয়ে কোন যান চলে?',
    distractors: ['গাড়ি', 'নৌকা', 'বিমান'],
  },
  {
    id: 'gk-vehicle-car',
    word: 'গাড়ি',
    wordEn: 'Car',
    emoji: '🚗',
    color: 'from-sky-400 to-blue-600',
    fact: 'গাড়ির চার চাকা। পরিবারে চলাচলে ব্যবহার হয়।',
    question: 'চার চাকার ছোট যান কোনটি?',
    distractors: ['বাস', 'ট্রেন', 'বিমান'],
  },
  {
    id: 'gk-vehicle-train',
    word: 'ট্রেন',
    wordEn: 'Train',
    emoji: '🚂',
    color: 'from-slate-400 to-zinc-600',
    fact: 'ট্রেন রেললাইনে চলে। অনেক বগি থাকে।',
    question: 'রেললাইনে কোন যান চলে?',
    distractors: ['বাস', 'গাড়ি', 'নৌকা'],
  },
  {
    id: 'gk-vehicle-boat',
    word: 'নৌকা',
    wordEn: 'Boat',
    emoji: '⛵',
    color: 'from-cyan-400 to-blue-500',
    fact: 'নৌকা পানিতে চলে। নদীতে দেখা যায়।',
    question: 'নদীতে কোন যান চলে?',
    distractors: ['বাস', 'বিমান', 'ট্রেন'],
  },
  {
    id: 'gk-vehicle-plane',
    word: 'বিমান',
    wordEn: 'Plane',
    emoji: '✈️',
    color: 'from-indigo-400 to-violet-600',
    fact: 'বিমান আকাশে উড়ে। দূর দেশে যায়।',
    question: 'আকাশে কোন যান উড়ে?',
    distractors: ['বাস', 'নৌকা', 'গাড়ি'],
  },
  {
    id: 'gk-vehicle-rickshaw',
    word: 'রিকশা',
    wordEn: 'Rickshaw',
    emoji: '🛺',
    color: 'from-green-400 to-lime-500',
    fact: 'রিকশা বাংলাদেশে খুব পরিচিত। তিন চাকা।',
    question: 'বাংলাদেশের তিন চাকার যান কোনটি?',
    distractors: ['বাস', 'গাড়ি', 'ট্রেন'],
  },
]

const BD: GkItem[] = [
  {
    id: 'gk-bd-flag',
    word: 'পতাকা',
    wordEn: 'Flag',
    emoji: '🇧🇩',
    color: 'from-green-400 to-emerald-600',
    fact: 'বাংলাদেশের পতাকা সবুজ; মাঝে লাল বৃত্ত।',
    question: 'বাংলাদেশের জাতীয় পতাকায় মাঝে কী আছে?',
    distractors: ['ঢাকা', 'শাপলা', 'দোয়েল'],
  },
  {
    id: 'gk-bd-capital',
    word: 'ঢাকা',
    wordEn: 'Dhaka',
    emoji: '🏛️',
    color: 'from-amber-400 to-orange-600',
    fact: 'ঢাকা বাংলাদেশের রাজধানী। দেশের সবচেয়ে বড় শহর।',
    question: 'বাংলাদেশের রাজধানী কোন শহর?',
    distractors: ['চট্টগ্রাম', 'সিলেট', 'খুলনা'],
  },
  {
    id: 'gk-bd-flower',
    word: 'শাপলা',
    wordEn: 'Water lily',
    emoji: '🌸',
    color: 'from-pink-300 to-rose-500',
    fact: 'শাপলা বাংলাদেশের জাতীয় ফুল। পানিতে ফোটে।',
    question: 'বাংলাদেশের জাতীয় ফুল কোনটি?',
    distractors: ['গোলাপ', 'পতাকা', 'দোয়েল'],
  },
  {
    id: 'gk-bd-bird',
    word: 'দোয়েল',
    wordEn: 'Magpie robin',
    emoji: '🦜',
    color: 'from-slate-400 to-stone-600',
    fact: 'দোয়েল বাংলাদেশের জাতীয় পাখি। সুন্দর গান গায়।',
    question: 'বাংলাদেশের জাতীয় পাখি কোনটি?',
    distractors: ['শাপলা', 'কাক', 'বাঘ'],
  },
  {
    id: 'gk-bd-hilsa',
    word: 'ইলিশ',
    wordEn: 'Hilsa',
    emoji: '🐠',
    color: 'from-slate-300 to-slate-500',
    fact: 'ইলিশ বাংলাদেশের জাতীয় মাছ। খুব সুস্বাদু।',
    question: 'বাংলাদেশের জাতীয় মাছ কোনটি?',
    distractors: ['রুই', 'শাপলা', 'বাঘ'],
  },
  {
    id: 'gk-bd-language',
    word: 'বাংলা',
    wordEn: 'Bangla',
    emoji: '📝',
    color: 'from-green-400 to-teal-600',
    fact: 'বাংলা আমাদের মাতৃভাষা। ২১শে ফেব্রুয়ারি আন্তর্জাতিক মাতৃভাষা দিবস।',
    question: 'আমাদের মাতৃভাষা কোনটি?',
    distractors: ['ইংরেজি', 'আরবি', 'হিন্দি'],
  },
]

const SEASONS: GkItem[] = [
  {
    id: 'gk-season-summer',
    word: 'গ্রীষ্ম',
    wordEn: 'Summer',
    emoji: '☀️',
    color: 'from-amber-400 to-orange-600',
    fact: 'গ্রীষ্মে গরম পড়ে। আম পাকে।',
    question: 'কোন ঋতুতে আম পাকে?',
    distractors: ['বর্ষা', 'শীত', 'বসন্ত'],
  },
  {
    id: 'gk-season-rainy',
    word: 'বর্ষা',
    wordEn: 'Rainy',
    emoji: '🌧️',
    color: 'from-sky-400 to-blue-600',
    fact: 'বর্ষায় প্রচুর বৃষ্টি হয়। ছাতা লাগে।',
    question: 'কোন ঋতুতে বেশি বৃষ্টি হয়?',
    distractors: ['গ্রীষ্ম', 'শীত', 'বসন্ত'],
  },
  {
    id: 'gk-season-winter',
    word: 'শীত',
    wordEn: 'Winter',
    emoji: '❄️',
    color: 'from-cyan-300 to-blue-500',
    fact: 'শীতে ঠান্ডা পড়ে। সোয়েটার পরতে হয়।',
    question: 'কোন ঋতুতে সোয়েটার পরা হয়?',
    distractors: ['গ্রীষ্ম', 'বর্ষা', 'বসন্ত'],
  },
  {
    id: 'gk-season-spring',
    word: 'বসন্ত',
    wordEn: 'Spring',
    emoji: '🌼',
    color: 'from-pink-300 to-yellow-400',
    fact: 'বসন্তে ফুল ফোটে। পহেলা ফাল্গুন আসে।',
    question: 'কোন ঋতুতে অনেক ফুল ফোটে?',
    distractors: ['শীত', 'গ্রীষ্ম', 'বর্ষা'],
  },
]

const JOBS: GkItem[] = [
  {
    id: 'gk-job-doctor',
    word: 'ডাক্তার',
    wordEn: 'Doctor',
    emoji: '👨‍⚕️',
    color: 'from-sky-400 to-teal-500',
    fact: 'ডাক্তার অসুস্থ মানুষকে সুস্থ করেন।',
    question: 'অসুস্থ মানুষকে কে সুস্থ করেন?',
    distractors: ['শিক্ষক', 'কৃষক', 'পুলিশ'],
  },
  {
    id: 'gk-job-teacher',
    word: 'শিক্ষক',
    wordEn: 'Teacher',
    emoji: '👩‍🏫',
    color: 'from-violet-400 to-indigo-500',
    fact: 'শিক্ষক স্কুলে পড়ান ও শেখান।',
    question: 'স্কুলে কে আমাদের পড়ায়?',
    distractors: ['ডাক্তার', 'কৃষক', 'পুলিশ'],
  },
  {
    id: 'gk-job-farmer',
    word: 'কৃষক',
    wordEn: 'Farmer',
    emoji: '👨‍🌾',
    color: 'from-lime-400 to-green-600',
    fact: 'কৃষক ক্ষেতে ধান ও সবজি ফলান।',
    question: 'ক্ষেতে ধান কে ফলান?',
    distractors: ['ডাক্তার', 'শিক্ষক', 'পুলিশ'],
  },
  {
    id: 'gk-job-police',
    word: 'পুলিশ',
    wordEn: 'Police',
    emoji: '👮',
    color: 'from-blue-500 to-indigo-700',
    fact: 'পুলিশ আমাদের নিরাপদ রাখে ও আইন মানায়।',
    question: 'কে আমাদের নিরাপদ রাখে?',
    distractors: ['ডাক্তার', 'শিক্ষক', 'কৃষক'],
  },
  {
    id: 'gk-job-driver',
    word: 'চালক',
    wordEn: 'Driver',
    emoji: '🧑‍✈️',
    color: 'from-amber-400 to-orange-500',
    fact: 'চালক বাস বা গাড়ি চালান।',
    question: 'বাস কে চালান?',
    distractors: ['ডাক্তার', 'কৃষক', 'শিক্ষক'],
  },
]

const WEATHER: GkItem[] = [
  {
    id: 'gk-weather-sun',
    word: 'সূর্য',
    wordEn: 'Sun',
    emoji: '☀️',
    color: 'from-yellow-300 to-orange-500',
    fact: 'সূর্য আলো ও তাপ দেয়। দিনে আকাশে দেখা যায়।',
    question: 'দিনে আকাশে কোনটি দেখা যায়?',
    distractors: ['চাঁদ', 'মেঘ', 'তারা'],
  },
  {
    id: 'gk-weather-moon',
    word: 'চাঁদ',
    wordEn: 'Moon',
    emoji: '🌙',
    color: 'from-indigo-300 to-slate-500',
    fact: 'চাঁদ রাতে জ্বলে। কখনো পূর্ণিমা হয়।',
    question: 'রাতে কোনটি আকাশে জ্বলে?',
    distractors: ['সূর্য', 'বৃষ্টি', 'মেঘ'],
  },
  {
    id: 'gk-weather-cloud',
    word: 'মেঘ',
    wordEn: 'Cloud',
    emoji: '☁️',
    color: 'from-slate-300 to-gray-500',
    fact: 'মেঘ আকাশে ভাসে। বৃষ্টির আগে মেঘ জমে।',
    question: 'বৃষ্টির আগে আকাশে কী জমে?',
    distractors: ['সূর্য', 'চাঁদ', 'তারা'],
  },
  {
    id: 'gk-weather-rain',
    word: 'বৃষ্টি',
    wordEn: 'Rain',
    emoji: '🌧️',
    color: 'from-blue-400 to-cyan-600',
    fact: 'বৃষ্টি পানি দেয়। গাছপালা বাড়ে।',
    question: 'আকাশ থেকে পানি ঝরলে কী বলে?',
    distractors: ['সূর্য', 'মেঘ', 'চাঁদ'],
  },
  {
    id: 'gk-weather-star',
    word: 'তারা',
    wordEn: 'Star',
    emoji: '⭐',
    color: 'from-yellow-200 to-amber-400',
    fact: 'তারা রাতে আকাশে জ্বলে। অনেক দূরে থাকে।',
    question: 'রাতে আকাশে ছোট ছোট আলো কী?',
    distractors: ['সূর্য', 'বৃষ্টি', 'মেঘ'],
  },
]

export const gkLessons: Record<string, LessonConfig> = {
  ...pack(COLORS),
  ...pack(FRUITS),
  ...pack(ANIMALS),
  ...pack(BODY),
  ...pack(VEHICLES),
  ...pack(BD),
  ...pack(SEASONS),
  ...pack(JOBS),
  ...pack(WEATHER),
}

export const GK_LESSON_IDS = Object.keys(gkLessons)
