import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { requireRole } from '@/lib/api-auth'
import { TraceVerifySchema, validateBody } from '@/lib/validation'
import { rateLimit, rateLimitDefaults } from '@/lib/rateLimiter'
import { audit } from '@/lib/audit'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
    try {
        const auth = await requireRole(['student', 'teacher', 'parent', 'admin'])
        if ('error' in auth) return auth.error

        const rateError = await rateLimit(`trace-verify:${auth.user.id}`, { ...rateLimitDefaults.adminAI, tokens: 50 })
        if (rateError) return rateError

        const body = await validateBody(TraceVerifySchema, req)
        if (body instanceof NextResponse) return body

        const { imageBase64, expectedLetter } = body

        const prompt = `তুমি একজন বাংলাদেশি শিশুদের শিক্ষক। একটা বাচ্চা "${expectedLetter}" লেখার চেষ্টা করেছে।

                গুরুত্বপূর্ণ তথ্য:
                - যদি "${expectedLetter}" বাংলা সংখ্যা হয় (যেমন ১, ২, ৩), তাহলে সেই বাংলা সংখ্যার আকৃতি দেখো।
                - যদি বাংলা বর্ণ হয় (যেমন অ, ক, ব), তাহলে সেই বর্ণের আকৃতি দেখো।
                - বাচ্চাদের লেখা একটু এলোমেলো হয়, সেটা স্বাভাবিক।
                - ছবিতে যদি "${expectedLetter}" এর মতো আকৃতি দেখো, তাহলে "হ্যাঁ" বলো।

                শুধু "হ্যাঁ" অথবা "না" লেখো।`

        const response = await groq.chat.completions.create({
            model: 'qwen/qwen3.6-27b',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/png;base64,${imageBase64}`,
                            },
                        },
                        {
                            type: 'text',
                            text: prompt,
                        },
                    ],
                },
            ],
            temperature: 1,
            max_completion_tokens: 2048,
            top_p: 1,
            stream: false,
            stop: null,
        })

        const rawAnswer = response.choices[0]?.message?.content || ''

        const afterThink = rawAnswer.includes('</think>')
            ? rawAnswer.split('</think>').pop() || ''
            : rawAnswer

        const cleanAnswer = afterThink
            .replace(/<[^>]*>/g, '')
            .toLowerCase()
            .trim()

        const isCorrect =
            cleanAnswer.includes('হ্যাঁ') ||
            cleanAnswer.includes('হা') ||
            cleanAnswer.startsWith('yes')

        await audit('trace_verify', auth.user.id, {
            expectedLetter,
            payloadSize: imageBase64.length,
            result: isCorrect ? 'yes' : 'no',
        })

        return NextResponse.json({ isCorrect })
    } catch (e) {
        console.error('Trace verify error:', e)
        return NextResponse.json({ isCorrect: false }, { status: 500 })
    }
}