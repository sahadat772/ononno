import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import {
  buildCurriculumFolderPath,
  createCurriculumStorage,
  getDefaultStorageProviderName,
} from "@/lib/storage";

const BodySchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
});

/**
 * POST /api/admin/curriculum/sources/sync-from-storage
 * List PDFs under curriculum/class-X/subject/ and register missing rows in curriculum_sources.
 * Admin places files manually (Gmail → Drive or Supabase dashboard).
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

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
          message: "classId ও subjectId আবশ্যক।",
        },
        { status: 400 },
      );
    }

    const { classId, subjectId } = parsed.data;

    const [{ data: klass }, { data: subject }] = await Promise.all([
      auth.supabase
        .from("curriculum_classes")
        .select("id, class_number, name")
        .eq("id", classId)
        .maybeSingle(),
      auth.supabase
        .from("curriculum_subjects")
        .select("id, name, name_bn, slug, class_id")
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

    const folderPath = buildCurriculumFolderPath({
      classNumber: klass.class_number,
      subjectSlug: subject.slug || subject.name || "subject",
    });

    const providerName = getDefaultStorageProviderName();
    const storage = createCurriculumStorage(auth.supabase, providerName);

    let items;
    try {
      items = await storage.list(folderPath);
    } catch (e) {
      console.error("[sync-from-storage] list", e);
      return NextResponse.json(
        {
          error: "STORAGE_LIST_FAILED",
          message:
            e instanceof Error
              ? e.message
              : "Storage folder list করা যায়নি।",
        },
        { status: 500 },
      );
    }

    const pdfs = items.filter(
      (i) =>
        !i.isFolder &&
        (i.name.toLowerCase().endsWith(".pdf") ||
          (i.contentType || "").includes("pdf")),
    );

    const added: unknown[] = [];
    const skipped: string[] = [];

    for (const pdf of pdfs) {
      const storagePath = pdf.path;
      const { data: existing } = await auth.supabase
        .from("curriculum_sources")
        .select("id, title, file_name")
        .eq("storage_path", storagePath)
        .maybeSingle();

      if (existing) {
        skipped.push(storagePath);
        continue;
      }

      const contentHash = createHash("sha256")
        .update(`sync:${providerName}:${storagePath}:${pdf.providerFileId || ""}`)
        .digest("hex");

      const title =
        pdf.name.replace(/\.pdf$/i, "") ||
        `${subject.name_bn || subject.name} — Class ${klass.class_number}`;

      const insertPayload: Record<string, unknown> = {
        class_id: classId,
        subject_id: subjectId,
        title,
        file_name: pdf.name,
        file_size: pdf.size ?? null,
        storage_path: storagePath,
        content_hash: contentHash,
        mime_type: "application/pdf",
        storage_provider: providerName,
        provider_file_id: pdf.providerFileId ?? null,
        source_status: "uploaded",
        workflow_status: "draft",
        created_by: auth.user.id,
      };

      const { data: row, error } = await auth.supabase
        .from("curriculum_sources")
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        console.error("[sync-from-storage] insert", error);
        skipped.push(`${storagePath} (db error)`);
        continue;
      }
      added.push(row);
    }

    await audit("SYNC_CURRICULUM_SOURCES_FROM_STORAGE", auth.user.id, {
      classId,
      subjectId,
      folderPath,
      provider: providerName,
      found: pdfs.length,
      added: added.length,
      skipped: skipped.length,
    });

    return NextResponse.json({
      folderPath,
      provider: providerName,
      found: pdfs.length,
      added: added.length,
      skipped: skipped.length,
      sources: added,
      message:
        pdfs.length === 0
          ? `Folder খালি বা পাওয়া যায়নি: ${folderPath} — আগে PDF রাখো, তারপর আবার Refresh catalog।`
          : `Catalog sync: ${added.length} নতুন, ${skipped.length} আগে থেকে ছিল।`,
    });
  } catch (error) {
    console.error("[sync-from-storage]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
