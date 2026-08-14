import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { validateBody, CreateCurriculumClassSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";

export async function GET() {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { data, error } = await auth.supabase
      .from("curriculum_classes")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Get Classes Error:", error);

      return NextResponse.json(
        { error: "Class তালিকা আনা যায়নি।" },
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
      `admin-create-class:${auth.user.id}`,
      rateLimitDefaults.adminAI,
    );

    if (rateError) return rateError;

    const body = await validateBody(CreateCurriculumClassSchema, req);

    if (body instanceof NextResponse) return body;

    const { versionId, name, slug, classNumber, description, isActive } = body;

    // Duplicate Check
    const { data: existing } = await auth.supabase
      .from("curriculum_classes")
      .select("id")
      .eq("version_id", versionId)
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error: "এই Curriculum Class ইতোমধ্যে বিদ্যমান।",
        },
        { status: 409 },
      );
    }

    const { data, error } = await auth.supabase
      .from("curriculum_classes")
      .insert({
        version_id: versionId,
        name,
        slug,
        class_number: classNumber,
        description: description ?? "",
        is_active: isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("Create Class Error:", error);

      return NextResponse.json(
        { error: "Class তৈরি করা যায়নি।" },
        { status: 500 },
      );
    }

    await audit("curriculum_class_created", auth.user.id, {
      classId: data.id,
      className: data.name,
      slug: data.slug,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
