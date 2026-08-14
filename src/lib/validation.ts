import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const EmailSchema = z.string().email({ message: "সঠিক ইমেইল দিন।" });
export const PasswordSchema = z
  .string()
  .min(8, { message: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে।" });
export const FullNameSchema = z
  .string()
  .min(2, { message: "পুরো নাম লিখুন।" })
  .max(100);
export const ClassLevelSchema = z.string().min(1).max(50);
export const UUIDSchema = z.string().uuid({ message: "সঠিক ID দিন।" });

export const CreateStudentSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  full_name: FullNameSchema,
  class_level: ClassLevelSchema,
  phone: z.string().trim().min(8).max(20).optional(),
});

export const CreateChildSchema = CreateStudentSchema;

export const GenerateLessonSchema = z.object({
  subjectName: z.string().min(1).max(150),
  chapterTitle: z.string().min(1).max(150),
  lessonTitle: z.string().min(1).max(150),
  classLevel: z.string().min(1).max(50),
});
export const CreateCurriculumClassSchema = z.object({
  versionId: UUIDSchema,
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  classNumber: z.number().int().min(1).max(20),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
});

export const ExtractSyllabusSchema = z.object({
  imageBase64: z.string().min(100).max(8_000_000),
  subjectName: z.string().min(1).max(150),
  classLevel: z.string().min(1).max(50),
});

export const NotificationSendSchema = z.object({
  recipient_id: z.union([UUIDSchema, z.array(UUIDSchema)]),
  type: z.string().min(1).max(40),
  title: z.string().min(1).max(120),
  body: z.string().max(2000).optional(),
});

export const TeacherAssistantSchema = z.object({
  teacher_id: UUIDSchema.optional(),
  question: z.string().min(5).max(1500),
  conversation_history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .optional(),
});

export const TraceVerifySchema = z.object({
  imageBase64: z.string().min(100).max(8_000_000),
  expectedLetter: z.string().min(1).max(100),
});

export const PronunciationCheckSchema = z.object({
  expected: z.string().min(1).max(150),
  lang: z.string().min(2).max(10).optional(),
});

export const TtsQuerySchema = z.object({
  text: z.string().min(1).max(300),
  lang: z.string().min(2).max(10).optional(),
});

export const UpdateCurriculumClassSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  classNumber: z.number().min(1).max(20),
  description: z.string().optional(),
  isActive: z.boolean(),
});

// Curriculum Subjects
export const CreateCurriculumSubjectSchema = z.object({
  classId: UUIDSchema,
  name: z.string().min(1).max(100),
  nameBn: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "slug শুধু lowercase, number ও hyphen দিয়ে হবে"),
  description: z.string().max(1000).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(100).optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  isMandatory: z.boolean().optional(),
  orderIndex: z.number().int().min(0).max(999).optional(),
});

export const UpdateCurriculumSubjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nameBn: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(1000).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(100).optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  isMandatory: z.boolean().optional(),
  isActive: z.boolean().optional(),
  orderIndex: z.number().int().min(0).max(999).optional(),
});

// Curriculum Chapters
export const CreateCurriculumChapterSchema = z.object({
  subjectId: UUIDSchema,
  classId: UUIDSchema,
  title: z.string().min(1).max(200),
  titleBn: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "slug শুধু lowercase, number ও hyphen দিয়ে হবে"),
  description: z.string().max(1000).optional(),
  chapterNumber: z.number().int().min(1).max(999).optional(),
  icon: z.string().max(50).optional(),
  orderIndex: z.number().int().min(0).max(999).optional(),
});

export const UpdateCurriculumChapterSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  titleBn: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(1000).optional(),
  chapterNumber: z.number().int().min(1).max(999).optional(),
  icon: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  orderIndex: z.number().int().min(0).max(999).optional(),
});

// Curriculum Lessons
export const CreateCurriculumLessonSchema = z.object({
  chapterId: UUIDSchema,
  subjectId: UUIDSchema,
  classId: UUIDSchema,
  title: z.string().min(1).max(200),
  titleBn: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "slug শুধু lowercase, number ও hyphen দিয়ে হবে"),
  description: z.string().max(1000).optional(),
  lessonNumber: z.number().int().min(1).max(999).optional(),
  durationMinutes: z.number().int().min(1).max(300).optional(),
  xpReward: z.number().int().min(0).max(1000).optional(),
  coinReward: z.number().int().min(0).max(1000).optional(),
  isFreePreview: z.boolean().optional(),
  orderIndex: z.number().int().min(0).max(999).optional(),
});

export const UpdateCurriculumLessonSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  titleBn: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(1000).optional(),
  lessonNumber: z.number().int().min(1).max(999).optional(),
  durationMinutes: z.number().int().min(1).max(300).optional(),
  xpReward: z.number().int().min(0).max(1000).optional(),
  coinReward: z.number().int().min(0).max(1000).optional(),
  isFreePreview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  isActive: z.boolean().optional(),
  orderIndex: z.number().int().min(0).max(999).optional(),
});
// Lesson Contents
export const UpsertLessonContentSchema = z.object({
  lessonId: UUIDSchema,
  overview: z.string().max(2000).optional(),
  objectives: z.array(z.string().max(500)).max(20).optional(),
  mainContent: z.string().max(50000).optional(),
  aiExplanation: z.string().max(10000).optional(),
  examples: z
    .array(
      z.object({
        title: z.string().max(200),
        content: z.string().max(2000),
      }),
    )
    .max(20)
    .optional(),
  summary: z.string().max(5000).optional(),
  referenceLinks: z
    .array(
      z.object({
        title: z.string().max(200),
        url: z.string().url(),
      }),
    )
    .max(20)
    .optional(),
  aiPrompt: z.string().max(2000).optional(),
  extraNotes: z.string().max(5000).optional(),
  isAiGenerated: z.boolean().optional(),
});

// Lesson Resources
const LessonResourceTypeEnum = z.enum([
  "video",
  "audio",
  "pdf",
  "quiz",
  "game",
  "animation",
  "story",
  "worksheet",
  "practice",
  "puzzle",
  "ai_teacher",
  "virtual_lab",
  "voice",
  "extra_notes",
  "downloads",
]);

export const CreateLessonResourceSchema = z.object({
  lessonId: UUIDSchema,
  type: LessonResourceTypeEnum,
  title: z.string().min(1).max(200),
  titleBn: z.string().max(200).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  url: z.string().url().optional().or(z.literal("")),
  durationMinutes: z.number().int().min(1).max(300).optional(),
  isAiGenerated: z.boolean().optional(),
  orderIndex: z.number().int().min(0).max(999).optional(),
});

export const UpdateLessonResourceSchema = z.object({
  type: LessonResourceTypeEnum.optional(),
  title: z.string().min(1).max(200).optional(),
  titleBn: z.string().max(200).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  url: z.string().url().optional().or(z.literal("")),
  durationMinutes: z.number().int().min(1).max(300).optional(),
  isAiGenerated: z.boolean().optional(),
  isActive: z.boolean().optional(),
  orderIndex: z.number().int().min(0).max(999).optional(),
});

export async function validateBody<T>(
  schema: z.ZodType<T>,
  req: NextRequest,
): Promise<T | NextResponse> {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "অনুরোধের দেহ সঠিক নয়।" },
      { status: 400 },
    );
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(" ");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return result.data;
}
