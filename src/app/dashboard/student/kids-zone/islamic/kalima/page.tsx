'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSpeech } from '@/hooks/useSpeech'
import { playAyahAudio, type AudioStatus, type PlayController } from '@/lib/quran-player'
import type { KidsIslamicLesson } from '@/types/database'

const QARIS = [
  { id: 'ar.alafasy', name: 'মিশারি আলাফাসী' },
  { id: 'ar.husary', name: 'হুসারী' },
  { id: 'ar.abdurrahmaansudais', name: 'সুদাইস' },
]

const QARI_MAP: Record<string, { surah: number; ayah: number; label: string }> = {
  'بِسْمِ اللَّهِ': { surah: 1, ayah: 1, label: 'সূরা ফাতিহা · আয়াত ১' },
  'الْحَمْدُ لِلَّهِ': { surah: 1, ayah: 2, label: 'সূরা ফাতিহা · আয়াত ২' },
}

const FALLBACK_KALIMAS: KidsIslamicLesson[] = [
  {
    id: 'fb-kalima-1',
    type: 'kalima',
    title: 'Kalima Shahadat',
    title_bn: 'কালিমা শাহাদাত',
    arabic_text: 'لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ',
    bangla_translation: 'আল্লাহ ছাড়া কোনো উপাস্য নেই, মুহাম্মদ (সা.) আল্লাহর রাসূল।',
    pronunciation: 'লা ইলাহা ইল্লাল্লাহু মুহাম্মাদুর রাসূলুল্লাহ',
    audio_url: null,
    order_index: 1,
    level: 'nursery',
    is_active: true,
    created_at: '',
  },
  {
    id: 'fb-kalima-2',
    type: 'kalima',
    title: 'Kalima Tayyiba',
    title_bn: 'কালিমা তাইয়্যেবা',
    arabic_text: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    bangla_translation: 'আল্লাহ এক, তাঁর কোনো অংশীদার নেই।',
    pronunciation: 'লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারিকা লাহু',
    audio_url: null,
    order_index: 2,
    level: 'nursery',
    is_active: true,
    created_at: '',
  },
  {
    id: 'fb-kalima-3',
    type: 'kalima',
    title: 'Kalima Tamjid',
    title_bn: 'কালিমা তামজীদ',
    arabic_text: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ',
    bangla_translation: 'আল্লাহ পবিত্র, সমস্ত প্রশংসা আল্লাহর, আল্লাহ ছাড়া উপাস্য নেই, আল্লাহ মহান।',
    pronunciation: 'সুবহানাল্লাহি ওয়ালহামদুলিল্লাহি ওয়ালা ইলাহা ইল্লাল্লাহু ওয়াল্লাহু আকবার',
    audio_url: null,
    order_index: 3,
    level: 'nursery',
    is_active: true,
    created_at: '',
  },
]

function findQariMatch(arabic: string) {
  const t = arabic.trim()
  for (const [key, val] of Object.entries(QARI_MAP)) {
    if (t.startsWith(key) || t.includes(key)) return val
  }
  return null
}

