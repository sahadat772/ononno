import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { rateLimit, rateLimitDefaults } from '@/lib/rateLimiter'
import { chat, isGroqConfigured } from '@/lib/groq'
import {
  parseSpellJson,
  spellSystemPrompt,
  SPELL_MAX_CHARS_ADMIN,
  SPELL_MAX_CHARS_STUDENT,
  type SpellCheckResult,
} from '@/lib/bangla-spell'

/**
 * POST /api/tools/bangla-spell
 * Body: { text: string }
 * Roles: student | admin | parent | teacher
 */
export async function POST(req: NextRequest) {
  const auth = await requireRole(['student', 'admin', 'parent', 'teacher'])
  if ('error' in auth) return auth.error

  const rateError = await rateLimit(
    `bangla-spell:${auth.user.id}`,
    rateLimitDefaults.adminAI,
  )
  if (rateError) return rateError

  if (!isGroqConfigured()) {
    return NextResponse.json(
      {
        error: 'AI_NOT_CONFIGURED',
        message: 'GROQ_API_KEY configured নেই। Vercel env চেক করো।',
      },
      { status: 500 },
    )
  }

  let body: { text?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 })
  }

  const text = String(body.text ?? '').trim()
  if (!text) {
    return NextResponse.json(
      { error: 'VALIDATION', message: 'টেক্সট লিখুন।' },
      { status: 400 },
    )
  }

  const max =
    auth.role === 'admin' ? SPELL_MAX_CHARS_ADMIN : SPELL_MAX_CHARS_STUDENT
  if (text.length > max) {
    return NextResponse.json(
      {
        error: 'TOO_LONG',
        message: `টেক্সট খুব লম্বা (সর্বোচ্চ ${max} অক্ষর)।`,
      },
      { status: 400 },
    )
  }

  try {
    const raw = await chat(
      [
        {
          role: 'user',
          content: `নিচের বাংলা লেখার বানান/টাইপো যাচাই করে শুদ্ধ করো:\n\n---\n${text}\n---`,
        },
      ],
      {
        systemPrompt: spellSystemPrompt(),
        temperature: 0.1,
        maxTokens: 4096,
        json: true,
      },
    )

    const parsed = parseSpellJson(raw)
    const corrected = parsed.corrected || text
    const result: SpellCheckResult = {
      original: text,
      corrected,
      issues: parsed.issues,
      summary: parsed.summary,
      hasChanges: corrected.replace(/\s+/g, ' ') !== text.replace(/\s+/g, ' '),
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[bangla-spell]', msg)
    return NextResponse.json(
      {
        error: 'SPELL_FAILED',
        message: 'বানান চেক ব্যর্থ। একটু পর আবার চেষ্টা করুন।',
        details: msg.slice(0, 300),
      },
      { status: 500 },
    )
  }
}
