import ParentMobileNav from '@/components/parent/ParentMobileNav'

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <ParentMobileNav />
    </>
  )
}
