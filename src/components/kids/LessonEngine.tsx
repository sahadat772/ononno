'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSpeech, unlockSpeechAudio } from '@/hooks/useSpeech'
import { useSpeechRecognition, matchSpokenToExpected } from '@/hooks/useSpeechRecognition'
import { createClient } from '@/lib/supabase'
import { useAccess } from '@/hooks/useAccess'
import LockOverlay from '@/components/shared/LockOverlay'
import { letterIcon } from '@/lib/kids-letter-icons'
import { MatchingGame } from '@/components/kids/MatchingGame'

export type ExerciseType =
    | 'intro' | 'listen-repeat' | 'tap-correct' | 'bubble-pop' | 'letter-puzzle'
    | 'trace' | 'quiz' | 'pronounce' | 'archery-target' | 'word-builder' | 'matching'

export type Exercise = {
    id: string
    type: ExerciseType
    title: string
    voiceText: string
    content: string
    options?: string[]
    correctAnswer?: string
}

export type LessonConfig = {
    id: string
    letter: string
    word: string
    wordEn: string
    emoji: string
    color: string
    lang: 'bn-BD' | 'en-US' | 'ar-SA'
    backHref: string
    showDotCount?: boolean
    storyImage?: string
    letterImage?: string
    exercises: Exercise[]
}

const CELEBRATION = [
    { y: -320, x: -80 }, { y: -280, x: 120 },
    { y: -350, x: 40 }, { y: -260, x: -140 },
    { y: -300, x: 100 },
]

function shuffleArray<T>(arr: T[]): T[] {
    const result = [...arr]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

function resolveVoiceLang(lesson: LessonConfig): 'bn-BD' | 'en-US' | 'ar-SA' {
    if (lesson.lang === 'bn-BD') return 'bn-BD'
    if (lesson.lang === 'en-US') return 'en-US'
    if (lesson.lang === 'ar-SA') return 'ar-SA'
    return 'bn-BD'
}

// RESTORE_MARKER: full file continues via second push if needed
export default function LessonEngine({ lesson }: { lesson: LessonConfig }) {
    const router = useRouter()
    const { canDoLesson, loading: accessLoading } = useAccess()
    const safeBackHref = lesson.backHref.replace(/\/addition\/?$/, '')
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [xp] = useState(0)
    const [stars] = useState(1)
    const totalSteps = lesson.exercises?.length || 1

    async function finishAndSave() {
        if (saving) return
        setSaving(true)
        setSaveError(null)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setSaveError('লগইন নেই')
                setSaving(false)
                return
            }
            const maxXp = Math.max(totalSteps * 10, 1)
            const scorePct = Math.min(100, Math.round((xp / maxXp) * 100))
            const { error } = await supabase.from('learning_progress').upsert({
                user_id: user.id,
                lesson_id: String(lesson.id),
                status: 'completed',
                score: scorePct,
                xp_earned: Math.max(xp, 10),
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id,lesson_id' })
            if (error) {
                setSaveError(error.message)
                setSaving(false)
                return
            }
            router.push(safeBackHref)
            router.refresh()
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : 'সেভ ব্যর্থ')
            setSaving(false)
        }
    }

    if (accessLoading) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-[#0a0a1a] text-white">
                <p className="animate-pulse text-sm">লোড…</p>
            </div>
        )
    }

    if (!canDoLesson) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-[#0a0a1a] p-4">
                <LockOverlay type="daily_limit" />
            </div>
        )
    }

    return (
        <div className="relative min-h-dvh overflow-x-hidden bg-[#0a0a1a] p-4 text-white">
            <p className="mb-4 text-sm text-amber-200">লেসন ইঞ্জিন পুনরুদ্ধার চলছে — পূর্ণ UI শীঘ্রই ফিরবে।</p>
            <p className="mb-2 text-lg font-bold">{lesson.word} {lesson.emoji}</p>
            <button
                type="button"
                disabled={saving}
                onClick={() => void finishAndSave()}
                className="min-h-12 w-full rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-black"
            >
                {saving ? 'সেভ…' : '✓ সম্পন্ন ও ফিরে যাও'}
            </button>
            {saveError && <p className="mt-2 text-sm text-red-300">{saveError}</p>}
            <button type="button" onClick={() => router.push(safeBackHref)} className="mt-3 w-full text-sm text-slate-400">
                ← ফিরে যাও
            </button>
        </div>
    )
}
