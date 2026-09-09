import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { audit } from '@/lib/audit'
import { rateLimit, rateLimitDefaults } from '@/lib/rateLimiter'
import { buildDemoLessonBody } from '@/lib/lesson-demo-content'

/**
 * POST /api/admin/curriculum/backfill-contents
 * Fills lesson_contents for published lessons that have no body yet.
 * Safe for existing production DB (does not delete lessons).
 */
export async function POST() {
  try {
    const auth = await requireRole(['admin'])
    if ('error' in auth) return auth.error

    const rateError = await rateLimit(
      `admin-curriculum-backfill:${auth.user.id}`,
      rateLimitDefaults.adminAI,
    )
    if (rateError) return rateError

    const { supabase } = auth

    const { data: lessons, error } = await supabase
      .from('curriculum_lessons')
      .select('id, title, title_bn, description, slug, is_published')
      .eq('is_published', true)
      .limit(500)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let filled = 0
    let skipped = 0
    let failed = 0

    for (const les of lessons ?? []) {
      const { data: existing } = await supabase
        .from('lesson_contents')
        .select('id, main_content, overview')
        .eq('lesson_id', les.id)
        .maybeSingle()

      const hasBody = Boolean(
        (existing?.main_content && String(existing.main_content).trim()) ||
          (existing?.overview && String(existing.overview).trim()),
      )
      if (hasBody) {
        skipped += 1
        continue
      }

      const body = buildDemoLessonBody({
        title: les.title,
        titleBn: les.title_bn || undefined,
        description: les.description || undefined,
        subjectHint: les.slug || '',
        isQuiz: /quiz/i.test(les.slug || '') || /কুইজ/.test(les.title_bn || ''),
      })

      if (existing?.id) {
        const { error: upErr } = await supabase
          .from('lesson_contents')
          .update({
            overview: body.overview,
            objectives: body.objectives,
            main_content: body.main_content,
            examples: body.examples,
            summary: body.summary,
            extra_notes: body.extra_notes,
            quiz_questions: body.quiz_questions,
          })
          .eq('id', existing.id)
        if (upErr) {
          failed += 1
          console.error('backfill update', les.id, upErr)
          continue
        }
      } else {
        const { error: insErr } = await supabase.from('lesson_contents').insert({
          lesson_id: les.id,
          overview: body.overview,
          objectives: body.objectives,
          main_content: body.main_content,
          examples: body.examples,
          summary: body.summary,
          extra_notes: body.extra_notes,
          quiz_questions: body.quiz_questions,
        })
        if (insErr) {
          failed += 1
          console.error('backfill insert', les.id, insErr)
          continue
        }
      }
      filled += 1
    }

    const summary = { filled, skipped, failed, total: lessons?.length ?? 0 }
    await audit('BACKFILL_LESSON_CONTENTS', auth.user.id, summary)

    return NextResponse.json({
      success: true,
      message: 'Empty lesson bodies backfilled with rich demo content',
      summary,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
