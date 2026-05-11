'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const swarBarna = [
    { letter: 'অ', word: 'অজগর', emoji: '🐍', color: 'from-red-400 to-rose-500', audio: 'o' },
    { letter: 'আ', word: 'আম', emoji: '🥭', color: 'from-orange-400 to-amber-500', audio: 'aa' },
    { letter: 'ই', word: 'ইঁদুর', emoji: '🐭', color: 'from-yellow-400 to-lime-500', audio: 'i' },
    { letter: 'ঈ', word: 'ঈগল', emoji: '🦅', color: 'from-green-400 to-emerald-500', audio: 'ii' },
    { letter: 'উ', word: 'উট', emoji: '🐪', color: 'from-teal-400 to-cyan-500', audio: 'u' },
    { letter: 'ঊ', word: 'ঊষা', emoji: '🌅', color: 'from-blue-400 to-indigo-500', audio: 'uu' },
    { letter: 'এ', word: 'এক', emoji: '1️⃣', color: 'from-violet-400 to-purple-500', audio: 'e' },
    { letter: 'ঐ', word: 'ঐক্য', emoji: '🤝', color: 'from-pink-400 to-rose-500', audio: 'oi' },
    { letter: 'ও', word: 'ওষুধ', emoji: '💊', color: 'from-red-400 to-orange-500', audio: 'o' },
    { letter: 'ঔ', word: 'ঔষধ', emoji: '🌿', color: 'from-amber-400 to-yellow-500', audio: 'ou' },
]

const byanjanBarna = [
    { letter: 'ক', word: 'কলা', emoji: '🍌', color: 'from-yellow-400 to-amber-500', audio: 'ko' },
    { letter: 'খ', word: 'খরগোশ', emoji: '🐰', color: 'from-pink-400 to-rose-500', audio: 'kho' },
    { letter: 'গ', word: 'গরু', emoji: '🐄', color: 'from-amber-400 to-orange-500', audio: 'go' },
    { letter: 'ঘ', word: 'ঘড়ি', emoji: '⏰', color: 'from-blue-400 to-cyan-500', audio: 'gho' },
    { letter: 'ঙ', word: 'বাংলা', emoji: '🇧🇩', color: 'from-green-400 to-emerald-500', audio: 'umoh' },
    { letter: 'চ', word: 'চাঁদ', emoji: '🌙', color: 'from-indigo-400 to-blue-500', audio: 'cho' },
    { letter: 'ছ', word: 'ছাগল', emoji: '🐐', color: 'from-teal-400 to-cyan-500', audio: 'chho' },
    { letter: 'জ', word: 'জাহাজ', emoji: '🚢', color: 'from-violet-400 to-purple-500', audio: 'borgijo' },
    { letter: 'ঝ', word: 'ঝড়', emoji: '⛈️', color: 'from-gray-400 to-slate-500', audio: 'jho' },
    { letter: 'ঞ', word: 'জ্ঞান', emoji: '📚', color: 'from-rose-400 to-pink-500', audio: 'neoh' },
    { letter: 'ট', word: 'টমেটো', emoji: '🍅', color: 'from-red-400 to-rose-500',audio: 'tto' },
    { letter: 'ঠ', word: 'ঠোঁট', emoji: '👄', color: 'from-pink-400 to-red-500', audio: 'ttho' },
    { letter: 'ড', word: 'ডিম', emoji: '🥚', color: 'from-yellow-400 to-amber-500', audio: 'ddo' },
    { letter: 'ঢ', word: 'ঢাক', emoji: '🥁', color: 'from-orange-400 to-amber-500',audio: 'ddho' },
    { letter: 'ণ', word: 'তৃণ', emoji: '🌿', color: 'from-green-400 to-lime-500', audio: 'moddhano' },
    { letter: 'ত', word: 'তরমুজ', emoji: '🍉', color: 'from-green-400 to-emerald-500', audio: 'to' },
    { letter: 'থ', word: 'থালা', emoji: '🍽️', color: 'from-blue-400 to-indigo-500', audio: 'tho' },
    { letter: 'দ', word: 'দাঁত', emoji: '🦷', color: 'from-cyan-400 to-blue-500', audio: 'ddo' },
    { letter: 'ধ', word: 'ধান', emoji: '🌾', color: 'from-amber-400 to-yellow-500', audio: 'ddho' },
    { letter: 'ন', word: 'নৌকা', emoji: '⛵', color: 'from-teal-400 to-cyan-500', audio: 'dontono' },
    { letter: 'প', word: 'পাখি', emoji: '🐦', color: 'from-sky-400 to-blue-500', audio: 'po' },
    { letter: 'ফ', word: 'ফুল', emoji: '🌸', color: 'from-pink-400 to-rose-500', audio: 'pho' },
    { letter: 'ব', word: 'বাঘ', emoji: '🐯', color: 'from-orange-400 to-amber-500', audio: 'bo' },
    { letter: 'ভ', word: 'ভালুক', emoji: '🐻', color: 'from-amber-600 to-yellow-700', audio: 'bho' },
    { letter: 'ম', word: 'মাছ', emoji: '🐟', color: 'from-blue-400 to-cyan-500', audio: 'mmo' },
    { letter: 'য', word: 'যন্ত্র', emoji: '⚙️', color: 'from-gray-400 to-slate-500', audio: 'zho' },
    { letter: 'র', word: 'রকেট', emoji: '🚀', color: 'from-violet-400 to-purple-500', audio: 'ro' },
    { letter: 'ল', word: 'লেবু', emoji: '🍋', color: 'from-yellow-400 to-lime-500', audio: 'lo' },
    { letter: 'শ', word: 'শাপলা', emoji: '🌺', color: 'from-pink-400 to-rose-500', audio: 'talibassho' },
    { letter: 'ষ', word: 'ষাঁড়', emoji: '🐂', color: 'from-red-400 to-rose-500', audio: 'mordhannosoh' },
    { letter: 'স', word: 'সূর্য', emoji: '☀️', color: 'from-yellow-400 to-orange-500', audio: 'dontossoh' },
    { letter: 'হ', word: 'হাতি', emoji: '🐘', color: 'from-gray-400 to-slate-500', audio: 'ho' },
]

