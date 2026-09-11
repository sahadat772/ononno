/**
 * Slice A — Class-aware study volume
 * Higher class → deeper / longer student study content.
 * Primary (1–5) vs Secondary (6+) study style is different.
 * Bangla/English: vocabulary (শব্দার্থ) from textbook lesson end when present.
 */

export type StudyDepth = "light" | "standard" | "deep";

export function classNumberToDepth(
  classNumber: number | null | undefined,
): StudyDepth {
  if (classNumber == null || !Number.isFinite(classNumber)) return "standard";
  if (classNumber <= 2) return "light";
  if (classNumber <= 5) return "standard";
  return "deep";
}

export type DepthRules = {
  depth: StudyDepth;
  labelBn: string;
  ageHint: string;
  overviewSentences: string;
  objectivesCount: string;
  mainContent: string;
  examplesCount: string;
  vocabularyCount: string;
  practiceCount: string;
  quizCount: number;
  summaryStyle: string;
  targetWords: string;
};

export function getDepthRules(
  classNumber: number | null | undefined,
): DepthRules {
  const depth = classNumberToDepth(classNumber);

  if (depth === "light") {
    return {
      depth,
      labelBn: "হালকা (Class 1–2)",
      ageHint:
        "শিক্ষার্থীর বয়স প্রায় ৬–৮ বছর। খুব সহজ শব্দ, ছোট বাক্য, খেলার মতো ভাষা।",
      overviewSentences: "২–৩টি ছোট বাক্য",
      objectivesCount: "৩–৪টি (আমি পারব...)",
      mainContent:
        "২–৩টি ছোট অনুচ্ছেদ (মোট ~১২০–২০০ শব্দ)। এক পৃষ্ঠার মতো পড়ার উপযোগী।",
      examplesCount: "৩–৫টি খুব সহজ উদাহরণ",
      vocabularyCount: "৩–৫টি শব্দ — অর্থ",
      practiceCount: "৩–৪টি সহজ প্রশ্ন",
      quizCount: 4,
      summaryStyle: "৩–৪ বাক্যের ছোট সারসংক্ষেপ",
      targetWords: "মোট study text আনুমানিক ২৫০–৪০০ শব্দ",
    };
  }

  if (depth === "standard") {
    return {
      depth,
      labelBn: "মাঝারি (Class 3–5)",
      ageHint: "প্রাথমিক উচ্চ স্তর — সহজ ও স্পষ্ট বাংলা, একটু বিস্তারিত।",
      overviewSentences: "৩–৪ বাক্য",
      objectivesCount: "৪–৫টি",
      mainContent: "৪–৫টি অনুচ্ছেদ (মোট ~২৫০–৪০০ শব্দ)",
      examplesCount: "৫–৭টি উদাহরণ",
      vocabularyCount: "৫–৮টি শব্দ",
      practiceCount: "৪–৫টি প্রশ্ন",
      quizCount: 5,
      summaryStyle: "৫–৬ বাক্যের সারসংক্ষেপ",
      targetWords: "মোট study text আনুমানিক ৪৫০–৭০০ শব্দ",
    };
  }

  return {
    depth,
    labelBn: "গভীর (Class 6+)",
    ageHint:
      "মাধ্যমিক/উচ্চতর স্তর — বিষয়ভিত্তিক স্পষ্ট ব্যাখ্যা, উদাহরণ ও ধারণা সংযোগ।",
    overviewSentences: "৪–৬ বাক্য",
    objectivesCount: "৫–৭টি",
    mainContent:
      "৬–৮টি অনুচ্ছেদ (মোট ~৪৫০–৮০০ শব্দ)। ধারণা, কারণ, উদাহরণ আলাদা করে লেখো।",
    examplesCount: "৭–১০টি উদাহরণ / কেস",
    vocabularyCount:
      "১০–১৬টি শব্দ/পদ — পাঠের শেষে শব্দার্থ থাকলে সেখান থেকে অগ্রাধিকার",
    practiceCount: "৫–৭টি প্রশ্ন",
    quizCount: 6,
    summaryStyle: "৬–৮ বাক্য + মূল পয়েন্ট",
    targetWords: "মোট study text আনুমানিক ৭০০–১২০০ শব্দ",
  };
}

export function buildDepthPromptBlock(
  classNumber?: number | null,
): string {
  const r = getDepthRules(classNumber);
  return `📏 Study depth: ${r.labelBn}
${r.ageHint}
- overview: ${r.overviewSentences}
- objectives: ${r.objectivesCount}
- main_content: ${r.mainContent}
- examples: ${r.examplesCount}
- vocabulary: ${r.vocabularyCount}
- practice: ${r.practiceCount}
- quiz: ${r.quizCount} MCQ
- summary: ${r.summaryStyle}
- ${r.targetWords}`;
}

export function classToStage(
  classNumber?: number | null,
): "primary" | "secondary" {
  if (classNumber == null || !Number.isFinite(classNumber)) return "primary";
  return classNumber >= 6 ? "secondary" : "primary";
}

/**
 * Extra NCTB-aligned guidance (চারুপাঠ, English word lists, large PDFs).
 */
