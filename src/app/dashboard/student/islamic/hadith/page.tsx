'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import AnimatedCard from '@/components/ui/AnimatedCard'

const hadiths = [
    {
        id: 1,
        arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
        bangla: 'নিশ্চয়ই সকল কাজ নিয়তের উপর নির্ভরশীল।',
        source: 'বুখারী ও মুসলিম',
        narrator: 'উমর ইবনুল খাত্তাব (রা.)',
        topic: 'নিয়ত',
        explanation: 'এই হাদিসটি ইসলামের অন্যতম মূলনীতি। যেকোনো ইবাদত বা কাজে নিয়ত বা উদ্দেশ্য সঠিক হওয়া জরুরি। আল্লাহর সন্তুষ্টির জন্য কাজ করলে সওয়াব পাওয়া যায়।',
        difficulty: 'সহজ',
    },
    {
        id: 2,
        arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
        bangla: 'মুসলিম সেই ব্যক্তি যার জিহ্বা ও হাত থেকে অন্য মুসলিমরা নিরাপদ।',
        source: 'বুখারী',
        narrator: 'আবদুল্লাহ ইবন আমর (রা.)',
        topic: 'চরিত্র',
        explanation: 'একজন প্রকৃত মুসলিম অন্যদের কথা ও কাজে কষ্ট দেয় না। ভালো চরিত্র ইসলামের অন্যতম গুরুত্বপূর্ণ বিষয়।',
        difficulty: 'সহজ',
    },
    {
        id: 3,
        arabic: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
        bangla: 'জ্ঞান অর্জন করা প্রতিটি মুসলিমের উপর ফরয।',
        source: 'ইবন মাজাহ',
        narrator: 'আনাস ইবন মালিক (রা.)',
        topic: 'জ্ঞান',
        explanation: 'ইসলাম জ্ঞান অর্জনকে অত্যন্ত গুরুত্ব দেয়। দ্বীনি ও দুনিয়াবি উভয় জ্ঞান অর্জন করা প্রত্যেক মুসলিমের দায়িত্ব।',
        difficulty: 'সহজ',
    },
    {
        id: 4,
        arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
        bangla: 'তোমাদের কেউ প্রকৃত মুমিন হবে না যতক্ষণ না সে তার ভাইয়ের জন্য তাই পছন্দ করে যা নিজের জন্য পছন্দ করে।',
        source: 'বুখারী ও মুসলিম',
        narrator: 'আনাস ইবন মালিক (রা.)',
        topic: 'ভ্রাতৃত্ব',
        explanation: 'মুসলিমদের মধ্যে ভ্রাতৃত্ব ও পারস্পরিক ভালোবাসা ইমানের অংশ। অন্যের জন্য ভালো চাওয়া ইসলামের মূল শিক্ষা।',
        difficulty: 'মাধ্যমিক',
    },
    {
        id: 5,
        arabic: 'الدِّينُ النَّصِيحَةُ',
        bangla: 'দ্বীন হলো কল্যাণ কামনা।',
        source: 'মুসলিম',
        narrator: 'তামিম আদ-দারি (রা.)',
        topic: 'দ্বীন',
        explanation: 'ইসলাম ধর্মের মূল বিষয় হলো আল্লাহ, তাঁর রাসূল, মুসলিম নেতা এবং সাধারণ মুসলিমদের জন্য কল্যাণ কামনা করা।',
        difficulty: 'মাধ্যমিক',
    },
]

const topicColors: Record<string, string> = {
    নিয়ত: 'bg-green-100 text-green-700',
    চরিত্র: 'bg-blue-100 text-blue-700',
    জ্ঞান: 'bg-purple-100 text-purple-700',
    ভ্রাতৃত্ব: 'bg-amber-100 text-amber-700',
    দ্বীন: 'bg-rose-100 text-rose-700',
}

