'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
    topic?: string
    sources?: { type: string; ref: string; text: string }[]
    timestamp: Date
}

const QUICK_QUESTIONS = [
    'নামাজের নিয়ত কীভাবে করবো?',
    'যাকাত কখন ফরজ হয়?',
    'পরীক্ষার আগে কোন দোয়া পড়বো?',
    'সূরা ইখলাসের ফজিলত কী?',
    'রোজা ভাঙার কারণগুলো কী?',
    'ঘুমানোর আগে কী পড়তে হয়?',
]

const TOPIC_COLORS: Record<string, string> = {
    fiqh: 'bg-cyan-500/20 text-cyan-400',
    aqeedah: 'bg-violet-500/20 text-violet-400',
    quran: 'bg-emerald-500/20 text-emerald-400',
    hadith: 'bg-amber-500/20 text-amber-400',
    seerah: 'bg-indigo-500/20 text-indigo-400',
    dua: 'bg-rose-500/20 text-rose-400',
    general: 'bg-gray-500/20 text-gray-400',
}

const TOPIC_NAMES: Record<string, string> = {
    fiqh: 'ফিকহ',
    aqeedah: 'আকীদা',
    quran: 'কুরআন',
    hadith: 'হাদিস',
    seerah: 'সিরাহ',
    dua: 'দোয়া',
    general: 'সাধারণ',
}

export default function IslamicChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '0',
            role: 'assistant',
            content: 'আস-সালামু আলাইকুম! আমি উস্তাদ AI। কুরআন ও সহীহ হাদিসের আলোকে আপনার যেকোনো Islamic প্রশ্নের উত্তর দিতে পারবো। কী জানতে চান?',
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const msgIdRef = useRef(0)
    const nextId = () => { msgIdRef.current += 1; return msgIdRef.current.toString() }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (question?: string) => {
        const text = (question || input).trim()
        if (!text || loading) return

        const now = new Date()
        const userMsg: Message = {
            id: nextId(),
            role: 'user',
            content: text,
            timestamp: now,
        }

        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            // Conversation history বানাও
            const history = messages.slice(-6).map(m => ({
                role: m.role,
                content: m.content,
            }))

            const res = await fetch('/api/islamic/islamic-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: text,
                    conversation_history: history,
                }),
            })

            const data = await res.json()

            const assistantMsg: Message = {
                id: nextId(),
                role: 'assistant',
                content: res.ok ? data.answer : 'মাফ করবেন, এই মুহূর্তে উত্তর দিতে পারছি না। আবার চেষ্টা করুন।',
                topic: data.topic,
                sources: data.sources,
                timestamp: new Date(),
            }

            setMessages(prev => [...prev, assistantMsg])
        } catch {
            const errMsg: Message = {
                id: nextId(),
                role: 'assistant',
                content: 'মাফ করবেন, connection সমস্যা হয়েছে। আবার চেষ্টা করুন।',
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, errMsg])
        } finally {
            setLoading(false)
            inputRef.current?.focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="h-screen bg-linear-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white flex flex-col">

            {/* Header */}
            <div className="flex-shrink: 0; bg-[#0d0a2e]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard/student/islamic"
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                        ← Islamic
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-sm font-bold text-white">উস্তাদ AI</span>
                        <span className="text-xs text-gray-500">Online</span>
                    </div>
                    <button
                        onClick={() => setMessages([{
                            id: '0',
                            role: 'assistant',
                            content: 'আস-সালামু আলাইকুম! নতুন কথোপকথন শুরু হয়েছে। কী জানতে চান?',
                            timestamp: new Date(),
                        }])}
                        className="text-xs text-gray-400 hover:text-white"
                    >
                        🗑️ Clear
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="max-w-2xl mx-auto space-y-4">

                    {/* Quick questions — only show at start */}
                    {messages.length === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4"
                        >
                            <p className="text-xs text-gray-500 mb-2 text-center">
                                জনপ্রিয় প্রশ্নগুলো
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {QUICK_QUESTIONS.map((q, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSend(q)}
                                        className="text-xs bg-white/5 border border-white/10 text-gray-300 px-3 py-2 rounded-xl hover:bg-white/10 transition-all text-left"
                                    >
                                        {q}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Message list */}
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
                            >
                                {/* Avatar */}
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm flex-shrink: 0; mt-1">
                                        🤖
                                    </div>
                                )}

                                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>

                                    {/* Topic badge */}
                                    {msg.topic && msg.role === 'assistant' && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${TOPIC_COLORS[msg.topic] || TOPIC_COLORS.general}`}>
                                            {TOPIC_NAMES[msg.topic] || msg.topic}
                                        </span>
                                    )}

                                    {/* Message bubble */}
                                    <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user'
                                        ? 'bg-linear-to-br from-emerald-500 to-teal-600 text-white rounded-tr-sm'
                                        : 'bg-white/10 border border-white/10 text-gray-200 rounded-tl-sm'
                                        }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {msg.content}
                                        </p>
                                    </div>

                                    {/* Sources */}
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {msg.sources.map((src, i) => (
                                                <span
                                                    key={i}
                                                    className={`text-xs px-2 py-1 rounded-full ${src.type === 'quran'
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : 'bg-amber-500/20 text-amber-400'
                                                        }`}
                                                >
                                                    {src.type === 'quran' ? '📖' : '📜'} {src.ref}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Timestamp */}
                                    <p className="text-xs text-gray-600">
                                        {msg.timestamp.toLocaleTimeString('bn-BD', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>

                                {/* User avatar */}
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm flex-shrink: 0; mt-1">
                                        👤
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Loading indicator */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm flex-shrink: 0;">
                                🤖
                            </div>
                            <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                                <div className="flex gap-1.5 items-center">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            className="w-2 h-2 bg-emerald-400 rounded-full"
                                            animate={{ y: [0, -6, 0] }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 0.6,
                                                delay: i * 0.15,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input area */}
            <div className="flex-shrink: 0; bg-[#0d0a2e]/90 backdrop-blur-xl border-t border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 rounded-2xl bg-white/10 border border-white/20 focus-within:border-emerald-500/50 transition-all">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Islamic প্রশ্ন লিখুন... (Enter = পাঠান)"
                                rows={1}
                                className="w-full bg-transparent text-white text-sm px-4 py-3 resize-none focus:outline-none placeholder-gray-500 max-h-32"
                                style={{ minHeight: '48px' }}
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSend()}
                            disabled={!input.trim() || loading}
                            className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white disabled:opacity-40 shadow-lg shadow-emerald-500/30 flex-shrink: 0;"
                        >
                            {loading ? (
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                >
                                    ⏳
                                </motion.span>
                            ) : '→'}
                        </motion.button>
                    </div>
                    <p className="text-xs text-gray-600 text-center mt-2">
                        উস্তাদ AI — শুধু Quran ও Sahih Hadith থেকে উত্তর দেয় • আল্লাহই সর্বজ্ঞ
                    </p>
                </div>
            </div>
        </div>
    )
}