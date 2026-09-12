/**
 * Skip link — keyboard users jump past repeated chrome on mobile/desktop.
 */
export default function SkipToContent({
  targetId = 'main-content',
  label = 'মূল কন্টেন্টে যান',
}: {
  targetId?: string
  label?: string
}) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-xl focus:bg-violet-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
    >
      {label}
    </a>
  )
}
