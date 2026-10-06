import type { LessonConfig } from '@/components/kids/LessonEngine'

const BACK = '/dashboard/student/kids-zone/nursery/gk'

function gkLesson(
  id: string,
  letter: string,
  word: string,
  wordEn: string,
  emoji: string,
  color: string,
  fact: string,
  distractors: string[],
): LessonConfig {
  const opts = [word, ...distractors].slice(0, 4)
  const options = [
    opts[1] || distractors[0],
    word,
    opts[2] || distractors[1],
    opts[3] || distractors[2],
  ].filter(Boolean)
  return {
    id,
    letter,
    word,
    wordEn,
    emoji,
    color,
    lang: 'bn-BD',
    backHref: BACK,
    exercises: [
      {
        id: 'e1',
        type: 'intro',
        title: `${emoji} আজ শিখবো: ${word}`,
        voiceText: `হ্যালো ছোট্ট বন্ধু! আজ আমরা শিখবো ${word}। ${fact}`,
        content: `${emoji}\n\n${word}`,
      },
      {
        id: 'e2',
        type: 'listen-repeat',
        title: '🎤 আমার পরে বলো',
        voiceText: `${word}... ${word}... ${word}...`,
        content: word,
      },
      {
        id: 'e3',
        type: 'pronounce',
        title: '😊 এবার তুমি বলো',
        voiceText: `জোরে করে বলো... ${word}`,
        content: word,
      },
      {
        id: 'e4',
        type: 'tap-correct',
        title: `👆 ${word} খুঁজে বের করো`,
        voiceText: `${word} শব্দটিতে চাপ দাও।`,
        content: emoji,
        options,
        correctAnswer: word,
      },
      {
        id: 'e5',
        type: 'bubble-pop',
        title: `🎈 ${word} বেলুন ফাটাও`,
        voiceText: `যে বেলুনে ${word} লেখা আছে সেটি ফাটাও।`,
        content: word,
        options,
        correctAnswer: word,
      },
      {
        id: 'e6',
        type: 'letter-puzzle',
        title: '🧩 সঠিকটি বেছে নাও',
        voiceText: `${word} খুঁজে বের করো।`,
        content: emoji,
        options,
        correctAnswer: word,
      },
      {
        id: 'e7',
        type: 'matching',
        title: '🤝 জোড়া মিলাও',
        voiceText: 'নাম আর ছবি মিলিয়ে দাও।',
        content: word,
        options: [
          `${word}-${emoji}`,
          ...distractors.slice(0, 3).map((d, i) => `${d}-${['⭐', '🌙', '☀️'][i] || '✨'}`),
        ],
        correctAnswer: word,
      },
      {
        id: 'e8',
        type: 'quiz',
        title: '⭐ শেষ প্রশ্ন',
        voiceText: fact,
        content: emoji,
        options,
        correctAnswer: word,
      },
    ],
  }
}

