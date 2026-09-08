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

const FALLBACK_DUAS: KidsIslamicLesson[] = [
  {
    id: 'fb-dua-1',
    type: 'dua',
    title: 'Dua Before Eating',
    title_bn: 'খাওয়ার আগের দোয়া',
    arabic_text: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
    bangla_translation: 'আল্লাহর নামে এবং আল্লাহর বরকতে শুরু করছি।',
    pronunciation: 'বিসমিল্লাহি ওয়া আলা বারাকাতিল্লাহ',
    audio_url: null,
    order_index: 1,
    level: 'nursery',
    is_active: true,
    created_at: '',
  },
  {
    id: 'fb-dua-2',
    type: 'dua',
    title: 'Dua After Eating',
    title_bn: 'খাওয়ার পরের দোয়া',
    arabic_text: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    bangla_translation: 'সমস্ত প্রশংসা আল্লাহর, যিনি আমাদের খাওয়ালেন, পান করালেন এবং মুসলিম বানালেন।',
    pronunciation: 'আলহামদুলিল্লাহিল্লাজি আতআমানা ওয়া সাকানা ওয়া জাআলানা মুসলিমিন',
    audio_url: null,
    order_index: 2,
    level: 'nursery',
    is_active: true,
    created_at: '',
  },
  {
    id: 'fb-dua-3',
    type: 'dua',
    title: 'Dua Before Sleeping',
    title_bn: 'ঘুমানোর আগের দোয়া',
    arabic_text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    bangla_translation: 'হে আল্লাহ! তোমার নামে মরি এবং বাঁচি।',
    pronunciation: 'বিসমিকাল্লাহুম্মা আমুতু ওয়া আহইয়া',
    audio_url: null,
    order_index: 3,
    level: 'nursery',
    is_active: true,
    created_at: '',
  },
  {
    id: 'fb-dua-4',
    type: 'dua',
    title: 'Dua After Waking Up',
    title_bn: 'ঘুম থেকে উঠার দোয়া',
    arabic_text: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    bangla_translation: 'সমস্ত প্রশংসা আল্লাহর, যিনি মৃত্যুর পর আমাদের জীবিত করলেন এবং তাঁর কাছেই পুনরুত্থান।',
    pronunciation: 'আলহামদুলিল্লাহিল্লাজি আহইয়ানা বাদা মা আমাতানা ওয়া ইলাইহিন নুশুর',
    audio_url: null,
    order_index: 4,
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

export default function DuaPage() {
  const [lessons, setLessons] = useState<KidsIslamicLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<KidsIslamicLesson | null>(null)
  const [learned, setLearned] = useState<string[]>([])
  const [memorized, setMemorized] = useState<string[]>([])
  const [qariId, setQariId] = useState(QARIS[0].id)
  const [qariStatus, setQariStatus] = useState<AudioStatus>({ phase: 'idle' })
  const controllerRef = useRef<PlayController | null>(null)
  const { speak, stop: stopTts, isSpeaking, isLoading: ttsLoading, status: ttsStatus } = useSpeech()

  useEffect(() => {
    fetch('/api/kids/islamic/dua')
      .then((r) => r.json())
      .then((d) => {
        const list = d.lessons?.length ? d.lessons : FALLBACK_DUAS
        setLessons(list)
        if (list.length) setSelected(list[0])
      })
      .catch(() => {
        setLessons(FALLBACK_DUAS)
        setSelected(FALLBACK_DUAS[0])
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

  const handleSelect = (lesson: KidsIslamicLesson) => {
    setSelected(lesson)
    if (!learned.includes(lesson.id)) setLearned((p) => [...p, lesson.id])
    playArabicTts(lesson)
  }

  const progress = lessons.length ? Math.round((memorized.length / lessons.length) * 100) : 0
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
        <p className="text-violet-400">লোড হচ্ছে...</p>
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
          <span className="rounded-full border border-violet-500/30 bg-violet-500/20 px-3 py-1 text-xs text-violet-400">
            🤲 {memorized.length}/{lessons.length} মুখস্থ
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
          <div className="mb-2 text-5xl">🤲</div>
          <h1 className="mb-1 text-3xl font-bold">দোয়া শিখি</h1>
          <p className="mb-1 text-2xl text-violet-300" style={{ fontFamily: 'serif' }}>الدعاء</p>
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
            <span>মুখস্থ অগ্রগতি</span>
            <span>{memorized.length}/{lessons.length} · {progress}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-white/10">
            <motion.div animate={{ width: `${progress}%` }} className="h-3 rounded-full bg-gradient-to-r from-violet-400 to-purple-500" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selected && (
            <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
              <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-500/20 to-purple-500/20 p-6">
                <div className="mb-4 text-center">
                  <span className="inline-block rounded-full border border-violet-500/30 bg-violet-500/20 px-4 py-1.5 text-sm font-semibold text-violet-300">
                    {selected.title_bn}
                  </span>
                </div>

                <div className="mb-4 text-center">
                  <p className="mb-3 text-2xl leading-loose text-white md:text-3xl" style={{ fontFamily: 'serif', direction: 'rtl' }}>
                    {selected.arabic_text}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {!busy ? (
                      <>
                        <button type="button" onClick={() => playArabicTts(selected)} className="flex min-h-11 items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/20 px-4 py-2 text-sm font-semibold text-violet-300">
                          🔊 আরবি শুনো
                        </button>
                        {findQariMatch(selected.arabic_text) && (
                          <button type="button" onClick={() => playQariIfMapped(selected)} className="flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                            🎙️ ক্বারী দিয়ে শুনো
                          </button>
                        )}
                        <button type="button" onClick={() => { stopAll(); speak(selected.pronunciation || '', 'bn-BD') }} className="flex min-h-11 items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/20 px-4 py-2 text-sm text-amber-300">
                          🔊 উচ্চারণ
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={stopAll} className="flex min-h-11 items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/20 px-5 py-2 text-sm font-bold text-rose-200">
                        ⏹ থামাও
                      </button>
                    )}
                  </div>
                  {bannerMsg && <p className="mt-3 text-xs text-amber-200/90">{bannerMsg}</p>}
                </div>

                <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                  <p className="mb-1 text-xs font-semibold text-amber-400">🔤 বাংলা উচ্চারণ</p>
                  <p className="text-sm italic leading-relaxed text-amber-200">{selected.pronunciation}</p>
                </div>

                <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <p className="mb-1 text-xs font-semibold text-emerald-400">📖 বাংলা অর্থ</p>
                  <p className="text-sm leading-relaxed text-gray-300">{selected.bangla_translation}</p>
                </div>

                {!memorized.includes(selected.id) ? (
                  <button
                    type="button"
                    onClick={() => setMemorized((p) => [...p, selected.id])}
                    className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 py-3 font-bold text-white shadow-lg shadow-violet-500/30"
                  >
                    ✅ মুখস্থ হয়েছে!
                  </button>
                ) : (
                  <div className="text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-400">
                      ✅ মুখস্থ হয়েছে! মাশাআল্লাহ!
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-3">
          {lessons.map((lesson, i) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => handleSelect(lesson)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selected?.id === lesson.id
                  ? 'border-violet-500/50 bg-violet-500/20'
                  : memorized.includes(lesson.id)
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                    memorized.includes(lesson.id)
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : learned.includes(lesson.id)
                        ? 'bg-violet-500/20 text-violet-400'
                        : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {memorized.includes(lesson.id) ? '✅' : learned.includes(lesson.id) ? '👁️' : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{lesson.title_bn}</p>
                  <p className="truncate text-xs text-gray-500">{lesson.title}</p>
                </div>
                {memorized.includes(lesson.id) && <span className="shrink-0 text-xs text-emerald-400">মুখস্থ ✓</span>}
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
