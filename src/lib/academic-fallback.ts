/** Static NCTB-style demo content when curriculum DB is empty */

export type FbSubject = {
  id: string
  name: string
  name_bn: string
  icon: string
  color: string
  is_mandatory: boolean
  order_index: number
}

export type FbChapter = {
  id: string
  title: string
  title_bn: string
  chapter_number: number
  description: string
  order_index: number
  subject_id: string
}

export type FbLesson = {
  id: string
  title: string
  title_bn: string
  lesson_type: string
  duration_minutes: number
  xp_reward: number
  order_index: number
  lesson_number: number
  chapter_id: string
  overview?: string
  main_content?: string
  summary?: string
}

const CLASS_BN: Record<number, string> = {
  1: 'প্রথম শ্রেণি',
  2: 'দ্বিতীয় শ্রেণি',
  3: 'তৃতীয় শ্রেণি',
  4: 'চতুর্থ শ্রেণি',
  5: 'পঞ্চম শ্রেণি',
  6: 'ষষ্ঠ শ্রেণি',
  7: 'সপ্তম শ্রেণি',
  8: 'অষ্টম শ্রেণি',
  9: 'নবম শ্রেণি',
  10: 'দশম শ্রেণি',
  11: 'একাদশ শ্রেণি',
  12: 'দ্বাদশ শ্রেণি',
}

export function parseClassNum(slug: string): number | null {
  const m = decodeURIComponent(slug || '').match(/(\d{1,2})/)
  if (!m) return null
  const n = parseInt(m[1], 10)
  return n >= 1 && n <= 12 ? n : null
}

export function fallbackClassInfo(slug: string): {
  id: string
  name: string
  slug: string
  class_number: number
} | null {
  const n = parseClassNum(slug)
  if (n == null) return null
  return {
    id: `fb-class-${n}`,
    name: CLASS_BN[n] || `শ্রেণি ${n}`,
    slug: `class-${n}`,
    class_number: n,
  }
}

export function fallbackSubjects(classNum: number): FbSubject[] {
  const base = `fb-c${classNum}`
  const primary = classNum <= 5
  if (primary) {
    return [
      {
        id: `${base}-bangla`,
        name: 'Bangla',
        name_bn: 'বাংলা',
        icon: '📗',
        color: 'from-sky-500 to-blue-600',
        is_mandatory: true,
        order_index: 1,
      },
      {
        id: `${base}-english`,
        name: 'English',
        name_bn: 'ইংরেজি',
        icon: '📘',
        color: 'from-violet-500 to-purple-600',
        is_mandatory: true,
        order_index: 2,
      },
      {
        id: `${base}-math`,
        name: 'Mathematics',
        name_bn: 'গণিত',
        icon: '🔢',
        color: 'from-amber-500 to-orange-600',
        is_mandatory: true,
        order_index: 3,
      },
      {
        id: `${base}-islam`,
        name: 'Islamic Studies',
        name_bn: 'ইসলাম শিক্ষা',
        icon: '🕌',
        color: 'from-emerald-500 to-teal-600',
        is_mandatory: true,
        order_index: 4,
      },
      {
        id: `${base}-science`,
        name: 'Science',
        name_bn: 'বিজ্ঞান',
        icon: '🔬',
        color: 'from-cyan-500 to-sky-600',
        is_mandatory: false,
        order_index: 5,
      },
    ]
  }
  return [
    {
      id: `${base}-bangla`,
      name: 'Bangla',
      name_bn: 'বাংলা',
      icon: '📗',
      color: 'from-sky-500 to-blue-600',
      is_mandatory: true,
      order_index: 1,
    },
    {
      id: `${base}-english`,
      name: 'English',
      name_bn: 'ইংরেজি',
      icon: '📘',
      color: 'from-violet-500 to-purple-600',
      is_mandatory: true,
      order_index: 2,
    },
    {
      id: `${base}-math`,
      name: 'Mathematics',
      name_bn: 'গণিত',
      icon: '🔢',
      color: 'from-amber-500 to-orange-600',
      is_mandatory: true,
      order_index: 3,
    },
    {
      id: `${base}-science`,
      name: 'Science',
      name_bn: 'বিজ্ঞান',
      icon: '🔬',
      color: 'from-cyan-500 to-sky-600',
      is_mandatory: true,
      order_index: 4,
    },
    {
      id: `${base}-islam`,
      name: 'Islamic Studies',
      name_bn: 'ইসলাম শিক্ষা',
      icon: '🕌',
      color: 'from-emerald-500 to-teal-600',
      is_mandatory: true,
      order_index: 5,
    },
    {
      id: `${base}-bangladesh`,
      name: 'Bangladesh & Global Studies',
      name_bn: 'বাংলাদেশ ও বিশ্বপরিচয়',
      icon: '🇧🇩',
      color: 'from-green-500 to-emerald-700',
      is_mandatory: true,
      order_index: 6,
    },
    {
      id: `${base}-ict`,
      name: 'ICT',
      name_bn: 'তথ্য ও যোগাযোগ প্রযুক্তি',
      icon: '💻',
      color: 'from-indigo-500 to-blue-600',
      is_mandatory: true,
      order_index: 7,
    },
    {
      id: `${base}-health`,
      name: 'Physical Education & Health',
      name_bn: 'শারীরিক শিক্ষা ও স্বাস্থ্য',
      icon: '🏃',
      color: 'from-rose-500 to-orange-500',
      is_mandatory: false,
      order_index: 8,
    },
  ]
}

