import { NextRequest, NextResponse } from 'next/server'
import { analyzeContent, getQuranAnalysisPrompt } from '@/lib/groq'

export async function POST(req: NextRequest) {
    try {
        const { surahName, surahNumber, ayahStart, ayahEnd, ayahTexts, translations } =
            await req.json()

        if (!surahName || !ayahTexts?.length) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const prompt = getQuranAnalysisPrompt(
            surahName,
            surahNumber,
            ayahStart,
            ayahEnd,
            ayahTexts,
            translations
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