export default function HadithPage() {
    const [selectedHadith, setSelectedHadith] = useState<typeof hadiths[0] | null>(null)
    const [memorized, setMemorized] = useState<number[]>([])

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/50 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/student/islamic" className="text-gray-400 hover:text-gray-600">←</Link>
                        <div className="text-lg font-bold text-gradient-primary">হাদিস শিক্ষা</div>
                    </div>
                    <div className="text-sm text-gray-500">{memorized.length}/{hadiths.length} মুখস্থ</div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 text-white mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-10">
                        <div className="text-5xl mb-4">📜</div>
                        <h1 className="text-2xl font-bold mb-2">হাদিস শিক্ষা</h1>
                        <p className="text-amber-100 text-sm mb-1">
                            قَالَ رَسُولُ اللَّهِ ﷺ — রাসূলুল্লাহ ﷺ বলেছেন
                        </p>
                        <p className="text-amber-100/80 text-sm">
                            সহীহ বুখারী, মুসলিম সহ বিভিন্ন হাদিস গ্রন্থ থেকে গুরুত্বপূর্ণ হাদিস শিখো
                        </p>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Hadith list */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="font-bold text-gray-900 mb-4">হাদিস সংকলন</h2>
                        {hadiths.map((hadith, i) => (
                            <motion.div
                                key={hadith.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                onClick={() => setSelectedHadith(hadith)}
                                className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-md ${selectedHadith?.id === hadith.id
                                        ? 'border-amber-300 shadow-md shadow-amber-100'
                                        : 'border-gray-100'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-xl font-arabic text-gray-800 mb-2 leading-loose text-right" dir="rtl">
                                            {hadith.arabic}
                                        </p>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                            {hadith.bangla}
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${topicColors[hadith.topic] || 'bg-gray-100 text-gray-700'}`}>
                                                {hadith.topic}
                                            </span>
                                            <span className="text-xs text-gray-400">📚 {hadith.source}</span>
                                            {memorized.includes(hadith.id) && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                                    ✓ মুখস্থ
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Hadith detail */}
                    <div className="lg:col-span-1">
                        <AnimatePresence mode="wait">
                            {selectedHadith ? (
                                <motion.div
                                    key={selectedHadith.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="sticky top-24"
                                >
                                    <AnimatedCard className="p-6" hover={false}>
                                        {/* Arabic */}
                                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 mb-5 border border-amber-100 text-center">
                                            <p className="text-2xl font-arabic text-gray-800 leading-loose mb-2" dir="rtl">
                                                {selectedHadith.arabic}
                                            </p>
                                        </div>

                                        {/* Bangla */}
                                        <p className="text-sm text-gray-700 leading-relaxed mb-4 font-medium">
                                            {selectedHadith.bangla}
                                        </p>

                                        {/* Source */}
                                        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs text-gray-500 space-y-1">
                                            <div>📚 <span className="font-medium">সূত্র:</span> {selectedHadith.source}</div>
                                            <div>👤 <span className="font-medium">বর্ণনাকারী:</span> {selectedHadith.narrator}</div>
                                            <div>🏷️ <span className="font-medium">বিষয়:</span> {selectedHadith.topic}</div>
                                        </div>

                                        {/* Explanation */}
                                        <div className="mb-5">
                                            <h4 className="font-semibold text-gray-900 text-sm mb-2">ব্যাখ্যা</h4>
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                {selectedHadith.explanation}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-2">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    if (memorized.includes(selectedHadith.id)) {
                                                        setMemorized(memorized.filter(id => id !== selectedHadith.id))
                                                    } else {
                                                        setMemorized([...memorized, selectedHadith.id])
                                                    }
                                                }}
                                                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${memorized.includes(selectedHadith.id)
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200'
                                                    }`}
                                            >
                                                {memorized.includes(selectedHadith.id) ? '✓ মুখস্থ হয়েছে' : 'মুখস্থ করেছি ✓'}
                                            </motion.button>
                                            <Link
                                                href={`/dashboard/student/ai-tutor?topic=hadith&q=${encodeURIComponent(selectedHadith.bangla)}`}
                                                className="block w-full text-center border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                AI কে প্রশ্ন করো
                                            </Link>
                                        </div>
                                    </AnimatedCard>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-8 text-center"
                                >
                                    <div className="text-5xl mb-4">📜</div>
                                    <p className="text-gray-500 text-sm">একটি হাদিস select করো</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </main>
    )
}