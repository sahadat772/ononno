'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type LessonContent = {
  overview?: string | null
  main_content?: string | null
  summary?: string | null
  examples?: string[] | null
  extra_notes?: string | null
  quiz_questions?: { question: string; options: string[]; correct: number; explanation: string }[] | null
}

export default function LessonContentPage() {
  const params = useParams()
  const search = useSearchParams()
  const classSlug = params.classSlug as string
  const subjectId = params.subjectId as string
  const chapterId = params.chapterId as string
  const lessonId = params.lessonId as string
  const preview = search.get('preview') === '1'

  const [title, setTitle] = useState('')
  const [content, setContent] = useState<LessonContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [isAdminPreview, setIsAdminPreview] = useState(false)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setErr(null)
      try {
        const supabase = createClient()
        let allowUnpublished = false
        if (preview) {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            const { data: prof } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .maybeSingle()
            allowUnpublished = prof?.role === 'admin' || prof?.role === 'teacher'
            setIsAdminPreview(allowUnpublished)
          }
        }

        let q = supabase
          .from('curriculum_lessons')
          .select(
            'id, title, title_bn, duration_minutes, xp_reward, is_published, lesson_contents(overview, main_content, summary, examples, extra_notes, quiz_questions)',
          )
          .eq('id', lessonId)

        if (!allowUnpublished) {
          q = q.eq('is_published', true)
        }

        const { data, error } = await q.maybeSingle()
        if (error) {
          setErr(error.message)
          return
        }
        if (!data) {
          setErr(
            allowUnpublished
              ? 'পাঠ পাওয়া যায়নি'
              : 'পাঠ publish করা নেই বা পাওয়া যায়নি — Admin থেকে Publish করুন',
          )
          return
        }

        setTitle(data.title_bn || data.title || 'পাঠ')
        const raw = data.lesson_contents as LessonContent | LessonContent[] | null
        setContent(Array.isArray(raw) ? raw[0] ?? null : raw)
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'লোড ব্যর্থ')
      } finally {
        setLoading(false)
      }
    })()
  }, [lessonId, preview])

  const body = [
    content?.overview,
    content?.main_content,
    content?.summary,
    content?.extra_notes,
  ]
    .filter(Boolean)
    .join('\n\n')

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/dashboard/admin/curriculum/lessons"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300"
          >
            ← Admin Lessons
          </Link>
          <Link
            href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300"
          >
            Chapter
          </Link>
          {isAdminPreview && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-200">
              Admin preview
            </span>
          )}
        </div>

        {loading && <p className="text-slate-400">লোড হচ্ছে…</p>}
        {err && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {err}
          </div>
        )}

        {!loading && !err && (
          <>
            <h1 className="text-2xl font-black md:text-3xl">{title}</h1>
            <div className="rounded-2xl border border-white/10 bg-[#12122a] p-5 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
              {body || 'কনটেন্ট এখনো generate হয়নি। Admin থেকে Generate করুন।'}
            </div>
            {content?.examples && content.examples.length > 0 && (
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                <p className="mb-2 text-xs font-bold text-violet-300">উদাহরণ</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
                  {content.examples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(content?.quiz_questions) && content!.quiz_questions!.length > 0 && (
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
                <p className="mb-2 text-xs font-bold text-sky-300">
                  কুইজ ({content!.quiz_questions!.length}টি) — full interactive quiz পরে restore
                </p>
                <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
                  {content!.quiz_questions!.slice(0, 5).map((q, i) => (
                    <li key={i}>{q.question}</li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
