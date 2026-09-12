import type { ReactNode } from 'react'
import AdminFooter from '@/components/admin/AdminFooter'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f7fb]">
      <div className="flex-1">{children}</div>
      <AdminFooter />
    </div>
  )
}
