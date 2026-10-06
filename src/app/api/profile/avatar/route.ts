import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_BYTES = 2.5 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'লগইন নেই — আবার লগইন করো।' }, { status: 401 })
    }

    const form = await request.formData()
    const file = form.get('file')

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'কোনো ছবি পাঠানো হয়নি।' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'ছবির সাইজ ২MB এর বেশি হবে না।' }, { status: 400 })
    }

    const type = file.type || 'image/jpeg'
    if (!type.startsWith('image/')) {
      return NextResponse.json({ error: 'শুধু ছবি আপলোড করো (JPG, PNG, WEBP)।' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext =
      type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : type.includes('gif') ? 'gif' : 'jpg'
    const path = `${user.id}/avatar-${Date.now()}.${ext}`

    let publicUrl: string | null = null
    let storageError: string | null = null

    // 1) Prefer Supabase Storage (service role bypasses RLS)
    try {
      const admin = createServiceRoleClient()
      const { error: upErr } = await admin.storage.from('avatars').upload(path, buffer, {
        contentType: type,
        upsert: true,
        cacheControl: '3600',
      })

      if (upErr) {
        storageError = upErr.message
        // Try creating public bucket once, then re-upload
        if (/bucket|not found|404/i.test(upErr.message)) {
          await admin.storage.createBucket('avatars', { public: true }).catch(() => null)
          const retry = await admin.storage.from('avatars').upload(path, buffer, {
            contentType: type,
            upsert: true,
            cacheControl: '3600',
          })
          if (!retry.error) {
            const { data } = admin.storage.from('avatars').getPublicUrl(path)
            publicUrl = data.publicUrl
            storageError = null
          } else {
            storageError = retry.error.message
          }
        }
      } else {
        const { data } = admin.storage.from('avatars').getPublicUrl(path)
        publicUrl = data.publicUrl
      }
    } catch (e) {
      storageError = e instanceof Error ? e.message : 'storage unavailable'
    }

    // 2) Fallback: store compressed data URL in profiles (works without Storage bucket)
    if (!publicUrl) {
      if (buffer.length > 400_000) {
        return NextResponse.json(
          {
            error:
              storageError ||
              'Storage সেটআপ নেই। ছবি আরও ছোট করে চেষ্টা করো, অথবা Supabase-এ avatars bucket বানাও।',
          },
          { status: 502 },
        )
      }
      const b64 = buffer.toString('base64')
      publicUrl = `data:${type};base64,${b64}`
    }

    // Update profile (service role preferred, else user session)
    let dbError: string | null = null
    try {
      const admin = createServiceRoleClient()
      const { error } = await admin.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      if (error) dbError = error.message
    } catch {
      const { error } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      if (error) dbError = error.message
    }

    if (dbError) {
      return NextResponse.json({ error: dbError || 'প্রোফাইলে ছবি সেভ হয়নি।' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      publicUrl: publicUrl.startsWith('data:') ? publicUrl : `${publicUrl}?t=${Date.now()}`,
      via: publicUrl.startsWith('data:') ? 'inline' : 'storage',
      storageNote: storageError,
    })
  } catch (e) {
    console.error('[api/profile/avatar]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'আপলোড ব্যর্থ' },
      { status: 500 },
    )
  }
}
