'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSpeech } from '@/hooks/useSpeech'

const TAJWEED_RULES = [
    {
        id: 'ghunna',
        name: 'গুন্নাহ',
        arabic: 'غُنَّة',
        desc: 'নাকি সুর দিয়ে ২ count টানা',
        color: 'from-emerald-400 to-teal-500',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
        icon: '👃',
        example: 'مِنَ النَّاسِ',
        example_bn: 'মিনান্নাস — ন এর উপর শদ্দা থাকলে গুন্নাহ',
        tip: 'নাক বন্ধ করে পড়ার মতো অনুভব করো',
        letters: ['ن', 'م'],
    },
    {
        id: 'ikhfa',
        name: 'ইখফা',
        arabic: 'إِخْفَاء',
        desc: 'লুকানো — নুন সাকিন বা তানউইন এর পর',
        color: 'from-blue-400 to-indigo-500',
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        icon: '🫥',
        example: 'مَن كَانَ',
        example_bn: 'মান কানা — নুন সাকিন এর পর ক',
        tip: 'নুনকে পুরো বলো না, আবার একদম লুকাও না',
        letters: ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'],
    },
    {
        id: 'idgham',
        name: 'ইদগাম',
        arabic: 'إِدْغَام',
        desc: 'মিলানো — নুন সাকিন পরের হরফে মিশে যায়',
        color: 'from-violet-400 to-purple-500',
        border: 'border-violet-500/30',
        bg: 'bg-violet-500/10',
        icon: '🔗',
        example: 'مَن يَعْمَلْ',
        example_bn: 'মাইয়্যামাল — নুন ইয়া তে মিশে গেছে',
        tip: 'নুনকে পরের হরফের সাথে মিলিয়ে পড়ো',
        letters: ['ي', 'ر', 'م', 'ل', 'و', 'ن'],
    },
    {
        id: 'iqlab',
        name: 'ইকলাব',
        arabic: 'إِقْلَاب',
        desc: 'পরিবর্তন — নুন সাকিন বা তানউইন বা তে পরিবর্তিত হয়',
        color: 'from-rose-400 to-pink-500',
        border: 'border-rose-500/30',
        bg: 'bg-rose-500/10',
        icon: '🔄',
        example: 'مِن بَعْدِ',
        example_bn: 'মিম বাদি — নুন মিম হয়ে যায়',
        tip: 'নুনকে মিম এ পরিবর্তন করো, গুন্নাহ সহ',
        letters: ['ب'],
    },
    {
        id: 'madd',
        name: 'মাদ্দ',
        arabic: 'مَدّ',
        desc: 'টানা — নির্দিষ্ট হরফ লম্বা করে পড়া',
        color: 'from-amber-400 to-orange-500',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        icon: '⬅️',
        example: 'قَالَ',
        example_bn: 'কা-লা — আলিফ এর আগে ফাতহা, টেনে পড়ো',
        tip: '২ count বা ৪ count বা ৬ count — rule অনুযায়ী',
        letters: ['ا', 'و', 'ي'],
    },
    {
        id: 'qalqalah',
        name: 'কালকালাহ',
        arabic: 'قَلْقَلَة',
        desc: 'কম্পন — সাকিন অবস্থায় হরফে কম্পন',
        color: 'from-cyan-400 to-sky-500',
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/10',
        icon: '〰️',
        example: 'يَخْلُقْ',
        example_bn: 'ইয়াখলুক — ক এর নিচে সুকুন, কম্পন করো',
        tip: 'হরফটা আটকে যায়, তারপর bounce করে বের হয়',
        letters: ['ق', 'ط', 'ب', 'ج', 'د'],
    },
]

