'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/dashboard/parent',
    label: 'হোম',
    icon: '🏠',
    match: (p: string) => p === '/dashboard/parent',
  },
  {
    href: '/dashboard/parent#children',
    label: 'সন্তান',
    icon: '👨‍👩‍👧',
    match: (p: string) => p.includes('/child'),
  },
  {
    href: '/dashboard/parent/notifications',
    label: 'নোটিশ',
    icon: '🔔',
    match: (p: string) => p.includes('/notifications'),
  },
  {
    href: '/dashboard/parent/profile',
    label: 'আমি',
    icon: '👤',
    match: (p: string) => p.includes('/profile') || p.includes('/create-child'),
  },
] as const

/**
 * Mobile bottom tab bar for Parent Hub (app-like).
 * Hidden on md+ where top nav is enough.
 */
export default function ParentMobileNav() {
  const pathname = usePathname() || ''

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a0a1a]/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      aria-label="Parent mobile navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1.5">
        {tabs.map((tab) => {
          const active = tab.match(pathname)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-center transition ${
                active
                  ? 'text-violet-300'
                  : 'text-slate-500 active:text-slate-300'
              }`}
            >
              <span
                className={`flex size-9 items-center justify-center rounded-xl text-lg ${
                  active
                    ? 'bg-violet-500/20 ring-1 ring-violet-500/40'
                    : 'bg-transparent'
                }`}
              >
                {tab.icon}
              </span>
              <span className={`text-[10px] font-semibold ${active ? 'text-violet-200' : ''}`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
