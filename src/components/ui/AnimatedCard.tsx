'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedCardProps {
    children: React.ReactNode
    className?: string
    delay?: number
    hover?: boolean
}

export default function AnimatedCard({
    children,
    className,
    delay = 0,
    hover = true,
}: AnimatedCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.4, 0, 0.2, 1],
            }}
            whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
            className={cn(
                'bg-white rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-lg',
                className
            )}
        >
            {children}
        </motion.div>
    )
}