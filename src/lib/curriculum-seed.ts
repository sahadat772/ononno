/**
 * NCTB-style curriculum seed — Class 1–5
 * Expanded: বাংলা · ইংরেজি · গণিত · ইসলাম · বিজ্ঞান · বাংলাদেশ ও বিশ্বপরিচয় · স্বাস্থ্য
 * Admin: /api/admin/curriculum/seed · /api/admin/curriculum/expand-nctb
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
    description: description || `${titleBn} — NCTB স্টাইল মৌলিক ধারণা ও অনুশীলন।`,
    durationMinutes: 12 + (i % 3) * 4,
    xpReward: 15 + (i % 2) * 10,
  }))
}

function bangla(c: number): SeedSubjectDef {
  const upper = c >= 3
  return {
    slug: 'bangla',
    name: 'Bangla',
    nameBn: 'বাংলা',
    icon: '📗',
    color: 'from-sky-500 to-blue-600',
    isMandatory: true,
    chapters: [
      {
        slug: 'born-o-shobdo',
        title: upper ? 'Letters, Spelling & Words' : 'Letters & Words',
        titleBn: upper ? 'বর্ণ, বানান ও শব্দ' : 'বর্ণ ও শব্দ',
        description: 'স্বরবর্ণ, ব্যঞ্জনবর্ণ, যুক্তবর্ণ ও শব্দভাণ্ডার',
        lessons: lessons(
          upper
            ? [
                ['sworoborno', 'Vowels', 'স্বরবর্ণ', 'অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ'],
                ['banjonborno', 'Consonants', 'ব্যঞ্জনবর্ণ', 'ক থেকে হ — সঠিক উচ্চারণ'],
                ['juktoborno', 'Conjuncts', 'যুক্তবর্ণ', 'ক্ত · ন্ত · স্ত — চেনা'],
                ['banan', 'Spelling', 'বানান', 'সহজ শব্দের সঠিক বানান'],
                ['sohoj-shobdo', 'Vocabulary', 'শব্দভাণ্ডার', 'দৈনন্দিন শব্দ'],
                ['quiz-born', 'Letter quiz', 'বর্ণ কুইজ', 'মজার কুইজ'],
              ]
            : [
                ['sworoborno', 'Vowels', 'স্বরবর্ণ', 'অ আ ই ঈ উ ঊ — চেনা ও উচ্চারণ'],
                ['banjonborno', 'Consonants', 'ব্যঞ্জনবর্ণ', 'ক খ গ ঘ — সহজ অনুশীলন'],
                ['sohoj-shobdo', 'Simple words', 'সহজ শব্দ', 'মা · বাবা · বই · স্কুল'],
                ['quiz-born', 'Letter quiz', 'বর্ণ কুইজ', 'মজার কুইজ দিয়ে মনে রাখা'],
              ],
        ),
      },
      {
        slug: 'porar-onushilon',
        title: 'Reading Practice',
        titleBn: 'পড়ার অনুশীলন',
        description: 'বাক্য, অনুচ্ছেদ ও বোধগম্যতা',
        lessons: lessons([
          ['choto-bakko', 'Short sentences', 'ছোট বাক্য', 'আমি পড়ি · তুমি লেখ'],
          ['onucched', 'Paragraph', 'অনুচ্ছেদ', 'সহজ গল্প পড়া'],
          ...(upper
            ? ([
                ['kobita-pora', 'Poem reading', 'কবিতা পড়া', 'ছোট কবিতার ছন্দ'],
                ['bodhgomota', 'Comprehension', 'বোধগম্যতা', 'প্রশ্নোত্তর অনুশীলন'],
              ] as [string, string, string, string?][])
            : []),
          ['quiz-pora', 'Reading quiz', 'পড়ার কুইজ', 'বোঝার অনুশীলন'],
        ]),
      },
      {
        slug: 'lekhar-bhitti',
        title: 'Writing Basics',
        titleBn: 'লেখার ভিত্তি',
        description: 'অক্ষর গঠন, শব্দ ও বাক্য লেখা',
        lessons: lessons([
          ['okkhor-gothon', 'Letter forms', 'অক্ষর গঠন', 'সঠিক আকারে লেখা'],
          ['shobdo-lekha', 'Word writing', 'শব্দ লেখা', 'শব্দ কপি ও অনুশীলন'],
          ...(upper
            ? ([['bakko-lekha', 'Sentence writing', 'বাক্য লেখা', 'নিজের কথায় লেখা']] as [
                string,
                string,
                string,
                string?,
              ][])
            : []),
        ]),
      },
    ],
  }
}

function english(c: number): SeedSubjectDef {
  const upper = c >= 3
  return {
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
        description: 'A to Z — listen, say, write',
        lessons: lessons([
          ['a-to-m', 'A to M', 'A থেকে M', 'Letters A–M with sounds'],
          ['n-to-z', 'N to Z', 'N থেকে Z', 'Letters N–Z with sounds'],
          ...(upper
            ? ([['phonics', 'Phonics', 'Phonics', 'Letter sounds & blends']] as [
                string,
                string,
                string,
                string?,
              ][])
            : []),
          ['quiz-abc', 'ABC quiz', 'ABC কুইজ', 'Match letter and sound'],
        ]),
      },
      {
        slug: 'simple-words',
        title: 'Vocabulary',
        titleBn: 'শব্দভাণ্ডার',
        description: 'Everyday & classroom words',
        lessons: lessons([
          ['home-words', 'Home words', 'বাড়ির শব্দ', 'mother · father · home'],
          ['school-words', 'School words', 'স্কুলের শব্দ', 'book · pen · teacher'],
          ...(upper
            ? ([
                ['action-words', 'Action words', 'ক্রিয়া শব্দ', 'run · eat · read · write'],
              ] as [string, string, string, string?][])
            : []),
          ['quiz-words', 'Word quiz', 'শব্দ কুইজ', 'Picture to word'],
        ]),
      },
      {
        slug: 'sentences',
        title: 'Sentences & Grammar',
        titleBn: 'বাক্য ও ব্যাকরণ',
        description: 'I am · You are · This is',
        lessons: lessons([
          ['i-am', 'I am / You are', 'I am / You are', 'Basic be-verbs'],
          ['this-is', 'This is', 'This is', 'Pointing and naming'],
          ...(upper
            ? ([
                ['present-simple', 'Present simple', 'Present simple', 'I play · She reads'],
              ] as [string, string, string, string?][])
            : []),
        ]),
      },
    ],
  }
}

function math(c: number): SeedSubjectDef {
  const upper = c >= 3
  return {
    slug: 'math',
    name: 'Mathematics',
    nameBn: 'গণিত',
    icon: '🔢',
    color: 'from-amber-500 to-orange-600',
    isMandatory: true,
    chapters: [
      {
        slug: 'numbers',
        title: c <= 2 ? 'Numbers 1–100' : 'Numbers & Place Value',
        titleBn: c <= 2 ? 'সংখ্যা ১–১০০' : 'সংখ্যা ও স্থানীয় মান',
        description: 'গণনা, লেখা ও স্থানীয় মান',
        lessons: lessons([
          ['count-1-10', 'Count 1–10', '১ থেকে ১০', 'গণনা ও চেনানো'],
          ['count-11-20', 'Count 11–20', '১১ থেকে ২০', 'দশকের পরের সংখ্যা'],
          ...(upper
            ? ([
                ['place-value', 'Place value', 'স্থানীয় মান', 'একক · দশক · শতক'],
                ['count-100', 'Up to 100', '১০০ পর্যন্ত', 'বড় সংখ্যা পড়া'],
              ] as [string, string, string, string?][])
            : [['count-to-50', 'Count to 50', '৫০ পর্যন্ত', 'ধাপে ধাপে গণনা']]),
          ['quiz-number', 'Number quiz', 'সংখ্যা কুইজ', 'মজার গণনা'],
        ]),
      },
      {
        slug: 'add-sub',
        title: upper ? 'Four Operations Intro' : 'Add & Subtract',
        titleBn: upper ? 'চার প্রক্রিয়া পরিচিতি' : 'যোগ ও বিয়োগ',
        description: 'যোগ · বিয়োগ' + (upper ? ' · গুণ · ভাগ' : ''),
        lessons: lessons([
          ['addition', 'Addition', 'যোগ', 'ছোট সংখ্যার যোগ'],
          ['subtraction', 'Subtraction', 'বিয়োগ', 'ছোট সংখ্যার বিয়োগ'],
          ...(upper
            ? ([
                ['multiplication', 'Multiplication', 'গুণ', '২ ও ৫ এর নামতা'],
                ['division', 'Division', 'ভাগ', 'সম ভাগের ধারণা'],
              ] as [string, string, string, string?][])
            : []),
          ['quiz-ops', 'Ops quiz', 'অপারেশন কুইজ', 'দ্রুত অনুশীলন'],
        ]),
      },
      {
        slug: 'shapes',
        title: upper ? 'Shapes & Measurement' : 'Shapes',
        titleBn: upper ? 'আকৃতি ও পরিমাপ' : 'আকৃতি',
        description: 'জ্যামিতি ও দৈনন্দিন পরিমাপ',
        lessons: lessons([
          ['basic-shapes', 'Basic shapes', 'মৌলিক আকৃতি', 'গোল · বর্গ · ত্রিভুজ'],
          ...(upper
            ? ([['measurement', 'Measurement', 'পরিমাপ', 'লম্বা · ওজন · সময়']] as [
                string,
                string,
                string,
                string?,
              ][])
            : []),
          ['shape-quiz', 'Shape quiz', 'আকৃতি কুইজ', 'চেনা ও মিলানো'],
        ]),
      },
    ],
  }
}

function islam(_c: number): SeedSubjectDef {
  return {
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
          ['iman-er-rukun', 'Pillars of faith', 'ঈমানের রুকন', 'ছয়টি মৌলিক বিশ্বাস'],
        ]),
      },
      {
        slug: 'duas',
        title: 'Daily Duas',
        titleBn: 'দৈনন্দিন দোয়া',
        description: 'খাওয়া · ঘুম · সালাম · স্কুল',
        lessons: lessons([
          ['dua-khawa', 'Before eating', 'খাওয়ার আগে', 'বিসমিল্লাহ'],
          ['dua-ghum', 'Before sleep', 'ঘুমানোর আগে', 'সহজ দোয়া'],
          ['salam', 'Salam', 'সালাম', 'আসসালামু আলাইকুম'],
          ['dua-school', 'Going to school', 'স্কুলে যাওয়ার দোয়া', 'সুরক্ষা ও বরকত'],
        ]),
      },
      {
        slug: 'adab',
        title: 'Good Manners',
        titleBn: 'আদব-কায়দা',
        description: 'সততা · দয়া · সম্মান · পিতা-মাতা',
        lessons: lessons([
          ['honesty', 'Honesty', 'সততা', 'সত্য কথা বলা'],
          ['kindness', 'Kindness', 'দয়া', 'অপরের প্রতি সদয়'],
          ['parents', 'Respect parents', 'পিতা-মাতার সম্মান', 'ভালো আচরণ'],
        ]),
      },
    ],
  }
}

function science(c: number): SeedSubjectDef {
  const upper = c >= 3
  return {
    slug: 'science',
    name: 'Science',
    nameBn: 'বিজ্ঞান',
    icon: '🔬',
    color: 'from-cyan-500 to-sky-600',
    isMandatory: c >= 3,
    chapters: [
      {
        slug: 'body',
        title: 'Our Body',
        titleBn: 'আমাদের শরীর',
        description: 'ইন্দ্রিয়, অঙ্গ ও যত্ন',
        lessons: lessons([
          ['senses', 'Five senses', 'পাঁচ ইন্দ্রিয়', 'দেখা · শোনা · স্বাদ'],
          ['care', 'Body care', 'যত্ন', 'পরিষ্কার-পরিচ্ছন্নতা'],
          ...(upper
            ? ([['food', 'Food & health', 'খাবার ও স্বাস্থ্য', 'পুষ্টিকর খাবার']] as [
                string,
                string,
                string,
                string?,
              ][])
            : []),
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
          ...(upper
            ? ([['habitat', 'Habitat', 'বাসস্থান', 'জল · স্থল · আকাশ']] as [
                string,
                string,
                string,
                string?,
              ][])
            : []),
        ]),
      },
      {
        slug: 'weather',
        title: 'Weather & Earth',
        titleBn: 'আবহাওয়া ও পৃথিবী',
        description: 'বৃষ্টি · রোদ · ঋতু',
        lessons: lessons([
          ['rain-sun', 'Rain & sun', 'বৃষ্টি ও রোদ', 'দৈনন্দিন আবহাওয়া'],
          ['seasons', 'Seasons', 'ঋতু', 'গ্রীষ্ম · বর্ষা · শীত'],
          ...(upper
            ? ([['earth', 'Our earth', 'আমাদের পৃথিবী', 'মাটি · পানি · বাতাস']] as [
                string,
                string,
                string,
                string?,
              ][])
            : []),
        ]),
      },
    ],
  }
}

function bangladesh(c: number): SeedSubjectDef {
  return {
    slug: 'bangladesh',
    name: 'Bangladesh & Global Studies',
    nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়',
    icon: '🇧🇩',
    color: 'from-green-500 to-emerald-700',
    isMandatory: c >= 3,
    chapters: [
      {
        slug: 'amar-desh',
        title: 'My Country',
        titleBn: 'আমার দেশ',
        description: 'বাংলাদেশ চেনা',
        lessons: lessons([
          ['bangladesh-porichoy', 'Intro to BD', 'বাংলাদেশ পরিচিতি', 'দেশের নাম · পতাকা'],
          ['jatio-proticok', 'National symbols', 'জাতীয় প্রতীক', 'পতাকা · পাখি · ফুল'],
          ['amar-gram-shohor', 'Village & city', 'গ্রাম ও শহর', 'আমাদের পরিবেশ'],
        ]),
      },
      {
        slug: 'poribar-somaj',
        title: 'Family & Society',
        titleBn: 'পরিবার ও সমাজ',
        description: 'পারিবারিক ও সামাজিক সম্পর্ক',
        lessons: lessons([
          ['poribar', 'Family', 'পরিবার', 'মা-বাবা · ভাই-বোন'],
          ['porshi', 'Neighbors', 'প্রতিবেশী', 'সহায়তা ও সম্মান'],
          ['school-community', 'School community', 'স্কুল সম্প্রদায়', 'শিক্ষক · সহপাঠী'],
        ]),
      },
      ...(c >= 3
        ? [
            {
              slug: 'itihas-bhugol',
              title: 'History & Map Basics',
              titleBn: 'ইতিহাস ও মানচিত্র',
              description: 'স্বাধীনতা ও মানচিত্র চেনা',
              lessons: lessons([
                ['swadhinata', 'Independence', 'স্বাধীনতা', '২৬ মার্চ · ১৬ ডিসেম্বর'],
                ['manchitro', 'Map basics', 'মানচিত্র', 'উত্তর-দক্ষিণ চেনা'],
              ]),
            },
          ]
        : []),
    ],
  }
}

function health(c: number): SeedSubjectDef {
  return {
    slug: 'health',
    name: 'Health & Physical Education',
    nameBn: 'স্বাস্থ্য ও শরীরচর্চা',
    icon: '🏃',
    color: 'from-rose-500 to-orange-500',
    isMandatory: false,
    chapters: [
      {
        slug: 'poricchonnata',
        title: 'Cleanliness',
        titleBn: 'পরিচ্ছন্নতা',
        description: 'হাত ধোয়া · দাঁত মাজা · পরিবেশ',
        lessons: lessons([
          ['hat-dhowa', 'Hand washing', 'হাত ধোয়া', 'খাওয়ার আগে-পরে'],
          ['dat-maja', 'Brushing teeth', 'দাঁত মাজা', 'সকাল-সন্ধ্যা'],
          ['poribesh', 'Clean environment', 'পরিচ্ছন্ন পরিবেশ', 'আবর্জনা ফেলা'],
        ]),
      },
      {
        slug: 'khela-dhula',
        title: 'Play & Exercise',
        titleBn: 'খেলাধুলা',
        description: 'সক্রিয় থাকা',
        lessons: lessons([
          ['morning-exercise', 'Morning exercise', 'সকালের ব্যায়াম', 'সহজ stretching'],
          ['team-play', 'Team games', 'দলীয় খেলা', 'সহযোগিতা'],
          ...(c >= 3
            ? ([['safety-play', 'Safe play', 'নিরাপদ খেলা', 'সতর্কতা']] as [
                string,
                string,
                string,
                string?,
              ][])
            : []),
        ]),
      },
    ],
  }
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
    description: `NCTB অ্যালাইনড পাঠ্যক্রম — ${CLASS_BN[n] || n} (৭টি বিষয়)`,
    subjects: [
      bangla(n),
      english(n),
      math(n),
      islam(n),
      science(n),
      bangladesh(n),
      health(n),
    ],
  }))
}

export const SEED_VERSION = {
  slug: 'nctb-2026-expanded',
  name: 'NCTB 2026 Expanded',
  year: 2026,
  description:
    'প্রাইমারি ১–৫: বাংলা · ইংরেজি · গণিত · ইসলাম · বিজ্ঞান · বাংলাদেশ ও বিশ্বপরিচয় · স্বাস্থ্য — NCTB-স্টাইল অধ্যায়/পাঠ',
  status: 'published' as const,
}

export const LEGACY_SEED_SLUGS = ['nctb-2026-baseline', 'nctb-2026-expanded']
