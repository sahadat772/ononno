import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Lightweight production health probe — no secrets, no DB required.
 * Step 3 soft-launch hardening: clearer checks for ops / uptime monitors.
 */
export async function GET() {
  const required = ["NEXT_PUBLIC_SUPABASE_URL"] as const;
  const missing = required.filter((k) => !process.env[k]?.trim()) as string[];

  const hasSupabaseKey = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
  if (!hasSupabaseKey) {
    missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  const hasAiKey = Boolean(
    process.env.GROQ_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim(),
  );
  if (!hasAiKey) {
    missing.push("GROQ_API_KEY_or_GEMINI_API_KEY");
  }

  const storage = (
    process.env.CURRICULUM_STORAGE_PROVIDER || "supabase"
  ).toLowerCase();
  const driveReady =
    storage !== "google_drive" ||
    Boolean(
      process.env.GOOGLE_DRIVE_CLIENT_EMAIL?.trim() &&
        process.env.GOOGLE_DRIVE_PRIVATE_KEY?.trim() &&
        process.env.GOOGLE_DRIVE_FOLDER_ID?.trim(),
    );

  const hasAppUrl = Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim());
  const hasServiceRole = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );

  const ok = missing.length === 0 && driveReady;

  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      service: "ononno",
      phase: "soft_launch",
      time: new Date().toISOString(),
      storage_provider: storage,
      app_url: process.env.NEXT_PUBLIC_APP_URL || null,
      checks: {
        env_required: missing.length === 0,
        missing_env: missing,
        supabase_public_key: hasSupabaseKey,
        supabase_service_role: hasServiceRole,
        ai_provider: process.env.GROQ_API_KEY?.trim()
          ? "groq"
          : process.env.GEMINI_API_KEY?.trim()
            ? "gemini"
            : "none",
        google_drive_ready: driveReady,
        app_url_set: hasAppUrl,
        cover_provider: process.env.COVER_IMAGE_PROVIDER || "branded",
        payment_mode: "manual",
        curriculum_unlock_threshold_pct: 60,
      },
    },
    {
      status: ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
