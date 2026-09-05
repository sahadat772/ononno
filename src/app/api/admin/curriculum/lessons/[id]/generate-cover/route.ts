import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";
import { createServiceRoleClient } from "@/lib/supabase-admin";
import { CURRICULUM_PDF_BUCKET } from "@/lib/storage/supabase-curriculum-storage";
import {
  buildLessonCoverPrompt,
  coverStoragePath,
  generateLessonCoverImage,
} from "@/lib/lesson-cover-image";

type RouteContext = { params: Promise<{ id: string }> };

function getDb() {
  return createServiceRoleClient();
}

/**
 * POST /api/admin/curriculum/lessons/[id]/generate-cover
 * Generates educational cover image for a lesson (Slice B).
 */
export async function POST(_request: NextRequest, context: RouteContext) {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;

  const rateError = await rateLimit(
    `admin-generate-cover:${auth.user.id}`,
    rateLimitDefaults.adminAI,
  );
  if (rateError) return rateError;

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      {
        error: "GEMINI_CONFIGURATION_ERROR",
        message: "GEMINI_API_KEY configured নেই।",
      },
      { status: 500 },
    );
  }

  const { id } = await context.params;
  let db;
  try {
    db = getDb();
  } catch {
    db = auth.supabase as ReturnType<typeof getDb>;
  }

  const { data: lesson, error: lessonErr } = await db
    .from("curriculum_lessons")
    .select("id, title, title_bn, class_id, subject_id")
    .eq("id", id)
    .maybeSingle();

  if (lessonErr || !lesson) {
    return NextResponse.json(
      { error: "SOURCE_NOT_FOUND", message: "Lesson পাওয়া যায়নি।" },
      { status: 404 },
    );
  }

  const { data: content } = await db
    .from("lesson_contents")
    .select("overview, main_content, cover_image_path")
    .eq("lesson_id", id)
    .maybeSingle();

  let classNumber: number | null = null;
  if (lesson.class_id) {
    const { data: cls } = await db
      .from("curriculum_classes")
      .select("class_number")
      .eq("id", lesson.class_id)
      .maybeSingle();
    classNumber = (cls?.class_number as number) ?? null;
  }

  let subjectName: string | null = null;
  if (lesson.subject_id) {
    const { data: sub } = await db
      .from("curriculum_subjects")
      .select("name, name_bn")
      .eq("id", lesson.subject_id)
      .maybeSingle();
    subjectName = (sub?.name_bn as string) || (sub?.name as string) || null;
  }

  const title =
    (lesson.title_bn as string) || (lesson.title as string) || "পাঠ";

  const prompt = buildLessonCoverPrompt({
    title,
    overview: content?.overview ?? content?.main_content ?? null,
    classNumber,
    subjectName,
  });

  try {
    const image = await generateLessonCoverImage(prompt);
    const path = coverStoragePath(id);

    const { error: upErr } = await db.storage
      .from(CURRICULUM_PDF_BUCKET)
      .upload(path, image.bytes, {
        contentType: image.mimeType || "image/png",
        upsert: true,
      });

    if (upErr) {
      return NextResponse.json(
        {
          error: "STORAGE_UPLOAD_FAILED",
          message: "Cover image storage-এ upload হয়নি।",
          details: upErr.message,
        },
        { status: 500 },
      );
    }

    const { data: signed } = await db.storage
      .from(CURRICULUM_PDF_BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 365);

    const coverUrl = signed?.signedUrl ?? null;

    const coverPatch: Record<string, unknown> = {
      cover_image_path: path,
      cover_image_url: coverUrl,
    };

    if (content) {
      const { error: updErr } = await db
        .from("lesson_contents")
        .update(coverPatch)
        .eq("lesson_id", id);
      if (updErr) {
        console.warn("[generate-cover] content update", updErr.message);
      }
    } else {
      const { error: insErr } = await db.from("lesson_contents").insert({
        lesson_id: id,
        ...coverPatch,
        is_ai_generated: false,
      });
      if (insErr) {
        console.warn("[generate-cover] content insert", insErr.message);
      }
    }

    await audit("GENERATE_LESSON_COVER", auth.user.id, {
      lessonId: id,
      path,
      model: image.model,
      classNumber,
    });

    return NextResponse.json({
      lessonId: id,
      cover_image_path: path,
      cover_image_url: coverUrl,
      model: image.model,
      message: "Cover image তৈরি হয়েছে।",
    });
  } catch (e) {
    console.error("generate-cover error", e);
    return NextResponse.json(
      {
        error: "COVER_IMAGE_GENERATION_FAILED",
        message:
          "Cover image generate করা যায়নি। Gemini image model (gemini-3.1-flash-image) key-এ available কিনা চেক করো।",
        details: e instanceof Error ? e.message.slice(0, 600) : String(e),
      },
      { status: 500 },
    );
  }
}
