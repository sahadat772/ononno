import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { audit } from '@/lib/audit'
import { rateLimit, rateLimitDefaults } from '@/lib/rateLimiter'
import { buildPrimarySeed, SEED_VERSION } from '@/lib/curriculum-seed'
import { buildDemoLessonBody } from '@/lib/lesson-demo-content'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(['admin'])
    if ('error' in auth) return auth.error

    const rateError = await rateLimit(
      `admin-curriculum-seed:${auth.user.id}`,
      rateLimitDefaults.adminAI,
    )
    if (rateError) return rateError

    let force = false
    try {
      const body = await req.json()
      force = Boolean(body?.force)
    } catch {
      /* empty body ok */
    }

    const { supabase } = auth

    const { count: classCount } = await supabase
      .from('curriculum_classes')
      .select('id', { count: 'exact', head: true })

    if ((classCount ?? 0) > 0 && !force) {
      return NextResponse.json(
        {
          error:
            'ইতিমধ্যে curriculum classes আছে। নতুন করে seed করতে চাইলে force: true পাঠাও (সাবধানে)।',
          classCount,
        },
        { status: 409 },
      )
    }

    let versionId: string
    const { data: existingVersion } = await supabase
      .from('curriculum_versions')
      .select('id')
      .eq('slug', SEED_VERSION.slug)
      .maybeSingle()

    if (existingVersion?.id) {
      versionId = existingVersion.id
      await supabase
        .from('curriculum_versions')
        .update({
          is_active: true,
          status: 'published',
          name: SEED_VERSION.name,
          description: SEED_VERSION.description,
        })
        .eq('id', versionId)
      await supabase.from('curriculum_versions').update({ is_active: false }).neq('id', versionId)
    } else {
      await supabase.from('curriculum_versions').update({ is_active: false }).eq('is_active', true)

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
        console.error('Seed version error:', verErr)
        return NextResponse.json(
          { error: 'Version তৈরি করা যায়নি', detail: verErr?.message },
          { status: 500 },
        )
      }
      versionId = ver.id
    }

    const seedClasses = buildPrimarySeed([1, 2, 3, 4, 5])
    const summary = {
      versionId,
      classes: 0,
      subjects: 0,
      chapters: 0,
      lessons: 0,
      skippedClasses: [] as string[],
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
        summary.skippedClasses.push(cls.slug)
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
          console.error('Seed class error:', cls.slug, classErr)
          continue
        }
        classId = createdClass.id
        summary.classes += 1
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
            console.error('Seed subject error:', sub.slug, subErr)
            continue
          }
          subjectId = createdSub.id
          summary.subjects += 1
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
              console.error('Seed chapter error:', ch.slug, chErr)
              continue
            }
            chapterId = createdCh.id
            summary.chapters += 1
          }

          for (let li = 0; li < ch.lessons.length; li++) {
            const les = ch.lessons[li]
            const { data: existingLes } = await supabase
              .from('curriculum_lessons')
              .select('id')
              .eq('chapter_id', chapterId)
              .eq('slug', les.slug)
              .maybeSingle()

            if (existingLes?.id) continue

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
                order_index: li + 1,
                workflow_status: 'published',
              })
              .select('id')
              .single()

            if (lesErr || !createdLes) {
              console.error('Seed lesson error:', les.slug, lesErr)
              continue
            }
            summary.lessons += 1

            const body = buildDemoLessonBody({
              title: les.title,
              titleBn: les.titleBn,
              description: les.description,
              subjectHint: `${ch.slug} ${les.slug}`,
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
            if (contentErr) {
              console.error('Seed lesson_contents error:', les.slug, contentErr)
            }
          }
        }
      }
    }

    await audit('SEED_CURRICULUM', auth.user.id, summary)

    return NextResponse.json({
      success: true,
      message: 'Baseline curriculum seed সম্পন্ন',
      summary,
    })
  } catch (error) {
    console.error('Curriculum seed error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const auth = await requireRole(['admin'])
    if ('error' in auth) return auth.error

    const { supabase } = auth

    const [classes, subjects, chapters, lessons, versions] = await Promise.all([
      supabase.from('curriculum_classes').select('id', { count: 'exact', head: true }),
      supabase.from('curriculum_subjects').select('id', { count: 'exact', head: true }),
      supabase.from('curriculum_chapters').select('id', { count: 'exact', head: true }),
      supabase.from('curriculum_lessons').select('id', { count: 'exact', head: true }),
      supabase
        .from('curriculum_versions')
        .select('id, name, slug, is_active, status')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const seed = buildPrimarySeed([1, 2, 3, 4, 5])
    const expectedLessons = seed.reduce(
      (n, c) =>
        n +
        c.subjects.reduce(
          (m, s) => m + s.chapters.reduce((k, ch) => k + ch.lessons.length, 0),
          0,
        ),
      0,
    )

    return NextResponse.json({
      current: {
        classes: classes.count ?? 0,
        subjects: subjects.count ?? 0,
        chapters: chapters.count ?? 0,
        lessons: lessons.count ?? 0,
        versions: versions.data ?? [],
      },
      seedPreview: {
        version: SEED_VERSION,
        classes: seed.length,
        subjectsPerClass: seed[0]?.subjects.length ?? 0,
        expectedLessons,
      },
      canSeedSafely: (classes.count ?? 0) === 0,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
