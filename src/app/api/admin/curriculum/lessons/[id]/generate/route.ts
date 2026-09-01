import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";
import { ai, CURRICULUM_GEMINI_MODEL } from "@/lib/gemini";
import { resolvePageRange } from "@/lib/page-fields";
import { uploadPdfToGemini } from "@/lib/curriculum-import";
import { createCurriculumStorage } from "@/lib/storage";
import { createServiceRoleClient } from "@/lib/supabase-admin";

type RouteContext = { params: Promise<{ id: string }> };
type GeneratedContent = {
  overview?: string;
  objectives?: string[];
  main_content?: string;
  ai_explanation?: string;
  examples?: string[];
  vocabulary?: string[];
  practice?: string[];
  summary?: string;
  extra_notes?: string;
};

function getDb(authSupabase: ReturnType<typeof createServiceRoleClient>) {
  try {
    return createServiceRoleClient();
  } catch (e) {
    console.warn("[generate] service role unavailable, using user client", e);
    return authSupabase;
  }
}

function buildStudentStudyPrompt(opts: {
  title: string;
  classNumber?: number | null;
  pageStart?: number | null;
  pageEnd?: number | null;
  sourceLabel: string;
}) {
  const ageHint =
    opts.classNumber != null && opts.classNumber <= 2
      ? "শিক্ষার্থীর বয়স প্রায় ৬–৭ বছর (Class 1–2)। খুব সহজ শব্দ, ছোট বাক্য।"
      : opts.classNumber != null && opts.classNumber <= 5
        ? "প্রাথমিক স্তর — সহজ ও স্পষ্ট বাংলা।"
        : "পাঠ্যবইয়ের স্তর অনুযায়ী উপযুক্ত ভাষা।";

  return `তুমি ONONNO platform-এর Curriculum Intelligence Engine।
কাজ: NCTB PDF (প্রায়ই শিক্ষক সংস্করণ / Teacher Guide) থেকে **ছাত্রদের জন্য study lesson** তৈরি করা।

⚠️ গুরুত্বপূর্ণ পার্থক্য:
- PDF-এ থাকতে পারে "শিক্ষক করবেন", "পিরিয়ড-১", "শিখনফল", "ক্লাসে জড়তা কাটান" — এগুলো **কপি করবে না**।
- তুমি সেই তথ্য থেকে **শিশু যেন পড়ে শেখে** এমন পাঠ লিখবে।

পাঠের নাম: "${opts.title}"
পৃষ্ঠা পরিসর: ${opts.pageStart ?? "?"}–${opts.pageEnd ?? "?"}
সোর্স: ${opts.sourceLabel}
${ageHint}

নিয়ম (বাধ্যতামূলক):
1. শুধু এই পাঠের ধারণা/ছবি/নাম/গল্প PDF থেকে নাও। মিথ্যা তথ্য বানাবে না।
2. **কখনোই** লিখবে না: "শিক্ষক করবেন", "ক্লাসে জড়তা", "প্রশ্নোত্তরের মাধ্যমে উৎসাহিত", "শিখনফল ৩.১.১" ইত্যাদি শিক্ষক-ম্যানুয়াল ভাষা।
3. overview = ছাত্রকে বলো এই পাঠে কী শিখবে (২–৩ বাক্য, তুমি/তোমার)।
4. objectives = "আমি পারব..." স্টাইলে ৩–৫টি।
5. main_content = মূল অংশ। Class 1 এর জন্য সহজ গল্প/বর্ণনা। কমপক্ষে ৪টি ছোট অনুচ্ছেদ (\\n\\n দিয়ে আলাদা)। উদাহরণ:
   - স্কুলে যাওয়া, খেলাধুলা, সহপাঠীর নাম চেনা, বাংলাদেশ বলা — ছাত্রের চোখ দিয়ে লেখো।
6. ai_explanation = আরও সহজ করে বুঝিয়ে দাও (শিশুর মতো)।
7. examples = ৪টি ছোট সংলাপ/বাক্য যা ছাত্র মুখে বলতে পারে।
8. vocabulary = গুরুত্বপূর্ণ শব্দ + এক লাইনে সহজ অর্থ।
9. practice = ৪টি সহজ প্রশ্ন (উত্তর দিও না) — ছাত্র নিজে ভাববে।
10. summary = ৩–৪ বাক্যে সারকথা (ছাত্রকে উদ্দেশ্য করে)।
11. extra_notes = বাড়িতে মা/বাবা কীভাবে সাহায্য করতে পারেন — ১–২ লাইন মাত্র।
12. সব টেক্সট বাংলায়। শুধু JSON।

JSON:
{
  "overview": "string",
  "objectives": ["string"],
  "main_content": "string",
  "ai_explanation": "string",
  "examples": ["string"],
  "vocabulary": ["শব্দ — অর্থ"],
  "practice": ["প্রশ্ন"],
  "summary": "string",
  "extra_notes": "string"
}`;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;

  const rateError = await rateLimit(
    `admin-generate-lesson:${auth.user.id}`,
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
  const force =
    request.nextUrl.searchParams.get("force") === "1" ||
    request.nextUrl.searchParams.get("force") === "true";

  const db = getDb(auth.supabase as never);

  let lesson: Record<string, unknown> | null = null;
  let lessonError: { message: string } | null = null;

  {
    const res = await db
      .from("curriculum_lessons")
      .select(
        "id, title, title_bn, workflow_status, is_published, page_start, page_end, source_id, class_id, subject_id",
      )
      .eq("id", id)
      .maybeSingle();
    lesson = res.data;
    lessonError = res.error;
  }

  if (lessonError) {
    console.error("generate lesson lookup error (primary):", lessonError);
    const res2 = await db
      .from("curriculum_lessons")
      .select(
        "id, title, title_bn, workflow_status, is_published, source_id, class_id, subject_id",
      )
      .eq("id", id)
      .maybeSingle();
    if (!res2.error && res2.data) {
      lesson = res2.data;
      lessonError = null;
    } else {
      return NextResponse.json(
        {
          error: "SOURCE_NOT_FOUND",
          message: "Lesson load করা যায়নি।",
          details: lessonError.message,
          lessonId: id,
        },
        { status: 500 },
      );
    }
  }

  if (!lesson) {
    return NextResponse.json(
      {
        error: "SOURCE_NOT_FOUND",
        message: `Lesson পাওয়া যায়নি। (id=${id})`,
        lessonId: id,
      },
      { status: 404 },
    );
  }

  let workflowStatus = String(lesson.workflow_status ?? "draft");
  let isPublished = Boolean(lesson.is_published);

  // force=1 → unpublish + allow regenerate (fixes stuck old student content)
  if (force && (isPublished || workflowStatus === "published" || workflowStatus === "approved")) {
    await db
      .from("curriculum_lessons")
      .update({
        is_published: false,
        workflow_status: "reviewed",
      })
      .eq("id", id);
    isPublished = false;
    workflowStatus = "reviewed";
    lesson.is_published = false;
    lesson.workflow_status = "reviewed";
  }

  if (isPublished || workflowStatus === "published") {
    return NextResponse.json(
      {
        error: "ALREADY_PUBLISHED",
        message:
          "Published lesson আবার generate করা যায় না। UI-তে Force Re-generate চাপুন অথবা আগে unpublish করুন।",
      },
      { status: 409 },
    );
  }

  if (workflowStatus === "approved" && !force) {
    return NextResponse.json(
      {
        error: "STRUCTURE_COMMIT_FAILED",
        message: "Approved lesson generate/overwrite করা যাবে না (force ছাড়া)।",
      },
      { status: 409 },
    );
  }

  const { data: existingContent } = await db
    .from("lesson_contents")
    .select("*")
    .eq("lesson_id", id)
    .maybeSingle();

  if (existingContent && workflowStatus === "generated" && !force) {
    return NextResponse.json({
      lessonId: id,
      content: existingContent,
      status: "generated",
      cached: true,
      message:
        "আগেই generate করা content আছে। নতুন করতে Force Re-generate (?force=1) ব্যবহার করুন।",
    });
  }

  if (
    !["reviewed", "generated", "extracted", "draft"].includes(workflowStatus)
  ) {
    return NextResponse.json(
      {
        error: "STRUCTURE_VALIDATION_FAILED",
        message: `বর্তমান status (${workflowStatus}) এ generate করা যাবে না।`,
      },
      { status: 409 },
    );
  }

  let source: {
    id: string;
    title?: string | null;
    gemini_file_uri?: string | null;
    gemini_file_name?: string | null;
    storage_path?: string | null;
    file_name?: string | null;
    mime_type?: string | null;
  } | null = null;

  const sourceId = lesson.source_id as string | null;
  const classId = lesson.class_id as string | null;
  const subjectId = lesson.subject_id as string | null;

  if (sourceId) {
    const { data } = await db
      .from("curriculum_sources")
      .select(
        "id, title, gemini_file_uri, gemini_file_name, storage_path, file_name, mime_type",
      )
      .eq("id", sourceId)
      .maybeSingle();
    source = data;
  }

  if (!source && classId && subjectId) {
    const { data } = await db
      .from("curriculum_sources")
      .select(
        "id, title, gemini_file_uri, gemini_file_name, storage_path, file_name, mime_type",
      )
      .eq("class_id", classId)
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    source = data;
    if (source) {
      await db
        .from("curriculum_lessons")
        .update({ source_id: source.id })
        .eq("id", id);
    }
  }

  if (!source) {
    return NextResponse.json(
      {
        error: "PDF_NOT_FOUND",
        message: "PDF source link নেই। Import → Extract + Commit চালান।",
        lessonId: id,
      },
      { status: 409 },
    );
  }

  let classNumber: number | null = null;
  if (classId) {
    const { data: cls } = await db
      .from("curriculum_classes")
      .select("class_number")
      .eq("id", classId)
      .maybeSingle();
    classNumber = (cls?.class_number as number) ?? null;
  }

  let fileUri = source.gemini_file_uri;
  if (!fileUri) {
    if (!source.storage_path) {
      return NextResponse.json(
        { error: "PDF_NOT_FOUND", message: "storage_path ও gemini_file_uri নেই।" },
        { status: 409 },
      );
    }
    try {
      const storage = createCurriculumStorage(db as never);
      const pdfBlob = await storage.download(source.storage_path);
      const geminiFile = await uploadPdfToGemini({
        pdf: pdfBlob,
        displayName: source.file_name ?? source.title ?? "curriculum.pdf",
      });
      fileUri = geminiFile.uri!;
      await db
        .from("curriculum_sources")
        .update({
          gemini_file_uri: fileUri,
          gemini_file_name: geminiFile.name ?? null,
        })
        .eq("id", source.id);
    } catch (uploadErr) {
      console.error("generate: gemini upload failed", uploadErr);
      return NextResponse.json(
        {
          error: "PDF_PROCESSING_FAILED",
          message: "PDF Gemini-তে upload করা যায়নি।",
          details:
            uploadErr instanceof Error
              ? uploadErr.message.slice(0, 300)
              : String(uploadErr),
        },
        { status: 500 },
      );
    }
  }

  const pages = resolvePageRange({
    page_start: lesson.page_start as number | null | undefined,
    page_end: lesson.page_end as number | null | undefined,
  });
  const pageStart = pages.page_start;
  const pageEnd = pages.page_end;
  const title =
    (lesson.title_bn as string) || (lesson.title as string) || "পাঠ";

  await db
    .from("curriculum_lessons")
    .update({ workflow_status: "generating" })
    .eq("id", id);

  try {
    const prompt = buildStudentStudyPrompt({
      title,
      classNumber,
      pageStart,
      pageEnd,
      sourceLabel: source.title ?? source.file_name ?? "NCTB curriculum PDF",
    });

    const response = await ai.models.generateContent({
      model: CURRICULUM_GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                fileUri,
                mimeType: source.mime_type ?? "application/pdf",
              },
            },
            { text: prompt },
          ],
        },
      ],
      config: { responseMimeType: "application/json", temperature: 0.4 },
    });

    const raw = (response.text ?? "")
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    let content: GeneratedContent;
    try {
      content = JSON.parse(raw) as GeneratedContent;
    } catch {
      throw new Error("INVALID_AI_JSON");
    }

    // Reject obvious teacher-manual output — soft signal in response
    const blob = JSON.stringify(content);
    const teacherLeak =
      /শিক্ষক করবেন|জড়তা কাট|শিখনফল|প্রশ্নোত্তরের মাধ্যমে উৎসাহিত/.test(blob);

    const examples = [
      ...(content.examples ?? []),
      ...(content.vocabulary ?? []).map((v) => `শব্দ: ${v}`),
    ];
    const practiceBlock =
      content.practice && content.practice.length > 0
        ? `অনুশীলনী:\n${content.practice.map((p, i) => `${i + 1}. ${p}`).join("\n")}`
        : "";
    const extraNotes = [content.extra_notes, practiceBlock]
      .filter(Boolean)
      .join("\n\n");

    const { data, error: contentError } = await db
      .from("lesson_contents")
      .upsert(
        {
          lesson_id: id,
          overview: content.overview ?? null,
          objectives: content.objectives ?? [],
          main_content: content.main_content ?? null,
          ai_explanation: content.ai_explanation ?? null,
          examples,
          summary: content.summary ?? null,
          extra_notes: extraNotes || null,
          is_ai_generated: true,
          ai_prompt: `student-study v2 NCTB p.${pageStart ?? "?"}-${pageEnd ?? "?"}; ${CURRICULUM_GEMINI_MODEL}; force=${force}`,
        },
        { onConflict: "lesson_id" },
      )
      .select()
      .single();

    if (contentError) throw contentError;

    await db
      .from("curriculum_lessons")
      .update({ workflow_status: "generated" })
      .eq("id", id);

    await audit("GENERATE_LESSON_CONTENT", auth.user.id, {
      lessonId: id,
      sourceId: source.id,
      model: CURRICULUM_GEMINI_MODEL,
      pageStart,
      pageEnd,
      force,
      studentFacing: true,
      teacherLeak,
    });

    return NextResponse.json({
      lessonId: id,
      content: data,
      status: "generated",
      cached: false,
      force,
      teacherLeakWarning: teacherLeak
        ? "Output-এ শিক্ষক-ম্যানুয়াল ভাষা ধরা পড়েছে — Force Re-generate আবার চেষ্টা করুন।"
        : null,
    });
  } catch (error) {
    console.error("Lesson generation error:", error);
    await db
      .from("curriculum_lessons")
      .update({ workflow_status: "reviewed" })
      .eq("id", id);
    const code =
      error instanceof Error && error.message === "INVALID_AI_JSON"
        ? "INVALID_AI_JSON"
        : "GEMINI_REQUEST_FAILED";
    return NextResponse.json(
      {
        error: code,
        message: "Lesson draft generate করা যায়নি।",
        details: error instanceof Error ? error.message.slice(0, 400) : undefined,
      },
      { status: code === "INVALID_AI_JSON" ? 422 : 500 },
    );
  }
}
