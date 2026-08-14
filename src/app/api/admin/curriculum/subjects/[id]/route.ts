import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { validateBody, UpdateCurriculumSubjectSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { id } = await params;

    const body = await validateBody(UpdateCurriculumSubjectSchema, req);
    if (body instanceof NextResponse) return body;

    const {
      name,
      nameBn,
      slug,
      description,
      icon,
      color,
      thumbnailUrl,
      isMandatory,
      isActive,
      orderIndex,
    } = body;

    // Subject আছে কিনা check
    const { data: existing } = await auth.supabase
      .from("curriculum_subjects")
      .select("id, class_id")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: "Subject পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    // Slug duplicate check (নিজেকে বাদ দিয়ে)
    if (slug) {
      const { data: slugExisting } = await auth.supabase
        .from("curriculum_subjects")
        .select("id")
        .eq("class_id", existing.class_id)
        .eq("slug", slug)
        .neq("id", id)
        .maybeSingle();

      if (slugExisting) {
        return NextResponse.json(
          { error: "এই slug দিয়ে subject আগে থেকেই আছে।" },
          { status: 409 },
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (nameBn !== undefined) updateData.name_bn = nameBn;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (thumbnailUrl !== undefined) updateData.thumbnail_url = thumbnailUrl;
    if (isMandatory !== undefined) updateData.is_mandatory = isMandatory;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (orderIndex !== undefined) updateData.order_index = orderIndex;

    const { data, error } = await auth.supabase
      .from("curriculum_subjects")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Subject PATCH error:", error);
      return NextResponse.json(
        { error: "Subject আপডেট করা যায়নি।" },
        { status: 500 },
      );
    }

    await audit("UPDATE_SUBJECT", auth.user.id, { id, ...updateData });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { id } = await params;

    const { data: existing } = await auth.supabase
      .from("curriculum_subjects")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: "Subject পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    // Soft delete
    const { error } = await auth.supabase
      .from("curriculum_subjects")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      console.error("Subject DELETE error:", error);
      return NextResponse.json(
        { error: "Subject মুছে ফেলা যায়নি।" },
        { status: 500 },
      );
    }

    await audit("DELETE_SUBJECT", auth.user.id, { id, name: existing.name });

    return NextResponse.json({ message: "Subject মুছে ফেলা হয়েছে।" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
