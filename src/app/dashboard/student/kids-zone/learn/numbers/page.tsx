'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const numbers = [
    { num: 1, bangla: '১', word: 'এক', english: 'One', emoji: '🍎', items: ['🍎'], color: 'from-red-400 to-rose-500' },
    { num: 2, bangla: '২', word: 'দুই', english: 'Two', emoji: '🍊🍊', items: ['🍊', '🍊'], color: 'from-orange-400 to-amber-500' },
    { num: 3, bangla: '৩', word: 'তিন', english: 'Three', emoji: '⭐⭐⭐', items: ['⭐', '⭐', '⭐'], color: 'from-yellow-400 to-lime-500' },
    { num: 4, bangla: '৪', word: 'চার', english: 'Four', emoji: '🌸🌸🌸🌸', items: ['🌸', '🌸', '🌸', '🌸'], color: 'from-green-400 to-emerald-500' },
    { num: 5, bangla: '৫', word: 'পাঁচ', english: 'Five', emoji: '🐟🐟🐟🐟🐟', items: ['🐟', '🐟', '🐟', '🐟', '🐟'], color: 'from-teal-400 to-cyan-500' },
    { num: 6, bangla: '৬', word: 'ছয়', english: 'Six', emoji: '🦋', items: ['🦋', '🦋', '🦋', '🦋', '🦋', '🦋'], color: 'from-blue-400 to-indigo-500' },
    { num: 7, bangla: '৭', word: 'সাত', english: 'Seven', emoji: '🌈', items: ['🌈', '🌈', '🌈', '🌈', '🌈', '🌈', '🌈'], color: 'from-violet-400 to-purple-500' },
    { num: 8, bangla: '৮', word: 'আট', english: 'Eight', emoji: '🐙', items: ['🐙', '🐙', '🐙', '🐙', '🐙', '🐙', '🐙', '🐙'], color: 'from-pink-400 to-rose-500' },
    { num: 9, bangla: '৯', word: 'নয়', english: 'Nine', emoji: '🌟', items: ['🌟', '🌟', '🌟', '🌟', '🌟', '🌟', '🌟', '🌟', '🌟'], color: 'from-amber-400 to-orange-500' },
    { num: 10, bangla: '১০', word: 'দশ', english: 'Ten', emoji: '🎈', items: ['🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈'], color: 'from-red-400 to-pink-500' },
    { num: 11, bangla: '১১', word: 'এগারো', english: 'Eleven', emoji: '🌺', items: [], color: 'from-rose-400 to-red-500' },
    { num: 12, bangla: '১২', word: 'বারো', english: 'Twelve', emoji: '🦚', items: [], color: 'from-green-400 to-teal-500' },
    { num: 13, bangla: '১৩', word: 'তেরো', english: 'Thirteen', emoji: '🐬', items: [], color: 'from-cyan-400 to-blue-500' },
    { num: 14, bangla: '১৪', word: 'চৌদ্দ', english: 'Fourteen', emoji: '🌻', items: [], color: 'from-yellow-400 to-amber-500' },
    { num: 15, bangla: '১৫', word: 'পনেরো', english: 'Fifteen', emoji: '🦁', items: [], color: 'from-amber-400 to-orange-500' },
    { num: 20, bangla: '২০', word: 'বিশ', english: 'Twenty', emoji: '🎊', items: [], color: 'from-violet-400 to-indigo-500' },
    { num: 30, bangla: '৩০', word: 'ত্রিশ', english: 'Thirty', emoji: '🎯', items: [], color: 'from-blue-400 to-violet-500' },
    { num: 40, bangla: '৪০', word: 'চল্লিশ', english: 'Forty', emoji: '🚀', items: [], color: 'from-indigo-400 to-blue-500' },
    { num: 50, bangla: '৫০', word: 'পঞ্চাশ', english: 'Fifty', emoji: '🏆', items: [], color: 'from-amber-400 to-yellow-500' },
    { num: 100, bangla: '১০০', word: 'একশো', english: 'Hundred', emoji: '👑', items: [], color: 'from-yellow-400 to-amber-500' },
]

