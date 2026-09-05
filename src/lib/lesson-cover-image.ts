import { ai } from "@/lib/gemini";
import { classNumberToDepth } from "@/lib/study-depth";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CURRICULUM_PDF_BUCKET } from "@/lib/storage/supabase-curriculum-storage";

/**
 * Cover image strategy (production-safe):
 * 1) One Gemini Nano Banana attempt (if quota allows)
 * 2) Free Pollinations Flux fallback (no Gemini quota)
 *
 * Env (optional):
 *   COVER_IMAGE_PROVIDER = auto | gemini | pollinations
 *   default: auto
 */
export const COVER_NATIVE_MODELS = [
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-image",
] as const;

/** @deprecated */
export const COVER_IMAGE_MODELS = COVER_NATIVE_MODELS;

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

  const topic = [opts.title, opts.subjectName, opts.overview?.slice(0, 120)]
    .filter(Boolean)
    .join(" — ");

  return [
    "Educational illustration, Bangladesh school lesson cover,",
    age + ",",
    "topic: " + topic + ",",
    "soft flat vector, warm cheerful colors, adventure-friendly scene,",
    "no text, no letters, no watermark, no logo, child-safe, landscape 16:9",
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

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

function isQuotaError(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes("429") ||
    m.includes("quota") ||
    m.includes("resource_exhausted") ||
    m.includes("rate limit") ||
    m.includes("exceeded your current quota")
  );
}

/**
 * Free image fallback — Pollinations (Flux).
 * No API key required. Used when Gemini image quota is exhausted.
 */
export async function generateCoverViaPollinations(
  prompt: string,
): Promise<CoverImageResult> {
  const short = prompt.slice(0, 280);
  const url =
    "https://image.pollinations.ai/prompt/" +
    encodeURIComponent(short) +
    "?width=1280&height=720&nologo=true&model=flux&enhance=true";

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "image/*" },
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    throw new Error(`POLLINATIONS_HTTP_${res.status}`);
  }

  const ct = res.headers.get("content-type") || "image/jpeg";
  if (!ct.includes("image")) {
    throw new Error(`POLLINATIONS_NOT_IMAGE: ${ct}`);
  }

  const ab = await res.arrayBuffer();
  if (!ab.byteLength || ab.byteLength < 1000) {
    throw new Error("POLLINATIONS_EMPTY_IMAGE");
  }

  return {
    bytes: Buffer.from(ab),
    mimeType: ct.includes("png") ? "image/png" : "image/jpeg",
    model: "pollinations-flux",
  };
}

async function generateCoverViaGemini(
  prompt: string,
): Promise<CoverImageResult> {
  let lastErr = "";

  for (const model of COVER_NATIVE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseModalities: ["IMAGE"],
          imageConfig: { aspectRatio: "16:9" },
        } as never,
      });
      const extracted = extractInlineImage(response);
      if (extracted) return { ...extracted, model };
      lastErr = `${model}: NO_IMAGE_PART`;
    } catch (e) {
      lastErr = `${model}: ${errMessage(e).slice(0, 200)}`;
      console.warn("[cover-image] gemini failed", lastErr);
      if (isQuotaError(lastErr)) {
        // Don't burn more Gemini image quota
        throw new Error(`GEMINI_IMAGE_QUOTA: ${lastErr}`);
      }
    }
  }

  throw new Error(lastErr || "GEMINI_IMAGE_FAILED");
}

/**
 * Generate cover: Gemini (1–2 tries) → Pollinations fallback.
 */
export async function generateLessonCoverImage(
  prompt: string,
): Promise<CoverImageResult> {
  const provider = (
    process.env.COVER_IMAGE_PROVIDER || "auto"
  ).toLowerCase();

  if (provider === "pollinations") {
    return generateCoverViaPollinations(prompt);
  }

  if (provider === "gemini") {
    return generateCoverViaGemini(prompt);
  }

  // auto
  try {
    return await generateCoverViaGemini(prompt);
  } catch (e) {
    const msg = errMessage(e);
    console.warn("[cover-image] gemini path failed, trying pollinations", msg);
    try {
      return await generateCoverViaPollinations(prompt);
    } catch (e2) {
      throw new Error(
        `COVER_IMAGE_GENERATION_FAILED: Gemini(${msg.slice(0, 180)}) | Pollinations(${errMessage(e2).slice(0, 120)})`,
      );
    }
  }
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
