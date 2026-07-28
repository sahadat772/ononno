'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import AnimatedCard from '@/components/ui/AnimatedCard'
import Image from 'next/image'

const steps = [
    { id: 1, title: 'ব্যক্তিত্ব বিশ্লেষণ', icon: '🧠' },
    { id: 2, title: 'আগ্রহ নির্ধারণ', icon: '❤️' },
    { id: 3, title: 'দক্ষতা যাচাই', icon: '⚡' },
    { id: 4, title: 'ক্যারিয়ার সাজেশন', icon: '🎯' },
]

const personalityQuestions = [
    {
        id: 1,
        question: 'তুমি কোন ধরনের কাজ বেশি পছন্দ করো?',
        options: [
            { value: 'analytical', label: '📊 তথ্য বিশ্লেষণ ও সমস্যা সমাধান' },
            { value: 'creative', label: '🎨 সৃজনশীল কাজ ও ডিজাইন' },
            { value: 'social', label: '👥 মানুষের সাথে কাজ ও যোগাযোগ' },
            { value: 'technical', label: '⚙️ প্রযুক্তি ও যন্ত্রপাতি নিয়ে কাজ' },
        ],
    },
    {
        id: 2,
        question: 'তুমি কীভাবে সিদ্ধান্ত নাও?',
        options: [
            { value: 'logical', label: '🔢 তথ্য ও যুক্তির ভিত্তিতে' },
            { value: 'intuitive', label: '💫 অনুভূতি ও অন্তর্দৃষ্টি দিয়ে' },
            { value: 'collaborative', label: '🤝 অন্যদের মতামত নিয়ে' },
            { value: 'independent', label: '🦁 নিজে গবেষণা করে' },
        ],
    },
    {
        id: 3,
        question: 'তোমার কাজের পরিবেশ কেমন পছন্দ?',
        options: [
            { value: 'office', label: '🏢 অফিস ও কর্পোরেট পরিবেশ' },
            { value: 'outdoor', label: '🌿 বাইরে ও মাঠ পর্যায়ে' },
            { value: 'remote', label: '🏠 ঘরে বসে স্বাধীনভাবে' },
            { value: 'lab', label: '🔬 গবেষণাগার ও স্টুডিও' },
        ],
    },
]

const interestQuestions = [
    {
        id: 4,
        question: 'কোন বিষয়টি তোমাকে সবচেয়ে বেশি আকর্ষণ করে?',
        options: [
            { value: 'tech', label: '💻 প্রযুক্তি ও কম্পিউটার' },
            { value: 'business', label: '📈 ব্যবসা ও উদ্যোক্তা' },
            { value: 'medicine', label: '🏥 চিকিৎসা ও স্বাস্থ্য' },
            { value: 'education', label: '📚 শিক্ষা ও গবেষণা' },
        ],
    },
    {
        id: 5,
        question: 'তুমি কীভাবে সময় কাটাতে পছন্দ করো?',
        options: [
            { value: 'reading', label: '📖 পড়াশোনা ও শেখা' },
            { value: 'building', label: '🔨 কিছু তৈরি করা' },
            { value: 'helping', label: '🤲 অন্যদের সাহায্য করা' },
            { value: 'trading', label: '💹 বিনিয়োগ ও ব্যবসা' },
        ],
    },
]

const skillQuestions = [
    {
        id: 6,
        question: 'তোমার সবচেয়ে শক্তিশালী দিক কোনটি?',
        options: [
            { value: 'math', label: '🔢 গণিত ও বিশ্লেষণ' },
            { value: 'language', label: '✍️ ভাষা ও লেখালেখি' },
            { value: 'leadership', label: '👑 নেতৃত্ব ও ব্যবস্থাপনা' },
            { value: 'innovation', label: '💡 উদ্ভাবন ও সমস্যা সমাধান' },
        ],
    },
    {
        id: 7,
        question: 'তুমি ভবিষ্যতে কী অর্জন করতে চাও?',
        options: [
            { value: 'wealth', label: '💰 আর্থিক স্বাধীনতা' },
            { value: 'impact', label: '🌍 সমাজে ইতিবাচক প্রভাব' },
            { value: 'knowledge', label: '🎓 উচ্চ শিক্ষা ও গবেষণা' },
            { value: 'entrepreneurship', label: '🚀 নিজের ব্যবসা' },
        ],
    },
]

