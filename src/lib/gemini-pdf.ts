import { ai, CURRICULUM_GEMINI_MODEL } from '@/lib/gemini'

export type ExtractedLesson = {
  title: string;
  title_bn: string;
  lesson_number: number;
  page_start?: number;
  page_end?: number;
};

export type ExtractedChapter = {
  title: string;
  title_bn: string;
  chapter_number: number;
  page_start?: number;
  page_end?: number;
  lessons: ExtractedLesson[];
};

export type ExtractedStructure = {
  chapters: ExtractedChapter[];
  total_lessons: number;
  has_chapters: boolean;
};

// PDF থেকে TOC/Structure extract করো
export async function extractPDFStructure(
  pdfBase64: string,
  subjectName: string,
  className: string,
): Promise<ExtractedStructure> {
  const prompt = `তুমি NCTB বাংলাদেশের textbook বিশেষজ্ঞ।

এই PDF টি "${className}" শ্রেণীর "${subjectName}" বিষয়ের NCTB textbook।

শুধু সূচিপত্র (Table of Contents) থেকে structure extract করো।

নির্দেশনা:
- সব Chapter এবং Lesson এর নাম বের করো
- পৃষ্ঠা নম্বর থাকলে সেটাও নাও
- যদি Chapter না থাকে has_chapters: false দাও এবং সব lesson একটা default chapter এ রাখো
- বাংলা নাম হুবহু রাখো
- English নাম transliteration করো
- নিজে থেকে কিছু বানাবে না
- শুধু সূচিপত্র থেকে তথ্য নাও

JSON format এ উত্তর দাও:
{
    "has_chapters": true/false,
    "total_lessons": number,
    "chapters": [
        {
            "title": "English title",
            "title_bn": "বাংলা শিরোনাম",
            "chapter_number": 1,
            "page_start": 1,
            "page_end": 25,
            "lessons": [
                {
                    "title": "English title",
                    "title_bn": "বাংলা শিরোনাম",
                    "lesson_number": 1,
                    "page_start": 2,
                    "page_end": 8
                }
            ]
        }
    ]
}`;

  const response = await ai.models.generateContent({
    model: CURRICULUM_GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const raw = response.text ?? "";

  // JSON parse
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(cleaned) as ExtractedStructure;

  // Validation
  if (!parsed.chapters || !Array.isArray(parsed.chapters)) {
    throw new Error("Invalid structure from Gemini");
  }

  return parsed;
}

// নির্দিষ্ট Chapter এর content extract করো
export async function extractChapterContent(
  pdfBase64: string,
  chapterTitle: string,
  pageStart: number,
  pageEnd: number,
  subjectName: string,
  className: string,
): Promise<ExtractedLesson[]> {
  const prompt = `তুমি NCTB বাংলাদেশের textbook বিশেষজ্ঞ।

"${className}" শ্রেণীর "${subjectName}" বিষয়ের "${chapterTitle}" অধ্যায়ের পৃষ্ঠা ${pageStart} থেকে ${pageEnd} দেখো।

এই অধ্যায়ের সব পাঠ (Lesson) এর তালিকা বের করো।

নির্দেশনা:
- শুধু এই chapter এর lessons extract করো
- পাঠ নম্বর অনুযায়ী sort করো
- বাংলা নাম হুবহু রাখো
- English নাম transliteration করো
- নিজে থেকে কিছু বানাবে না

JSON format:
{
    "lessons": [
        {
            "title": "English title",
            "title_bn": "বাংলা শিরোনাম",
            "lesson_number": 1,
            "page_start": 2,
            "page_end": 8
        }
    ]
}`;

  const response = await ai.models.generateContent({
    model: CURRICULUM_GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: pdfBase64,
            },
          },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const raw = response.text ?? "";
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  return parsed.lessons ?? [];
}
