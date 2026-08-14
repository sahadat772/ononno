import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { validateBody, UpdateLessonResourceSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; resourceId: string }> },
) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { id, resourceId } = await params;

    const body = await validateBody(UpdateLessonResourceSchema, req);
    if (body instanceof NextResponse) return body;

    const {
      type,
      title,
      titleBn,
      content,
      url,
      durationMinutes,
      isAiGenerated,
      isActive,
      orderIndex,
    } = body;

    // Resource আছে কিনা check
    const { data: existing } = await auth.supabase
      .from("lesson_resources")
      .select("id, title")
      .eq("id", resourceId)
      .eq("lesson_id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: "Resource পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    const updateData: Record<string, unknown> = {};
    if (type !== undefined) updateData.type = type;
    if (title !== undefined) updateData.title = title;
    if (titleBn !== undefined) updateData.title_bn = titleBn;
    if (content !== undefined) updateData.content = content;
    if (url !== undefined) updateData.url = url;
    if (durationMinutes !== undefined)
      updateData.duration_minutes = durationMinutes;
    if (isAiGenerated !== undefined) updateData.is_ai_generated = isAiGenerated;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (orderIndex !== undefined) updateData.order_index = orderIndex;

    const { data, error } = await auth.supabase
      .from("lesson_resources")
      .update(updateData)
      .eq("id", resourceId)
      .eq("lesson_id", id)
      .select()
      .single();

    if (error) {
      console.error("Resource PATCH error:", error);
      return NextResponse.json(
        { error: "Resource আপডেট করা যায়নি।" },
        { status: 500 },
      );
    }

    await audit("UPDATE_LESSON_RESOURCE", auth.user.id, {
      lessonId: id,
      resourceId,
      ...updateData,
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; resourceId: string }> },
) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { id, resourceId } = await params;

    const { data: existing } = await auth.supabase
      .from("lesson_resources")
      .select("id, title")
      .eq("id", resourceId)
      .eq("lesson_id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: "Resource পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    // Soft delete
    const { error } = await auth.supabase
      .from("lesson_resources")
      .update({ is_active: false })
      .eq("id", resourceId)
      .eq("lesson_id", id);

    if (error) {
      console.error("Resource DELETE error:", error);
      return NextResponse.json(
        { error: "Resource মুছে ফেলা যায়নি।" },
        { status: 500 },
      );
    }

    await audit("DELETE_LESSON_RESOURCE", auth.user.id, {
      lessonId: id,
      resourceId,
      title: existing.title,
    });

    return NextResponse.json({ message: "Resource মুছে ফেলা হয়েছে।" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
