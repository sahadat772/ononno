import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
    try {
        const { imageBase64, expectedLetter } = await req.json()

        if (!imageBase64 || !expectedLetter) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 })
        }

        const prompt = `তুমি একজন বাংলাদেশি শিশুদের প্রিয় শিক্ষক। একটা ছোট্ট বাচ্চা "${expectedLetter}" লেখার চেষ্টা করেছে। ছবিটা দেখো — বাচ্চাটা কি "${expectedLetter}" লিখেছে? মনে রেখো বাচ্চাদের হাতের লেখা একটু এলোমেলো হয়, সেটা স্বাভাবিক। শুধু "হ্যাঁ" অথবা "না" বলো।`

        const response = await groq.chat.completions.create({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
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
            max_tokens: 10,
        })

        const answer = response.choices[0]?.message?.content?.toLowerCase() || ''
        const isCorrect = answer.includes('হ্যাঁ')

        return NextResponse.json({ isCorrect })
    } catch (e) {
        console.error('Trace verify error:', e)
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
    }
}