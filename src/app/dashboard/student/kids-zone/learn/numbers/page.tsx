'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSpeech } from '@/hooks/useSpeech'

const numbers = [
    { num: 1, bangla: '১', word: 'এক', english: 'One', emoji: '🍎', items: ['🍎'], color: 'from-red-400 to-rose-500' },
    { num: 2, bangla: '২', word: 'দুই', english: 'Two', emoji: '🍊🍊', items: ['🍊', '🍊'], color: 'from-orange-400 to-amber-500' },
    { num: 3, bangla: '৩', word: 'তিন', english: 'Three', emoji: '⭐⭐⭐', items: ['⭐', '⭐', '⭐'], color: 'from-yellow-400 to-lime-500' },
    { num: 4, bangla: '৪', word: 'চার', english: 'Four', emoji: '🌸🌸🌸🌸', items: ['🌸', '🌸', '🌸', '🌸'], color: 'from-green-400 to-emerald-500' },
    { num: 5, bangla: '৫', word: 'পাঁচ', english: 'Five', emoji: '🐟🐟🐟🐟🐟', items: ['🐟', '🐟', '🐟', '🐟', '🐟'], color: 'from-cyan-400 to-blue-500' },
    { num: 6, bangla: '৬', word: 'ছয়', english: 'Six', emoji: '🦋', items: ['🦋', '🦋', '🦋', '🦋', '🦋', '🦋'], color: 'from-violet-400 to-purple-500' },
    { num: 7, bangla: '৭', word: 'সাত', english: 'Seven', emoji: '🌈', items: ['🌈', '🌈', '🌈', '🌈', '🌈', '🌈', '🌈'], color: 'from-pink-400 to-rose-500' },
    { num: 8, bangla: '৮', word: 'আট', english: 'Eight', emoji: '🐙', items: ['🐙', '🐙', '🐙', '🐙', '🐙', '🐙', '🐙', '🐙'], color: 'from-indigo-400 to-blue-500' },
    { num: 9, bangla: '৯', word: 'নয়', english: 'Nine', emoji: '🌟', items: ['🌟', '🌟', '🌟', '🌟', '🌟', '🌟', '🌟', '🌟', '🌟'], color: 'from-amber-400 to-yellow-500' },
    { num: 10, bangla: '১০', word: 'দশ', english: 'Ten', emoji: '🎈', items: ['🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈'], color: 'from-teal-400 to-cyan-500' },
    { num: 11, bangla: '১১', word: 'এগারো', english: 'Eleven', emoji: '🌺', items: [], color: 'from-rose-400 to-red-500' },
    { num: 12, bangla: '১২', word: 'বারো', english: 'Twelve', emoji: '🦚', items: [], color: 'from-green-400 to-teal-500' },
    { num: 13, bangla: '১৩', word: 'তেরো', english: 'Thirteen', emoji: '🐬', items: [], color: 'from-cyan-400 to-blue-500' },
    { num: 14, bangla: '১৪', word: 'চৌদ্দ', english: 'Fourteen', emoji: '🌻', items: [], color: 'from-yellow-400 to-amber-500' },
    { num: 15, bangla: '১৫', word: 'পনেরো', english: 'Fifteen', emoji: '🦁', items: [], color: 'from-amber-400 to-orange-500' },
    { num: 20, bangla: '২০', word: 'বিশ', english: 'Twenty', emoji: '🎊', items: [], color: 'from-violet-400 to-indigo-500' },
    { num: 30, bangla: '৩০', word: 'ত্রিশ', english: 'Thirty', emoji: '🎯', items: [], color: 'from-blue-400 to-violet-500' },
    { num: 40, bangla: '৪০', word: 'চল্লিশ', english: 'Forty', emoji: '🚀', items: [], color: 'from-indigo-400 to-blue-500' },
    { num: 50, bangla: '৫০', word: 'পঞ্চাশ', english: 'Fifty', emoji: '🏆', items: [], color: 'from-amber-400 to-yellow-500' },
    { num: 100, bangla: '১০০', word: 'একশো', english: 'Hundred', emoji: '👑', items: [], color: 'from-yellow-400 to-amber-600' },
]

