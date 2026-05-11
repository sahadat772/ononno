import { NextRequest, NextResponse } from 'next/server'
import { analyzeContent, getContentAnalysisPrompt } from '@/lib/groq'

export async function POST(req: NextRequest) {
    try {
        const { subject, topic, content, sector, level } = await req.json()

        if (!subject || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const prompt = getContentAnalysisPrompt(
            subject,
            topic || subject,
            content,
            sector || 'general',
            level || 'intermediate'
        )

        const analysis = await analyzeContent(prompt)

        if (!analysis) {
            return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
        }

        return NextResponse.json({ analysis })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}