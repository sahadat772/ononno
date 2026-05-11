'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const arabicLetters = [
    { letter: 'ا', name: 'আলিফ', transliteration: 'Alif', word: 'أسد', wordMeaning: 'সিংহ', emoji: '🦁', forms: { isolated: 'ا', initial: 'ا', medial: 'ـا', final: 'ـا' } },
    { letter: 'ب', name: 'বা', transliteration: 'Ba', word: 'بيت', wordMeaning: 'ঘর', emoji: '🏠', forms: { isolated: 'ب', initial: 'بـ', medial: 'ـبـ', final: 'ـب' } },
    { letter: 'ت', name: 'তা', transliteration: 'Ta', word: 'تفاح', wordMeaning: 'আপেল', emoji: '🍎', forms: { isolated: 'ت', initial: 'تـ', medial: 'ـتـ', final: 'ـت' } },
    { letter: 'ث', name: 'সা', transliteration: 'Tha', word: 'ثعلب', wordMeaning: 'শিয়াল', emoji: '🦊', forms: { isolated: 'ث', initial: 'ثـ', medial: 'ـثـ', final: 'ـث' } },
    { letter: 'ج', name: 'জিম', transliteration: 'Jim', word: 'جمل', wordMeaning: 'উট', emoji: '🐪', forms: { isolated: 'ج', initial: 'جـ', medial: 'ـجـ', final: 'ـج' } },
    { letter: 'ح', name: 'হা', transliteration: 'Ha', word: 'حمار', wordMeaning: 'গাধা', emoji: '🐴', forms: { isolated: 'ح', initial: 'حـ', medial: 'ـحـ', final: 'ـح' } },
    { letter: 'خ', name: 'খা', transliteration: 'Kha', word: 'خروف', wordMeaning: 'ভেড়া', emoji: '🐑', forms: { isolated: 'خ', initial: 'خـ', medial: 'ـخـ', final: 'ـخ' } },
    { letter: 'د', name: 'দাল', transliteration: 'Dal', word: 'دجاجة', wordMeaning: 'মুরগি', emoji: '🐔', forms: { isolated: 'د', initial: 'د', medial: 'ـد', final: 'ـد' } },
    { letter: 'ذ', name: 'যাল', transliteration: 'Dhal', word: 'ذئب', wordMeaning: 'নেকড়ে', emoji: '🐺', forms: { isolated: 'ذ', initial: 'ذ', medial: 'ـذ', final: 'ـذ' } },
    { letter: 'ر', name: 'রা', transliteration: 'Ra', word: 'رمان', wordMeaning: 'ডালিম', emoji: '🍎', forms: { isolated: 'ر', initial: 'ر', medial: 'ـر', final: 'ـر' } },
    { letter: 'ز', name: 'যাই', transliteration: 'Zay', word: 'زرافة', wordMeaning: 'জিরাফ', emoji: '🦒', forms: { isolated: 'ز', initial: 'ز', medial: 'ـز', final: 'ـز' } },
    { letter: 'س', name: 'সিন', transliteration: 'Sin', word: 'سمكة', wordMeaning: 'মাছ', emoji: '🐟', forms: { isolated: 'س', initial: 'سـ', medial: 'ـسـ', final: 'ـس' } },
    { letter: 'ش', name: 'শিন', transliteration: 'Shin', word: 'شمس', wordMeaning: 'সূর্য', emoji: '☀️', forms: { isolated: 'ش', initial: 'شـ', medial: 'ـشـ', final: 'ـش' } },
    { letter: 'ص', name: 'সোয়াদ', transliteration: 'Sad', word: 'صقر', wordMeaning: 'বাজপাখি', emoji: '🦅', forms: { isolated: 'ص', initial: 'صـ', medial: 'ـصـ', final: 'ـص' } },
    { letter: 'ض', name: 'দোয়াদ', transliteration: 'Dad', word: 'ضفدع', wordMeaning: 'ব্যাঙ', emoji: '🐸', forms: { isolated: 'ض', initial: 'ضـ', medial: 'ـضـ', final: 'ـض' } },
    { letter: 'ط', name: 'তোয়া', transliteration: 'Ta', word: 'طاووس', wordMeaning: 'ময়ূর', emoji: '🦚', forms: { isolated: 'ط', initial: 'طـ', medial: 'ـطـ', final: 'ـط' } },
    { letter: 'ظ', name: 'যোয়া', transliteration: 'Dha', word: 'ظبي', wordMeaning: 'হরিণ', emoji: '🦌', forms: { isolated: 'ظ', initial: 'ظـ', medial: 'ـظـ', final: 'ـظ' } },
    { letter: 'ع', name: 'আইন', transliteration: 'Ain', word: 'عصفور', wordMeaning: 'চড়ুই', emoji: '🐦', forms: { isolated: 'ع', initial: 'عـ', medial: 'ـعـ', final: 'ـع' } },
    { letter: 'غ', name: 'গাইন', transliteration: 'Ghain', word: 'غزال', wordMeaning: 'গেজেল', emoji: '🦌', forms: { isolated: 'غ', initial: 'غـ', medial: 'ـغـ', final: 'ـغ' } },
    { letter: 'ف', name: 'ফা', transliteration: 'Fa', word: 'فيل', wordMeaning: 'হাতি', emoji: '🐘', forms: { isolated: 'ف', initial: 'فـ', medial: 'ـفـ', final: 'ـف' } },
    { letter: 'ق', name: 'কাফ', transliteration: 'Qaf', word: 'قط', wordMeaning: 'বিড়াল', emoji: '🐱', forms: { isolated: 'ق', initial: 'قـ', medial: 'ـقـ', final: 'ـق' } },
    { letter: 'ك', name: 'কাফ', transliteration: 'Kaf', word: 'كلب', wordMeaning: 'কুকুর', emoji: '🐶', forms: { isolated: 'ك', initial: 'كـ', medial: 'ـكـ', final: 'ـك' } },
    { letter: 'ل', name: 'লাম', transliteration: 'Lam', word: 'ليمون', wordMeaning: 'লেবু', emoji: '🍋', forms: { isolated: 'ل', initial: 'لـ', medial: 'ـلـ', final: 'ـل' } },
    { letter: 'م', name: 'মিম', transliteration: 'Mim', word: 'موز', wordMeaning: 'কলা', emoji: '🍌', forms: { isolated: 'م', initial: 'مـ', medial: 'ـمـ', final: 'ـم' } },
    { letter: 'ن', name: 'নুন', transliteration: 'Nun', word: 'نمر', wordMeaning: 'চিতাবাঘ', emoji: '🐆', forms: { isolated: 'ن', initial: 'نـ', medial: 'ـنـ', final: 'ـن' } },
    { letter: 'ه', name: 'হা', transliteration: 'Ha', word: 'هدية', wordMeaning: 'উপহার', emoji: '🎁', forms: { isolated: 'ه', initial: 'هـ', medial: 'ـهـ', final: 'ـه' } },
    { letter: 'و', name: 'ওয়াও', transliteration: 'Waw', word: 'وردة', wordMeaning: 'গোলাপ', emoji: '🌹', forms: { isolated: 'و', initial: 'و', medial: 'ـو', final: 'ـو' } },
    { letter: 'ي', name: 'ইয়া', transliteration: 'Ya', word: 'يد', wordMeaning: 'হাত', emoji: '✋', forms: { isolated: 'ي', initial: 'يـ', medial: 'ـيـ', final: 'ـي' } },
]

