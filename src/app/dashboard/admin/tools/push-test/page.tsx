import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminPushTestPanel from '@/components/admin/AdminPushTestPanel'

export default async function AdminPushTestPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard/admin')

  return (
    <div className="min-h-screen bg-[#030711] text-white">
      <div className="mx-auto max-w-lg space-y-4 px-4 py-8">
        <Link
          href="/dashboard/admin"
          className="inline-flex rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300"
        >
          ← Admin
        </Link>
        <h1 className="text-xl font-black">Push notifications · Phase 1</h1>
        <p className="text-sm text-slate-400">
          Allow করে token সেভ করুন, তারপর test push পাঠান। Vercel-এ Firebase Admin env থাকতে হবে।
        </p>
        <AdminPushTestPanel />
      </div>
    </div>
  )
}
