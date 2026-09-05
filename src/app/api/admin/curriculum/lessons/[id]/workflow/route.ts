import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { audit } from "@/lib/audit";

type RouteContext = { params: Promise<{ id: string }> };
type Action =
  | "review"
  | "approve"
  | "publish"
  | "return_to_review"
  | "restore";

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const action = body.action as Action;

    if (
      !(
        ["review", "approve", "publish", "return_to_review", "restore"] as const
      ).includes(action)
    ) {
      return NextResponse.json(
        { error: "Invalid workflow action." },
        { status: 400 },
      );
    }

    const { data: lesson, error } = await auth.supabase
      .from("curriculum_lessons")
      .select("id, title, workflow_status, is_published, is_active")
      .eq("id", id)
      .maybeSingle();

    if (error || !lesson) {
      return NextResponse.json(
        { error: "Lesson পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    const current = lesson.workflow_status ?? "draft";

    // Restore archived / inactive lesson → reviewed (ready to generate)
    if (action === "restore") {
      if (current !== "archived" && lesson.is_active !== false) {
        return NextResponse.json(
          {
            error: `শুধু archived/inactive lesson restore করা যায় (এখন: ${current}).`,
          },
          { status: 409 },
        );
      }
      const { data, error: updateError } = await auth.supabase
        .from("curriculum_lessons")
        .update({
          is_active: true,
          is_published: false,
          workflow_status: "reviewed",
        })
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;

      await audit("LESSON_WORKFLOW_RESTORE", auth.user.id, {
        id,
        title: lesson.title,
        from: current,
        to: "reviewed",
      });
      return NextResponse.json(data);
    }

    const next: Record<Exclude<Action, "restore">, string> = {
      review: "reviewed",
      approve: "approved",
      publish: "published",
      return_to_review: "reviewed",
    };
    const allowed: Record<Exclude<Action, "restore">, string[]> = {
      review: ["extracted", "draft", "generated", "archived"],
      approve: ["generated"],
      publish: ["approved"],
      return_to_review: ["approved", "published", "generated"],
    };

    if (!allowed[action].includes(current)) {
      return NextResponse.json(
        { error: `বর্তমান অবস্থায় (${current}) এই action করা যাবে না।` },
        { status: 409 },
      );
    }

    const update: Record<string, unknown> = {
      workflow_status: next[action],
    };
    if (action === "approve") {
      update.approved_by = auth.user.id;
      update.approved_at = new Date().toISOString();
    }
    if (action === "publish") update.is_published = true;
    if (action === "return_to_review") update.is_published = false;
    if (action === "review" && current === "archived") {
      update.is_active = true;
      update.is_published = false;
    }

    const { data, error: updateError } = await auth.supabase
      .from("curriculum_lessons")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (updateError) throw updateError;

    await audit("LESSON_WORKFLOW_" + action.toUpperCase(), auth.user.id, {
      id,
      title: lesson.title,
      from: current,
      to: next[action],
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Lesson workflow error:", error);
    return NextResponse.json(
      { error: "Lesson workflow update করা যায়নি।" },
      { status: 500 },
    );
  }
}
