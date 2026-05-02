'use client'

import { useState, useEffect } from 'react'

interface TypewriterTextProps {
    texts: string[]
    speed?: number
    className?: string
}

export default function TypewriterText({
    texts,
    speed = 80,
    className,
}: TypewriterTextProps) {
    const [displayText, setDisplayText] = useState('')
    const [textIndex, setTextIndex] = useState(0)
    const [charIndex, setCharIndex] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const current = texts[textIndex]

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                setDisplayText(current.slice(0, charIndex + 1))
                setCharIndex((prev) => prev + 1)

                if (charIndex + 1 === current.length) {
                    setTimeout(() => setIsDeleting(true), 1500)
                }
            } else {
                setDisplayText(current.slice(0, charIndex - 1))
                setCharIndex((prev) => prev - 1)

                if (charIndex - 1 === 0) {
                    setIsDeleting(false)
                    setTextIndex((prev) => (prev + 1) % texts.length)
                }
            }
        }, isDeleting ? speed / 2 : speed)

        return () => clearTimeout(timeout)
    }, [charIndex, isDeleting, textIndex, texts, speed])

    return (
        <span className={className}>
            {displayText}
            <span className="animate-pulse">|</span>
        </span>
    )
}