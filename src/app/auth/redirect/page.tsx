import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function AuthRedirect() {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Debug
    console.log('USER ID:', user.id)
    console.log('USER EMAIL:', user.email)

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

    // Debug
    console.log('PROFILE:', profile)
    console.log('ERROR:', error)

    if (profile?.role === 'admin') {
        redirect('/dashboard/admin')
    } else if (profile?.role === 'teacher') {
        redirect('/dashboard/teacher')
    } else if (profile?.role === 'parent') {
        redirect('/dashboard/parent')
    } else {
        redirect('/dashboard/student')
    }
}