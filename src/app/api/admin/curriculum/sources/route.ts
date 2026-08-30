import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";
import {
  buildCurriculumPdfPath,
  createCurriculumStorage,
  getDefaultStorageProviderName,
} from "@/lib/storage";

const ListQuerySchema = z.object({
  class_id: z.string().uuid().optional(),
  subject_id: z.string().uuid().optional(),
  storage_provider: z.enum(["supabase", "google_drive"]).optional(),
  source_status: z.string().max(64).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const parsed = ListQuerySchema.safeParse({
      class_id: searchParams.get("class_id") ?? undefined,
      subject_id: searchParams.get("subject_id") ?? undefined,
      storage_provider: searchParams.get("storage_provider") ?? undefined,
      source_status: searchParams.get("source_status") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "STRUCTURE_VALIDATION_FAILED",
          message: "Invalid query parameters.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { class_id, subject_id, storage_provider, source_status } = parsed.data;

    let query = auth.supabase
      .from("curriculum_sources")
      .select(
        `id, title, file_name, file_size, mime_type, storage_path, storage_provider,
         provider_file_id, content_hash, page_count, source_status, workflow_status,
         class_id, subject_id, curriculum_version_id, created_at, updated_at,
         curriculum_classes(id, name, class_number, slug),
         curriculum_subjects(id, name, name_bn, slug)`,
      )
      .order("created_at", { ascending: false });

    if (class_id) query = query.eq("class_id", class_id);
    if (subject_id) query = query.eq("subject_id", subject_id);
    if (storage_provider) query = query.eq("storage_provider", storage_provider);
    if (source_status) query = query.eq("source_status", source_status);

    const { data, error } = await query;
    if (error) {
      console.error("sources list error:", error);
      return NextResponse.json(
        { error: "SOURCE_NOT_FOUND", message: "Sources আনা যায়নি।" },
        { status: 500 },
      );
    }
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const rateError = await rateLimit(
      `admin-upload-source:${auth.user.id}`,
      rateLimitDefaults.adminAI,
    );
    if (rateError) return rateError;

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (parseError) {
      console.error("FormData parsing error:", parseError);
      return NextResponse.json(
        { error: "PDF_UPLOAD_FAILED", message: "PDF file টুকে বড় বা invalid।" },
        { status: 413 },
      );
    }

    const file = formData.get("file") as File | null;
    const classId = formData.get("classId") as string | null;
    const subjectId = formData.get("subjectId") as string | null;
    const title = (formData.get("title") as string | null)?.trim() ?? "";
    const curriculumVersionId = formData.get("curriculumVersionId") as string | null;

    if (!file || !classId || !subjectId || !title) {
      return NextResponse.json(
        {
          error: "STRUCTURE_VALIDATION_FAILED",
          message: "file, classId, subjectId, title আবশ্যক।",
        },
        { status: 400 },
      );
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "PDF_UPLOAD_FAILED", message: "শুধু PDF file upload করা যাবে।" },
        { status: 400 },
      );
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "PDF_UPLOAD_FAILED", message: "PDF size 50MB এর বেশি হতে পারবে না।" },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentHash = createHash("sha256").update(buffer).digest("hex");

    const { data: duplicate } = await auth.supabase
      .from("curriculum_sources")
      .select("id, title, file_name")
      .eq("content_hash", contentHash)
      .maybeSingle();

    if (duplicate) {
      return NextResponse.json(
        {
          error: "DUPLICATE_SOURCE",
          message: "একই PDF আগেই catalog-এ আছে।",
          existingSourceId: duplicate.id,
          existingTitle: duplicate.title ?? duplicate.file_name,
        },
        { status: 409 },
      );
    }

    const [{ data: klass }, { data: subject }] = await Promise.all([
      auth.supabase
        .from("curriculum_classes")
        .select("id, class_number, slug")
        .eq("id", classId)
        .maybeSingle(),
      auth.supabase
        .from("curriculum_subjects")
        .select("id, slug, name, class_id")
        .eq("id", subjectId)
        .maybeSingle(),
    ]);

    if (!klass || !subject) {
      return NextResponse.json(
        {
          error: "STRUCTURE_VALIDATION_FAILED",
          message: "classId বা subjectId অবৈধ।",
        },
        { status: 400 },
      );
    }

    if (subject.class_id && subject.class_id !== classId) {
      return NextResponse.json(
        {
          error: "STRUCTURE_VALIDATION_FAILED",
          message: "Subject এই class-এর অন্তর্ভুক্ত নয়।",
        },
        { status: 400 },
      );
    }

    const storagePath = buildCurriculumPdfPath({
      classNumber: klass.class_number,
      subjectSlug: subject.slug || subject.name || "subject",
      fileName: file.name,
    });

    const providerName = getDefaultStorageProviderName();
    const storage = createCurriculumStorage(auth.supabase, providerName);

    let uploadResult;
    try {
      uploadResult = await storage.upload({
        path: storagePath,
        data: buffer,
        contentType: "application/pdf",
        upsert: false,
      });
    } catch (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        {
          error: "PDF_UPLOAD_FAILED",
          message:
            uploadError instanceof Error
              ? uploadError.message
              : "PDF upload করা যায়নি।",
        },
        { status: 500 },
      );
    }

    const insertPayload: Record<string, unknown> = {
      class_id: classId,
      subject_id: subjectId,
      title,
      file_name: file.name,
      file_size: file.size,
      storage_path: uploadResult.path,
      content_hash: contentHash,
      mime_type: "application/pdf",
      storage_provider: uploadResult.provider,
      provider_file_id: uploadResult.providerFileId ?? null,
      source_status: "uploaded",
      workflow_status: "draft",
      created_by: auth.user.id,
    };
    if (curriculumVersionId) {
      insertPayload.curriculum_version_id = curriculumVersionId;
    }

    const { data, error } = await auth.supabase
      .from("curriculum_sources")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("DB insert error:", error);
      try {
        await storage.delete(uploadResult.path);
      } catch {
        /* best-effort cleanup */
      }
      return NextResponse.json(
        { error: "PDF_UPLOAD_FAILED", message: "Source save করা যায়নি।" },
        { status: 500 },
      );
    }

    await audit("UPLOAD_CURRICULUM_SOURCE", auth.user.id, {
      title,
      classId,
      subjectId,
      fileName: file.name,
      contentHash,
      storagePath: uploadResult.path,
      storageProvider: uploadResult.provider,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
