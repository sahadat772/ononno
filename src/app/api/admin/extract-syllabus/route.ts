import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { requireRole } from '@/lib/api-auth'
import { ExtractSyllabusSchema, validateBody } from '@/lib/validation'
import { audit } from '@/lib/audit'
import { rateLimit, rateLimitDefaults } from '@/lib/rateLimiter'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
    try {
        const auth = await requireRole(['admin'])
        if ('error' in auth) return auth.error

        const rateError = await rateLimit(`admin-extract-syllabus:${auth.user.id}`, rateLimitDefaults.adminAI)
        if (rateError) return rateError

        const body = await validateBody(ExtractSyllabusSchema, req)
        if (body instanceof NextResponse) return body

        const { imageBase64, subjectName, classLevel } = body

        if (imageBase64.length > 8_000_000) {
            return NextResponse.json({ error: 'ছবিটি খুব বড়। 6 MB-এর কম ছবি দিয়ে আবার চেষ্টা করুন।' }, { status: 413 })
        }

        const classLevelBn: Record<string, string> = {
            nursery: 'নার্সারি', kg: 'কেজি',
            class_1: '১ম শ্রেণী', class_2: '২য় শ্রেণী', class_3: '৩য় শ্রেণী',
            class_4: '৪র্থ শ্রেণী', class_5: '৫ম শ্রেণী', class_6: '৬ষ্ঠ শ্রেণী',
            class_7: '৭ম শ্রেণী', class_8: '৮ম শ্রেণী', class_9: '৯ম শ্রেণী',
            class_10: '১০ম শ্রেণী', class_11: '১১শ শ্রেণী', class_12: '১২শ শ্রেণী',
            university: 'বিশ্ববিদ্যালয়', masters: 'মাস্টার্স',
        }

        const level = classLevelBn[classLevel] || classLevel

        const prompt = `তুমি বাংলাদেশের NCTB সিলেবাস বিশেষজ্ঞ।

এই ছবিতে ${level} শ্রেণীর "${subjectName}" বিষয়ের সিলেবাস বা সূচিপত্র আছে।

ছবি থেকে সব অধ্যায় (Chapter) এবং প্রতিটি অধ্যায়ের পাঠ (Lesson) গুলো বের করো।

শুধু এই JSON format এ উত্তর দাও, অন্য কিছু লেখো না:
{
  "chapters": [
    {
      "title": "Chapter title in English",
      "title_bn": "অধ্যায়ের নাম বাংলায়",
      "lessons": [
        {
          "title": "Lesson title in English",
          "title_bn": "পাঠের নাম বাংলায়"
        }
      ]
    }
  ]
}`

        const response = await groq.chat.completions.create({
            model: 'qwen/qwen3.6-27b',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${imageBase64}`,
                            },
                        },
                        {
                            type: 'text',
                            text: prompt,
                        },
                    ],
                },
            ],
            max_tokens: 2500,
            temperature: 0.3,
        })

        const raw = response.choices[0]?.message?.content || ''

        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json({ error: 'Could not parse syllabus' }, { status: 422 })
        }

        const parsed = JSON.parse(jsonMatch[0])

        await audit('extract_syllabus', auth.user.id, {
            subjectName,
            classLevel,
            payloadSize: imageBase64.length,
        })

        return NextResponse.json(parsed)

    } catch (e) {
        console.error('Syllabus extract error:', e)
        return NextResponse.json({ error: 'Extraction failed' }, { status: 500 })
    }
}
