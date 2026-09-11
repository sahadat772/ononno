/**
 * Bangla spelling / light grammar check via Groq.
 * Standard: Bangla Academy style where possible; keeps meaning unchanged.
 */

export type SpellIssue = {
  original: string
  suggestion: string
  reason: string
}

export type SpellCheckResult = {
  original: string
  corrected: string
  issues: SpellIssue[]
  summary: string
  hasChanges: boolean
}

export const SPELL_MAX_CHARS_STUDENT = 2500
export const SPELL_MAX_CHARS_ADMIN = 12000

export function spellSystemPrompt(): string {
  return `তুমি বাংলা বানান ও হালকা ব্যাকরণ সহকারী (ONONNO শিক্ষা প্ল্যাটফর্ম)।
মান: বাংলা একাডেমি / আধুনিক মান্য বাংলা যতদূর সম্ভব।

কাজ:
1. শুধু বানান ও স্পষ্ট টাইপো/ব্যাকরণ ভুল ঠিক করো।
2. অর্থ, টোন, বিষয়বস্তু বদলাবে না।
3. ইংরেজি শব্দ/নাম/সংখ্যা অপ্রয়োজনে পরিবর্তন করো না।
4. NCTB পাঠ্যশৈলী রাখো যদি লেখা শিক্ষামূলক হয়।

আউটপুট শুধু valid JSON (কোনো markdown নয়):
{
  "corrected": "পুরো শুদ্ধ লেখা",
  "issues": [
    { "original": "ভুল শব্দ/অংশ", "suggestion": "ঠিক রূপ", "reason": "সংক্ষিপ্ত কারণ বাংলায়" }
  ],
  "summary": "১–২ বাক্যে কী কী ঠিক করা হয়েছে"
}

ভুল না থাকলে issues খালি অ্যারে ও corrected = মূল লেখার কাছাকাছি।`
}

export function parseSpellJson(raw: string): Omit<SpellCheckResult, 'original' | 'hasChanges'> {
  let t = (raw || '').trim()
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start >= 0 && end > start) t = t.slice(start, end + 1)

  let data: {
    corrected?: string
    issues?: Array<{ original?: string; suggestion?: string; reason?: string }>
    summary?: string
  }
  try {
    data = JSON.parse(t)
  } catch {
    return {
      corrected: raw.trim(),
      issues: [],
      summary: 'JSON parse ব্যর্থ — কাঁচা উত্তর দেখানো হলো।',
    }
  }

  const issues: SpellIssue[] = Array.isArray(data.issues)
    ? data.issues
        .map((i) => ({
          original: String(i?.original ?? '').trim(),
          suggestion: String(i?.suggestion ?? '').trim(),
          reason: String(i?.reason ?? '').trim() || 'বানান/ব্যাকরণ',
        }))
        .filter((i) => i.original && i.suggestion)
        .slice(0, 40)
    : []

  return {
    corrected: String(data.corrected ?? '').trim() || '',
    issues,
    summary:
      String(data.summary ?? '').trim() ||
      (issues.length ? `${issues.length}টি সংশোধন` : 'বড় কোনো ভুল পাওয়া যায়নি'),
  }
}
