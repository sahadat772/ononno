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
      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-300/40'
      : 'bg-violet-600 text-white shadow-md shadow-violet-300/50'
  const idleCls =
    activeTone === 'emerald'
      ? 'border border-emerald-200 bg-white text-slate-700'
      : 'border border-violet-200 bg-white text-slate-700'

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
                className={`flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  activeTone === 'emerald'
                    ? 'focus-visible:ring-emerald-500'
                    : 'focus-visible:ring-violet-500'
                } focus-visible:ring-offset-white ${active ? activeCls : idleCls}`}
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
