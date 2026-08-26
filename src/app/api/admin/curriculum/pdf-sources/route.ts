import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";

/**
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

    // Build query
    let query = auth.supabase
      .from("curriculum_sources")
      .select(
        `
        id,
        file_name,
        file_size,
        storage_path,
        page_count,
        source_status,
        workflow_status,
        total_chapters,
        total_lessons,
        created_at,
        updated_at,
        curriculum_classes(id, name),
        curriculum_subjects(id, name, name_bn)
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (classId) query = query.eq("class_id", classId);
    if (subjectId) query = query.eq("subject_id", subjectId);
    if (versionId) query = query.eq("curriculum_version_id", versionId);

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "PDFs আনা যায়নি।" },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/curriculum/pdf-sources
 * 
 * Register a PDF source in database
 * Body:
 *   - class_id: string (UUID)
 *   - subject_id: string (UUID)
 *   - file_name: string
 *   - file_size: number
 *   - storage_path: string (e.g., "class-1/bangla.pdf")
 *   - page_count: number (optional)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const body = await req.json();
    const {
      class_id,
      subject_id,
      file_name,
      file_size,
      storage_path,
      page_count,
      curriculum_version_id,
    } = body;

    // Validation
    if (!class_id || !subject_id || !file_name || !file_size || !storage_path) {
      return NextResponse.json(
        {
          error: "class_id, subject_id, file_name, file_size, storage_path আবশ্যক।",
        },
        { status: 400 }
      );
    }

    if (file_size > 52_428_800) {
      return NextResponse.json(
        { error: "ফাইলের সাইজ 50MB-এর বেশি।" },
        { status: 413 }
      );
    }

    // Save to database
    const { data, error } = await auth.supabase
      .from("curriculum_sources")
      .insert({
        class_id,
        subject_id,
        curriculum_version_id: curriculum_version_id || null,
        file_name,
        file_size,
        storage_path,
        page_count: page_count || null,
        source_status: "uploaded",
        workflow_status: "draft",
        created_by: auth.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "PDF metadata save করা যায়নি।" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
