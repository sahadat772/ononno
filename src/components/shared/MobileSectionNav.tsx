'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Item = { href: string; label: string; icon: string }

export default function MobileSectionNav({
  items,
  homeHref,
  activeTone = 'violet',
}: {
  items: Item[]
  homeHref: string
  activeTone?: 'violet' | 'emerald'
}) {
  const pathname = usePathname() || ''
  const activeCls =
    activeTone === 'emerald'
      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-300/40'
      : 'bg-violet-600 text-white shadow-md shadow-violet-300/50'
  const idleCls =
    activeTone === 'emerald'
      ? 'border border-emerald-100 bg-white text-slate-600'
      : 'border border-violet-100 bg-white text-slate-600'

  return (
    <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
      {items.map((item) => {
        const active =
          item.href === homeHref
            ? pathname === homeHref || pathname === homeHref + '/'
            : pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold transition ${
              active ? activeCls : idleCls
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
