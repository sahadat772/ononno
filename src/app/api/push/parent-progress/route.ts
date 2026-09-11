import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notifyParentsOfStudent } from '@/lib/push-notify'
import { isLessonExamPassed } from '@/lib/curriculum-unlock'

/**
 * POST /api/push/parent-progress
 * Student calls after lesson exam pass (or lesson complete).
 * Body: { lessonTitle?, scorePercent, chapterTitle?, subjectTitle?, lessonId? }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const score = Number(body.scorePercent)
    const passed = isLessonExamPassed(score)

    if (!passed && body.force !== true) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: 'score_below_pass',
      })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()

    const childName = profile?.full_name?.split(' ')[0] || 'সন্তান'
    const lesson =
      (body.lessonTitle as string) ||
      (body.lessonTitleBn as string) ||
      'একটি পাঠ'
    const scoreLabel = Number.isFinite(score) ? `${Math.round(score)}%` : ''

    const title = passed
      ? `${childName} পাঠ পরীক্ষা পাস করেছে ✅`
      : `${childName} পাঠ সম্পন্ন করেছে`
    const text = passed
      ? `「${lesson}」· স্কোর ${scoreLabel} · পরের পাঠ আনলক হতে পারে`
      : `「${lesson}」সম্পন্ন${scoreLabel ? ` · ${scoreLabel}` : ''}`

    const url = `/dashboard/parent/child/${user.id}`

    const result = await notifyParentsOfStudent(user.id, {
      title,
      body: text,
      url,
      tag: 'parent-progress',
    })

    return NextResponse.json({ ok: true, push: result })
  } catch (e) {
    console.error('parent-progress push', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'error' },
      { status: 500 },
    )
  }
}
