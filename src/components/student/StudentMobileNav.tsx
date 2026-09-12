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
      p.includes('/kids-zone') ||
      p.includes('/levels'),
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

export default function StudentMobileNav() {
  const pathname = usePathname() || ''

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-violet-500/25 bg-[#0b0b1a]/98 shadow-[0_-8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl md:hidden"
      style={{
        paddingBottom: 'max(0.4rem, env(safe-area-inset-bottom))',
      }}
      aria-label="স্টুডেন্ট মেইন নেভিগেশন"
      role="navigation"
    >
      <ul className="mx-auto flex h-[3.75rem] max-w-lg list-none items-stretch justify-around px-1">
        {tabs.map((tab) => {
          const active = tab.match(pathname)
          return (
            <li key={tab.href} className="flex min-w-0 flex-1">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                aria-label={active ? `${tab.label} (বর্তমান পেজ)` : tab.label}
                className={`flex min-h-[48px] w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-0.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b1a] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 ${
                  active ? 'text-violet-100' : 'text-slate-400'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-9 place-items-center rounded-xl text-base ${
                    active
                      ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/40'
                      : 'bg-white/5'
                  }`}
                >
                  {tab.icon}
                </span>
                <span
                  className={`max-w-full truncate text-[10px] leading-none ${
                    active ? 'font-bold text-violet-100' : 'font-semibold'
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
