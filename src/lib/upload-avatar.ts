const MAX_BYTES = 2 * 1024 * 1024 // 2MB original
const MAX_EDGE = 512 // compress to max 512px

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('ফাইল পড়া যায়নি'))
    reader.readAsDataURL(file)
  })
}

/** Compress image client-side → JPEG File */
export async function compressImage(file: File): Promise<File> {
  const dataUrl = await readAsDataURL(file)
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error('ছবি লোড হয়নি'))
    el.src = dataUrl
  })

  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas সাপোর্ট নেই')
  ctx.drawImage(img, 0, 0, w, h)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.82),
  )
  if (!blob) throw new Error('ছবি কম্প্রেস হয়নি')
  return new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
}

export type UploadAvatarResult = {
  publicUrl: string
  path?: string
  via?: string
}

/**
 * Upload user avatar through server API (service role + data-URL fallback).
 * Works even when client Storage RLS / missing bucket would block browser upload.
 */
export async function uploadUserAvatar(file: File): Promise<UploadAvatarResult> {
  if (!file.type.startsWith('image/') && file.type !== '') {
    throw new Error('শুধু ছবি আপলোড করো (JPG, PNG, WEBP)।')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('ছবির সাইজ ২MB এর বেশি হবে না।')
  }

  let toSend: File = file
  try {
    toSend = await compressImage(file)
  } catch {
    // keep original
  }

  const body = new FormData()
  body.append('file', toSend)

  const res = await fetch('/api/profile/avatar', {
    method: 'POST',
    body,
    credentials: 'include',
  })

  let json: {
    error?: string
    publicUrl?: string
    via?: string
  } = {}
  try {
    json = await res.json()
  } catch {
    /* ignore */
  }

  if (!res.ok || !json.publicUrl) {
    throw new Error(json.error || `আপলোড ব্যর্থ (HTTP ${res.status})`)
  }

  return {
    publicUrl: json.publicUrl,
    via: json.via,
  }
}
