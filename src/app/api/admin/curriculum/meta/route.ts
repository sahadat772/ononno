import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { createServiceRoleClient } from "@/lib/supabase-admin";

/**
 * GET /api/admin/curriculum/meta
 * Classes + subjects for import / admin pickers (service role when available).
 */
export async function GET() {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;

  let db = auth.supabase;
  try {
    db = createServiceRoleClient();
  } catch {
    // session client
  }

  const [classesRes, subjectsRes] = await Promise.all([
    db
      .from("curriculum_classes")
      .select("id, name, class_number, is_active")
      .order("class_number", { ascending: true }),
    db
      .from("curriculum_subjects")
      .select("id, name, name_bn, class_id, is_active")
      .order("name", { ascending: true }),
  ]);

  if (classesRes.error || subjectsRes.error) {
    console.error("[curriculum/meta]", classesRes.error, subjectsRes.error);
    return NextResponse.json(
      {
        error: "META_LOAD_FAILED",
        message: "Class/subject load করা যায়নি।",
        details: classesRes.error?.message || subjectsRes.error?.message,
      },
      { status: 500 },
    );
  }

  const classes = (classesRes.data ?? [])
    .filter((c) => c.is_active !== false)
    .map((c) => ({
      id: String(c.id),
      name: c.name,
      class_number: c.class_number,
    }));

  const subjects = (subjectsRes.data ?? [])
    .filter((s) => s.is_active !== false)
    .map((s) => ({
      id: String(s.id),
      name: s.name,
      name_bn: s.name_bn || s.name,
      class_id: s.class_id ? String(s.class_id) : "",
    }));

  return NextResponse.json({ classes, subjects });
}