const careerSuggestions: Record<string, { title: string; desc: string; paths: string[]; salary: string; icon: string; color: string }> = {
    tech: {
        title: 'Software Engineer / AI Developer',
        desc: 'তোমার বিশ্লেষণী মন ও প্রযুক্তির প্রতি আগ্রহ তোমাকে একজন দক্ষ Software Engineer বানাতে পারে।',
        paths: ['Computer Science পড়ো', 'Python & JavaScript শেখো', 'AI/ML certification করো', 'Freelancing শুরু করো'],
        salary: '৳৫০,০০০ – ৳৩,০০,০০০/মাস',
        icon: '💻',
        color: 'from-blue-500 to-cyan-600',
    },
    business: {
        title: 'Entrepreneur / Business Leader',
        desc: 'তোমার নেতৃত্বগুণ ও ব্যবসায়িক মনোভাব তোমাকে একজন সফল উদ্যোক্তা বানাতে পারে।',
        paths: ['BBA / MBA পড়ো', 'Digital Marketing শেখো', 'Small business শুরু করো', 'Networking বাড়াও'],
        salary: '৳১,০০,০০০+ (নিজের ব্যবসায়)',
        icon: '📈',
        color: 'from-green-500 to-emerald-600',
    },
    medicine: {
        title: 'Doctor / Healthcare Professional',
        desc: 'মানুষের সেবা করার আগ্রহ ও বিজ্ঞানের প্রতি ভালোবাসা তোমাকে একজন দক্ষ চিকিৎসক বানাতে পারে।',
        paths: ['Biology ও Chemistry ভালো করো', 'MBBS পড়ো', 'Specialization করো', 'Research করো'],
        salary: '৳৮০,০০০ – ৳৫,০০,০০০/মাস',
        icon: '🏥',
        color: 'from-rose-500 to-pink-600',
    },
    education: {
        title: 'Researcher / Educator',
        desc: 'জ্ঞান অর্জন ও অন্যদের শেখানোর আগ্রহ তোমাকে একজন গবেষক বা শিক্ষক হিসেবে সফল করবে।',
        paths: ['পছন্দের বিষয়ে Masters করো', 'Research paper লেখো', 'PhD করো', 'University তে পড়াও'],
        salary: '৳৪০,০০০ – ৳২,০০,০০০/মাস',
        icon: '📚',
        color: 'from-purple-500 to-violet-600',
    },
}

