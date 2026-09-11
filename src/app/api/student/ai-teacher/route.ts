import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";
import { chat, isGroqConfigured } from "@/lib/groq";

type ChatTurn = { role: "user" | "assistant"; content: string };

/**
 * POST /api/student/ai-teacher
 * Answers ONLY from published lesson content (no curriculum regenerate).
 */
export async function POST(req: NextRequest) {
  const auth = await requireRole(["student", "admin"]);
  if ("error" in auth) return auth.error;

  const rateError = await rateLimit(
    `student-ai-teacher:${auth.user.id}`,
    rateLimitDefaults.adminAI,
  );
  if (rateError) return rateError;

  if (!isGroqConfigured()) {
    return NextResponse.json(
      {
        error: "AI_NOT_CONFIGURED",
        message: "GROQ_API_KEY configured নেই। Vercel env-এ যোগ করো।",
      },
      { status: 500 },
    );
  }

  let body: {
    lessonId?: string;
    message?: string;
    history?: ChatTurn[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const lessonId = String(body.lessonId ?? "").trim();
  const message = String(body.message ?? "").trim();
  if (!lessonId || !message) {
    return NextResponse.json(
      { error: "VALIDATION", message: "lessonId ও message লাগবে।" },
      { status: 400 },
    );
  }
  if (message.length > 800) {
    return NextResponse.json(
      { error: "VALIDATION", message: "প্রশ্ন খুব লম্বা (max 800)।" },
      { status: 400 },
    );
  }

  const { data: lesson, error: lesErr } = await auth.supabase
    .from("curriculum_lessons")
    .select(
      `id, title, title_bn, is_published,
       lesson_contents (
         overview, objectives, main_content, ai_explanation,
         examples, summary, extra_notes
       )`,
    )
    .eq("id", lessonId)
    .maybeSingle();

  if (lesErr || !lesson) {
    return NextResponse.json(
      { error: "LESSON_NOT_FOUND", message: "পাঠ পাওয়া যায়নি।" },
      { status: 404 },
    );
  }

  if (!lesson.is_published && auth.role !== "admin") {
    return NextResponse.json(
      { error: "NOT_PUBLISHED", message: "পাঠ published নয়।" },
      { status: 403 },
    );
  }

  const raw = lesson.lesson_contents as
    | Record<string, unknown>
    | Record<string, unknown>[]
    | null;
  const content = Array.isArray(raw) ? raw[0] : raw;
  const title =
    (lesson.title_bn as string) || (lesson.title as string) || "পাঠ";

  const studyContext = [
    content?.overview && `সংক্ষেপ: ${content.overview}`,
    content?.main_content && `মূল পাঠ: ${content.main_content}`,
    content?.ai_explanation && `ব্যাখ্যা: ${content.ai_explanation}`,
    content?.summary && `সারাংশ: ${content.summary}`,
    Array.isArray(content?.objectives) &&
      `উদ্দেশ্য: ${(content.objectives as string[]).join("; ")}`,
    Array.isArray(content?.examples) &&
      `উদাহরণ: ${(content.examples as string[]).join("; ")}`,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 7000);

  const system = `তুমি ONONNO AI Teacher। শুধু নিচের পাঠ context থেকে বাংলায় উত্তর দাও।
পাঠ: ${title}

--- LESSON CONTEXT ---
${studyContext || "(কন্টেন্ট সীমিত)"}
--- END ---

নিয়ম: context-এ যা নেই তা বানাবে না; সংক্ষিপ্ত ও উৎসাহী থাকো।`;

  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  const messages = [
    ...history
      .filter(
        (h) =>
          h &&
          (h.role === "user" || h.role === "assistant") &&
          typeof h.content === "string",
      )
      .map((h) => ({
        role: h.role as "user" | "assistant",
        content: String(h.content).slice(0, 1000),
      })),
    { role: "user" as const, content: message },
  ];

  try {
    const replyRaw = await chat(messages, {
      systemPrompt: system,
      temperature: 0.4,
      maxTokens: 700,
    });
    const reply =
      replyRaw.trim() ||
      "দুঃখিত, এখন উত্তর দিতে পারিনি। আবার চেষ্টা করো।";

    return NextResponse.json({
      reply,
      lessonId,
      lessonTitle: title,
      grounded: true,
    });
  } catch (e) {
    console.error("[ai-teacher]", e);
    return NextResponse.json(
      {
        error: "AI_FAILED",
        message: "AI Teacher উত্তর দিতে পারেনি।",
        details: e instanceof Error ? e.message.slice(0, 200) : undefined,
      },
      { status: 500 },
    );
  }
}
