import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/api-auth";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";
import { audit } from "@/lib/audit";
import {
  extractStructureFromGemini,
  uploadPdfToGemini,
} from "@/lib/curriculum-import";
import { createCurriculumStorage } from "@/lib/storage";

const ExtractStructureBodySchema = z.object({
  start_page: z.number().int().min(1).optional(),
  end_page: z.number().int().min(1).optional(),
});

type RouteContext = { params: Promise<{ sourceId: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const { sourceId } = await context.params;
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const rateError = await rateLimit(
      `admin-extract-pdf:${auth.user.id}`,
      rateLimitDefaults.adminAI,
    );
    if (rateError) return rateError;

    if (!z.string().uuid().safeParse(sourceId).success) {
      return NextResponse.json(
        { error: "SOURCE_NOT_FOUND", message: "Invalid source id." },
        { status: 400 },
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const parsedBody = ExtractStructureBodySchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "INVALID_PAGE_RANGE",
          message: parsedBody.error.issues.map((i) => i.message).join(" "),
        },
        { status: 400 },
      );
    }

    const { data: source, error: sourceError } = await auth.supabase
      .from("curriculum_sources")
      .select(`*, curriculum_classes(name), curriculum_subjects(name, name_bn)`)
      .eq("id", sourceId)
      .single();

    if (sourceError || !source) {
      return NextResponse.json(
        { error: "SOURCE_NOT_FOUND", message: "PDF source পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    const startPage = parsedBody.data.start_page ?? 1;
    const maxPage = source.page_count ?? 500;
    const endPage = parsedBody.data.end_page ?? maxPage;

    if (startPage < 1 || endPage < startPage || endPage > maxPage) {
      return NextResponse.json(
        {
          error: "INVALID_PAGE_RANGE",
          message: `পেজ range invalid। অনুমোদিত: 1-${maxPage}`,
        },
        { status: 400 },
      );
    }

    await auth.supabase
      .from("curriculum_sources")
      .update({ source_status: "extracting", extraction_error: null })
      .eq("id", sourceId);

    const storage = createCurriculumStorage(auth.supabase);
    let fileUri = source.gemini_file_uri as string | null;
    let fileName = source.gemini_file_name as string | null;

    if (!fileUri) {
      const pdfBlob = await storage.download(source.storage_path);
      const geminiFile = await uploadPdfToGemini({
        pdf: pdfBlob,
        displayName: source.file_name ?? source.title ?? "curriculum.pdf",
      });
      fileUri = geminiFile.uri!;
      fileName = geminiFile.name ?? null;
      await auth.supabase
        .from("curriculum_sources")
        .update({ gemini_file_uri: fileUri, gemini_file_name: fileName })
        .eq("id", sourceId);
    }

    const className =
      (source.curriculum_classes as { name?: string } | null)?.name ?? "Class";
    const subjectName =
      (source.curriculum_subjects as { name_bn?: string; name?: string } | null)
        ?.name_bn ??
      (source.curriculum_subjects as { name?: string } | null)?.name ??
      "Subject";

    const structure = await extractStructureFromGemini({
      fileUri,
      mimeType: source.mime_type ?? "application/pdf",
      className,
      subjectName,
      startPage,
      endPage,
    });

    const runId = crypto.randomUUID();
    const totalLessons = structure.totalLessons;

    await auth.supabase
      .from("curriculum_sources")
      .update({
        source_status: "extracted",
        workflow_status: "extracted",
        extraction_run_id: runId,
        total_chapters: structure.chapters.length,
        total_lessons: totalLessons,
        extracted_structure: structure,
        extraction_error: null,
        last_error: null,
      })
      .eq("id", sourceId);

    await auth.supabase.from("curriculum_extraction_runs").insert({
      id: runId,
      source_id: sourceId,
      run_status: "completed",
      extraction_type:
        endPage === maxPage && startPage === 1 ? "full" : "partial",
      start_page: startPage,
      end_page: endPage,
      chapters_found: structure.chapters.length,
      lessons_found: totalLessons,
      created_by: auth.user.id,
      completed_at: new Date().toISOString(),
    });

    await audit("EXTRACT_PDF_STRUCTURE", auth.user.id, {
      sourceId,
      pages: `${startPage}-${endPage}`,
      chaptersFound: structure.chapters.length,
      lessonsFound: totalLessons,
    });

    return NextResponse.json({
      sourceId,
      runId,
      structure,
      chapters: structure.chapters.map((ch) => ({
        title: ch.title,
        title_bn: ch.titleBn,
        page_start: ch.pageStart,
        page_end: ch.pageEnd,
        lessons: ch.lessons.map((ls) => ({
          title: ls.title,
          title_bn: ls.titleBn,
          page_start: ls.pageStart,
          page_end: ls.pageEnd,
        })),
      })),
      totalChapters: structure.chapters.length,
      totalLessons,
      sourceConfidence: structure.sourceConfidence,
    });
  } catch (error) {
    const code =
      error instanceof Error ? error.message : "PDF_PROCESSING_FAILED";
    const known = [
      "INVALID_AI_JSON",
      "STRUCTURE_VALIDATION_FAILED",
      "GEMINI_CONFIGURATION_ERROR",
      "GEMINI_REQUEST_FAILED",
      "PDF_PROCESSING_FAILED",
      "PDF_NOT_FOUND",
      "STORAGE_NOT_FOUND",
    ];
    const errorCode = known.includes(code) ? code : "PDF_PROCESSING_FAILED";
    console.error("PDF extraction error:", error);
    try {
      await auth.supabase
        .from("curriculum_sources")
        .update({
          source_status: "extraction_error",
          last_error: errorCode,
          extraction_error: errorCode,
        })
        .eq("id", sourceId);
    } catch (updateError) {
      console.error("Failed to update source status:", updateError);
    }
    const status =
      errorCode === "INVALID_AI_JSON" ||
      errorCode === "STRUCTURE_VALIDATION_FAILED"
        ? 422
        : 500;
    return NextResponse.json(
      { error: errorCode, message: "PDF structure extract করা যায়নি।" },
      { status },
    );
  }
}
