'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ALL_PLANS, ClassLevel, getPlanById } from '@/lib/plans'
import { createClient } from '@/lib/supabase'
import { useSubscription } from '@/hooks/useSubscription'

const CLASS_LEVELS: { id: ClassLevel; name: string; icon: string }[] = [
    { id: 'nursery', name: 'নার্সারি (N-2)', icon: '🌱' },
    { id: 'class_3_5', name: 'শ্রেণী ৩-৫', icon: '📚' },
    { id: 'class_6_8', name: 'শ্রেণী ৬-৮', icon: '📖' },
    { id: 'class_9_10', name: 'শ্রেণী ৯-১০', icon: '🎯' },
    { id: 'class_11_12', name: 'শ্রেণী ১১-১২', icon: '🏆' },
    { id: 'university', name: 'বিশ্ববিদ্যালয়+', icon: '🎓' },
    { id: 'skill_basic', name: 'Skill Basic', icon: '⚡' },
    { id: 'skill_pro', name: 'Skill Pro', icon: '🚀' },
    { id: 'family', name: 'পারিবারিক', icon: '👨‍👩‍👧' },
]

interface PendingTx {
    id: string
    plan_id: string
    amount: number
    payment_method: string
    status: string
    created_at: string
    metadata?: { user_trx_id?: string; plan_name?: string; duration?: string }
}

