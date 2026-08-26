import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { requireRole } from "@/lib/api-auth";
import { ExtractSyllabusSchema, validateBody } from "@/lib/validation";
import { audit } from "@/lib/audit";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MAX_BASE64_LENGTH = 4_000_000;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

type ImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

type ExtractedLesson = {
  title: string;
  title_bn: string;
};

type ExtractedChapter = {
  title: string;
  title_bn: string;
  lessons: ExtractedLesson[];
};

type ExtractedSyllabus = {
  chapters: ExtractedChapter[];
};

/**
 * Remove <think>...</think> blocks from AI response.
 */
function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

/**
 * Extract JSON object from AI response.
 *
 * Handles:
 * - ```json ... ```
 * - ``` ... ```
 * - Raw JSON
 *
 * Unlike a simple regex, this function finds a balanced JSON object
 * while respecting strings and escaped quotes.
 */
function extractJSON(text: string): string | null {
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/i);

  const source = codeBlock?.[1]?.trim() || text.trim();

  const start = source.indexOf("{");

  if (start === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < source.length; i++) {
    const char = source[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\" && inString) {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth++;
    }

    if (char === "}") {
      depth--;

      if (depth === 0) {
        return source.slice(start, i + 1).trim();
      }
    }
  }

  return null;
}

/**
 * Detect image MIME type from raw Base64.
 */
function detectImageType(base64: string): ImageType | null {
  if (base64.startsWith("/9j/")) {
    return "image/jpeg";
  }

  if (base64.startsWith("iVBOR")) {
    return "image/png";
  }

  if (base64.startsWith("R0lGO")) {
    return "image/gif";
  }

  if (base64.startsWith("UklGR")) {
    return "image/webp";
  }

  return null;
}

/**
 * Normalize image input.
 *
 * Supports:
 * 1. Raw Base64
 * 2. data:image/...;base64,...
 */
function normalizeImageBase64(input: string): {
  base64: string;
  imageType: ImageType;
} | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  // Data URL
  if (trimmed.startsWith("data:")) {
    const match = trimmed.match(
      /^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/i,
    );

    if (!match) {
      return null;
    }

    const imageType = match[1].toLowerCase() as ImageType;
    const base64 = match[2];

    if (!ALLOWED_IMAGE_TYPES.includes(imageType)) {
      return null;
    }

    return {
      base64,
      imageType,
    };
  }

  // Raw Base64
  const imageType = detectImageType(trimmed);

  if (!imageType) {
    return null;
  }

  return {
    base64: trimmed,
    imageType,
  };
}

/**
 * Validate AI extracted syllabus structure.
 *
 * We intentionally validate the AI response before returning it
 * to the frontend/database layer.
 */
