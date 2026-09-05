import { ai } from "@/lib/gemini";
import { classNumberToDepth } from "@/lib/study-depth";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CURRICULUM_PDF_BUCKET } from "@/lib/storage/supabase-curriculum-storage";

/**
 * Image models tried in order (Sep 2026).
 * Native Gemini image models first — more reliable for API keys than Imagen alone.
 */
export const COVER_NATIVE_MODELS = [
  "gemini-3.1-flash-image",
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-image-preview",
] as const;

export const COVER_IMAGEN_MODELS = [
  "imagen-4.0-generate-001",
  "imagen-3.0-generate-002",
] as const;

/** @deprecated use COVER_IMAGEN_MODELS */
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
  const parts =
    r?.candidates?.[0]?.content?.parts ??
    r?.response?.candidates?.[0]?.content?.parts ??
    [];
  for (const part of parts) {
    const inline = part?.inlineData || part?.inline_data;
    if (inline?.data) {
      return {
        bytes: Buffer.from(String(inline.data), "base64"),
        mimeType: String(inline.mimeType || inline.mime_type || "image/png"),
        model: "",
      };
    }
  }
  return null;
}

/**
 * Generate one cover image.
 * 1) Gemini native image models
 * 2) Imagen generateImages
 */
export async function generateLessonCoverImage(
  prompt: string,
): Promise<CoverImageResult> {
  let lastError: unknown;

  for (const model of COVER_NATIVE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["TEXT", "IMAGE"],
        } as Record<string, unknown>,
      });
      const extracted = extractInlineImage(response);
      if (extracted) {
        return { ...extracted, model };
      }
      throw new Error("NO_IMAGE_PART");
    } catch (e) {
      lastError = e;
      console.warn(`[cover-image] native model ${model} failed`, e);
    }
  }

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
      if (!imageBytes) throw new Error("NO_IMAGE_BYTES");

      const buf =
        typeof imageBytes === "string"
          ? Buffer.from(imageBytes, "base64")
          : Buffer.from(imageBytes as ArrayBuffer);

      return { bytes: buf, mimeType: "image/png", model };
    } catch (e) {
      lastError = e;
      console.warn(`[cover-image] imagen model ${model} failed`, e);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("COVER_IMAGE_GENERATION_FAILED");
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

  if (error) throw new Error(error.message);

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
