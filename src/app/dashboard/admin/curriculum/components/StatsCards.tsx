'use client'

import { motion } from 'framer-motion'

interface Stats {
    total: number
    published: number
    draft: number
    archived: number
    active: number
}

interface Props {
    stats: Stats
}

export default function StatsCards({ stats }: Props) {
    const cards = [
        {
            title: 'Curriculum Versions',
            value: stats.total,
            icon: '📚',
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            title: 'Published',
            value: stats.published,
            icon: '🚀',
            gradient: 'from-emerald-500 to-green-500',
        },
        {
            title: 'Draft',
            value: stats.draft,
            icon: '📝',
            gradient: 'from-amber-500 to-orange-500',
        },
        {
            title: 'Archived',
            value: stats.archived,
            icon: '📦',
            gradient: 'from-violet-500 to-purple-500',
        },
    ]

    return (
        <section className="grid grid-cols-2 xl:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6"
                >
                    <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-r ${card.gradient} flex items-center justify-center text-3xl shadow-lg`}
                    >
                        {card.icon}
                    </div>

                    <p className="mt-5 text-sm text-gray-400">
                        {card.title}
                    </p>

                    <h2 className="mt-2 text-4xl font-black text-white">
                        {card.value}
                    </h2>
                </motion.div>
            ))}
        </section>
    )
}