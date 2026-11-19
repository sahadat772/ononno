'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

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

  // Immersive lesson / study screens — hide bottom chrome
  if (
    pathname.includes('/lesson') ||
    pathname.includes('/study') ||
    pathname.includes('/play')
  ) {
    return null
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-violet-400/20 bg-[#0a0a18]/92 shadow-[0_-12px_40px_-12px_rgba(124,58,237,0.35)] backdrop-blur-2xl md:hidden"
      style={{
        paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))',
      }}
      aria-label="স্টুডেন্ট মেইন নেভিগেশন"
      role="navigation"
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
      <ul className="relative mx-auto flex h-[4rem] max-w-lg list-none items-stretch justify-around px-1.5">
        {tabs.map((tab) => {
          const active = tab.match(pathname)
          return (
            <li key={tab.href} className="relative flex min-w-0 flex-1">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                aria-label={active ? `${tab.label} (বর্তমান পেজ)` : tab.label}
                className={`relative flex min-h-[48px] w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-0.5 outline-none transition active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a18] ${
                  active ? 'text-violet-50' : 'text-slate-500'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="student-nav-pill"
                    className="absolute inset-x-1 top-1 bottom-1 -z-10 rounded-2xl bg-gradient-to-b from-violet-500/25 to-fuchsia-600/10 ring-1 ring-violet-400/25"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <motion.span
                  aria-hidden="true"
                  animate={active ? { scale: 1.08, y: -1 } : { scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className={`grid size-9 place-items-center rounded-xl text-base ${
                    active
                      ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-600/45'
                      : 'bg-white/[0.06]'
                  }`}
                >
                  {tab.icon}
                </motion.span>
                <span
                  className={`max-w-full truncate text-[10px] leading-none ${
                    active ? 'font-black text-violet-100' : 'font-semibold'
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
