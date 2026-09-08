'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { playSurahAudio, type AudioStatus, type PlayController } from '@/lib/quran-player'
import type { KidsIslamicLesson } from '@/types/database'

type Tab = 'arabic' | 'pronunciation' | 'meaning'

type SurahMeta = {
  surah: number
  ayahs: number
  title: string
  title_bn: string
  arabic_text: string
  pronunciation: string
  bangla_translation: string
}

const QARIS = [
  { id: 'ar.alafasy', name: 'মিশারি আলাফাসী', arabic: 'مشاري العفاسي' },
  { id: 'ar.abdurrahmaansudais', name: 'আবদুর রহমান সুদাইস', arabic: 'عبد الرحمن السديس' },
  { id: 'ar.husary', name: 'মাহমুদ খলিল হুসারী', arabic: 'محمود خليل الحصري' },
  { id: 'ar.minshawi', name: 'মিনশাবি', arabic: 'المنشاوي' },
  { id: 'ar.muhammadayyoub', name: 'মুহাম্মদ আইয়ুব', arabic: 'محمد أيوب' },
]

const SHORT_SURAHS: SurahMeta[] = [
  {
    surah: 1,
    ayahs: 7,
    title: 'Al-Fatihah',
    title_bn: 'সূরা ফাতিহা',
    arabic_text:
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    pronunciation:
      'বিসমিল্লাহির রাহমানির রাহীম। আলহামদু লিল্লাহি রাব্বিল আলামীন। আর-রাহমানির রাহীম। মালিকি ইয়াওমিদ্দীন। ইয়্যাকা নাবুদু ওয়া ইয়্যাকা নাস্তাঈন। ইহদিনাস সিরাতাল মুস্তাকীম। সিরাতাল্লাযীনা আনআমতা আলাইহিম গায়রিল মাগদুবি আলাইহিম ওয়ালাদ দাল্লীন।',
    bangla_translation:
      'পরম করুণাময় ও অসীম দয়ালু আল্লাহর নামে। সমস্ত প্রশংসা আল্লাহর, যিনি সকল জগতের পালনকর্তা। তিনি পরম করুণাময়, অতি দয়ালু। প্রতিফল দিবসের মালিক। আমরা শুধু তোমারই ইবাদত করি এবং শুধু তোমারই সাহায্য প্রার্থনা করি। আমাদেরকে সরল পথ দেখাও। সেসব লোকের পথ, যাদেরকে তুমি নিয়ামত দান করেছ। তাদের পথ নয়, যাদের প্রতি তোমার গজব নাজিল হয়েছে এবং যারা পথভ্রষ্ট।',
  },
  {
    surah: 112,
    ayahs: 4,
    title: 'Al-Ikhlas',
    title_bn: 'সূরা ইখলাস',
    arabic_text: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    pronunciation: 'কুল হুওয়াল্লাহু আহাদ। আল্লাহুস সামাদ। লাম ইয়ালিদ ওয়া লাম ইউলাদ। ওয়া লাম ইয়াকুল্লাহু কুফুওয়ান আহাদ।',
    bangla_translation:
      'বলো, তিনি আল্লাহ, এক। আল্লাহ অমুখাপেক্ষী। তিনি কাউকে জন্ম দেননি এবং তাঁকেও জন্ম দেওয়া হয়নি। এবং তাঁর সমতুল্য কেউ নেই।',
  },
  {
    surah: 113,
    ayahs: 5,
    title: 'Al-Falaq',
    title_bn: 'সূরা ফালাক',
    arabic_text:
      'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    pronunciation:
      'কুল আউযু বিরাব্বিল ফালাক। মিন শাররি মা খালাক। ওয়া মিন শাররি গাসিকিন ইযা ওয়াকাব। ওয়া মিন শাররিন নাফফাছাতি ফিল উকাদ। ওয়া মিন শাররি হাসিদিন ইযা হাসাদ।',
    bangla_translation:
      'বলো, আমি আশ্রয় চাই ঊষার পালনকর্তার। তিনি যা সৃষ্টি করেছেন তার অনিষ্ট থেকে। এবং অন্ধকার রাতের অনিষ্ট থেকে যখন তা গভীর হয়। এবং গিরায় ফুঁক দেওয়া জাদুকরদের অনিষ্ট থেকে। এবং হিংসুকের অনিষ্ট থেকে যখন সে হিংসা করে।',
  },
  {
    surah: 114,
    ayahs: 6,
    title: 'An-Nas',
    title_bn: 'সূরা নাস',
    arabic_text:
      'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    pronunciation:
      'কুল আউযু বিরাব্বিন নাস। মালিকিন নাস। ইলাহিন নাস। মিন শাররিল ওয়াসওয়াসিল খান্নাস। আল্লাযী ইউওয়াসউইসু ফী সুদুরিন নাস। মিনাল জিন্নাতি ওয়ান নাস।',
    bangla_translation:
      'বলো, আমি আশ্রয় চাই মানুষের পালনকর্তার। মানুষের অধিপতির। মানুষের ইলাহের। কুমন্ত্রণাকারীর অনিষ্ট থেকে, যে আত্মগোপন করে। যে মানুষের অন্তরে কুমন্ত্রণা দেয়। জিন ও মানুষের মধ্য থেকে।',
  },
  {
    surah: 108,
    ayahs: 3,
    title: 'Al-Kawthar',
    title_bn: 'সূরা কাওসার',
    arabic_text: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ۝ فَصَلِّ لِرَبِّكَ وَانْحَرْ ۝ إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
    pronunciation: 'ইন্না আতায়নাকাল কাওসার। ফাসাল্লি লিরাব্বিকা ওয়ানহার। ইন্না শানিআকা হুয়াল আবতার।',
    bangla_translation:
      'নিশ্চয় আমি তোমাকে কাওসার দান করেছি। অতএব তোমার পালনকর্তার উদ্দেশ্যে নামাজ পড়ো এবং কুরবানি করো। নিশ্চয় তোমার শত্রুই নির্বংশ।',
  },
  {
    surah: 103,
    ayahs: 3,
    title: 'Al-Asr',
    title_bn: 'সূরা আসর',
    arabic_text: 'وَالْعَصْرِ ۝ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ۝ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
    pronunciation:
      'ওয়াল আসর। ইন্নাল ইনসানা লাফী খুসর। ইল্লাল্লাযীনা আমানু ওয়া আমিলুস সালিহাতি ওয়া তাওয়াসাও বিল হাক্কি ওয়া তাওয়াসাও বিস সাবর।',
    bangla_translation:
      'সময়ের কসম। নিশ্চয় মানুষ ক্ষতির মধ্যে রয়েছে। কিন্তু তারা নয় যারা ঈমান এনেছে, সৎকর্ম করেছে এবং একে অপরকে সত্যের উপদেশ দিয়েছে ও ধৈর্যের উপদেশ দিয়েছে।',
  },
]

