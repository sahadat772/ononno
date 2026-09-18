/**
 * Temporary letter → emoji icon map for Kids Zone.
 * Replace with real image URLs later (lesson.storyImage / letterImage).
 */

export const BN_LETTER_ICONS: Record<string, string> = {
  অ: '🐍',
  আ: '🥭',
  ই: '🐟',
  ঈ: '🎉',
  উ: '🐪',
  ঊ: '🌅',
  ঋ: '🧙',
  এ: '🎸',
  ঐ: '👁️',
  ও: '🌊',
  ঔ: '💊',
  ক: '🍌',
  খ: '🛏️',
  গ: '🐄',
  ঘ: '🏠',
  ঙ: '🔔',
  চ: '🌙',
  ছ: '☂️',
  জ: '🚢',
  ঝ: '🌧️',
  ঞ: '⭐',
  ট: '🍅',
  ঠ: '🥁',
  ড: '🥜',
  ঢ: '🥁',
  ণ: '💎',
  ত: '🍉',
  থ: '🍽️',
  দ: '🚪',
  ধ: '🌾',
  ন: '⛵',
  প: '🐦',
  ফ: '🌸',
  ব: '🐯',
  ভ: '🐻',
  ম: '🐟',
  য: '🚶',
  র: '🚀',
  ল: '🔴',
  শ: '🪷',
  ষ: '🐂',
  স: '🐍',
  হ: '🐘',
  ড়: '🚗',
  ঢ়: '🥒',
  য়: '➡️',
  ৎ: '✨',
  'ং': '🔔',
  'ঃ': '💨',
  'ঁ': '〰️',
}

export const EN_LETTER_ICONS: Record<string, string> = {
  A: '🍎',
  B: '⚽',
  C: '🐱',
  D: '🐶',
  E: '🐘',
  F: '🐟',
  G: '🐐',
  H: '🏠',
  I: '🍦',
  J: '🧃',
  K: '🪁',
  L: '🦁',
  M: '🐒',
  N: '🥜',
  O: '🍊',
  P: '🐧',
  Q: '👑',
  R: '🌈',
  S: '☀️',
  T: '🌳',
  U: '☂️',
  V: '🎻',
  W: '🌊',
  X: '❌',
  Y: '🟡',
  Z: '🦓',
}

export function letterIcon(letter: string, fallbackEmoji?: string): string {
  const t = (letter || '').trim()
  if (!t) return fallbackEmoji || '📘'
  if (BN_LETTER_ICONS[t]) return BN_LETTER_ICONS[t]
  const up = t.toUpperCase()
  if (EN_LETTER_ICONS[up]) return EN_LETTER_ICONS[up]
  return fallbackEmoji || '✨'
}