function validateExtractedSyllabus(value: unknown): value is ExtractedSyllabus {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  if (!Array.isArray(data.chapters)) {
    return false;
  }

  if (data.chapters.length === 0) {
    return false;
  }

  for (const chapter of data.chapters) {
    if (!chapter || typeof chapter !== "object") {
      return false;
    }

    const chapterData = chapter as Record<string, unknown>;

    if (
      typeof chapterData.title !== "string" ||
      chapterData.title.trim().length === 0
    ) {
      return false;
    }

    if (
      typeof chapterData.title_bn !== "string" ||
      chapterData.title_bn.trim().length === 0
    ) {
      return false;
    }

    if (!Array.isArray(chapterData.lessons)) {
      return false;
    }

    for (const lesson of chapterData.lessons) {
      if (!lesson || typeof lesson !== "object") {
        return false;
      }

      const lessonData = lesson as Record<string, unknown>;

      if (
        typeof lessonData.title !== "string" ||
        lessonData.title.trim().length === 0
      ) {
        return false;
      }

      if (
        typeof lessonData.title_bn !== "string" ||
        lessonData.title_bn.trim().length === 0
      ) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Normalize extracted syllabus.
 *
 * Ensures clean strings and removes empty lessons/chapters.
 */
function normalizeExtractedSyllabus(
  data: ExtractedSyllabus,
): ExtractedSyllabus {
  const chapters: ExtractedChapter[] = [];

  for (const chapter of data.chapters) {
    const lessons = chapter.lessons
      .filter(
        (lesson) =>
          lesson.title.trim().length > 0 && lesson.title_bn.trim().length > 0,
      )
      .map((lesson) => ({
        title: lesson.title.trim(),
        title_bn: lesson.title_bn.trim(),
      }));

    if (chapter.title.trim().length > 0 && chapter.title_bn.trim().length > 0) {
      chapters.push({
        title: chapter.title.trim(),
        title_bn: chapter.title_bn.trim(),
        lessons,
      });
    }
  }

  return {
    chapters,
  };
}

export async function POST(req: NextRequest) {
  try {
    // --------------------------------------------------
    // 1. Admin Authentication
    // --------------------------------------------------

    const auth = await requireRole(["admin"]);

    if ("error" in auth) {
      return auth.error;
    }

    // --------------------------------------------------
    // 2. Rate Limit
    // --------------------------------------------------

    const rateError = await rateLimit(
      `admin-extract-syllabus:${auth.user.id}`,
      rateLimitDefaults.adminAI,
    );

    if (rateError) {
      return rateError;
    }

    // --------------------------------------------------
    // 3. Request Validation
    // --------------------------------------------------

    const body = await validateBody(ExtractSyllabusSchema, req);

    if (body instanceof NextResponse) {
      return body;
    }

    const { imageBase64, subjectName, classLevel } = body;

    // --------------------------------------------------
    // 4. Image Validation
    // --------------------------------------------------

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        {
          error: "একটি syllabus image দেওয়া আবশ্যক।",
        },
        { status: 400 },
      );
    }

    if (imageBase64.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        {
          error: "ছবিটি খুব বড়। 4 MB-এর কম ছবি দিয়ে আবার চেষ্টা করুন।",
        },
        { status: 413 },
      );
    }

    const normalizedImage = normalizeImageBase64(imageBase64);

    if (!normalizedImage) {
      return NextResponse.json(
        {
          error: "শুধু JPEG, PNG, GIF অথবা WebP image ব্যবহার করুন।",
        },
        { status: 400 },
      );
    }

    const { base64, imageType } = normalizedImage;

    // --------------------------------------------------
    // 5. AI Prompt
    // --------------------------------------------------

    const prompt = `আপনি "${classLevel}" শ্রেণীর "${subjectName}" বিষয়ের সূচিপত্র বিশ্লেষণ করছেন।

ছবিতে থাকা সব Chapter এবং Lesson নির্ভুলভাবে বের করুন। নির্দেশনা:

1. ছবিতে প্রতিটি Chapter এবং Lesson অন্তর্ভুক্ত করুন।
2. Chapter থাকলে সেই অনুযায়ী Lesson সাজান।
3. Chapter না থাকলে একটি "Main" Chapter তৈরি করুন।
4. Original order preserve করুন।
5. বাংলা নাম হুবহু রাখুন।
6. English title অবশ্যই বাংলা থেকে transliteration হবে।
7. শুধু ছবিতে দৃশ্যমান তথ্য ব্যবহার করুন।
8. Duplicate lesson নেই।

শুধুমাত্র JSON format-এ উত্তর দিন, অন্য কিছু নয়:
{"chapters": [{"title": "English title", "title_bn": "বাংলা শিরোনাম", "lessons": [{"title": "Lesson English", "title_bn": "পাঠ বাংলা"}]}]}`;

    // --------------------------------------------------
    // 6. Groq Vision Request
    // --------------------------------------------------

    const response = await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",

      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${imageType};base64,${base64}`,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],

      max_tokens: 6000,

      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    // --------------------------------------------------
    // 7. Read AI Response
    // --------------------------------------------------

    const rawContent = response.choices[0]?.message?.content || "";

    if (!rawContent.trim()) {
      console.error("Groq returned empty response");

      return NextResponse.json(
        {
          error: "AI কোনো response দেয়নি। আবার চেষ্টা করুন।",
        },
        { status: 422 },
      );
    }

    const cleaned = stripThinkTags(rawContent);

    console.log("AI cleaned response:", cleaned.substring(0, 500));

    // --------------------------------------------------
    // 8. Extract JSON
    // --------------------------------------------------

    const jsonStr = extractJSON(cleaned);

    if (!jsonStr) {
      console.error(
        "Could not extract JSON from AI response:",
        cleaned.substring(0, 1000),
      );

      return NextResponse.json(
        {
          error: "AI থেকে সঠিক JSON format পাওয়া যায়নি। আবার চেষ্টা করুন।",
        },
        { status: 422 },
      );
    }

    // --------------------------------------------------
    // 9. Parse JSON
    // --------------------------------------------------

    let parsed: unknown;

    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);

      console.error("Invalid JSON:", jsonStr.substring(0, 1000));

      return NextResponse.json(
        {
          error: "AI response parse করা যায়নি। আবার চেষ্টা করুন।",
        },
        { status: 422 },
      );
    }

    // --------------------------------------------------
    // 10. Strict AI Output Validation
    // --------------------------------------------------

    if (!validateExtractedSyllabus(parsed)) {
      console.error("Invalid syllabus structure from AI:", parsed);

      return NextResponse.json(
        {
          error: "AI সঠিক Chapter/Lesson structure দেয়নি। আবার চেষ্টা করুন।",
        },
        { status: 422 },
      );
    }

    // --------------------------------------------------
    // 11. Normalize Data
    // --------------------------------------------------

    const normalized = normalizeExtractedSyllabus(parsed);

    if (normalized.chapters.length === 0) {
      return NextResponse.json(
        {
          error:
            "কোনো valid chapter পাওয়া যায়নি। ছবিটি আরও clear করে আবার চেষ্টা করুন।",
        },
        { status: 422 },
      );
    }

    const totalLessons = normalized.chapters.reduce(
      (total, chapter) => total + chapter.lessons.length,
      0,
    );

    if (totalLessons === 0) {
      return NextResponse.json(
        {
          error:
            "কোনো valid lesson পাওয়া যায়নি। ছবিটি আরও clear করে আবার চেষ্টা করুন।",
        },
        { status: 422 },
      );
    }

    // --------------------------------------------------
    // 12. Audit Log
    // --------------------------------------------------

    await audit("extract_syllabus", auth.user.id, {
      subjectName,
      classLevel,
      payloadSize: base64.length,
      chaptersFound: normalized.chapters.length,
      lessonsFound: totalLessons,
    });

    // --------------------------------------------------
    // 13. Return Structured Result
    // --------------------------------------------------

    return NextResponse.json(normalized, { status: 200 });
  } catch (error) {
    console.error("Syllabus extraction error:", error);

    // Groq API error
    if (error instanceof Error && error.message) {
      console.error("Error message:", error.message);
    }

    return NextResponse.json(
      {
        error: "Syllabus extraction failed। আবার চেষ্টা করুন।",
      },
      { status: 500 },
    );
  }
}
