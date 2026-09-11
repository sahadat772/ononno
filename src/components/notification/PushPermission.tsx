'use client'

import { useEffect, useState } from 'react'
import { useNotification } from '@/hooks/useNotification'

type Variant = 'default' | 'parent' | 'student' | 'admin'

export default function PushPermission({
  variant = 'default',
  showWhenGranted = false,
}: {
  variant?: Variant
  showWhenGranted?: boolean
}) {
  const { permission, loading, requestPermission, isGranted, isDenied } = useNotification()
  const [iosHint, setIosHint] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const ua = navigator.userAgent || ''
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true
    setIosHint(isIOS && !standalone)
  }, [])

  const copy =
    variant === 'parent'
      ? {
          title: 'Push নোটিফিকেশন চালু করুন',
          desc: 'সন্তানের পাঠ, কুইজ ও রিমাইন্ডার ফোনে পাবেন',
        }
      : variant === 'student'
        ? {
            title: 'নোটিফিকেশন চালু করুন',
            desc: 'পাঠ রিমাইন্ডার ও আনলক আপডেট',
          }
        : variant === 'admin'
          ? {
              title: 'Admin push চালু করুন',
              desc: 'টেস্ট ও সিস্টেম অ্যালার্ট পেতে Allow চাপুন',
            }
          : {
              title: 'Notification চালু করো',
              desc: 'গুরুত্বপূর্ণ আপডেট পেতে Allow করুন',
            }

  const onAllow = async () => {
    setMsg(null)
    const token = await requestPermission()
    if (token) setMsg('চালু হয়েছে ✓')
    else if (typeof Notification !== 'undefined' && Notification.permission === 'denied')
      setMsg('Browser-এ block করা আছে')
    else setMsg('টোকেন পাওয়া যায়নি — VAPID/Firebase চেক করুন')
  }

  if (isGranted) {
    if (!showWhenGranted) return null
    return (
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
        <span>🔔</span>
        <span>Push নোটিফিকেশন চালু আছে</span>
      </div>
    )
  }

  if (isDenied) {
    return (
      <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔕</span>
          <div>
            <p className="text-sm font-medium text-rose-300">Notification বন্ধ আছে</p>
            <p className="text-xs text-white/40">Browser site settings থেকে Allow করুন</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-xl">🔔</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">{copy.title}</p>
            <p className="text-xs text-white/45">{copy.desc}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void onAllow()}
          disabled={loading}
          className="shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          {loading ? '…' : 'Allow'}
        </button>
      </div>
      {iosHint && (
        <p className="mt-2 text-[11px] leading-relaxed text-amber-200/90">
          iPhone: Share → <strong>Add to Home Screen</strong> করে অ্যাপ খুললে push কাজ করবে।
        </p>
      )}
      {msg && <p className="mt-2 text-[11px] text-slate-300">{msg}</p>}
      {permission === 'default' && !msg && (
        <p className="mt-2 text-[10px] text-slate-500">ক্লিক করলে browser permission চাইবে</p>
      )}
    </div>
  )
}
