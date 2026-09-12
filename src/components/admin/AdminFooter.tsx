import Link from 'next/link'

/**
 * Shared footer for all admin dashboard routes.
 */
export default function AdminFooter() {
  const year = new Date().getFullYear()

  const links = [
    { href: '/dashboard/admin', label: 'Overview' },
    { href: '/dashboard/admin/curriculum', label: 'Curriculum' },
    { href: '/dashboard/admin/users', label: 'Users' },
    { href: '/dashboard/admin/subscriptions', label: 'Payments' },
    { href: '/dashboard/admin/readiness', label: 'Readiness' },
    { href: '/dashboard/admin/profile', label: 'Profile' },
  ]

  return (
    <footer className="relative z-10 mt-auto border-t border-white/8 bg-[#050814]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-xs font-black text-white">
                অ
              </span>
              <div>
                <p className="text-sm font-black text-white">অনন্য Admin</p>
                <p className="text-[10px] font-semibold text-violet-300/80">
                  Control center · Soft launch
                </p>
              </div>
            </div>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-slate-500">
              Curriculum, users, payments ও readiness — এক জায়গা থেকে ম্যানেজ করুন।
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs font-semibold text-slate-400 transition hover:text-violet-300"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-2 border-t border-white/5 pt-5 sm:flex-row sm:items-center">
          <p className="text-[11px] text-slate-600">
            © {year} অনন্য · Admin Hub · বাংলাদেশ
          </p>
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
            <Link href="/" className="hover:text-slate-400">
              Public site
            </Link>
            <span aria-hidden>·</span>
            <Link href="/dashboard/student" className="hover:text-slate-400">
              Student view
            </Link>
            <span aria-hidden>·</span>
            <span className="text-emerald-600/80">Manual payment mode</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
