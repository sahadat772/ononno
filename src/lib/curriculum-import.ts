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

/** If model dumps all lessons under 1 chapter, split into balanced chapters (≈6–8 lessons each). */
export function balanceChapters(
  structure: ExtractedCurriculumStructure,
  targetLessonsPerChapter = 7,
): ExtractedCurriculumStructure {
  const totalLessons = structure.chapters.reduce(
    (n, ch) => n + ch.lessons.length,
    0,
  );

  // Already multi-chapter with reasonable spread
  if (structure.chapters.length >= 4 && totalLessons > 0) {
    return {
      ...structure,
      totalLessons,
    };
  }

  // Flatten all lessons in order
  const flat: ExtractedLessonMap[] = [];
  for (const ch of structure.chapters) {
    for (const les of ch.lessons) {
      flat.push(les);
    }
  }

  if (flat.length === 0) return structure;

  // Prefer 8–10 chapters when many lessons (e.g. 53 → ~7 each → 8 chapters)
  const desiredChapters = Math.min(
    12,
    Math.max(4, Math.ceil(flat.length / targetLessonsPerChapter)),
  );
  const perChapter = Math.ceil(flat.length / desiredChapters);

  const chapters: ExtractedChapterMap[] = [];
  for (let i = 0; i < flat.length; i += perChapter) {
    const slice = flat.slice(i, i + perChapter).map((les, idx) => ({
      ...les,
      lessonNumber: idx + 1,
    }));
    const chapterNumber = chapters.length + 1;
    const pageStart = slice
      .map((l) => l.pageStart)
      .filter((p): p is number => typeof p === "number")
      .sort((a, b) => a - b)[0];
    const pageEnd = slice
      .map((l) => l.pageEnd)
      .filter((p): p is number => typeof p === "number")
      .sort((a, b) => b - a)[0];

    // Use first lesson title as chapter hint when possible
    const hint = slice[0]?.titleBn || slice[0]?.title || `অধ্যায় ${chapterNumber}`;
    chapters.push({
      title: `Chapter ${chapterNumber}`,
      titleBn: `অধ্যায় ${chapterNumber}: ${hint}`.slice(0, 120),
      chapterNumber,
      pageStart,
      pageEnd,
      lessons: slice,
    });
  }

  return {
    chapters,
    totalLessons: flat.length,
    sourceConfidence: structure.sourceConfidence,
  };
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

  const structure: ExtractedCurriculumStructure = {
    chapters,
    totalLessons:
      parsed.total_lessons ??
      chapters.reduce((count, chapter) => count + chapter.lessons.length, 0),
    sourceConfidence: parsed.source_confidence ?? "medium",
  };

  return balanceChapters(structure, 7);
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
              text: `You are extracting the authoritative table of contents for the NCTB ${input.className} ${input.subjectName} textbook (often a Teacher Guide).

${pageHint}

CRITICAL STRUCTURE RULES:
1. Return MULTIPLE chapters (typically 6–12 for a full primary book). NEVER put 40+ lessons under a single chapter.
2. Use PDF "অধ্যায় / একক / Unit / Chapter" headings when present.
3. If the PDF lists many short পাঠ/lesson titles without clear chapter breaks, GROUP consecutive lessons into logical chapters of about 5–8 lessons each, named "অধ্যায় 1", "অধ্যায় 2", ... with a short Bangla theme from the first lesson in that group.
4. Every lesson must belong to exactly one chapter. Preserve order as in the PDF.
5. Never invent titles or page numbers that the PDF does not support. Prefer real titles from TOC / lesson headers.
6. Return ONLY valid JSON.

{
  "source_confidence": "high|medium|low",
  "total_lessons": 0,
  "chapters": [{
    "title": "English/transliterated chapter title",
    "title_bn": "Bangla chapter title",
    "chapter_number": 1,
    "page_start": 1,
    "page_end": 20,
    "lessons": [{
      "title": "English/transliterated lesson title",
      "title_bn": "Bangla lesson title",
      "lesson_number": 1,
      "page_start": 2,
      "page_end": 5
    }]
  }]
}`,
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
