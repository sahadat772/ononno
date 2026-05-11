'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import LogoutButton from '@/components/shared/LogoutButton'
import ReactMarkdown from 'react-markdown'

type Message = {
    role: 'user' | 'assistant'
    content: string
}

export default function AITutorPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'আস-সালামু আলাইকুম! আমি তোমার AI শিক্ষক। আজকে কী পড়তে চাও বা কোন বিষয়ে সাহায্য লাগবে?',
        },
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function handleSend(e: React.FormEvent) {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage: Message = { role: 'user', content: input }
        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    name: 'শিক্ষার্থী',
                    classLevel: 'সাধারণ',
                }),
            })

            const data = await response.json()

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.response || 'দুঃখিত, কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করো।',
                },
            ])
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'দুঃখিত, connection সমস্যা হয়েছে।' },
            ])
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="h-screen bg-[#0a0a1a] flex flex-col overflow-hidden">
            {/* Navbar */}
            <nav className="shrink-0 border-b border-white/10 bg-[#0a0a1a]/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/student" className="text-gray-400 hover:text-white text-sm transition-colors">
                        ←
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-base">
                            🤖
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-white">AI শিক্ষক</div>
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs text-emerald-400">অনলাইন</span>
                            </div>
                        </div>
                    </div>
                </div>
                <LogoutButton />
            </nav>

            {/* Chat area — scrollable */}
            <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4">
                <div className="max-w-2xl mx-auto space-y-4">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-xs shrink-0 mb-1">
                                    🤖
                                </div>
                            )}
                            <div
                                className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-violet-600 text-white rounded-br-sm'
                                        : 'bg-white/10 border border-white/10 text-gray-100 rounded-bl-sm'
                                    }`}
                            >
                                {msg.role === 'assistant' ? (
                                    <ReactMarkdown
                                        components={{
                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                                            li: ({ children }) => <li className="text-gray-200">{children}</li>,
                                            h1: ({ children }) => <h1 className="font-semibold text-base mb-2 text-white">{children}</h1>,
                                            h2: ({ children }) => <h2 className="font-semibold text-sm mb-1 text-white">{children}</h2>,
                                            h3: ({ children }) => <h3 className="font-medium text-sm mb-1 text-white">{children}</h3>,
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start items-end gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-xs shrink-0">
                                🤖
                            </div>
                            <div className="bg-white/10 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm">
                                <div className="flex gap-1 items-center">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Quick questions — only on first message */}
            {messages.length === 1 && (
                <div className="shrink-0 px-3 md:px-4 pb-2 max-w-2xl mx-auto w-full">
                    <p className="text-xs text-gray-500 mb-2">দ্রুত প্রশ্ন করো:</p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            'কুরআন তিলাওয়াত শিখতে চাই',
                            'গণিতে সাহায্য লাগবে',
                            'ক্যারিয়ার নিয়ে পরামর্শ দাও',
                            'ইংরেজি গ্রামার বোঝাও',
                        ].map((q) => (
                            <button
                                key={q}
                                onClick={() => setInput(q)}
                                className="text-xs bg-white/5 border border-white/10 text-gray-400 px-3 py-1.5 rounded-full hover:border-violet-500/50 hover:text-violet-400 transition-colors"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input — fixed at bottom */}
            <div className="shrink-0 border-t border-white/10 bg-[#0a0a1a]/90 backdrop-blur-xl px-3 md:px-4 py-3">
                <form onSubmit={handleSend} className="max-w-2xl mx-auto flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="যেকোনো প্রশ্ন করো..."
                        disabled={loading}
                        className="flex-1 min-w-0 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-violet-600 text-white px-4 md:px-5 py-3 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                        পাঠাও
                    </button>
                </form>
            </div>
        </main>
    )
}