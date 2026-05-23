'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_PLANS, ClassLevel } from '@/lib/plans'

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

export default function SubscriptionPage() {
    const router = useRouter()
    const [selectedClass, setSelectedClass] = useState<ClassLevel | null>(null)
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

    const classPlans = selectedClass
        ? ALL_PLANS.filter(p => p.classLevel === selectedClass)
        : []

    function handleSelect() {
        if (!selectedPlanId) return
        router.push(`/dashboard/student/subscription/payment?plan=${selectedPlanId}`)
    }

    return (
        <div className="min-h-screen bg-[#0a0a1a] p-6">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        সাবস্ক্রিপশন প্ল্যান
                    </h1>
                    <p className="text-white/50">
                        তোমার শ্রেণী বেছে নাও, তারপর প্ল্যান select করো
                    </p>
                </div>

                {/* Step 1 — Class Level */}
                <div className="mb-8">
                    <p className="text-white/70 text-sm mb-3 font-medium">
                        ১. তোমার শ্রেণী বেছে নাও
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {CLASS_LEVELS.map((level) => (
                            <button
                                key={level.id}
                                onClick={() => {
                                    setSelectedClass(level.id)
                                    setSelectedPlanId(null)
                                }}
                                className={`p-3 rounded-xl border transition-all text-center ${selectedClass === level.id
                                        ? 'bg-white/10 border-white/30'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <div className="text-2xl mb-1">{level.icon}</div>
                                <div className="text-white text-xs font-medium leading-tight">
                                    {level.name}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2 — Duration */}
                {selectedClass && (
                    <div className="mb-8">
                        <p className="text-white/70 text-sm mb-3 font-medium">
                            ২. প্ল্যান বেছে নাও
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classPlans.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                    className={`relative p-5 rounded-2xl border text-left transition-all ${selectedPlanId === plan.id
                                            ? `bg-gradient-to-b ${plan.color.replace('from-', 'from-').replace('to-', 'to-')}/20 border-white/30`
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {/* Yearly badge */}
                                    {plan.duration === 'yearly' && (
                                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            ৩০% ছাড়
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-white font-bold">
                                            {plan.durationName}
                                        </span>
                                        <div className="text-right">
                                            {plan.originalPrice && (
                                                <p className="text-white/30 text-xs line-through">
                                                    ৳{plan.originalPrice}
                                                </p>
                                            )}
                                            <p className="text-2xl font-bold text-white">
                                                ৳{plan.price}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-1">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="text-white/60 text-xs flex items-center gap-1">
                                                <span className="text-emerald-400">✓</span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Selected indicator */}
                                    {selectedPlanId === plan.id && (
                                        <div className="mt-3 text-emerald-400 text-xs font-medium">
                                            ✅ Selected
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3 — Confirm */}
                {selectedPlanId && (
                    <div className="sticky bottom-6">
                        <button
                            onClick={handleSelect}
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white font-bold text-lg transition-all shadow-lg shadow-emerald-500/20"
                        >
                            পেমেন্ট করো →
                        </button>
                    </div>
                )}

            </div>
        </div>
    )
}