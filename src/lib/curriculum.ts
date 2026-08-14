import { createServerSupabaseClient } from "@/lib/supabase-server";
import { CurriculumVersion, VersionStatus } from "@/types/curriculum";

export async function getVersions(): Promise<CurriculumVersion[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("curriculum_versions")
    .select("*")
    .order("year", { ascending: false });

  if (error) throw error;

  return (data ?? []) as CurriculumVersion[];
}

export async function createVersion(
  version: Omit<CurriculumVersion, "id" | "createdAt" | "updatedAt">,
) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("curriculum_versions")
    .insert({
      slug: version.slug,
      name: version.name,
      year: version.year,
      description: version.description,
      status: version.status,
      is_active: version.isActive,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateVersion(
  id: string,
  values: Partial<CurriculumVersion>,
) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("curriculum_versions")
    .update({
      slug: values.slug,
      name: values.name,
      year: values.year,
      description: values.description,
      status: values.status,
      is_active: values.isActive,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteVersion(id: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("curriculum_versions")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}

export async function publishVersion(id: string) {
  return updateVersion(id, {
    status: "published",
  });
}

export async function archiveVersion(id: string) {
  return updateVersion(id, {
    status: "archived",
    isActive: false,
  });
}

export async function setActiveVersion(id: string) {
  const supabase = await createServerSupabaseClient();

  const { error: resetError } = await supabase
    .from("curriculum_versions")
    .update({
      is_active: false,
    })
    .neq("id", "");

  if (resetError) throw resetError;

  const { error } = await supabase
    .from("curriculum_versions")
    .update({
      is_active: true,
      status: "published",
    })
    .eq("id", id);

  if (error) throw error;

  return true;
}
export async function getActiveVersion(): Promise<CurriculumVersion | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("curriculum_versions")
    .select("*")
    .eq("is_active", true)
    .single();

  if (error) return null;

  return data as CurriculumVersion;
}

export async function getVersionCount() {
  const versions = await getVersions();

  return {
    total: versions.length,
    published: versions.filter((v) => v.status === "published").length,
    archived: versions.filter((v) => v.status === "archived").length,
    draft: versions.filter((v) => v.status === "draft").length,
    active: versions.filter((v) => v.isActive).length,
  };
}
