import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
    try {
        const { subjectName, chapterTitle, lessonTitle, classLevel } = await req.json()

        if (!subjectName || !chapterTitle || !lessonTitle) {
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

        const prompt = `তুমি বাংলাদেশের NCTB (জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড) এর একজন অভিজ্ঞ শিক্ষক।

নিচের তথ্য অনুযায়ী একটি সম্পূর্ণ lesson content তৈরি করো:
- শ্রেণী: ${level}
- বিষয়: ${subjectName}
- অধ্যায়: ${chapterTitle}
- পাঠ: ${lessonTitle}

নিচের format এ content লেখো:

## 📖 পাঠ পরিচিতি
(২-৩ বাক্যে পাঠের বিষয় পরিচয় করিয়ে দাও, সহজ বাংলায়)

## 🎯 শেখার উদ্দেশ্য
(৩-৫টা bullet point এ কী শিখবে)

## 📚 মূল বিষয়বস্তু
(NCTB curriculum অনুযায়ী বিস্তারিত আলোচনা, সহজ ভাষায়, উদাহরণ সহ)

## 💡 মনে রাখো
(গুরুত্বপূর্ণ points সংক্ষেপে)

## ✏️ অনুশীলন প্রশ্ন
(৩টা প্রশ্ন — সহজ থেকে কঠিন)

সব বাংলায় লেখো। বাচ্চাদের বোধগম্য ভাষায় লেখো।`

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'user',
                    content: prompt,
                }
            ],
            max_tokens: 2000,
            temperature: 0.7,
        })

        const content = response.choices[0]?.message?.content || ''

        return NextResponse.json({ content })
    } catch (e) {
        console.error('Content generation error:', e)
        return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
    }
}