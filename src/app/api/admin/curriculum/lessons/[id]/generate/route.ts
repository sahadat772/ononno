import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";
import { ai, CURRICULUM_GEMINI_MODEL } from "@/lib/gemini";
import { resolvePageRange } from "@/lib/page-fields";

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

export async function POST(_request: NextRequest, context: RouteContext) {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;

  const rateError = await rateLimit(
    `admin-generate-lesson:${auth.user.id}`,
    rateLimitDefaults.adminAI,
  );
  if (rateError) return rateError;

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      {
        error: "GEMINI_CONFIGURATION_ERROR",
        message: "GEMINI_API_KEY configured নেই।",
      },
      { status: 500 },
    );
  }

  const { id } = await context.params;
  const { data: lesson, error: lessonError } = await auth.supabase
    .from("curriculum_lessons")
    .select(
      "id, title, title_bn, workflow_status, is_published, page_start, page_end, source_page_start, source_page_end, source_id, curriculum_sources(title, gemini_file_uri, gemini_file_name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (lessonError || !lesson) {
    return NextResponse.json(
      { error: "SOURCE_NOT_FOUND", message: "Lesson পাওয়া যায়নি।" },
      { status: 404 },
    );
  }

  if (lesson.is_published || lesson.workflow_status === "published") {
    return NextResponse.json(
      {
        error: "STRUCTURE_COMMIT_FAILED",
        message:
          "Published lesson overwrite করা যাবে না। নতুন version flow পরের phase-এ আসবে।",
      },
      { status: 409 },
    );
  }

  if (lesson.workflow_status === "approved") {
    return NextResponse.json(
      {
        error: "STRUCTURE_COMMIT_FAILED",
        message: "Approved lesson generate/overwrite করা যাবে না।",
      },
      { status: 409 },
    );
  }

  if (!["reviewed", "generated", "extracted"].includes(lesson.workflow_status ?? "draft")) {
    return NextResponse.json(
      {
        error: "STRUCTURE_VALIDATION_FAILED",
        message: "শুধু reviewed/generated/extracted lesson generate করা যাবে।",
      },
      { status: 409 },
    );
  }

  const source = lesson.curriculum_sources as unknown as {
    title?: string;
    gemini_file_uri?: string;
    gemini_file_name?: string;
  } | null;

  if (!source?.gemini_file_uri) {
    return NextResponse.json(
      {
        error: "PDF_NOT_FOUND",
        message: "এই lesson-এর source PDF Gemini File API-তে পাওয়া যায়নি।",
      },
      { status: 409 },
    );
  }

  const pages = resolvePageRange(lesson);
  const pageStart = pages.page_start;
  const pageEnd = pages.page_end;

  await auth.supabase
    .from("curriculum_lessons")
    .update({ workflow_status: "generating" })
    .eq("id", id);

  try {
    const response = await ai.models.generateContent({
      model: CURRICULUM_GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                fileUri: source.gemini_file_uri,
                mimeType: "application/pdf",
              },
            },
            {
              text: `Create a reviewable learning draft for the NCTB lesson "${lesson.title_bn ?? lesson.title}". Use only the textbook content on pages ${pageStart ?? "unknown"}-${pageEnd ?? "unknown"}. Do not invent or change academic facts. Return JSON only with overview, objectives (array), main_content, ai_explanation, examples (array), summary, extra_notes. Keep the source faithful and age-appropriate. Source file: ${source.title ?? source.gemini_file_name ?? "curriculum PDF"}.`,
            },
          ],
        },
      ],
      config: { responseMimeType: "application/json", temperature: 0.2 },
    });

    const raw = (response.text ?? "")
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    let content: GeneratedContent;
    try {
      content = JSON.parse(raw) as GeneratedContent;
    } catch {
      throw new Error("INVALID_AI_JSON");
    }

    const { data, error: contentError } = await auth.supabase
      .from("lesson_contents")
      .upsert(
        {
          lesson_id: id,
          overview: content.overview ?? null,
          objectives: content.objectives ?? [],
          main_content: content.main_content ?? null,
          ai_explanation: content.ai_explanation ?? null,
          examples: content.examples ?? [],
          summary: content.summary ?? null,
          extra_notes: content.extra_notes ?? null,
          is_ai_generated: true,
          ai_prompt: `NCTB source pages ${pageStart ?? "unknown"}-${pageEnd ?? "unknown"}; model ${CURRICULUM_GEMINI_MODEL}`,
        },
        { onConflict: "lesson_id" },
      )
      .select()
      .single();

    if (contentError) throw contentError;

    await auth.supabase
      .from("curriculum_lessons")
      .update({ workflow_status: "generated" })
      .eq("id", id);

    await audit("GENERATE_LESSON_CONTENT", auth.user.id, {
      lessonId: id,
      sourceId: lesson.source_id,
      model: CURRICULUM_GEMINI_MODEL,
      pageStart,
      pageEnd,
    });

    return NextResponse.json({
      lessonId: id,
      content: data,
      status: "generated",
    });
  } catch (error) {
    console.error("Lesson generation error:", error);
    await auth.supabase
      .from("curriculum_lessons")
      .update({ workflow_status: "reviewed" })
      .eq("id", id);
    const code =
      error instanceof Error && error.message === "INVALID_AI_JSON"
        ? "INVALID_AI_JSON"
        : "GEMINI_REQUEST_FAILED";
    return NextResponse.json(
      {
        error: code,
        message:
          "Lesson draft generate করা যায়নি। Gemini configuration ও source PDF যাচাই করুন।",
      },
      { status: code === "INVALID_AI_JSON" ? 422 : 500 },
    );
  }
}
