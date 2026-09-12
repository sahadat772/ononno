import Link from 'next/link'
import Image from 'next/image'

/**
 * Light polished footer for admin workspace (matches SaaS dashboard).
 */
export default function AdminFooter() {
  const year = new Date().getFullYear()

  const links = [
    { href: '/dashboard/admin', label: 'Overview' },
    { href: '/dashboard/admin/curriculum', label: 'Curriculum' },
    { href: '/dashboard/admin/users', label: 'Users' },
    { href: '/dashboard/admin/subscriptions', label: 'Payments' },
    { href: '/dashboard/admin/content', label: 'Content' },
    { href: '/dashboard/admin/readiness', label: 'Readiness' },
    { href: '/dashboard/admin/profile', label: 'Profile' },
  ]

  return (
    <footer className="relative z-10 mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 max-w-sm">
            <div className="flex items-center gap-2.5">
              <Image
                src="/icons/logo-icon.png"
                alt="ONONNO"
                width={36}
                height={36}
                className="rounded-xl shadow-sm"
              />
              <div>
                <p className="text-sm font-black text-slate-900">ONONNO Admin</p>
                <p className="text-[10px] font-semibold text-blue-600">
                  Control center · Soft launch
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Curriculum, users, payments ও readiness — এক জায়গা থেকে ম্যানেজ করুন। NCTB-based
              learning for Class 1–12.
            </p>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Quick links
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {links.map((l) => (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  className="text-xs font-semibold text-slate-600 transition hover:text-blue-600"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-emerald-50 px-4 py-3">
            <p className="text-[11px] font-bold text-slate-500">Quote</p>
            <p className="mt-0.5 text-xs font-semibold italic text-slate-700">
              “Great education builds a better tomorrow”
            </p>
            <p className="mt-1 text-[10px] font-bold text-blue-600">— ONONNO</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
          <p className="text-[11px] text-slate-400">
            © {year} ONONNO · Admin Hub · Bangladesh
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-400">
            <Link href="/" className="hover:text-blue-600">
              Public site
            </Link>
            <span className="text-slate-300">·</span>
            <Link href="/dashboard/student" className="hover:text-blue-600">
              Student view
            </Link>
            <span className="text-slate-300">·</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
              Manual payment mode
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
