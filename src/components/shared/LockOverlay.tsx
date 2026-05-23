'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface LockOverlayProps {
    type: 'class' | 'daily_limit' | 'subscription'
    contentClass?: string
    className?: string
}

const CLASS_NAMES: Record<string, string> = {
    nursery: 'নার্সারি (N-2)',
    class_3_5: 'শ্রেণী ৩-৫',
    class_6_8: 'শ্রেণী ৬-৮',
    class_9_10: 'শ্রেণী ৯-১০',
    class_11_12: 'শ্রেণী ১১-১২',
    university: 'বিশ্ববিদ্যালয়+',
    skill_basic: 'Skill Basic',
    skill_pro: 'Skill Pro',
    family: 'পারিবারিক',
}

export default function LockOverlay({
    type,
    contentClass,
    className = '',
}: LockOverlayProps) {

    // Daily limit শেষ
    if (type === 'daily_limit') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center ${className}`}
            >
                <div className="text-4xl mb-3">⏰</div>
                <h3 className="text-white font-bold text-lg mb-2">
                    আজকের Lesson শেষ!
                </h3>
                <p className="text-white/50 text-sm mb-4">
                    Free plan এ প্রতিদিন ১টা lesson করা যায়।
                    কাল আবার আসো অথবা Plan নাও unlimited lesson এর জন্য!
                </p>
                <div className="space-y-2">
                    <Link
                        href="/dashboard/student/subscription"
                        className="block w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all"
                    >
                        Plan নাও 🚀
                    </Link>
                    <Link
                        href="/dashboard/student"
                        className="block w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-all"
                    >
                        Dashboard এ ফিরে যাও
                    </Link>
                </div>
            </motion.div>
        )
    }

    // অন্য class এর content
    if (type === 'class') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-violet-500/10 border border-violet-500/30 rounded-2xl p-6 text-center ${className}`}
            >
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="text-white font-bold text-lg mb-2">
                    এই content locked
                </h3>
                <p className="text-white/50 text-sm mb-2">
                    এই content টি{' '}
                    <span className="text-violet-400 font-medium">
                        {contentClass ? CLASS_NAMES[contentClass] : 'অন্য শ্রেণী'}
                    </span>{' '}
                    এর জন্য।
                </p>
                <p className="text-white/40 text-xs mb-4">
                    এই শ্রেণীর plan কিনলে সব content unlock হবে।
                </p>
                <Link
                    href="/dashboard/student/subscription"
                    className="block w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-semibold transition-all"
                >
                    {contentClass ? `${CLASS_NAMES[contentClass]} Plan নাও` : 'Plan নাও'} 🚀
                </Link>
            </motion.div>
        )
    }

    // Subscription নেই
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-linear-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-6 text-center ${className}`}
        >
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-white font-bold text-lg mb-2">
                Premium Content
            </h3>
            <p className="text-white/50 text-sm mb-4">
                এই content দেখতে Plan নিতে হবে।
                মাত্র ৳৯৯/মাস থেকে শুরু!
            </p>
            <Link
                href="/dashboard/student/subscription"
                className="block w-full py-3 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-semibold transition-all hover:opacity-90"
            >
                Plan দেখো 🚀
            </Link>
        </motion.div>
    )
}