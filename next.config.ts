import type { NextConfig } from 'next'

const nextConfig: NextConfig = {

  // ── Images ──────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
    ],
  },

  // ── Security Headers ─────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()',
          },
        ],
      },
      // Service Worker — cache control
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      // Manifest
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },

  // ── Redirects ────────────────────────────────────────────────────
  async redirects() {
    return [
      // পুরনো routes redirect
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // ── Performance ──────────────────────────────────────────────────
  compress: true,

  // ── TypeScript & ESLint ──────────────────────────────────────────
  typescript: {
    // Production build এ type errors ignore করবে না
    ignoreBuildErrors: false,
  },
  // ── Logging ──────────────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default nextConfig