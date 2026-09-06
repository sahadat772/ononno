'use client'

import Link from 'next/link'
import KidsZoneShell from '@/components/kids/KidsZoneShell'

const ISLAMIC_ITEMS = [
  {
    href: '/dashboard/student/kids-zone/islamic/kalima',
    icon: '☝️',
    title: 'কালিমা',
    title_ar: 'الكلمة',
    desc: 'মূল কালিমা শিখি',
    color: 'from-blue-500 to-indigo-600',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
  },
  {
    href: '/dashboard/student/kids-zone/islamic/dua',
    icon: '🤲',
    title: 'দোয়া',
    title_ar: 'الدعاء',
    desc: 'দৈনন্দিন দোয়া',
    color: 'from-violet-500 to-purple-600',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
  },
  {
    href: '/dashboard/student/kids-zone/islamic/surah',
    icon: '📖',
    title: 'সূরা',
    title_ar: 'السورة',
    desc: 'ছোট সূরা মুখস্থ',
    color: 'from-amber-500 to-orange-600',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
  },
  {
    href: '/dashboard/student/kids-zone/islamic/arabic',
    icon: '🔤',
    title: 'আরবি',
    title_ar: 'العربية',
    desc: 'হরফ চিনি ও লিখি',
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
  },
]

export default function KidsIslamicPage() {
  return (
    <KidsZoneShell title="ইসলামিক" subtitle="কালিমা · দোয়া · সূরা" emoji="🕌">
      <p className="mb-5 text-center text-sm text-slate-400">বড় বোতাম চাপো — শেখা শুরু</p>

      <div className="grid grid-cols-1 gap-3">
        {ISLAMIC_ITEMS.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={`flex min-h-[88px] items-center gap-4 rounded-3xl border p-4 transition active:scale-[0.98] ${item.bg} ${item.border}`}
            >
              <div
                className={`grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-3xl shadow-lg ${item.color}`}
              >
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-black text-white">{item.title}</p>
                <p className="text-sm text-white/40" style={{ fontFamily: 'serif' }}>
                  {item.title_ar}
                </p>
                <p className="mt-0.5 text-sm text-slate-400">{item.desc}</p>
              </div>
              <span className="text-2xl text-slate-500">→</span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-emerald-500/80">بِسْمِ اللَّهِ</p>
      <p className="mt-1 text-center text-xs text-slate-600">আল্লাহর নামে শুরু</p>
    </KidsZoneShell>
  )
}
