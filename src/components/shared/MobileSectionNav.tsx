'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Item = { href: string; label: string; icon: string }

export default function MobileSectionNav({
  items,
  homeHref,
  activeTone = 'violet',
  ariaLabel = 'সেকশন নেভিগেশন',
}: {
  items: Item[]
  homeHref: string
  activeTone?: 'violet' | 'emerald'
  ariaLabel?: string
}) {
  const pathname = usePathname() || ''
  const activeCls =
    activeTone === 'emerald'
      ? 'border-emerald-400/40 bg-emerald-500/25 text-emerald-50 shadow-md shadow-emerald-500/20'
      : 'border-violet-400/40 bg-violet-500/25 text-violet-50 shadow-md shadow-violet-500/20'
  const idleCls =
    'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]'

  return (
    <nav
      className="-mx-1 mb-4 lg:hidden"
      aria-label={ariaLabel}
      role="navigation"
    >
      <ul className="flex list-none gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active =
            item.href === homeHref
              ? pathname === homeHref || pathname === homeHref + '/'
              : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <li key={item.href + item.label} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                aria-label={active ? `${item.label} (বর্তমান)` : item.label}
                className={`flex min-h-[44px] items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-bold outline-none transition active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a] ${
                  activeTone === 'emerald'
                    ? 'focus-visible:ring-emerald-400'
                    : 'focus-visible:ring-violet-400'
                } ${active ? activeCls : idleCls}`}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
