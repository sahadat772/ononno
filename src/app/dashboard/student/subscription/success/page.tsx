'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { getPlanById } from '@/lib/plans'

function SuccessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const planId = searchParams.get('plan') || ''
    const trx = searchParams.get('trx') || ''

    const plan = getPlanById(planId)
    const planLabel = plan
        ? `${plan.icon} ${plan.name} · ${plan.durationName}`
        : planId || 'নির্বাচিত প্ল্যান'

    return (
        <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-5xl text-emerald-400">✓</span>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">পেমেন্ট জমা হয়েছে!</h1>
                <p className="text-white/50 mb-2 text-sm leading-relaxed">
                    তোমার <span className="text-white/80 font-medium">{planLabel}</span> প্ল্যানের
                    পেমেন্ট আমরা পেয়েছি।
                </p>
                {trx && (
                    <p className="text-white/35 text-xs mb-6 font-mono">
                        Trx ID: {trx}
                    </p>
                )}
                {!trx && <div className="mb-6" />}

                <div className="space-y-3 mb-8 text-left">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                        <span className="text-xl">⏳</span>
                        <div>
                            <p className="text-white font-medium text-sm">কতক্ষণ লাগবে?</p>
                            <p className="text-white/50 text-xs mt-1 leading-relaxed">
                                সাধারণত ১–২ ঘণ্টার মধ্যে verify হয়। কর্মদিবসে সকাল ৯টা — রাত ১০টার
                                মধ্যে।
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                        <span className="text-xl">🔔</span>
                        <div>
                            <p className="text-white font-medium text-sm">কীভাবে জানবে?</p>
                            <p className="text-white/50 text-xs mt-1 leading-relaxed">
                                Activate হলে notification পাবে। Subscription পেজেও স্ট্যাটাস দেখা
                                যাবে।
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                        <span className="text-xl">❓</span>
                        <div>
                            <p className="text-white font-medium text-sm">সমস্যা হলে?</p>
                            <p className="text-white/50 text-xs mt-1 leading-relaxed">
                                bKash: 01787815621 অথবা Nagad: 01615680137 এ যোগাযোগ করো। Trx ID
                                সাথে রাখো।
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/student')}
                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-semibold transition-all"
                    >
                        Dashboard এ যাও
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/student/subscription')}
                        className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 font-medium transition-all"
                    >
                        সাবস্ক্রিপশন স্ট্যাটাস দেখো
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function SuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
                    <p className="text-white/50">Loading...</p>
                </div>
            }
        >
            <SuccessContent />
        </Suspense>
    )
}
