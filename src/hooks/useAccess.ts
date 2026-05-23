'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

// Class level hierarchy
const CLASS_HIERARCHY: Record<string, number> = {
    nursery: 1,
    class_3_5: 2,
    class_6_8: 3,
    class_9_10: 4,
    class_11_12: 5,
    university: 6,
    skill_basic: 7,
    skill_pro: 8,
    family: 99, // সব access
}

interface AccessState {
    loading: boolean
    isPaid: boolean
    planType: string | null
    isFamily: boolean
    todayLessonsCount: number
    canDoLesson: boolean // Free user আজকে আর lesson করতে পারবে কিনা
}

export function useAccess() {
    const [access, setAccess] = useState<AccessState>({
        loading: true,
        isPaid: false,
        planType: null,
        isFamily: false,
        todayLessonsCount: 0,
        canDoLesson: true,
    })

    useEffect(() => {
        async function checkAccess() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    setAccess(prev => ({ ...prev, loading: false }))
                    return
                }

                // Subscription check
                const { data: subscription } = await supabase
                    .from('subscriptions')
                    .select('plan_type, status, expires_at')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .gte('expires_at', new Date().toISOString())
                    .single()

                const isPaid = !!subscription
                const planType = subscription?.plan_type || null
                const isFamily = planType === 'family'

                // Free user হলে আজকের lesson count দেখো
                let todayLessonsCount = 0
                let canDoLesson = true

                if (!isPaid) {
                    const todayStart = new Date()
                    todayStart.setHours(0, 0, 0, 0)

                    const { count } = await supabase
                        .from('learning_progress')
                        .select('id', { count: 'exact' })
                        .eq('user_id', user.id)
                        .eq('completed', true)
                        .gte('completed_at', todayStart.toISOString())

                    todayLessonsCount = count || 0
                    canDoLesson = todayLessonsCount < 1 // দিনে ১টা
                }

                setAccess({
                    loading: false,
                    isPaid,
                    planType,
                    isFamily,
                    todayLessonsCount,
                    canDoLesson,
                })

            } catch {
                setAccess(prev => ({ ...prev, loading: false }))
            }
        }

        void checkAccess()
    }, [])

    // Class content access check
    function canAccessClass(contentClass: string): boolean {
        if (access.loading) return false
        if (!access.isPaid) return false // Free user কোনো class access পাবে না (limit আছে)
        if (access.isFamily) return true // Family plan সব access

        // নিজের class এর content দেখতে পারবে
        return access.planType === contentClass
    }

    // Lesson করতে পারবে কিনা (free user limit check)
    function canDoLessonForClass(contentClass: string): boolean {
        if (access.isPaid) return canAccessClass(contentClass)
        return access.canDoLesson // Free user দিনে ১টা
    }

    return {
        ...access,
        canAccessClass,
        canDoLessonForClass,
    }
}