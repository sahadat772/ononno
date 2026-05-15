import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface ProgressData {
    lesson_id: string
    status: string
    score: number | null
    completed_at: string | null
}

interface ActivityData {
    id: string
    user_id: string
    action: string
    metadata: Record<string, unknown>
    created_at: string
}

export function useRealtimeProgress(studentId: string | null) {
    const supabase = createClient()
    const [progress, setProgress] = useState<ProgressData[]>([])
    const [recentActivity, setRecentActivity] = useState<ActivityData[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Initial data fetch
    useEffect(() => {
        if (!studentId) return

        const fetchInitialData = async () => {
            setIsLoading(true)

            const [progressRes, activityRes] = await Promise.all([
                supabase
                    .from('learning_progress')
                    .select('*')
                    .eq('user_id', studentId)
                    .order('created_at', { ascending: false }),

                supabase
                    .from('activity_logs')
                    .select('*')
                    .eq('user_id', studentId)
                    .order('created_at', { ascending: false })
                    .limit(20),
            ])

            if (progressRes.data) setProgress(progressRes.data)
            if (activityRes.data) setRecentActivity(activityRes.data)

            setIsLoading(false)
        }

        fetchInitialData()
    }, [studentId])

    // Realtime subscription
    useEffect(() => {
        if (!studentId) return

        // Progress realtime
        const progressChannel = supabase
            .channel(`progress:${studentId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'learning_progress',
                    filter: `user_id=eq.${studentId}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setProgress((prev) => [payload.new as ProgressData, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setProgress((prev) =>
                            prev.map((p) =>
                                p.lesson_id === (payload.new as ProgressData).lesson_id
                                    ? (payload.new as ProgressData)
                                    : p
                            )
                        )
                    }
                }
            )
            .subscribe()

        // Activity realtime
        const activityChannel = supabase
            .channel(`activity:${studentId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'activity_logs',
                    filter: `user_id=eq.${studentId}`,
                },
                (payload) => {
                    setRecentActivity((prev) => [payload.new as ActivityData, ...prev.slice(0, 19)])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(progressChannel)
            supabase.removeChannel(activityChannel)
        }
    }, [studentId])

    return { progress, recentActivity, isLoading }
}