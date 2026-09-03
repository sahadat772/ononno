import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { requireRole } from "@/lib/api-auth";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      {
        error: "AI_NOT_CONFIGURED",
        message: "GROQ_API_KEY configured নেই।",
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
    .eq("is_published", true)
    .maybeSingle();

  if (lesErr || !lesson) {
    return NextResponse.json(
      {
        error: "LESSON_NOT_FOUND",
        message: "Published lesson পাওয়া যায়নি।",
      },
      { status: 404 },
    );
  }

  const raw = lesson.lesson_contents as
    | Record<string, unknown>
    | Record<string, unknown>[]
    | null;
  const content = Array.isArray(raw) ? raw[0] : raw;
  if (!content) {
    return NextResponse.json(
      {
        error: "NO_CONTENT",
        message: "এই পাঠে study content নেই।",
      },
      { status: 409 },
    );
  }

  const title =
    (lesson.title_bn as string) || (lesson.title as string) || "পাঠ";
  const objectives = Array.isArray(content.objectives)
    ? (content.objectives as string[]).join("\n- ")
    : "";
  const examples = Array.isArray(content.examples)
    ? (content.examples as string[]).join("\n- ")
    : "";

  const studyContext = [
    `পাঠের নাম: ${title}`,
    content.overview ? `পরিচিতি: ${content.overview}` : "",
    objectives ? `শেখার লক্ষ্য:\n- ${objectives}` : "",
    content.main_content ? `মূল পাঠ:\n${content.main_content}` : "",
    content.ai_explanation
      ? `সহজ ব্যাখ্যা:\n${content.ai_explanation}`
      : "",
    examples ? `উদাহরণ:\n- ${examples}` : "",
    content.summary ? `সারসংক্ষেপ:\n${content.summary}` : "",
    content.extra_notes ? `নোট:\n${content.extra_notes}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 6000);

  const system = `তুমি ONONNO platform-এর AI শিক্ষক (পাঠ-সহায়ক)।

LOCKED RULES:
1. শুধু নিচের PUBLISHED lesson content থেকে উত্তর দাও।
2. নতুন curriculum / lesson generate করবে না।
3. Content-এ যা নেই তা অনুমান করে বানাবে না — বলো "এই পাঠে এটা নেই, পাঠটি আবার পড়ো"।
4. সবসময় সহজ বাংলায়, ছোট অনুচ্ছেদে উত্তর দাও।
5. শিক্ষার্থীকে উৎসাহিত করো; অপমান করো না।
6. প্রয়োজনে ১টি follow-up প্রশ্ন দাও।

--- LESSON CONTEXT ---
${studyContext}
--- END ---`;

  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  const messages: { role: "system" | "user" | "assistant"; content: string }[] =
    [
      { role: "system", content: system },
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
      { role: "user", content: message },
    ];

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.4,
      max_tokens: 700,
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ||
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
