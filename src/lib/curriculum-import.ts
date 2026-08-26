import { GoogleGenAI } from "@google/genai";

export const CURRICULUM_WORKFLOW_STATUSES = [
  "draft",
  "extracted",
  "reviewed",
  "generating",
  "generated",
  "approved",
  "published",
] as const;

export type CurriculumWorkflowStatus =
  (typeof CURRICULUM_WORKFLOW_STATUSES)[number];

export type ExtractedLessonMap = {
  title: string;
  titleBn: string;
  lessonNumber: number;
  pageStart?: number;
  pageEnd?: number;
};

export type ExtractedChapterMap = {
  title: string;
  titleBn: string;
  chapterNumber: number;
  pageStart?: number;
  pageEnd?: number;
  lessons: ExtractedLessonMap[];
};

export type ExtractedCurriculumStructure = {
  chapters: ExtractedChapterMap[];
  totalLessons: number;
  sourceConfidence: "high" | "medium" | "low";
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function parseStructure(raw: string): ExtractedCurriculumStructure {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleaned) as {
    chapters?: Array<{
      title?: string;
      title_bn?: string;
      chapter_number?: number;
      page_start?: number;
      page_end?: number;
      lessons?: Array<{
        title?: string;
        title_bn?: string;
        lesson_number?: number;
        page_start?: number;
        page_end?: number;
      }>;
    }>;
    total_lessons?: number;
    source_confidence?: "high" | "medium" | "low";
  };

  if (!Array.isArray(parsed.chapters) || parsed.chapters.length === 0) {
    throw new Error("Gemini did not return a valid chapter map.");
  }

  const chapters = parsed.chapters.map((chapter, chapterIndex) => ({
    title: chapter.title?.trim() || `Chapter ${chapterIndex + 1}`,
    titleBn: chapter.title_bn?.trim() || chapter.title?.trim() || `অধ্যায় ${chapterIndex + 1}`,
    chapterNumber: chapter.chapter_number ?? chapterIndex + 1,
    pageStart: chapter.page_start,
    pageEnd: chapter.page_end,
    lessons: (chapter.lessons ?? []).map((lesson, lessonIndex) => ({
      title: lesson.title?.trim() || `Lesson ${lessonIndex + 1}`,
      titleBn: lesson.title_bn?.trim() || lesson.title?.trim() || `পাঠ ${lessonIndex + 1}`,
      lessonNumber: lesson.lesson_number ?? lessonIndex + 1,
      pageStart: lesson.page_start,
      pageEnd: lesson.page_end,
    })),
  }));

  return {
    chapters,
    totalLessons: parsed.total_lessons ?? chapters.reduce((count, chapter) => count + chapter.lessons.length, 0),
    sourceConfidence: parsed.source_confidence ?? "medium",
  };
}

export async function uploadPdfToGemini(input: {
  pdf: Blob;
  displayName: string;
}) {
  const uploaded = await ai.files.upload({
    file: input.pdf,
    config: { displayName: input.displayName, mimeType: "application/pdf" },
  });

  let file = uploaded;
  for (let attempt = 0; attempt < 18 && file.state === "PROCESSING"; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    file = await ai.files.get({ name: uploaded.name! });
  }

  if (file.state === "FAILED" || !file.uri || !file.mimeType) {
    throw new Error("Gemini could not process the uploaded PDF.");
  }

  return file;
}

export async function extractStructureFromGemini(input: {
  fileUri: string;
  mimeType: string;
  className: string;
  subjectName: string;
}): Promise<ExtractedCurriculumStructure> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{
      role: "user",
      parts: [
        { fileData: { fileUri: input.fileUri, mimeType: input.mimeType } },
        {
          text: `You are extracting the authoritative table of contents for the NCTB ${input.className} ${input.subjectName} textbook. Return only JSON. Never invent titles, page ranges, lessons, or academic facts. Extract only what the PDF supports.
{
  "source_confidence": "high|medium|low",
  "total_lessons": 0,
  "chapters": [{
    "title": "English/transliterated title",
    "title_bn": "Exact Bangla title",
    "chapter_number": 1,
    "page_start": 1,
    "page_end": 20,
    "lessons": [{
      "title": "English/transliterated title",
      "title_bn": "Exact Bangla title",
      "lesson_number": 1,
      "page_start": 2,
      "page_end": 5
    }]
  }]
}`,
        },
      ],
    }],
    config: { responseMimeType: "application/json", temperature: 0 },
  });

  return parseStructure(response.text ?? "");
}
