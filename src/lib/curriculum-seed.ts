/**
 * Baseline NCTB-style curriculum seed for production bootstrap
 * when DB is empty. Admin-only via /api/admin/curriculum/seed
 */

export type SeedSubjectDef = {
  slug: string
  name: string
  nameBn: string
  icon: string
  color: string
  isMandatory: boolean
  chapters: {
    slug: string
    title: string
    titleBn: string
    description: string
    lessons: {
      slug: string
      title: string
      titleBn: string
      description: string
      durationMinutes: number
      xpReward: number
    }[]
  }[]
}

export type SeedClassDef = {
  classNumber: number
  slug: string
  name: string
  description: string
  subjects: SeedSubjectDef[]
}

function lessons(
  items: [string, string, string, string?][],
): SeedSubjectDef['chapters'][0]['lessons'] {
  return items.map(([slug, title, titleBn, description], i) => ({
    slug,
    title,
    titleBn,
    description: description || `${titleBn} — মৌলিক ধারণা ও অনুশীলন।`,
    durationMinutes: 10 + (i % 3) * 5,
    xpReward: 15 + (i % 2) * 10,
  }))
}

function subjectPack(
  kind: 'bangla' | 'english' | 'math' | 'islam' | 'science',
  classNum: number,
): SeedSubjectDef {
  const c = classNum
  const packs: Record<string, SeedSubjectDef> = {
    bangla: {
      slug: 'bangla',
      name: 'Bangla',
      nameBn: 'বাংলা',
      icon: '📗',
      color: 'from-sky-500 to-blue-600',
      isMandatory: true,
      chapters: [
        {
          slug: 'born-o-shobdo',
          title: 'Letters & Words',
          titleBn: 'বর্ণ ও শব্দ',
          description: 'স্বরবর্ণ, ব্যঞ্জনবর্ণ ও সহজ শব্দ',
          lessons: lessons([
            ['sworoborno', 'Vowels', 'স্বরবর্ণ', 'অ আ ই ঈ উ ঊ — চেনা ও উচ্চারণ'],
            ['banjonborno', 'Consonants', 'ব্যঞ্জনবর্ণ', 'ক খ গ ঘ — সহজ অনুশীলন'],
            ['sohoj-shobdo', 'Simple words', 'সহজ শব্দ', 'মা · বাবা · বই · স্কুল'],
            ['quiz-born', 'Letter quiz', 'বর্ণ কুইজ', 'মজার কুইজ দিয়ে মনে রাখা'],
          ]),
        },
        {
          slug: 'porar-onushilon',
          title: 'Reading Practice',
          titleBn: 'পড়ার অনুশীলন',
          description: 'ছোট বাক্য ও অনুচ্ছেদ',
          lessons: lessons([
            ['choto-bakko', 'Short sentences', 'ছোট বাক্য', 'আমি পড়ি · তুমি লেখ'],
            ['onucched', 'Paragraph', 'অনুচ্ছেদ', 'সহজ গল্প পড়া'],
            ['quiz-pora', 'Reading quiz', 'পড়ার কুইজ', 'বোঝার অনুশীলন'],
          ]),
        },
        {
          slug: 'lekhar-bhitti',
          title: 'Writing Basics',
          titleBn: 'লেখার ভিত্তি',
          description: 'অক্ষর গঠন ও শব্দ লেখা',
          lessons: lessons([
            ['okkhor-gothon', 'Letter forms', 'অক্ষর গঠন', 'সঠিক আকারে লেখা'],
            ['shobdo-lekha', 'Word writing', 'শব্দ লেখা', 'শব্দ কপি ও অনুশীলন'],
          ]),
        },
      ],
    },
    english: {
      slug: 'english',
      name: 'English',
      nameBn: 'ইংরেজি',
      icon: '📘',
      color: 'from-violet-500 to-purple-600',
      isMandatory: true,
      chapters: [
        {
          slug: 'alphabet',
          title: 'Alphabet',
          titleBn: 'বর্ণমালা',
          description: 'A to Z — listen and say',
          lessons: lessons([
            ['a-to-m', 'A to M', 'A থেকে M', 'Letters A–M with sounds'],
            ['n-to-z', 'N to Z', 'N থেকে Z', 'Letters N–Z with sounds'],
            ['quiz-abc', 'ABC quiz', 'ABC কুইজ', 'Match letter and sound'],
          ]),
        },
        {
          slug: 'simple-words',
          title: 'Simple Words',
          titleBn: 'সহজ শব্দ',
          description: 'Everyday vocabulary',
          lessons: lessons([
            ['home-words', 'Home words', 'বাড়ির শব্দ', 'mother · father · home'],
            ['school-words', 'School words', 'স্কুলের শব্দ', 'book · pen · teacher'],
            ['quiz-words', 'Word quiz', 'শব্দ কুইজ', 'Picture to word'],
          ]),
        },
        {
          slug: 'sentences',
          title: 'Sentences',
          titleBn: 'বাক্য',
          description: 'I am · You are · This is',
          lessons: lessons([
            ['i-am', 'I am / You are', 'I am / You are', 'Basic be-verbs'],
            ['this-is', 'This is', 'This is', 'Pointing and naming'],
          ]),
        },
      ],
    },
    math: {
      slug: 'math',
      name: 'Mathematics',
      nameBn: 'গণিত',
      icon: '🔢',
      color: 'from-amber-500 to-orange-600',
      isMandatory: true,
      chapters: [
        {
          slug: 'numbers',
          title: c <= 2 ? 'Numbers 1–20' : 'Numbers & Place',
          titleBn: c <= 2 ? 'সংখ্যা ১–২০' : 'সংখ্যা ও স্থান',
          description: 'গণনা ও চিনতে শেখা',
          lessons: lessons([
            ['count-1-10', 'Count 1–10', '১ থেকে ১০', 'গণনা ও চেনানো'],
            ['count-11-20', 'Count 11–20', '১১ থেকে ২০', 'দশকের পরের সংখ্যা'],
            ['quiz-number', 'Number quiz', 'সংখ্যা কুইজ', 'মজার গণনা'],
          ]),
        },
        {
          slug: 'add-sub',
          title: 'Add & Subtract',
          titleBn: 'যোগ ও বিয়োগ',
          description: 'সহজ যোগ-বিয়োগ',
          lessons: lessons([
            ['addition', 'Addition', 'যোগ', 'ছোট সংখ্যার যোগ'],
            ['subtraction', 'Subtraction', 'বিয়োগ', 'ছোট সংখ্যার বিয়োগ'],
            ['quiz-ops', 'Ops quiz', 'যোগ-বিয়োগ কুইজ', 'দ্রুত অনুশীলন'],
          ]),
        },
        {
          slug: 'shapes',
          title: 'Shapes',
          titleBn: 'আকৃতি',
          description: 'গোল · বর্গ · ত্রিভুজ',
          lessons: lessons([
            ['basic-shapes', 'Basic shapes', 'মৌলিক আকৃতি', 'গোলাকার · বর্গাকার · ত্রিভুজ'],
            ['shape-quiz', 'Shape quiz', 'আকৃতি কুইজ', 'চেনা ও মিলানো'],
          ]),
        },
      ],
    },
    islam: {
      slug: 'islam',
      name: 'Islamic Studies',
      nameBn: 'ইসলাম শিক্ষা',
      icon: '🕌',
      color: 'from-emerald-500 to-teal-600',
      isMandatory: true,
      chapters: [
        {
          slug: 'iman',
          title: 'Iman Basics',
          titleBn: 'ঈমানের ভিত্তি',
          description: 'আল্লাহ · রাসূল · কুরআন',
          lessons: lessons([
            ['allah', 'Allah', 'আল্লাহ', 'আল্লাহ এক ও অদ্বিতীয়'],
            ['rasul', 'Prophet', 'রাসূল ﷺ', 'মহানবী মুহাম্মদ ﷺ'],
            ['quran', 'Quran', 'কুরআন', 'আল্লাহর কিতাব'],
          ]),
        },
        {
          slug: 'duas',
          title: 'Daily Duas',
          titleBn: 'দৈনন্দিন দোয়া',
          description: 'খাওয়া · ঘুম · সালাম',
          lessons: lessons([
            ['dua-khawa', 'Before eating', 'খাওয়ার আগে', 'বিসমিল্লাহ'],
            ['dua-ghum', 'Before sleep', 'ঘুমানোর আগে', 'সহজ দোয়া'],
            ['salam', 'Salam', 'সালাম', 'আসসালামু আলাইকুম'],
          ]),
        },
        {
          slug: 'adab',
          title: 'Good Manners',
          titleBn: 'আদব-কায়দা',
          description: 'সততা · দয়া · সম্মান',
          lessons: lessons([
            ['honesty', 'Honesty', 'সততা', 'সত্য কথা বলা'],
            ['kindness', 'Kindness', 'দয়া', 'অপরের প্রতি সদয়'],
          ]),
        },
      ],
    },
    science: {
      slug: 'science',
      name: 'Science',
      nameBn: 'বিজ্ঞান',
      icon: '🔬',
      color: 'from-cyan-500 to-sky-600',
      isMandatory: false,
      chapters: [
        {
          slug: 'body',
          title: 'Our Body',
          titleBn: 'আমাদের শরীর',
          description: 'ইন্দ্রিয় ও যত্ন',
          lessons: lessons([
            ['senses', 'Five senses', 'পাঁচ ইন্দ্রিয়', 'দেখা · শোনা · স্বাদ'],
            ['care', 'Body care', 'যত্ন', 'পরিষ্কার-পরিচ্ছন্নতা'],
          ]),
        },
        {
          slug: 'nature',
          title: 'Plants & Animals',
          titleBn: 'গাছ ও প্রাণী',
          description: 'প্রকৃতির বন্ধু',
          lessons: lessons([
            ['plants', 'Plants', 'গাছপালা', 'গাছ কীভাবে বেড়ে ওঠে'],
            ['animals', 'Animals', 'প্রাণী', 'পোষা ও বন্য প্রাণী'],
          ]),
        },
        {
          slug: 'weather',
          title: 'Weather',
          titleBn: 'আবহাওয়া',
          description: 'বৃষ্টি · রোদ · ঋতু',
          lessons: lessons([
            ['rain-sun', 'Rain & sun', 'বৃষ্টি ও রোদ', 'দৈনন্দিন আবহাওয়া'],
            ['seasons', 'Seasons', 'ঋতু', 'গ্রীষ্ম · বর্ষা · শীত'],
          ]),
        },
      ],
    },
  }
  return packs[kind]
}

