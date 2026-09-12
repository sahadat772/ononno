import type { ReactNode } from 'react'
import AdminFooter from '@/components/admin/AdminFooter'

/**
 * Admin area shell — shared footer on every admin page.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#030711]">
      <div className="flex-1">{children}</div>
      <AdminFooter />
    </div>
  )
}
