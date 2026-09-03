'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Turn = { role: 'user' | 'assistant'; content: string }

type Props = {
  lessonId: string
  lessonTitle?: string
}

export default function AiTeacherPanel({ lessonId, lessonTitle }: Props) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listening, setListening] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, loading])

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'bn-BD'
    u.rate = 0.95
    window.speechSynthesis.speak(u)
  }, [])

  const send = useCallback(
    async (text: string) => {
      const msg = text.trim()
      if (!msg || loading) return
      setError(null)
      setInput('')
      const nextHistory = [...turns, { role: 'user' as const, content: msg }]
      setTurns(nextHistory)
      setLoading(true)
      try {
        const res = await fetch('/api/student/ai-teacher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId,
            message: msg,
            history: turns,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.message || data.error || 'উত্তর আসেনি')
          return
        }
        const reply = String(data.reply || '')
        setTurns([...nextHistory, { role: 'assistant', content: reply }])
        speak(reply.slice(0, 400))
      } catch {
        setError('নেটওয়ার্ক সমস্যা')
      } finally {
        setLoading(false)
      }
    },
    [lessonId, loading, turns, speak],
  )

  const toggleMic = () => {
    if (typeof window === 'undefined') return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    if (!SR) {
      setError('এই ব্রাউজারে voice support নেই — লিখে জিজ্ঞাসা করো।')
      return
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
      return
    }

    const rec = new SR()
    recognitionRef.current = rec
    rec.lang = 'bn-BD'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (event: {
      results: { [i: number]: { [j: number]: { transcript: string } } }
    }) => {
      const transcript = event.results[0]?.[0]?.transcript
      if (transcript) {
        setInput(transcript)
        void send(transcript)
      }
    }
    rec.onerror = () => {
      setListening(false)
      setError('Voice শোনা যায়নি — আবার চেষ্টা করো বা লিখে পাঠাও।')
    }
    rec.onend = () => setListening(false)
    setListening(true)
    rec.start()
  }

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-600 text-2xl shadow-lg shadow-violet-900/40 hover:scale-105 transition"
        aria-label="AI শিক্ষক"
        title="AI শিক্ষক"
      >
        {open ? '✕' : '🤖'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed bottom-36 right-4 z-50 flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-violet-500/30 bg-[#0d1220] shadow-2xl"
          >
            <div className="border-b border-white/10 bg-violet-950/40 px-4 py-3">
              <p className="font-bold text-white text-sm">🤖 AI শিক্ষক</p>
              <p className="text-[11px] text-white/50 truncate">
                শুধু এই পাঠ: {lessonTitle || 'Lesson'}
              </p>
            </div>

            <div
              ref={listRef}
              className="max-h-72 space-y-2 overflow-y-auto px-3 py-3 text-sm"
            >
              {turns.length === 0 && (
                <p className="text-white/40 text-xs leading-relaxed">
                  বুঝতে না পারলে জিজ্ঞাসা করো — লিখে বা মাইক দিয়ে। উত্তর শুধু এই published
                  পাঠ থেকে।
                </p>
              )}
              {turns.map((t, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-3 py-2 ${
                    t.role === 'user'
                      ? 'ml-6 bg-violet-500/20 text-violet-100'
                      : 'mr-4 bg-white/5 text-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{t.content}</p>
                </div>
              ))}
              {loading && (
                <p className="text-xs text-white/40 animate-pulse">চিন্তা করছি...</p>
              )}
              {error && <p className="text-xs text-red-300">{error}</p>}
            </div>

            <div className="border-t border-white/10 p-2 flex gap-1.5 items-end">
              <button
                type="button"
                onClick={toggleMic}
                className={`shrink-0 rounded-xl px-2.5 py-2 text-lg ${
                  listening
                    ? 'bg-red-500/30 text-red-200 animate-pulse'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
                title="Voice"
              >
                🎤
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void send(input)
                  }
                }}
                rows={2}
                placeholder="প্রশ্ন লেখো..."
                className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-400"
              />
              <button
                type="button"
                disabled={loading || !input.trim()}
                onClick={() => void send(input)}
                className="shrink-0 rounded-xl bg-violet-500 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                পাঠাও
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