function resolveSurahNumber(lesson: KidsIslamicLesson): { surah: number; ayahs: number } | null {
  const blob = `${lesson.title} ${lesson.title_bn} ${lesson.arabic_text || ''}`.toLowerCase()
  for (const s of SHORT_SURAHS) {
    if ([s.title.toLowerCase(), s.title_bn].some((k) => blob.includes(k.toLowerCase()))) {
      return { surah: s.surah, ayahs: s.ayahs }
    }
  }
  if (blob.includes('ফাতিহা') || blob.includes('fatih')) return { surah: 1, ayahs: 7 }
  if (blob.includes('ইখলাস') || blob.includes('ikhlas')) return { surah: 112, ayahs: 4 }
  if (blob.includes('ফালাক') || blob.includes('falaq')) return { surah: 113, ayahs: 5 }
  if (blob.includes('নাস') || blob.includes('nas')) return { surah: 114, ayahs: 6 }
  if (blob.includes('কাওসার') || blob.includes('kawthar')) return { surah: 108, ayahs: 3 }
  if (blob.includes('আসর') || blob.includes('asr')) return { surah: 103, ayahs: 3 }
  if (blob.includes('কাফিরুন') || blob.includes('kafirun')) return { surah: 109, ayahs: 6 }
  if (blob.includes('নাসর') || blob.includes('nasr')) return { surah: 110, ayahs: 3 }
  if (blob.includes('লাহাব') || blob.includes('masad')) return { surah: 111, ayahs: 5 }
  return null
}

