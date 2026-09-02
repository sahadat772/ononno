import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceRoleClient } from "@/lib/supabase-admin";
import { CURRICULUM_PDF_BUCKET } from "@/lib/storage/supabase-curriculum-storage";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/student/lessons/[id]/cover
 * Returns signed URL for published lesson cover (if any).
 */
export async function GET(_req: Request, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await context.params;

  const { data: lesson } = await supabase
    .from("curriculum_lessons")
    .select("id, is_published")
    .eq("id", id)
    .maybeSingle();

  if (!lesson?.is_published) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Published lesson নেই।" },
      { status: 404 },
    );
  }

  const { data: content } = await supabase
    .from("lesson_contents")
    .select("cover_image_path, cover_image_url")
    .eq("lesson_id", id)
    .maybeSingle();

  if (!content?.cover_image_path && !content?.cover_image_url) {
    return NextResponse.json({ cover_url: null });
  }

  if (content.cover_image_path) {
    try {
      const db = createServiceRoleClient();
      const { data: signed } = await db.storage
        .from(CURRICULUM_PDF_BUCKET)
        .createSignedUrl(content.cover_image_path, 3600);
      if (signed?.signedUrl) {
        return NextResponse.json({
          cover_url: signed.signedUrl,
          path: content.cover_image_path,
        });
      }
    } catch {
      /* fall through */
    }
  }

  return NextResponse.json({
    cover_url: content.cover_image_url ?? null,
    path: content.cover_image_path ?? null,
  });
}
