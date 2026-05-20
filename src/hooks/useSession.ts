import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export function useSession(userId: string | null) {
    const supabase = createClient()
    const sessionIdRef = useRef<string | null>(null)

    // Login হলে session start
    const startSession = useCallback(async () => {
        if (!userId) return

        const deviceInfo = navigator.userAgent

        const { data, error } = await supabase
            .from('user_sessions')
            .insert({
                user_id: userId,
                device_info: deviceInfo,
                login_at: new Date().toISOString(),
            })
            .select('id')
            .single()

        if (!error && data) {
            sessionIdRef.current = data.id
            localStorage.setItem('session_id', data.id)
        }
    }, [userId, supabase])

    // Logout হলে session end
    const endSession = useCallback(async () => {
        const sessionId = sessionIdRef.current || localStorage.getItem('session_id')
        if (!sessionId || !userId) return

        const { data: session } = await supabase
            .from('user_sessions')
            .select('login_at')
            .eq('id', sessionId)
            .single()

        if (session) {
            const loginTime = new Date(session.login_at).getTime()
            const logoutTime = new Date().getTime()
            const durationMinutes = Math.round((logoutTime - loginTime) / 60000)

            await supabase
                .from('user_sessions')
                .update({
                    logout_at: new Date().toISOString(),
                    duration_minutes: durationMinutes,
                })
                .eq('id', sessionId)

            localStorage.removeItem('session_id')
            sessionIdRef.current = null
        }
    }, [userId, supabase])

    // Page close হলে auto session end
    useEffect(() => {
        if (!userId) return

        startSession()

        const handleBeforeUnload = () => {
            endSession()
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [userId, startSession, endSession])

    return { startSession, endSession }
}