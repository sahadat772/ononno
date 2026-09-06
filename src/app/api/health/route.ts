import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Lightweight production health probe — no secrets, no DB required.
 */
export async function GET() {
  const required = ["NEXT_PUBLIC_SUPABASE_URL", "GEMINI_API_KEY"] as const;

  const missing = required.filter((k) => !process.env[k]?.trim());

  const hasSupabaseKey = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
  if (!hasSupabaseKey) {
    missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" as never);
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
        google_drive_ready: driveReady,
        has_service_role: Boolean(
          process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
        ),
        cover_provider: process.env.COVER_IMAGE_PROVIDER || "branded",
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
