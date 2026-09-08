'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSpeech } from '@/hooks/useSpeech'

type Topic = 'continents' | 'countries' | 'animals' | 'planets' | 'weather'

const CONTINENTS = [
  { name: 'এশিয়া', en: 'Asia', emoji: '🌏', fact: 'সবচেয়ে বড় মহাদেশ। বাংলাদেশ এশিয়ায়!', color: 'from-emerald-400 to-green-600' },
  { name: 'আফ্রিকা', en: 'Africa', emoji: '🌍', fact: 'সিংহ, জিরাফ ও হাতির দেশ।', color: 'from-amber-400 to-orange-600' },
  { name: 'ইউরোপ', en: 'Europe', emoji: '🏰', fact: 'অনেক সুন্দর শহর ও দুর্গ আছে।', color: 'from-sky-400 to-blue-600' },
  { name: 'উত্তর আমেরিকা', en: 'North America', emoji: '🗽', fact: 'আমেরিকা ও কানাডা এখানে।', color: 'from-red-400 to-rose-600' },
  { name: 'দক্ষিণ আমেরিকা', en: 'South America', emoji: '🦜', fact: 'আমাজন বন ও আন্দিজ পর্বত।', color: 'from-lime-400 to-green-600' },
  { name: 'অস্ট্রেলিয়া', en: 'Australia', emoji: '🦘', fact: 'ক্যাঙ্গারু ও কোয়ালার দেশ।', color: 'from-yellow-400 to-amber-600' },
  { name: 'অ্যান্টার্কটিকা', en: 'Antarctica', emoji: '🐧', fact: 'বরফে ঢাকা, পেঙ্গুইনের বাড়ি।', color: 'from-cyan-300 to-blue-500' },
]

const COUNTRIES = [
  { name: 'বাংলাদেশ', en: 'Bangladesh', flag: '🇧🇩', capital: 'ঢাকা', fact: 'আমাদের দেশ! সবুজ ও নদীর দেশ।', color: 'from-green-400 to-emerald-600' },
  { name: 'ভারত', en: 'India', flag: '🇮🇳', capital: 'নয়াদিল্লি', fact: 'পড়শি দেশ, অনেক ভাষা ও সংস্কৃতি।', color: 'from-orange-400 to-amber-600' },
  { name: 'সৌদি আরব', en: 'Saudi Arabia', flag: '🇸🇦', capital: 'রিয়াদ', fact: 'মক্কা ও মদিনা এখানে।', color: 'from-emerald-500 to-teal-700' },
  { name: 'জাপান', en: 'Japan', flag: '🇯🇵', capital: 'টোকিও', fact: 'সাকুরা ফুল ও রোবটের দেশ।', color: 'from-rose-400 to-red-500' },
  { name: 'চীন', en: 'China', flag: '🇨🇳', capital: 'বেইজিং', fact: 'মহাপ্রাচীর ও পান্ডার দেশ।', color: 'from-red-500 to-rose-600' },
  { name: 'মার্কিন যুক্তরাষ্ট্র', en: 'USA', flag: '🇺🇸', capital: 'ওয়াশিংটন ডিসি', fact: 'বড় দেশ, অনেক রাজ্য।', color: 'from-blue-400 to-indigo-600' },
  { name: 'মিশর', en: 'Egypt', flag: '🇪🇬', capital: 'কায়রো', fact: 'পিরামিড ও নীল নদ।', color: 'from-yellow-500 to-amber-700' },
  { name: 'ব্রাজিল', en: 'Brazil', flag: '🇧🇷', capital: 'ব্রাসিলিয়া', fact: 'ফুটবল ও আমাজন বন।', color: 'from-green-500 to-lime-600' },
]

