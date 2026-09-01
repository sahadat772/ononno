import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const ActionSchema = z.object({
  action: z.enum(["start", "pause", "resume", "heartbeat", "complete", "abandon"]),
  /** Client-reported seconds to add on heartbeat (capped) */
  delta_seconds: z.number().int().min(0).max(120).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

async function getOwnedSession(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
  sessionId: string,
) {
  const { data, error } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("student_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const session = await getOwnedSession(supabase, user.id, id);
  if (!session) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const { data: items } = await supabase
    .from("study_session_items")
    .select("*")
    .eq("session_id", id)
    .order("position", { ascending: true });

  return NextResponse.json({ session, items: items ?? [] });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const raw = await req.json().catch(() => ({}));
  const parsed = ActionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_BODY", message: "action required" },
      { status: 400 },
    );
  }

  const session = await getOwnedSession(supabase, user.id, id);
  if (!session) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const action = parsed.data.action;
  let patch: Record<string, unknown> = { updated_at: now };

  switch (action) {
    case "start": {
      if (session.status === "completed") {
        return NextResponse.json(
          { error: "ALREADY_COMPLETED" },
          { status: 400 },
        );
      }
      patch = {
        ...patch,
        status: "active",
        started_at: session.started_at ?? now,
        last_heartbeat_at: now,
      };
      // Mark first pending item active
      await supabase
        .from("study_session_items")
        .update({ status: "active", started_at: now })
        .eq("session_id", id)
        .eq("status", "pending")
        .eq("position", 0);
      break;
    }
    case "pause": {
      if (session.status !== "active") {
        return NextResponse.json({ error: "NOT_ACTIVE" }, { status: 400 });
      }
      patch = { ...patch, status: "paused", last_heartbeat_at: now };
      break;
    }
    case "resume": {
      if (session.status !== "paused" && session.status !== "planned") {
        return NextResponse.json({ error: "NOT_PAUSED" }, { status: 400 });
      }
      patch = {
        ...patch,
        status: "active",
        started_at: session.started_at ?? now,
        last_heartbeat_at: now,
      };
      break;
    }
    case "heartbeat": {
      if (session.status !== "active") {
        return NextResponse.json({
          session,
          skipped: true,
          message: "not active",
        });
      }
      const delta = parsed.data.delta_seconds ?? 15;
      const next = (session.actual_seconds ?? 0) + delta;
      patch = {
        ...patch,
        actual_seconds: next,
        last_heartbeat_at: now,
      };
      break;
    }
    case "complete": {
      patch = {
        ...patch,
        status: "completed",
        completed_at: now,
        last_heartbeat_at: now,
      };
      await supabase
        .from("study_session_items")
        .update({ status: "completed", completed_at: now })
        .eq("session_id", id)
        .in("status", ["pending", "active"]);
      break;
    }
    case "abandon": {
      patch = {
        ...patch,
        status: "abandoned",
        completed_at: now,
        last_heartbeat_at: now,
      };
      break;
    }
    default:
      return NextResponse.json({ error: "UNKNOWN_ACTION" }, { status: 400 });
  }

  const { data: updated, error } = await supabase
    .from("study_sessions")
    .update(patch)
    .eq("id", id)
    .eq("student_id", user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "UPDATE_FAILED", message: error.message },
      { status: 500 },
    );
  }

  const { data: items } = await supabase
    .from("study_session_items")
    .select("*")
    .eq("session_id", id)
    .order("position", { ascending: true });

  return NextResponse.json({
    session: updated,
    items: items ?? [],
    action,
  });
}
