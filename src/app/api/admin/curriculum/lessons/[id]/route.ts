import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { validateBody, UpdateCurriculumLessonSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { id } = await params;

    const { data, error } = await auth.supabase
      .from("curriculum_lessons")
      .select(
        `
                *,
                curriculum_chapters(id, title, title_bn),
                curriculum_subjects(id, name, name_bn),
                curriculum_classes(id, name),
                lesson_contents(*),
                lesson_resources(*)
            `,
      )
      .eq("id", id)
      .maybeSingle();

    if (!data) {
      return NextResponse.json(
        { error: "Lesson পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    if (error) {
      console.error("Lesson GET error:", error);
      return NextResponse.json(
        { error: "Lesson আনা যায়নি।" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { id } = await params;

    const body = await validateBody(UpdateCurriculumLessonSchema, req);
    if (body instanceof NextResponse) return body;

    const {
      title,
      titleBn,
      slug,
      description,
      lessonNumber,
      durationMinutes,
      xpReward,
      coinReward,
      isFreePreview,
      isPublished,
      isActive,
      orderIndex,
    } = body;

    const { data: existing } = await auth.supabase
      .from("curriculum_lessons")
      .select("id, chapter_id")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: "Lesson পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    if (slug) {
      const { data: slugExisting } = await auth.supabase
        .from("curriculum_lessons")
        .select("id")
        .eq("chapter_id", existing.chapter_id)
        .eq("slug", slug)
        .neq("id", id)
        .maybeSingle();

      if (slugExisting) {
        return NextResponse.json(
          { error: "এই slug দিয়ে lesson আগে থেকেই আছে।" },
          { status: 409 },
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (titleBn !== undefined) updateData.title_bn = titleBn;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (lessonNumber !== undefined) updateData.lesson_number = lessonNumber;
    if (durationMinutes !== undefined)
      updateData.duration_minutes = durationMinutes;
    if (xpReward !== undefined) updateData.xp_reward = xpReward;
    if (coinReward !== undefined) updateData.coin_reward = coinReward;
    if (isFreePreview !== undefined) updateData.is_free_preview = isFreePreview;
    if (isPublished !== undefined) updateData.is_published = isPublished;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (orderIndex !== undefined) updateData.order_index = orderIndex;

    const { data, error } = await auth.supabase
      .from("curriculum_lessons")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Lesson PATCH error:", error);
      return NextResponse.json(
        { error: "Lesson আপডেট করা যায়নি।" },
        { status: 500 },
      );
    }

    await audit("UPDATE_LESSON", auth.user.id, { id, ...updateData });

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
      .from("curriculum_lessons")
      .select("id, title")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: "Lesson পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    // Soft delete + fully remove from student catalog
    const { error } = await auth.supabase
      .from("curriculum_lessons")
      .update({
        is_active: false,
        is_published: false,
        workflow_status: "archived",
      })
      .eq("id", id);

    if (error) {
      console.error("Lesson DELETE error:", error);
      return NextResponse.json(
        { error: "Lesson মুছে ফেলা যায়নি।", details: error.message },
        { status: 500 },
      );
    }

    await audit("DELETE_LESSON", auth.user.id, {
      id,
      title: existing.title,
      unpublished: true,
      archived: true,
    });

    return NextResponse.json({
      message: "Lesson মুছে ফেলা হয়েছে (unpublished + archived)।",
      id,
      is_active: false,
      is_published: false,
      workflow_status: "archived",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
