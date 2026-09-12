import Link from 'next/link'
import Image from 'next/image'

/**
 * Public site footer (home, marketing) — light theme.
 */
export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative z-10 border-t border-slate-200/80 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/icons/logo-icon.png"
                alt="অনন্য"
                width={36}
                height={36}
                className="rounded-xl"
              />
              <div>
                <p className="font-black leading-tight text-slate-900">অনন্য</p>
                <p className="text-[10px] font-semibold text-emerald-600">
                  ONONNO · NCTB Learning
                </p>
              </div>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
              বাংলাদেশের শিক্ষার্থীদের জন্য AI-সহকারী NCTB পাঠ্যক্রম — নিরাপদ, ধাপে ধাপে।
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">প্ল্যাটফর্ম</p>
            <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-600">
              <li>
                <Link href="/#path" className="hover:text-emerald-700">
                  শেখার পথ
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-emerald-700">
                  কেন অনন্য
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-700">
                  রেজিস্ট্রেশন
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-700">
                  লগইন
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">সহায়তা</p>
            <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-600">
              <li>
                <Link href="/contact" className="hover:text-emerald-700">
                  যোগাযোগ
                </Link>
              </li>
              <li>
                <Link href="/free-access" className="hover:text-emerald-700">
                  ফ্রি অ্যাক্সেস
                </Link>
              </li>
              <li>
                <span className="text-slate-400">সফট লঞ্চ · বেটা</span>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">রোল</p>
            <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-600">
              <li>👨‍🎓 Student</li>
              <li>👨‍👩‍👧 Parent</li>
              <li>🛡️ Admin</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-slate-500">
            © {year} অনন্য · ONONNO Education · বাংলাদেশ
          </p>
          <p className="text-[11px] text-slate-400">
            Published NCTB lessons · Quiz · Progress
          </p>
        </div>
      </div>
    </footer>
  )
}
