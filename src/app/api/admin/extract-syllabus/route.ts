import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
    try {
        const { imageBase64, subjectName, classLevel } = await req.json()

        if (!imageBase64 || !subjectName) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 })
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
            max_tokens: 3000,
            temperature: 0.3,
        })

        const raw = response.choices[0]?.message?.content || ''

        // JSON parse করো
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json({ error: 'Could not parse syllabus' }, { status: 422 })
        }

        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json(parsed)

    } catch (e) {
        console.error('Syllabus extract error:', e)
        return NextResponse.json({ error: 'Extraction failed' }, { status: 500 })
    }
}