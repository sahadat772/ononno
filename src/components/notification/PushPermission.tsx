'use client'

import { useNotification } from '@/hooks/useNotification'

export default function PushPermission() {
    const { permission, loading, requestPermission, isGranted, isDenied } = useNotification()

    // Already granted হলে কিছু দেখাবো না
    if (isGranted) return null

    // Denied হলে
    if (isDenied) return (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3">
            <span className="text-xl">🔕</span>
            <div>
                <p className="text-red-400 text-sm font-medium">Notification বন্ধ আছে</p>
                <p className="text-white/40 text-xs">Browser settings থেকে allow করো</p>
            </div>
        </div>
    )

    return (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <span className="text-xl">🔔</span>
                <div>
                    <p className="text-white text-sm font-medium">Notification চালু করো</p>
                    <p className="text-white/40 text-xs">
                        Subscription, lesson reminder পাবে
                    </p>
                </div>
            </div>
            <button
                onClick={requestPermission}
                disabled={loading}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-xs font-medium transition-all disabled:opacity-50 shrink-0"
            >
                {loading ? '...' : 'Allow'}
            </button>
        </div>
    )
}