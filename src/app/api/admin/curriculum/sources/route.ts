import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import { rateLimit, rateLimitDefaults } from "@/lib/rateLimiter";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subject_id");
    const classId = searchParams.get("class_id");

    let query = auth.supabase
      .from("curriculum_sources")
      .select(
        `
                *,
                curriculum_classes(id, name),
                curriculum_subjects(id, name, name_bn)
            `,
      )
      .order("created_at", { ascending: false });

    if (subjectId) query = query.eq("subject_id", subjectId);
    if (classId) query = query.eq("class_id", classId);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Sources আনা যায়নি।" },
        { status: 500 },
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"]);
    if ("error" in auth) return auth.error;

    const rateError = await rateLimit(
      `admin-upload-source:${auth.user.id}`,
      rateLimitDefaults.adminAI,
    );
    if (rateError) return rateError;

    let formData;
    try {
      formData = await req.formData();
    } catch (parseError) {
      console.error("FormData parsing error:", parseError);
      return NextResponse.json(
        {
          error:
            "PDF file টুকে বড়। নিশ্চিত করো যে file 50MB-এর কম এবং সঠিক ফর্ম্যাটে আছে।",
        },
        { status: 413 }
      );
    }

    const file = formData.get("file") as File;
    const classId = formData.get("classId") as string;
    const subjectId = formData.get("subjectId") as string;
    const title = formData.get("title") as string;
    const academicYear = formData.get("academicYear") as string;

    if (!file || !classId || !subjectId || !title) {
      return NextResponse.json(
        { error: "file, classId, subjectId, title আবশ্যক।" },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "শুধু PDF file upload করা যাবে।" },
        { status: 400 },
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "PDF size 50MB এর বেশি হতে পারবে না।" },
        { status: 413 },
      );
    }

    // Supabase Storage এ upload
    const fileName = `${classId}/${subjectId}/${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data: uploadData, error: uploadError } = await auth.supabase.storage
      .from("curriculum-pdfs")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "PDF upload করা যায়নি।" },
        { status: 500 },
      );
    }

    // Database এ save করো
    const { data, error } = await auth.supabase
      .from("curriculum_sources")
      .insert({
        class_id: classId,
        subject_id: subjectId,
        title,
        file_name: file.name,
        storage_path: uploadData.path,
        academic_year: parseInt(academicYear) || 2026,
        source_type: "pdf",
        status: "uploaded",
        source_status: "uploaded",
      })
      .select()
      .single();

    if (error) {
      console.error("DB insert error:", error);
      return NextResponse.json(
        { error: "Source save করা যায়নি।" },
        { status: 500 },
      );
    }

    await audit("UPLOAD_CURRICULUM_SOURCE", auth.user.id, {
      title,
      classId,
      subjectId,
      fileName: file.name,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
