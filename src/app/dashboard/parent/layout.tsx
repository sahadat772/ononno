import type { ReactNode } from 'react'
import ParentMobileNav from '@/components/parent/ParentMobileNav'

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div
        className="min-h-dvh bg-[#0a0a1a] text-white"
        style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      >
        <div className="pb-[4.75rem] md:pb-0">{children}</div>
      </div>
      <ParentMobileNav />
    </>
  )
}