export function fallbackChapters(subjectId: string): FbChapter[] {
  const classMatch = subjectId.match(/fb-c(\d{1,2})/i)
  const classNum = classMatch ? parseInt(classMatch[1], 10) : 1
  const junior = classNum >= 6

  const kind = subjectId.includes('bangla')
    ? 'bangla'
    : subjectId.includes('english')
      ? 'english'
      : subjectId.includes('math')
        ? 'math'
        : subjectId.includes('islam')
          ? 'islam'
          : subjectId.includes('science')
            ? 'science'
            : subjectId.includes('bangladesh') || subjectId.includes('-ss') || subjectId.includes('bgs')
              ? 'bangladesh'
              : subjectId.includes('ict')
                ? 'ict'
                : subjectId.includes('health')
                  ? 'health'
                  : 'general'

  const primaryPacks: Record<string, { title: string; title_bn: string; desc: string }[]> = {
    bangla: [
      { title: 'Letters & Words', title_bn: 'বর্ণ ও শব্দ', desc: 'স্বরবর্ণ, ব্যঞ্জনবর্ণ ও সহজ শব্দ' },
      { title: 'Reading Practice', title_bn: 'পড়ার অনুশীলন', desc: 'ছোট বাক্য ও অনুচ্ছেদ' },
      { title: 'Writing Basics', title_bn: 'লেখার ভিত্তি', desc: 'অক্ষর গঠন ও শব্দ লেখা' },
    ],
    english: [
      { title: 'Alphabet', title_bn: 'বর্ণমালা', desc: 'A to Z — listen and say' },
      { title: 'Simple Words', title_bn: 'সহজ শব্দ', desc: 'Everyday vocabulary' },
      { title: 'Sentences', title_bn: 'বাক্য', desc: 'I am · You are · This is' },
    ],
    math: [
      { title: 'Numbers 1–20', title_bn: 'সংখ্যা ১–২০', desc: 'গণনা ও চিনতে শেখা' },
      { title: 'Add & Subtract', title_bn: 'যোগ ও বিয়োগ', desc: 'সহজ যোগ-বিয়োগ' },
      { title: 'Shapes', title_bn: 'আকৃতি', desc: 'গোল · বর্গ · ত্রিভুজ' },
    ],
    islam: [
      { title: 'Iman Basics', title_bn: 'ঈমানের ভিত্তি', desc: 'আল্লাহ · রাসূল · কুরআন' },
      { title: 'Daily Duas', title_bn: 'দৈনন্দিন দোয়া', desc: 'খাওয়া · ঘুম · সালাম' },
      { title: 'Good Manners', title_bn: 'আদব-কায়দা', desc: 'সততা · দয়া · সম্মান' },
    ],
    science: [
      { title: 'Our Body', title_bn: 'আমাদের শরীর', desc: 'ইন্দ্রিয় ও যত্ন' },
      { title: 'Plants & Animals', title_bn: 'গাছ ও প্রাণী', desc: 'প্রকৃতির বন্ধু' },
      { title: 'Weather', title_bn: 'আবহাওয়া', desc: 'বৃষ্টি · রোদ · ঋতু' },
    ],
    bangladesh: [
      { title: 'Our Country', title_bn: 'আমাদের দেশ', desc: 'বাংলাদেশ পরিচিতি' },
      { title: 'Family & Society', title_bn: 'পরিবার ও সমাজ', desc: 'দায়িত্ব ও সম্প্রীতি' },
    ],
    ict: [
      { title: 'Computer Basics', title_bn: 'কম্পিউটার পরিচিতি', desc: 'হার্ডওয়্যার · সফটওয়্যার' },
      { title: 'Internet Safety', title_bn: 'ইন্টারনেট নিরাপত্তা', desc: 'পাসওয়ার্ড · privacy' },
    ],
    health: [
      { title: 'Fitness', title_bn: 'ফিটনেস', desc: 'ব্যায়াম ও খেলা' },
      { title: 'Hygiene', title_bn: 'পরিচ্ছন্নতা', desc: 'দৈনন্দিন অভ্যাস' },
    ],
    general: [
      { title: 'Introduction', title_bn: 'ভূমিকা', desc: 'মৌলিক ধারণা' },
      { title: 'Practice', title_bn: 'অনুশীলন', desc: 'কাজ ও উদাহরণ' },
      { title: 'Review', title_bn: 'পুনরালোচনা', desc: 'মূল বিষয় মনে রাখা' },
    ],
  }

  const juniorPacks: Record<string, { title: string; title_bn: string; desc: string }[]> = {
    bangla: [
      { title: 'Grammar', title_bn: 'ব্যাকরণ', desc: 'পদ, বাক্য, সন্ধি, সমাস' },
      { title: 'Literature', title_bn: 'সাহিত্য', desc: 'গদ্য · পদ্য · নাটক' },
      { title: 'Composition', title_bn: 'রচনা ও অনুবাদ', desc: 'অনুচ্ছেদ, চিঠি, অনুবাদ' },
    ],
    english: [
      { title: 'Grammar', title_bn: 'Grammar', desc: 'Tenses, articles, prepositions' },
      { title: 'Reading', title_bn: 'Reading', desc: 'Comprehension & vocabulary' },
      { title: 'Writing', title_bn: 'Writing', desc: 'Paragraph, letter, email' },
    ],
    math: [
      { title: 'Number System', title_bn: 'সংখ্যা পদ্ধতি', desc: 'পূর্ণসংখ্যা, ভগ্নাংশ, দশমিক' },
      { title: 'Algebra Intro', title_bn: 'বীজগণিত পরিচিতি', desc: 'চলক, সরল সমীকরণ' },
      { title: 'Geometry', title_bn: 'জ্যামিতি', desc: 'রেখা, কোণ, ত্রিভুজ, ক্ষেত্রফল' },
    ],
    science: [
      { title: 'Physics Basics', title_bn: 'পদার্থবিজ্ঞানের ভিত্তি', desc: 'বল, গতি, আলো, বিদ্যুৎ' },
      { title: 'Chemistry Basics', title_bn: 'রসায়নের ভিত্তি', desc: 'পদার্থ, মৌল, যৌগ' },
      { title: 'Biology Basics', title_bn: 'জীববিজ্ঞানের ভিত্তি', desc: 'কোষ, উদ্ভিদ, প্রাণী' },
    ],
    islam: [
      { title: 'Aqidah', title_bn: 'আকিদা', desc: 'ঈমান, তাওহীদ, রিসালাত' },
      { title: 'Ibadah', title_bn: 'ইবাদাত', desc: 'সালাত, সিয়াম, যাকাত, হজ' },
      { title: 'Akhlaq & Sirah', title_bn: 'আখলাক ও সীরাত', desc: 'চরিত্র ও নবীজীবনী' },
    ],
    bangladesh: [
      { title: 'History', title_bn: 'ইতিহাস', desc: 'প্রাচীন থেকে স্বাধীনতা' },
      { title: 'Geography', title_bn: 'ভূগোল', desc: 'মানচিত্র, নদী, জলবায়ু' },
      { title: 'Civics', title_bn: 'নাগরিক শিক্ষা', desc: 'সংবিধান, অধিকার, কর্তব্য' },
    ],
    ict: [
      { title: 'Computer Basics', title_bn: 'কম্পিউটার পরিচিতি', desc: 'হার্ডওয়্যার, সফটওয়্যার' },
      { title: 'Internet & Safety', title_bn: 'ইন্টারনেট ও নিরাপত্তা', desc: 'ওয়েব, ইমেইল, নিরাপদ ব্যবহার' },
      { title: 'Office Tools', title_bn: 'অফিস টুলস', desc: 'ওয়ার্ড, স্প্রেডশিট' },
    ],
    health: [
      { title: 'Fitness', title_bn: 'ফিটনেস', desc: 'ব্যায়াম, খেলা, পুষ্টি' },
      { title: 'Hygiene & First Aid', title_bn: 'স্বাস্থ্যবিধি ও প্রাথমিক চিকিৎসা', desc: 'পরিচ্ছন্নতা ও জরুরি সাহায্য' },
    ],
    general: [
      { title: 'Introduction', title_bn: 'ভূমিকা', desc: 'মূল ধারণা' },
      { title: 'Practice', title_bn: 'অনুশীলন', desc: 'কাজ ও উদাহরণ' },
      { title: 'Review', title_bn: 'পুনরালোচনা', desc: 'মূল বিষয় মনে রাখা' },
    ],
  }

  const packs = junior ? juniorPacks : primaryPacks
  const list = packs[kind] || packs.general
  return list.map((c, i) => ({
    id: `${subjectId}-ch${i + 1}`,
    title: c.title,
    title_bn: c.title_bn,
    chapter_number: i + 1,
    description: c.desc,
    order_index: i + 1,
    subject_id: subjectId,
  }))
}

