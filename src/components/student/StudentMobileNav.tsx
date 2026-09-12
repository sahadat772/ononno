'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/dashboard/student',
    label: 'হোম',
    icon: '🏠',
    match: (p: string) =>
      p === '/dashboard/student' || p === '/dashboard/student/',
  },
  {
    href: '/dashboard/student/academic',
    label: 'পড়া',
    icon: '📚',
    match: (p: string) =>
      p.includes('/academic') ||
      p.includes('/learning-path') ||
      p.includes('/kids-zone'),
  },
  {
    href: '/dashboard/student/islamic',
    label: 'ইসলামিক',
    icon: '🕌',
    match: (p: string) => p.includes('/islamic'),
  },
  {
    href: '/dashboard/student/performance',
    label: 'অগ্রগতি',
    icon: '📈',
    match: (p: string) => p.includes('/performance'),
  },
  {
    href: '/dashboard/student/profile',
    label: 'আমি',
    icon: '👤',
    match: (p: string) =>
      p.includes('/profile') ||
      p.includes('/subscription') ||
      p.includes('/tools'),
  },
] as const

/**
 * Fixed bottom tab bar — phone only (md+ uses top nav).
 * Touch targets ≥44px, safe-area aware.
 */
export default function StudentMobileNav() {
  const pathname = usePathname() || ''

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a0a1a]/95 backdrop-blur-xl md:hidden"
      style={{
        paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))',
      }}
      aria-label="Student mobile navigation"
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch justify-around px-1">
        {tabs.map((tab) => {
          const active = tab.match(pathname)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 transition active:scale-95 ${
                active ? 'text-violet-300' : 'text-slate-500'
              }`}
            >
              <span
                className={`grid size-9 place-items-center rounded-xl text-base transition ${
                  active
                    ? 'bg-gradient-to-br from-violet-600/50 to-fuchsia-600/40 shadow-[0_0_12px_rgba(139,92,246,0.35)]'
                    : 'bg-transparent'
                }`}
              >
                {tab.icon}
              </span>
              <span
                className={`max-w-full truncate text-[10px] leading-none ${
                  active ? 'font-bold' : 'font-semibold'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
