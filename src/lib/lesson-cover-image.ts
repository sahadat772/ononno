import { ai } from "@/lib/gemini";
import { classNumberToDepth } from "@/lib/study-depth";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CURRICULUM_PDF_BUCKET } from "@/lib/storage/supabase-curriculum-storage";

/**
 * Native Gemini image models (Nano Banana family) — Sep 2026.
 * Prefer these; Imagen 3 is often 404 on consumer API keys.
 */
export const COVER_NATIVE_MODELS = [
  "gemini-3.1-flash-image",
  "gemini-2.5-flash-image",
  "gemini-3-pro-image",
] as const;

/** Optional last-resort Imagen (may 404 on many keys). */
export const COVER_IMAGEN_MODELS = ["imagen-4.0-generate-001"] as const;

/** @deprecated */
export const COVER_IMAGE_MODELS = COVER_IMAGEN_MODELS;

export function buildLessonCoverPrompt(opts: {
  title: string;
  overview?: string | null;
  classNumber?: number | null;
  subjectName?: string | null;
}): string {
  const depth = classNumberToDepth(opts.classNumber);
  const age =
    depth === "light"
      ? "for young children age 6–8, very simple, friendly, colorful cartoon-like"
      : depth === "standard"
        ? "for primary school children, clear educational illustration"
        : "for secondary students, clean modern educational illustration";

  const topic = [opts.title, opts.subjectName, opts.overview?.slice(0, 180)]
    .filter(Boolean)
    .join(" — ");

  return [
    "Create one educational illustration for a Bangladesh school lesson cover.",
    age + ".",
    "Topic: " + topic + ".",
    "Style: soft flat vector illustration, warm cheerful colors,",
    "no written text, no letters, no watermarks, no logos,",
    "no scanned textbook page, child-safe, classroom-friendly.",
    "Show a single clear scene that matches the lesson theme (adventure-friendly).",
    "Do not copy any copyrighted textbook artwork.",
    "Wide landscape composition suitable as a lesson banner.",
  ].join(" ");
}

export type CoverImageResult = {
  bytes: Buffer;
  mimeType: string;
  model: string;
};

function extractInlineImage(response: unknown): CoverImageResult | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = response as any;

  const partLists: unknown[][] = [];
  const c0 = r?.candidates?.[0];
  if (c0?.content?.parts) partLists.push(c0.content.parts);
  if (r?.response?.candidates?.[0]?.content?.parts) {
    partLists.push(r.response.candidates[0].content.parts);
  }
  // Some SDK versions expose data on response directly
  if (Array.isArray(r?.parts)) partLists.push(r.parts);

  for (const parts of partLists) {
    for (const part of parts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = part as any;
      const inline = p?.inlineData || p?.inline_data;
      if (inline?.data) {
        return {
          bytes: Buffer.from(String(inline.data), "base64"),
          mimeType: String(
            inline.mimeType || inline.mime_type || "image/png",
          ),
          model: "",
        };
      }
    }
  }
  return null;
}

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

/**
 * Generate one cover image via Gemini native image models.
 * Uses responseModalities + imageConfig (required for Nano Banana).
 */
export async function generateLessonCoverImage(
  prompt: string,
): Promise<CoverImageResult> {
  const errors: string[] = [];

  const modalityVariants: Array<Record<string, unknown>> = [
    {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "16:9" },
    },
    {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio: "16:9" },
    },
    {
      responseModalities: ["IMAGE"],
    },
  ];

  for (const model of COVER_NATIVE_MODELS) {
    for (const config of modalityVariants) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: config as never,
        });
        const extracted = extractInlineImage(response);
        if (extracted) {
          return { ...extracted, model };
        }
        errors.push(`${model}: NO_IMAGE_PART`);
      } catch (e) {
        const msg = errMessage(e).slice(0, 220);
        errors.push(`${model}: ${msg}`);
        console.warn(`[cover-image] ${model} failed`, msg);
      }
    }
  }

  // Last resort: Imagen 4 only (Imagen 3 is widely 404)
  for (const model of COVER_IMAGEN_MODELS) {
    try {
      const response = await ai.models.generateImages({
        model,
        prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: "16:9",
        },
      });
      const generated = response.generatedImages?.[0];
      const imageBytes = generated?.image?.imageBytes;
      if (!imageBytes) {
        errors.push(`${model}: NO_IMAGE_BYTES`);
        continue;
      }
      const buf =
        typeof imageBytes === "string"
          ? Buffer.from(imageBytes, "base64")
          : Buffer.from(imageBytes as ArrayBuffer);
      return { bytes: buf, mimeType: "image/png", model };
    } catch (e) {
      const msg = errMessage(e).slice(0, 220);
      errors.push(`${model}: ${msg}`);
      console.warn(`[cover-image] imagen ${model} failed`, msg);
    }
  }

  throw new Error(
    "COVER_IMAGE_GENERATION_FAILED: " +
      errors.slice(0, 6).join(" | ") +
      " — GEMINI_API_KEY-এ image model (gemini-3.1-flash-image) access আছে কিনা চেক করো।",
  );
}

export function coverStoragePath(lessonId: string) {
  return `curriculum/media/covers/lesson-${lessonId}.png`;
}

export async function uploadLessonCover(opts: {
  supabase: SupabaseClient;
  lessonId: string;
  bytes: Buffer;
  mimeType?: string;
}): Promise<{ path: string; url: string | null }> {
  const path = coverStoragePath(opts.lessonId);
  const contentType = opts.mimeType || "image/png";

  const { error } = await opts.supabase.storage
    .from(CURRICULUM_PDF_BUCKET)
    .upload(path, opts.bytes, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`STORAGE_UPLOAD: ${error.message}`);

  const { data: signed } = await opts.supabase.storage
    .from(CURRICULUM_PDF_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  return { path, url: signed?.signedUrl ?? null };
}

/**
 * Full pipeline: prompt → image → storage.
 * Returns null on soft failure (does not throw).
 */
export async function generateAndStoreLessonCover(opts: {
  supabase: SupabaseClient;
  lessonId: string;
  title: string;
  overview?: string | null;
  classNumber?: number | null;
  subjectName?: string | null;
}): Promise<{ path: string; url: string | null; model: string } | null> {
  try {
    const prompt = buildLessonCoverPrompt({
      title: opts.title,
      overview: opts.overview,
      classNumber: opts.classNumber,
      subjectName: opts.subjectName,
    });
    const img = await generateLessonCoverImage(prompt);
    const stored = await uploadLessonCover({
      supabase: opts.supabase,
      lessonId: opts.lessonId,
      bytes: img.bytes,
      mimeType: img.mimeType,
    });
    return { ...stored, model: img.model };
  } catch (e) {
    console.warn("[cover-image] generateAndStore soft-fail", e);
    return null;
  }
}