export function buildSubjectStudyHints(opts: {
  classNumber?: number | null;
  subjectName?: string | null;
  subjectNameBn?: string | null;
  chapterTitle?: string | null;
  lessonTitle?: string | null;
}): string {
  const stage = classToStage(opts.classNumber);
  const sub = `${opts.subjectNameBn || ""} ${opts.subjectName || ""} ${opts.chapterTitle || ""} ${opts.lessonTitle || ""}`.toLowerCase();

  const isBangla =
    /চারুপাঠ|আনন্দপাঠ|সাহিত্য|গদ্য|কবিতা|bangla|বাংলা|charupath|anandapath|prose|poetry|literature|বাংলা ভাষা/.test(
      sub,
    );
  const isEnglish =
    /english|ইংরেজি|ingreji|grammar|vocabulary|comprehension|english for today/.test(
      sub,
    );
  const isMath = /গণিত|math|সংখ্যা|বীজগণিত|জ্যামিতি/.test(sub);
  const isScience = /বিজ্ঞান|science|পদার্থ|রসায়ন|জীব/.test(sub);

  const vocabBlock = `
📖 শব্দার্থ / Vocabulary (বাধ্যতামূলক):
- PDF-এ পাঠের শেষে "শব্দার্থ", "শব্দের অর্থ", "Word meanings", "New words" থাকলে সেখান থেকে অগ্রাধিকার দাও।
- না থাকলে পাঠের কঠিন/নতুন শব্দ বেছে "শব্দ — সহজ অর্থ" ফরম্যাটে vocabulary অ্যারেতে দাও।
- শিক্ষার্থী যেন শব্দের সাথে পরিচিত হয় ও অর্থ বুঝে — মুখস্থ তালিকা নয়, পাঠ-সংযুক্ত অর্থ।
- বাংলা বিষয়ে: বাংলা শব্দ + বাংলা অর্থ (প্রয়োজনে উদাহরণ বাক্য)।
- ইংরেজি বিষয়ে: English word — বাংলা অর্থ (+ short English gloss যদি দরকার)।`;

  if (stage === "primary") {
    let extra = vocabBlock;
    if (isBangla) {
      extra += `
📚 প্রাথমিক বাংলা:
- ছোট গল্প/কবিতার মূল ভাব সহজ ভাষায়।
- শব্দার্থ ৩–৮টি — খুব সহজ অর্থ।`;
    } else if (isEnglish) {
      extra += `
🔤 Primary English:
- Simple words from the lesson; meaning in easy Bangla.
- 3–8 vocabulary items.`;
    }
    return `🎓 Stage: PRIMARY (Class 1–5)
- খেলার মতো, ছোট বাক্য, ছবি/উদাহরণ কল্পনায় বোঝাও।
- মুখস্থ চাপ নয় — বুঝে শেখা।
- কুইজ সহজ ও উৎসাহী।
${extra}`;
  }

  let subjectExtra = vocabBlock;
  if (isBangla) {
    subjectExtra += `
📚 সাহিত্য/চারুপাঠ/বাংলা (Class 6+):
- লেখক/কবির নাম ও প্রসঙ্গ সংক্ষেপে (যদি পাঠে থাকে)।
- গদ্য: মূল ভাব, চরিত্র, শিক্ষণীয় বার্তা — ছাত্রের ভাষায়।
- কবিতা: সহজ অর্থ, ছন্দ/চিত্রকল্প এক লাইনে, অনুভূতি।
- vocabulary-এ ১০–১৬টি শব্দার্থ (বইয়ের শব্দার্থ তালিকা অগ্রাধিকার)।
- ২–৩টি বোধগম্যতা প্রশ্ন practice-এ।
- শিক্ষক-ম্যানুয়াল কপি নয়; ছাত্র নিজে পড়ে বুঝবে এমন লেখা।`;
  } else if (isEnglish) {
    subjectExtra += `
🔤 English (Class 6+):
- Lesson gist in clear Bangla (or simple English if the book is English-medium).
- vocabulary: ১০–১৬টি — English word — বাংলা অর্থ; PDF-এর word list থাকলে সেখান থেকে নাও।
- Comprehension-style practice questions.
- Grammar points only if they appear in this lesson.`;
  } else if (isMath) {
    subjectExtra += `
🔢 গণিত (মাধ্যমিক):
- সংজ্ঞা → উদাহরণ → ধাপে সমাধান → একটা ছোট অনুশীলন।
- সূত্র থাকলে স্পষ্ট করে লেখো; ভুল ধারণা এড়াও।
- vocabulary-এ গাণিতিক পদ/সংজ্ঞা ৪–৮টি।`;
  } else if (isScience) {
    subjectExtra += `
🔬 বিজ্ঞান (মাধ্যমিক):
- পর্যবেক্ষণ → ধারণা → দৈনন্দিন উদাহরণ।
- নিরাপদ real_world_mission (ঘরে করা যায়)।
- vocabulary-এ বৈজ্ঞানিক পদ ৬–১০টি (সহজ অর্থ)।`;
  }

  return `🎓 Stage: SECONDARY / মাধ্যমিক (Class 6+)
- প্রাথমিকের চেয়ে গভীর, কিন্তু এখনও ছাত্র-facing সহজ বাংলা।
- NCTB বইয়ের পাঠের সাথে সামঞ্জস্য; মিথ্যা অধ্যায় বানাবে না।
- বড় PDF (২০MB+): শুধু নির্দেশিত পৃষ্ঠা/এই পাঠে ফোকাস করো — পুরো বই সামারাইজ করো না।
- ধারণা সংযোগ ও চিন্তার প্রশ্ন রাখো।
${subjectExtra}`;
}

/** Full study-engine system add-on for any generate path */
export function buildFullStudyEngineBlock(opts: {
  classNumber?: number | null;
  subjectName?: string | null;
  subjectNameBn?: string | null;
  chapterTitle?: string | null;
  lessonTitle?: string | null;
}): string {
  return [
    buildDepthPromptBlock(opts.classNumber),
    buildSubjectStudyHints(opts),
  ].join("\n\n");
}
