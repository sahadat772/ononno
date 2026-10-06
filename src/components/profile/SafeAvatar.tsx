'use client'

/**
 * Renders profile photos safely.
 * - data: URLs and unknown hosts use <img>
 * - local/public paths use next/image when possible
 * Never throws — bad URLs fall back to initial letter.
 */
export default function SafeAvatar({
  src,
  name = 'U',
  className = '',
  textClassName = 'text-lg font-black text-white',
}: {
  src?: string | null
  name?: string
  className?: string
  textClassName?: string
}) {
  const initial = (name || 'U').trim().charAt(0).toUpperCase() || 'U'
  const url = (src || '').trim()

  if (url && (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/'))) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={`h-full w-full object-cover ${className}`}
        onError={(e) => {
          const el = e.currentTarget
          el.style.display = 'none'
          const parent = el.parentElement
          if (parent && !parent.querySelector('[data-fallback]')) {
            const fb = document.createElement('div')
            fb.setAttribute('data-fallback', '1')
            fb.className =
              'flex size-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 ' +
              textClassName
            fb.textContent = initial
            parent.appendChild(fb)
          }
        }}
      />
    )
  }

  return (
    <div
      className={`flex size-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 ${textClassName}`}
    >
      {initial}
    </div>
  )
}
