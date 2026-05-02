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

            if (data.response) {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: data.response },
                ])
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: 'দুঃখিত, কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করো।' },
                ])
            }
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
        <main className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/student" className="text-gray-400 hover:text-gray-600 text-sm">
                        ← Dashboard
                    </Link>
                    <div className="text-sm font-medium text-gray-900">AI শিক্ষক</div>
                </div>
                <LogoutButton />
            </nav>

            {/* Chat area */}
            <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col">
                <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-green-700 text-white rounded-tr-sm'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                                    }`}
                            >
                                {msg.role === 'assistant' ? (
                                    <ReactMarkdown
                                        components={{
                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                                            li: ({ children }) => <li className="text-gray-700">{children}</li>,
                                            h1: ({ children }) => <h1 className="font-semibold text-base mb-2">{children}</h1>,
                                            h2: ({ children }) => <h2 className="font-semibold text-sm mb-1">{children}</h2>,
                                            h3: ({ children }) => <h3 className="font-medium text-sm mb-1">{children}</h3>,
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
                        <div className="flex justify-start">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm mr-3 shrink-0 mt-1">
                                🤖
                            </div>
                            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                                <div className="flex gap-1 items-center">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]" />
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Quick questions */}
                {messages.length === 1 && (
                    <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-2">দ্রুত প্রশ্ন করো:</p>
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
                                    className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-green-400 hover:text-green-700 transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <form onSubmit={handleSend} className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="যেকোনো প্রশ্ন করো..."
                        disabled={loading}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-green-700 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        পাঠাও
                    </button>
                </form>
            </div>
        </main>
    )
}