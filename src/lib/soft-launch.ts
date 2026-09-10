/**
 * Soft-launch product policy (Step 7).
 * Tune free tier without a full paywall for beta users.
 */

export const SOFT_LAUNCH = {
  /** Public beta flag — shown on student hub */
  enabled: true,
  phase: 'soft_launch' as const,
  /** Free users: lessons they can complete per calendar day */
  freeLessonsPerDay: Math.max(
    1,
    Number.parseInt(process.env.NEXT_PUBLIC_SOFT_LAUNCH_FREE_LESSONS || '5', 10) || 5,
  ),
  taglineBn: 'সফট লঞ্চ · সীমিত বেটা',
  freeHintBn: 'ফ্রি প্ল্যানে প্রতিদিন কয়েকটি পাঠ — পূর্ণ অ্যাক্সেসের জন্য সাবস্ক্রিপশন',
}

export function freeLessonsRemaining(todayCompleted: number): number {
  return Math.max(0, SOFT_LAUNCH.freeLessonsPerDay - todayCompleted)
}
