import { ai, CURRICULUM_GEMINI_MODEL } from "@/lib/gemini";

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

export function slugifyCurriculumLabel(
  value: string,
  fallback: string,
): string {
  const base = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || fallback;
}

function parseStructure(raw: string): ExtractedCurriculumStructure {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  let parsed: {
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

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("INVALID_AI_JSON");
  }

  if (!Array.isArray(parsed.chapters) || parsed.chapters.length === 0) {
    throw new Error("STRUCTURE_VALIDATION_FAILED");
  }

  const chapters = parsed.chapters.map((chapter, chapterIndex) => ({
    title: chapter.title?.trim() || `Chapter ${chapterIndex + 1}`,
    titleBn:
      chapter.title_bn?.trim() ||
      chapter.title?.trim() ||
      `অধ্যায় ${chapterIndex + 1}`,
    chapterNumber: chapter.chapter_number ?? chapterIndex + 1,
    pageStart: chapter.page_start,
    pageEnd: chapter.page_end,
    lessons: (chapter.lessons ?? []).map((lesson, lessonIndex) => ({
      title: lesson.title?.trim() || `Lesson ${lessonIndex + 1}`,
      titleBn:
        lesson.title_bn?.trim() ||
        lesson.title?.trim() ||
        `পাঠ ${lessonIndex + 1}`,
      lessonNumber: lesson.lesson_number ?? lessonIndex + 1,
      pageStart: lesson.page_start,
      pageEnd: lesson.page_end,
    })),
  }));

  return {
    chapters,
    totalLessons:
      parsed.total_lessons ??
      chapters.reduce((count, chapter) => count + chapter.lessons.length, 0),
    sourceConfidence: parsed.source_confidence ?? "medium",
  };
}

function normalizeFileState(state: unknown): string {
  return String(state ?? "")
    .replace(/^FILE_STATE_/i, "")
    .toUpperCase();
}

export async function uploadPdfToGemini(input: {
  pdf: Blob;
  displayName: string;
}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_CONFIGURATION_ERROR");
  }

  const pdfBlob =
    input.pdf.type === "application/pdf"
      ? input.pdf
      : new Blob([await input.pdf.arrayBuffer()], { type: "application/pdf" });

  if (pdfBlob.size < 100) {
    throw new Error("STORAGE_NOT_FOUND");
  }

  let uploaded;
  try {
    uploaded = await ai.files.upload({
      file: pdfBlob,
      config: {
        displayName: input.displayName || "curriculum.pdf",
        mimeType: "application/pdf",
      },
    });
  } catch (uploadError) {
    console.error("[uploadPdfToGemini] files.upload failed:", uploadError);
    const msg =
      uploadError instanceof Error ? uploadError.message : String(uploadError);
    throw new Error(`GEMINI_UPLOAD_FAILED: ${msg.slice(0, 300)}`);
  }

  if (!uploaded?.name) {
    throw new Error("PDF_PROCESSING_FAILED: upload returned no file name");
  }

  let file = uploaded;
  for (
    let attempt = 0;
    attempt < 30 && normalizeFileState(file.state) === "PROCESSING";
    attempt += 1
  ) {
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    file = await ai.files.get({ name: uploaded.name! });
  }

  const state = normalizeFileState(file.state);
  const uri = file.uri ?? null;
  const mimeType =
    file.mimeType ??
    (file as { mime_type?: string }).mime_type ??
    "application/pdf";

  if (state === "FAILED") {
    const detail =
      (file as { error?: { message?: string } }).error?.message ??
      "Gemini marked file as FAILED";
    console.error("[uploadPdfToGemini] file FAILED:", file);
    throw new Error(`PDF_PROCESSING_FAILED: ${detail}`);
  }

  if (state === "PROCESSING") {
    throw new Error(
      "PDF_PROCESSING_FAILED: still PROCESSING after wait - retry shortly",
    );
  }

  if (!uri) {
    console.error("[uploadPdfToGemini] missing uri, state=", state, file);
    throw new Error(
      `PDF_PROCESSING_FAILED: no uri after upload (state=${state || "unknown"})`,
    );
  }

  return {
    ...file,
    uri,
    mimeType,
    name: file.name ?? uploaded.name,
  };
}

export async function extractStructureFromGemini(input: {
  fileUri: string;
  mimeType: string;
  className: string;
  subjectName: string;
  startPage?: number;
  endPage?: number;
}): Promise<ExtractedCurriculumStructure> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_CONFIGURATION_ERROR");
  }

  const pageHint =
    input.startPage && input.endPage
      ? `Focus on pages ${input.startPage}-${input.endPage} of the textbook.`
      : "Extract the full table of contents supported by the PDF.";

  try {
    const response = await ai.models.generateContent({
      model: CURRICULUM_GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                fileUri: input.fileUri,
                mimeType: input.mimeType,
              },
            },
            {
              text: `You are extracting the authoritative table of contents for the NCTB ${input.className} ${input.subjectName} textbook. ${pageHint} Return only JSON. Never invent titles, page ranges, lessons, or academic facts. Extract only what the PDF supports.\n{\n  "source_confidence": "high|medium|low",\n  "total_lessons": 0,\n  "chapters": [{\n    "title": "English/transliterated title",\n    "title_bn": "Exact Bangla title",\n    "chapter_number": 1,\n    "page_start": 1,\n    "page_end": 20,\n    "lessons": [{\n      "title": "English/transliterated title",\n      "title_bn": "Exact Bangla title",\n      "lesson_number": 1,\n      "page_start": 2,\n      "page_end": 5\n    }]\n  }]\n}`,
            },
          ],
        },
      ],
      config: { responseMimeType: "application/json", temperature: 0 },
    });

    return parseStructure(response.text ?? "");
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "INVALID_AI_JSON" ||
        error.message === "STRUCTURE_VALIDATION_FAILED" ||
        error.message === "GEMINI_CONFIGURATION_ERROR")
    ) {
      throw error;
    }
    console.error("Gemini structure extraction failed:", error);
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`GEMINI_REQUEST_FAILED: ${msg.slice(0, 300)}`);
  }
}