const ANIMALS = [
  { name: 'বাঘ', en: 'Tiger', emoji: '🐯', place: 'সুন্দরবন, বাংলাদেশ', fact: 'বাংলাদেশের জাতীয় পশু।', color: 'from-orange-400 to-amber-600' },
  { name: 'হাতি', en: 'Elephant', emoji: '🐘', place: 'এশিয়া ও আফ্রিকা', fact: 'বড় কান ও লম্বা শুঁড়।', color: 'from-slate-400 to-gray-600' },
  { name: 'সিংহ', en: 'Lion', emoji: '🦁', place: 'আফ্রিকা', fact: 'জঙ্গলের রাজা।', color: 'from-yellow-400 to-orange-500' },
  { name: 'জিরাফ', en: 'Giraffe', emoji: '🦒', place: 'আফ্রিকা', fact: 'সবচেয়ে লম্বা প্রাণী।', color: 'from-amber-400 to-yellow-600' },
  { name: 'পেঙ্গুইন', en: 'Penguin', emoji: '🐧', place: 'অ্যান্টার্কটিকা', fact: 'উড়তে পারে না, সাঁতারে দারুণ।', color: 'from-sky-300 to-blue-500' },
  { name: 'ক্যাঙ্গারু', en: 'Kangaroo', emoji: '🦘', place: 'অস্ট্রেলিয়া', fact: 'লাফিয়ে চলে, পেটে থলি আছে।', color: 'from-rose-400 to-orange-500' },
  { name: 'পান্ডা', en: 'Panda', emoji: '🐼', place: 'চীন', fact: 'বাঁশ খেতে ভালোবাসে।', color: 'from-slate-300 to-zinc-500' },
  { name: 'ডলফিন', en: 'Dolphin', emoji: '🐬', place: 'সমুদ্র', fact: 'খুব বুদ্ধিমান জলজ প্রাণী।', color: 'from-cyan-400 to-blue-500' },
]

const PLANETS = [
  { name: 'সূর্য', en: 'Sun', emoji: '☀️', fact: 'সবচেয়ে কাছের তারা। আলো ও তাপ দেয়।', color: 'from-yellow-400 to-orange-500' },
  { name: 'পৃথিবী', en: 'Earth', emoji: '🌍', fact: 'আমাদের বাড়ি! নীল ও সবুজ গ্রহ।', color: 'from-blue-400 to-emerald-500' },
  { name: 'চাঁদ', en: 'Moon', emoji: '🌙', fact: 'পৃথিবীর উপগ্রহ। রাতে আলো দেয়।', color: 'from-slate-300 to-gray-500' },
  { name: 'মঙ্গল', en: 'Mars', emoji: '🔴', fact: 'লাল গ্রহ। বিজ্ঞানীরা খুঁজছেন।', color: 'from-red-400 to-rose-600' },
  { name: 'বৃহস্পতি', en: 'Jupiter', emoji: '🪐', fact: 'সবচেয়ে বড় গ্রহ।', color: 'from-amber-300 to-orange-600' },
  { name: 'শনি', en: 'Saturn', emoji: '💫', fact: 'সুন্দর রিং আছে।', color: 'from-yellow-200 to-amber-500' },
]

const WEATHER = [
  { name: 'রৌদ্রোজ্জ্বল', en: 'Sunny', emoji: '☀️', fact: 'সূর্য উজ্জ্বল। বাইরে খেলতে ভালো।', color: 'from-yellow-400 to-orange-500' },
  { name: 'বৃষ্টি', en: 'Rainy', emoji: '🌧️', fact: 'মেঘ থেকে পানি পড়ে। ছাতা নাও!', color: 'from-sky-400 to-blue-600' },
  { name: 'মেঘলা', en: 'Cloudy', emoji: '☁️', fact: 'আকাশ মেঘে ঢাকা।', color: 'from-slate-300 to-gray-500' },
  { name: 'ঝড়', en: 'Storm', emoji: '⛈️', fact: 'বজ্র ও বিদ্যুৎ। ঘরে থাকা ভালো।', color: 'from-violet-500 to-indigo-700' },
  { name: 'কুয়াশা', en: 'Foggy', emoji: '🌫️', fact: 'সব কিছু অস্পষ্ট দেখায়।', color: 'from-gray-300 to-slate-500' },
  { name: 'তুষার', en: 'Snow', emoji: '❄️', fact: 'বরফের টুকরো পড়ে। ঠান্ডা!', color: 'from-cyan-200 to-blue-400' },
]

