'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const PAYMENT_INFO = {
    bkash: {
        name: 'bKash',
        number: '01787815621',
        type: 'Send Money',
        color: 'from-pink-500/20 to-pink-600/20',
        border: 'border-pink-500/30',
        textColor: 'text-pink-400',
        icon: '💗',
    },
    nagad: {
        name: 'Nagad',
        number: '01615680137',
        type: 'Send Money',
        color: 'from-orange-500/20 to-orange-600/20',
        border: 'border-orange-500/30',
        textColor: 'text-orange-400',
        icon: '🟠',
    },
}

const PLAN_NAMES: Record<string, string> = {
    monthly: 'মাসিক — ৳299',
    yearly: 'বার্ষিক — ৳2499',
    family: 'পারিবারিক — ৳3999',
}

const PLAN_AMOUNTS: Record<string, number> = {
    monthly: 299,
    yearly: 2499,
    family: 3999,
}

function PaymentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const planId = searchParams.get('plan') || 'monthly'

    const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad' | null>(null)
    const [trxId, setTrxId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    function copyNumber(number: string) {
        navigator.clipboard.writeText(number)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    async function handleSubmit() {
        if (!selectedMethod) {
            setError('Payment method বেছে নাও')
            return
        }
        if (!trxId.trim()) {
            setError('Transaction ID দাও')
            return
        }
        if (trxId.trim().length < 6) {
            setError('সঠিক Transaction ID দাও')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/payment/manual/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    paymentMethod: selectedMethod,
                    trxId: trxId.trim(),
                    amount: PLAN_AMOUNTS[planId],
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'কিছু একটা সমস্যা হয়েছে')
                return
            }

            router.push(`/dashboard/student/subscription/success?plan=${planId}`)

        } catch {
            setError('Server এ সমস্যা হয়েছে, আবার চেষ্টা করো')
        } finally {
            setLoading(false)
        }
    }

    const method = selectedMethod ? PAYMENT_INFO[selectedMethod] : null

    return (
        <div className="min-h-screen bg-[#0a0a1a] p-6">
            <div className="max-w-lg mx-auto">

                {/* Header */}
                <button
                    onClick={() => router.back()}
                    className="text-white/50 hover:text-white mb-6 flex items-center gap-2 transition-colors"
                >
                    ← ফিরে যাও
                </button>

                <h1 className="text-2xl font-bold text-white mb-1">
                    পেমেন্ট করো
                </h1>
                <p className="text-white/50 mb-8">
                    প্ল্যান: {PLAN_NAMES[planId]}
                </p>

                {/* Step 1 — Method Select */}
                <div className="mb-6">
                    <p className="text-white/70 text-sm mb-3">
                        ১. পেমেন্ট পদ্ধতি বেছে নাও
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {(Object.keys(PAYMENT_INFO) as Array<'bkash' | 'nagad'>).map((key) => (
                            <button
                                key={key}
                                onClick={() => setSelectedMethod(key)}
                                className={`p-4 rounded-xl border transition-all ${selectedMethod === key
                                        ? `bg-linear-to-b ${PAYMENT_INFO[key].color} ${PAYMENT_INFO[key].border}`
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <div className="text-2xl mb-1">{PAYMENT_INFO[key].icon}</div>
                                <div className="text-white font-medium">{PAYMENT_INFO[key].name}</div>
                                <div className="text-white/50 text-xs">{PAYMENT_INFO[key].type}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2 — Number দেখাও */}
                {method && (
                    <div className={`mb-6 p-5 rounded-xl bg-linear-to-b ${method.color} border ${method.border}`}>
                        <p className="text-white/70 text-sm mb-3">
                            ২. এই নম্বরে Send Money করো
                        </p>

                        {/* Number */}
                        <div className="flex items-center justify-between bg-black/30 rounded-xl p-4 mb-3">
                            <div>
                                <p className="text-white/50 text-xs mb-1">{method.name} Number</p>
                                <p className={`text-2xl font-bold ${method.textColor}`}>
                                    {method.number}
                                </p>
                            </div>
                            <button
                                onClick={() => copyNumber(method.number)}
                                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-white text-sm transition-all"
                            >
                                {copied ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>

                        {/* Amount */}
                        <div className="bg-black/30 rounded-xl p-4">
                            <p className="text-white/50 text-xs mb-1">পাঠাতে হবে</p>
                            <p className="text-2xl font-bold text-emerald-400">
                                ৳{PLAN_AMOUNTS[planId]}
                            </p>
                        </div>

                        {/* Instructions */}
                        <div className="mt-3 space-y-1">
                            <p className="text-white/50 text-xs">
                                📱 {method.name} app খোলো
                            </p>
                            <p className="text-white/50 text-xs">
                                💸 Send Money তে যাও
                            </p>
                            <p className="text-white/50 text-xs">
                                📝 উপরের নম্বরে ৳{PLAN_AMOUNTS[planId]} পাঠাও
                            </p>
                            <p className="text-white/50 text-xs">
                                🔢 Transaction ID টা কপি করো
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 3 — TrxID Input */}
                {method && (
                    <div className="mb-6">
                        <p className="text-white/70 text-sm mb-3">
                            ৩. Transaction ID দাও
                        </p>
                        <input
                            type="text"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            placeholder="যেমন: 8J5K9XYZ"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                        />
                        <p className="text-white/30 text-xs mt-2">
                            Payment সম্পন্ন হলে {method.name} থেকে Transaction ID পাবে
                        </p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Submit */}
                {method && (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'জমা দেওয়া হচ্ছে...' : 'পেমেন্ট নিশ্চিত করো ✓'}
                    </button>
                )}

            </div>
        </div>
    )
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
                <p className="text-white/50">Loading...</p>
            </div>
        }>
            <PaymentContent />
        </Suspense>
    )
}