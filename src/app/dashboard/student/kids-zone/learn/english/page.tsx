'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const alphabets = [
    { letter: 'A', word: 'Apple', bangla: 'আপেল', emoji: '🍎', color: 'from-red-400 to-rose-500', sound: 'a' },
    { letter: 'B', word: 'Ball', bangla: 'বল', emoji: '⚽', color: 'from-blue-400 to-indigo-500', sound: 'b' },
    { letter: 'C', word: 'Cat', bangla: 'বিড়াল', emoji: '🐱', color: 'from-orange-400 to-amber-500', sound: 'c' },
    { letter: 'D', word: 'Dog', bangla: 'কুকুর', emoji: '🐶', color: 'from-amber-400 to-yellow-500', sound: 'd' },
    { letter: 'E', word: 'Elephant', bangla: 'হাতি', emoji: '🐘', color: 'from-gray-400 to-slate-500', sound: 'e' },
    { letter: 'F', word: 'Fish', bangla: 'মাছ', emoji: '🐟', color: 'from-cyan-400 to-blue-500', sound: 'f' },
    { letter: 'G', word: 'Goat', bangla: 'ছাগল', emoji: '🐐', color: 'from-green-400 to-emerald-500', sound: 'g' },
    { letter: 'H', word: 'Hen', bangla: 'মুরগি', emoji: '🐔', color: 'from-yellow-400 to-orange-500', sound: 'h' },
    { letter: 'I', word: 'Ice cream', bangla: 'আইসক্রিম', emoji: '🍦', color: 'from-pink-400 to-rose-500', sound: 'i' },
    { letter: 'J', word: 'Jug', bangla: 'জগ', emoji: '🫗', color: 'from-violet-400 to-purple-500', sound: 'j' },
    { letter: 'K', word: 'Kite', bangla: 'ঘুড়ি', emoji: '🪁', color: 'from-teal-400 to-cyan-500', sound: 'k' },
    { letter: 'L', word: 'Lion', bangla: 'সিংহ', emoji: '🦁', color: 'from-amber-400 to-yellow-500', sound: 'l' },
    { letter: 'M', word: 'Monkey', bangla: 'বানর', emoji: '🐒', color: 'from-orange-400 to-amber-500', sound: 'm' },
    { letter: 'N', word: 'Nest', bangla: 'বাসা', emoji: '🪺', color: 'from-lime-400 to-green-500', sound: 'n' },
    { letter: 'O', word: 'Orange', bangla: 'কমলা', emoji: '🍊', color: 'from-orange-400 to-red-500', sound: 'o' },
    { letter: 'P', word: 'Parrot', bangla: 'টিয়া পাখি', emoji: '🦜', color: 'from-green-400 to-teal-500', sound: 'p' },
    { letter: 'Q', word: 'Queen', bangla: 'রানী', emoji: '👸', color: 'from-pink-400 to-violet-500', sound: 'q' },
    { letter: 'R', word: 'Rabbit', bangla: 'খরগোশ', emoji: '🐰', color: 'from-rose-400 to-pink-500', sound: 'r' },
    { letter: 'S', word: 'Sun', bangla: 'সূর্য', emoji: '☀️', color: 'from-yellow-400 to-orange-500', sound: 's' },
    { letter: 'T', word: 'Tiger', bangla: 'বাঘ', emoji: '🐯', color: 'from-orange-400 to-amber-500', sound: 't' },
    { letter: 'U', word: 'Umbrella', bangla: 'ছাতা', emoji: '☂️', color: 'from-blue-400 to-indigo-500', sound: 'u' },
    { letter: 'V', word: 'Van', bangla: 'ভ্যান', emoji: '🚐', color: 'from-violet-400 to-blue-500', sound: 'v' },
    { letter: 'W', word: 'Whale', bangla: 'তিমি', emoji: '🐋', color: 'from-cyan-400 to-blue-500', sound: 'w' },
    { letter: 'X', word: 'X-ray', bangla: 'এক্স-রে', emoji: '🩻', color: 'from-gray-400 to-slate-500', sound: 'x' },
    { letter: 'Y', word: 'Yak', bangla: 'ইয়াক', emoji: '🐂', color: 'from-amber-600 to-yellow-600', sound: 'y' },
    { letter: 'Z', word: 'Zebra', bangla: 'জেব্রা', emoji: '🦓', color: 'from-gray-400 to-zinc-500', sound: 'z' },
]

