'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { createClient } from '@/lib/supabase'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type SubjectId = 'general' | 'math' | 'bangla' | 'english' | 'science' | 'islamic'

const SUBJECTS: { id: SubjectId; label: string; emoji: string }[] = [
  { id: 'general', label: 'সাধারণ', emoji: '💡' },
  { id: 'math', label: 'গণিত', emoji: '🔢' },
  { id: 'bangla', label: 'বাংলা', emoji: '📖' },
  { id: 'english', label: 'English', emoji: '🔤' },
  { id: 'science', label: 'বিজ্ঞান', emoji: '🔬' },
  { id: 'islamic', label: 'ইসলামিক', emoji: '🕌' },
]

const QUICK_BY_SUBJECT: Record<SubjectId, string[]> = {
  general: [
    'আজকের পড়া কীভাবে পরিকল্পনা করব?',
    'মনোযোগ বাড়ানোর উপায় কী?',
    'পরীক্ষার আগে কীভাবে রিভিশন নেব?',
  ],
  math: [
    'ভগ্নাংশ সহজ করে বোঝাও',
    'গুণের টেবিল মনে রাখার টিপস',
    'একটা যোগ-বিয়োগের অংক দাও',
  ],
  bangla: [
    'স্বরবর্ণ ও ব্যঞ্জনবর্ণের পার্থক্য',
    'একটা ছোট অনুচ্ছেদ লিখতে সাহায্য করো',
    'বিশেষ্য-সর্বনাম উদাহরণসহ বোঝাও',
  ],
  english: [
    'Present tense সহজ করে বোঝাও',
    'Help me with simple sentences',
    'A/An/The কখন ব্যবহার করব?',
  ],
  science: [
    'সৌরজগৎ সহজ ভাষায় বলো',
    'উদ্ভিদের অংশগুলো কী কী?',
    'পানি চক্র কীভাবে কাজ করে?',
  ],
  islamic: [
    'নামাজের ফরজ কয়টি?',
    'সূরা ফাতিহার অর্থ বলো',
    'রোজার নিয়ম সংক্ষেপে বলো',
  ],
}