export default function BanglaBarnaPage() {
    const [activeTab, setActiveTab] = useState<'swar' | 'byanjan'>('swar')
    const [selectedLetter, setSelectedLetter] = useState<{ letter: string; word: string; emoji: string; color: string; audio?: string } | null>(null)
    const [learnedLetters, setLearnedLetters] = useState<string[]>([])
    const [showCelebration, setShowCelebration] = useState(false)

    const currentBarna = activeTab === 'swar' ? swarBarna : byanjanBarna

    const handleLetterClick = (letter: { letter: string; word: string; emoji: string; color: string; audio?: string }) => {
        setSelectedLetter(letter)
        if (!learnedLetters.includes(letter.letter)) {
            setLearnedLetters(prev => [...prev, letter.letter])
            if ((learnedLetters.length + 1) % 5 === 0) {
                setShowCelebration(true)
                setTimeout(() => setShowCelebration(false), 3000)
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white">

            {/* Celebration */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.5, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0.5 }}
                            className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 text-center max-w-xs"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: 3, duration: 0.5 }}
                                className="text-7xl mb-3"
                            >
                                🏆
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-1">শাবাশ!</h2>
                            <p className="text-yellow-100">তুমি {learnedLetters.length}টি বর্ণ শিখেছো!</p>
                            <div className="flex justify-center gap-1 mt-3">
                                {[...Array(3)].map((_, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.2 }}
                                        className="text-2xl"
                                    >
                                        ⭐
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0d0a2e]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link
                        href="/dashboard/student/kids-zone/learn"
                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
                    >
                        ← ফিরে যাও
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full">
                            ⭐ {learnedLetters.length} বর্ণ শেখা হয়েছে
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-6xl mb-3"
                    >
                        🔤
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-1">বাংলা বর্ণমালা</h1>
                    <p className="text-gray-400 text-sm">বর্ণে click করো শিখতে!</p>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-3 mb-6 bg-white/5 rounded-2xl p-1.5">
                    {[
                        { key: 'swar', label: '🌟 স্বরবর্ণ', count: swarBarna.length },
                        { key: 'byanjan', label: '📚 ব্যঞ্জনবর্ণ', count: byanjanBarna.length },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key as 'swar' | 'byanjan'); setSelectedLetter(null) }}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.key
                                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* Selected Letter Detail */}
                <AnimatePresence mode="wait">
                    {selectedLetter && (
                        <motion.div
                            key={selectedLetter.letter}
                            initial={{ opacity: 0, scale: 0.8, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="mb-6"
                        >
                            <div className={`rounded-3xl bg-gradient-to-br ${selectedLetter.color} p-1`}>
                                <div className="rounded-3xl bg-[#0f0f2a] p-6 text-center">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                        transition={{ repeat: 2, duration: 0.5 }}
                                        className="text-8xl font-bold text-white mb-3"
                                        style={{ fontFamily: 'serif' }}
                                    >
                                        {selectedLetter.letter}
                                    </motion.div>
                                    <div className="text-6xl mb-3">{selectedLetter.emoji}</div>
                                    <p className={`text-2xl font-bold bg-gradient-to-r ${selectedLetter.color} bg-clip-text text-transparent mb-2`}>
                                        {selectedLetter.word}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        {selectedLetter.letter} দিয়ে {selectedLetter.word} হয়
                                    </p>

                                    {learnedLetters.includes(selectedLetter.letter) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-3 inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold"
                                        >
                                            ✅ শেখা হয়েছে!
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Letters Grid */}
                <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                    {currentBarna.map((item, i) => {
                        const learned = learnedLetters.includes(item.letter)
                        return (
                            <motion.button
                                key={item.letter}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.03 }}
                                whileHover={{ scale: 1.1, y: -4 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleLetterClick(item)}
                                className={`relative rounded-2xl p-3 text-center transition-all ${selectedLetter?.letter === item.letter
                                    ? `bg-gradient-to-br ${item.color} shadow-lg`
                                    : learned
                                        ? 'bg-emerald-500/20 border border-emerald-500/30'
                                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {learned && (
                                    <div className="absolute -top-1 -right-1 text-sm">⭐</div>
                                )}
                                <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'serif' }}>
                                    {item.letter}
                                </div>
                                <div className="text-lg">{item.emoji}</div>
                                <div className="text-xs text-gray-400 mt-0.5 truncate">{item.word}</div>
                            </motion.button>
                        )
                    })}
                </div>

                {/* Progress Summary */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4"
                >
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>
                            {activeTab === 'swar' ? 'স্বরবর্ণ' : 'ব্যঞ্জনবর্ণ'} অগ্রগতি
                        </span>
                        <span>
                            {learnedLetters.filter(l =>
                                currentBarna.map(b => b.letter).includes(l)
                            ).length}/{currentBarna.length}
                        </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                        <motion.div
                            animate={{
                                width: `${(learnedLetters.filter(l =>
                                    currentBarna.map(b => b.letter).includes(l)
                                ).length / currentBarna.length) * 100}%`
                            }}
                            className="bg-gradient-to-r from-red-400 to-rose-500 h-3 rounded-full"
                        />
                    </div>
                </motion.div>

                {/* Next: Quiz Button */}
                {learnedLetters.length >= 5 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4"
                    >
                        <Link href="/dashboard/student/kids-zone/learn/bangla/quiz">
                            <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-lg shadow-lg shadow-red-500/30">
                                🎯 Quiz দাও! ({learnedLetters.length}টি বর্ণ শিখেছো)
                            </button>
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    )
}