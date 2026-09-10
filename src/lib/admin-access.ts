/**
 * Admin / Sub-admin role-based access helpers.
 *
 * - role = 'admin'      → full access (super admin)
 * - role = 'sub_admin'  → only keys listed in profiles.admin_permissions
 */

export const ADMIN_PERMISSIONS = [
  'curriculum',
  'payments',
  'free_access',
  'users',
  'announcements',
  'content',
  'analytics',
  'readiness',
] as const

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number]

export const PERMISSION_META: Record<
  AdminPermission,
  { label: string; labelBn: string; desc: string; href: string; icon: string }
> = {
  curriculum: {
    label: 'Curriculum',
    labelBn: 'কারিকুলাম',
    desc: 'Class, subject, chapter, lesson ও PDF import',
    href: '/dashboard/admin/curriculum',
    icon: '📚',
  },
  payments: {
    label: 'Payments',
    labelBn: 'পেমেন্ট',
    desc: 'Manual payment verify ও subscription',
    href: '/dashboard/admin/subscriptions',
    icon: '💳',
  },
  free_access: {
    label: 'Free Access',
    labelBn: 'ফ্রি অ্যাক্সেস',
    desc: 'এতিম/দরিদ্র আবেদন approve/reject',
    href: '/dashboard/admin/free-access',
    icon: '🤲',
  },
  users: {
    label: 'Users',
    labelBn: 'ব্যবহারকারী',
    desc: 'User list দেখা (role change শুধু super admin)',
    href: '/dashboard/admin/users',
    icon: '👥',
  },
  announcements: {
    label: 'Announcements',
    labelBn: 'ঘোষণা',
    desc: 'Platform announcement পাঠানো',
    href: '/dashboard/admin/announcements',
    icon: '📢',
  },
  content: {
    label: 'Content',
    labelBn: 'কন্টেন্ট',
    desc: 'Content review ও moderation',
    href: '/dashboard/admin/content',
    icon: '📝',
  },
  analytics: {
    label: 'Analytics',
    labelBn: 'অ্যানালিটিক্স',
    desc: 'Learning ও AI analytics',
    href: '/dashboard/admin/learning-analytics',
    icon: '📈',
  },
  readiness: {
    label: 'Readiness',
    labelBn: 'রেডিনেস',
    desc: 'Soft-launch checklist ও ops',
    href: '/dashboard/admin/readiness',
    icon: '🚀',
  },
}

export type ProfileLike = {
  role?: string | null
  admin_permissions?: string[] | null
} | null

export function isSuperAdmin(profile: ProfileLike): boolean {
  return profile?.role === 'admin'
}

export function isStaffAdmin(profile: ProfileLike): boolean {
  return profile?.role === 'admin' || profile?.role === 'sub_admin'
}

export function normalizePermissions(raw: unknown): AdminPermission[] {
  if (!Array.isArray(raw)) return []
  const set = new Set(ADMIN_PERMISSIONS)
  return raw.filter((p): p is AdminPermission => typeof p === 'string' && set.has(p as AdminPermission))
}

export function getPermissions(profile: ProfileLike): AdminPermission[] {
  if (!profile) return []
  if (profile.role === 'admin') return [...ADMIN_PERMISSIONS]
  if (profile.role !== 'sub_admin') return []
  return normalizePermissions(profile.admin_permissions)
}

export function canAccess(profile: ProfileLike, permission: AdminPermission): boolean {
  if (profile?.role === 'admin') return true
  if (profile?.role !== 'sub_admin') return false
  return getPermissions(profile).includes(permission)
}

/** Map admin path segment → required permission */
export function permissionForPath(pathname: string): AdminPermission | null {
  if (pathname.includes('/curriculum') || pathname.includes('/content')) return 'curriculum'
  if (pathname.includes('/subscriptions')) return 'payments'
  if (pathname.includes('/free-access')) return 'free_access'
  if (pathname.includes('/users')) return 'users'
  if (pathname.includes('/announcements')) return 'announcements'
  if (pathname.includes('/learning-analytics') || pathname.includes('/analytics')) return 'analytics'
  if (pathname.includes('/readiness')) return 'readiness'
  return null
}
