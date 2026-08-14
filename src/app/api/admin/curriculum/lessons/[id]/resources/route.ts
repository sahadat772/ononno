import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { validateBody, CreateLessonResourceSchema } from "@/lib/validation";
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
      .from("lesson_resources")
      .select("*")
      .eq("lesson_id", id)
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Resources GET error:", error);
      return NextResponse.json(
        { error: "Resources আনা যায়নি।" },
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { id } = await params;

    const body = await validateBody(CreateLessonResourceSchema, req);
    if (body instanceof NextResponse) return body;

    const {
      type,
      title,
      titleBn,
      content,
      url,
      durationMinutes,
      isAiGenerated,
      orderIndex,
    } = body;

    // Lesson আছে কিনা check
    const { data: lesson } = await auth.supabase
      .from("curriculum_lessons")
      .select("id, title")
      .eq("id", id)
      .maybeSingle();

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    const { data, error } = await auth.supabase
      .from("lesson_resources")
      .insert({
        lesson_id: id,
        type,
        title,
        title_bn: titleBn,
        content: content ?? {},
        url,
        duration_minutes: durationMinutes,
        is_ai_generated: isAiGenerated ?? false,
        is_active: true,
        order_index: orderIndex ?? 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Resource POST error:", error);
      return NextResponse.json(
        { error: "Resource তৈরি করা যায়নি।" },
        { status: 500 },
      );
    }

    await audit("CREATE_LESSON_RESOURCE", auth.user.id, {
      lessonId: id,
      type,
      title,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
