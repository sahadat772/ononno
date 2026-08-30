import { createServerSupabaseClient } from "@/lib/supabase-server";
import PdfPipelineClient from "./PdfPipelineClient";

/**
 * Curriculum import — catalog first (no PDF upload UI).
 * Class → Subject → existing source → Structure → Commit → Lessons AI
 */
export default async function ImportPage() {
  const supabase = await createServerSupabaseClient();

  const [{ data: subjects }, { data: classes }, { data: sources }] =
    await Promise.all([
      supabase
        .from("curriculum_subjects")
        .select("id, name, name_bn, class_id")
        .eq("is_active", true)
        .order("order_index", { ascending: true }),
      supabase
        .from("curriculum_classes")
        .select("id, name, class_number")
        .eq("is_active", true)
        .order("class_number", { ascending: true }),
      supabase
        .from("curriculum_sources")
        .select(
          "id, title, file_name, class_id, subject_id, storage_path, storage_provider, source_status, workflow_status, extracted_structure",
        )
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <PdfPipelineClient
        classes={classes ?? []}
        subjects={subjects ?? []}
        initialSources={sources ?? []}
      />
    </main>
  );
}
