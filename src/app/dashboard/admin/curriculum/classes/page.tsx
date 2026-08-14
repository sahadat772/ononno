import { createServerSupabaseClient } from "@/lib/supabase-server";
import ClassesClient from "./ClassesClient";

export default async function ClassesPage() {
    const supabase = await createServerSupabaseClient();

    const { data: classes, error } = await supabase
        .from("curriculum_classes")
        .select(`
            *,
            curriculum_versions(name)
        `)
        .order("class_number", { ascending: true });

    if (error) {
        return (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
                <h2 className="text-xl font-bold text-red-400">
                    Failed to load classes
                </h2>

                <p className="text-red-300 mt-2">
                    {error.message}
                </p>
            </div>
        );
    }

    return (
        <ClassesClient
            classes={classes ?? []}
        />
    );
}