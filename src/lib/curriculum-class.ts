import { createServerSupabaseClient } from "@/lib/supabase-server";

export interface CurriculumClass {
  id: string;
  version_id: string;
  slug: string;
  name: string;
  class_number: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Get all classes of a curriculum version
export async function getClasses(versionId: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("curriculum_classes")
    .select("*")
    .eq("version_id", versionId)
    .order("class_number");

  if (error) throw error;

  return (data ?? []) as CurriculumClass[];
}

// Get one class
export async function getClass(id: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("curriculum_classes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data as CurriculumClass;
}

// Create class
export async function createClass(
  values: Omit<CurriculumClass, "id" | "created_at" | "updated_at">
) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("curriculum_classes")
    .insert(values)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// Update class
export async function updateClass(
  id: string,
  values: Partial<CurriculumClass>
) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("curriculum_classes")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// Delete class
export async function deleteClass(id: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("curriculum_classes")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}