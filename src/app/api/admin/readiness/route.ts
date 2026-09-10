import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/admin/readiness
 * Soft-launch production readiness snapshot for admins (Step 6).
 */
export async function GET() {
  try {
    const auth = await requireRole(['admin'])
    if ('error' in auth) return auth.error

    const { supabase } = auth

    const [
      users,
      students,
      freePending,
      payPending,
      classes,
      subjects,
      chapters,
      lessons,
      publishedLessons,
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'student'),
      supabase
        .from('free_access_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('payment_transactions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase.from('curriculum_classes').select('id', { count: 'exact', head: true }),
      supabase.from('curriculum_subjects').select('id', { count: 'exact', head: true }),
      supabase.from('curriculum_chapters').select('id', { count: 'exact', head: true }),
      supabase.from('curriculum_lessons').select('id', { count: 'exact', head: true }),
      supabase
        .from('curriculum_lessons')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', true)
        .eq('is_active', true),
    ])

    const { data: samplePublished } = await supabase
      .from('curriculum_lessons')
      .select('id')
      .eq('is_published', true)
      .limit(200)

    const lessonIds = (samplePublished ?? []).map((l) => l.id)
    let withBody = 0
    let withoutBody = 0

    if (lessonIds.length > 0) {
      const { data: contents } = await supabase
        .from('lesson_contents')
        .select('lesson_id, main_content, overview')
        .in('lesson_id', lessonIds)

      const byLesson = new Map((contents ?? []).map((c) => [c.lesson_id, c] as const))
      for (const id of lessonIds) {
        const c = byLesson.get(id)
        const has =
          Boolean(c?.main_content && String(c.main_content).trim()) ||
          Boolean(c?.overview && String(c.overview).trim())
        if (has) withBody += 1
        else withoutBody += 1
      }
    }

    const env = {
      supabase_url: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
      supabase_anon: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
      ),
      service_role: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
      ai: process.env.GROQ_API_KEY?.trim()
        ? 'groq'
        : process.env.GEMINI_API_KEY?.trim()
          ? 'gemini'
          : 'none',
      app_url: process.env.NEXT_PUBLIC_APP_URL || null,
      sentry: Boolean(
        process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim(),
      ),
      payment_mode: 'manual' as const,
    }

    const counts = {
      users: users.count ?? 0,
      students: students.count ?? 0,
      free_pending: freePending.count ?? 0,
      payment_pending: payPending.count ?? 0,
      classes: classes.count ?? 0,
      subjects: subjects.count ?? 0,
      chapters: chapters.count ?? 0,
      lessons: lessons.count ?? 0,
      published_lessons: publishedLessons.count ?? 0,
      content_with_body: withBody,
      content_without_body: withoutBody,
      content_sampled: lessonIds.length,
    }

    const checks = [
      {
        id: 'env_supabase',
        label: 'Supabase public env',
        ok: env.supabase_url && env.supabase_anon,
        detail:
          env.supabase_url && env.supabase_anon ? 'URL + anon key set' : 'Missing URL or anon key',
      },
      {
        id: 'env_service',
        label: 'Service role key',
        ok: env.service_role,
        detail: env.service_role ? 'Present (server)' : 'Missing SUPABASE_SERVICE_ROLE_KEY',
      },
      {
        id: 'env_ai',
        label: 'AI provider',
        ok: env.ai !== 'none',
        detail: env.ai === 'none' ? 'No GROQ/GEMINI key' : `Using ${env.ai}`,
      },
      {
        id: 'curriculum_data',
        label: 'Curriculum seeded',
        ok: counts.classes > 0 && counts.published_lessons > 0,
        detail:
          counts.classes === 0
            ? 'No classes — run Seed Baseline'
            : `${counts.classes} classes · ${counts.published_lessons} published lessons`,
      },
      {
        id: 'lesson_bodies',
        label: 'Lesson content coverage',
        ok: counts.content_without_body === 0 && counts.content_sampled > 0,
        detail:
          counts.content_sampled === 0
            ? 'No published lessons to sample'
            : `${counts.content_with_body}/${counts.content_sampled} sampled have body` +
              (counts.content_without_body > 0
                ? ` — run Backfill Content (${counts.content_without_body} empty)`
                : ''),
      },
      {
        id: 'ops_queue',
        label: 'Ops queue clear-ish',
        ok: counts.free_pending + counts.payment_pending < 20,
        detail: `${counts.free_pending} free requests · ${counts.payment_pending} pending payments`,
      },
      {
        id: 'monitoring',
        label: 'Error monitoring',
        ok: true,
        detail: env.sentry
          ? 'SENTRY_DSN set — client/server can forward'
          : 'Vercel logs only (optional: set SENTRY_DSN)',
      },
      {
        id: 'payment',
        label: 'Payment mode',
        ok: true,
        detail: 'Manual bKash/Nagad (live gateway deferred)',
      },
    ]

    const blocking = checks.filter((c) => !c.ok)
    const ready = blocking.length === 0

    return NextResponse.json({
      phase: 'soft_launch',
      ready,
      blocking: blocking.map((c) => c.id),
      checks,
      counts,
      env: {
        ...env,
        service_role: env.service_role,
      },
      actions: {
        seed: '/dashboard/admin/curriculum',
        backfill: 'POST /api/admin/curriculum/backfill-contents',
        free_access: '/dashboard/admin/free-access',
        payments: '/dashboard/admin/subscriptions',
        health: '/api/health',
      },
      time: new Date().toISOString(),
    })
  } catch (e) {
    console.error('[admin/readiness]', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
