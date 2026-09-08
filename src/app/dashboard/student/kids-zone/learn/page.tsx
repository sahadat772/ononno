'use client'

import Link from 'next/link'
import KidsZoneShell from '@/components/kids/KidsZoneShell'

const subjects = [
  {
    id: 'bangla',
    name: 'বাংলা',
    subtitle: 'অ আ ই ঈ…',
    icon: '🔤',
    color: 'from-rose-400 to-red-500',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    href: '/dashboard/student/kids-zone/learn/bangla',
    available: true,
  },
  {
    id: 'english',
    name: 'English',
    subtitle: 'A B C D…',
    icon: '🔡',
    color: 'from-sky-400 to-cyan-500',
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/10',
    href: '/dashboard/student/kids-zone/learn/english',
    available: true,
  },
  {
    id: 'numbers',
    name: 'সংখ্যা',
    subtitle: '১ ২ ৩ ৪…',
    icon: '🔢',
    color: 'from-emerald-400 to-green-500',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    href: '/dashboard/student/kids-zone/learn/numbers',
    available: true,
  },
  {
    id: 'world',
    name: 'বিশ্ব',
    subtitle: 'মহাদেশ · দেশ · প্রাণী',
    icon: '🌍',
    color: 'from-amber-400 to-yellow-500',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    href: '/dashboard/student/kids-zone/learn/world',
    available: true,
  },
]

export default function LearnZonePage() {
  return (
    <KidsZoneShell title="শেখার জগৎ" subtitle="বর্ণ · সংখ্যা · খেলা" emoji="📚" maxWidth="md">
      <p className="mb-5 text-center text-sm text-slate-400">কোন বিষয় শিখবে?</p>

      <div className="grid grid-cols-2 gap-3">
        {subjects.map((s) =>
          s.available ? (
            <Link key={s.id} href={s.href}>
              <SubjectTile subject={s} />
            </Link>
          ) : (
            <div key={s.id} className="opacity-50">
              <SubjectTile subject={s} locked />
            </div>
          ),
        )}
      </div>

      <p className="mt-8 text-center text-xs text-slate-600">
        Nursery path: বাংলা/English unit list → Kids Zone home
      </p>
    </KidsZoneShell>
  )
}

function SubjectTile({
  subject,
  locked,
}: {
  subject: (typeof subjects)[0]
  locked?: boolean
}) {
  return (
    <div
      className={`flex min-h-[140px] flex-col items-center justify-center rounded-3xl border p-4 text-center transition active:scale-[0.98] ${subject.bg} ${subject.border}`}
    >
      {locked && (
        <span className="mb-1 text-[10px] font-bold text-slate-400">🔒 শীঘ্রই</span>
      )}
      <div
        className={`mb-2 grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-2xl shadow-md ${subject.color}`}
      >
        {subject.icon}
      </div>
      <p className="text-base font-black text-white">{subject.name}</p>
      <p className="mt-0.5 text-xs text-slate-400">{subject.subtitle}</p>
    </div>
  )
}
