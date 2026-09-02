import { ai } from "@/lib/gemini";
import { classNumberToDepth } from "@/lib/study-depth";

/** Preferred Imagen models (tried in order). */
export const COVER_IMAGE_MODELS = [
  "imagen-4.0-generate-001",
  "imagen-3.0-generate-002",
] as const;

export function buildLessonCoverPrompt(opts: {
  title: string;
  overview?: string | null;
  classNumber?: number | null;
  subjectName?: string | null;
}): string {
  const depth = classNumberToDepth(opts.classNumber);
  const age =
    depth === "light"
      ? "for young children age 6–8, very simple, friendly, colorful"
      : depth === "standard"
        ? "for primary school children, clear educational illustration"
        : "for secondary students, clean educational diagram-style illustration";

  const topic = [opts.title, opts.subjectName, opts.overview?.slice(0, 200)]
    .filter(Boolean)
    .join(" — ");

  return [
    "Educational illustration for a Bangladesh school lesson.",
    age + ".",
    "Topic: " + topic + ".",
    "Style: soft flat illustration, warm colors, no text overlays, no watermarks,",
    "no logos, no real book page scan, child-safe, classroom-friendly.",
    "Single clear focal scene that helps a student understand the lesson theme.",
    "Do not copy any copyrighted textbook artwork.",
  ].join(" ");
}

export type CoverImageResult = {
  bytes: Buffer;
  mimeType: string;
  model: string;
};

/**
 * Generate one cover image via Gemini Imagen.
 * Throws if all models fail.
 */
export async function generateLessonCoverImage(
  prompt: string,
): Promise<CoverImageResult> {
  let lastError: unknown;

  for (const model of COVER_IMAGE_MODELS) {
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
        throw new Error("NO_IMAGE_BYTES");
      }

      const buf =
        typeof imageBytes === "string"
          ? Buffer.from(imageBytes, "base64")
          : Buffer.from(imageBytes as ArrayBuffer);

      return {
        bytes: buf,
        mimeType: "image/png",
        model,
      };
    } catch (e) {
      lastError = e;
      console.warn(`[cover-image] model ${model} failed`, e);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("COVER_IMAGE_GENERATION_FAILED");
}

export function coverStoragePath(lessonId: string) {
  return `covers/lesson-${lessonId}.png`;
}