export default function KalimaPage() {
  const [lessons, setLessons] = useState<KidsIslamicLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<KidsIslamicLesson | null>(null)
  const [learned, setLearned] = useState<string[]>([])
  const [qariId, setQariId] = useState(QARIS[0].id)
  const [qariStatus, setQariStatus] = useState<AudioStatus>({ phase: 'idle' })
  const controllerRef = useRef<PlayController | null>(null)
  const { speak, stop: stopTts, isSpeaking, isLoading: ttsLoading, status: ttsStatus } = useSpeech()

  useEffect(() => {
    fetch('/api/kids/islamic/kalima')
      .then((r) => r.json())
      .then((d) => {
        const list = d.lessons?.length ? d.lessons : FALLBACK_KALIMAS
        setLessons(list)
        if (list.length) setSelected(list[0])
      })
      .catch(() => {
        setLessons(FALLBACK_KALIMAS)
        setSelected(FALLBACK_KALIMAS[0])
      })
      .finally(() => setLoading(false))
    return () => {
      controllerRef.current?.stop()
      stopTts()
    }
  }, [stopTts])

  const stopAll = () => {
    controllerRef.current?.stop()
    controllerRef.current = null
    setQariStatus({ phase: 'idle' })
    stopTts()
  }

  const playArabicTts = (lesson: KidsIslamicLesson) => {
    stopAll()
    speak(lesson.arabic_text, 'ar-SA')
  }

  const playQariIfMapped = (lesson: KidsIslamicLesson) => {
    const map = findQariMatch(lesson.arabic_text)
    if (!map) {
      playArabicTts(lesson)
      return
    }
    stopAll()
    setQariStatus({ phase: 'loading', message: `⬇️ ক্বারী অডিও লোড… ${map.label}` })
    controllerRef.current = playAyahAudio(qariId, map.surah, map.ayah, setQariStatus)
  }

  const handleLearn = (lesson: KidsIslamicLesson) => {
    setSelected(lesson)
    if (!learned.includes(lesson.id)) setLearned((p) => [...p, lesson.id])
    playArabicTts(lesson)
  }

  const progress = lessons.length ? Math.round((learned.length / lessons.length) * 100) : 0
  const busy =
    isSpeaking || ttsLoading || qariStatus.phase === 'loading' || qariStatus.phase === 'playing'
  const bannerMsg =
    qariStatus.phase === 'loading' || qariStatus.phase === 'playing'
      ? qariStatus.message
      : ttsStatus.phase === 'loading' || ttsStatus.phase === 'playing'
        ? ttsStatus.message
        : qariStatus.phase === 'error'
          ? qariStatus.message
          : ttsStatus.phase === 'error'
            ? ttsStatus.message
            : ''

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0d0a2e] to-[#0a0a1a]">
        <p className="text-emerald-400">লোড হচ্ছে...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white">
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#0d0a2e]/90 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/dashboard/student/kids-zone/islamic" className="flex min-h-10 items-center text-sm text-gray-400 hover:text-white">
            ← ফিরে যাও
          </Link>
          <span className="rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-xs text-blue-400">
            ✅ {learned.length}/{lessons.length}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
          <div className="mb-2 text-5xl">☝️</div>
          <h1 className="mb-1 text-3xl font-bold">কালিমা শিখি</h1>
          <p className="mb-1 text-2xl text-blue-300" style={{ fontFamily: 'serif' }}>الكلمة</p>
          <p className="text-sm text-gray-400">আরবি অডিও · ক্বারী · মুখস্থ</p>
        </motion.div>

        <div className="mb-4 flex flex-wrap gap-2">
          {QARIS.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => { setQariId(q.id); stopAll() }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                qariId === q.id ? 'bg-amber-500/25 text-amber-200 ring-1 ring-amber-400/40' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {q.name}
            </button>
          ))}
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex justify-between text-sm text-gray-400">
            <span>অগ্রগতি</span>
            <span>{learned.length}/{lessons.length} · {progress}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-white/10">
            <motion.div animate={{ width: `${progress}%` }} className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selected && (
            <motion.div key={selected.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mb-6">
              <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-6">
                <div className="mb-5 text-center">
                  <p className="mb-4 text-3xl leading-loose text-white md:text-4xl" style={{ fontFamily: 'serif', direction: 'rtl' }}>
                    {selected.arabic_text}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {!busy ? (
                      <>
                        <button type="button" onClick={() => playArabicTts(selected)} className="flex min-h-11 items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/20 px-5 py-2.5 text-sm font-semibold text-blue-300">
                          🔊 আরবি শুনো
                        </button>
                        {findQariMatch(selected.arabic_text) && (
                          <button type="button" onClick={() => playQariIfMapped(selected)} className="flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg">
                            🎙️ ক্বারী দিয়ে শুনো
                          </button>
                        )}
                      </>
                    ) : (
                      <button type="button" onClick={stopAll} className="flex min-h-11 items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/20 px-5 py-2.5 text-sm font-bold text-rose-200">
                        ⏹ থামাও
                      </button>
                    )}
                  </div>
                  {bannerMsg && <p className="mt-3 text-xs text-amber-200/90">{bannerMsg}</p>}
                </div>

                <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                  <p className="mb-1 text-xs font-semibold text-amber-400">🔤 বাংলা উচ্চারণ</p>
                  <p className="text-sm leading-relaxed text-amber-200">{selected.pronunciation}</p>
                  <button type="button" onClick={() => { stopAll(); speak(selected.pronunciation || '', 'bn-BD') }} className="mt-2 text-xs text-amber-400">
                    🔊 উচ্চারণ শুনো
                  </button>
                </div>

                <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <p className="mb-1 text-xs font-semibold text-emerald-400">📖 বাংলা অর্থ</p>
                  <p className="text-sm leading-relaxed text-gray-300">{selected.bangla_translation}</p>
                </div>

                {learned.includes(selected.id) && (
                  <div className="text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-400">
                      ✅ শেখা হয়েছে! মাশাআল্লাহ!
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {lessons.map((lesson, i) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => handleLearn(lesson)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selected?.id === lesson.id
                  ? 'border-blue-500/50 bg-blue-500/20'
                  : learned.includes(lesson.id)
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${learned.includes(lesson.id) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {learned.includes(lesson.id) ? '✅' : i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{lesson.title_bn}</p>
                    <p className="text-xs text-gray-400">{lesson.title}</p>
                  </div>
                </div>
                <p className="max-w-[40%] truncate text-lg text-white/70" style={{ fontFamily: 'serif', direction: 'rtl' }}>
                  {lesson.arabic_text.slice(0, 18)}…
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {busy && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0d0a2e]/95 p-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{qariStatus.phase === 'loading' || ttsLoading ? '⬇️ স্ট্রিম/লোড…' : '▶️ চলছে'}</p>
              <p className="truncate text-xs text-amber-200/80">{bannerMsg}</p>
            </div>
            <button type="button" onClick={stopAll} className="shrink-0 rounded-full bg-rose-500/25 px-4 py-2 text-sm font-bold text-rose-200">থামাও</button>
          </div>
        </div>
      )}
    </div>
  )
}
