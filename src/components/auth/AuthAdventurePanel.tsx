import Link from 'next/link'
import Image from 'next/image'

type Variant = 'login' | 'register'

/**
 * Illustrated side panel for auth screens (mock: adventure landscape).
 */
export default function AuthAdventurePanel({ variant }: { variant: Variant }) {
  const isLogin = variant === 'login'

  return (
    <div className="relative flex h-full min-h-dvh w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-400 p-8 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
        <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-emerald-700/80 via-lime-600/40 to-transparent" />
        <div className="absolute bottom-16 left-8 h-24 w-24 rounded-full bg-amber-300/30 blur-xl" />
        <div className="absolute bottom-24 right-12 h-32 w-40 rounded-[40%] bg-teal-800/40" />
      </div>

      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Image src="/icons/logo-icon.png" alt="ONONNO" width={40} height={40} className="rounded-xl shadow-lg" />
          <div>
            <p className="text-lg font-black tracking-tight">ONONNO</p>
            <p className="text-[10px] font-semibold text-white/90">Learn · Explore · Achieve</p>
          </div>
        </Link>
      </div>

      <div className="relative z-10 my-auto max-w-sm py-10">
        {isLogin ? (
          <>
            <h2 className="text-3xl font-black leading-tight drop-shadow-sm xl:text-4xl">
              Your Learning Adventure Begins Here!
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/95">
              Explore the world of knowledge with NCTB-based interactive lessons, fun quizzes,
              real-life missions and more.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-4 py-3 backdrop-blur-sm">
              <span className="text-2xl">🪧</span>
              <div>
                <p className="text-sm font-black">Small Steps</p>
                <p className="text-xs font-semibold text-white/90">Big Dreams</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-black leading-tight drop-shadow-sm xl:text-4xl">
              More Than Just Study — It&apos;s an Adventure!
            </h2>
            <ul className="mt-6 space-y-3">
              {[
                { icon: '📚', t: 'NCTB Based Curriculum' },
                { icon: '🎮', t: 'Interactive Learning' },
                { icon: '🗺️', t: 'Real Life Missions' },
                { icon: '⚡', t: 'XP & Rewards' },
                { icon: '🧭', t: 'Personalized Journey' },
              ].map((item) => (
                <li
                  key={item.t}
                  className="flex items-center gap-3 rounded-xl border border-white/25 bg-white/15 px-3 py-2.5 backdrop-blur-sm"
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-white/20 text-lg">
                    {item.icon}
                  </span>
                  <span className="text-sm font-bold">{item.t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-4 py-3 backdrop-blur-sm">
              <span className="text-2xl">🪧</span>
              <div>
                <p className="text-sm font-black">Class 1–12</p>
                <p className="text-xs font-semibold text-white/90">NCTB Curriculum</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="relative z-10 flex flex-wrap gap-2 text-[11px] font-semibold text-white/90">
        <span className="rounded-full bg-white/20 px-2.5 py-1">📚 NCTB Curriculum</span>
        <span className="rounded-full bg-white/20 px-2.5 py-1">🤖 AI Powered</span>
        <span className="rounded-full bg-white/20 px-2.5 py-1">1–12 Classes</span>
      </div>

      <div className="pointer-events-none absolute bottom-28 right-6 text-7xl drop-shadow-lg xl:text-8xl">
        {isLogin ? '🧒🎒' : '👦🎒'}
      </div>
    </div>
  )
}
