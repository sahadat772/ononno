'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface AdBannerProps {
    position?: 'top' | 'bottom' | 'sidebar'
    className?: string
}

const ADS = [
    {
        id: 1,
        title: 'আরবি শিখুন সহজে!',
        description: 'AI দিয়ে আরবি উচ্চারণ শিখুন মাত্র ৩০ দিনে',
        cta: 'এখনই শুরু করুন',
        bg: 'from-emerald-600/20 to-teal-600/20',
        border: 'border-emerald-500/30',
        icon: '🕌',
    },
    {
        id: 2,
        title: 'Unlimited AI Tutor!',
        description: 'Pro plan এ upgrade করুন — unlimited AI chat, no ads',
        cta: 'Upgrade করুন',
        bg: 'from-violet-600/20 to-purple-600/20',
        border: 'border-violet-500/30',
        icon: '🤖',
    },
    {
        id: 3,
        title: 'পরিবারের সবাই শিখুক!',
        description: 'Family plan এ ৫ জন পর্যন্ত একসাথে পড়তে পারবে',
        cta: 'Family Plan দেখুন',
        bg: 'from-blue-600/20 to-cyan-600/20',
        border: 'border-blue-500/30',
        icon: '👨‍👩‍👧',
    },
]

export default function AdBanner({
    position = 'bottom',
    className = '',
}: AdBannerProps) {
    const [currentAd, setCurrentAd] = useState(0)
    const [isVisible, setIsVisible] = useState(true)

    // প্রতি ১০ সেকেন্ডে ad পরিবর্তন
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentAd((prev) => (prev + 1) % ADS.length)
        }, 10000)
        return () => clearInterval(interval)
    }, [])

    if (!isVisible) return null

    const ad = ADS[currentAd]

    if (position === 'sidebar') {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-linear-to-br ${ad.bg} border ${ad.border} rounded-2xl p-4 ${className}`}
            >
                <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                        বিজ্ঞাপন
                    </span>
                    <button
                        onClick={() => setIsVisible(false)}
                        title="বিজ্ঞাপন বন্ধ করো"
                        aria-label="বিজ্ঞাপন বন্ধ করো"
                        className="text-white/30 hover:text-white/60 transition text-xs"
                    >
                        ✕
                    </button>
                </div>
                <p className="text-2xl mb-2">{ad.icon}</p>
                <h3 className="text-white font-bold text-sm mb-1">{ad.title}</h3>
                <p className="text-white/50 text-xs mb-3">{ad.description}</p>
                <Link
                    href="/dashboard/student/subscription"
                    className="block w-full text-center py-2 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition"
                >
                    {ad.cta}
                </Link>
            </motion.div>
        )
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentAd}
                initial={{ opacity: 0, y: position === 'top' ? -10 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`bg-linear-to-r ${ad.bg} border ${ad.border} rounded-2xl p-4 ${className}`}
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink:0">{ad.icon}</span>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-white font-bold text-sm truncate">
                                    {ad.title}
                                </h3>
                                <span className="text-xs text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full flex-shrink:0">
                                    বিজ্ঞাপন
                                </span>
                            </div>
                            <p className="text-white/50 text-xs truncate">{ad.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink:0">
                        <Link
                            href="/dashboard/student/subscription"
                            className="px-3 py-1.5 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition whitespace-nowrap"
                        >
                            {ad.cta}
                        </Link>
                        <button
                            onClick={() => setIsVisible(false)}
                            title="বিজ্ঞাপন বন্ধ করো"
                            aria-label="বিজ্ঞাপন বন্ধ করো"
                            className="text-white/30 hover:text-white/60 transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Ad indicator dots */}
                <div className="flex justify-center gap-1 mt-3">
                    {ADS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentAd(i)}
                            aria-label={`Go to ad ${i + 1}`}
                            title={`Ad ${i + 1}`}
                            className={`w-1.5 h-1.5 rounded-full transition ${i === currentAd
                                    ? 'bg-violet-400'
                                    : 'bg-white/20'
                                }`}
                        />
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}