export default function NumbersPage() {
    const { speak, isSpeaking, isLoading } = useSpeech()
    const [selectedNumber, setSelectedNumber] = useState<typeof numbers[0] | null>(null)
    const [learnedNumbers, setLearnedNumbers] = useState<number[]>([])
    const [showCelebration, setShowCelebration] = useState(false)
    const [activeTab, setActiveTab] = useState<'numbers' | 'math'>('numbers')
    const [countAnswer, setCountAnswer] = useState('')
    const [countTarget] = useState(() => Math.floor(Math.random() * 5) + 1)
    const [countFeedback, setCountFeedback] = useState('')

    const handleNumberClick = (num: typeof numbers[0]) => {
        setSelectedNumber(num)
        // AI voice: বাংলা সংখ্যা
        speak(num.word, 'bn-BD')
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
        if (Number(countAnswer) === countTarget) {
            setCountFeedback('✅ সঠিক!')
            speak('সঠিক!', 'bn-BD')
        } else {
            setCountFeedback('❌ আবার চেষ্টা করো')
        }
    }

    const progress = Math.round((learnedNumbers.length / numbers.length) * 100)

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white">
            <AnimatePresence>
                {showCelebration && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}
                            className="bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl p-8 text-center max-w-xs">
                            <div className="text-7xl mb-3">🌟</div>
                            <h2 className="text-2xl font-bold text-white mb-1">দারুণ!</h2>
                            <p className="text-emerald-100">{learnedNumbers.length} সংখ্যা শিখেছো!</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="sticky top-0 z-40 bg-[#0d0a2e]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard/student/kids-zone/learn" className="text-gray-400 hover:text-white text-sm">← ফিরে যাও</Link>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                        ⭐ {learnedNumbers.length}/{numbers.length}
                    </span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl mb-3">🔢</motion.div>
                    <h1 className="text-3xl font-bold text-white mb-1">সংখ্যা শিখি</h1>
                    <p className="text-gray-400 text-sm">সংখ্যায় ট্যাপ করো — AI voice শুনবে!</p>
                </motion.div>

                <div className="flex gap-3 mb-6 bg-white/5 rounded-2xl p-1.5">
                    {[{ key: 'numbers', label: '🔢 সংখ্যা' }, { key: 'math', label: '🧮 গণনা' }].map(tab => (
                        <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key as 'numbers' | 'math')}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                activeTab === tab.key ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}>{tab.label}</button>
                    ))}
                </div>

                {activeTab === 'numbers' && (
                    <>
                        <AnimatePresence mode="wait">
                            {selectedNumber && (
                                <motion.div key={selectedNumber.num} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="mb-6">
                                    <div className={`rounded-3xl bg-gradient-to-br ${selectedNumber.color} p-1`}>
                                        <div className="rounded-3xl bg-[#0f0f2a] p-6 text-center">
                                            <div className="flex items-center justify-center gap-6 mb-4">
                                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                                                    className={`text-8xl font-bold bg-gradient-to-r ${selectedNumber.color} bg-clip-text text-transparent`}>
                                                    {selectedNumber.bangla}
                                                </motion.div>
                                                <div className="text-left">
                                                    <div className="text-5xl mb-1">{selectedNumber.emoji}</div>
                                                    <p className="text-3xl font-bold text-white">{selectedNumber.word}</p>
                                                    <p className="text-gray-400">{selectedNumber.english}</p>
                                                    <div className="mt-3 flex flex-wrap justify-start gap-2">
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); speak(selectedNumber.word, 'bn-BD') }}
                                                            className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20">
                                                            {isSpeaking || isLoading ? '⏳…' : '🔊 বাংলা'}
                                                        </button>
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); speak(selectedNumber.english, 'en-US') }}
                                                            className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20">
                                                            🔊 English
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedNumber.items.length > 0 && (
                                                <div className="flex flex-wrap justify-center gap-1 text-3xl mb-3">
                                                    {selectedNumber.items.map((it, i) => <span key={i}>{it}</span>)}
                                                </div>
                                            )}
                                            {learnedNumbers.includes(selectedNumber.num) && (
                                                <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold">✅ শিখেছো!</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                            {numbers.map((num, i) => {
                                const learned = learnedNumbers.includes(num.num)
                                return (
                                    <motion.button key={num.num} type="button"
                                        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                                        whileHover={{ scale: 1.1, y: -4 }} whileTap={{ scale: 0.9 }}
                                        onClick={() => handleNumberClick(num)}
                                        className={`relative rounded-2xl p-3 text-center transition-all ${
                                            selectedNumber?.num === num.num ? `bg-gradient-to-br ${num.color} shadow-lg`
                                            : learned ? 'bg-emerald-500/20 border border-emerald-500/30'
                                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                        }`}>
                                        {learned && <div className="absolute -top-1 -right-1 text-sm">⭐</div>}
                                        <div className="text-2xl font-bold text-white mb-1">{num.bangla}</div>
                                        <div className="text-lg">{num.emoji}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{num.word}</div>
                                    </motion.button>
                                )
                            })}
                        </div>
                    </>
                )}

                {activeTab === 'math' && (
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 text-center">
                        <p className="text-lg text-gray-300 mb-4">কয়টা আছে?</p>
                        <div className="text-5xl mb-4">{'🍎'.repeat(countTarget)}</div>
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button key={n} type="button" onClick={() => setCountAnswer(String(n))}
                                    className={`w-12 h-12 rounded-xl font-bold ${
                                        countAnswer === String(n) ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white'
                                    }`}>{n}</button>
                            ))}
                        </div>
                        <button type="button" onClick={handleCountCheck}
                            className="rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-2 font-bold text-white">
                            চেক করো
                        </button>
                        {countFeedback && <p className="mt-3 text-lg">{countFeedback}</p>}
                    </div>
                )}

                <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>অগ্রগতি</span><span>{progress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10">
                        <div className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>
        </div>
    )
}
