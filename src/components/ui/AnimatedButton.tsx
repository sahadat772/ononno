'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedButtonProps {
    children: React.ReactNode
    className?: string
    onClick?: () => void
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
}

export default function AnimatedButton({
    children,
    className,
    onClick,
    type = 'button',
    disabled = false,
    variant = 'primary',
}: AnimatedButtonProps) {
    const variants = {
        primary: 'gradient-primary text-white shadow-lg shadow-green-200',
        secondary: 'gradient-secondary text-white shadow-lg shadow-purple-200',
        outline: 'border-2 border-green-600 text-green-700 hover:bg-green-50',
        ghost: 'text-gray-600 hover:bg-gray-100',
    }

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.97 }}
            transition={{ duration: 0.15 }}
            className={cn(
                'px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                className
            )}
        >
            {children}
        </motion.button>
    )
}