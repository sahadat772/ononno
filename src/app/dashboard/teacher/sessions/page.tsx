import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SessionsPageClient from './SessionsPageClient'

export default async function TeacherSessionsPage({
    searchParams,
}: {
    searchParams: { studentId?: string }
}) {
    const supabase = await createServerSupabaseClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Teacher role check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'teacher') {
        redirect('/dashboard')
    }

    // studentId থাকলে সেই student এর info fetch করো
    let student = null
    if (searchParams.studentId) {
        // Teacher এর student কিনা check
        const { data: relation } = await supabase
            .from('teacher_students')
            .select('id')
            .eq('teacher_id', user.id)
            .eq('student_id', searchParams.studentId)
            .single()

        if (relation) {
            const { data: studentData } = await supabase
                .from('profiles')
                .select('id, full_name, email, avatar_url')
                .eq('id', searchParams.studentId)
                .single()

            const { data: studentProfile } = await supabase
                .from('student_profiles')
                .select('class_level')
                .eq('user_id', searchParams.studentId)
                .single()

            if (studentData) {
                student = {
                    ...studentData,
                    class_level: studentProfile?.class_level || 'Unknown',
                }
            }
        }
    }

    // Teacher এর সব students fetch করো (dropdown এর জন্য)
    const { data: teacherStudents } = await supabase
        .from('teacher_students')
        .select(`
      student_id,
      profiles!teacher_students_student_id_fkey (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
        .eq('teacher_id', user.id)

    const students = (teacherStudents || []).map((ts: {
        student_id: string
        profiles: {
            id: string
            full_name: string
            email: string
            avatar_url: string | null
        }[]
    }) => ts.profiles[0]).filter(Boolean)

    return (
        <SessionsPageClient
            teacherId={user.id}
            students={students}
            selectedStudent={student}
        />
    )
}