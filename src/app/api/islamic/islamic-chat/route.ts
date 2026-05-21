import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { chat } from '@/lib/groq'
import type { IslamicQATopic, IslamicQASource } from '@/types/database'

const ISLAMIC_SYSTEM_PROMPT = `তুমি Ononno প্ল্যাটফর্মের Islamic AI শিক্ষক। তোমার নাম "উস্তাদ AI"।

নিয়মাবলী:
1. শুধু কুরআন ও সহীহ হাদিস থেকে উত্তর দাও
2. প্রতিটি উত্তরে reference দাও (সূরা নম্বর:আয়াত নম্বর, বা হাদিসের কিতাব)
3. Controversial মাসআলায় "এই বিষয়ে একজন আলেমের সাথে পরামর্শ করুন" বলো
4. সব উত্তর সহজ বাংলায় দাও
5. ভুল তথ্য দেওয়ার চেয়ে "এই বিষয়ে আমি নিশ্চিত নই" বলা ভালো
6. সবসময় শেষে "আল্লাহই সর্বজ্ঞ" বলো
7. বাচ্চাদের জন্য সহজ ভাষা ব্যবহার করো
8. কখনো নিজে ফতোয়া দেবে না`

// Topic detect করার helper
function detectTopic(question: string): IslamicQATopic {
    const q = question.toLowerCase()
    if (q.includes('নামাজ') || q.includes('রোজা') || q.includes('যাকাত') || q.includes('হজ') || q.includes('হালাল') || q.includes('হারাম')) return 'fiqh'
    if (q.includes('আল্লাহ') || q.includes('ঈমান') || q.includes('তাওহীদ') || q.includes('আকীদা')) return 'aqeedah'
    if (q.includes('সূরা') || q.includes('আয়াত') || q.includes('কুরআন') || q.includes('তাফসির')) return 'quran'
    if (q.includes('হাদিস') || q.includes('রাসূল') || q.includes('নবী') || q.includes('সুন্নাহ')) return 'hadith'
    if (q.includes('সিরাহ') || q.includes('জীবনী') || q.includes('সাহাবী') || q.includes('ইসলামের ইতিহাস')) return 'seerah'
    if (q.includes('দোয়া') || q.includes('দুয়া') || q.includes('জিকির') || q.includes('আজকার')) return 'dua'
    return 'general'
}

// Sources extract করার helper
function extractSources(answer: string): IslamicQASource[] {
    const sources: IslamicQASource[] = []

    // Quran reference detect — যেমন (২:২৫৫) বা সূরা বাকারা ২৫৫
    const quranRegex = /\((\d+):(\d+)\)/g
    let match
    while ((match = quranRegex.exec(answer)) !== null) {
        sources.push({
            type: 'quran',
            ref: `${match[1]}:${match[2]}`,
            text: `সূরা ${match[1]}, আয়াত ${match[2]}`
        })
    }

    // Hadith reference detect — যেমন (বুখারী ১) বা (মুসলিম ৫০)
    const hadithRegex = /\((বুখারী|মুসলিম|তিরমিজি|আবু দাউদ|নাসাই|ইবনে মাজাহ)\s*(\d*)\)/g
    while ((match = hadithRegex.exec(answer)) !== null) {
        sources.push({
            type: 'hadith',
            ref: `${match[1]} ${match[2]}`.trim(),
            text: `${match[1]} হাদিস ${match[2]}`
        })
    }

    return sources
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()

        // Auth check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { question, conversation_history = [] } = body

        if (!question?.trim()) {
            return NextResponse.json(
                { error: 'প্রশ্ন লিখুন' },
                { status: 400 }
            )
        }

        // Topic detect
        const topic = detectTopic(question)

        // Groq AI call — conversation history সহ
        const messages = [
            ...conversation_history.slice(-6), // শেষ ৬টা message context হিসেবে
            { role: 'user' as const, content: question }
        ]

        const answer = await chat(messages, ISLAMIC_SYSTEM_PROMPT)

        // Sources extract
        const sources = extractSources(answer)

        // Database এ save
        await supabase
            .from('islamic_qa_history')
            .insert({
                student_id: user.id,
                question: question.trim(),
                answer,
                topic,
                sources: sources.length > 0 ? sources : null,
            })

        return NextResponse.json({
            answer,
            topic,
            sources,
        })

    } catch (error) {
        console.error('Islamic chat error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}