export function fallbackLessons(chapterId: string): FbLesson[] {
  const topics = [
    { title: 'Introduction', title_bn: 'ভূমিকা', type: 'text' },
    { title: 'Learn the idea', title_bn: 'ধারণা শেখা', type: 'text' },
    { title: 'Examples', title_bn: 'উদাহরণ', type: 'exercise' },
    { title: 'Quick quiz', title_bn: 'দ্রুত কুইজ', type: 'quiz' },
  ]
  return topics.map((t, i) => ({
    id: `${chapterId}-l${i + 1}`,
    title: t.title,
    title_bn: t.title_bn,
    lesson_type: t.type,
    duration_minutes: t.type === 'quiz' ? 5 : 8,
    xp_reward: t.type === 'quiz' ? 25 : 15,
    order_index: i + 1,
    lesson_number: i + 1,
    chapter_id: chapterId,
    overview: 'এই পাঠে মূল ধারণা সহজে শিখবে।',
    main_content:
      'এটি ডেমো পাঠ। অ্যাডমিন যখন পূর্ণ পাঠ্যক্রম যোগ করবেন, এখানে বিস্তারিত বিষয়বস্তু দেখাবে।\n\nএখন অনুশীলন করো, কুইজ দাও এবং অগ্রগতি বাড়াও!',
    summary: 'মূল বিষয় মনে রাখো এবং পরের পাঠে এগিয়ে যাও।',
  }))
}

export function isFallbackId(id: string): boolean {
  return id.startsWith('fb-')
}
