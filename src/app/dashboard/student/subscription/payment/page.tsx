'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getPlanById } from '@/lib/plans'

const PAYMENT_INFO = {
    bkash: {
        name: 'bKash',
        number: '01787815621',
        type: 'Send Money',
        color: 'from-pink-500/15 to-pink-600/10',
        border: 'border-pink-500/30',
        textColor: 'text-pink-400',
        icon: '💗',
        ring: 'ring-pink-500/40',
    },
    nagad: {
        name: 'Nagad',
        number: '01615680137',
        type: 'Send Money',
        color: 'from-orange-500/15 to-orange-600/10',
        border: 'border-orange-500/30',
        textColor: 'text-orange-400',
        icon: '🟠',
        ring: 'ring-orange-500/40',
    },
} as const

type Method = keyof typeof PAYMENT_INFO

function PaymentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const planId = searchParams.get('plan') || ''

    const plan = getPlanById(planId)

    const [selectedMethod, setSelectedMethod] = useState<Method | null>(null)
    const [trxId, setTrxId] = useState('')
    const [senderNumber, setSenderNumber] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState<'number' | 'amount' | null>(null)

    function copyText(text: string, kind: 'number' | 'amount') {
        void navigator.clipboard.writeText(text)
        setCopied(kind)
        setTimeout(() => setCopied(null), 2000)
    }

    function normalizeTrx(v: string) {
        return v.trim().toUpperCase().replace(/\s+/g, '')
    }

    async function handleSubmit() {
        if (!selectedMethod) {
            setError('পেমেন্ট পদ্ধতি বেছে নাও')
            return
        }
        const cleanTrx = normalizeTrx(trxId)
        if (!cleanTrx) {
            setError('Transaction ID দাও')
            return
        }
        if (cleanTrx.length < 6 || cleanTrx.length > 20) {
            setError('সঠিক Transaction ID দাও (৬–২০ অক্ষর)')
            return
        }
        const cleanSender = senderNumber.replace(/\D/g, '')
        if (cleanSender && (cleanSender.length < 11 || cleanSender.length > 14)) {
            setError('পাঠানোর নম্বর সঠিক নয় (১১ ডিজিট)')
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
                    trxId: cleanTrx,
                    amount: plan?.price,
                    senderNumber: cleanSender || undefined,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'কিছু একটা সমস্যা হয়েছে')
                return
            }

            router.push(
                `/dashboard/student/subscription/success?plan=${encodeURIComponent(planId)}&trx=${encodeURIComponent(cleanTrx)}`,
            )
        } catch {
            setError('Server এ সমস্যা হয়েছে, আবার চেষ্টা করো')
        } finally {
            setLoading(false)
        }
    }

    if (!plan) {
        return (
            <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-white/50 mb-4">Plan পাওয়া যায়নি</p>
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/student/subscription')}
                        className="px-4 py-2 bg-white/10 rounded-xl text-white hover:bg-white/15 transition-colors"
                    >
                        ফিরে যাও
                    </button>
                </div>
            </div>
        )
    }

    const method = selectedMethod ? PAYMENT_INFO[selectedMethod] : null

    return (
        <div className="min-h-screen bg-[#0a0a1a] p-4 sm:p-6 pb-10">
            <div className="max-w-lg mx-auto">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-white/50 hover:text-white mb-5 flex items-center gap-2 transition-colors text-sm"
                >
                    ← ফিরে যাও
                </button>

                <h1 className="text-2xl font-bold text-white mb-1">পেমেন্ট করো</h1>
                <p className="text-white/40 text-sm mb-6">
                    Send Money করে Transaction ID জমা দাও — Admin verify করলে activate হবে
                </p>

                {/* Plan summary */}
                <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{plan.icon}</span>
                        <div className="min-w-0 flex-1">
                            <p className="text-white font-bold truncate">{plan.name}</p>
                            <p className="text-white/50 text-sm">
                                {plan.durationName} · {plan.durationDays} দিন
                            </p>
                        </div>
                        <div className="text-right shrink-0">
                            {plan.originalPrice && (
                                <p className="text-white/30 text-xs line-through">
                                    ৳{plan.originalPrice.toLocaleString('bn-BD')}
                                </p>
                            )}
                            <p className="text-2xl font-bold text-emerald-400">
                                ৳{plan.price.toLocaleString('bn-BD')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Step 1 — Method */}
                <div className="mb-6">
                    <p className="text-white/70 text-sm mb-3 font-medium">
                        ১. পেমেন্ট পদ্ধতি বেছে নাও
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {(Object.keys(PAYMENT_INFO) as Method[]).map((key) => {
                            const info = PAYMENT_INFO[key]
                            const active = selectedMethod === key
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSelectedMethod(key)}
                                    className={`p-4 rounded-2xl border transition-all text-left ${
                                        active
                                            ? `bg-gradient-to-b ${info.color} ${info.border} ring-1 ${info.ring}`
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">{info.icon}</div>
                                    <div className="text-white font-semibold text-sm">
                                        {info.name}
                                    </div>
                                    <div className="text-white/50 text-xs mt-0.5">{info.type}</div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Step 2 — Number + amount */}
                {method && (
                    <div
                        className={`mb-6 p-5 rounded-2xl bg-gradient-to-b ${method.color} border ${method.border}`}
                    >
                        <p className="text-white/70 text-sm mb-3 font-medium">
                            ২. এই নম্বরে Send Money করো
                        </p>

                        <div className="flex items-center justify-between bg-black/30 rounded-xl p-4 mb-3 gap-3">
                            <div className="min-w-0">
                                <p className="text-white/50 text-xs mb-1">
                                    {method.name} Personal
                                </p>
                                <p
                                    className={`text-xl sm:text-2xl font-bold ${method.textColor} tracking-wide`}
                                >
                                    {method.number}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => copyText(method.number, 'number')}
                                className="shrink-0 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-white text-sm transition-all"
                            >
                                {copied === 'number' ? '✓ কপি' : 'কপি'}
                            </button>
                        </div>

                        <div className="flex items-center justify-between bg-black/30 rounded-xl p-4 mb-4 gap-3">
                            <div>
                                <p className="text-white/50 text-xs mb-1">পাঠাতে হবে</p>
                                <p className="text-2xl font-bold text-emerald-400">
                                    ৳{plan.price.toLocaleString('bn-BD')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => copyText(String(plan.price), 'amount')}
                                className="shrink-0 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-white text-sm transition-all"
                            >
                                {copied === 'amount' ? '✓ কপি' : 'কপি'}
                            </button>
                        </div>

                        <ol className="space-y-1.5 text-white/55 text-xs list-decimal list-inside">
                            <li>{method.name} অ্যাপ খোলো</li>
                            <li>
                                <strong className="text-white/80">Send Money</strong> বেছে নাও
                                (Payment / Cash Out নয়)
                            </li>
                            <li>
                                উপরের নম্বরে{' '}
                                <strong className="text-emerald-400">
                                    ৳{plan.price.toLocaleString('bn-BD')}
                                </strong>{' '}
                                পাঠাও
                            </li>
                            <li>Transaction ID কপি করে নিচে দাও</li>
                        </ol>
                    </div>
                )}

                {/* Step 3 — Trx + sender */}
                {method && (
                    <div className="mb-6 space-y-4">
                        <div>
                            <p className="text-white/70 text-sm mb-2 font-medium">
                                ৩. Transaction ID দাও
                            </p>
                            <input
                                type="text"
                                value={trxId}
                                onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                                placeholder="যেমন: 8J5K9XYZ12"
                                autoComplete="off"
                                spellCheck={false}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors font-mono tracking-wider"
                            />
                            <p className="text-white/30 text-xs mt-2">
                                {method.name} থেকে SMS/অ্যাপে যে TrxID পাবে — সেটাই লিখো
                            </p>
                        </div>

                        <div>
                            <p className="text-white/70 text-sm mb-2 font-medium">
                                ৪. যে নম্বর থেকে পাঠিয়েছ (ঐচ্ছিক)
                            </p>
                            <input
                                type="tel"
                                inputMode="numeric"
                                value={senderNumber}
                                onChange={(e) =>
                                    setSenderNumber(e.target.value.replace(/[^\d+]/g, ''))
                                }
                                placeholder="01XXXXXXXXX"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
                            />
                            <p className="text-white/30 text-xs mt-2">
                                Admin verify করতে সুবিধা হয়
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {method && (
                    <button
                        type="button"
                        onClick={() => void handleSubmit()}
                        disabled={loading}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] rounded-2xl text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                    >
                        {loading ? 'জমা দেওয়া হচ্ছে...' : 'পেমেন্ট নিশ্চিত করো ✓'}
                    </button>
                )}

                <p className="text-center text-white/30 text-xs mt-5 leading-relaxed">
                    পেমেন্ট জমা দিলে সাথে সাথে activate হয় না।
                    <br />
                    Admin যাচাই করে সাধারণত ১–২ ঘণ্টার মধ্যে চালু করে।
                </p>

                <div className="mt-6 text-center">
                    <Link
                        href="/free-access"
                        className="text-violet-400/80 hover:text-violet-300 text-xs underline underline-offset-2"
                    >
                        বিনামূল্যে অ্যাক্সেসের জন্য আবেদন করো
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function PaymentPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
                    <p className="text-white/50">Loading...</p>
                </div>
            }
        >
            <PaymentContent />
        </Suspense>
    )
}
