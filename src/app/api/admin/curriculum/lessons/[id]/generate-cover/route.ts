import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";
import { createServiceRoleClient } from "@/lib/supabase-admin";
import { CURRICULUM_PDF_BUCKET } from "@/lib/storage/supabase-curriculum-storage";
import {
  buildLessonCoverPrompt,
  generateLessonCoverImage,
} from "@/lib/lesson-cover-image";

type RouteContext = { params: Promise<{ id: string }> };

const COVER_BUCKETS = [CURRICULUM_PDF_BUCKET, "avatars", "free-access-docs"] as const;

function getDb() {
  return createServiceRoleClient();
}

function coverPath(lessonId: string, mimeType: string) {
  const ext = mimeType.includes("svg")
    ? "svg"
    : mimeType.includes("png")
      ? "png"
      : "jpg";
  return `curriculum/media/covers/lesson-${lessonId}.${ext}`;
}

async function uploadCoverBytes(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  lessonId: string,
  bytes: Buffer,
  mimeType: string,
): Promise<{ bucket: string; path: string; url: string | null } | null> {
  const path = coverPath(lessonId, mimeType);
  const contentType = mimeType || "image/jpeg";

  for (const bucket of COVER_BUCKETS) {
    try {
      const { error: upErr } = await db.storage.from(bucket).upload(path, bytes, {
        contentType,
        upsert: true,
      });
      if (upErr) continue;

      const { data: pub } = db.storage.from(bucket).getPublicUrl(path);
      if (pub?.publicUrl) {
        return { bucket, path, url: pub.publicUrl as string };
      }

      const { data: signed } = await db.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      return {
        bucket,
        path: `${bucket}/${path}`,
        url: signed?.signedUrl ?? null,
      };
    } catch {
      /* try next bucket */
    }
  }
  return null;
}

export async function POST(_request: NextRequest, context: RouteContext) {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;

  const rateError = await rateLimit(
    `admin-generate-cover:${auth.user.id}`,
    rateLimitDefaults.adminAI,
  );
  if (rateError) return rateError;

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
    const image = await generateLessonCoverImage(prompt, {
      title,
      subjectName,
      classNumber,
    });

    const uploaded = await uploadCoverBytes(
      db,
      id,
      image.bytes,
      image.mimeType || "image/svg+xml",
    );

    let coverPath = uploaded?.path ?? null;
    let coverUrl = uploaded?.url ?? null;

    // SVG can always be embedded as data URL if storage fails
    if (!coverUrl && image.mimeType.includes("svg")) {
      coverUrl =
        "data:image/svg+xml;base64," +
        Buffer.from(image.bytes).toString("base64");
      coverPath = null;
    }

    if (!coverUrl) {
      return NextResponse.json(
        {
          error: "STORAGE_UPLOAD_FAILED",
          message: "Cover generate হয়েছে কিন্তু URL save হয়নি।",
          model: image.model,
        },
        { status: 500 },
      );
    }

    const coverPatch: Record<string, unknown> = {
      cover_image_path: coverPath,
      cover_image_url: coverUrl,
    };

    if (content) {
      const { error: updErr } = await db
        .from("lesson_contents")
        .update(coverPatch)
        .eq("lesson_id", id);
      if (updErr && /cover_image/i.test(updErr.message)) {
        return NextResponse.json(
          {
            error: "COVER_COLUMNS_MISSING",
            message:
              "lesson_contents-এ cover columns নেই। SQL চালাও: alter table public.lesson_contents add column if not exists cover_image_path text; alter table public.lesson_contents add column if not exists cover_image_url text;",
            cover_image_url: coverUrl,
            model: image.model,
          },
          { status: 500 },
        );
      }
    } else {
      await db.from("lesson_contents").insert({
        lesson_id: id,
        ...coverPatch,
        is_ai_generated: false,
      });
    }

    await audit("GENERATE_LESSON_COVER", auth.user.id, {
      lessonId: id,
      path: coverPath,
      model: image.model,
      classNumber,
      storageOk: Boolean(uploaded),
    });

    return NextResponse.json({
      lessonId: id,
      cover_image_path: coverPath,
      cover_image_url: coverUrl,
      model: image.model,
      storageUploaded: Boolean(uploaded),
      message: uploaded
        ? "Branded cover save হয়েছে।"
        : "Cover data-URL হিসেবে save হয়েছে।",
    });
  } catch (e) {
    console.error("generate-cover error", e);
    return NextResponse.json(
      {
        error: "COVER_IMAGE_GENERATION_FAILED",
        message: "Cover image generate করা যায়নি।",
        details: e instanceof Error ? e.message.slice(0, 600) : String(e),
      },
      { status: 500 },
    );
  }
}
