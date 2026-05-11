'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AnalysisResult } from '@/lib/groq'

interface Props {
    onAnalyze: () => Promise<AnalysisResult | null>
    label?: string
    context?: string
}

const sectorIcons: Record<string, string> = {
    education: '🎓',
    medical: '🏥',
    business: '💼',
    technology: '💻',
    family: '👨‍👩‍👧',
    social: '🌍',
}

const sectorNames: Record<string, string> = {
    education: 'শিক্ষা',
    medical: 'চিকিৎসা',
    business: 'ব্যবসা',
    technology: 'প্রযুক্তি',
    family: 'পরিবার',
    social: 'সমাজ',
}

export default function AnalysisPanel({ onAnalyze, label, context }: Props) {
    const [loading, setLoading] = useState(false)
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'lessons' | 'prophet' | 'science' | 'sectors' | 'steps'>('lessons')

    const handleAnalyze = async () => {
        if (analysis) {
            setAnalysis(null)
            return
        }
        setLoading(true)
        setError(null)
        try {
            const result = await onAnalyze()
            if (result) {
                setAnalysis(result)
            } else {
                setError('বিশ্লেষণ করা সম্ভব হয়নি। আবার চেষ্টা করুন।')
            }
        } catch {
            setError('সার্ভার সমস্যা হয়েছে।')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="my-4">
            {/* Trigger Button */}
            <button
                onClick={handleAnalyze}
                disabled={loading}
                className={`w-full rounded-2xl border p-4 flex items-center justify-center gap-3 transition-all duration-300 ${analysis
                        ? 'border-purple-500/50 bg-purple-500/10 text-purple-300'
                        : loading
                            ? 'border-white/10 bg-white/5 text-gray-400 cursor-wait'
                            : 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-300 hover:from-amber-500/20 hover:to-orange-500/20'
                    }`}
            >
                {loading ? (
                    <>
                        <span className="animate-spin text-xl">⚙️</span>
                        <span className="font-semibold">AI বিশ্লেষণ করছে...</span>
                    </>
                ) : analysis ? (
                    <>
                        <span>✨</span>
                        <span className="font-semibold">বিশ্লেষণ লুকাও</span>
                    </>
                ) : (
                    <>
                        <span className="text-xl">🔬</span>
                        <div className="text-left">
                            <p className="font-bold">
                                {label || 'AI বিশ্লেষণ দেখুন'}
                            </p>
                            {context && (
                                <p className="text-xs text-amber-400/70 mt-0.5">{context}</p>
                            )}
                        </div>
                    </>
                )}
            </button>

            {/* Error */}
            {error && (
                <div className="mt-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Analysis Panel */}
            <AnimatePresence>
                {analysis && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 rounded-2xl border border-purple-500/20 bg-[#0d0d22] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-b border-white/5 p-4">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">✨</span>
                                <div>
                                    <h3 className="font-bold text-white">AI গভীর বিশ্লেষণ</h3>
                                    <p className="text-xs text-gray-400">Groq LLaMA 3.3 70B দ্বারা বিশ্লেষিত</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex overflow-x-auto border-b border-white/5 px-2">
                            {[
                                { key: 'lessons', label: '📚 শিক্ষা' },
                                { key: 'prophet', label: '🕌 রাসূল ﷺ' },
                                { key: 'science', label: '🔬 বিজ্ঞান' },
                                { key: 'sectors', label: '🌍 Sectors' },
                                { key: 'steps', label: '✅ পদক্ষেপ' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                    className={`flex-shrink-0 px-3 py-3 text-xs font-semibold transition-colors border-b-2 ${activeTab === tab.key
                                            ? 'border-purple-400 text-purple-300'
                                            : 'border-transparent text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="p-4">
                            <AnimatePresence mode="wait">
                                {/* Main Lessons */}
                                {activeTab === 'lessons' && (
                                    <motion.div
                                        key="lessons"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-2"
                                    >
                                        <p className="text-xs text-gray-500 mb-3">এই অংশের মূল শিক্ষাসমূহ:</p>
                                        {analysis.mainLessons.map((lesson, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 bg-white/5 rounded-xl p-3"
                                            >
                                                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <p className="text-gray-300 text-sm leading-relaxed">{lesson}</p>
                                            </div>
                                        ))}

                                        {/* Life Impact */}
                                        <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                            <p className="text-xs text-emerald-400 font-semibold mb-2">💡 জীবনে প্রভাব</p>
                                            <p className="text-gray-300 text-sm leading-relaxed">{analysis.lifeImpact}</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Prophet Example */}
                                {activeTab === 'prophet' && (
                                    <motion.div
                                        key="prophet"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                    >
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                                            <p className="text-amber-300 text-xl mb-3 text-center">
                                                صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ
                                            </p>
                                            <p className="text-xs text-amber-400 font-semibold mb-3">
                                                রাসূল ﷺ কীভাবে এটি বাস্তবায়ন করেছিলেন:
                                            </p>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {analysis.prophetExample}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Science */}
                                {activeTab === 'science' && (
                                    <motion.div
                                        key="science"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-4"
                                    >
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                            <p className="text-xs text-blue-400 font-semibold mb-2">🔬 বৈজ্ঞানিক বিশ্লেষণ</p>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {analysis.scientificInsights}
                                            </p>
                                        </div>
                                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                                            <p className="text-xs text-indigo-400 font-semibold mb-2">📊 গবেষণা লব্ধ তথ্য</p>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {analysis.researchFindings}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Sectors */}
                                {activeTab === 'sectors' && (
                                    <motion.div
                                        key="sectors"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                    >
                                        {Object.entries(analysis.sectorApplications).map(([key, value]) => (
                                            <div
                                                key={key}
                                                className="bg-white/5 border border-white/10 rounded-xl p-3"
                                            >
                                                <p className="text-sm font-semibold text-white mb-1">
                                                    {sectorIcons[key] || '📌'} {sectorNames[key] || key}
                                                </p>
                                                <p className="text-gray-400 text-xs leading-relaxed">{value}</p>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Practical Steps */}
                                {activeTab === 'steps' && (
                                    <motion.div
                                        key="steps"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-2"
                                    >
                                        <p className="text-xs text-gray-500 mb-3">এখনই যা করতে পারো:</p>
                                        {analysis.practicalSteps.map((step, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3"
                                            >
                                                <span className="text-emerald-400 text-lg flex-shrink-0">
                                                    {i === 0 ? '1️⃣' : i === 1 ? '2️⃣' : i === 2 ? '3️⃣' : `${i + 1}.`}
                                                </span>
                                                <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}