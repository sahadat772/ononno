'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface KidsZoneShellProps {
  title: string
  subtitle?: string
  /** default: /dashboard/student/kids-zone */
  backHref?: string
  backLabel?: string
  stars?: number
  emoji?: string
  children: ReactNode
  /** max width of content */
  maxWidth?: 'sm' | 'md' | 'lg'
}

/**
 * Phase K1 — shared child shell for all Kids Zone pages.
 * Big back target, clear title, optional stars.
 */
export default function KidsZoneShell({
  title,
  subtitle,
  backHref = '/dashboard/student/kids-zone',
  backLabel = 'Kids Zone',
  stars,
  emoji = '🧒',
  children,
  maxWidth = 'md',
}: KidsZoneShellProps) {
  const maxCls =
    maxWidth === 'sm' ? 'max-w-xl' : maxWidth === 'lg' ? 'max-w-4xl' : 'max-w-2xl'

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.08),transparent_40%)]" />

      {/* Sticky top bar — large touch targets */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a1a]/90 backdrop-blur-xl">
        <div className={`mx-auto flex ${maxCls} items-center justify-between gap-3 px-4 py-3`}>
          <Link
            href={backHref}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-3 text-sm font-bold text-white transition active:scale-95 hover:bg-white/10"
          >
            ← {backLabel}
          </Link>

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-base font-black text-white">
              {emoji} {title}
            </p>
            {subtitle ? (
              <p className="truncate text-xs text-slate-400">{subtitle}</p>
            ) : null}
          </div>

          <div className="flex min-h-11 min-w-[4.5rem] items-center justify-end">
            {typeof stars === 'number' ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-sm font-bold text-amber-300">
                ⭐ {stars}
              </span>
            ) : (
              <span className="text-xl" aria-hidden>
                {emoji}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className={`relative z-10 mx-auto ${maxCls} px-4 py-5 pb-12`}>{children}</main>
    </div>
  )
}
