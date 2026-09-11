'use client'

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'ononno_pwa_install_dismissed'

/**
 * Phase 3 — Install / Add to Home Screen banner.
 * Chrome/Android: native beforeinstallprompt.
 * iOS Safari: manual Share → Add to Home Screen guide.
 */
export default function PWAInstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [iosHint, setIosHint] = useState(false)
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return
    } catch {
      /* ignore */
    }

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true
    if (standalone) return

    const ua = navigator.userAgent || ''
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    if (isIOS) {
      setIosHint(true)
      setVisible(true)
      return
    }

    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  const install = async () => {
    if (!deferred) return
    setInstalling(true)
    try {
      await deferred.prompt()
      await deferred.userChoice
      setDeferred(null)
      setVisible(false)
      try {
        localStorage.setItem(DISMISS_KEY, '1')
      } catch {
        /* ignore */
      }
    } finally {
      setInstalling(false)
    }
  }

  if (!visible) return null

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/15 to-sky-500/10 p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📲</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">অনন্য অ্যাপ হিসেবে ইনস্টল করুন</p>
          {iosHint ? (
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              iPhone: Safari-এ <strong>Share</strong> (□↑) →{' '}
              <strong>Add to Home Screen</strong> → Add। এরপর হোম আইকন থেকে খুললে push
              নোটিফিকেশন কাজ করবে।
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-300">
              হোম স্ক্রিনে যোগ করলে দ্রুত খোলা যায় এবং নোটিফিকেশন ভালোভাবে আসে।
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {!iosHint && deferred && (
              <button
                type="button"
                disabled={installing}
                onClick={() => void install()}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                {installing ? '…' : 'ইনস্টল করুন'}
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300"
            >
              পরে
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