const colors = [
    'from-red-400 to-rose-500',
    'from-orange-400 to-amber-500',
    'from-yellow-400 to-lime-500',
    'from-green-400 to-emerald-500',
    'from-teal-400 to-cyan-500',
    'from-blue-400 to-indigo-500',
    'from-violet-400 to-purple-500',
    'from-pink-400 to-rose-500',
]

export default function ArabicLettersPage() {
    const [selectedLetter, setSelectedLetter] = useState<typeof arabicLetters[0] | null>(null)
    const [learnedLetters, setLearnedLetters] = useState<string[]>([])
    const [showForms, setShowForms] = useState(false)
    const [showCelebration, setShowCelebration] = useState(false)
    const [activeView, setActiveView] = useState<'grid' | 'card'>('grid')
    const [cardIndex, setCardIndex] = useState(0)

    const handleLetterClick = (letter: typeof arabicLetters[0]) => {
        setSelectedLetter(letter)
        setShowForms(false)
        if (!learnedLetters.includes(letter.letter)) {
            const newLearned = [...learnedLetters, letter.letter]
            setLearnedLetters(newLearned)
            if (newLearned.length % 7 === 0) {
                setShowCelebration(true)
                setTimeout(() => setShowCelebration(false), 3000)
            }
        }
    }

    const getColor = (index: number) => colors[index % colors.length]
    const progress = Math.round((learnedLetters.length / arabicLetters.length) * 100)

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
                            className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl p-8 text-center max-w-xs"
                        >
                            <motion.div
                                animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.3, 1] }}
                                transition={{ repeat: 3, duration: 0.5 }}
                                className="text-7xl mb-3"
                            >
                                🌟
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-1">ماشاء الله!</h2>
                            <p className="text-emerald-100 mb-1">মাশাআল্লাহ!</p>
                            <p className="text-emerald-100">{learnedLetters.length}টি আরবি হরফ শিখেছো!</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0d0a2e]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard/student/kids-zone/islamic"
                        className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                        ← ফিরে যাও
                    </Link>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                        ⭐ {learnedLetters.length}/28
                    </span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* Title */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-5xl mb-2"
                    >
                        ✍️
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-1">Arabic Letters</h1>
                    <p className="text-2xl text-emerald-300 mb-1">الحروف العربية</p>
                    <p className="text-gray-400 text-sm">হরফে click করো শিখতে!</p>
                </motion.div>

                {/* View Toggle */}
                <div className="flex gap-3 mb-6 bg-white/5 rounded-2xl p-1.5">
                    {[
                        { key: 'grid', label: '⊞ Grid' },
                        { key: 'card', label: '🃏 Flashcard' },
                    ].map(view => (
                        <button key={view.key}
                            onClick={() => setActiveView(view.key as 'grid' | 'card')}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView === view.key
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                }`}>
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
                            <div className={`rounded-3xl bg-gradient-to-br ${getColor(arabicLetters.findIndex(l => l.letter === selectedLetter.letter))} p-1`}>
                                <div className="rounded-3xl bg-[#0f0f2a] p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-center">
                                            <motion.p
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                className="text-8xl text-white mb-2"
                                                style={{ fontFamily: 'serif' }}
                                            >
                                                {selectedLetter.letter}
                                            </motion.p>
                                            <p className="text-emerald-400 font-bold text-xl">{selectedLetter.name}</p>
                                            <p className="text-gray-400 text-sm">{selectedLetter.transliteration}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-5xl mb-2">{selectedLetter.emoji}</div>
                                            <p className="text-2xl text-white" style={{ fontFamily: 'serif' }}>
                                                {selectedLetter.word}
                                            </p>
                                            <p className="text-gray-400 text-sm">{selectedLetter.wordMeaning}</p>
                                        </div>
                                    </div>

                                    {/* Forms */}
                                    <button
                                        onClick={() => setShowForms(!showForms)}
                                        className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 text-sm mb-3 transition-all"
                                    >
                                        {showForms ? '▲ হরফের রূপ লুকাও' : '▼ হরফের রূপ দেখো (৪টি)'}
                                    </button>

                                    <AnimatePresence>
                                        {showForms && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="grid grid-cols-4 gap-2 mb-3"
                                            >
                                                {[
                                                    { label: 'একা', form: selectedLetter.forms.isolated },
                                                    { label: 'শুরুতে', form: selectedLetter.forms.initial },
                                                    { label: 'মাঝে', form: selectedLetter.forms.medial },
                                                    { label: 'শেষে', form: selectedLetter.forms.final },
                                                ].map((f, i) => (
                                                    <div key={i} className="bg-white/5 rounded-xl p-3 text-center">
                                                        <p className="text-2xl text-white mb-1" style={{ fontFamily: 'serif' }}>
                                                            {f.form}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{f.label}</p>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {learnedLetters.includes(selectedLetter.letter) && (
                                        <div className="text-center">
                                            <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold">
                                                ✅ শেখা হয়েছে!
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grid View */}
                {activeView === 'grid' && (
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                        {arabicLetters.map((item, i) => {
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
                                            ? `bg-gradient-to-br ${getColor(i)} shadow-lg`
                                            : learned
                                                ? 'bg-emerald-500/20 border border-emerald-500/30'
                                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {learned && <div className="absolute -top-1 -right-1 text-sm">⭐</div>}
                                    <div className="text-3xl text-white mb-1" style={{ fontFamily: 'serif' }}>
                                        {item.letter}
                                    </div>
                                    <div className="text-sm">{item.emoji}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{item.name}</div>
                                </motion.button>
                            )
                        })}
                    </div>
                )}

                {/* Flashcard View */}
                {activeView === 'card' && (
                    <div className="text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={cardIndex}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => handleLetterClick(arabicLetters[cardIndex])}
                                className={`rounded-3xl bg-gradient-to-br ${getColor(cardIndex)} p-1 cursor-pointer mb-6`}
                            >
                                <div className="rounded-3xl bg-[#0f0f2a] p-8 text-center">
                                    <p className="text-9xl text-white mb-4" style={{ fontFamily: 'serif' }}>
                                        {arabicLetters[cardIndex].letter}
                                    </p>
                                    <p className="text-3xl font-bold text-emerald-400 mb-1">
                                        {arabicLetters[cardIndex].name}
                                    </p>
                                    <p className="text-gray-400 mb-4">{arabicLetters[cardIndex].transliteration}</p>
                                    <div className="flex items-center justify-center gap-4">
                                        <span className="text-4xl">{arabicLetters[cardIndex].emoji}</span>
                                        <div className="text-left">
                                            <p className="text-2xl text-white" style={{ fontFamily: 'serif' }}>
                                                {arabicLetters[cardIndex].word}
                                            </p>
                                            <p className="text-gray-400 text-sm">{arabicLetters[cardIndex].wordMeaning}</p>
                                        </div>
                                    </div>

                                    {/* 4 Forms */}
                                    <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/10">
                                        {[
                                            { label: 'একা', form: arabicLetters[cardIndex].forms.isolated },
                                            { label: 'শুরুতে', form: arabicLetters[cardIndex].forms.initial },
                                            { label: 'মাঝে', form: arabicLetters[cardIndex].forms.medial },
                                            { label: 'শেষে', form: arabicLetters[cardIndex].forms.final },
                                        ].map((f, i) => (
                                            <div key={i} className="text-center">
                                                <p className="text-2xl text-white" style={{ fontFamily: 'serif' }}>{f.form}</p>
                                                <p className="text-xs text-gray-500">{f.label}</p>
                                            </div>
                                        ))}
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
                                aria-label="Previous letter"
                                className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white disabled:opacity-30 text-xl"
                            >
                                ←
                            </motion.button>
                            <span className="text-gray-400 text-sm">{cardIndex + 1} / {arabicLetters.length}</span>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setCardIndex(Math.min(arabicLetters.length - 1, cardIndex + 1))}
                                disabled={cardIndex === arabicLetters.length - 1}
                                aria-label="Next letter"
                                className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white disabled:opacity-30 text-xl"
                            >
                                →
                            </motion.button>
                        </div>

                        {/* Dots */}
                        <div className="flex justify-center gap-1 flex-wrap max-w-xs mx-auto">
                            {arabicLetters.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCardIndex(i)}
                                    aria-label={`Go to letter ${arabicLetters[i].name}`}
                                    className={`h-2 rounded-full transition-all ${i === cardIndex ? 'bg-emerald-400 w-4' :
                                            learnedLetters.includes(arabicLetters[i].letter) ? 'bg-emerald-400/50 w-2' :
                                                'bg-white/20 w-2'
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
                        <span>অগ্রগতি</span>
                        <span>{learnedLetters.length}/28 হরফ • {progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                        <motion.div
                            animate={{ width: `${progress}%` }}
                            className="bg-gradient-to-r from-emerald-400 to-teal-500 h-3 rounded-full"
                        />
                    </div>
                </motion.div>

                {/* Quiz Button */}
                {learnedLetters.length >= 7 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                        <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/30">
                            🎯 Quiz দাও! ({learnedLetters.length} হরফ শিখেছো)
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}