const TABS: { id: Topic; label: string; emoji: string }[] = [
  { id: 'continents', label: 'মহাদেশ', emoji: '🌏' },
  { id: 'countries', label: 'দেশ', emoji: '🏳️' },
  { id: 'animals', label: 'প্রাণী', emoji: '🦁' },
  { id: 'planets', label: 'গ্রহ', emoji: '🪐' },
  { id: 'weather', label: 'আবহাওয়া', emoji: '🌤️' },
]

export default function WorldLearnPage() {
  const [tab, setTab] = useState<Topic>('continents')
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null)
  const [learned, setLearned] = useState<string[]>([])
  const { speak, stop, isSpeaking, isLoading, status } = useSpeech()

  const markLearned = (key: string) => {
    if (!learned.includes(key)) setLearned((p) => [...p, key])
  }

  const busy = isSpeaking || isLoading

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0d0a2e]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
          <Link
            href="/dashboard/student/kids-zone/learn"
            className="flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm"
          >
            ←
          </Link>
          <div className="text-center">
            <p className="text-sm font-bold">🌍 বিশ্ব শিখি</p>
            <p className="text-[10px] text-amber-300">মহাদেশ · দেশ · প্রাণী</p>
          </div>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-300">
            ⭐ {learned.length}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-5 pb-28">
        <div className="mb-5 text-center">
          <div className="mb-2 text-5xl">🌍</div>
          <h1 className="text-2xl font-black">বিশ্ব শেখার জগৎ</h1>
          <p className="mt-1 text-sm text-slate-400">ট্যাপ করো · শোনো · শেখো</p>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id)
                setSelected(null)
                stop()
              }}
              className={`shrink-0 rounded-2xl px-3 py-2 text-xs font-bold transition ${
                tab === t.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'border border-white/10 bg-white/5 text-slate-400'
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={String((selected as { name?: string }).name)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5"
            >
              <div
                className={`rounded-3xl bg-gradient-to-br p-1 ${
                  (selected as { color?: string }).color || 'from-amber-400 to-orange-500'
                }`}
              >
                <div className="rounded-3xl bg-[#0f0f2a] p-5 text-center">
                  <div className="mb-2 text-6xl">
                    {(selected as { emoji?: string; flag?: string }).emoji ||
                      (selected as { flag?: string }).flag}
                  </div>
                  <p className="text-xl font-black text-white">{(selected as { name: string }).name}</p>
                  <p className="text-sm text-slate-400">{(selected as { en?: string }).en}</p>
                  {(selected as { capital?: string }).capital && (
                    <p className="mt-1 text-xs text-amber-300">
                      রাজধানী: {(selected as { capital: string }).capital}
                    </p>
                  )}
                  {(selected as { place?: string }).place && (
                    <p className="mt-1 text-xs text-emerald-300">
                      📍 {(selected as { place: string }).place}
                    </p>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {(selected as { fact: string }).fact}
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        stop()
                        speak((selected as { name: string }).name, 'bn-BD')
                      }}
                      className="rounded-full border border-amber-500/30 bg-amber-500/20 px-4 py-2 text-xs font-bold text-amber-200"
                    >
                      {busy ? '⏳…' : '🔊 বাংলায় শোনো'}
                    </button>
                    {(selected as { en?: string }).en && (
                      <button
                        type="button"
                        onClick={() => {
                          stop()
                          speak((selected as { en: string }).en, 'en-US')
                        }}
                        className="rounded-full border border-sky-500/30 bg-sky-500/20 px-4 py-2 text-xs font-bold text-sky-200"
                      >
                        🔊 English
                      </button>
                    )}
                  </div>
                  {(status.phase === 'loading' || status.phase === 'playing') && (
                    <p className="mt-2 text-xs text-amber-200/80">
                      {'message' in status ? status.message : ''}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {tab === 'continents' && (
          <div className="grid grid-cols-2 gap-3">
            {CONTINENTS.map((c) => {
              const key = `c-${c.name}`
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setSelected(c)
                    markLearned(key)
                    stop()
                    speak(c.name, 'bn-BD')
                  }}
                  className={`rounded-2xl border p-4 text-center transition active:scale-[0.98] ${
                    learned.includes(key)
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className={`mx-auto mb-2 grid size-12 place-items-center rounded-xl bg-gradient-to-br text-2xl ${c.color}`}>
                    {c.emoji}
                  </div>
                  <p className="text-sm font-bold">{c.name}</p>
                  <p className="text-[10px] text-slate-400">{c.en}</p>
                </button>
              )
            })}
          </div>
        )}

        {tab === 'countries' && (
          <div className="grid grid-cols-2 gap-3">
            {COUNTRIES.map((c) => {
              const key = `co-${c.name}`
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setSelected(c)
                    markLearned(key)
                    stop()
                    speak(c.name, 'bn-BD')
                  }}
                  className={`rounded-2xl border p-4 text-center transition active:scale-[0.98] ${
                    learned.includes(key)
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="mb-2 text-3xl">{c.flag}</div>
                  <p className="text-sm font-bold">{c.name}</p>
                  <p className="text-[10px] text-slate-400">{c.en}</p>
                </button>
              )
            })}
          </div>
        )}

        {tab === 'animals' && (
          <div className="grid grid-cols-2 gap-3">
            {ANIMALS.map((a) => {
              const key = `a-${a.name}`
              return (
                <button
                  key={a.name}
                  type="button"
                  onClick={() => {
                    setSelected(a)
                    markLearned(key)
                    stop()
                    speak(a.name, 'bn-BD')
                  }}
                  className={`rounded-2xl border p-4 text-center transition active:scale-[0.98] ${
                    learned.includes(key)
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className={`mx-auto mb-2 grid size-12 place-items-center rounded-xl bg-gradient-to-br text-2xl ${a.color}`}>
                    {a.emoji}
                  </div>
                  <p className="text-sm font-bold">{a.name}</p>
                  <p className="text-[10px] text-slate-400">{a.en}</p>
                </button>
              )
            })}
          </div>
        )}

        {tab === 'planets' && (
          <div className="grid grid-cols-2 gap-3">
            {PLANETS.map((p) => {
              const key = `p-${p.name}`
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setSelected(p)
                    markLearned(key)
                    stop()
                    speak(p.name, 'bn-BD')
                  }}
                  className={`rounded-2xl border p-4 text-center transition active:scale-[0.98] ${
                    learned.includes(key)
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className={`mx-auto mb-2 grid size-12 place-items-center rounded-xl bg-gradient-to-br text-2xl ${p.color}`}>
                    {p.emoji}
                  </div>
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.en}</p>
                </button>
              )
            })}
          </div>
        )}

        {tab === 'weather' && (
          <div className="grid grid-cols-2 gap-3">
            {WEATHER.map((w) => {
              const key = `w-${w.name}`
              return (
                <button
                  key={w.name}
                  type="button"
                  onClick={() => {
                    setSelected(w)
                    markLearned(key)
                    stop()
                    speak(w.name, 'bn-BD')
                  }}
                  className={`rounded-2xl border p-4 text-center transition active:scale-[0.98] ${
                    learned.includes(key)
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className={`mx-auto mb-2 grid size-12 place-items-center rounded-xl bg-gradient-to-br text-2xl ${w.color}`}>
                    {w.emoji}
                  </div>
                  <p className="text-sm font-bold">{w.name}</p>
                  <p className="text-[10px] text-slate-400">{w.en}</p>
                </button>
              )
            })}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-600">প্রতিটি কার্ডে ট্যাপ করো — শেখা শুরু!</p>
      </div>
    </div>
  )
}
