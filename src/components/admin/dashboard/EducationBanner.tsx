'use client'

import Image from 'next/image'

/**
 * Motivational banner — matches ONONNO "Great education builds a better tomorrow" artwork.
 * Uses /images/edu-banner.webp when present; otherwise rich CSS illustration layout.
 */
export default function EducationBanner() {
  return (
    <div className="overflow-hidden rounded-2xl border border-sky-100 shadow-sm">
      {/* Prefer real artwork if deployed to public/images */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/edu-banner.webp"
        alt="Great education builds a better tomorrow — ONONNO"
        className="hidden h-auto w-full object-cover object-center data-[ok=true]:block"
        width={1184}
        height={254}
        onLoad={(e) => {
          e.currentTarget.dataset.ok = 'true'
          const fallback = e.currentTarget.nextElementSibling as HTMLElement | null
          if (fallback) fallback.style.display = 'none'
        }}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
      <div className="relative flex min-h-[7.5rem] items-center overflow-hidden bg-gradient-to-r from-[#cfefff] via-[#e7f9ef] to-[#fff3c4] px-4 py-5 sm:min-h-[9rem] sm:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -bottom-8 left-0 right-0 h-20 bg-gradient-to-t from-emerald-300/40 to-transparent" />
          <div className="absolute bottom-0 left-[10%] h-12 w-32 rounded-[100%] bg-lime-400/25 blur-lg" />
          <div className="absolute bottom-2 right-[15%] h-16 w-40 rounded-[100%] bg-teal-400/20 blur-md" />
          <span className="absolute right-10 top-3 text-base opacity-80">🕊️</span>
          <span className="absolute right-20 top-7 text-sm opacity-60">🕊️</span>
        </div>
        <div className="relative z-10 flex w-full flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-end gap-1 text-4xl sm:text-5xl" aria-hidden>
            <span>🎒</span>
            <span className="text-3xl sm:text-4xl">🧑‍💻</span>
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-base font-black leading-snug text-slate-800 sm:text-xl md:text-2xl">
              &ldquo;Great education builds a better tomorrow&rdquo;
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500 sm:text-sm">— ONONNO</p>
          </div>
          <Image
            src="/icons/logo-icon.png"
            alt="ONONNO"
            width={52}
            height={52}
            className="rounded-xl shadow-md ring-2 ring-white/80"
          />
        </div>
      </div>
    </div>
  )
}
