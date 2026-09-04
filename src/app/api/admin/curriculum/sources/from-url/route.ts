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

const BodySchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  url: z.string().url().max(2048),
  title: z.string().trim().min(1).max(300).optional(),
  curriculumVersionId: z.string().uuid().optional(),
});

const MAX_BYTES = 50 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 55_000;

function guessFileName(url: string, contentDisposition: string | null): string {
  if (contentDisposition) {
    const m =
      /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i.exec(
        contentDisposition,
      );
    const raw = decodeURIComponent(
      (m?.[1] || m?.[2] || m?.[3] || "").trim(),
    );
    if (raw.toLowerCase().endsWith(".pdf")) {
      return raw.replace(/[/\\]/g, "-").slice(0, 120);
    }
  }
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() || "curriculum.pdf";
    if (last.toLowerCase().endsWith(".pdf")) return last.slice(0, 120);
  } catch {
    /* ignore */
  }
  return `curriculum-${Date.now()}.pdf`;
}

/**
 * POST /api/admin/curriculum/sources/from-url
 * Download a direct PDF URL → storage (Supabase or Drive) → curriculum_sources row.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const rateError = await rateLimit(
      `admin-source-from-url:${auth.user.id}`,
      rateLimitDefaults.adminAI,
    );
    if (rateError) return rateError;

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json(
        { error: "INVALID_BODY", message: "JSON body লাগবে।" },
        { status: 400 },
      );
    }

    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "STRUCTURE_VALIDATION_FAILED",
          message: "classId, subjectId, url আবশ্যক (valid URL)।",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { classId, subjectId, url, title, curriculumVersionId } = parsed.data;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "INVALID_URL", message: "URL সঠিক নয়।" },
        { status: 400 },
      );
    }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "INVALID_URL", message: "শুধু http/https URL চলবে।" },
        { status: 400 },
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

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let remote: Response;
    try {
      remote = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          Accept: "application/pdf,*/*",
          "User-Agent":
            "ONONNOCurriculumBot/1.0 (+https://ononno.app; admin-import)",
        },
      });
    } catch (e) {
      clearTimeout(timer);
      const aborted = e instanceof Error && e.name === "AbortError";
      return NextResponse.json(
        {
          error: "DOWNLOAD_FAILED",
          message: aborted
            ? "Download timeout — PDF খুব বড় বা লিংক ধীর।"
            : "URL থেকে download করা যায়নি।",
        },
        { status: 502 },
      );
    } finally {
      clearTimeout(timer);
    }

    if (!remote.ok) {
      return NextResponse.json(
        {
          error: "DOWNLOAD_FAILED",
          message: `Remote HTTP ${remote.status} — লিংক চেক করো (direct PDF URL লাগবে)।`,
        },
        { status: 502 },
      );
    }

    const contentType = (remote.headers.get("content-type") || "").toLowerCase();
    const contentLength = Number(remote.headers.get("content-length") || 0);
    if (contentLength > MAX_BYTES) {
      return NextResponse.json(
        {
          error: "PDF_TOO_LARGE",
          message: "PDF 50MB-এর বেশি — ছোট ফাইল বা storage-এ ম্যানুয়াল upload করো।",
        },
        { status: 413 },
      );
    }

    const ab = await remote.arrayBuffer();
    const buffer = Buffer.from(ab);
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { error: "PDF_TOO_LARGE", message: "PDF 50MB-এর বেশি।" },
        { status: 413 },
      );
    }
    if (buffer.byteLength < 100) {
      return NextResponse.json(
        {
          error: "NOT_A_PDF",
          message: "ফাইল খুব ছোট — সম্ভবত PDF নয়।",
        },
        { status: 400 },
      );
    }

    const header = buffer.subarray(0, 5).toString("utf8");
    const looksPdf =
      header.startsWith("%PDF") || contentType.includes("application/pdf");
    if (!looksPdf) {
      return NextResponse.json(
        {
          error: "NOT_A_PDF",
          message:
            "Response PDF নয়। NCTB viewer পেজ নয় — direct .pdf download link দাও।",
          contentType: contentType || null,
        },
        { status: 400 },
      );
    }

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
          source: duplicate,
        },
        { status: 409 },
      );
    }

    const fileName = guessFileName(
      url,
      remote.headers.get("content-disposition"),
    );
    const storagePath = buildCurriculumPdfPath({
      classNumber: klass.class_number,
      subjectSlug: subject.slug || subject.name || "subject",
      fileName,
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
      console.error("[from-url] upload", uploadError);
      return NextResponse.json(
        {
          error: "PDF_UPLOAD_FAILED",
          message:
            uploadError instanceof Error
              ? uploadError.message
              : "Storage-এ save করা যায়নি।",
        },
        { status: 500 },
      );
    }

    const resolvedTitle =
      title ||
      fileName.replace(/\.pdf$/i, "") ||
      `${subject.name} — Class ${klass.class_number}`;

    const insertPayload: Record<string, unknown> = {
      class_id: classId,
      subject_id: subjectId,
      title: resolvedTitle,
      file_name: fileName,
      file_size: buffer.byteLength,
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
      console.error("[from-url] db", error);
      try {
        await storage.delete(uploadResult.path);
      } catch {
        /* cleanup */
      }
      return NextResponse.json(
        { error: "PDF_UPLOAD_FAILED", message: "Source save করা যায়নি।" },
        { status: 500 },
      );
    }

    await audit("IMPORT_CURRICULUM_SOURCE_FROM_URL", auth.user.id, {
      sourceId: data.id,
      classId,
      subjectId,
      url: url.slice(0, 500),
      storagePath: uploadResult.path,
      storageProvider: uploadResult.provider,
      fileSize: buffer.byteLength,
    });

    return NextResponse.json(
      {
        source: data,
        message: "Download ও storage সম্পন্ন। এখন Extract করতে পারো।",
        storageProvider: uploadResult.provider,
        storagePath: uploadResult.path,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[from-url]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
