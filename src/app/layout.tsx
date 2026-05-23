import type { Metadata } from 'next'
import { Amiri } from 'next/font/google'
import './globals.css'

const amiri = Amiri({
    subsets: ['arabic'],
    weight: ['400', '700'],
    variable: '--font-amiri',
})

export const metadata: Metadata = {
    title: 'Ononno',
    description: 'AI-powered lifelong learning platform',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="bn">
            <body className={amiri.variable}>{children}</body>
        </html>
    )
}