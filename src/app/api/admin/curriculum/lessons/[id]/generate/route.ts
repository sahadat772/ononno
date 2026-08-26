import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { requireRole } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";

type RouteContext = { params: Promise<{ id: string }> };
type GeneratedContent = {
  overview?: string;
  objectives?: string[];
  main_content?: string;
  ai_explanation?: string;
  examples?: string[];
  summary?: string;
  extra_notes?: string;
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(_request: NextRequest, context: RouteContext) {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;

  const rateError = await rateLimit(`admin-generate-lesson:${auth.user.id}`, rateLimitDefaults.adminAI);
  if (rateError) return rateError;

  const { id } = await context.params;
  const { data: lesson, error: lessonError } = await auth.supabase
    .from("curriculum_lessons")
    .select("id, title, title_bn, workflow_status, page_start, page_end, source_id, curriculum_sources(title, gemini_file_uri, gemini_file_name)")
    .eq("id", id)
    .maybeSingle();

  if (lessonError || !lesson) return NextResponse.json({ error: "Lesson পাওয়া যায়নি।" }, { status: 404 });
  if (!["reviewed", "generated"].includes(lesson.workflow_status ?? "draft")) {
    return NextResponse.json({ error: "শুধু reviewed lesson generate করা যাবে।" }, { status: 409 });
  }

  const source = lesson.curriculum_sources as unknown as { title?: string; gemini_file_uri?: string; gemini_file_name?: string } | null;
  if (!source?.gemini_file_uri) {
    return NextResponse.json({ error: "এই lesson-এর source PDF Gemini File API-তে পাওয়া যায়নি।" }, { status: 409 });
  }

  await auth.supabase.from("curriculum_lessons").update({ workflow_status: "generating" }).eq("id", id);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          { fileData: { fileUri: source.gemini_file_uri, mimeType: "application/pdf" } },
          { text: `Create a reviewable learning draft for the NCTB lesson "${lesson.title_bn ?? lesson.title}". Use only the textbook content on pages ${lesson.page_start ?? "unknown"}-${lesson.page_end ?? "unknown"}. Do not invent or change academic facts. Return JSON only with overview, objectives (array), main_content, ai_explanation, examples (array), summary, extra_notes. Keep the source faithful and age-appropriate. Source file: ${source.title ?? source.gemini_file_name ?? "curriculum PDF"}.` },
        ],
      }],
      config: { responseMimeType: "application/json", temperature: 0.2 },
    });

    const content = JSON.parse((response.text ?? "").replace(/```json/gi, "").replace(/```/g, "").trim()) as GeneratedContent;
    const { data, error: contentError } = await auth.supabase.from("lesson_contents").upsert({
      lesson_id: id,
      overview: content.overview ?? null,
      objectives: content.objectives ?? [],
      main_content: content.main_content ?? null,
      ai_explanation: content.ai_explanation ?? null,
      examples: content.examples ?? [],
      summary: content.summary ?? null,
      extra_notes: content.extra_notes ?? null,
      is_ai_generated: true,
      ai_prompt: `NCTB source pages ${lesson.page_start ?? "unknown"}-${lesson.page_end ?? "unknown"}; model gemini-2.5-flash`,
    }, { onConflict: "lesson_id" }).select().single();

    if (contentError) throw contentError;
    await auth.supabase.from("curriculum_lessons").update({ workflow_status: "generated" }).eq("id", id);
    await audit("GENERATE_LESSON_CONTENT", auth.user.id, { lessonId: id, sourceId: lesson.source_id, model: "gemini-2.5-flash", pageStart: lesson.page_start, pageEnd: lesson.page_end });
    return NextResponse.json({ lessonId: id, content: data, status: "generated" });
  } catch (error) {
    console.error("Lesson generation error:", error);
    await auth.supabase.from("curriculum_lessons").update({ workflow_status: "reviewed" }).eq("id", id);
    return NextResponse.json({ error: "Lesson draft generate করা যায়নি। Gemini configuration ও source PDF যাচাই করুন।" }, { status: 500 });
  }
}