export default function TajweedPage() {
    const [selected, setSelected] = useState(TAJWEED_RULES[0])
    const [practiced, setPracticed] = useState<string[]>([])
    const { speak } = useSpeech()

    const handleSelect = (rule: typeof TAJWEED_RULES[0]) => {
        setSelected(rule)
        speak(rule.arabic, 'ar-SA')
    }

    const handlePracticed = (id: string) => {
        if (!practiced.includes(id)) {
            setPracticed(prev => [...prev, id])
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white">

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0d0a2e]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard/student/islamic"
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                        ← Islamic এ ফিরে যাও
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                            ✅ {practiced.length}/{TAJWEED_RULES.length} শেখা
                        </span>
                        <Link href="/dashboard/student/islamic/tajweed/practice"
                            className="text-xs bg-linear-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full font-semibold hover:opacity-90 transition-all">
                            🎙️ Practice
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* Title */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-5xl mb-2"
                    >🎵</motion.div>
                    <h1 className="text-3xl font-bold text-white mb-1">Tajweed Rules</h1>
                    <p className="text-2xl text-emerald-300 mb-1">أحكام التجويد</p>
                    <p className="text-gray-400 text-sm">সুন্দরভাবে কুরআন তেলাওয়াত করার নিয়ম</p>
                </motion.div>

                {/* Progress */}
                <div className="mb-6 rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>শেখার অগ্রগতি</span>
                        <span>{practiced.length}/{TAJWEED_RULES.length} rules</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                        <motion.div
                            animate={{ width: `${(practiced.length / TAJWEED_RULES.length) * 100}%` }}
                            className="bg-linear-to-r from-emerald-400 to-teal-500 h-3 rounded-full"
                        />
                    </div>
                </div>

                {/* Selected Rule Detail */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selected.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6"
                    >
                        <div className={`rounded-3xl bg-linear-to-br ${selected.bg} border ${selected.border} p-6`}>

                            {/* Rule name */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl">{selected.icon}</span>
                                        <h2 className="text-2xl font-bold text-white">{selected.name}</h2>
                                    </div>
                                    <p className="text-gray-400 text-sm">{selected.desc}</p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => speak(selected.arabic, 'ar-SA')}
                                    className="text-4xl p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all"
                                    style={{ fontFamily: 'serif' }}
                                >
                                    {selected.arabic}
                                </motion.button>
                            </div>

                            {/* Example */}
                            <div className="rounded-xl bg-white/10 p-4 mb-3">
                                <p className="text-xs text-gray-400 font-semibold mb-2">📝 উদাহরণ</p>
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <p className="text-2xl text-white leading-loose"
                                        style={{ fontFamily: 'serif', direction: 'rtl' }}>
                                        {selected.example}
                                    </p>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => speak(selected.example, 'ar-SA')}
                                        className="text-xs bg-white/10 text-gray-300 px-3 py-1.5 rounded-full hover:bg-white/20"
                                    >
                                        🔊 শুনুন
                                    </motion.button>
                                </div>
                                <p className="text-gray-400 text-xs mt-1">{selected.example_bn}</p>
                            </div>

                            {/* Letters */}
                            <div className="rounded-xl bg-white/5 p-3 mb-3">
                                <p className="text-xs text-gray-400 font-semibold mb-2">
                                    🔤 এই হরফগুলোতে এই rule প্রযোজ্য
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {selected.letters.map((letter, i) => (
                                        <motion.button
                                            key={i}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => speak(letter, 'ar-SA')}
                                            className={`w-10 h-10 rounded-xl bg-linear-to-br ${selected.color} flex items-center justify-center text-white font-bold text-lg shadow`}
                                            style={{ fontFamily: 'serif' }}
                                        >
                                            {letter}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Tip */}
                            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 mb-4">
                                <p className="text-xs text-amber-400 font-semibold mb-1">💡 মনে রাখার উপায়</p>
                                <p className="text-amber-200 text-sm">{selected.tip}</p>
                            </div>

                            {/* Practice button */}
                            <div className="flex gap-3">
                                <Link
                                    href={`/dashboard/student/islamic/tajweed/practice?rule=${selected.id}`}
                                    className="flex-1"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full py-3 rounded-xl bg-linear-to-r ${selected.color} text-white font-bold shadow-lg text-sm`}
                                    >
                                        🎙️ AI দিয়ে Practice করো
                                    </motion.button>
                                </Link>
                                {!practiced.includes(selected.id) ? (
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handlePracticed(selected.id)}
                                        className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-all"
                                    >
                                        ✅ বুঝেছি
                                    </motion.button>
                                ) : (
                                    <div className="px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm">
                                        ✅ শেখা
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Rules List */}
                <div className="grid grid-cols-2 gap-3">
                    {TAJWEED_RULES.map((rule, i) => (
                        <motion.button
                            key={rule.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(rule)}
                            className={`rounded-2xl border p-4 text-left transition-all ${selected.id === rule.id
                                    ? `${rule.bg} ${rule.border}`
                                    : practiced.includes(rule.id)
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">{rule.icon}</span>
                                {practiced.includes(rule.id) && (
                                    <span className="text-xs text-emerald-400">✅</span>
                                )}
                            </div>
                            <p className="font-bold text-white text-sm mb-0.5">{rule.name}</p>
                            <p className="text-lg text-white/60" style={{ fontFamily: 'serif' }}>
                                {rule.arabic}
                            </p>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    )
}