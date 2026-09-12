import type { ReactNode } from 'react'
import StudentMobileNav from '@/components/student/StudentMobileNav'
import SkipToContent from '@/components/shared/SkipToContent'

/**
 * Student area shell — mobile bottom nav + safe-area padding on all sub-routes.
 */
export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipToContent />
      <div
        className="min-h-dvh bg-[#0a0a1a] text-white md:min-h-screen"
        style={{
          paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="pb-[4.75rem] md:pb-0" id="main-content" tabIndex={-1}>
          {children}
        </div>
      </div>
      <StudentMobileNav />
    </>
  )
}
