'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const plans = [
    {
        id: 'monthly',
        name: 'মাসিক',
        price: 299,
        duration: '৩০ দিন',
        features: ['সব subject', 'AI Tutor', 'Progress tracking'],
        color: 'from-blue-500/20 to-blue-600/20',
        border: 'border-blue-500/30',
    },
    {
        id: 'yearly',
        name: 'বার্ষিক',
        price: 2499,
        duration: '৩৬৫ দিন',
        features: ['সব subject', 'AI Tutor', 'Priority support', '৩০% ছাড়'],
        color: 'from-emerald-500/20 to-emerald-600/20',
        border: 'border-emerald-500/30',
        popular: true,
    },
    {
        id: 'family',
        name: 'পারিবারিক',
        price: 3999,
        duration: '৩৬৫ দিন',
        features: ['৫ জন student', 'সব feature', 'Parent dashboard', '৪০% ছাড়'],
        color: 'from-purple-500/20 to-purple-600/20',
        border: 'border-purple-500/30',
    },
]

export default function SubscriptionPage() {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function handleSSLCommerz(planId: string) {
        setLoading(planId)
        setError(null)

        try {
            const res = await fetch('/api/payment/sslcommerz/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'কিছু একটা সমস্যা হয়েছে')
                return
            }

            // SSLCommerz payment page এ redirect করো
            router.push(data.url)

        } catch {
            setError('Server এ সমস্যা হয়েছে, আবার চেষ্টা করো')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a1a] p-6">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        সাবস্ক্রিপশন প্ল্যান
                    </h1>
                    <p className="text-white/50">
                        তোমার জন্য সেরা প্ল্যানটি বেছে নাও
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
                        {error}
                    </div>
                )}

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-linear-to-b ${plan.color} border ${plan.border} rounded-2xl p-6`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    সবচেয়ে জনপ্রিয়
                                </div>
                            )}

                            {/* Plan Info */}
                            <h2 className="text-xl font-bold text-white mb-1">
                                {plan.name}
                            </h2>
                            <p className="text-white/40 text-sm mb-4">
                                {plan.duration}
                            </p>

                            {/* Price */}
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">
                                    ৳{plan.price}
                                </span>
                            </div>

                            {/* Features */}
                            <ul className="space-y-2 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-white/70 text-sm">
                                        <span className="text-emerald-400">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {/* SSLCommerz Button */}
                            <button
                                onClick={() => handleSSLCommerz(plan.id)}
                                disabled={loading === plan.id}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading === plan.id ? 'Loading...' : 'Card দিয়ে Pay করো'}
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}