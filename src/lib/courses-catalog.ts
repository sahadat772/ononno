/** Public marketing catalog — Digital Study Room style course detail data */

export type CourseLesson = {
  id: string
  title: string
  sample?: boolean
}

export type CourseChapter = {
  id: string
  title: string
  lessons: CourseLesson[]
}

export type CourseCatalogItem = {
  slug: string
  titleBn: string
  titleEn: string
  shortTitle: string
  badge: string
  badgeColor: string
  emoji: string
  lessonsCount: number
  enrolled: string
  language: string
  type: string
  summary: string
  description: string[]
  features: string[]
  prerequisites: string[]
  certificate: boolean
  chapters: CourseChapter[]
  related: string[]
}

export const COURSES: CourseCatalogItem[] = [
  {
    slug: 'kids-gk',
    titleBn: 'কিডস জোন · সাধারণ জ্ঞান',
    titleEn: 'Kids Zone General Knowledge',
    shortTitle: 'Kids GK Course',
    badge: 'কিডস',
    badgeColor: 'bg-violet-500',
    emoji: '🌍',
    lessonsCount: 24,
    enrolled: '1,200+',
    language: 'বাংলা',
    type: 'অনলাইন লেসন · গেম স্টেপ',
    summary:
      'নার্সারি ও ছোটদের জন্য রঙ, সংখ্যা, প্রাণী, ফল ও মজার তথ্য — শোনা, বলা, মিলানো ও কুইজসহ।',
    description: [
      'কিডস জোনের সাধারণ জ্ঞান কোর্সে ছোট শিক্ষার্থীরা খেলার মতো স্টেপে শেখে। প্রতিটি লেসনে কার্ড, ভয়েস ও ম্যাচিং গেম আছে।',
      'রঙ, আকার, প্রাণী, ফল-সবজি — সহজ বাংলায় ব্যাখ্যা, যাতে বাচ্চা নিজে নিজে আগ্রহ নিয়ে শেখতে পারে।',
      'অভিভাবকরা ঘরে বসেই অগ্রগতি দেখতে পারবেন। Published লেসন ছাড়া কিছুই দেখানো হয় না।',
    ],
    features: [
      'প্রতিটি বিষয় সহজভাবে উপস্থাপন',
      'ভয়েস ও গেম স্টেপসহ ইন্টারঅ্যাকটিভ লেসন',
      'নিজের গতিতে শেখা যায়',
      'কুইজ ও XP দিয়ে অনুশীলন',
      'নিরাপদ, রিভিউড কনটেন্ট',
    ],
    prerequisites: [
      'নার্সারি / কেজি স্তরের শিক্ষার্থী',
      'মৌলিক শোনা-বলার আগ্রহ',
      'অভিভাবকের সাথে ঘরে শেখা যায়',
    ],
    certificate: false,
    chapters: [
      {
        id: 'c1',
        title: 'রঙ চেনো',
        lessons: [
          { id: 'l1', title: 'লাল · আপেল', sample: true },
          { id: 'l2', title: 'নীল · আকাশ', sample: true },
          { id: 'l3', title: 'সবুজ · ঘাস' },
        ],
      },
      {
        id: 'c2',
        title: 'প্রাণী ও প্রকৃতি',
        lessons: [
          { id: 'l4', title: 'গরু · ঘরের প্রাণী', sample: true },
          { id: 'l5', title: 'পাখি · আকাশ' },
        ],
      },
      {
        id: 'c3',
        title: 'ফল ও সবজি',
        lessons: [
          { id: 'l6', title: 'কলা · মিষ্টি ফল' },
          { id: 'l7', title: 'গাজর · সবজি' },
        ],
      },
    ],
    related: ['class-one', 'primary-nctb'],
  },
  {
    slug: 'class-one',
    titleBn: 'প্রথম শ্রেণি ( Class One )',
    titleEn: 'Class One Full Package',
    shortTitle: 'Class 1 Course',
    badge: 'প্রাইমারি',
    badgeColor: 'bg-pink-500',
    emoji: '1️⃣',
    lessonsCount: 48,
    enrolled: '2,100+',
    language: 'বাংলা',
    type: 'NCTB · অনলাইন / অফলাইন',
    summary:
      'প্রথম শ্রেণির বাংলা, ইংরেজি ও গণিত — ছোট ছোট লেসন ও অনুশীলন।',
    description: [
      'প্রথম শ্রেণির NCTB পাঠ্যক্রম অনুসারে সাজানো কোর্স। অক্ষর, সংখ্যা ও মৌলিক শব্দ শেখার জন্য ধাপে ধাপে লেসন।',
      'AI ও রিভিউয়ের মাধ্যমে published লেসন — শিক্ষার্থী নিরাপদ কনটেন্ট পায়।',
    ],
    features: [
      'NCTB ভিত্তিক পাঠ',
      'ধাপে ধাপে লেসন ও কুইজ',
      'ভয়েস সাপোর্ট (বাংলা)',
      'অগ্রগতি ও XP',
    ],
    prerequisites: [
      'প্রথম শ্রেণিতে ভর্তি বা সমমান',
      'অভিভাবকের সহায়তায় শুরু করা যায়',
    ],
    certificate: true,
    chapters: [
      {
        id: 'bn',
        title: 'বাংলা',
        lessons: [
          { id: 'b1', title: 'স্বরবর্ণ পরিচিতি', sample: true },
          { id: 'b2', title: 'ব্যঞ্জনবর্ণ' },
        ],
      },
      {
        id: 'en',
        title: 'ইংরেজি',
        lessons: [
          { id: 'e1', title: 'ABC Letters', sample: true },
          { id: 'e2', title: 'Simple Words' },
        ],
      },
      {
        id: 'math',
        title: 'গণিত',
        lessons: [
          { id: 'm1', title: '১ থেকে ১০', sample: true },
          { id: 'm2', title: 'যোগের ধারণা' },
        ],
      },
    ],
    related: ['kids-gk', 'primary-nctb'],
  },
  {
    slug: 'primary-nctb',
    titleBn: 'Class 1–5 · NCTB পাঠ',
    titleEn: 'Primary NCTB Package',
    shortTitle: 'Primary Package',
    badge: 'প্রাইমারি',
    badgeColor: 'bg-pink-500',
    emoji: '📚',
    lessonsCount: 120,
    enrolled: '3,400+',
    language: 'বাংলা',
    type: 'Package · NCTB',
    summary: 'প্রাইমারি স্তরের মূল বিষয়গুলো এক প্যাকেজে — বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান।',
    description: [
      '১ম থেকে ৫ম শ্রেণি পর্যন্ত structured journey। প্রতিটি শ্রেণির জন্য আলাদা মডিউল।',
      'কুইজ, XP ও progress ট্র্যাকিংসহ স্মার্ট স্টাডি লুপ।',
    ],
    features: [
      'বহু শ্রেণির এক প্ল্যাটফর্ম',
      'Published lesson only',
      'Quiz ও progress',
      'Parent / Student রোল',
    ],
    prerequisites: ['প্রাইমারি স্তরের শিক্ষার্থী', 'মৌলিক পড়াশোনার আগ্রহ'],
    certificate: true,
    chapters: [
      {
        id: 'g1',
        title: 'প্রথম–দ্বিতীয় শ্রেণি',
        lessons: [
          { id: 'p1', title: 'অক্ষর ও সংখ্যা', sample: true },
          { id: 'p2', title: 'সহজ শব্দ' },
        ],
      },
      {
        id: 'g2',
        title: 'তৃতীয়–পঞ্চম শ্রেণি',
        lessons: [
          { id: 'p3', title: 'পাঠ ও অনুশীলন', sample: true },
          { id: 'p4', title: 'মডেল কুইজ' },
        ],
      },
    ],
    related: ['class-one', 'secondary-stem'],
  },
  {
    slug: 'secondary-stem',
    titleBn: 'Class 6–10 · বিজ্ঞান ও গণিত',
    titleEn: 'Secondary Math & Science',
    shortTitle: 'Secondary STEM',
    badge: 'সেকেন্ডারি',
    badgeColor: 'bg-emerald-600',
    emoji: '🔬',
    lessonsCount: 96,
    enrolled: '4,100+',
    language: 'বাংলা',
    type: 'NCTB · Secondary',
    summary: 'ষষ্ঠ থেকে দশম শ্রেণির গণিত ও বিজ্ঞান — ধাপে ধাপে ব্যাখ্যা ও অনুশীলন।',
    description: [
      'সেকেন্ডারি STEM প্যাকেজে গণিত ও বিজ্ঞানের মূল অধ্যায়গুলো structured লেসনে সাজানো।',
      'জটিল বিষয় সহজ উদাহরণে — যাতে শিক্ষার্থী নিজে নিজে বুঝতে পারে।',
    ],
    features: [
      'গণিত ও বিজ্ঞান ফোকাস',
      'অনুশীলনী ও কুইজ',
      'নিজের গতিতে শেখা',
      'রিভিউড কনটেন্ট',
    ],
    prerequisites: [
      'ষষ্ঠ–দশম শ্রেণির শিক্ষার্থী',
      'প্রাথমিক গণিতের ধারণা',
    ],
    certificate: true,
    chapters: [
      {
        id: 'math6',
        title: 'গণিত',
        lessons: [
          { id: 's1', title: 'মৌলিক সংখ্যা', sample: true },
          { id: 's2', title: 'বীজগণিত পরিচিতি' },
        ],
      },
      {
        id: 'sci',
        title: 'বিজ্ঞান',
        lessons: [
          { id: 's3', title: 'পদার্থের অবস্থা', sample: true },
          { id: 's4', title: 'জীবজগত' },
        ],
      },
    ],
    related: ['primary-nctb', 'hsc-ict'],
  },
  {
    slug: 'hsc-ict',
    titleBn: 'HSC · তথ্য ও যোগাযোগ প্রযুক্তি',
    titleEn: 'HSC ICT',
    shortTitle: 'HSC ICT Course',
    badge: 'HSC',
    badgeColor: 'bg-indigo-600',
    emoji: '💻',
    lessonsCount: 40,
    enrolled: '2,800+',
    language: 'বাংলা',
    type: 'HSC · ICT',
    summary: 'একাদশ–দ্বাদশ তথ্য ও যোগাযোগ প্রযুক্তি — তত্ত্ব ও প্র্যাকটিক্যাল ধারণা।',
    description: [
      'HSC ICT সিলেবাস অনুসারে লেসন। কম্পিউটার, নেটওয়ার্ক ও ডিজিটাল নিরাপত্তার মৌলিক বিষয়।',
      'স্পষ্ট বাংলা ব্যাখ্যা ও ছোট অনুশীলনী।',
    ],
    features: ['HSC সিলেবাস', 'সহজ বাংলা', 'কুইজ', 'Progress ট্র্যাকিং'],
    prerequisites: ['একাদশ/দ্বাদশ শিক্ষার্থী', 'মৌলিক কম্পিউটার আগ্রহ'],
    certificate: true,
    chapters: [
      {
        id: 'ict1',
        title: 'ICT মূল ধারণা',
        lessons: [
          { id: 'h1', title: 'কম্পিউটার পরিচিতি', sample: true },
          { id: 'h2', title: 'ইন্টারনেট ও নিরাপত্তা' },
        ],
      },
    ],
    related: ['secondary-stem', 'primary-nctb'],
  },
]

export function getCourseBySlug(slug: string): CourseCatalogItem | undefined {
  return COURSES.find((c) => c.slug === slug)
}

export function getRelatedCourses(slug: string): CourseCatalogItem[] {
  const course = getCourseBySlug(slug)
  if (!course) return []
  return course.related
    .map((s) => getCourseBySlug(s))
    .filter((c): c is CourseCatalogItem => Boolean(c))
}

export function getAllCourseSlugs(): string[] {
  return COURSES.map((c) => c.slug)
}
