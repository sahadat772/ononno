import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { chat } from '@/lib/groq'
import type { TajweedRuleId } from '@/types/database'

export async function GET(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const student_id = searchParams.get('student_id') || user.id

        // গত ৭ দিনের date range
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const weekAgoISO = weekAgo.toISOString()
        const todayISO = new Date().toISOString()

        // ── সব data parallel fetch ──
        const [
            { data: tajweedSessions },
            { data: memorization },
            { data: dailyTracker },
            { data: qaHistory },
            { data: islamicProgress },
            { data: profile },
        ] = await Promise.all([
            // গত ৭ দিনের tajweed sessions
            supabase
                .from('tajweed_sessions')
                .select('rule_id, ai_score, mistakes, created_at')
                .eq('student_id', student_id)
                .gte('created_at', weekAgoISO),

            // সব memorization data
            supabase
                .from('quran_memorization')
                .select('surah_number, ayah_from, ayah_to, memorization_level, ai_score, last_revised_at')
                .eq('student_id', student_id),

            // গত ৭ দিনের daily tracker
            supabase
                .from('daily_islamic_tracker')
                .select('*')
                .eq('student_id', student_id)
                .gte('date', weekAgo.toISOString().split('T')[0])
                .order('date', { ascending: true }),

            // গত ৭ দিনের Q&A history
            supabase
                .from('islamic_qa_history')
                .select('topic, created_at')
                .eq('student_id', student_id)
                .gte('created_at', weekAgoISO),

            // Islamic progress summary
            supabase
                .from('islamic_progress')
                .select('content_type, status, score')
                .eq('student_id', student_id),

            // Student profile
            supabase
                .from('profiles')
                .select('full_name')
                .eq('id', student_id)
                .single(),
        ])

        // ── ML Calculations ──

        // Tajweed average score
        const tajweedScores = (tajweedSessions || [])
            .filter(s => s.ai_score !== null)
            .map(s => s.ai_score as number)
        const tajweedAvgScore = tajweedScores.length > 0
            ? Math.round(tajweedScores.reduce((a, b) => a + b, 0) / tajweedScores.length)
            : 0

        // Weak tajweed rules — score 70 এর নিচে
        const ruleScores: Record<string, number[]> = {}
            ; (tajweedSessions || []).forEach(s => {
                if (s.ai_score !== null) {
                    if (!ruleScores[s.rule_id]) ruleScores[s.rule_id] = []
                    ruleScores[s.rule_id].push(s.ai_score)
                }
            })
        const weakTajweedRules: TajweedRuleId[] = Object.entries(ruleScores)
            .filter(([, scores]) => {
                const avg = scores.reduce((a, b) => a + b, 0) / scores.length
                return avg < 70
            })
            .map(([rule]) => rule as TajweedRuleId)

        // Memorization levels summary
        const memLevels: Record<string, number> = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
            ; (memorization || []).forEach(m => {
                memLevels[String(m.memorization_level)]++
            })

        // Daily streak calculate
        const streak = (dailyTracker || []).filter(d =>
            d.quran_ayahs_read > 0 || d.duas_recited > 0 || d.memorization_done
        ).length

        // Weekly totals
        const weeklyTotals = (dailyTracker || []).reduce((acc, d) => ({
            quran_ayahs: acc.quran_ayahs + (d.quran_ayahs_read || 0),
            duas: acc.duas + (d.duas_recited || 0),
            hadith: acc.hadith + (d.hadith_read || 0),
        }), { quran_ayahs: 0, duas: 0, hadith: 0 })

        // Progress summary
        const progressSummary = {
            completed: (islamicProgress || []).filter(p => p.status === 'completed').length,
            in_progress: (islamicProgress || []).filter(p => p.status === 'in_progress').length,
            total: (islamicProgress || []).length,
        }

        // Q&A topic breakdown
        const topicCount: Record<string, number> = {}
            ; (qaHistory || []).forEach(q => {
                if (q.topic) topicCount[q.topic] = (topicCount[q.topic] || 0) + 1
            })

        // ── Groq AI — Weekly Analysis + Parent Report ──
        const analysisPrompt = `তুমি Ononno প্ল্যাটফর্মের Islamic Education ML Analyzer।

Student: ${profile?.full_name || 'Unknown'}
বিশ্লেষণের সময়কাল: গত ৭ দিন

📊 সাপ্তাহিক data:
- কুরআন পড়া: ${weeklyTotals.quran_ayahs} আয়াত
- দোয়া পড়া: ${weeklyTotals.duas} বার
- হাদিস পড়া: ${weeklyTotals.hadith}টি
- Active দিন: ${streak}/7
- Tajweed গড় score: ${tajweedAvgScore}%
- দুর্বল Tajweed rules: ${weakTajweedRules.join(', ') || 'কোনোটি নেই'}
- হিফজ অগ্রগতি: ${memLevels['5']} সূরা/আয়াত perfect, ${memLevels['3'] + memLevels['4']} টি ভালো অবস্থায়
- Islamic progress: ${progressSummary.completed} completed, ${progressSummary.in_progress} in progress
- AI chatbot এ প্রশ্ন করেছে: ${qaHistory?.length || 0}টি

বিশ্লেষণ করো এবং শুধু এই JSON দাও:
{
  "overall_score": 0-100,
  "grade": "A+/A/B+/B/C",
  "strengths": ["ভালো দিক ১", "ভালো দিক ২"],
  "improvements_needed": ["উন্নতি দরকার ১", "উন্নতি দরকার ২"],
  "ai_recommendations": [
    "সুপারিশ ১",
    "সুপারিশ ২",
    "সুপারিশ ৩"
  ],
  "next_week_goals": [
    "আগামী সপ্তাহের লক্ষ্য ১",
    "আগামী সপ্তাহের লক্ষ্য ২"
  ],
  "parent_report": "Parent এর জন্য সংক্ষিপ্ত বাংলা report (৩-৪ বাক্য, উৎসাহমূলক)",
  "student_message": "Student এর জন্য উৎসাহমূলক বার্তা বাংলায়"
}`

        const aiResponse = await chat(
            [{ role: 'user', content: analysisPrompt }],
            'তুমি Islamic education ML analyzer। শুধু valid JSON দাও।'
        )

        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        const aiAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null

        return NextResponse.json({
            student_id,
            student_name: profile?.full_name,
            week_start: weekAgo.toISOString().split('T')[0],
            week_end: todayISO.split('T')[0],

            // Raw ML data
            weekly_totals: weeklyTotals,
            tajweed_avg_score: tajweedAvgScore,
            weak_tajweed_rules: weakTajweedRules,
            memorization_levels: memLevels,
            daily_streak: streak,
            progress_summary: progressSummary,
            topic_breakdown: topicCount,

            // AI analysis
            ai_analysis: aiAnalysis,
        })

    } catch (error) {
        console.error('Weekly analysis error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}