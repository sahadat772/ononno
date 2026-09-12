import Link from 'next/link'
import Image from 'next/image'

/**
 * Landing after email confirmation link (Supabase redirect URL).
 */
export default function AuthConfirmedPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-xl">
        <Image
          src="/icons/logo-icon.png"
          alt="ONONNO"
          width={48}
          height={48}
          className="mx-auto rounded-xl"
        />
        <h1 className="mt-4 text-2xl font-black text-slate-900">ইমেইল নিশ্চিত হয়েছে ✅</h1>
        <p className="mt-2 text-sm text-slate-500">
          আপনার অ্যাকাউন্ট verify হয়েছে। এখন লগইন করে শেখা শুরু করুন।
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white hover:bg-blue-600"
        >
          Login →
        </Link>
        <p className="mt-4 text-[11px] text-slate-400">
          Session থাকলে:{' '}
          <Link href="/auth/redirect" className="font-semibold text-blue-600 underline">
            Continue
          </Link>
        </p>
      </div>
    </main>
  )
}
