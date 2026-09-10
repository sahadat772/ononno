/**
 * NCTB Class 6–8 junior secondary subject packs
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

function juniorBangla(): SeedSubjectDef {
  return {
    slug: 'bangla',
    name: 'Bangla',
    nameBn: 'বাংলা',
    icon: '📗',
    color: 'from-sky-500 to-blue-600',
    isMandatory: true,
    chapters: [
      {
        slug: 'byakoron',
        title: 'Grammar',
        titleBn: 'ব্যাকরণ',
        description: 'পদ, বাক্য, সন্ধি, সমাস',
        lessons: lessons([
          ['pod', 'Parts of speech', 'পদ পরিচয়', 'বিশেষ্য · সর্বনাম · ক্রিয়া'],
          ['bakko', 'Sentences', 'বাক্য', 'সরল · জটিল · যৌগিক'],
          ['shondhi', 'Sandhi', 'সন্ধি', 'স্বর ও ব্যঞ্জন সন্ধি'],
          ['shomas', 'Compound words', 'সমাস', 'সহজ সমাস চেনা'],
          ['quiz-byakoron', 'Grammar quiz', 'ব্যাকরণ কুইজ', 'অনুশীলন'],
        ]),
      },
      {
        slug: 'sahityo',
        title: 'Literature',
        titleBn: 'সাহিত্য',
        description: 'গদ্য · পদ্য · নাটক',
        lessons: lessons([
          ['gadya', 'Prose', 'গদ্য', 'গল্প ও প্রবন্ধ পড়া'],
          ['poddo', 'Poetry', 'পদ্য', 'কবিতার ভাব ও ছন্দ'],
          ['natok', 'Drama intro', 'নাটক পরিচিতি', 'চরিত্র ও সংলাপ'],
          ['quiz-sahityo', 'Lit quiz', 'সাহিত্য কুইজ', 'বোঝাপড়া'],
        ]),
      },
      {
        slug: 'rochona',
        title: 'Composition',
        titleBn: 'রচনা ও অনুবাদ',
        description: 'অনুচ্ছেদ, চিঠি, অনুবাদ',
        lessons: lessons([
          ['onucched-rochona', 'Paragraph', 'অনুচ্ছেদ রচনা', 'বিষয় ভিত্তিক লেখা'],
          ['chithi', 'Letter writing', 'চিঠি লেখা', 'আনুষ্ঠানিক · ব্যক্তিগত'],
          ['onubad', 'Translation', 'অনুবাদ', 'বাংলা ↔ ইংরেজি সহজ'],
        ]),
      },
    ],
  }
}

function juniorEnglish(): SeedSubjectDef {
  return {
    slug: 'english',
    name: 'English',
    nameBn: 'ইংরেজি',
    icon: '📘',
    color: 'from-violet-500 to-purple-600',
    isMandatory: true,
    chapters: [
      {
        slug: 'grammar',
        title: 'Grammar',
        titleBn: 'Grammar',
        description: 'Tenses, articles, prepositions',
        lessons: lessons([
          ['tenses', 'Tenses', 'Tenses', 'Present · Past · Future'],
          ['articles', 'Articles', 'Articles', 'a · an · the'],
          ['prepositions', 'Prepositions', 'Prepositions', 'in · on · at · to'],
          ['quiz-grammar', 'Grammar quiz', 'Grammar quiz', 'Practice'],
        ]),
      },
      {
        slug: 'reading',
        title: 'Reading',
        titleBn: 'Reading',
        description: 'Comprehension & vocabulary',
        lessons: lessons([
          ['comprehension', 'Comprehension', 'Comprehension', 'Read and answer'],
          ['vocabulary', 'Vocabulary', 'Vocabulary', 'New words in context'],
          ['dialogue', 'Dialogue', 'Dialogue', 'Everyday conversation'],
        ]),
      },
      {
        slug: 'writing',
        title: 'Writing',
        titleBn: 'Writing',
        description: 'Paragraph, letter, email',
        lessons: lessons([
          ['paragraph', 'Paragraph', 'Paragraph', 'Topic sentence + support'],
          ['formal-letter', 'Formal letter', 'Formal letter', 'School / office style'],
          ['email', 'Email basics', 'Email', 'Subject · greeting · body'],
        ]),
      },
    ],
  }
}

function juniorMath(): SeedSubjectDef {
  return {
    slug: 'math',
    name: 'Mathematics',
    nameBn: 'গণিত',
    icon: '🔢',
    color: 'from-amber-500 to-orange-600',
    isMandatory: true,
    chapters: [
      {
        slug: 'number-system',
        title: 'Number System',
        titleBn: 'সংখ্যা পদ্ধতি',
        description: 'পূর্ণসংখ্যা, ভগ্নাংশ, দশমিক',
        lessons: lessons([
          ['integers', 'Integers', 'পূর্ণসংখ্যা', 'ধনাত্মক · ঋণাত্মক'],
          ['fractions', 'Fractions', 'ভগ্নাংশ', 'যোগ-বিয়োগ-গুণ-ভাগ'],
          ['decimals', 'Decimals', 'দশমিক', 'দশমিক স্থান'],
          ['quiz-number', 'Number quiz', 'সংখ্যা কুইজ', 'অনুশীলন'],
        ]),
      },
      {
        slug: 'algebra-intro',
        title: 'Algebra Intro',
        titleBn: 'বীজগণিত পরিচিতি',
        description: 'চলক, সরল সমীকরণ',
        lessons: lessons([
          ['variables', 'Variables', 'চলক', 'x · y এর ধারণা'],
          ['simple-equation', 'Simple equations', 'সরল সমীকরণ', 'এক চলকের সমাধান'],
          ['quiz-algebra', 'Algebra quiz', 'বীজগণিত কুইজ', 'অনুশীলন'],
        ]),
      },
      {
        slug: 'geometry',
        title: 'Geometry',
        titleBn: 'জ্যামিতি',
        description: 'রেখা, কোণ, ত্রিভুজ, বৃত্ত',
        lessons: lessons([
          ['lines-angles', 'Lines & angles', 'রেখা ও কোণ', 'সমান্তরাল · লম্ব'],
          ['triangles', 'Triangles', 'ত্রিভুজ', 'প্রকারভেদ ও বৈশিষ্ট্য'],
          ['circle-area', 'Area & perimeter', 'ক্ষেত্রফল ও পরিসীমা', 'আয়ত · বর্গ · বৃত্ত'],
          ['quiz-geo', 'Geometry quiz', 'জ্যামিতি কুইজ', 'অনুশীলন'],
        ]),
      },
    ],
  }
}

function juniorScience(): SeedSubjectDef {
  return {
    slug: 'science',
    name: 'Science',
    nameBn: 'বিজ্ঞান',
    icon: '🔬',
    color: 'from-cyan-500 to-sky-600',
    isMandatory: true,
    chapters: [
      {
        slug: 'physics-basics',
        title: 'Physics Basics',
        titleBn: 'পদার্থবিজ্ঞানের ভিত্তি',
        description: 'বল, গতি, আলো, বিদ্যুৎ',
        lessons: lessons([
          ['force-motion', 'Force & motion', 'বল ও গতি', 'গতি · স্থিতি · বল'],
          ['light', 'Light', 'আলো', 'প্রতিফলন · ছায়া'],
          ['electricity', 'Electricity', 'বিদ্যুৎ', 'বৈদ্যুতিক বর্তনী পরিচিতি'],
        ]),
      },
      {
        slug: 'chemistry-basics',
        title: 'Chemistry Basics',
        titleBn: 'রসায়নের ভিত্তি',
        description: 'পদার্থ, মৌল, যৌগ',
        lessons: lessons([
          ['matter', 'Matter', 'পদার্থ', 'কঠিন · তরল · গ্যাস'],
          ['elements', 'Elements & compounds', 'মৌল ও যৌগ', 'সহজ উদাহরণ'],
          ['water-air', 'Water & air', 'পানি ও বায়ু', 'গুণাগুণ ও দূষণ'],
        ]),
      },
      {
        slug: 'biology-basics',
        title: 'Biology Basics',
        titleBn: 'জীববিজ্ঞানের ভিত্তি',
        description: 'কোষ, উদ্ভিদ, প্রাণী, স্বাস্থ্য',
        lessons: lessons([
          ['cell', 'Cell', 'কোষ', 'উদ্ভিদ ও প্রাণী কোষ'],
          ['plant-animal', 'Plants & animals', 'উদ্ভিদ ও প্রাণী', 'শ্রেণিবিন্যাস পরিচিতি'],
          ['human-body', 'Human body systems', 'মানবদেহ', 'পরিপাক · শ্বসন পরিচিতি'],
          ['quiz-science', 'Science quiz', 'বিজ্ঞান কুইজ', 'অনুশীলন'],
        ]),
      },
    ],
  }
}

function juniorIslam(): SeedSubjectDef {
  return {
    slug: 'islam',
    name: 'Islamic Studies',
    nameBn: 'ইসলাম শিক্ষা',
    icon: '🕌',
    color: 'from-emerald-500 to-teal-600',
    isMandatory: true,
    chapters: [
      {
        slug: 'aqidah',
        title: 'Aqidah',
        titleBn: 'আকিদা',
        description: 'ঈমান, তাওহীদ, রিসালাত',
        lessons: lessons([
          ['tawhid', 'Tawhid', 'তাওহীদ', 'আল্লাহর একত্ব'],
          ['risalah', 'Prophethood', 'রিসালাত', 'নবী-রাসূল'],
          ['akhirah', 'Hereafter', 'আখিরাত', 'কিয়ামত · জান্নাত-জাহান্নাম'],
        ]),
      },
      {
        slug: 'ibadah',
        title: 'Ibadah',
        titleBn: 'ইবাদাত',
        description: 'সালাত, সিয়াম, যাকাত, হজ',
        lessons: lessons([
          ['salah', 'Salah', 'সালাত', 'ফরজ নামাজ ও রাকাত'],
          ['siyam', 'Siyam', 'সিয়াম', 'রমজানের রোজা'],
          ['zakat-hajj', 'Zakat & Hajj', 'যাকাত ও হজ', 'মৌলিক ধারণা'],
        ]),
      },
      {
        slug: 'akhlaq-sirah',
        title: 'Akhlaq & Sirah',
        titleBn: 'আখলাক ও সীরাত',
        description: 'চরিত্র ও নবীজীবনী',
        lessons: lessons([
          ['akhlaq', 'Good character', 'আখলাক', 'সততা · ধৈর্য · দয়া'],
          ['sirah', 'Prophet biography', 'সীরাত', 'মক্কা-মদিনা জীবন'],
          ['quiz-islam', 'Islam quiz', 'ইসলাম কুইজ', 'অনুশীলন'],
        ]),
      },
    ],
  }
}

function juniorBangladesh(): SeedSubjectDef {
  return {
    slug: 'bangladesh',
    name: 'Bangladesh & Global Studies',
    nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়',
    icon: '🇧🇩',
    color: 'from-green-500 to-emerald-700',
    isMandatory: true,
    chapters: [
      {
        slug: 'history',
        title: 'History',
        titleBn: 'ইতিহাস',
        description: 'প্রাচীন থেকে স্বাধীনতা',
        lessons: lessons([
          ['ancient-bd', 'Ancient Bengal', 'প্রাচীন বাংলা', 'জনপদ ও সংস্কৃতি'],
          ['colonial', 'Colonial period', 'ঔপনিবেশিক যুগ', 'ব্রিটিশ শাসন পরিচিতি'],
          ['liberation', 'Liberation war', 'মুক্তিযুদ্ধ', '১৯৭১'],
        ]),
      },
      {
        slug: 'geography',
        title: 'Geography',
        titleBn: 'ভূগোল',
        description: 'মানচিত্র, নদী, জলবায়ু',
        lessons: lessons([
          ['map-skills', 'Map skills', 'মানচিত্র দক্ষতা', 'অক্ষাংশ · দ্রাঘিমাংশ'],
          ['rivers', 'Rivers of BD', 'বাংলাদেশের নদী', 'পদ্মা · মেঘনা · যমুনা'],
          ['climate', 'Climate', 'জলবায়ু', 'ঋতু ও বৃষ্টি'],
        ]),
      },
      {
        slug: 'civics',
        title: 'Civics',
        titleBn: 'নাগরিক শিক্ষা',
        description: 'সংবিধান, অধিকার, কর্তব্য',
        lessons: lessons([
          ['constitution', 'Constitution intro', 'সংবিধান পরিচিতি', 'মৌলিক অধিকার'],
          ['duties', 'Citizen duties', 'নাগরিক কর্তব্য', 'আইন মেনে চলা'],
          ['quiz-bgs', 'BGS quiz', 'বিজিএস কুইজ', 'অনুশীলন'],
        ]),
      },
    ],
  }
}

function juniorIct(): SeedSubjectDef {
  return {
    slug: 'ict',
    name: 'ICT',
    nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি',
    icon: '💻',
    color: 'from-indigo-500 to-blue-600',
    isMandatory: true,
    chapters: [
      {
        slug: 'computer-basics',
        title: 'Computer Basics',
        titleBn: 'কম্পিউটার পরিচিতি',
        description: 'হার্ডওয়্যার, সফটওয়্যার',
        lessons: lessons([
          ['hardware', 'Hardware', 'হার্ডওয়্যার', 'ইনপুট · আউটপুট · CPU'],
          ['software', 'Software', 'সফটওয়্যার', 'সিস্টেম ও অ্যাপ্লিকেশন'],
          ['os', 'Operating system', 'অপারেটিং সিস্টেম', 'Windows · files'],
        ]),
      },
      {
        slug: 'internet-safety',
        title: 'Internet & Safety',
        titleBn: 'ইন্টারনেট ও নিরাপত্তা',
        description: 'ওয়েব, ইমেইল, নিরাপদ ব্যবহার',
        lessons: lessons([
          ['internet', 'Internet', 'ইন্টারনেট', 'ব্রাউজার · সার্চ'],
          ['email', 'Email', 'ইমেইল', 'পাঠানো · গ্রহণ'],
          ['cyber-safety', 'Cyber safety', 'সাইবার নিরাপত্তা', 'পাসওয়ার্ড · privacy'],
        ]),
      },
      {
        slug: 'office-tools',
        title: 'Office Tools',
        titleBn: 'অফিস টুলস',
        description: 'ওয়ার্ড, স্প্রেডশিট পরিচিতি',
        lessons: lessons([
          ['word', 'Word processing', 'ওয়ার্ড প্রসেসিং', 'টেক্সট · ফরম্যাটিং'],
          ['spreadsheet', 'Spreadsheet intro', 'স্প্রেডশিট', 'সারি · কলাম · সহজ ফর্মুলা'],
          ['quiz-ict', 'ICT quiz', 'আইসিটি কুইজ', 'অনুশীলন'],
        ]),
      },
    ],
  }
}

function juniorHealth(): SeedSubjectDef {
  return {
    slug: 'health',
    name: 'Physical Education & Health',
    nameBn: 'শারীরিক শিক্ষা ও স্বাস্থ্য',
    icon: '🏃',
    color: 'from-rose-500 to-orange-500',
    isMandatory: false,
    chapters: [
      {
        slug: 'fitness',
        title: 'Fitness',
        titleBn: 'ফিটনেস',
        description: 'ব্যায়াম, খেলা, পুষ্টি',
        lessons: lessons([
          ['exercise', 'Exercise', 'ব্যায়াম', 'উষ্ণায়ন · শক্তি'],
          ['sports', 'Sports', 'খেলাধুলা', 'দলীয় খেলা ও নিয়ম'],
          ['nutrition', 'Nutrition', 'পুষ্টি', 'সুষম খাদ্য'],
        ]),
      },
      {
        slug: 'hygiene',
        title: 'Hygiene & First Aid',
        titleBn: 'স্বাস্থ্যবিধি ও প্রাথমিক চিকিৎসা',
        description: 'পরিচ্ছন্নতা ও জরুরি সাহায্য',
        lessons: lessons([
          ['personal-hygiene', 'Personal hygiene', 'ব্যক্তিগত পরিচ্ছন্নতা', 'দৈনন্দিন অভ্যাস'],
          ['first-aid', 'First aid', 'প্রাথমিক চিকিৎসা', 'ক্ষত · পোড়া'],
        ]),
      },
    ],
  }
}

const CLASS_BN_JUNIOR: Record<number, string> = {
  6: 'ষষ্ঠ শ্রেণি',
  7: 'সপ্তম শ্রেণি',
  8: 'অষ্টম শ্রেণি',
}

export function buildJuniorSeed(classes: number[] = [6, 7, 8]): SeedClassDef[] {
  return classes.map((n) => ({
    classNumber: n,
    slug: `class-${n}`,
    name: CLASS_BN_JUNIOR[n] || `শ্রেণি ${n}`,
    description: `NCTB অ্যালাইনড জুনিয়র সেকেন্ডারি — ${CLASS_BN_JUNIOR[n] || n}`,
    subjects: [
      juniorBangla(),
      juniorEnglish(),
      juniorMath(),
      juniorScience(),
      juniorIslam(),
      juniorBangladesh(),
      juniorIct(),
      juniorHealth(),
    ],
  }))
}
