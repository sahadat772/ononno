import { createClient } from '@/lib/supabase'

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

/** Compress image client-side → JPEG blob (smaller upload, fewer storage failures) */
export async function compressImage(file: File): Promise<Blob> {
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
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85),
  )
  if (!blob) throw new Error('ছবি কম্প্রেস হয়নি')
  return blob
}

export type UploadAvatarResult = {
  publicUrl: string
  path: string
}

/**
 * Upload user avatar to Supabase Storage bucket `avatars`
 * and update `profiles.avatar_url`.
 */
export async function uploadUserAvatar(file: File): Promise<UploadAvatarResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('শুধু ছবি আপলোড করো (JPG, PNG, WEBP)।')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('ছবির সাইজ ২MB এর বেশি হবে না।')
  }

  const supabase = createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    throw new Error('লগইন নেই — আবার লগইন করো।')
  }

  let body: Blob = file
  let contentType = file.type || 'image/jpeg'
  let ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')

  try {
    body = await compressImage(file)
    contentType = 'image/jpeg'
    ext = 'jpg'
  } catch {
    // keep original if compress fails
  }

  // unique path avoids CDN/cache sticking to old image
  const path = `${user.id}/avatar-${Date.now()}.${ext}`

  const { error: upErr } = await supabase.storage.from('avatars').upload(path, body, {
    upsert: true,
    contentType,
    cacheControl: '3600',
  })

  if (upErr) {
    const msg = upErr.message || ''
    if (/bucket|not found|404/i.test(msg)) {
      throw new Error(
        'Storage bucket "avatars" পাওয়া যায়নি। Supabase Dashboard → Storage → New bucket (public) নাম: avatars',
      )
    }
    if (/policy|permission|rls|row-level|403|unauthorized/i.test(msg)) {
      throw new Error(
        'Storage permission নেই। Bucket policies-এ authenticated user-কে upload allow করো।',
      )
    }
    throw new Error(msg || 'আপলোড ব্যর্থ হয়েছে।')
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path)

  const urlWithBust = `${publicUrl}?t=${Date.now()}`

  const { error: dbErr } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (dbErr) {
    throw new Error(dbErr.message || 'প্রোফাইলে ছবি সেভ হয়নি।')
  }

  return { publicUrl: urlWithBust, path }
}