function classLabel(level?: string | null) {
  if (!level) return 'সাধারণ'
  const map: Record<string, string> = {
    nursery: 'নার্সারি',
    kg: 'কেজি',
    class_1: 'প্রথম শ্রেণি',
    class_2: 'দ্বিতীয় শ্রেণি',
    class_3: 'তৃতীয় শ্রেণি',
    class_4: 'চতুর্থ শ্রেণি',
    class_5: 'পঞ্চম শ্রেণি',
    general: 'সাধারণ',
  }
  return map[level] || level
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState<SubjectId>('general')
  const [studentName, setStudentName] = useState('শিক্ষার্থী')
  const [classLevel, setClassLevel] = useState('সাধারণ')
  const [profileLoaded, setProfileLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idRef = useRef(0)
  const nextId = () => {
    idRef.current += 1
    return String(idRef.current)
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setProfileLoaded(true)
          return
        }
        const [{ data: profile }, { data: student }] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', user.id).single(),
          supabase.from('student_profiles').select('class_level').eq('user_id', user.id).single(),
        ])
        const name = profile?.full_name?.split(' ')[0] || 'শিক্ষার্থী'
        const level = classLabel(student?.class_level)
        setStudentName(name)
        setClassLevel(level)
        setMessages([
          {
            id: '0',
            role: 'assistant',
            content: `আস-সালামু আলাইকুম, **${name}**! আমি অনন্য AI — তোমার পড়ার সঙ্গী।\n\nতুমি **${level}** স্তরের শিক্ষার্থী। নিচে বিষয় বেছে নাও, অথবা সরাসরি প্রশ্ন লেখো। আমি ধাপে ধাপে সহজ করে বুঝিয়ে দেব।`,
          },
        ])
      } catch {
        setMessages([
          {
            id: '0',
            role: 'assistant',
            content:
              'আস-সালামু আলাইকুম! আমি অনন্য AI শিক্ষক। আজকে কী পড়তে চাও বা কোন বিষয়ে সাহায্য লাগবে?',
          },
        ])
      } finally {
        setProfileLoaded(true)
      }
    }
    void loadProfile()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || loading) return

      const userMessage: Message = { id: nextId(), role: 'user', content: trimmed }
      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setLoading(true)

      try {
        const history = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const subjectLabel = SUBJECTS.find((s) => s.id === subject)?.label
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            name: studentName,
            classLevel,
            subjects: subjectLabel ? [subjectLabel] : undefined,
          }),
        })

        if (response.status === 401) {
          setMessages((prev) => [
            ...prev,
            {
              id: nextId(),
              role: 'assistant',
              content: 'সেশন শেষ হয়ে গেছে। অনুগ্রহ করে আবার **লগইন** করো।',
            },
          ])
          return
        }

        const data = await response.json()
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'assistant',
            content:
              data.response ||
              data.error ||
              'দুঃখিত, উত্তর আসেনি। একটু পরে আবার চেষ্টা করো।',
          },
        ])
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'assistant',
            content: 'কানেকশন সমস্যা হয়েছে। ইন্টারনেট চেক করে আবার চেষ্টা করো।',
          },
        ])
      } finally {
        setLoading(false)
        inputRef.current?.focus()
      }
    },
    [loading, messages, studentName, classLevel, subject]
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    void sendMessage(input)
  }

  function clearChat() {
    if (loading) return
    setMessages([
      {
        id: nextId(),
        role: 'assistant',
        content: `চ্যাট ক্লিয়ার হয়েছে। ${studentName}, নতুন করে জিজ্ঞাসা করো — আমি আছি!`,
      },
    ])
  }

  const quick = QUICK_BY_SUBJECT[subject]

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#0a0a1a]">
      <nav className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0a0a1a]/95 px-3 py-3 backdrop-blur-xl md:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard/student"
            className="rounded-lg px-2 py-1 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            ←
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-base shadow-lg shadow-violet-500/20">
              🤖
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">অনন্য AI শিক্ষক</div>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span className="truncate text-xs text-gray-400">
                  {profileLoaded ? `${studentName} · ${classLevel}` : 'লোড হচ্ছে...'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={clearChat}
          disabled={loading || messages.length <= 1}
          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-gray-400 transition-colors hover:border-violet-500/40 hover:text-violet-300 disabled:opacity-40"
        >
          নতুন চ্যাট
        </button>
      </nav>

      <div className="shrink-0 border-b border-white/5 px-3 py-2 md:px-4">
        <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto pb-1">
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSubject(s.id)}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                subject === s.id
                  ? 'border-violet-500/50 bg-violet-500/20 text-violet-200'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200'
              }`}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="mb-1 grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-xs">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[75%] ${
                  msg.role === 'user'
                    ? 'rounded-br-sm bg-violet-600 text-white'
                    : 'rounded-bl-sm border border-white/10 bg-white/10 text-gray-100'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => (
                        <strong className="font-semibold text-white">{children}</strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="my-2 list-inside list-disc space-y-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="my-2 list-inside list-decimal space-y-1">{children}</ol>
                      ),
                      li: ({ children }) => <li className="text-gray-200">{children}</li>,
                      code: ({ children }) => (
                        <code className="rounded bg-black/30 px-1 py-0.5 text-violet-200">{children}</code>
                      ),
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
            <div className="flex items-end justify-start gap-2">
              <div className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-xs">
                🤖
              </div>
              <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/10 px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="size-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                  <span className="size-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                  <span className="size-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {messages.length <= 1 && !loading && (
        <div className="mx-auto w-full max-w-2xl shrink-0 px-3 pb-2 md:px-4">
          <p className="mb-2 text-xs text-gray-500">দ্রুত প্রশ্ন ({SUBJECTS.find((s) => s.id === subject)?.label}):</p>
          <div className="flex flex-wrap gap-2">
            {quick.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void sendMessage(q)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-violet-500/50 hover:text-violet-300"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="shrink-0 border-t border-white/10 bg-[#0a0a1a]/95 px-3 py-3 backdrop-blur-xl md:px-4">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="প্রশ্ন লেখো..."
            disabled={loading}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 transition-colors focus:border-violet-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="shrink-0 rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 md:px-5"
          >
            পাঠাও
          </button>
        </form>
        <p className="mx-auto mt-1.5 max-w-2xl text-center text-[10px] text-gray-600">
          AI ভুল করতে পারে — গুরুত্বপূর্ণ তথ্য শিক্ষক/অভিভাবকের সাথে মিলিয়ে নাও
        </p>
      </div>
    </main>
  )
}