export function buildPrimarySeed(classes: number[] = [1, 2, 3, 4, 5]): SeedClassDef[] {
  const CLASS_BN: Record<number, string> = {
    1: 'প্রথম শ্রেণি',
    2: 'দ্বিতীয় শ্রেণি',
    3: 'তৃতীয় শ্রেণি',
    4: 'চতুর্থ শ্রেণি',
    5: 'পঞ্চম শ্রেণি',
  }

  return classes.map((n) => ({
    classNumber: n,
    slug: `class-${n}`,
    name: CLASS_BN[n] || `শ্রেণি ${n}`,
    description: `NCTB স্টাইল বেসলাইন পাঠ্যক্রম — ${CLASS_BN[n] || n}`,
    subjects: [
      subjectPack('bangla', n),
      subjectPack('english', n),
      subjectPack('math', n),
      subjectPack('islam', n),
      subjectPack('science', n),
    ],
  }))
}

export const SEED_VERSION = {
  slug: 'nctb-2026-baseline',
  name: 'NCTB 2026 Baseline',
  year: 2026,
  description:
    'Production bootstrap seed — প্রাইমারি ১–৫ শ্রেণি (বাংলা · ইংরেজি · গণিত · ইসলাম · বিজ্ঞান)',
  status: 'published' as const,
}
