'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { uploadUserAvatar } from '@/lib/upload-avatar'

type Props = {
  currentUrl?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg'
  /** show text button under avatar */
  showLabel?: boolean
  className?: string
  onUploaded?: (url: string) => void
}

const SIZE = {
  sm: 'size-14',
  md: 'size-20 sm:size-24',
  lg: 'size-28 sm:size-32',
}

export default function AvatarUploader({
  currentUrl,
  name = 'U',
  size = 'md',
  showLabel = true,
  className = '',
  onUploaded,
}: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(currentUrl || '')
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMsg(null)
    try {
      const { publicUrl } = await uploadUserAvatar(file)
      setUrl(publicUrl)
      setMsg({ type: 'ok', text: 'প্রোফাইল ছবি আপডেট হয়েছে!' })
      onUploaded?.(publicUrl)
      router.refresh()
      setTimeout(() => setMsg(null), 3000)
    } catch (err) {
      const text = err instanceof Error ? err.message : 'আপলোড ব্যর্থ'
      setMsg({ type: 'err', text })
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const initial = (name || 'U').trim().charAt(0).toUpperCase() || 'U'

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <div
          className={`relative overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-lg ${SIZE[size]}`}
        >
          {url ? (
            <Image src={url} alt="Profile" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 text-2xl font-black text-white sm:text-3xl">
              {initial}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 grid size-10 place-items-center rounded-full border-2 border-white bg-violet-600 text-base text-white shadow-md transition hover:bg-violet-500 active:scale-95 disabled:opacity-60"
          aria-label="ছবি আপলোড"
          title="ছবি আপলোড"
        >
          {uploading ? '…' : '📷'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          capture="user"
          className="hidden"
          onChange={(e) => void onFile(e)}
        />
      </div>

      {showLabel && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="mt-2 text-xs font-bold text-violet-600 hover:underline disabled:opacity-50"
        >
          {uploading ? 'আপলোড হচ্ছে…' : url ? 'ছবি বদলাও' : 'ছবি যোগ করো'}
        </button>
      )}

      {msg && (
        <p
          className={`mt-2 max-w-xs text-center text-[11px] font-semibold leading-snug ${
            msg.type === 'ok' ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  )
}
