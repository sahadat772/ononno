import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'অনন্য — AI Learning Platform',
    description: 'বাংলাদেশের স্মার্ট শিক্ষা প্ল্যাটফর্ম — Nursery থেকে Masters পর্যন্ত AI Learning',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'অনন্য',
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        title: 'অনন্য — AI Learning Platform',
        description: 'বাংলাদেশের স্মার্ট শিক্ষা প্ল্যাটফর্ম',
        type: 'website',
    },
}

export const viewport: Viewport = {
    themeColor: '#10b981',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="bn">
            <head>
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="অনন্য" />
                <meta name="mobile-web-app-capable" content="yes" />
            </head>
            <body>
                {children}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js')
                                        .then(function(reg) { console.log('SW registered'); })
                                        .catch(function(err) { console.log('SW error:', err); });
                                });
                            }
                        `,
                    }}
                />
            </body>
        </html>
    )
}