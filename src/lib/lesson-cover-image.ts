import { ai } from "@/lib/gemini";
import { classNumberToDepth } from "@/lib/study-depth";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CURRICULUM_PDF_BUCKET } from "@/lib/storage/supabase-curriculum-storage";

/**
 * Cover strategy for platform dignity:
 * default: branded SVG (NCTB-safe)
 * COVER_IMAGE_PROVIDER=pollinations | gemini for AI art
 */
export const COVER_NATIVE_MODELS = [
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-image",
] as const;

/** @deprecated */
export const COVER_IMAGE_MODELS = COVER_NATIVE_MODELS;

const SUBJECT_THEMES: Record<
  string,
  { from: string; to: string; accent: string; emoji: string }
> = {
  bangla: { from: "#1e3a5f", to: "#0f766e", accent: "#fbbf24", emoji: "📖" },
  english: { from: "#1e1b4b", to: "#4c1d95", accent: "#a78bfa", emoji: "🔤" },
  math: { from: "#0c4a6e", to: "#0369a1", accent: "#38bdf8", emoji: "🔢" },
  mathematics: { from: "#0c4a6e", to: "#0369a1", accent: "#38bdf8", emoji: "🔢" },
  science: { from: "#14532d", to: "#047857", accent: "#6ee7b7", emoji: "🔬" },
};

function themeFor(subjectName?: string | null) {
  const key = (subjectName || "").toLowerCase().trim();
  for (const [k, v] of Object.entries(SUBJECT_THEMES)) {
    if (key.includes(k.toLowerCase())) return v;
  }
  // Bangla subject names
  if (key.includes("বাংলা") || key.includes("bangla")) {
    return SUBJECT_THEMES.bangla;
  }
  if (key.includes("গণিত")) return SUBJECT_THEMES.math;
  if (key.includes("বিজ্ঞান")) return SUBJECT_THEMES.science;
  return { from: "#0f172a", to: "#1e293b", accent: "#f59e0b", emoji: "📚" };
}

export function buildLessonCoverPrompt(opts: {
  title: string;
  overview?: string | null;
  classNumber?: number | null;
  subjectName?: string | null;
}): string {
  const depth = classNumberToDepth(opts.classNumber);
  const age =
    depth === "light"
      ? "for young children age 6-8, simple friendly educational illustration"
      : depth === "standard"
        ? "for primary school, clear educational illustration"
        : "for secondary students, clean educational illustration";

  const topic = [opts.title, opts.subjectName].filter(Boolean).join(" - ");

  return [
    "Educational cover for Bangladesh NCTB school lesson.",
    age + ".",
    "Lesson: " + topic + ".",
    "Show school-friendly scene matching the lesson title only.",
    "Soft flat illustration, warm colors, NO text, NO letters, NO watermark.",
  ].join(" ");
}

export type CoverImageResult = {
  bytes: Buffer;
  mimeType: string;
  model: string;
};

/** Escape for SVG text using numeric entities (safe in source). */
function esc(s: string) {
  return [...s]
    .map((c) => {
      if (c === "&") return "&#38;";
      if (c === "<") return "&#60;";
      if (c === ">") return "&#62;";
      if (c === '"') return "&#34;";
      return c;
    })
    .join("");
}

/**
 * Branded SVG cover — dignified, consistent, no random AI artifacts.
 */
