import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";
import { ai, CURRICULUM_GEMINI_MODEL } from "@/lib/gemini";
import { resolvePageRange } from "@/lib/page-fields";
import { uploadPdfToGemini } from "@/lib/curriculum-import";
import { createCurriculumStorage } from "@/lib/storage";
import { createServiceRoleClient } from "@/lib/supabase-admin";
import {
  buildDepthPromptBlock,
  buildSubjectStudyHints,
  getDepthRules,
} from "@/lib/study-depth";
import { generateAndStoreLessonCover } from "@/lib/lesson-cover-image";

type RouteContext = { params: Promise<{ id: string }> };

type QuizQuestion = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

type GeneratedContent = {
  mission_intro?: string;
  overview?: string;
  objectives?: string[];
  main_content?: string;
  ai_explanation?: string;
  examples?: string[];
  vocabulary?: string[];
  practice?: string[];
  real_world_mission?: string;
  reflection?: string;
  summary?: string;
  extra_notes?: string;
  quiz_questions?: QuizQuestion[];
};

function extractModelText(response: unknown): string {
  const r = response as {
    text?: string;
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  if (typeof r?.text === "string" && r.text.trim()) return r.text;
  const parts = r?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((p) => (typeof p?.text === "string" ? p.text : ""))
    .filter(Boolean)
    .join("\n");
}

function parseGeneratedJson(rawInput: string): GeneratedContent {
  let raw = (rawInput || "").trim();
  if (!raw) throw new Error("INVALID_AI_JSON:empty");

  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) {
    raw = raw.slice(start, end + 1);
  }

  const attempts: string[] = [raw];
  attempts.push(raw.replace(/,\s*([}\]])/g, "$1"));
  attempts.push(
    raw
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/,\s*([}\]])/g, "$1"),
  );

  let lastErr: unknown;
  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate) as GeneratedContent;
    } catch (e) {
      lastErr = e;
    }
  }

  const snippet = raw.slice(0, 280).replace(/\s+/g, " ");
  throw new Error(
    `INVALID_AI_JSON:${lastErr instanceof Error ? lastErr.message : "parse"}|${snippet}`,
  );
}

function getDb(authSupabase: ReturnType<typeof createServiceRoleClient>) {
  try {
    return createServiceRoleClient();
  } catch (e) {
    console.warn("[generate] service role unavailable, using user client", e);
    return authSupabase;
  }
}

function normalizeQuiz(raw: unknown, max = 5): QuizQuestion[] {
  if (!Array.isArray(raw)) return [];
  const out: QuizQuestion[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const q = item as Record<string, unknown>;
    const question = String(q.question ?? "").trim();
    const options = Array.isArray(q.options)
      ? q.options.map((o) => String(o).trim()).filter(Boolean)
      : [];
    let correct = Number(q.correct);
    if (!Number.isFinite(correct) || correct < 0 || correct > 3) correct = 0;
    const explanation =
      String(q.explanation ?? "").trim() || "সঠিক উত্তরটি বেছে নাও।";
    if (question && options.length >= 2) {
      while (options.length < 4) options.push("—");
      out.push({
        question,
        options: options.slice(0, 4),
        correct: Math.min(correct, 3),
        explanation,
      });
    }
    if (out.length >= max) break;
  }
  return out;
}

