import { createServerSupabaseClient } from "@/lib/supabase-server";
import PdfPipelineClient from "./PdfPipelineClient";

/**
 * Curriculum import — blueprint pipeline only:
 * PDF → Structure → Chapter → Lesson → Study → Review → Publish
 *
 * Legacy syllabus-image ImportClient intentionally not mounted.
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
          "id, title, file_name, source_status, workflow_status, extracted_structure",
        )
        .order("created_at", { ascending: false })
        .limit(20),
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
