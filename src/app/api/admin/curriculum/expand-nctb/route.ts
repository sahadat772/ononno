import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { audit } from '@/lib/audit'
import { rateLimit, rateLimitDefaults } from '@/lib/rateLimiter'
import {
  buildNctbSeed,
  SEED_VERSION,
  LEGACY_SEED_SLUGS,
} from '@/lib/curriculum-seed'
import { buildDemoLessonBody } from '@/lib/lesson-demo-content'

/**
 * POST /api/admin/curriculum/expand-nctb
 * Idempotent: adds missing NCTB subjects/chapters/lessons for Class 1–8
 */
export async function POST() {
  try {
    const auth = await requireRole(['admin'])
    if ('error' in auth) return auth.error

    const rateError = await rateLimit(
      `admin-expand-nctb:${auth.user.id}`,
      rateLimitDefaults.adminAI,
    )
    if (rateError) return rateError

    const { supabase } = auth

    let versionId: string | null = null
    const { data: active } = await supabase
      .from('curriculum_versions')
      .select('id, slug')
      .eq('is_active', true)
      .maybeSingle()

    if (active?.id) {
      versionId = active.id
      await supabase
        .from('curriculum_versions')
        .update({
          name: SEED_VERSION.name,
          description: SEED_VERSION.description,
          status: 'published',
        })
        .eq('id', versionId)
    } else {
      const { data: bySlug } = await supabase
        .from('curriculum_versions')
        .select('id')
        .in('slug', LEGACY_SEED_SLUGS)
        .limit(1)
        .maybeSingle()

      if (bySlug?.id) {
        versionId = bySlug.id
        await supabase
          .from('curriculum_versions')
          .update({
            is_active: true,
            slug: SEED_VERSION.slug,
            name: SEED_VERSION.name,
            description: SEED_VERSION.description,
            status: 'published',
          })
          .eq('id', versionId)
      } else {
        const { data: ver, error: verErr } = await supabase
          .from('curriculum_versions')
          .insert({
            slug: SEED_VERSION.slug,
            name: SEED_VERSION.name,
            year: SEED_VERSION.year,
            description: SEED_VERSION.description,
            status: SEED_VERSION.status,
            is_active: true,
          })
          .select('id')
          .single()
        if (verErr || !ver) {
          return NextResponse.json(
            { error: 'Version তৈরি ব্যর্থ', detail: verErr?.message },
            { status: 500 },
          )
        }
        versionId = ver.id
      }
    }

    const seedClasses = buildNctbSeed([1, 2, 3, 4, 5, 6, 7, 8])
    const summary = {
      versionId,
      classesCreated: 0,
      subjectsAdded: 0,
      chaptersAdded: 0,
      lessonsAdded: 0,
      contentsAdded: 0,
    }

    for (const cls of seedClasses) {
      let classId: string
      const { data: existingClass } = await supabase
        .from('curriculum_classes')
        .select('id')
        .eq('version_id', versionId)
        .eq('slug', cls.slug)
        .maybeSingle()

      if (existingClass?.id) {
        classId = existingClass.id
        await supabase
          .from('curriculum_classes')
          .update({
            name: cls.name,
            description: cls.description,
            is_active: true,
          })
          .eq('id', classId)
      } else {
        const { data: createdClass, error: classErr } = await supabase
          .from('curriculum_classes')
          .insert({
            version_id: versionId,
            name: cls.name,
            slug: cls.slug,
            class_number: cls.classNumber,
            description: cls.description,
            is_active: true,
            sort_order: cls.classNumber,
          })
          .select('id')
          .single()
        if (classErr || !createdClass) {
          console.error('[expand-nctb] class', cls.slug, classErr)
          continue
        }
        classId = createdClass.id
        summary.classesCreated += 1
      }

      for (let si = 0; si < cls.subjects.length; si++) {
        const sub = cls.subjects[si]
        let subjectId: string
        const { data: existingSub } = await supabase
          .from('curriculum_subjects')
          .select('id')
          .eq('class_id', classId)
          .eq('slug', sub.slug)
          .maybeSingle()

        if (existingSub?.id) {
          subjectId = existingSub.id
          await supabase
            .from('curriculum_subjects')
            .update({
              name: sub.name,
              name_bn: sub.nameBn,
              icon: sub.icon,
              color: sub.color,
              is_mandatory: sub.isMandatory,
              is_active: true,
            })
            .eq('id', subjectId)
        } else {
          const { data: createdSub, error: subErr } = await supabase
            .from('curriculum_subjects')
            .insert({
              class_id: classId,
              name: sub.name,
              name_bn: sub.nameBn,
              slug: sub.slug,
              description: `${sub.nameBn} — ${cls.name}`,
              icon: sub.icon,
              color: sub.color,
              is_mandatory: sub.isMandatory,
              is_active: true,
              order_index: si + 1,
            })
            .select('id')
            .single()
          if (subErr || !createdSub) {
            console.error('[expand-nctb] subject', sub.slug, subErr)
            continue
          }
          subjectId = createdSub.id
          summary.subjectsAdded += 1
        }

        for (let ci = 0; ci < sub.chapters.length; ci++) {
          const ch = sub.chapters[ci]
          let chapterId: string
          const { data: existingCh } = await supabase
            .from('curriculum_chapters')
            .select('id')
            .eq('subject_id', subjectId)
            .eq('slug', ch.slug)
            .maybeSingle()

          if (existingCh?.id) {
            chapterId = existingCh.id
            await supabase
              .from('curriculum_chapters')
              .update({ is_active: true, title: ch.title, title_bn: ch.titleBn })
              .eq('id', chapterId)
          } else {
            const { data: createdCh, error: chErr } = await supabase
              .from('curriculum_chapters')
              .insert({
                subject_id: subjectId,
                class_id: classId,
                title: ch.title,
                title_bn: ch.titleBn,
                slug: ch.slug,
                description: ch.description,
                chapter_number: ci + 1,
                is_active: true,
                order_index: ci + 1,
              })
              .select('id')
              .single()
            if (chErr || !createdCh) {
              console.error('[expand-nctb] chapter', ch.slug, chErr)
              continue
            }
            chapterId = createdCh.id
            summary.chaptersAdded += 1
          }

          for (let li = 0; li < ch.lessons.length; li++) {
            const les = ch.lessons[li]
            const { data: existingLes } = await supabase
              .from('curriculum_lessons')
              .select('id')
              .eq('chapter_id', chapterId)
              .eq('slug', les.slug)
              .maybeSingle()

            if (existingLes?.id) {
              await supabase
                .from('curriculum_lessons')
                .update({
                  is_published: true,
                  is_active: true,
                  workflow_status: 'published',
                  title: les.title,
                  title_bn: les.titleBn,
                })
                .eq('id', existingLes.id)
              continue
            }

            const { data: createdLes, error: lesErr } = await supabase
              .from('curriculum_lessons')
              .insert({
                chapter_id: chapterId,
                subject_id: subjectId,
                class_id: classId,
                title: les.title,
                title_bn: les.titleBn,
                slug: les.slug,
                description: les.description,
                lesson_number: li + 1,
                duration_minutes: les.durationMinutes,
                xp_reward: les.xpReward,
                coin_reward: 5,
                is_free_preview: li === 0,
                is_published: true,
                is_active: true,
                order_index: li + 1,
                workflow_status: 'published',
              })
              .select('id')
              .single()

            if (lesErr || !createdLes) {
              console.error('[expand-nctb] lesson', les.slug, lesErr)
              continue
            }
            summary.lessonsAdded += 1

            const body = buildDemoLessonBody({
              title: les.title,
              titleBn: les.titleBn,
              description: les.description,
              subjectHint: `${sub.slug} ${ch.slug} ${les.slug}`,
              isQuiz: /quiz/i.test(les.slug) || /কুইজ/.test(les.titleBn),
            })
            const { error: contentErr } = await supabase.from('lesson_contents').insert({
              lesson_id: createdLes.id,
              overview: body.overview,
              objectives: body.objectives,
              main_content: body.main_content,
              examples: body.examples,
              summary: body.summary,
              extra_notes: body.extra_notes,
              quiz_questions: body.quiz_questions,
            })
            if (!contentErr) summary.contentsAdded += 1
          }
        }
      }
    }

    await audit('EXPAND_NCTB_CURRICULUM', auth.user.id, summary)

    return NextResponse.json({
      success: true,
      message:
        'NCTB expand সম্পন্ন — Class 1–8 subject/chapter/lesson যোগ (পুরনো ডেটা মুছে যায়নি)',
      summary,
      tip: 'Student: Academic → মাধ্যমিক → ষষ্ঠ শ্রেণি → গণিত → সংখ্যা পদ্ধতি / পূর্ণসংখ্যা',
    })
  } catch (e) {
    console.error('[expand-nctb]', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  const auth = await requireRole(['admin'])
  if ('error' in auth) return auth.error

  const seed = buildNctbSeed([1, 2, 3, 4, 5, 6, 7, 8])
  const subjects = seed.find((c) => c.classNumber === 6)?.subjects.map((s) => s.nameBn) ?? []
  const lessonCount = seed.reduce(
    (acc, c) =>
      acc +
      c.subjects.reduce(
        (a, s) => a + s.chapters.reduce((b, ch) => b + ch.lessons.length, 0),
        0,
      ),
    0,
  )

  return NextResponse.json({
    version: SEED_VERSION,
    classes: seed.map((c) => c.slug),
    subjectsSampleClass6: subjects,
    totalLessonsInSeed: lessonCount,
    endpoint: 'POST /api/admin/curriculum/expand-nctb',
  })
}
