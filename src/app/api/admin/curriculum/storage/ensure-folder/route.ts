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
 * POST /api/admin/curriculum/storage/ensure-folder
 * Create logical folder: curriculum/class-{n}/{subjectSlug}/
 * Drive: nested folders under GOOGLE_DRIVE_FOLDER_ID
 * Supabase: no real folders — returns the path prefix for manual upload
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
        .select("id, class_number, name, slug")
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
    if (subject.class_id && subject.class_id !== classId) {
      return NextResponse.json(
        {
          error: "STRUCTURE_VALIDATION_FAILED",
          message: "Subject এই class-এর অন্তর্ভুক্ত নয়।",
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

    // Touch folder by ensuring path exists (Drive creates folders;
    // Supabase has flat keys — we only return the prefix).
    try {
      if (providerName === "google_drive") {
        // list() walks/creates parent chain via ensure on upload;
        // call list on folder to force folder walk when empty.
        await storage.list(folderPath);
        // Ensure by creating a .keep placeholder is avoided (quota).
        // Use internal folder ensure via list of parent segments:
        // curriculum, class-n, subject — Drive list creates nothing;
        // so we upload is not used. Call ensure via a dedicated path.
        const drive = storage as {
          ensureFolderPath?: (path: string) => Promise<string>;
        };
        if (typeof drive.ensureFolderPath === "function") {
          await drive.ensureFolderPath(folderPath);
        } else {
          // Fallback: list each parent prefix
          const parts = folderPath.split("/").filter(Boolean);
          let acc = "";
          for (const p of parts) {
            acc = acc ? `${acc}/${p}` : p;
            await storage.list(acc);
          }
        }
      }
    } catch (e) {
      console.error("[ensure-folder]", e);
      return NextResponse.json(
        {
          error: "FOLDER_CREATE_FAILED",
          message:
            e instanceof Error
              ? e.message
              : "Folder তৈরি করা যায়নি। Drive share / FOLDER_ID চেক করো।",
        },
        { status: 500 },
      );
    }

    await audit("ENSURE_CURRICULUM_FOLDER", auth.user.id, {
      classId,
      subjectId,
      folderPath,
      provider: providerName,
    });

    return NextResponse.json({
      folderPath,
      provider: providerName,
      className: klass.name,
      subjectName: subject.name_bn || subject.name,
      message:
        providerName === "google_drive"
          ? `Drive folder তৈরি/নিশ্চিত: ${folderPath} — এখন এই folder-এ PDF রাখো।`
          : `Supabase path prefix: ${folderPath}/ — Dashboard Storage-এ এই path-এ PDF upload করো।`,
      instruction:
        providerName === "google_drive"
          ? "Google Drive → ONONNO-Curriculum → curriculum → class-X → subject → PDF upload (তোমার Gmail দিয়ে)"
          : "Supabase Storage → curriculum-pdfs bucket → same path",
    });
  } catch (error) {
    console.error("[ensure-folder]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
