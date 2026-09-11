import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { requireRole } from "@/lib/api-auth";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";

type RouteContext = { params: Promise<{ id: string }> };

type QuizQ = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

/**
 * POST /api/student/lessons/[id]/generate-quiz
 * AI generates extra practice MCQs from published lesson content.
 * Used after the built-in lesson quiz is completed.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const auth = await requireRole(["student", "admin"]);
  if ("error" in auth) return auth.error;

  const rateError = await rateLimit(
    `student-generate-quiz:${auth.user.id}`,
    rateLimitDefaults.adminAI,
  );
  if (rateError) return rateError;

  const { id: lessonId } = await context.params;
  if (!lessonId) {
    return NextResponse.json({ error: "lessonId required" }, { status: 400 });
  }

  let count = 4;
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body?.count === "number" && body.count >= 2 && body.count <= 8) {
      count = Math.floor(body.count);
    }
  } catch {
    /* default */
  }

  const { data: lesson, error: lesErr } = await auth.supabase
    .from("curriculum_lessons")
    .select(
      `id, title, title_bn, is_published,
       lesson_contents (
         overview, main_content, ai_explanation, summary, objectives, examples
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
      { error: "NOT_PUBLISHED", message: "পাঠ এখনো published নয়।" },
      { status: 403 },
    );
  }

  const raw = lesson.lesson_contents as
    | Record<string, unknown>
    | Record<string, unknown>[]
    | null;
  const content = Array.isArray(raw) ? raw[0] : raw;
  const title = (lesson.title_bn as string) || (lesson.title as string) || "পাঠ";
  const textParts = [
    content?.overview,
    content?.main_content,
    content?.ai_explanation,
    content?.summary,
    Array.isArray(content?.objectives)
      ? (content.objectives as string[]).join("\n")
      : null,
    Array.isArray(content?.examples)
      ? (content.examples as string[]).join("\n")
      : null,
  ]
    .filter(Boolean)
    .map(String)
    .join("\n\n")
    .slice(0, 6000);

  if (!textParts.trim()) {
    return NextResponse.json(
      {
        error: "NO_CONTENT",
        message: "এই পাঠে AI কুইজ বানানোর মতো কন্টেন্ট নেই।",
      },
      { status: 409 },
    );
  }

  if (!groq) {
    const questions = fallbackQuestions(title, textParts, count);
    return NextResponse.json({
      ok: true,
      source: "fallback",
      questions,
      message: "AI key নেই — practice কুইজ (fallback)।",
    });
  }

  const prompt = `তুমি ONONNO শিক্ষা প্ল্যাটফর্মের quiz generator।
পাঠ: ${title}

পাঠের বিষয়বস্তু:
${textParts}

নিয়ম:
1. ঠিক ${count}টি MCQ তৈরি করো — শুধু এই পাঠ থেকে।
2. প্রতিটিতে ৪টি options (বাংলা)। correct = 0-based index (0–3)।
3. explanation ছোট বাংলা।
4. আগের মতো সহজ নকল প্রশ্ন এড়িয়ে নতুন practice প্রশ্ন দাও।
5. শুধু valid JSON array আউটপুট — কোনো markdown নয়।

[
  {
    "question": "...",
    "options": ["ক", "খ", "গ", "ঘ"],
    "correct": 0,
    "explanation": "..."
  }
]`;

  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_QUIZ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: "Reply with only a valid JSON array of quiz questions.",
        },
        { role: "user", content: prompt },
      ],
    });

    const rawText = completion.choices[0]?.message?.content ?? "";
    const questions = parseQuestions(rawText, count);
    if (questions.length === 0) {
      return NextResponse.json({
        ok: true,
        source: "fallback",
        questions: fallbackQuestions(title, textParts, count),
        message: "AI parse ব্যর্থ — fallback quiz।",
      });
    }

    return NextResponse.json({
      ok: true,
      source: "ai",
      questions,
    });
  } catch (e) {
    console.error("generate-quiz", e);
    return NextResponse.json({
      ok: true,
      source: "fallback",
      questions: fallbackQuestions(title, textParts, count),
      message: "AI error — fallback quiz।",
    });
  }
}

function parseQuestions(raw: string, max: number): QuizQ[] {
  let text = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start >= 0 && end > start) text = text.slice(start, end + 1);
  try {
    const arr = JSON.parse(text);
    if (!Array.isArray(arr)) return [];
    const out: QuizQ[] = [];
    for (const item of arr) {
      if (!item || typeof item !== "object") continue;
      const q = item as Record<string, unknown>;
      const question = String(q.question ?? "").trim();
      const options = Array.isArray(q.options)
        ? q.options.map((o) => String(o).trim()).filter(Boolean)
        : [];
      let correct = Number(q.correct);
      if (!Number.isFinite(correct) || correct < 0) correct = 0;
      const explanation =
        String(q.explanation ?? "").trim() || "সঠিক উত্তরটি বেছে নাও।";
      if (question && options.length >= 2) {
        out.push({
          question,
          options: options.slice(0, 4),
          correct: Math.min(correct, Math.min(3, options.length - 1)),
          explanation,
        });
      }
      if (out.length >= max) break;
    }
    return out;
  } catch {
    return [];
  }
}

function fallbackQuestions(title: string, body: string, count: number): QuizQ[] {
  const snippet = body.replace(/\s+/g, " ").slice(0, 120);
  const base: QuizQ[] = [
    {
      question: `"${title}" পাঠের মূল বিষয় কী সম্পর্কিত?`,
      options: [
        snippet.slice(0, 40) || "পাঠের মূল ধারণা",
        "অপ্রাসঙ্গিক বিষয়",
        "শুধু খেলাধুলা",
        "কোনো কিছু নয়",
      ],
      correct: 0,
      explanation: "পাঠের বিষয়বস্তু অনুযায়ী উত্তর দাও।",
    },
    {
      question: "এই পাঠ ভালোভাবে শেখার পর কী করা উচিত?",
      options: [
        "অনুশীলন ও পরবর্তী পাঠে এগোনো",
        "সব ভুলে যাওয়া",
        "শুধু স্ক্রিনশট নেওয়া",
        "কুইজ এড়িয়ে যাওয়া",
      ],
      correct: 0,
      explanation: "শেখা মজবুত করতে অনুশীলন জরুরি।",
    },
    {
      question: "পাঠে যা বলা হয়েছে তা কি সত্যি যাচাই করতে কী করবে?",
      options: [
        "কুইজ ও রিভিশন",
        "কিছুই না",
        "শুধু শিরোনাম পড়া",
        "বন্ধুকে দোষ দেওয়া",
      ],
      correct: 0,
      explanation: "কুইজ নিজেকে যাচাই করতে সাহায্য করে।",
    },
    {
      question: "দুর্বল স্কোর এলে সবচেয়ে ভালো পদক্ষেপ কোনটি?",
      options: [
        "পাঠ আবার পড়ে কুইজ দেওয়া",
        "পাঠ ছেড়ে দেওয়া",
        "শুধু অনুমান করা",
        "স্কোর লুকানো",
      ],
      correct: 0,
      explanation: "আবার পড়ে চেষ্টা করলে স্কোর বাড়ে।",
    },
  ];
  return base.slice(0, count);
}