export function generateBrandedSvgCover(opts: {
  title: string;
  subjectName?: string | null;
  classNumber?: number | null;
}): CoverImageResult {
  const theme = themeFor(opts.subjectName);
  const title = (opts.title || "পাঠ").slice(0, 42);
  const subtitle = [
    opts.subjectName,
    opts.classNumber != null ? `শ্রেণি ${opts.classNumber}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.from}"/>
      <stop offset="100%" stop-color="${theme.to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="70%" cy="30%" r="50%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect width="1280" height="720" fill="url(#glow)"/>
  <circle cx="1040" cy="160" r="120" fill="none" stroke="${theme.accent}" stroke-opacity="0.25" stroke-width="3"/>
  <circle cx="1040" cy="160" r="70" fill="none" stroke="${theme.accent}" stroke-opacity="0.4" stroke-width="2"/>
  <circle cx="200" cy="560" r="90" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"/>
  <rect x="80" y="180" width="720" height="360" rx="28" fill="#0b1220" fill-opacity="0.45" stroke="#ffffff" stroke-opacity="0.12"/>
  <text x="120" y="280" font-family="system-ui,Segoe UI,sans-serif" font-size="42" fill="#ffffff" font-weight="700">${esc(theme.emoji)} ONONNO</text>
  <text x="120" y="360" font-family="system-ui,Segoe UI,sans-serif" font-size="36" fill="#f8fafc" font-weight="600">${esc(title)}</text>
  <text x="120" y="420" font-family="system-ui,Segoe UI,sans-serif" font-size="22" fill="${theme.accent}">${esc(subtitle || "NCTB Curriculum Lesson")}</text>
  <text x="120" y="490" font-family="system-ui,Segoe UI,sans-serif" font-size="18" fill="#94a3b8">শেখো · বুঝো · এগিয়ে যাও</text>
</svg>`;

  return {
    bytes: Buffer.from(svg, "utf8"),
    mimeType: "image/svg+xml",
    model: "ononno-branded-svg",
  };
}

function extractInlineImage(response: unknown): CoverImageResult | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = response as any;
  const parts = r?.candidates?.[0]?.content?.parts ?? [];
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
    m.includes("rate limit")
  );
}

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
  if (!res.ok) throw new Error(`POLLINATIONS_HTTP_${res.status}`);
  const ct = res.headers.get("content-type") || "image/jpeg";
  if (!ct.includes("image")) throw new Error(`POLLINATIONS_NOT_IMAGE: ${ct}`);
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
      if (isQuotaError(lastErr)) {
        throw new Error(`GEMINI_IMAGE_QUOTA: ${lastErr}`);
      }
    }
  }
  throw new Error(lastErr || "GEMINI_IMAGE_FAILED");
}

/**
 * Generate cover image.
 * Default = branded SVG (platform dignity).
 */
export async function generateLessonCoverImage(
  prompt: string,
  meta?: {
    title?: string;
    subjectName?: string | null;
    classNumber?: number | null;
  },
): Promise<CoverImageResult> {
  const provider = (process.env.COVER_IMAGE_PROVIDER || "branded").toLowerCase();

  if (provider === "pollinations") {
    return generateCoverViaPollinations(prompt);
  }
  if (provider === "gemini") {
    return generateCoverViaGemini(prompt);
  }
  if (provider === "auto") {
    try {
      return await generateCoverViaGemini(prompt);
    } catch {
      try {
        return await generateCoverViaPollinations(prompt);
      } catch {
        return generateBrandedSvgCover({
          title: meta?.title || "পাঠ",
          subjectName: meta?.subjectName,
          classNumber: meta?.classNumber,
        });
      }
    }
  }

  return generateBrandedSvgCover({
    title: meta?.title || "পাঠ",
    subjectName: meta?.subjectName,
    classNumber: meta?.classNumber,
  });
}

export function coverStoragePath(lessonId: string, mimeType?: string) {
  const ext = mimeType?.includes("svg")
    ? "svg"
    : mimeType?.includes("png")
      ? "png"
      : "jpg";
  return `curriculum/media/covers/lesson-${lessonId}.${ext}`;
}

export async function uploadLessonCover(opts: {
  supabase: SupabaseClient;
  lessonId: string;
  bytes: Buffer;
  mimeType?: string;
}): Promise<{ path: string; url: string | null }> {
  const path = coverStoragePath(opts.lessonId, opts.mimeType);
  const contentType = opts.mimeType || "image/png";

  const { error } = await opts.supabase.storage
    .from(CURRICULUM_PDF_BUCKET)
    .upload(path, opts.bytes, { contentType, upsert: true });

  if (error) throw new Error(`STORAGE_UPLOAD: ${error.message}`);

  const { data: signed } = await opts.supabase.storage
    .from(CURRICULUM_PDF_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  return { path, url: signed?.signedUrl ?? null };
}

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
    const img = await generateLessonCoverImage(prompt, {
      title: opts.title,
      subjectName: opts.subjectName,
      classNumber: opts.classNumber,
    });
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
