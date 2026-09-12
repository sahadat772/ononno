'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/dashboard/student',
    label: 'হোম',
    icon: '🏠',
    match: (p: string) => p === '/dashboard/student',
  },
  {
    href: '/dashboard/student/academic',
    label: 'পড়া',
    icon: '📚',
    match: (p: string) => p.includes('/academic') || p.includes('/learning-path'),
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
    match: (p: string) => p.includes('/profile') || p.includes('/subscription'),
  },
] as const

/** Mobile bottom tab bar — matches Parent Hub pattern */
export default function StudentMobileNav() {
  const pathname = usePathname() || ''

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a0a1a]/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      aria-label="Student mobile navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1.5">
        {tabs.map((tab) => {
          const active = tab.match(pathname)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-center transition ${
                active ? 'text-violet-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span
                className={`grid size-8 place-items-center rounded-xl text-base ${
                  active
                    ? 'bg-gradient-to-br from-violet-600/40 to-fuchsia-600/30 shadow-inner'
                    : 'bg-transparent'
                }`}
              >
                {tab.icon}
              </span>
              <span className="truncate text-[10px] font-semibold">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
