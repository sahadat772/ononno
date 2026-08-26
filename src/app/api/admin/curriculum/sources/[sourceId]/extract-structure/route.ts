import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";
import { audit } from "@/lib/audit";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

interface ExtractedLesson {
  title: string;
  title_bn: string;
  page_start: number;
  page_end: number;
}

interface ExtractedChapter {
  title: string;
  title_bn: string;
  page_start: number;
  page_end: number;
  lessons: ExtractedLesson[];
}

/**
 * POST /api/admin/curriculum/sources/[sourceId]/extract-structure
 *
 * Extract chapter/lesson structure from PDF with page mapping
 * 
 * Body:
 *   - start_page: number (optional, default 1)
 *   - end_page: number (optional, default all pages)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  const { sourceId } = await params;

  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const rateError = await rateLimit(
      `admin-extract-pdf:${auth.user.id}`,
      rateLimitDefaults.adminAI
    );
    if (rateError) return rateError;

    // Get PDF source metadata
    const { data: source, error: sourceError } = await auth.supabase
      .from("curriculum_sources")
      .select(
        `
        *,
        curriculum_classes(name),
        curriculum_subjects(name, name_bn)
      `
      )
      .eq("id", sourceId)
      .single();

    if (sourceError || !source) {
      return NextResponse.json(
        { error: "PDF source পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const startPage = body.start_page || 1;
    const endPage = body.end_page || source.page_count || 100;

    // Validate page range
    if (
      startPage < 1 ||
      endPage < startPage ||
      endPage > (source.page_count || 100)
    ) {
      return NextResponse.json(
        {
          error: `পেজ range invalid। পাওয়া যাচ্ছে: 1-${source.page_count || 100}`,
        },
        { status: 400 }
      );
    }

    // Get signed URL for private PDF
    const { data: urlData } = await auth.supabase.storage
      .from("curriculum-pdfs")
      .createSignedUrl(source.storage_path, 3600); // 1 hour expiry

    if (!urlData?.signedUrl) {
      return NextResponse.json(
        { error: "PDF download URL তৈরি করা যায়নি।" },
        { status: 500 }
      );
    }

    // Create extraction run record
    const runId = crypto.randomUUID();

    // Gemini extraction prompt
    const prompt = `আপনি NCTB curriculum বিশ্লেষণে দক্ষ।

এই PDF-টি "${source.curriculum_subjects.name_bn}" বিষয়ের "${source.curriculum_classes.name}" শ্রেণীর পাঠ্যবই।

পৃষ্ঠা ${startPage}-${endPage} থেকে সব Chapter এবং Lesson বের করুন। প্রতিটি lesson-এর পৃষ্ঠা নাম্বার রাখুন।

নিয়ম:
1. প্রতিটি Chapter-এ lesson list সাজান।
2. Lesson order preserve করুন।
3. Page numbers অবশ্যই থাকবে (start_page, end_page)।
4. বাংলা নাম exact রাখুন।
5. English transliteration ব্যবহার করুন।

শুধুমাত্র JSON format-এ উত্তর দিন:
{
  "chapters": [
    {
      "title": "Chapter English",
      "title_bn": "অধ্যায় বাংলা",
      "page_start": 2,
      "page_end": 25,
      "lessons": [
        {
          "title": "Lesson English",
          "title_bn": "পাঠ বাংলা",
          "page_start": 2,
          "page_end": 8
        }
      ]
    }
  ]
}`;

    // Call Gemini with PDF
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const response = await model.generateContent([
      {
        text: prompt,
      },
      {
        fileData: {
          mimeType: "application/pdf",
          fileUri: urlData.signedUrl,
        },
      },
    ]);

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON response
    let extractedData: { chapters: ExtractedChapter[] };
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      extractedData = JSON.parse(jsonMatch?.[0] || responseText);
    } catch {
      return NextResponse.json(
        { error: "PDF থেকে structure extract করা যায়নি।" },
        { status: 500 }
      );
    }

    // Validate extracted data
    if (
      !extractedData.chapters ||
      !Array.isArray(extractedData.chapters) ||
      extractedData.chapters.length === 0
    ) {
      return NextResponse.json(
        {
          error: "কোনো Chapter পাওয়া যায়নি। অন্য পেজ range দিয়ে চেষ্টা করুন।",
        },
        { status: 400 }
      );
    }

    // Update source status
    await auth.supabase
      .from("curriculum_sources")
      .update({
        source_status: "extracted",
        extraction_run_id: runId,
        total_chapters: extractedData.chapters.length,
        total_lessons: extractedData.chapters.reduce(
          (sum, ch) => sum + (ch.lessons?.length || 0),
          0
        ),
      })
      .eq("id", sourceId);

    // Save extraction run
    await auth.supabase.from("curriculum_extraction_runs").insert({
      id: runId,
      source_id: sourceId,
      run_status: "completed",
      extraction_type: endPage === (source.page_count || 100) ? "full" : "partial",
      start_page: startPage,
      end_page: endPage,
      chapters_found: extractedData.chapters.length,
      lessons_found: extractedData.chapters.reduce(
        (sum, ch) => sum + (ch.lessons?.length || 0),
        0
      ),
      created_by: auth.user.id,
      completed_at: new Date().toISOString(),
    });

    await audit("EXTRACT_PDF_STRUCTURE", auth.user.id, {
      sourceId,
      pages: `${startPage}-${endPage}`,
      chaptersFound: extractedData.chapters.length,
    });

    return NextResponse.json({
      sourceId,
      runId,
      chapters: extractedData.chapters,
      totalChapters: extractedData.chapters.length,
      totalLessons: extractedData.chapters.reduce(
        (sum, ch) => sum + (ch.lessons?.length || 0),
        0
      ),
    });
  } catch (error) {
    console.error("PDF extraction error:", error);

    // Mark extraction as failed
    await auth.supabase
      .from("curriculum_sources")
      .update({
        source_status: "extraction_error",
        last_error: String(error),
      })
      .eq("id", sourceId);

    return NextResponse.json(
      { error: "PDF extraction করা যায়নি। আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
