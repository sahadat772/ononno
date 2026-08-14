import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { validateBody, UpsertLessonContentSchema } from "@/lib/validation";
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
      .from("lesson_contents")
      .select("*")
      .eq("lesson_id", id)
      .maybeSingle();

    if (error) {
      console.error("Lesson content GET error:", error);
      return NextResponse.json(
        { error: "Content আনা যায়নি।" },
        { status: 500 },
      );
    }

    return NextResponse.json(data ?? null);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { id } = await params;

    const body = await validateBody(UpsertLessonContentSchema, req);
    if (body instanceof NextResponse) return body;

    const {
      overview,
      objectives,
      mainContent,
      aiExplanation,
      examples,
      summary,
      referenceLinks,
      aiPrompt,
      extraNotes,
      isAiGenerated,
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

    // Upsert — আগে থাকলে update, না থাকলে insert
    const { data, error } = await auth.supabase
      .from("lesson_contents")
      .upsert(
        {
          lesson_id: id,
          overview,
          objectives: objectives ?? [],
          main_content: mainContent,
          ai_explanation: aiExplanation,
          examples: examples ?? [],
          summary,
          reference_links: referenceLinks ?? [],
          ai_prompt: aiPrompt,
          extra_notes: extraNotes,
          is_ai_generated: isAiGenerated ?? false,
        },
        { onConflict: "lesson_id" },
      )
      .select()
      .single();

    if (error) {
      console.error("Lesson content PUT error:", error);
      return NextResponse.json(
        { error: "Content সংরক্ষণ করা যায়নি।" },
        { status: 500 },
      );
    }

    await audit("UPSERT_LESSON_CONTENT", auth.user.id, {
      lessonId: id,
      title: lesson.title,
      isAiGenerated,
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
