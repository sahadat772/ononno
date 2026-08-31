import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";
import { ai, CURRICULUM_GEMINI_MODEL } from "@/lib/gemini";
import { resolvePageRange } from "@/lib/page-fields";
import { uploadPdfToGemini } from "@/lib/curriculum-import";
import { createCurriculumStorage } from "@/lib/storage";

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
      "id, title, title_bn, workflow_status, is_published, page_start, page_end, source_page_start, source_page_end, source_id, class_id, subject_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (lessonError) {
    console.error("generate lesson lookup error:", lessonError);
    return NextResponse.json(
      {
        error: "SOURCE_NOT_FOUND",
        message: "Lesson load করা যায়নি।",
        details: lessonError.message,
      },
      { status: 500 },
    );
  }

  if (!lesson) {
    return NextResponse.json(
      {
        error: "SOURCE_NOT_FOUND",
        message: "Lesson পাওয়া যায়নি। ID ঠিক আছে কি check করুন।",
      },
      { status: 404 },
    );
  }

  if (lesson.is_published || lesson.workflow_status === "published") {
    return NextResponse.json(
      {
        error: "ALREADY_PUBLISHED",
        message:
          "Published lesson আবার generate করা যায় না। নতুন draft চাইলে return-to-review করুন।",
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

  // Already generated content? return existing (no re-bill Gemini)
  const { data: existingContent } = await auth.supabase
    .from("lesson_contents")
    .select("*")
    .eq("lesson_id", id)
    .maybeSingle();

  if (existingContent && lesson.workflow_status === "generated") {
    return NextResponse.json({
      lessonId: id,
      content: existingContent,
      status: "generated",
      cached: true,
      message: "আগেই generate করা content আছে — আবার Gemini call করা হয়নি।",
    });
  }

  if (!["reviewed", "generated", "extracted", "draft"].includes(lesson.workflow_status ?? "draft")) {
    return NextResponse.json(
      {
        error: "STRUCTURE_VALIDATION_FAILED",
        message: `বর্তমান status (${lesson.workflow_status}) এ generate করা যাবে না। আগে Review করুন।`,
      },
      { status: 409 },
    );
  }

  // Resolve PDF source + gemini uri
  let source: {
    id: string;
    title?: string | null;
    gemini_file_uri?: string | null;
    gemini_file_name?: string | null;
    storage_path?: string | null;
    file_name?: string | null;
    mime_type?: string | null;
  } | null = null;

  if (lesson.source_id) {
    const { data } = await auth.supabase
      .from("curriculum_sources")
      .select("id, title, gemini_file_uri, gemini_file_name, storage_path, file_name, mime_type")
      .eq("id", lesson.source_id)
      .maybeSingle();
    source = data;
  }

  if (!source && lesson.class_id && lesson.subject_id) {
    const { data } = await auth.supabase
      .from("curriculum_sources")
      .select("id, title, gemini_file_uri, gemini_file_name, storage_path, file_name, mime_type")
      .eq("class_id", lesson.class_id)
      .eq("subject_id", lesson.subject_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    source = data;
    if (source) {
      await auth.supabase
        .from("curriculum_lessons")
        .update({ source_id: source.id })
        .eq("id", id);
    }
  }

  if (!source) {
    return NextResponse.json(
      {
        error: "PDF_NOT_FOUND",
        message:
          "এই lesson-এর সাথে কোনো curriculum PDF source link নেই। Import → Extract + Commit আগে চালান, অথবা lesson-এ source_id set করুন।",
      },
      { status: 409 },
    );
  }

  let fileUri = source.gemini_file_uri;
  if (!fileUri) {
    if (!source.storage_path) {
      return NextResponse.json(
        {
          error: "PDF_NOT_FOUND",
          message: "Source-এ storage_path ও gemini_file_uri দুটোই নেই।",
        },
        { status: 409 },
      );
    }
    try {
      const storage = createCurriculumStorage(auth.supabase);
      const pdfBlob = await storage.download(source.storage_path);
      const geminiFile = await uploadPdfToGemini({
        pdf: pdfBlob,
        displayName: source.file_name ?? source.title ?? "curriculum.pdf",
      });
      fileUri = geminiFile.uri!;
      await auth.supabase
        .from("curriculum_sources")
        .update({
          gemini_file_uri: fileUri,
          gemini_file_name: geminiFile.name ?? null,
        })
        .eq("id", source.id);
    } catch (uploadErr) {
      console.error("generate: gemini upload failed", uploadErr);
      return NextResponse.json(
        {
          error: "PDF_PROCESSING_FAILED",
          message: "PDF Gemini-তে upload করা যায়নি।",
          details:
            uploadErr instanceof Error ? uploadErr.message.slice(0, 300) : String(uploadErr),
        },
        { status: 500 },
      );
    }
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
                fileUri,
                mimeType: source.mime_type ?? "application/pdf",
              },
            },
            {
              text: `Create a reviewable learning draft for the NCTB lesson "${lesson.title_bn ?? lesson.title}". Use only the textbook content on pages ${pageStart ?? "unknown"}-${pageEnd ?? "unknown"}. Do not invent or change academic facts. Return JSON only with overview, objectives (array), main_content, ai_explanation, examples (array), summary, extra_notes. Keep the source faithful and age-appropriate. Source file: ${source.title ?? source.file_name ?? "curriculum PDF"}.`,
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
      sourceId: source.id,
      model: CURRICULUM_GEMINI_MODEL,
      pageStart,
      pageEnd,
    });

    return NextResponse.json({
      lessonId: id,
      content: data,
      status: "generated",
      cached: false,
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
        details: error instanceof Error ? error.message.slice(0, 400) : undefined,
      },
      { status: code === "INVALID_AI_JSON" ? 422 : 500 },
    );
  }
}
