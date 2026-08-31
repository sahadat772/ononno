import { GoogleGenAI } from "@google/genai";

/**
 * Canonical server-side Gemini client for the curriculum pipeline.
 * Always use GEMINI_API_KEY. Do not instantiate additional clients in routes.
 */
if (!process.env.GEMINI_API_KEY) {
  console.warn("[gemini] GEMINI_API_KEY is not set");
}

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY ?? "",
});

/** Default curriculum model — gemini-2.5-flash retired for new API keys. */
export const CURRICULUM_GEMINI_MODEL = "gemini-3.6-flash";

export default ai;
