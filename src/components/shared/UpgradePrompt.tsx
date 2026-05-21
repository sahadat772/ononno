'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface UpgradePromptProps {
    feature?: string
    className?: string
}

export default function UpgradePrompt({
    feature = 'এই feature',
    className = '',
}: UpgradePromptProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-linear-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-6 text-center ${className}`}
        >
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-4">
                🔒
            </div>
            <h3 className="text-white font-bold text-lg mb-2">
                Premium Feature
            </h3>
            <p className="text-white/50 text-sm mb-4">
                {feature} ব্যবহার করতে Paid plan এ upgrade করুন।
                AI features, unlimited lessons, এবং আরো অনেক কিছু পাবেন।
            </p>

            {/* Features list */}
            <div className="bg-white/5 rounded-xl p-4 mb-4 text-left space-y-2">
                {[
                    '🤖 Unlimited AI Tutor',
                    '📊 AI Weakness Analysis',
                    '🎯 Personalized Learning Path',
                    '🔔 Real-time Notifications',
                    '📈 Performance Prediction',
                    '🚫 No Ads',
                ].map((feature, i) => (
                    <p key={i} className="text-white/60 text-sm flex items-center gap-2">
                        <span>{feature}</span>
                    </p>
                ))}
            </div>

            <Link
                href="/dashboard/student/subscription"
                className="block w-full py-3 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-semibold hover:opacity-90 transition"
            >
                এখনই Upgrade করুন 🚀
            </Link>

            <p className="text-white/30 text-xs mt-3">
                মাত্র ৳৯৯/মাস থেকে শুরু
            </p>
        </motion.div>
    )
}