const mathGames = [
    { title: 'যোগ শিখি', icon: '➕', desc: '১+১=২', color: 'from-green-400 to-emerald-500', available: true },
    { title: 'বিয়োগ শিখি', icon: '➖', desc: '৫-২=৩', color: 'from-blue-400 to-cyan-500', available: false },
    { title: 'গণনা করি', icon: '🔢', desc: 'গণনার খেলা', color: 'from-violet-400 to-purple-500', available: true },
]

export default function NumbersPage() {
    const [selectedNumber, setSelectedNumber] = useState<typeof numbers[0] | null>(null)
    const [learnedNumbers, setLearnedNumbers] = useState<number[]>([])
    const [activeTab, setActiveTab] = useState<'numbers' | 'math'>('numbers')
    const [countGame, setCountGame] = useState(false)
    const [countAnswer, setCountAnswer] = useState('')
    const [countTarget, setCountTarget] = useState(() => Math.floor(Math.random() * 5) + 1)
    const [countResult, setCountResult] = useState<'correct' | 'wrong' | null>(null)
    const [showCelebration, setShowCelebration] = useState(false)

    const handleNumberClick = (num: typeof numbers[0]) => {
        setSelectedNumber(num)
        if (!learnedNumbers.includes(num.num)) {
            const newLearned = [...learnedNumbers, num.num]
            setLearnedNumbers(newLearned)
            if (newLearned.length % 5 === 0) {
                setShowCelebration(true)
                setTimeout(() => setShowCelebration(false), 3000)
            }
        }
    }

    const handleCountCheck = () => {
        if (parseInt(countAnswer) === countTarget) {
            setCountResult('correct')
            setTimeout(() => {
                setCountTarget(Math.floor(Math.random() * 9) + 1)
                setCountAnswer('')
                setCountResult(null)
            }, 1500)
        } else {
            setCountResult('wrong')
            setTimeout(() => {
                setCountAnswer('')
                setCountResult(null)
            }, 1500)
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
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                    >
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl p-8 text-center"
                        >
                            <div className="text-7xl mb-3">🎉</div>
                            <h2 className="text-2xl font-bold text-white">শাবাশ!</h2>
                            <p className="text-green-100">{learnedNumbers.length}টি সংখ্যা শিখেছো!</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0d0a2e]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard/student/kids-zone/learn"
                        className="text-gray-400 hover:text-white transition-colors text-sm">
                        ← ফিরে যাও
                    </Link>
                    <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full">
                        ⭐ {learnedNumbers.length} সংখ্যা শেখা হয়েছে
                    </span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* Title */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-6xl mb-3"
                    >
                        🔢
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-1">সংখ্যা শিখি</h1>
                    <p className="text-gray-400 text-sm">সংখ্যায় click করো শিখতে!</p>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-3 mb-6 bg-white/5 rounded-2xl p-1.5">
                    {[
                        { key: 'numbers', label: '🔢 সংখ্যা' },
                        { key: 'math', label: '🧮 গণনা খেলা' },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key as 'numbers' | 'math')}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.key
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Numbers Tab */}
                {activeTab === 'numbers' && (
                    <>
                        {/* Selected Number Detail */}
                        <AnimatePresence mode="wait">
                            {selectedNumber && (
                                <motion.div
                                    key={selectedNumber.num}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="mb-6"
                                >
                                    <div className={`rounded-3xl bg-gradient-to-br ${selectedNumber.color} p-1`}>
                                        <div className="rounded-3xl bg-[#0f0f2a] p-6 text-center">
                                            {/* Number display */}
                                            <div className="flex items-center justify-center gap-6 mb-4">
                                                <motion.div
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                                    className={`text-8xl font-bold bg-gradient-to-r ${selectedNumber.color} bg-clip-text text-transparent`}
                                                >
                                                    {selectedNumber.bangla}
                                                </motion.div>
                                                <div className="text-left">
                                                    <p className="text-3xl font-bold text-white">{selectedNumber.word}</p>
                                                    <p className="text-gray-400">{selectedNumber.english}</p>
                                                    <p className="text-2xl text-white/60">{selectedNumber.num}</p>
                                                </div>
                                            </div>

                                            {/* Visual items */}
                                            {selectedNumber.items.length > 0 && (
                                                <div className="flex flex-wrap justify-center gap-2 mb-3">
                                                    {selectedNumber.items.map((item, i) => (
                                                        <motion.span
                                                            key={i}
                                                            initial={{ opacity: 0, scale: 0 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className="text-3xl"
                                                        >
                                                            {item}
                                                        </motion.span>
                                                    ))}
                                                </div>
                                            )}

                                            {learnedNumbers.includes(selectedNumber.num) && (
                                                <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold">
                                                    ✅ শেখা হয়েছে!
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Numbers Grid */}
                        <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                            {numbers.map((num, i) => {
                                const learned = learnedNumbers.includes(num.num)
                                return (
                                    <motion.button
                                        key={num.num}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ scale: 1.1, y: -4 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleNumberClick(num)}
                                        className={`relative rounded-2xl p-3 text-center transition-all ${selectedNumber?.num === num.num
                                                ? `bg-gradient-to-br ${num.color} shadow-lg`
                                                : learned
                                                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        {learned && <div className="absolute -top-1 -right-1 text-sm">⭐</div>}
                                        <div className={`text-3xl font-bold mb-0.5 ${selectedNumber?.num === num.num ? 'text-white' : 'text-white'}`}>
                                            {num.bangla}
                                        </div>
                                        <div className="text-lg">{num.emoji.slice(0, 2)}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{num.word}</div>
                                    </motion.button>
                                )
                            })}
                        </div>
                    </>
                )}

                {/* Math Game Tab */}
                {activeTab === 'math' && (
                    <div className="space-y-4">
                        {/* Counting Game */}
                        <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-6">
                            <h3 className="font-bold text-white text-xl mb-4 flex items-center gap-2">
                                🔢 গণনা করি
                            </h3>
                            <p className="text-gray-300 text-sm mb-4">নিচের emoji গুলো গণনা করো:</p>

                            {/* Emoji display */}
                            <div className="flex flex-wrap justify-center gap-3 mb-6 bg-white/5 rounded-2xl p-4">
                                {[...Array(countTarget)].map((_, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="text-4xl"
                                    >
                                        🍎
                                    </motion.span>
                                ))}
                            </div>

                            {/* Answer Input */}
                            <div className="flex gap-3">
                                <div className="flex gap-2 flex-1 flex-wrap justify-center">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                        <motion.button
                                            key={n}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setCountAnswer(String(n))}
                                            className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${countAnswer === String(n)
                                                    ? 'bg-green-500 text-white shadow-lg'
                                                    : 'bg-white/10 text-white hover:bg-white/20'
                                                }`}
                                        >
                                            {n}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {countAnswer && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleCountCheck}
                                    className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg"
                                >
                                    উত্তর দাও: {countAnswer} ✓
                                </motion.button>
                            )}

                            <AnimatePresence>
                                {countResult && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={`mt-4 p-4 rounded-2xl text-center font-bold text-xl ${countResult === 'correct'
                                                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                                                : 'bg-red-500/20 border border-red-500/30 text-red-400'
                                            }`}
                                    >
                                        {countResult === 'correct' ? '🎉 সঠিক! শাবাশ!' : '😊 আবার চেষ্টা করো!'}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Simple Addition */}
                        <div className="rounded-3xl border border-blue-500/30 bg-blue-500/10 p-6 opacity-60">
                            <h3 className="font-bold text-white text-xl mb-2 flex items-center gap-2">
                                ➕ যোগ শিখি
                                <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full">শীঘ্রই</span>
                            </h3>
                            <p className="text-gray-400 text-sm">যোগ করার মজার খেলা</p>
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
                        <span>অগ্রগতি</span>
                        <span>{learnedNumbers.length}/{numbers.length} সংখ্যা</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                        <motion.div
                            animate={{ width: `${(learnedNumbers.length / numbers.length) * 100}%` }}
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    )
}