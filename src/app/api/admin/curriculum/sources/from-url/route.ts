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
const FETCH_TIMEOUT_MS = 90_000;

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

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
    if (raw) return `${raw.replace(/[/\\]/g, "-").slice(0, 100)}.pdf`;
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

function extractGoogleDriveFileId(raw: string): string | null {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    if (
      host !== "drive.google.com" &&
      host !== "docs.google.com" &&
      host !== "drive.usercontent.google.com"
    ) {
      return null;
    }
    const fileMatch = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (fileMatch?.[1]) return fileMatch[1];
    const openId = u.searchParams.get("id");
    if (openId) return openId;
    if (u.pathname.includes("/uc")) {
      const id = u.searchParams.get("id");
      if (id) return id;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function hostIsDriveFolder(u: URL): boolean {
  return (
    u.hostname.includes("drive.google.com") && u.pathname.includes("/folders/")
  );
}

/** True only for share *landing* pages — not /download endpoints. */
function isShareFolderPage(url: string): boolean {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/+$/, "");
    if (path.endsWith("/download")) return false;
    if (hostIsDriveFolder(u)) return true;
    if (u.pathname.includes("/index.php/s/") && !path.endsWith("/download"))
      return true;
    if (u.hostname.includes("egovcloud.gov.bd") && !path.endsWith("/download"))
      return true;
  } catch {
    /* ignore */
  }
  return false;
}

/** Nextcloud / eGov share → append /download when missing. */
function normalizeEgovShareUrl(raw: string): string {
  try {
    const u = new URL(raw);
    const path = u.pathname.replace(/\/+$/, "");
    if (
      (u.hostname.includes("egovcloud.gov.bd") ||
        path.includes("/index.php/s/")) &&
      !path.endsWith("/download")
    ) {
      u.pathname = `${path}/download`;
      return u.toString();
    }
  } catch {
    /* ignore */
  }
  return raw;
}

function resolveDownloadUrl(raw: string): {
  url: string;
  note?: string;
  blocked?: string;
} {
  const normalized = normalizeEgovShareUrl(raw);

  if (isShareFolderPage(normalized)) {
    return {
      url: normalized,
      blocked:
        "এটি folder/share page, direct PDF নয়। NCTB eGov-এ /download যোগ করো, অথবা Google Drive file link দাও।",
    };
  }

  const gId = extractGoogleDriveFileId(normalized);
  if (gId) {
    return {
      url: `https://drive.google.com/uc?export=download&id=${gId}`,
      note: "google_drive_uc",
    };
  }

  if (normalized !== raw) {
    return { url: normalized, note: "egov_nextcloud_download" };
  }

  return { url: normalized };
}

async function fetchPdfBuffer(
  startUrl: string,
): Promise<{
  buffer: Buffer;
  finalUrl: string;
  contentDisposition: string | null;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    let url = startUrl;
    let remote = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "application/pdf,*/*",
        "User-Agent": BROWSER_UA,
      },
    });

    if (!remote.ok) {
      throw Object.assign(new Error(`HTTP_${remote.status}`), {
        status: remote.status,
      });
    }

    let contentType = (remote.headers.get("content-type") || "").toLowerCase();
    let ab = await remote.arrayBuffer();
    let buffer = Buffer.from(ab);

    const asText = buffer.subarray(0, 800).toString("utf8");
    const isHtml =
      contentType.includes("text/html") ||
      asText.trimStart().toLowerCase().startsWith("<!doctype") ||
      asText.includes("<html");

    if (isHtml) {
      const idFromStart = extractGoogleDriveFileId(startUrl);
      const confirm =
        /confirm=([0-9A-Za-z_\-]+)/.exec(asText)?.[1] ||
        /name="confirm"\s+value="([^"]+)"/.exec(asText)?.[1];
      const id =
        idFromStart || /[?&]id=([0-9A-Za-z_\-]+)/.exec(asText)?.[1] || null;
      if (id) {
        const retryUrl = confirm
          ? `https://drive.google.com/uc?export=download&confirm=${confirm}&id=${id}`
          : `https://drive.google.com/uc?export=download&confirm=t&id=${id}`;
        remote = await fetch(retryUrl, {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
          headers: {
            Accept: "application/pdf,*/*",
            "User-Agent": BROWSER_UA,
          },
        });
        if (!remote.ok) {
          throw Object.assign(new Error(`HTTP_${remote.status}`), {
            status: remote.status,
          });
        }
        ab = await remote.arrayBuffer();
        buffer = Buffer.from(ab);
        url = retryUrl;
      }
    }

    return {
      buffer,
      finalUrl: url,
      contentDisposition: remote.headers.get("content-disposition"),
    };
  } finally {
    clearTimeout(timer);
  }
}

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

    const resolved = resolveDownloadUrl(url);
    if (resolved.blocked) {
      return NextResponse.json(
        {
          error: "NOT_DIRECT_PDF",
          message: resolved.blocked,
          hint: {
            nctbEgov:
              "https://drive.egovcloud.gov.bd/index.php/s/TOKEN/download",
            googleDrive:
              "https://drive.google.com/uc?export=download&id=FILE_ID",
          },
        },
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

    let buffer: Buffer;
    let contentDisposition: string | null;
    try {
      const fetched = await fetchPdfBuffer(resolved.url);
      buffer = fetched.buffer;
      contentDisposition = fetched.contentDisposition;
    } catch (e) {
      const aborted = e instanceof Error && e.name === "AbortError";
      const status =
        e && typeof e === "object" && "status" in e
          ? Number((e as { status: number }).status)
          : 0;
      return NextResponse.json(
        {
          error: "DOWNLOAD_FAILED",
          message: aborted
            ? "Download timeout — PDF খুব বড় বা লিংক ধীর।"
            : status
              ? `Remote HTTP ${status} — file public/shared আছে কিনা চেক করো।`
              : "URL থেকে download করা যায়নি।",
        },
        { status: 502 },
      );
    }

    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json(
        {
          error: "PDF_TOO_LARGE",
          message:
            "PDF 50MB-এর বেশি — manual upload (Supabase/Drive) ব্যবহার করো।",
        },
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
    if (!header.startsWith("%PDF")) {
      return NextResponse.json(
        {
          error: "NOT_A_PDF",
          message:
            "Download HTML/viewer এসেছে, PDF নয়। NCTB: লিংকের শেষে /download থাকতে হবে।",
          hint: "https://drive.egovcloud.gov.bd/index.php/s/CW6nYiJRMJE8trb/download",
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

    const gId = extractGoogleDriveFileId(url);
    let fileName = guessFileName(url, contentDisposition);
    if (/^curriculum-\d+\.pdf$/.test(fileName)) {
      fileName = gId
        ? `drive-${gId.slice(0, 12)}.pdf`
        : `curriculum-${Date.now()}.pdf`;
    }

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