export default function SubscriptionPage() {
    const router = useRouter()
    const { subscription, loading: subLoading, isSubscribed, isExpiringSoon, daysLeft, planType } =
        useSubscription()

    const [selectedClass, setSelectedClass] = useState<ClassLevel | null>(null)
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
    const [pending, setPending] = useState<PendingTx[]>([])
    const [pendingLoading, setPendingLoading] = useState(true)

    const activePlan = planType ? getPlanById(planType) : null

    const classPlans = selectedClass
        ? ALL_PLANS.filter((p) => p.classLevel === selectedClass)
        : []

    useEffect(() => {
        async function loadPending() {
            try {
                const supabase = createClient()
                const {
                    data: { user },
                } = await supabase.auth.getUser()
                if (!user) return

                const { data } = await supabase
                    .from('payment_transactions')
                    .select('id, plan_id, amount, payment_method, status, created_at, metadata')
                    .eq('user_id', user.id)
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(5)

                setPending((data as PendingTx[]) || [])
            } catch {
                setPending([])
            } finally {
                setPendingLoading(false)
            }
        }
        void loadPending()
    }, [])

    function handleSelect() {
        if (!selectedPlanId) return
        router.push(`/dashboard/student/subscription/payment?plan=${selectedPlanId}`)
    }

    return (
        <div className="min-h-screen bg-[#0a0a1a] p-4 sm:p-6 pb-28">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard/student"
                        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-4 transition-colors"
                    >
                        ← Dashboard
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                        সাবস্ক্রিপশন প্ল্যান
                    </h1>
                    <p className="text-white/50 text-sm">
                        তোমার শ্রেণী বেছে নাও, তারপর প্ল্যান select করো
                    </p>
                </div>

                {/* Current subscription status */}
                {!subLoading && isSubscribed && (
                    <div
                        className={`mb-6 p-4 rounded-2xl border ${
                            isExpiringSoon
                                ? 'bg-amber-500/10 border-amber-500/30'
                                : 'bg-emerald-500/10 border-emerald-500/30'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">{isExpiringSoon ? '⚠️' : '✅'}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm">
                                    {isExpiringSoon
                                        ? `সাবস্ক্রিপশন শীঘ্রই শেষ হবে (${daysLeft} দিন বাকি)`
                                        : 'সাবস্ক্রিপশন সক্রিয়'}
                                </p>
                                <p className="text-white/60 text-xs mt-1">
                                    {activePlan
                                        ? `${activePlan.icon} ${activePlan.name} · ${activePlan.durationName}`
                                        : planType}
                                    {subscription?.expires_at && (
                                        <>
                                            {' '}
                                            · শেষ{' '}
                                            {new Date(subscription.expires_at).toLocaleDateString(
                                                'bn-BD',
                                                {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                },
                                            )}
                                        </>
                                    )}
                                </p>
                                {isExpiringSoon && (
                                    <p className="text-amber-300/80 text-xs mt-2">
                                        নতুন প্ল্যান নিয়ে চালিয়ে যাও — নিচে থেকে বেছে নাও
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Pending payments */}
                {!pendingLoading && pending.length > 0 && (
                    <div className="mb-6 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30">
                        <p className="text-sky-300 font-semibold text-sm mb-3 flex items-center gap-2">
                            <span>⏳</span> যাচাইয়ের অপেক্ষায় ({pending.length})
                        </p>
                        <div className="space-y-2">
                            {pending.map((tx) => {
                                const p = getPlanById(tx.plan_id)
                                return (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between gap-3 bg-black/20 rounded-xl px-3 py-2.5"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-white text-sm font-medium truncate">
                                                {p
                                                    ? `${p.icon} ${p.name} · ${p.durationName}`
                                                    : tx.metadata?.plan_name || tx.plan_id}
                                            </p>
                                            <p className="text-white/40 text-xs mt-0.5">
                                                {tx.payment_method === 'bkash' ? 'bKash' : 'Nagad'} ·
                                                Trx: {tx.metadata?.user_trx_id || '—'} ·{' '}
                                                {new Date(tx.created_at).toLocaleDateString('bn-BD')}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-sky-300 text-xs font-medium bg-sky-500/20 px-2 py-1 rounded-lg">
                                            ৳{tx.amount}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                        <p className="text-white/40 text-xs mt-3">
                            সাধারণত ১–২ ঘণ্টার মধ্যে Admin verify করে। কর্মদিবসে সকাল ৯টা – রাত ১০টা।
                        </p>
                    </div>
                )}

                {/* Free access CTA */}
                <Link
                    href="/free-access"
                    className="mb-8 flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-all group"
                >
                    <span className="text-2xl">🤲</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm group-hover:text-violet-200 transition-colors">
                            এতিম / দরিদ্র / প্রতিবন্ধী? বিনামূল্যে আবেদন করো
                        </p>
                        <p className="text-white/40 text-xs mt-0.5">
                            যাচাই সাপেক্ষে সম্পূর্ণ ফ্রি অ্যাক্সেস
                        </p>
                    </div>
                    <span className="text-white/30 group-hover:text-white/60 transition-colors">
                        →
                    </span>
                </Link>

                {/* Step 1 — Class Level */}
                <div className="mb-8">
                    <p className="text-white/70 text-sm mb-3 font-medium">
                        ১. তোমার শ্রেণী বেছে নাও
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {CLASS_LEVELS.map((level) => (
                            <button
                                key={level.id}
                                type="button"
                                onClick={() => {
                                    setSelectedClass(level.id)
                                    setSelectedPlanId(null)
                                }}
                                className={`p-3 rounded-xl border transition-all text-center min-h-[72px] ${
                                    selectedClass === level.id
                                        ? 'bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/30'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                }`}
                            >
                                <div className="text-2xl mb-1">{level.icon}</div>
                                <div className="text-white text-[11px] sm:text-xs font-medium leading-tight">
                                    {level.name}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2 — Plans */}
                {selectedClass && (
                    <div className="mb-8">
                        <p className="text-white/70 text-sm mb-3 font-medium">
                            ২. প্ল্যান বেছে নাও
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {classPlans.map((plan) => {
                                const selected = selectedPlanId === plan.id
                                return (
                                    <button
                                        key={plan.id}
                                        type="button"
                                        onClick={() => setSelectedPlanId(plan.id)}
                                        className={`relative p-5 rounded-2xl border text-left transition-all ${
                                            selected
                                                ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        {plan.duration === 'yearly' && (
                                            <div className="absolute -top-2.5 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg shadow-emerald-500/30">
                                                ৩০% ছাড়
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mb-3 gap-2">
                                            <div>
                                                <p className="text-white font-bold text-sm">
                                                    {plan.durationName}
                                                </p>
                                                <p className="text-white/40 text-xs mt-0.5">
                                                    {plan.durationDays} দিন
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {plan.originalPrice && (
                                                    <p className="text-white/30 text-xs line-through">
                                                        ৳{plan.originalPrice.toLocaleString('bn-BD')}
                                                    </p>
                                                )}
                                                <p className="text-2xl font-bold text-white">
                                                    ৳{plan.price.toLocaleString('bn-BD')}
                                                </p>
                                            </div>
                                        </div>

                                        <ul className="space-y-1.5">
                                            {plan.features.map((f, i) => (
                                                <li
                                                    key={i}
                                                    className="text-white/60 text-xs flex items-center gap-1.5"
                                                >
                                                    <span className="text-emerald-400 shrink-0">
                                                        ✓
                                                    </span>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>

                                        {selected && (
                                            <div className="mt-3 text-emerald-400 text-xs font-semibold">
                                                ✓ নির্বাচিত
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Sticky CTA */}
                {selectedPlanId && (
                    <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a] to-transparent pt-8 z-20">
                        <div className="max-w-4xl mx-auto">
                            <button
                                type="button"
                                onClick={handleSelect}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] rounded-2xl text-white font-bold text-lg transition-all shadow-lg shadow-emerald-500/25"
                            >
                                পেমেন্ট করো →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
