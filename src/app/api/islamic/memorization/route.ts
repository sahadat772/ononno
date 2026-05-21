import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { chat } from '@/lib/groq'
import type { RevisionSchedule } from '@/types/database'

// ── Ebbinghaus Spaced Repetition Algorithm ────────────────
// memorization_level অনুযায়ী পরের revision কবে হবে
const REVISION_INTERVALS = [1, 3, 7, 14, 30, 90] // days

function calculateNextRevision(level: number): Date {
    const days = REVISION_INTERVALS[Math.min(level, 5)]
    const next = new Date()
    next.setDate(next.getDate() + days)
    return next
}

function isOverdue(nextRevisionAt: string | null): boolean {
    if (!nextRevisionAt) return false
    return new Date(nextRevisionAt) < new Date()
}

function getDaysOverdue(nextRevisionAt: string | null): number {
    if (!nextRevisionAt) return 0
    const diff = new Date().getTime() - new Date(nextRevisionAt).getTime()
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // আজকে যা revise করতে হবে সেগুলো fetch করো
        const today = new Date().toISOString()

        const { data: dueRevisions } = await supabase
            .from('quran_memorization')
            .select('*')
            .eq('student_id', user.id)
            .lte('next_revision_at', today)
            .order('next_revision_at', { ascending: true })

        // সব memorization data fetch
        const { data: allMemorization } = await supabase
            .from('quran_memorization')
            .select('*')
            .eq('student_id', user.id)
            .order('surah_number', { ascending: true })

        // Revision schedule বানাও
        const schedule: RevisionSchedule[] = (dueRevisions || []).map(item => ({
            surah_number: item.surah_number,
            ayah_from: item.ayah_from,
            ayah_to: item.ayah_to,
            memorization_level: item.memorization_level,
            next_revision_at: item.next_revision_at,
            overdue: isOverdue(item.next_revision_at),
            days_overdue: getDaysOverdue(item.next_revision_at),
        }))

        // ML: AI দিয়ে personalized revision plan বানাও
        let aiPlan = null
        if (allMemorization && allMemorization.length > 0) {
            const memSummary = allMemorization.map(m =>
                `সূরা ${m.surah_number}, আয়াত ${m.ayah_from}-${m.ayah_to}: level ${m.memorization_level}/5, AI score: ${m.ai_score || 'N/A'}`
            ).join('\n')

            const prompt = `Student এর হিফজ অবস্থা:
${memSummary}

আজকের revision schedule:
${schedule.length > 0 ? schedule.map(s => `সূরা ${s.surah_number} আয়াত ${s.ayah_from}-${s.ayah_to} (${s.days_overdue} দিন overdue)`).join('\n') : 'কোনো revision নেই'}

বিশ্লেষণ করো এবং শুধু এই JSON দাও:
{
  "priority_order": ["সবচেয়ে আগে কোনটা revise করবে"],
  "estimated_time_minutes": 30,
  "ai_tip": "আজকের হিফজ session এর জন্য বিশেষ পরামর্শ বাংলায়",
  "weak_surahs": ["কোন সূরায় বেশি মনোযোগ দরকার"],
  "encouragement": "উৎসাহমূলক বার্তা বাংলায়"
}`

            const response = await chat(
                [{ role: 'user', content: prompt }],
                'তুমি হিফজ বিশেষজ্ঞ AI। শুধু valid JSON দাও।'
            )

            const jsonMatch = response.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                aiPlan = JSON.parse(jsonMatch[0])
            }
        }

        return NextResponse.json({
            due_revisions: schedule,
            all_memorization: allMemorization || [],
            ai_plan: aiPlan,
            total_memorized: allMemorization?.length || 0,
            due_today: schedule.length,
        })

    } catch (error) {
        console.error('Memorization GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { action, surah_number, ayah_from, ayah_to, ai_score, ai_feedback } = body

        // ── Action 1: নতুন আয়াত memorization শুরু ──
        if (action === 'start') {
            if (!surah_number || !ayah_from || !ayah_to) {
                return NextResponse.json(
                    { error: 'surah_number, ayah_from, ayah_to দরকার' },
                    { status: 400 }
                )
            }

            const nextRevision = calculateNextRevision(0)

            const { data, error } = await supabase
                .from('quran_memorization')
                .upsert({
                    student_id: user.id,
                    surah_number,
                    ayah_from,
                    ayah_to,
                    memorization_level: 1,
                    last_revised_at: new Date().toISOString(),
                    next_revision_at: nextRevision.toISOString(),
                    ai_score: ai_score || null,
                    ai_feedback: ai_feedback || null,
                }, {
                    onConflict: 'student_id,surah_number,ayah_from,ayah_to',
                    ignoreDuplicates: false,
                })
                .select()
                .single()

            if (error) throw error

            // Islamic progress update
            await supabase
                .from('islamic_progress')
                .upsert({
                    student_id: user.id,
                    content_type: 'quran',
                    content_id: `${surah_number}:${ayah_from}-${ayah_to}`,
                    status: 'in_progress',
                    score: ai_score || null,
                    attempts: 1,
                    last_practiced_at: new Date().toISOString(),
                }, {
                    onConflict: 'student_id,content_type,content_id',
                    ignoreDuplicates: false,
                })

            return NextResponse.json({
                message: 'হিফজ শুরু হয়েছে!',
                next_revision: nextRevision.toISOString(),
                memorization_level: 1,
                data,
            })
        }

        // ── Action 2: Revision complete — level up ──
        if (action === 'revised') {
            if (!surah_number || !ayah_from || !ayah_to) {
                return NextResponse.json(
                    { error: 'surah_number, ayah_from, ayah_to দরকার' },
                    { status: 400 }
                )
            }

            // Current level fetch
            const { data: current } = await supabase
                .from('quran_memorization')
                .select('memorization_level')
                .eq('student_id', user.id)
                .eq('surah_number', surah_number)
                .eq('ayah_from', ayah_from)
                .eq('ayah_to', ayah_to)
                .single()

            const currentLevel = current?.memorization_level || 0
            const newLevel = Math.min(currentLevel + 1, 5)
            const nextRevision = calculateNextRevision(newLevel)

            const { data } = await supabase
                .from('quran_memorization')
                .update({
                    memorization_level: newLevel,
                    last_revised_at: new Date().toISOString(),
                    next_revision_at: nextRevision.toISOString(),
                    ai_score: ai_score || null,
                    ai_feedback: ai_feedback || null,
                })
                .eq('student_id', user.id)
                .eq('surah_number', surah_number)
                .eq('ayah_from', ayah_from)
                .eq('ayah_to', ayah_to)
                .select()
                .single()

            // Level 5 হলে completed
            if (newLevel === 5) {
                await supabase
                    .from('islamic_progress')
                    .upsert({
                        student_id: user.id,
                        content_type: 'quran',
                        content_id: `${surah_number}:${ayah_from}-${ayah_to}`,
                        status: 'completed',
                        score: ai_score || 100,
                        last_practiced_at: new Date().toISOString(),
                    }, {
                        onConflict: 'student_id,content_type,content_id',
                        ignoreDuplicates: false,
                    })
            }

            // Daily tracker — memorization_done true
            const today = new Date().toISOString().split('T')[0]
            await supabase
                .from('daily_islamic_tracker')
                .upsert({
                    student_id: user.id,
                    date: today,
                    memorization_done: true,
                }, {
                    onConflict: 'student_id,date',
                    ignoreDuplicates: false,
                })

            return NextResponse.json({
                message: newLevel === 5
                    ? 'মাশাআল্লাহ! হিফজ সম্পন্ন হয়েছে! 🎉'
                    : 'রিভিশন সম্পন্ন! পরের revision scheduled।',
                previous_level: currentLevel,
                new_level: newLevel,
                next_revision: nextRevision.toISOString(),
                days_until_next: REVISION_INTERVALS[newLevel],
                data,
            })
        }

        return NextResponse.json(
            { error: 'action must be "start" or "revised"' },
            { status: 400 }
        )

    } catch (error) {
        console.error('Memorization POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}