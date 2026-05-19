'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface TeacherAIClientProps {
    teacherId: string
    teacherName: string
    studentsCount: number
}

const SUGGESTED_QUESTIONS = [
    'আমার class এর average performance কেমন?',
    'কোন student সবচেয়ে দুর্বল?',
    'এই সপ্তাহে কারা ভালো করেছে?',
    'কোন বিষয়ে সবচেয়ে বেশি ভুল হচ্ছে?',
    'কোন student দীর্ঘদিন login করেনি?',
]

export default function TeacherAIClient({
    teacherId,
    teacherName,
    studentsCount,
}: TeacherAIClientProps) {
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (question: string) => {
        if (!question.trim() || isLoading) return

        const userMessage: Message = { role: 'user', content: question }
        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/chat/teacher-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacher_id: teacherId,
                    question,
                    conversation_history: messages,
                }),
            })

            const data = await res.json()

            if (data.answer) {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.answer,
                }
                setMessages((prev) => [...prev, assistantMessage])
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'দুঃখিত, কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করো।',
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        void sendMessage(input)
    }

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col">
            {/* Header */}
            <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/dashboard/teacher')}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition"
                    >
                        ←
                    </motion.button>
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-lg">
                            🤖
                        </div>
                        <div>
                            <h1 className="text-white font-bold">AI Assistant</h1>
                            <p className="text-white/40 text-xs">
                                {studentsCount} জন student এর data বিশ্লেষণ করতে পারব
                            </p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMessages([])}
                        className="text-white/40 text-xs hover:text-white transition px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
                    >
                        নতুন chat
                    </motion.button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-4 overflow-y-auto">
                {/* Welcome */}
                {messages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-linear-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-6 text-center">
                            <p className="text-4xl mb-3">🤖</p>
                            <h2 className="text-white font-bold text-xl mb-2">
                                আস-সালামু আলাইকুম, {teacherName}!
                            </h2>
                            <p className="text-white/60 text-sm">
                                আমি আপনার {studentsCount} জন student এর সব data বিশ্লেষণ করতে পারি।
                                যেকোনো প্রশ্ন করুন।
                            </p>
                        </div>

                        {/* Suggested Questions */}
                        <div>
                            <p className="text-white/40 text-sm mb-3">💡 প্রস্তাবিত প্রশ্ন:</p>
                            <div className="space-y-2">
                                {SUGGESTED_QUESTIONS.map((q, i) => (
                                    <motion.button
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => void sendMessage(q)}
                                        className="w-full text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition text-sm"
                                    >
                                        {q}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Chat Messages */}
                <AnimatePresence>
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                        ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white'
                                        : 'bg-white/5 border border-white/10 text-white'
                                    }`}
                            >
                                {message.role === 'assistant' && (
                                    <p className="text-violet-400 text-xs mb-2">🤖 AI Assistant</p>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                            <p className="text-violet-400 text-xs mb-2">🤖 AI Assistant</p>
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                                        className="w-2 h-2 rounded-full bg-violet-400"
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="যেকোনো প্রশ্ন করুন..."
                            disabled={isLoading}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition disabled:opacity-50"
                        />
                        <motion.button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            পাঠাও
                        </motion.button>
                    </form>
                </div>
            </div>
        </div>
    )
}