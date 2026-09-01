import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PerformanceClient from './PerformanceClient'

export const dynamic = 'force-dynamic'

export default async function PerformancePage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'student') redirect('/dashboard')

  return <PerformanceClient studentName={profile.full_name || 'ছাত্র'} />
}
