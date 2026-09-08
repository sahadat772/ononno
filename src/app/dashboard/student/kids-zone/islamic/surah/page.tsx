'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { buildAyahAudioUrls } from '@/lib/quran-audio'
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

/** Common short surahs for kids — used as fallback + number map */
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
    const keys = [s.title.toLowerCase(), s.title_bn, String(s.surah)]
    if (keys.some((k) => blob.includes(k.toLowerCase()))) {
      return { surah: s.surah, ayahs: s.ayahs }
    }
  }
  // common bn keywords
  if (blob.includes('ফাতিহা') || blob.includes('fatih')) return { surah: 1, ayahs: 7 }
  if (blob.includes('ইখলাস') || blob.includes('ikhlas')) return { surah: 112, ayahs: 4 }
  if (blob.includes('ফালাক') || blob.includes('falaq')) return { surah: 113, ayahs: 5 }
  if (blob.includes('নাস') || blob.includes('nas')) return { surah: 114, ayahs: 6 }
  if (blob.includes('কাওসার') || blob.includes('kawthar') || blob.includes('kauthar'))
    return { surah: 108, ayahs: 3 }
  if (blob.includes('আসর') || blob.includes('asr')) return { surah: 103, ayahs: 3 }
  if (blob.includes('কাফিরুন') || blob.includes('kafirun')) return { surah: 109, ayahs: 6 }
  if (blob.includes('নাসর') || blob.includes('nasr')) return { surah: 110, ayahs: 3 }
  if (blob.includes('লাহাব') || blob.includes('masad') || blob.includes('tabbat'))
    return { surah: 111, ayahs: 5 }
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
  const [learned, setLearned] = useState<string[]>([])
  const [memorized, setMemorized] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('arabic')
  const [qariId, setQariId] = useState(QARIS[0].id)
  const [showQari, setShowQari] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [ayahIndex, setAyahIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const stopFlag = useRef(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/kids/islamic/surah')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        const list: KidsIslamicLesson[] =
          d.lessons && d.lessons.length > 0
            ? d.lessons
            : SHORT_SURAHS.map(toLessonFromMeta)
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
      stopAudio()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopAudio = useCallback(() => {
    stopFlag.current = true
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    setPlaying(false)
  }, [])

  const playUrl = (url: string): Promise<void> =>
    new Promise((resolve, reject) => {
      stopFlag.current = false
      const audio = new Audio(url)
      audioRef.current = audio
      audio.preload = 'auto'
      audio.onended = () => resolve()
      audio.onerror = () => reject(new Error('load failed'))
      void audio.play().catch(reject)
    })

  const tryUrls = async (urls: string[]) => {
    let lastErr: unknown
    for (const url of urls) {
      if (stopFlag.current) return
      try {
        await playUrl(url)
        return
      } catch (e) {
        lastErr = e
      }
    }
    throw lastErr || new Error('all failed')
  }

  const playSurahTilawat = async (lesson: KidsIslamicLesson) => {
    stopAudio()
    setAudioError(null)
    setPlaying(true)
    setAyahIndex(0)

    // Custom audio_url from DB takes priority (single file)
    if (lesson.audio_url) {
      try {
        await tryUrls([lesson.audio_url])
        setPlaying(false)
        return
      } catch {
        // fall through to qari
      }
    }

    const meta = resolveSurahNumber(lesson)
    if (!meta) {
      setPlaying(false)
      setAudioError('এই সূরার ক্বারী অডিও ম্যাপ করা নেই।')
      return
    }

    try {
      for (let a = 1; a <= meta.ayahs; a++) {
        if (stopFlag.current) break
        setAyahIndex(a)
        const urls = buildAyahAudioUrls(qariId, meta.surah, a)
        await tryUrls(urls)
      }
    } catch {
      if (!stopFlag.current) {
        setAudioError('অডিও লোড হয়নি। অন্য ক্বারী চেষ্টা করো।')
      }
    } finally {
      if (!stopFlag.current) setPlaying(false)
      setAyahIndex(0)
    }
  }

  const handleSelect = (lesson: KidsIslamicLesson) => {
    stopAudio()
    setSelected(lesson)
    setActiveTab('arabic')
    setAudioError(null)
    if (!learned.includes(lesson.id)) {
      setLearned((prev) => [...prev, lesson.id])
    }
  }

  const handleMemorized = (id: string) => {
    if (!memorized.includes(id)) setMemorized((prev) => [...prev, id])
  }

  const progress =
    lessons.length > 0 ? Math.round((memorized.length / lessons.length) * 100) : 0

  const selectedMeta = selected ? resolveSurahNumber(selected) : null
  const currentQari = QARIS.find((q) => q.id === qariId) || QARIS[0]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0d0a2e] to-[#070b14]">
        <div className="text-center">
          <div className="mb-3 text-4xl">📖</div>
          <p className="text-amber-400">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0a2e] via-[#0a1628] to-[#070b14] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0d0a2e]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
          <Link
            href="/dashboard/student/kids-zone/islamic"
            className="flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-slate-300"
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

      <div className="mx-auto max-w-2xl px-4 py-5 pb-10">
        <div className="mb-5 text-center">
          <div className="mb-2 text-5xl">📖</div>
          <h1 className="text-2xl font-black">সূরা শিখি</h1>
          <p className="text-amber-300">السورة</p>
          <p className="mt-1 text-sm text-slate-400">ছোট সূরা · আসল ক্বারীর আওয়াজ</p>
        </div>

        {/* Qari selector */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowQari((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left"
          >
            <div>
              <p className="text-[11px] text-amber-300/80">ক্বারী</p>
              <p className="font-bold text-white">{currentQari.name}</p>
              <p className="text-xs text-slate-400" dir="rtl">
                {currentQari.arabic}
              </p>
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
                  <span>
                    <span className="font-semibold">{q.name}</span>
                    <span className="ml-2 text-xs text-slate-500" dir="rtl">
                      {q.arabic}
                    </span>
                  </span>
                  {qariId === q.id && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex justify-between text-sm text-slate-400">
            <span>মুখস্থ অগ্রগতি</span>
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

        {/* Surah chips */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
          {lessons.map((lesson, i) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => handleSelect(lesson)}
              className={`min-w-[92px] shrink-0 rounded-2xl border px-3 py-3 text-center transition ${
                selected?.id === lesson.id
                  ? 'border-amber-500/50 bg-amber-500/20'
                  : memorized.includes(lesson.id)
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-white/10 bg-white/5'
              }`}
            >
              <p className="text-lg">{memorized.includes(lesson.id) ? '✅' : '📖'}</p>
              <p className="truncate text-xs font-semibold text-white">{lesson.title_bn}</p>
              <p className="text-[10px] text-slate-500">{i + 1}</p>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-orange-500/10 p-5">
                <div className="mb-4 text-center">
                  <span className="mb-1 inline-block rounded-full border border-amber-500/30 bg-amber-500/20 px-4 py-1.5 text-sm font-semibold text-amber-300">
                    {selected.title_bn}
                  </span>
                  <p className="text-xs text-slate-400">{selected.title}</p>
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
                      className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                        activeTab === tab.key
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow'
                          : 'text-slate-400'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'arabic' && (
                    <motion.div
                      key="arabic"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <p
                        className="mb-4 text-xl leading-loose text-white md:text-2xl"
                        style={{ fontFamily: 'serif', direction: 'rtl', lineHeight: '2.5' }}
                      >
                        {selected.arabic_text}
                      </p>
                    </motion.div>
                  )}
                  {activeTab === 'pronunciation' && (
                    <motion.div key="pron" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                        <p className="text-sm italic leading-loose text-amber-100">
                          {selected.pronunciation || 'উচ্চারণ শীঘ্রই আসছে'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                  {activeTab === 'meaning' && (
                    <motion.div key="mean" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                        <p className="text-sm leading-loose text-slate-200">
                          {selected.bangla_translation}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {audioError && (
                  <p className="mt-3 text-center text-sm text-rose-300">{audioError}</p>
                )}
                {playing && ayahIndex > 0 && (
                  <p className="mt-3 text-center text-xs text-amber-300">
                    চলছে · আয়াত {ayahIndex}
                    {selectedMeta ? `/${selectedMeta.ayahs}` : ''}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {!playing ? (
                    <button
                      type="button"
                      onClick={() => void playSurahTilawat(selected)}
                      className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-base font-black text-white shadow-lg shadow-amber-500/25"
                    >
                      🔊 ক্বারী দিয়ে শুনো
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopAudio}
                      className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/20 text-base font-bold text-rose-200"
                    >
                      ⏹ থামাও
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => void playSurahTilawat(selected)}
                    disabled={playing}
                    className="rounded-xl border border-white/15 bg-white/10 py-3 text-sm font-semibold disabled:opacity-50"
                  >
                    🔁 আবার
                  </button>

                  {!memorized.includes(selected.id) ? (
                    <button
                      type="button"
                      onClick={() => handleMemorized(selected.id)}
                      className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-white"
                    >
                      ✅ মুখস্থ
                    </button>
                  ) : (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 py-3 text-center text-sm font-bold text-emerald-300">
                      ✅ মুখস্থ!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {memorized.length === lessons.length && lessons.length > 0 && (
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-orange-500/10 p-5 text-center">
            <p className="text-3xl">🎉</p>
            <p className="mt-1 text-lg font-bold text-amber-300">মাশাআল্লাহ! সব সূরা মুখস্থ!</p>
            <p className="mt-1 text-sm text-slate-400">আল্লাহ তোমার হিফজ কবুল করুন।</p>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-600">অনন্য · সূরা শিখি · ক্বারী অডিও</p>
      </div>
    </div>
  )
}