export const gkLessons: Record<string, LessonConfig> = {
  // —— রঙ ——
  'gk-color-red': gkLesson('gk-color-red', 'ল', 'লাল', 'Red', '🔴', 'from-red-400 to-rose-600', 'আপেল ও গোলাপ লাল রঙের।', ['নীল', 'সবুজ', 'হলুদ']),
  'gk-color-blue': gkLesson('gk-color-blue', 'ন', 'নীল', 'Blue', '🔵', 'from-blue-400 to-indigo-600', 'আকাশ ও সমুদ্র নীল রঙের।', ['লাল', 'সবুজ', 'হলুদ']),
  'gk-color-green': gkLesson('gk-color-green', 'স', 'সবুজ', 'Green', '🟢', 'from-emerald-400 to-green-600', 'পাতা ও ঘাস সবুজ রঙের।', ['লাল', 'নীল', 'হলুদ']),
  'gk-color-yellow': gkLesson('gk-color-yellow', 'হ', 'হলুদ', 'Yellow', '🟡', 'from-yellow-300 to-amber-500', 'সূর্য ও কলা হলুদ রঙের।', ['লাল', 'নীল', 'সবুজ']),
  'gk-color-orange': gkLesson('gk-color-orange', 'ক', 'কমলা', 'Orange', '🟠', 'from-orange-400 to-amber-600', 'কমলা ফল ও সূর্যাস্ত কমলা রঙের।', ['লাল', 'হলুদ', 'সবুজ']),
  'gk-color-purple': gkLesson('gk-color-purple', 'ব', 'বেগুনি', 'Purple', '🟣', 'from-violet-400 to-purple-600', 'বেগুন ও কিছু ফুল বেগুনি রঙের।', ['লাল', 'নীল', 'সবুজ']),
  'gk-color-white': gkLesson('gk-color-white', 'সা', 'সাদা', 'White', '⚪', 'from-slate-200 to-gray-400', 'মেঘ ও তুলো সাদা রঙের।', ['কালো', 'লাল', 'নীল']),
  'gk-color-black': gkLesson('gk-color-black', 'কা', 'কালো', 'Black', '⚫', 'from-slate-600 to-zinc-900', 'রাত ও কয়লা কালো রঙের।', ['সাদা', 'লাল', 'নীল']),

  // —— ফল ——
  'gk-fruit-mango': gkLesson('gk-fruit-mango', 'আ', 'আম', 'Mango', '🥭', 'from-amber-400 to-orange-500', 'আম বাংলাদেশের জাতীয় ফল। মিষ্টি ও রসালো!', ['কলা', 'আপেল', 'কমলা']),
  'gk-fruit-banana': gkLesson('gk-fruit-banana', 'ক', 'কলা', 'Banana', '🍌', 'from-yellow-300 to-amber-500', 'কলা হলুদ ও নরম। শক্তি দেয়!', ['আম', 'আপেল', 'তরমুজ']),
  'gk-fruit-apple': gkLesson('gk-fruit-apple', 'আ', 'আপেল', 'Apple', '🍎', 'from-red-400 to-rose-500', 'আপেল লাল বা সবুজ হতে পারে। স্বাস্থ্যকর!', ['আম', 'কলা', 'আঙ্গুর']),
  'gk-fruit-orange': gkLesson('gk-fruit-orange', 'ক', 'কমলা', 'Orange', '🍊', 'from-orange-400 to-amber-600', 'কমলা ভিটামিন সি দেয়। রসালো ফল!', ['আম', 'কলা', 'তরমুজ']),
  'gk-fruit-grape': gkLesson('gk-fruit-grape', 'আ', 'আঙ্গুর', 'Grape', '🍇', 'from-violet-400 to-purple-600', 'আঙ্গুর ছোট ছোট দলায় থাকে। মিষ্টি!', ['আম', 'কলা', 'আপেল']),
  'gk-fruit-watermelon': gkLesson('gk-fruit-watermelon', 'ত', 'তরমুজ', 'Watermelon', '🍉', 'from-green-400 to-red-500', 'তরমুজ বড় ও রসালো। গরমে খেতে ভালো!', ['আম', 'কলা', 'কমলা']),
  'gk-fruit-jackfruit': gkLesson('gk-fruit-jackfruit', 'কা', 'কাঁঠাল', 'Jackfruit', '🍈', 'from-green-400 to-yellow-500', 'কাঁঠাল বাংলাদেশের জাতীয় ফলের মতোই জনপ্রিয়। বড় ও মিষ্টি!', ['আম', 'কলা', 'তরমুজ']),
  'gk-fruit-guava': gkLesson('gk-fruit-guava', 'পে', 'পেয়ারা', 'Guava', '🟢', 'from-lime-400 to-green-600', 'পেয়ারা সবুজ ও মিষ্টি। ভিটামিন সি আছে!', ['আম', 'কলা', 'আপেল']),

  // —— প্রাণী ——
  'gk-animal-tiger': gkLesson('gk-animal-tiger', 'বা', 'বাঘ', 'Tiger', '🐯', 'from-orange-400 to-amber-600', 'বাঘ বাংলাদেশের জাতীয় পশু। সুন্দরবনে থাকে।', ['হাতি', 'গরু', 'বিড়াল']),
  'gk-animal-elephant': gkLesson('gk-animal-elephant', 'হা', 'হাতি', 'Elephant', '🐘', 'from-slate-400 to-gray-600', 'হাতির বড় কান ও লম্বা শুঁড় আছে।', ['বাঘ', 'গরু', 'কুকুর']),
  'gk-animal-cow': gkLesson('gk-animal-cow', 'গ', 'গরু', 'Cow', '🐄', 'from-amber-300 to-stone-500', 'গরু দুধ দেয়। গ্রামে অনেক গরু দেখা যায়।', ['বাঘ', 'হাতি', 'বিড়াল']),
  'gk-animal-cat': gkLesson('gk-animal-cat', 'বি', 'বিড়াল', 'Cat', '🐱', 'from-rose-300 to-orange-400', 'বিড়াল মিউ মিউ করে। পোষা প্রাণী।', ['কুকুর', 'গরু', 'পাখি']),
  'gk-animal-dog': gkLesson('gk-animal-dog', 'কু', 'কুকুর', 'Dog', '🐶', 'from-amber-400 to-yellow-600', 'কুকুর বিশ্বস্ত বন্ধু। ভাউ ভাউ করে।', ['বিড়াল', 'গরু', 'পাখি']),
  'gk-animal-bird': gkLesson('gk-animal-bird', 'পা', 'পাখি', 'Bird', '🐦', 'from-sky-400 to-cyan-500', 'পাখি উড়তে পারে। গান গায়।', ['বাঘ', 'বিড়াল', 'গরু']),
  'gk-animal-fish': gkLesson('gk-animal-fish', 'মা', 'মাছ', 'Fish', '🐟', 'from-cyan-400 to-blue-600', 'মাছ পানিতে থাকে। ইলিশ বাংলাদেশের জাতীয় মাছ।', ['পাখি', 'গরু', 'বিড়াল']),
  'gk-animal-rabbit': gkLesson('gk-animal-rabbit', 'খ', 'খরগোশ', 'Rabbit', '🐰', 'from-pink-300 to-rose-400', 'খরগোশের লম্বা কান। দ্রুত লাফায়!', ['বিড়াল', 'কুকুর', 'পাখি']),

  // —— শরীর ——
  'gk-body-eye': gkLesson('gk-body-eye', 'চ', 'চোখ', 'Eye', '👁️', 'from-sky-400 to-blue-600', 'চোখ দিয়ে আমরা দেখি। দুটি চোখ আছে।', ['কান', 'নাক', 'হাত']),
  'gk-body-ear': gkLesson('gk-body-ear', 'ক', 'কান', 'Ear', '👂', 'from-amber-400 to-orange-500', 'কান দিয়ে আমরা শুনি। দুটি কান আছে।', ['চোখ', 'নাক', 'পা']),
  'gk-body-hand': gkLesson('gk-body-hand', 'হ', 'হাত', 'Hand', '✋', 'from-rose-400 to-pink-500', 'হাত দিয়ে ধরি ও লিখি। পাঁচটি আঙুল।', ['পা', 'চোখ', 'নাক']),
  'gk-body-foot': gkLesson('gk-body-foot', 'পা', 'পা', 'Foot', '🦶', 'from-violet-400 to-purple-500', 'পা দিয়ে হাঁটি ও দৌড়াই।', ['হাত', 'চোখ', 'কান']),
  'gk-body-nose': gkLesson('gk-body-nose', 'ন', 'নাক', 'Nose', '👃', 'from-emerald-400 to-teal-500', 'নাক দিয়ে শ্বাস নিই ও গন্ধ পাই।', ['চোখ', 'কান', 'হাত']),
  'gk-body-mouth': gkLesson('gk-body-mouth', 'মু', 'মুখ', 'Mouth', '👄', 'from-rose-400 to-red-500', 'মুখ দিয়ে কথা বলি ও খাই।', ['নাক', 'চোখ', 'কান']),

  // —— যানবাহন ——
  'gk-vehicle-bus': gkLesson('gk-vehicle-bus', 'বা', 'বাস', 'Bus', '🚌', 'from-yellow-400 to-amber-600', 'বাস অনেক যাত্রী নিয়ে যায়। রাস্তায় চলে।', ['গাড়ি', 'ট্রেন', 'নৌকা']),
  'gk-vehicle-car': gkLesson('gk-vehicle-car', 'গা', 'গাড়ি', 'Car', '🚗', 'from-sky-400 to-blue-600', 'গাড়ি পরিবারে চলাচলের জন্য। চার চাকা।', ['বাস', 'ট্রেন', 'বিমান']),
  'gk-vehicle-train': gkLesson('gk-vehicle-train', 'ট', 'ট্রেন', 'Train', '🚂', 'from-slate-400 to-zinc-600', 'ট্রেন রেলে চলে। অনেক বগি থাকে।', ['বাস', 'গাড়ি', 'নৌকা']),
  'gk-vehicle-boat': gkLesson('gk-vehicle-boat', 'ন', 'নৌকা', 'Boat', '⛵', 'from-cyan-400 to-blue-500', 'নৌকা পানিতে চলে। নদীতে দেখা যায়।', ['বাস', 'বিমান', 'ট্রেন']),
  'gk-vehicle-plane': gkLesson('gk-vehicle-plane', 'বি', 'বিমান', 'Plane', '✈️', 'from-indigo-400 to-violet-600', 'বিমান আকাশে উড়ে। দূর দেশে যায়।', ['বাস', 'নৌকা', 'গাড়ি']),
  'gk-vehicle-rickshaw': gkLesson('gk-vehicle-rickshaw', 'রি', 'রিকশা', 'Rickshaw', '🛺', 'from-green-400 to-lime-500', 'রিকশা বাংলাদেশে খুব পরিচিত। তিন চাকা।', ['বাস', 'গাড়ি', 'ট্রেন']),

  // —— বাংলাদেশ ——
  'gk-bd-flag': gkLesson('gk-bd-flag', 'প', 'পতাকা', 'Flag', '🇧🇩', 'from-green-400 to-emerald-600', 'বাংলাদেশের পতাকা সবুজ, মাঝে লাল বৃত্ত।', ['ঢাকা', 'শাপলা', 'দোয়েল']),
  'gk-bd-capital': gkLesson('gk-bd-capital', 'ঢ', 'ঢাকা', 'Dhaka', '🏛️', 'from-amber-400 to-orange-600', 'ঢাকা বাংলাদেশের রাজধানী। বড় শহর।', ['পতাকা', 'শাপলা', 'চট্টগ্রাম']),
  'gk-bd-flower': gkLesson('gk-bd-flower', 'শা', 'শাপলা', 'Water lily', '🌸', 'from-pink-300 to-rose-500', 'শাপলা বাংলাদেশের জাতীয় ফুল। পানিতে ফোটে।', ['পতাকা', 'দোয়েল', 'ঢাকা']),
  'gk-bd-bird': gkLesson('gk-bd-bird', 'দো', 'দোয়েল', 'Magpie robin', '🦜', 'from-slate-400 to-stone-600', 'দোয়েল বাংলাদেশের জাতীয় পাখি। সুন্দর গান গায়।', ['শাপলা', 'পতাকা', 'বাঘ']),
  'gk-bd-hilsa': gkLesson('gk-bd-hilsa', 'ই', 'ইলিশ', 'Hilsa', '🐠', 'from-silver-400 to-slate-500', 'ইলিশ বাংলাদেশের জাতীয় মাছ। খুব সুস্বাদু!', ['দোয়েল', 'শাপলা', 'বাঘ']),
  'gk-bd-language': gkLesson('gk-bd-language', 'বা', 'বাংলা', 'Bangla', '📝', 'from-green-400 to-teal-600', 'বাংলা আমাদের মাতৃভাষা। ২১শে ফেব্রুয়ারি ভাষা দিবস।', ['ইংরেজি', 'আরবি', 'হিন্দি']),

  // —— ঋতু ——
  'gk-season-summer': gkLesson('gk-season-summer', 'গ', 'গ্রীষ্ম', 'Summer', '☀️', 'from-amber-400 to-orange-600', 'গ্রীষ্মে গরম পড়ে। আম পাকে।', ['বর্ষা', 'শীত', 'শরৎ']),
  'gk-season-rainy': gkLesson('gk-season-rainy', 'ব', 'বর্ষা', 'Rainy', '🌧️', 'from-sky-400 to-blue-600', 'বর্ষায় বৃষ্টি হয়। ছাতা লাগে।', ['গ্রীষ্ম', 'শীত', 'বসন্ত']),
  'gk-season-winter': gkLesson('gk-season-winter', 'শি', 'শীত', 'Winter', '❄️', 'from-cyan-300 to-blue-500', 'শীতে ঠান্ডা পড়ে। সোয়েটার পরে।', ['গ্রীষ্ম', 'বর্ষা', 'বসন্ত']),
  'gk-season-spring': gkLesson('gk-season-spring', 'ব', 'বসন্ত', 'Spring', '🌼', 'from-pink-300 to-yellow-400', 'বসন্তে ফুল ফোটে। পহেলা ফাল্গুন!', ['শীত', 'গ্রীষ্ম', 'বর্ষা']),

  // —— পেশা ——
  'gk-job-doctor': gkLesson('gk-job-doctor', 'ডা', 'ডাক্তার', 'Doctor', '👨‍⚕️', 'from-sky-400 to-teal-500', 'ডাক্তার অসুস্থ মানুষকে সুস্থ করেন।', ['শিক্ষক', 'কৃষক', 'পুলিশ']),
  'gk-job-teacher': gkLesson('gk-job-teacher', 'শি', 'শিক্ষক', 'Teacher', '👩‍🏫', 'from-violet-400 to-indigo-500', 'শিক্ষক আমাদের পড়ায় ও শেখায়।', ['ডাক্তার', 'কৃষক', 'পুলিশ']),
  'gk-job-farmer': gkLesson('gk-job-farmer', 'কৃ', 'কৃষক', 'Farmer', '👨‍🌾', 'from-lime-400 to-green-600', 'কৃষক ক্ষেতে ধান ও সবজি ফলান।', ['ডাক্তার', 'শিক্ষক', 'পুলিশ']),
  'gk-job-police': gkLesson('gk-job-police', 'পু', 'পুলিশ', 'Police', '👮', 'from-blue-500 to-indigo-700', 'পুলিশ আমাদের নিরাপদ রাখে।', ['ডাক্তার', 'শিক্ষক', 'কৃষক']),
  'gk-job-driver': gkLesson('gk-job-driver', 'চা', 'চালক', 'Driver', '🧑‍✈️', 'from-amber-400 to-orange-500', 'চালক বাস বা গাড়ি চালান।', ['ডাক্তার', 'কৃষক', 'শিক্ষক']),

  // —— আবহাওয়া ——
  'gk-weather-sun': gkLesson('gk-weather-sun', 'সূ', 'সূর্য', 'Sun', '☀️', 'from-yellow-300 to-orange-500', 'সূর্য আলো ও তাপ দেয়। দিনে দেখা যায়।', ['চাঁদ', 'মেঘ', 'বৃষ্টি']),
  'gk-weather-moon': gkLesson('gk-weather-moon', 'চা', 'চাঁদ', 'Moon', '🌙', 'from-indigo-300 to-slate-500', 'চাঁদ রাতে জ্বলে। কখনো পূর্ণিমা হয়।', ['সূর্য', 'মেঘ', 'তারা']),
  'gk-weather-cloud': gkLesson('gk-weather-cloud', 'মে', 'মেঘ', 'Cloud', '☁️', 'from-slate-300 to-gray-500', 'মেঘ আকাশে ভাসে। বৃষ্টির আগে আসে।', ['সূর্য', 'চাঁদ', 'বৃষ্টি']),
  'gk-weather-rain': gkLesson('gk-weather-rain', 'বৃ', 'বৃষ্টি', 'Rain', '🌧️', 'from-blue-400 to-cyan-600', 'বৃষ্টি পানি দেয়। গাছপালা বাড়ে।', ['সূর্য', 'মেঘ', 'চাঁদ']),
  'gk-weather-star': gkLesson('gk-weather-star', 'তা', 'তারা', 'Star', '⭐', 'from-yellow-200 to-amber-400', 'তারা রাতে আকাশে জ্বলে। অনেক দূরে।', ['সূর্য', 'চাঁদ', 'মেঘ']),
}

export const GK_LESSON_IDS = Object.keys(gkLessons)
