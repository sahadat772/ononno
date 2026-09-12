/**
 * Profile completeness / "health" score for ONONNO users.
 * Register collects only essentials; rest comes from Complete Profile.
 */

export type ProfileLike = {
  full_name?: string | null
  email?: string | null
  phone?: string | null
  avatar_url?: string | null
  address?: string | null
  bio?: string | null
  date_of_birth?: string | null
  religion?: string | null
  role?: string | null
}

export type StudentExtra = {
  class_level?: string | null
  gender?: string | null
  school_name?: string | null
}

export type HealthItem = {
  key: string
  label: string
  done: boolean
  weight: number
}

export function buildProfileHealthItems(
  profile: ProfileLike | null | undefined,
  extra?: StudentExtra | null,
): HealthItem[] {
  const role = profile?.role || 'student'
  const items: HealthItem[] = [
    { key: 'full_name', label: 'পূর্ণ নাম', done: !!(profile?.full_name && profile.full_name.trim().length >= 2), weight: 15 },
    { key: 'email', label: 'ইমেইল', done: !!(profile?.email && profile.email.includes('@')), weight: 15 },
    { key: 'phone', label: 'মোবাইল নম্বর', done: !!(profile?.phone && String(profile.phone).replace(/\D/g, '').length >= 10), weight: 15 },
    { key: 'avatar', label: 'প্রোফাইল ছবি', done: !!(profile?.avatar_url && profile.avatar_url.length > 5), weight: 15 },
    { key: 'dob', label: 'জন্ম তারিখ', done: !!profile?.date_of_birth, weight: 10 },
    { key: 'address', label: 'ঠিকানা', done: !!(profile?.address && profile.address.trim().length >= 4), weight: 10 },
    { key: 'bio', label: 'সংক্ষিপ্ত পরিচিতি', done: !!(profile?.bio && profile.bio.trim().length >= 10), weight: 10 },
  ]

  if (role === 'student') {
    items.push(
      { key: 'class', label: 'শ্রেণি / ক্লাস', done: !!(extra?.class_level), weight: 15 },
      { key: 'gender', label: 'লিঙ্গ', done: !!(extra?.gender), weight: 5 },
    )
  }

  if (role === 'parent') {
    items.push({
      key: 'phone_priority',
      label: 'যোগাযোগ নম্বর (অভিভাবক)',
      done: !!(profile?.phone && String(profile.phone).replace(/\D/g, '').length >= 10),
      weight: 5,
    })
  }

  return items
}

export function scoreProfileHealth(items: HealthItem[]): {
  score: number
  filled: number
  total: number
  label: string
  color: string
} {
  const totalWeight = items.reduce((s, i) => s + i.weight, 0) || 1
  const doneWeight = items.filter((i) => i.done).reduce((s, i) => s + i.weight, 0)
  const score = Math.round((doneWeight / totalWeight) * 100)
  const filled = items.filter((i) => i.done).length
  const total = items.length

  let label = 'শুরু করুন'
  let color = 'rose'
  if (score >= 90) {
    label = 'সম্পূর্ণ'
    color = 'emerald'
  } else if (score >= 70) {
    label = 'ভালো'
    color = 'sky'
  } else if (score >= 40) {
    label = 'আংশিক'
    color = 'amber'
  } else if (score > 0) {
    label = 'অসম্পূর্ণ'
    color = 'orange'
  }

  return { score, filled, total, label, color }
}
