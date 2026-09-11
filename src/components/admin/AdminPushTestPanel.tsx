'use client'

import { useState } from 'react'
import PushPermission from '@/components/notification/PushPermission'

export default function AdminPushTestPanel() {
  const [title, setTitle] = useState('অনন্য · Test Push')
  const [body, setBody] = useState('Parent/Student push Phase-1 কাজ করছে')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const send = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, url: '/dashboard/admin' }),
      })
      const j = await res.json()
      if (!res.ok) {
        setResult(`❌ ${j.error || res.statusText}`)
      } else {
        setResult(
          `✅ পাঠানো হয়েছে (${j.mode}, tokens: ${j.tokens})` +
            (j.result?.messageId ? ` · ${j.result.messageId}` : ''),
        )
      }
    } catch (e) {
      setResult(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-violet-500/25 bg-[#12122a] p-4 md:p-5">
      <h3 className="text-sm font-bold text-white">🔔 Push · Phase 1</h3>
      <p className="mt-1 text-xs text-slate-400">
        আগে Allow করুন, তারপর নিজের ডিভাইসে test push পাঠান (Firebase Admin env লাগবে)।
      </p>

      <div className="mt-3">
        <PushPermission variant="admin" showWhenGranted />
      </div>

      <div className="mt-2 space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-violet-500/40"
          placeholder="Title"
        />
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-violet-500/40"
          placeholder="Body"
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => void send()}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-sm font-bold disabled:opacity-50"
        >
          {loading ? 'পাঠানো হচ্ছে…' : 'Test push পাঠাও'}
        </button>
        {result && <p className="text-xs text-slate-300">{result}</p>}
      </div>
    </div>
  )
}
