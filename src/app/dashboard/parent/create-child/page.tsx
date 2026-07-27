import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import CreateChildClient from './CreateChildClient'

export default async function CreateChildPage() {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, id, full_name')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'parent') redirect('/dashboard')

    return (
        <CreateChildClient
            parentName={profile.full_name}
        />
    )
}
