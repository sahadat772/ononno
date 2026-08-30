import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/api-auth";
import { createCurriculumStorage } from "@/lib/storage";

const ParamsSchema = z.object({
  sourceId: z.string().uuid(),
});

/**
 * GET /api/admin/curriculum/sources/[sourceId]
 * Phase 1 — source catalog detail (admin only).
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ sourceId: string }> },
) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const rawParams = await context.params;
    const parsed = ParamsSchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "STRUCTURE_VALIDATION_FAILED", message: "Invalid sourceId." },
        { status: 400 },
      );
    }

    const { sourceId } = parsed.data;

    const { data, error } = await auth.supabase
      .from("curriculum_sources")
      .select(
        `*,
        curriculum_classes(id, name, class_number, slug),
        curriculum_subjects(id, name, name_bn, slug)`,
      )
      .eq("id", sourceId)
      .maybeSingle();

    if (error) {
      console.error("source detail error:", error);
      return NextResponse.json(
        { error: "SOURCE_NOT_FOUND", message: "Source আনা যায়নি।" },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "SOURCE_NOT_FOUND", message: "Source পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    let storageExists: boolean | null = null;
    if (data.storage_path && data.storage_provider === "supabase") {
      try {
        const storage = createCurriculumStorage(auth.supabase, "supabase");
        storageExists = await storage.exists(data.storage_path);
      } catch {
        storageExists = null;
      }
    }

    return NextResponse.json({
      ...data,
      storage_exists: storageExists,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
