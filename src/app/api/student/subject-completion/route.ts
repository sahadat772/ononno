import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  evaluateSubjectForUser,
  tryUnlockNextClass,
} from '@/lib/evaluate-class-completion-server'

export async function GET(req: NextRequest) {
  const subjectId = req.nextUrl.searchParams.get('subjectId')
  if (!subjectId) {
    return NextResponse.json({ error: 'subjectId required' }, { status: 400 })
  }
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await evaluateSubjectForUser(supabase, user.id, subjectId)
  return NextResponse.json({ ok: true, subject: result })
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      subjectId?: string
      tryUnlock?: boolean
    }
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let subject = null
    if (body.subjectId) {
      subject = await evaluateSubjectForUser(supabase, user.id, body.subjectId)
    }

    let unlock = null
    if (body.tryUnlock !== false) {
      unlock = await tryUnlockNextClass(supabase, user.id)
    }

    return NextResponse.json({
      ok: true,
      subject,
      unlock: unlock
        ? {
            unlocked: unlock.unlocked,
            next: unlock.next,
            previous: unlock.previous,
            message: unlock.message,
            classCompletion: unlock.classCompletion,
          }
        : null,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 },
    )
  }
}
