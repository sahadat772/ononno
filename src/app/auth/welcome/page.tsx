'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

const ROLE_DASH: Record<string, string> = {
  student: '/dashboard/student',
  parent: '/dashboard/parent',
  teacher: '/dashboard/teacher',
  admin: '/dashboard/admin',
}

const ROLE_PROFILE: Record<string, string> = {
  student: '/dashboard/student/profile',
  parent: '/dashboard/parent/profile',
  teacher: '/dashboard/teacher/profile',
  admin: '/dashboard/admin/profile',
}

const ROLE_BN: Record<string, string> = {
  student: 'শিক্ষার্থী',
  parent: 'অভিভাবক',
  teacher: 'শিক্ষক',
  admin: 'অ্যাডমিন',
}

function WelcomeInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [role, setRole] = useState(params.get('role') || 'student')
  const [name, setName] = useState('')
  const [classLevel, setClassLevel] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.replace('/login')
          return
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .maybeSingle()
        if (profile?.role) setRole(profile.role)
        if (profile?.full_name) setName(profile.full_name.split(' ')[0])
        if (profile?.role === 'student') {
          const { data: sp } = await supabase
            .from('student_profiles')
            .select('class_level')
            .eq('user_id', user.id)
            .maybeSingle()
          if (sp?.class_level) setClassLevel(sp.class_level)
        }
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [router])

  const dash = ROLE_DASH[role] || '/dashboard/student'
  const profileHref = ROLE_PROFILE[role] || '/dashboard/student/profile'

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0a0a1a] text-white">
        <Loader2 className="size-8 animate-spin text-violet-400" />
      </div>
    )
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-[#0a0a1a] via-[#12122a] to-[#0a0a1a] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/icons/logo-icon.png" alt="ONONNO" width={56} height={56} className="rounded-2xl" />
          <p className="mt-4 text-sm font-semibold text-violet-300">অ্যাকাউন্ট তৈরি হয়েছে 🎉</p>
          <h1 className="mt-1 text-2xl font-black">স্বাগতম{name ? `, ${name}` : ''}!</h1>
          <p className="mt-2 text-sm text-slate-400">
            রোল: <span className="font-bold text-white">{ROLE_BN[role] || role}</span>
            {classLevel && (
              <>
                {' '}
                · ক্লাস:{' '}
                <span className="font-bold text-emerald-300">{classLevel.replace(/_/g, ' ')}</span>
              </>
            )}
          </p>
        </div>

        {role === 'student' && classLevel && (
          <div className="mb-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <p className="font-bold">ক্লাস আনলক নিয়ম</p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-100/80">
              শুধু আপনার নিবন্ধিত ক্লাস এখন খোলা। সেই ক্লাসের সব বিষয় শেষ করে পরীক্ষায় পাস করলে
              পরের ক্লাস আনলক হবে।
            </p>
          </div>
        )}

        <div className="mb-4 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
          <p className="text-sm font-bold text-amber-100">প্রোফাইল সম্পূর্ণ করবেন?</p>
          <p className="mt-1 text-xs text-amber-100/70">
            নাম, ফোন, ছবি ইত্যাদি যোগ করলে অভিজ্ঞতা ভালো হবে — পরেও করা যাবে।
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href={profileHref}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-bold shadow-lg shadow-violet-600/30"
            >
              প্রোফাইল সম্পূর্ণ করুন
            </Link>
            <Link
              href={dash}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-sm font-bold text-slate-200"
            >
              এখনকার জন্য স্কিপ
            </Link>
          </div>
        </div>

        <Link
          href={dash}
          className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/15 text-sm font-bold text-violet-200"
        >
          {ROLE_BN[role] || 'আমার'} ড্যাশবোর্ডে যান →
        </Link>
      </div>
    </main>
  )
}

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#0a0a1a] text-white">
          <Loader2 className="size-8 animate-spin text-violet-400" />
        </div>
      }
    >
      <WelcomeInner />
    </Suspense>
  )
}
