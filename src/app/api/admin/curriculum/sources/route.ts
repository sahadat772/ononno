import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";
import { createSupabaseCurriculumStorage } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subject_id");
    const classId = searchParams.get("class_id");

    let query = auth.supabase
      .from("curriculum_sources")
      .select(
        `*, curriculum_classes(id, name), curriculum_subjects(id, name, name_bn)`,
      )
      .order("created_at", { ascending: false });

    if (subjectId) query = query.eq("subject_id", subjectId);
    if (classId) query = query.eq("class_id", classId);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { error: "Sources আনা যায়নি।" },
        { status: 500 },
      );
    }
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
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
        {
          error: "PDF_UPLOAD_FAILED",
          message: "PDF file টুকে বড় বা invalid। 50MB-এর কম PDF দিন।",
        },
        { status: 413 },
      );
    }

    const file = formData.get("file") as File | null;
    const classId = formData.get("classId") as string | null;
    const subjectId = formData.get("subjectId") as string | null;
    const title = (formData.get("title") as string | null)?.trim() ?? "";
    const curriculumVersionId = formData.get(
      "curriculumVersionId",
    ) as string | null;

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
        {
          error: "PDF_UPLOAD_FAILED",
          message: "শুধু PDF file upload করা যাবে।",
        },
        { status: 400 },
      );
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "PDF_UPLOAD_FAILED",
          message: "PDF size 50MB এর বেশি হতে পারবে না।",
        },
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
          message: "একই PDF আগেই upload করা আছে।",
          existingSourceId: duplicate.id,
          existingTitle: duplicate.title ?? duplicate.file_name,
        },
        { status: 409 },
      );
    }

    const storagePath = `${classId}/${subjectId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const storage = createSupabaseCurriculumStorage(auth.supabase);

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
        { error: "PDF_UPLOAD_FAILED", message: "PDF upload করা যায়নি।" },
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
      storage_provider: "supabase",
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
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
