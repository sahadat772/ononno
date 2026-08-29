import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";

/**
 * @deprecated Use /api/admin/curriculum/sources instead.
 * Kept as a thin compatibility surface for older admin clients.
 *
 * GET /api/admin/curriculum/pdf-sources
 *
 * List all PDFs by class and subject
 * Query params:
 *   - class_id: Filter by class
 *   - subject_id: Filter by subject
 *   - version_id: Filter by curriculum version
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("class_id");
    const subjectId = searchParams.get("subject_id");
    const versionId = searchParams.get("version_id");

    let query = auth.supabase
      .from("curriculum_sources")
      .select(
        `
        id,
        file_name,
        file_size,
        storage_path,
        page_count,
        total_chapters,
        total_lessons,
        source_status,
        workflow_status,
        created_at,
        curriculum_classes(id, name),
        curriculum_subjects(id, name, name_bn)
      `,
      )
      .order("created_at", { ascending: false });

    if (classId) query = query.eq("class_id", classId);
    if (subjectId) query = query.eq("subject_id", subjectId);
    if (versionId) query = query.eq("curriculum_version_id", versionId);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { error: "PDF sources আনা যায়নি।" },
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