function buildStudentStudyPrompt(opts: {
  title: string;
  classNumber?: number | null;
  pageStart?: number | null;
  pageEnd?: number | null;
  sourceLabel: string;
  subjectName?: string | null;
  subjectNameBn?: string | null;
  chapterTitle?: string | null;
}) {
  const rules = getDepthRules(opts.classNumber);
  const depthBlock = buildDepthPromptBlock(opts.classNumber);
  const subjectHints = buildSubjectStudyHints({
    classNumber: opts.classNumber,
    subjectName: opts.subjectName,
    subjectNameBn: opts.subjectNameBn,
    chapterTitle: opts.chapterTitle,
    lessonTitle: opts.title,
  });
  const pages =
    opts.pageStart != null && opts.pageEnd != null
      ? `পৃষ্ঠা ${opts.pageStart}–${opts.pageEnd}`
      : opts.pageStart != null
        ? `পৃষ্ঠা ${opts.pageStart}`
        : "প্রাসঙ্গিক অংশ";

  const classN = opts.classNumber ?? 0;
  const largePdfNote =
    classN >= 6
      ? `
⚠️ বড় textbook PDF (Class 6+ প্রায়শই ২০–৩০MB+):
- শুধু উপরের পৃষ্ঠা সীমা / এই পাঠের অংশ পড়ো।
- পুরো বই সামারাইজ করো না — শুধু এই lesson।
- পাঠের শেষে শব্দার্থ তালিকা থাকলে vocabulary-তে সেগুলো রাখো।`
      : `
⚠️ PDF থেকে শুধু এই পাঠ; পাঠ শেষে শব্দার্থ থাকলে vocabulary-তে নাও।`;

  return `তুমি ONONNO শিক্ষা প্ল্যাটফর্মের study engine।
শিক্ষার্থীর জন্য বাংলায় পাঠ তৈরি করো — শিক্ষকের নির্দেশনা নয়।

পাঠের শিরোনাম: ${opts.title}
বিষয়: ${opts.subjectNameBn || opts.subjectName || "—"}
ক্লাস: ${opts.classNumber ?? "সাধারণ"}
অধ্যায়: ${opts.chapterTitle || "—"}
সোর্স: ${opts.sourceLabel}
পৃষ্ঠা: ${pages}
${largePdfNote}

${depthBlock}

${subjectHints}

নিয়ম:
1. শুধু এই পাঠের তথ্য। মিথ্যা বানাবে না। PDF-এ যা নেই তা বানাবে না।
2. সব ফিল্ড ছাত্র-facing (বাংলা বিষয় → বাংলা; ইংরেজি → word + বাংলা অর্থ)।
3. mission_intro, overview, objectives, main_content, ai_explanation, examples, vocabulary, practice, real_world_mission, reflection, summary, extra_notes — volume rules মেনে লেখো।
4. **vocabulary বাধ্যতামূলক**: ${rules.vocabularyCount}। ফরম্যাট "শব্দ — অর্থ"। বইয়ের শব্দার্থ/Word meanings অগ্রাধিকার।
5. **quiz_questions**: ঠিক ${rules.quizCount}টি MCQ। ৪টি options। correct = 0-based index। explanation ছোট বাংলা।
6. আউটপুট শুধু valid JSON object — কোনো markdown নয়।

JSON schema:
{
  "mission_intro": "ছোট উৎসাহী intro",
  "overview": "string",
  "objectives": ["string"],
  "main_content": "string",
  "ai_explanation": "string",
  "examples": ["string"],
  "vocabulary": ["শব্দ — অর্থ"],
  "practice": ["প্রশ্ন"],
  "real_world_mission": "বাস্তব কাজ",
  "reflection": "চিন্তার প্রশ্ন",
  "summary": "string",
  "extra_notes": "string",
  "quiz_questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "string"
    }
  ]
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
        "id, title, title_bn, workflow_status, is_published, page_start, page_end, source_id, class_id, subject_id, chapter_id",
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
        "id, title, title_bn, workflow_status, is_published, source_id, class_id, subject_id, chapter_id",
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

  if (
    force &&
    (isPublished ||
      workflowStatus === "published" ||
      workflowStatus === "approved")
  ) {
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
        message: "Published lesson — force=1 দিয়ে regenerate করুন।",
      },
      { status: 409 },
    );
  }

  const sourceId = lesson.source_id as string | null;
  const classId = lesson.class_id as string | null;
  const subjectId = lesson.subject_id as string | null;

  let source: {
    id: string;
    title?: string | null;
    gemini_file_uri?: string | null;
    gemini_file_name?: string | null;
    storage_path?: string | null;
    file_name?: string | null;
    mime_type?: string | null;
  } | null = null;

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

  let subjectName: string | null = null;
  let subjectNameBn: string | null = null;
  if (subjectId) {
    const { data: subj } = await db
      .from("curriculum_subjects")
      .select("name, name_bn")
      .eq("id", subjectId)
      .maybeSingle();
    subjectName = (subj?.name as string) ?? null;
    subjectNameBn = (subj?.name_bn as string) ?? null;
  }

  let chapterTitle: string | null = null;
  const chapterId = lesson.chapter_id as string | null | undefined;
  if (chapterId) {
    const { data: chap } = await db
      .from("curriculum_chapters")
      .select("title, title_bn")
      .eq("id", chapterId)
      .maybeSingle();
    chapterTitle =
      (chap?.title_bn as string) || (chap?.title as string) || null;
  }

  const depthRules = getDepthRules(classNumber);

  async function ensureGeminiFileUri(forceReupload = false): Promise<string> {
    if (source!.gemini_file_uri && !forceReupload) {
      return String(source!.gemini_file_uri);
    }
    if (!source!.storage_path) {
      throw new Error(
        "storage_path ও gemini_file_uri নেই। Import → Extract + Commit চালান।",
      );
    }
    const storage = createCurriculumStorage(db as never);
    const pdfBlob = await storage.download(source!.storage_path);
    const geminiFile = await uploadPdfToGemini({
      pdf: pdfBlob,
      displayName: source!.file_name ?? source!.title ?? "curriculum.pdf",
    });
    const uri = geminiFile.uri;
    if (!uri) throw new Error("Gemini file URI পাওয়া যায়নি।");
    await db
      .from("curriculum_sources")
      .update({
        gemini_file_uri: uri,
        gemini_file_name: geminiFile.name ?? null,
      })
      .eq("id", source!.id);
    source!.gemini_file_uri = uri;
    return uri;
  }

  let fileUri: string;
  try {
    fileUri = await ensureGeminiFileUri(false);
  } catch (uploadErr) {
    console.error("generate: gemini upload failed", uploadErr);
    const det =
      uploadErr instanceof Error
        ? uploadErr.message.slice(0, 400)
        : String(uploadErr);
    return NextResponse.json(
      {
        error: "PDF_PROCESSING_FAILED",
        message:
          "PDF storage থেকে পড়ে Gemini-তে পাঠানো যায়নি। Drive path/share বা Supabase file চেক করো।",
        details: det,
      },
      { status: 500 },
    );
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
      subjectName,
      subjectNameBn,
      chapterTitle,
    });

    let response;
    let activeFileUri = fileUri;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: CURRICULUM_GEMINI_MODEL,
          contents: [
            {
              role: "user",
              parts: [
                {
                  fileData: {
                    fileUri: activeFileUri,
                    mimeType: source.mime_type ?? "application/pdf",
                  },
                },
                { text: prompt },
              ],
            },
          ],
          config: { responseMimeType: "application/json", temperature: 0.2 },
        });
        break;
      } catch (genErr) {
        const msg = genErr instanceof Error ? genErr.message : String(genErr);
        const denied =
          /PERMISSION_DENIED|403|do not have permission to access the File/i.test(
            msg,
          );
        if (denied && attempt === 0 && source.storage_path) {
          console.warn(
            "generate: stale Gemini file URI — re-uploading from storage",
          );
          await db
            .from("curriculum_sources")
            .update({ gemini_file_uri: null, gemini_file_name: null })
            .eq("id", source.id);
          activeFileUri = await ensureGeminiFileUri(true);
          continue;
        }
        throw genErr;
      }
    }
    if (!response) throw new Error("Gemini response empty");

    const rawText = extractModelText(response);
    if (!rawText.trim()) {
      throw new Error("INVALID_AI_JSON:empty response text");
    }
    const content = parseGeneratedJson(rawText);

    const examples = [...(content.examples ?? [])];
    const vocabularyList = (content.vocabulary ?? [])
      .map((v) => String(v).trim())
      .filter(Boolean);
    const practiceBlock =
      content.practice && content.practice.length > 0
        ? `অনুশীলনী:\n${content.practice.map((p, i) => `${i + 1}. ${p}`).join("\n")}`
        : "";
    const missionBlock = content.mission_intro
      ? `🎯 মিশন:\n${content.mission_intro}`
      : "";
    const realWorldBlock = content.real_world_mission
      ? `🌍 বাস্তব কাজ:\n${content.real_world_mission}`
      : "";
    const reflectionBlock = content.reflection
      ? `💭 চিন্তা করো:\n${content.reflection}`
      : "";
    const overviewMerged = [missionBlock, content.overview]
      .filter(Boolean)
      .join("\n\n");
    const vocabularyBlock =
      vocabularyList.length > 0
        ? `📚 শব্দার্থ / Vocabulary\n${vocabularyList.map((v, i) => `${i + 1}. ${v}`).join("\n")}`
        : "";
    const extraNotes = [
      content.extra_notes,
      vocabularyBlock,
      practiceBlock,
      realWorldBlock,
      reflectionBlock,
    ]
      .filter(Boolean)
      .join("\n\n");

    const quizQuestions = normalizeQuiz(
      content.quiz_questions,
      getDepthRules(classNumber).quizCount,
    );

    const upsertPayload: Record<string, unknown> = {
      lesson_id: id,
      overview: overviewMerged || content.overview || null,
      objectives: content.objectives ?? [],
      main_content: content.main_content || null,
      ai_explanation:
        content.ai_explanation || content.main_content || content.overview || null,
      examples,
      summary: content.summary || content.reflection || content.overview || null,
      extra_notes: extraNotes || null,
      quiz_questions: quizQuestions,
      updated_at: new Date().toISOString(),
    };

    let { data, error: contentError } = await db
      .from("lesson_contents")
      .upsert(upsertPayload, { onConflict: "lesson_id" })
      .select()
      .single();

    if (contentError && /quiz_questions/i.test(contentError.message ?? "")) {
      delete upsertPayload.quiz_questions;
      const retry = await db
        .from("lesson_contents")
        .upsert(upsertPayload, { onConflict: "lesson_id" })
        .select()
        .single();
      data = retry.data;
      contentError = retry.error;
    }

    if (contentError) throw contentError;

    try {
      const cover = await generateAndStoreLessonCover({
        supabase: db as never,
        lessonId: id,
        title,
        overview: content.overview ?? null,
        classNumber,
      });
      if (cover) {
        const coverPatch: Record<string, unknown> = {
          cover_image_path: cover.path,
          cover_image_url: cover.url,
        };
        const { error: coverErr } = await db
          .from("lesson_contents")
          .update(coverPatch)
          .eq("lesson_id", id);
        if (coverErr && /cover_image/i.test(coverErr.message ?? "")) {
          console.warn("cover columns missing", coverErr.message);
        }
      }
    } catch (coverErr) {
      console.warn("cover generation skipped", coverErr);
    }

    await db
      .from("curriculum_lessons")
      .update({
        workflow_status: "generated",
        is_active: true,
      })
      .eq("id", id);

    await audit("LESSON_GENERATE", auth.user.id, {
      id,
      title,
      depth: depthRules.labelBn,
      vocabulary_count: vocabularyList.length,
    });

    return NextResponse.json({
      ok: true,
      workflow_status: "generated",
      message: "Study draft save হয়েছে।",
      content: data,
      vocabulary_count: vocabularyList.length,
    });
  } catch (error) {
    console.error("generate lesson failed", error);
    await db
      .from("curriculum_lessons")
      .update({
        workflow_status:
          workflowStatus === "generating" ? "reviewed" : workflowStatus,
      })
      .eq("id", id);

    const msg = error instanceof Error ? error.message : String(error);
    let message = "Generate ব্যর্থ হয়েছে।";
    if (/INVALID_AI_JSON/i.test(msg)) message = "AI JSON parse ব্যর্থ — আবার generate করুন।";
    if (/PERMISSION_DENIED|403/i.test(msg)) message = "Gemini file permission — re-upload চেষ্টা হবে।";

    return NextResponse.json(
      {
        error: "GENERATE_FAILED",
        message,
        details: msg.slice(0, 500),
      },
      { status: 500 },
    );
  }
}
