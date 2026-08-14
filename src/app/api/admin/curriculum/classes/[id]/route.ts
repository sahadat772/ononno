import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import { validateBody, UpdateCurriculumClassSchema } from "@/lib/validation";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// UPDATE
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { id } = await params;

    const body = await validateBody(UpdateCurriculumClassSchema, req);

    if (body instanceof NextResponse) return body;

    const { name, slug, classNumber, description, isActive } = body;

    const { data, error } = await auth.supabase
      .from("curriculum_classes")
      .update({
        name,
        slug,
        class_number: classNumber,
        description,
        is_active: isActive,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await audit("curriculum_class_updated", auth.user.id, {
      classId: id,
    });

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { id } = await params;

    const { error } = await auth.supabase
      .from("curriculum_classes")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await audit("curriculum_class_deleted", auth.user.id, {
      classId: id,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
