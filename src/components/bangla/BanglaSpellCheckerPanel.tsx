'use client'

import { useState } from 'react'
import type { SpellIssue } from '@/lib/bangla-spell'

type Props = {
  variant?: 'student' | 'admin'
  placeholder?: string
  initialText?: string
  maxHint?: number
}

export default function BanglaSpellCheckerPanel({
  variant = 'student',
  placeholder = 'এখানে বাংলা লেখা পেস্ট বা টাইপ করুন…',
  initialText = '',
  maxHint,
}: Props) {
  const [text, setText] = useState(initialText)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [corrected, setCorrected] = useState<string | null>(null)
  const [issues, setIssues] = useState<SpellIssue[]>([])
  const [summary, setSummary] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [copied, setCopied] = useState(false)

  const isAdmin = variant === 'admin'
  const shell = isAdmin
    ? 'rounded-2xl border border-fuchsia-500/20 bg-[#0a0f1c] p-4 sm:p-6'
    : 'rounded-2xl border border-violet-500/20 bg-[#0b1020] p-4 sm:p-6'

  const runCheck = async () => {
    setLoading(true)
    setError(null)
    setCorrected(null)
    setIssues([])
    setSummary(null)
    setHasChanges(false)
    try {
      const res = await fetch('/api/tools/bangla-spell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const json = (await res.json()) as {
        ok?: boolean
        corrected?: string
        issues?: SpellIssue[]
        summary?: string
        hasChanges?: boolean
        message?: string
        error?: string
      }
      if (!res.ok) {
        setError(json.message || json.error || 'চেক ব্যর্থ')
        return
      }
      setCorrected(json.corrected ?? text)
      setIssues(Array.isArray(json.issues) ? json.issues : [])
      setSummary(json.summary ?? null)
      setHasChanges(Boolean(json.hasChanges))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'নেটওয়ার্ক এরর')
    } finally {
      setLoading(false)
    }
  }

  const applyCorrected = () => {
    if (corrected) setText(corrected)
  }

  const copyCorrected = async () => {
    if (!corrected) return
    try {
      await navigator.clipboard.writeText(corrected)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('কপি করা যায়নি')
    }
  }

  return (
    <div className={shell}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white">✍️ বাংলা বানান চেকার</h2>
          <p className="mt-1 text-xs text-slate-400">
            বানান ও হালকা টাইপো যাচাই · অর্থ অপরিবর্তিত রাখা হয়
            {maxHint ? ` · সর্বোচ্চ ~${maxHint.toLocaleString()} অক্ষর` : ''}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-300">
          AI · Groq
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={isAdmin ? 12 : 8}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading || !text.trim()}
          onClick={() => void runCheck()}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
        >
          {loading ? '⏳ যাচাই হচ্ছে…' : '🔍 বানান চেক করো'}
        </button>
        <button
          type="button"
          disabled={!text}
          onClick={() => {
            setText('')
            setCorrected(null)
            setIssues([])
            setSummary(null)
            setError(null)
          }}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300"
        >
          মুছুন
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      {summary && (
        <div className="mt-4 space-y-3">
          <div
            className={`rounded-xl border px-3 py-2 text-sm ${
              hasChanges
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-100'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
            }`}
          >
            {summary}
            {!hasChanges && ' ✓'}
          </div>

          {issues.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-400">
                সংশোধনের তালিকা ({issues.length})
              </p>
              <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
                {issues.map((iss, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-white/5 bg-black/20 px-2.5 py-2"
                  >
                    <span className="text-rose-300 line-through">{iss.original}</span>
                    <span className="mx-1.5 text-slate-500">→</span>
                    <span className="font-medium text-emerald-300">{iss.suggestion}</span>
                    {iss.reason && (
                      <p className="mt-0.5 text-[11px] text-slate-500">{iss.reason}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {corrected != null && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-violet-300">শুদ্ধ লেখা</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void copyCorrected()}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-200"
                  >
                    {copied ? 'কপি ✓' : 'কপি'}
                  </button>
                  <button
                    type="button"
                    onClick={applyCorrected}
                    className="rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/15 px-2.5 py-1 text-[11px] font-semibold text-fuchsia-200"
                  >
                    উপরে বসান
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-slate-200">
                {corrected}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
