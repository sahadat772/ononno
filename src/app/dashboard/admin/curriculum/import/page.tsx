import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceRoleClient } from "@/lib/supabase-admin";
import PdfPipelineClient from "./PdfPipelineClient";

export const dynamic = "force-dynamic";

/**
 * Curriculum import:
 * 1) Class → Subject → Create folder (Drive/Supabase path)
 * 2) Admin places PDF manually in that folder
 * 3) Refresh catalog → Extract + Commit → Lessons AI
 */
export default async function ImportPage() {
  const auth = await createServerSupabaseClient();

  let db = auth;
  try {
    db = createServiceRoleClient() as typeof auth;
  } catch {
    // session client fallback
  }

  const [subjectsRes, classesRes, sourcesRes] = await Promise.all([
    db
      .from("curriculum_subjects")
      .select("id, name, name_bn, class_id, is_active")
      .order("name", { ascending: true }),
    db
      .from("curriculum_classes")
      .select("id, name, class_number, is_active")
      .order("class_number", { ascending: true }),
    db
      .from("curriculum_sources")
      .select(
        "id, title, file_name, class_id, subject_id, storage_path, storage_provider, source_status, workflow_status, extracted_structure",
      )
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const classes = (classesRes.data ?? []).filter((c) => c.is_active !== false);
  const subjects = (subjectsRes.data ?? []).filter((s) => s.is_active !== false);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <PdfPipelineClient
        classes={classes.map((c) => ({
          id: String(c.id),
          name: c.name,
          class_number: c.class_number,
        }))}
        subjects={subjects.map((s) => ({
          id: String(s.id),
          name: s.name,
          name_bn: s.name_bn,
          class_id: s.class_id ? String(s.class_id) : "",
        }))}
        initialSources={(sourcesRes.data ?? []).map((s) => ({
          ...s,
          id: String(s.id),
          class_id: s.class_id ? String(s.class_id) : undefined,
          subject_id: s.subject_id ? String(s.subject_id) : undefined,
        }))}
      />
    </main>
  );
}