export default function CareerPage() {
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [isComplete, setIsComplete] = useState(false)
    const [aiAnalysis, setAiAnalysis] = useState('')
    const [loading, setLoading] = useState(false)

    const allQuestions = [...personalityQuestions, ...interestQuestions, ...skillQuestions]
    const currentQuestion = allQuestions[currentStep]

    function handleAnswer(value: string) {
        const newAnswers = { ...answers, [currentQuestion.id]: value }
        setAnswers(newAnswers)

        if (currentStep < allQuestions.length - 1) {
            setTimeout(() => setCurrentStep(currentStep + 1), 300)
        } else {
            analyzeCareer(newAnswers)
        }
    }

    async function analyzeCareer(finalAnswers: Record<number, string>) {
        setLoading(true)
        setIsComplete(true)

        try {
            const interests = Object.values(finalAnswers).join(', ')
            const response = await fetch('/api/career', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'শিক্ষার্থী',
                    classLevel: 'SSC পরবর্তী',
                    interests: Object.values(finalAnswers).slice(0, 3),
                    strengths: Object.values(finalAnswers).slice(3),
                    messages: [
                        {
                            role: 'user',
                            content: `আমার উত্তরগুলো: ${interests}। আমার জন্য সেরা ক্যারিয়ার path কী হবে? বিস্তারিত বলো।`,
                        },
                    ],
                }),
            })
            const data = await response.json()
            setAiAnalysis(data.response || '')
        } catch {
            setAiAnalysis('AI বিশ্লেষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করো।')
        } finally {
            setLoading(false)
        }
    }

    const getCareerSuggestion = () => {
        const interestAnswer = answers[4] || 'tech'
        return careerSuggestions[interestAnswer] || careerSuggestions.tech
    }

    const getStepIndex = () => {
        if (currentStep < 3) return 0
        if (currentStep < 5) return 1
        if (currentStep < 7) return 2
        return 3
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/50 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/student" className="text-gray-400 hover:text-gray-600">
                            <Image
                                src="/icons/logo-icon.png"
                                alt="অনন্য"
                                width={40}
                                height={40}
                                className="rounded-xl"
                            />←</Link>
                        <div className="text-lg font-bold text-gradient-primary">ক্যারিয়ার পাথ AI</div>
                    </div>
                    {!isComplete && (
                        <div className="text-sm text-gray-500">
                            {currentStep + 1}/{allQuestions.length}
                        </div>
                    )}
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">

                {!isComplete ? (
                    <>
                        {/* Steps indicator */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between mb-10"
                        >
                            {steps.map((step, i) => (
                                <div key={step.id} className="flex items-center gap-2 flex-1">
                                    <div className={`flex items-center gap-2 ${i <= getStepIndex() ? 'text-green-700' : 'text-gray-300'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${i < getStepIndex()
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : i === getStepIndex()
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 bg-white'
                                            }`}>
                                            {i < getStepIndex() ? '✓' : step.icon}
                                        </div>
                                        <span className="text-xs font-medium hidden md:block">{step.title}</span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-2 ${i < getStepIndex() ? 'bg-green-500' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            ))}
                        </motion.div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-10">
                            <motion.div
                                animate={{ width: `${((currentStep + 1) / allQuestions.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                                className="gradient-primary h-2 rounded-full"
                            />
                        </div>

                        {/* Question */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                            >
                                <AnimatedCard className="p-8 mb-6" hover={false}>
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-green-200">
                                            {steps[getStepIndex()].icon}
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {currentQuestion.question}
                                        </h2>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-3">
                                        {currentQuestion.options.map((option) => (
                                            <motion.button
                                                key={option.value}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleAnswer(option.value)}
                                                className={`p-4 rounded-2xl border-2 text-left transition-all font-medium text-sm ${answers[currentQuestion.id] === option.value
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-green-200 hover:bg-green-50/50'
                                                    }`}
                                            >
                                                {option.label}
                                            </motion.button>
                                        ))}
                                    </div>
                                </AnimatedCard>

                                {currentStep > 0 && (
                                    <button
                                        onClick={() => setCurrentStep(currentStep - 1)}
                                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        ← আগের প্রশ্নে ফিরে যাও
                                    </button>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </>
                ) : (
                    /* Results */
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-green-200 animate-pulse">
                                    🧠
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">AI বিশ্লেষণ করছে...</h2>
                                <p className="text-gray-500 text-sm">তোমার উত্তরগুলো ML দিয়ে বিশ্লেষণ হচ্ছে</p>
                                <div className="flex justify-center gap-1 mt-6">
                                    {[0, 1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="w-3 h-3 bg-green-500 rounded-full animate-bounce"
                                            style={{ animationDelay: `${i * 150}ms` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Success header */}
                                <div className="text-center mb-8">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', delay: 0.2 }}
                                        className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-xl shadow-green-200"
                                    >
                                        🎯
                                    </motion.div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        তোমার ক্যারিয়ার বিশ্লেষণ সম্পন্ন!
                                    </h2>
                                    <p className="text-gray-500">AI তোমার জন্য সেরা path বেছে নিয়েছে</p>
                                </div>

                                {/* Career suggestion */}
                                {(() => {
                                    const career = getCareerSuggestion()
                                    return (
                                        <AnimatedCard className="p-8 mb-6" hover={false}>
                                            <div className={`w-16 h-16 bg-gradient-to-br ${career.color} rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg`}>
                                                {career.icon}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">{career.title}</h3>
                                            <p className="text-gray-600 leading-relaxed mb-5">{career.desc}</p>

                                            <div className="bg-green-50 rounded-2xl p-4 mb-5">
                                                <div className="text-sm font-semibold text-green-800 mb-1">💰 আনুমানিক আয়</div>
                                                <div className="text-green-700 font-bold">{career.salary}</div>
                                            </div>

                                            <h4 className="font-bold text-gray-900 mb-3">📍 এগিয়ে যাওয়ার পথ</h4>
                                            <div className="space-y-2">
                                                {career.paths.map((path, i) => (
                                                    <motion.div
                                                        key={path}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                                                    >
                                                        <div className={`w-7 h-7 bg-gradient-to-br ${career.color} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                                            {i + 1}
                                                        </div>
                                                        <span className="text-sm text-gray-700">{path}</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </AnimatedCard>
                                    )
                                })()}

                                {/* AI Analysis */}
                                {aiAnalysis && (
                                    <AnimatedCard className="p-6 mb-6" hover={false}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 gradient-secondary rounded-xl flex items-center justify-center text-xl shadow-md">
                                                🤖
                                            </div>
                                            <h3 className="font-bold text-gray-900">AI এর বিস্তারিত বিশ্লেষণ</h3>
                                        </div>
                                        <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                            {aiAnalysis}
                                        </div>
                                    </AnimatedCard>
                                )}

                                {/* Actions */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Link
                                        href="/dashboard/student/ai-tutor?topic=career"
                                        className="flex items-center justify-center gap-2 gradient-primary text-white py-4 rounded-2xl font-semibold shadow-lg shadow-green-200 hover:shadow-green-300 transition-shadow"
                                    >
                                        🤖 AI এর সাথে আলোচনা করো
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setCurrentStep(0)
                                            setAnswers({})
                                            setIsComplete(false)
                                            setAiAnalysis('')
                                        }}
                                        className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        🔄 আবার করো
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </div>
        </main>
    )
}