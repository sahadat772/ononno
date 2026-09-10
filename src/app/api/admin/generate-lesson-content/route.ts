import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { requireRole } from '@/lib/api-auth'
import { GenerateLessonSchema, validateBody } from '@/lib/validation'
import { audit } from '@/lib/audit'
import { rateLimit, rateLimitDefaults } from '@/lib/rateLimiter'
import { buildFullStudyEngineBlock, classToStage } from '@/lib/study-depth'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
    try {
        const auth = await requireRole(['admin'])
        if ('error' in auth) return auth.error

        const rateError = await rateLimit(`admin-generate-lesson:${auth.user.id}`, rateLimitDefaults.adminAI)
        if (rateError) return rateError

        const body = await validateBody(GenerateLessonSchema, req)
        if (body instanceof NextResponse) return body

        const { subjectName, chapterTitle, lessonTitle, classLevel } = body

        const classLevelBn: Record<string, string> = {
            nursery: 'নার্সারি', kg: 'কেজি',
            class_1: '১ম শ্রেণী', class_2: '২য় শ্রেণী', class_3: '৩য় শ্রেণী',
            class_4: '৪র্থ শ্রেণী', class_5: '৫ম শ্রেণী', class_6: '৬ষ্ঠ শ্রেণী',
            class_7: '৭ম শ্রেণী', class_8: '৮ম শ্রেণী', class_9: '৯ম শ্রেণী',
            class_10: '১০ম শ্রেণী', class_11: '১১শ শ্রেণী', class_12: '১২শ শ্রেণী',
            university: 'বিশ্ববিদ্যালয়', masters: 'মাস্টার্স',
        }

        const level = classLevelBn[classLevel] || classLevel
        const classNumMatch = String(classLevel || '').match(/(\d{1,2})/)
        const classNumber = classNumMatch ? parseInt(classNumMatch[1], 10) : null
        const stage = classToStage(classNumber)
        const engineBlock = buildFullStudyEngineBlock({
            classNumber,
            subjectName,
            chapterTitle,
            lessonTitle,
        })

        const prompt = `তুমি ONONNO Study Engine — NCTB অ্যালাইনড ছাত্র-facing lesson লেখক।
Stage: ${stage === 'secondary' ? 'মাধ্যমিক (Class 6+)' : 'প্রাথমিক (Class 1–5)'}।
প্রাথমিক ও মাধ্যমিকের গভীরতা আলাদা — নিচের rules মেনে চলো।

- শ্রেণী: ${level}
- বিষয়: ${subjectName}
- অধ্যায়: ${chapterTitle}
- পাঠ: ${lessonTitle}

${engineBlock}

নিচের format এ content লেখো (সব বাংলা, ছাত্রের ভাষায় — শিক্ষক-ম্যানুয়াল নয়):

## 📖 পাঠ পরিচিতি
## 🎯 শেখার উদ্দেশ্য
## 📚 মূল বিষয়বস্তু
## 💡 মনে রাখো
## ✏️ অনুশীলন প্রশ্ন

Class 6+ সাহিত্য (যেমন চারুপাঠ): ভাব, চরিত্র/কবি, শব্দার্থ ও বোধগম্যতা রাখো।`

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'user',
                    content: prompt,
                }
            ],
            max_tokens: 1500,
            temperature: 0.7,
        })

        const content = response.choices[0]?.message?.content || ''

        await audit('generate_lesson', auth.user.id, {
            subjectName,
            chapterTitle,
            lessonTitle,
            classLevel,
            contentLength: content.length,
        })

        return NextResponse.json({ content })
    } catch (e) {
        console.error('Content generation error:', e)
        return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
    }
}
