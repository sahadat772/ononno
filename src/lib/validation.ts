import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const EmailSchema = z.string().email({ message: 'সঠিক ইমেইল দিন।' })
export const PasswordSchema = z.string().min(8, { message: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে।' })
export const FullNameSchema = z.string().min(2, { message: 'পুরো নাম লিখুন।' }).max(100)
export const ClassLevelSchema = z.string().min(1).max(50)
export const UUIDSchema = z.string().uuid({ message: 'সঠিক ID দিন।' })

export const CreateStudentSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  full_name: FullNameSchema,
  class_level: ClassLevelSchema,
  phone: z.string().trim().min(8).max(20).optional(),
})

export const CreateChildSchema = CreateStudentSchema

export const GenerateLessonSchema = z.object({
  subjectName: z.string().min(1).max(150),
  chapterTitle: z.string().min(1).max(150),
  lessonTitle: z.string().min(1).max(150),
  classLevel: z.string().min(1).max(50),
})

export const ExtractSyllabusSchema = z.object({
  imageBase64: z.string().min(100).max(8_000_000),
  subjectName: z.string().min(1).max(150),
  classLevel: z.string().min(1).max(50),
})

export const NotificationSendSchema = z.object({
  recipient_id: z.union([UUIDSchema, z.array(UUIDSchema)]),
  type: z.string().min(1).max(40),
  title: z.string().min(1).max(120),
  body: z.string().max(2000).optional(),
})

export const TeacherAssistantSchema = z.object({
  teacher_id: UUIDSchema.optional(),
  question: z.string().min(5).max(1500),
  conversation_history: z.array(z.object({ role: z.enum(['user', 'assistant', 'system']), content: z.string().min(1).max(2000) })).optional(),
})

export const TraceVerifySchema = z.object({
  imageBase64: z.string().min(100).max(8_000_000),
  expectedLetter: z.string().min(1).max(100),
})

export const PronunciationCheckSchema = z.object({
  expected: z.string().min(1).max(150),
  lang: z.string().min(2).max(10).optional(),
})

export const TtsQuerySchema = z.object({
  text: z.string().min(1).max(300),
  lang: z.string().min(2).max(10).optional(),
})

export async function validateBody<T>(schema: z.ZodType<T>, req: NextRequest): Promise<T | NextResponse> {
  let body: unknown

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'অনুরোধের দেহ সঠিক নয়।' }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(' ')
    return NextResponse.json({ error: message }, { status: 400 })
  }

  return result.data
}