function toLessonFromMeta(s: SurahMeta, i: number): KidsIslamicLesson {
  return {
    id: `fallback-${s.surah}`,
    type: 'surah',
    title: s.title,
    title_bn: s.title_bn,
    arabic_text: s.arabic_text,
    bangla_translation: s.bangla_translation,
    pronunciation: s.pronunciation,
    audio_url: null,
    order_index: i + 1,
    level: 'nursery',
    is_active: true,
    created_at: new Date().toISOString(),
  }
}

export default function SurahPage() {
  const [lessons, setLessons] = useState<KidsIslamicLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<KidsIslamicLesson | null>(null)
  const [memorized, setMemorized] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('arabic')
  const [qariId, setQariId] = useState(QARIS[0].id)
  const [showQari, setShowQari] = useState(false)
  const [status, setStatus] = useState<AudioStatus>({ phase: 'idle' })
  const controllerRef = useRef<PlayController | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/kids/islamic/surah')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        const list: KidsIslamicLesson[] =
          d.lessons && d.lessons.length > 0 ? d.lessons : SHORT_SURAHS.map(toLessonFromMeta)
        setLessons(list)
        setSelected(list[0] || null)
      })
      .catch(() => {
        if (cancelled) return
        const list = SHORT_SURAHS.map(toLessonFromMeta)
        setLessons(list)
        setSelected(list[0] || null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
      controllerRef.current?.stop()
    }
  }, [])

  const stopAudio = () => {
    controllerRef.current?.stop()
    controllerRef.current = null
    setStatus({ phase: 'idle' })
  }

  const playSurahTilawat = (lesson: KidsIslamicLesson) => {
    stopAudio()
    const meta = resolveSurahNumber(lesson)
    if (!meta) {
      setStatus({ phase: 'error', message: 'এই সূরার ক্বারী অডিও ম্যাপ করা নেই।' })
      return
    }
    setStatus({
      phase: 'loading',
      ayah: 1,
      total: meta.ayahs,
      message: 'অডিও লোড হচ্ছে… সার্ভার থেকে স্ট্রিম শুরু হচ্ছে',
    })
    controllerRef.current = playSurahAudio(qariId, meta.surah, meta.ayahs, setStatus)
  }

  const handleSelect = (lesson: KidsIslamicLesson) => {
    stopAudio()
    setSelected(lesson)
    setActiveTab('arabic')
  }

  const progress =
    lessons.length > 0 ? Math.round((memorized.length / lessons.length) * 100) : 0
  const selectedMeta = selected ? resolveSurahNumber(selected) : null
  const currentQari = QARIS.find((q) => q.id === qariId) || QARIS[0]
  const isBusy = status.phase === 'loading' || status.phase === 'playing'

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0d0a2e] to-[#070b14]">
        <p className="text-amber-400">লোড হচ্ছে...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0a2e] via-[#0a1628] to-[#070b14] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0d0a2e]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
          <Link
            href="/dashboard/student/kids-zone/islamic"
            className="flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg"
          >
            ←
          </Link>
          <div className="text-center">
            <p className="text-sm font-bold">📖 সূরা শিখি</p>
            <p className="text-[10px] text-amber-300">ক্বারী তিলাওয়াত</p>
          </div>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-300">
            {memorized.length}/{lessons.length}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-5 pb-28">
        <div className="mb-5 text-center">
          <div className="mb-2 text-5xl">📖</div>
          <h1 className="text-2xl font-black">সূরা শিখি</h1>
          <p className="text-sm text-slate-400">ক্বারী বেছে নাও · শুনো · মুখস্থ করো</p>
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowQari((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left"
          >
            <div>
              <p className="text-[11px] text-amber-300/80">ক্বারী</p>
              <p className="font-bold">{currentQari.name}</p>
            </div>
            <span className="text-amber-300">{showQari ? '▲' : '▼'}</span>
          </button>
          {showQari && (
            <div className="mt-2 space-y-1 rounded-2xl border border-white/10 bg-white/5 p-2">
              {QARIS.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setQariId(q.id)
                    setShowQari(false)
                    stopAudio()
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left ${
                    qariId === q.id ? 'bg-amber-500/20 text-amber-200' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="font-semibold">{q.name}</span>
                  {qariId === q.id && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex justify-between text-sm text-slate-400">
            <span>মুখস্থ</span>
            <span>
              {memorized.length}/{lessons.length} · {progress}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
            />
          </div>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => handleSelect(lesson)}
              className={`min-w-[92px] shrink-0 rounded-2xl border px-3 py-3 text-center ${
                selected?.id === lesson.id
                  ? 'border-amber-500/50 bg-amber-500/20'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <p className="text-lg">{memorized.includes(lesson.id) ? '✅' : '📖'}</p>
              <p className="truncate text-xs font-semibold">{lesson.title_bn}</p>
            </button>
          ))}
        </div>

        {selected && (
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-orange-500/10 p-5">
            <div className="mb-4 text-center">
              <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/20 px-4 py-1.5 text-sm font-semibold text-amber-300">
                {selected.title_bn}
              </span>
              {selectedMeta && (
                <p className="mt-1 text-[11px] text-amber-400/70">
                  সূরা {selectedMeta.surah} · {selectedMeta.ayahs} আয়াত
                </p>
              )}
            </div>

            <div className="mb-4 flex gap-1.5 rounded-xl bg-white/5 p-1">
              {(
                [
                  { key: 'arabic' as const, label: '🕌 আরবি' },
                  { key: 'pronunciation' as const, label: '🔤 উচ্চারণ' },
                  { key: 'meaning' as const, label: '📖 অর্থ' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'arabic' && (
              <p
                className="mb-4 text-center text-xl leading-loose md:text-2xl"
                style={{ fontFamily: 'serif', direction: 'rtl', lineHeight: '2.5' }}
              >
                {selected.arabic_text}
              </p>
            )}
            {activeTab === 'pronunciation' && (
              <p className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm italic text-amber-100">
                {selected.pronunciation || '—'}
              </p>
            )}
            {activeTab === 'meaning' && (
              <p className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-slate-200">
                {selected.bangla_translation}
              </p>
            )}

            {status.phase !== 'idle' && (
              <div
                className={`mb-4 rounded-2xl border px-4 py-3 text-center text-sm font-semibold ${
                  status.phase === 'loading'
                    ? 'border-sky-500/40 bg-sky-500/15 text-sky-200'
                    : status.phase === 'playing'
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                      : 'border-rose-500/40 bg-rose-500/15 text-rose-200'
                }`}
              >
                {status.phase === 'loading' && (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block size-3 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" />
                    {status.message}
                  </span>
                )}
                {status.phase === 'playing' && (
                  <span className="inline-flex items-center gap-2">
                    <span className="animate-pulse">🔊</span>
                    {status.message}
                  </span>
                )}
                {status.phase === 'error' && <span>⚠️ {status.message}</span>}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              {!isBusy ? (
                <button
                  type="button"
                  onClick={() => playSurahTilawat(selected)}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-base font-black text-white shadow-lg"
                >
                  🔊 ক্বারী দিয়ে শুনো
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopAudio}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/20 text-base font-bold text-rose-200"
                >
                  ⏹ থামাও
                </button>
              )}

              {!memorized.includes(selected.id) ? (
                <button
                  type="button"
                  onClick={() => setMemorized((p) => [...p, selected.id])}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold"
                >
                  ✅ মুখস্থ হয়েছে
                </button>
              ) : (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 py-3 text-center text-sm font-bold text-emerald-300">
                  ✅ মুখস্থ!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isBusy && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0d0a2e]/95 p-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {status.phase === 'loading' ? '⬇️ ডাউনলোড/স্ট্রিম…' : '▶️ তিলাওয়াত চলছে'}
              </p>
              <p className="truncate text-xs text-amber-200/80">
                {'message' in status ? status.message : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={stopAudio}
              className="shrink-0 rounded-full bg-rose-500/25 px-4 py-2 text-sm font-bold text-rose-200"
            >
              থামাও
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
