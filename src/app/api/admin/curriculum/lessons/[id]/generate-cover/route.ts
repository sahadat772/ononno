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
  const ext = mimeType.includes("png") ? "png" : "jpg";
  return `curriculum/media/covers/lesson-${lessonId}.${ext}`;
}

/**
 * Try multiple buckets — curriculum-pdfs often blocks non-PDF mime types.
 */
async function uploadCoverBytes(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  lessonId: string,
  bytes: Buffer,
  mimeType: string,
): Promise<{ bucket: string; path: string; url: string | null } | null> {
  const path = coverPath(lessonId, mimeType);
  const contentType = mimeType || "image/jpeg";
  const errors: string[] = [];

  for (const bucket of COVER_BUCKETS) {
    try {
      const { error: upErr } = await db.storage.from(bucket).upload(path, bytes, {
        contentType,
        upsert: true,
      });
      if (upErr) {
        errors.push(`${bucket}: ${upErr.message}`);
        continue;
      }

      // Prefer public URL if bucket is public; else signed
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
    } catch (e) {
      errors.push(
        `${bucket}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  console.warn("[generate-cover] all bucket uploads failed", errors.join(" | "));
  return null;
}

/**
 * POST /api/admin/curriculum/lessons/[id]/generate-cover
 */
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
    const image = await generateLessonCoverImage(prompt);

    // 1) Try Supabase storage (multiple buckets)
    const uploaded = await uploadCoverBytes(
      db,
      id,
      image.bytes,
      image.mimeType || "image/jpeg",
    );

    // 2) If storage blocked — keep a durable external-style approach:
    //    re-fetch is avoided; we store a stable pollinations URL for display
    let coverPath = uploaded?.path ?? null;
    let coverUrl = uploaded?.url ?? null;
    let storageNote: string | null = null;

    if (!coverUrl) {
      // Stable public URL from Pollinations (works even without storage)
      const short = prompt.slice(0, 200);
      coverUrl =
        "https://image.pollinations.ai/prompt/" +
        encodeURIComponent(short) +
        `?width=1280&height=720&nologo=true&model=flux&seed=${id.replace(/-/g, "").slice(0, 8)}`;
      coverPath = null;
      storageNote =
        "Storage bucket-এ image upload হয়নি (MIME/policy)। External cover URL save করা হয়েছে।";
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
      if (updErr) {
        // Columns may be missing — still return URL to client
        console.warn("[generate-cover] DB update", updErr.message);
        if (/cover_image/i.test(updErr.message)) {
          return NextResponse.json(
            {
              error: "COVER_COLUMNS_MISSING",
              message:
                "lesson_contents-এ cover_image_url / cover_image_path column নেই। নিচের SQL চালাও।",
              sql: "alter table public.lesson_contents add column if not exists cover_image_path text; alter table public.lesson_contents add column if not exists cover_image_url text;",
              cover_image_url: coverUrl,
              model: image.model,
            },
            { status: 500 },
          );
        }
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
        ? "Cover image তৈরি ও storage-এ save হয়েছে।"
        : storageNote || "Cover URL save হয়েছে (storage skip)।",
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
