import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { validateBody, CreateCurriculumSubjectSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("class_id");

    let query = auth.supabase
      .from("curriculum_subjects")
      .select("*, curriculum_classes(id, name)")
      .order("order_index", { ascending: true });

    if (classId) {
      query = query.eq("class_id", classId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Subjects GET error:", error);
      return NextResponse.json(
        { error: "Subject তালিকা আনা যায়নি।" },
        { status: 500 },
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const rateError = await rateLimit(
      `admin-create-subject:${auth.user.id}`,
      rateLimitDefaults.adminAI,
    );
    if (rateError) return rateError;

    const body = await validateBody(CreateCurriculumSubjectSchema, req);
    if (body instanceof NextResponse) return body;

    const {
      classId,
      name,
      nameBn,
      slug,
      description,
      icon,
      color,
      thumbnailUrl,
      isMandatory,
      orderIndex,
    } = body;

    // Duplicate check
    const { data: existing } = await auth.supabase
      .from("curriculum_subjects")
      .select("id")
      .eq("class_id", classId)
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "এই slug দিয়ে subject আগে থেকেই আছে।" },
        { status: 409 },
      );
    }

    const { data, error } = await auth.supabase
      .from("curriculum_subjects")
      .insert({
        class_id: classId,
        name,
        name_bn: nameBn,
        slug,
        description,
        icon,
        color,
        thumbnail_url: thumbnailUrl,
        is_mandatory: isMandatory ?? true,
        order_index: orderIndex ?? 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Subject POST error:", error);
      return NextResponse.json(
        { error: "Subject তৈরি করা যায়নি।" },
        { status: 500 },
      );
    }

    await audit("CREATE_SUBJECT", auth.user.id, { name, slug, classId });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