export default function EnglishABCPage() {
    const [selectedLetter, setSelectedLetter] = useState<typeof alphabets[0] | null>(null)
    const [learnedLetters, setLearnedLetters] = useState<string[]>([])
    const [showCelebration, setShowCelebration] = useState(false)
    const [activeView, setActiveView] = useState<'grid' | 'card'>('grid')
    const [cardIndex, setCardIndex] = useState(0)

    const handleLetterClick = (letter: typeof alphabets[0]) => {
        setSelectedLetter(letter)
        if (!learnedLetters.includes(letter.letter)) {
            const newLearned = [...learnedLetters, letter.letter]
            setLearnedLetters(newLearned)
            if (newLearned.length % 5 === 0) {
                setShowCelebration(true)
                setTimeout(() => setShowCelebration(false), 3000)
            }
        }
    }

    const progress = Math.round((learnedLetters.length / alphabets.length) * 100)

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
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.5 }}
                            className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-3xl p-8 text-center max-w-xs"
                        >
                            <motion.div
                                animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.3, 1] }}
                                transition={{ repeat: 3, duration: 0.5 }}
                                className="text-7xl mb-3"
                            >
                                🌟
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-1">Awesome!</h2>
                            <p className="text-blue-100">{learnedLetters.length} letters learned!</p>
                            <div className="flex justify-center gap-1 mt-3">
                                {[...Array(3)].map((_, i) => (
                                    <motion.span key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.2 }} className="text-2xl">⭐</motion.span>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0d0a2e]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard/student/kids-zone/learn"
                        className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                        ← ফিরে যাও
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full">
                            ⭐ {learnedLetters.length}/26
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* Title */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                    <motion.div
                        animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-6xl mb-3"
                    >
                        🔡
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-1">English ABC</h1>
                    <p className="text-gray-400 text-sm">Letter click করো শিখতে!</p>
                </motion.div>

                {/* View Toggle */}
                <div className="flex gap-3 mb-6 bg-white/5 rounded-2xl p-1.5">
                    {[
                        { key: 'grid', label: '⊞ Grid View' },
                        { key: 'card', label: '🃏 Card View' },
                    ].map(view => (
                        <button
                            key={view.key}
                            onClick={() => setActiveView(view.key as 'grid' | 'card')}
                            title={view.label}
                            aria-label={view.label}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView === view.key
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {view.label}
                        </button>
                    ))}
                </div>

                {/* Selected Letter Detail */}
                <AnimatePresence mode="wait">
                    {selectedLetter && activeView === 'grid' && (
                        <motion.div
                            key={selectedLetter.letter}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="mb-6"
                        >
                            <div className={`rounded-3xl bg-gradient-to-br ${selectedLetter.color} p-1`}>
                                <div className="rounded-3xl bg-[#0f0f2a] p-6 text-center">
                                    <div className="flex items-center justify-center gap-6 mb-4">
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="text-8xl font-bold text-white"
                                        >
                                            {selectedLetter.letter}
                                        </motion.div>
                                        <div className="text-left">
                                            <div className="text-5xl mb-1">{selectedLetter.emoji}</div>
                                            <p className={`text-2xl font-bold bg-gradient-to-r ${selectedLetter.color} bg-clip-text text-transparent`}>
                                                {selectedLetter.word}
                                            </p>
                                            <p className="text-gray-400 text-sm">{selectedLetter.bangla}</p>
                                        </div>
                                    </div>

                                    {/* Lowercase */}
                                    <div className="flex items-center justify-center gap-8 mb-3">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 mb-1">Capital</p>
                                            <p className={`text-4xl font-bold bg-gradient-to-r ${selectedLetter.color} bg-clip-text text-transparent`}>
                                                {selectedLetter.letter}
                                            </p>
                                        </div>
                                        <div className="text-gray-600 text-2xl">↔</div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 mb-1">Small</p>
                                            <p className={`text-4xl font-bold bg-gradient-to-r ${selectedLetter.color} bg-clip-text text-transparent`}>
                                                {selectedLetter.letter.toLowerCase()}
                                            </p>
                                        </div>
                                    </div>

                                    {learnedLetters.includes(selectedLetter.letter) && (
                                        <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold">
                                            ✅ Learned!
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grid View */}
                {activeView === 'grid' && (
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                        {alphabets.map((item, i) => {
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
                                    {learned && <div className="absolute -top-1 -right-1 text-sm">⭐</div>}
                                    <div className="text-3xl font-bold text-white mb-1">{item.letter}</div>
                                    <div className="text-lg">{item.emoji}</div>
                                    <div className="text-xs text-gray-400 mt-0.5 truncate">{item.word}</div>
                                </motion.button>
                            )
                        })}
                    </div>
                )}

                {/* Card View — Flashcard Style */}
                {activeView === 'card' && (
                    <div className="text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={cardIndex}
                                initial={{ opacity: 0, x: 100, rotateY: 90 }}
                                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                                exit={{ opacity: 0, x: -100, rotateY: -90 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => handleLetterClick(alphabets[cardIndex])}
                                className={`rounded-3xl bg-gradient-to-br ${alphabets[cardIndex].color} p-1 cursor-pointer mb-6`}
                            >
                                <div className="rounded-3xl bg-[#0f0f2a] p-10 text-center">
                                    <div className="text-9xl font-bold text-white mb-4">
                                        {alphabets[cardIndex].letter}
                                    </div>
                                    <div className="text-7xl mb-4">{alphabets[cardIndex].emoji}</div>
                                    <p className={`text-3xl font-bold bg-gradient-to-r ${alphabets[cardIndex].color} bg-clip-text text-transparent mb-2`}>
                                        {alphabets[cardIndex].word}
                                    </p>
                                    <p className="text-gray-400">{alphabets[cardIndex].bangla}</p>

                                    {/* Capital & Small */}
                                    <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-white/10">
                                        <div>
                                            <p className="text-xs text-gray-500">Capital</p>
                                            <p className="text-4xl font-bold text-white">{alphabets[cardIndex].letter}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Small</p>
                                            <p className="text-4xl font-bold text-white">{alphabets[cardIndex].letter.toLowerCase()}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation */}
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setCardIndex(Math.max(0, cardIndex - 1))}
                                disabled={cardIndex === 0}
                                className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white disabled:opacity-30 text-xl font-bold"
                            >
                                ←
                            </motion.button>

                            <span className="text-gray-400 text-sm">
                                {cardIndex + 1} / {alphabets.length}
                            </span>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setCardIndex(Math.min(alphabets.length - 1, cardIndex + 1))}
                                disabled={cardIndex === alphabets.length - 1}
                                className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white disabled:opacity-30 text-xl font-bold"
                            >
                                →
                            </motion.button>
                        </div>

                        {/* Dot indicators */}
                        <div className="flex justify-center gap-1 flex-wrap max-w-xs mx-auto">
                            {alphabets.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCardIndex(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${i === cardIndex ? 'bg-blue-400 w-4' :
                                            learnedLetters.includes(alphabets[i].letter) ? 'bg-emerald-400' :
                                                'bg-white/20'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4"
                >
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{learnedLetters.length}/26 letters • {progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                        <motion.div
                            animate={{ width: `${progress}%` }}
                            className="bg-gradient-to-r from-blue-400 to-cyan-500 h-3 rounded-full"
                        />
                    </div>
                </motion.div>

                {/* Quiz Button */}
                {learnedLetters.length >= 5 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                        <Link href="/dashboard/student/kids-zone/learn/english/quiz">
                            <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                                🎯 Quiz দাও! ({learnedLetters.length} letters learned)
                            </button>
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    )
}