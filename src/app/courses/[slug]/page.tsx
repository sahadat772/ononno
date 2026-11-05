import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { BookOpen, ChevronLeft, Search, Users } from 'lucide-react'
import SiteFooter from '@/components/shared/SiteFooter'
import {
  getAllCourseSlugs,
  getCourseBySlug,
  getRelatedCourses,
} from '@/lib/courses-catalog'
import CourseCurriculum from '@/components/marketing/CourseCurriculum'

export function generateStaticParams() {
  return getAllCourseSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = getCourseBySlug(slug)
  if (!course) return { title: 'Course | অনন্য' }
  return {
    title: `${course.titleBn} | অনন্য ONONNO`,
    description: course.summary,
  }
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = getCourseBySlug(slug)
  if (!course) notFound()

  const related = getRelatedCourses(slug)
  const totalLessons = course.chapters.reduce((n, ch) => n + ch.lessons.length, 0)

  return (
    <main className="min-h-screen bg-white text-slate-800">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center gap-3 px-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src="/icons/logo-icon.png" alt="অনন্য" width={40} height={40} className="rounded-lg" />
            <div className="hidden min-[400px]:block">
              <p className="text-base font-black leading-none tracking-tight text-slate-900">
                অনন্য <span className="text-pink-500">ONONNO</span>
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Learn anything, online or offline
              </p>
            </div>
          </Link>

          <div className="mx-auto hidden max-w-md flex-1 items-stretch overflow-hidden rounded-md border border-slate-200 lg:flex">
            <span className="flex w-full items-center px-3 text-sm text-slate-400">Search for anything</span>
            <span className="grid w-12 place-items-center bg-pink-500 text-white">
              <Search className="h-4 w-4" />
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <a href="/login" className="inline-flex items-center gap-1 rounded-md px-2.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Users className="hidden h-4 w-4 sm:block" /> Login
            </a>
            <a
              href="/register"
              className="rounded-md bg-pink-500 px-3 py-2 text-sm font-bold text-white hover:bg-pink-600 sm:px-4"
            >
              Register
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href="/#popular"
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-pink-600"
        >
          <ChevronLeft className="h-4 w-4" /> সব কোর্স
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{course.titleBn}</h1>
          <a
            href="/register"
            className="inline-flex shrink-0 items-center justify-center rounded-sm bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
          >
            Buy This Course »
          </a>
        </div>

        <div className="mb-10 grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="overflow-hidden rounded-sm border-2 border-violet-300 bg-white shadow-sm">
            <div className={`px-3 py-2 text-center text-sm font-bold text-white ${course.badgeColor}`}>
              {course.badge}
            </div>
            <div className="flex h-48 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-7xl">
              {course.emoji}
            </div>
            <div className="border-t border-slate-100 p-3 text-center text-xs font-semibold text-slate-600">
              {course.shortTitle}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-700 sm:text-2xl">
              {course.shortTitle}{' '}
              <span className="font-normal text-blue-600">({course.titleBn})</span>
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-700">Lesson : {course.lessonsCount}</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{course.summary}</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              অনন্য-এর এই কোর্সটি NCTB ও কিডস লার্নিং ফ্লো অনুসারে সাজানো। Published লেসন, কুইজ ও
              progress — যাতে শিক্ষার্থী নিরাপদে নিজের গতিতে শিখতে পারে।
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="/register" className="rounded-sm bg-pink-500 px-4 py-2 text-sm font-bold text-white hover:bg-pink-600">
                Register & Start
              </a>
              <a href="/login" className="rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                Login
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-8">
            <section className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-semibold text-blue-700">Course Description:</h3>
              <h4 className="mt-2 text-base font-bold text-slate-900">
                {course.titleEn} ({course.titleBn})
              </h4>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                {course.description.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <h4 className="font-bold text-slate-900">এই কোর্সের বৈশিষ্ট্য</h4>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                  <li>
                    <span className="font-semibold">ধরন:</span> {course.type}
                  </li>
                  <li>
                    <span className="font-semibold">সংস্করণ:</span> {course.language}
                  </li>
                  <li>
                    <span className="font-semibold">মোট অধ্যায়:</span> {course.chapters.length}
                  </li>
                  <li>
                    <span className="font-semibold">মোট লেসন:</span> {totalLessons} (ক্যাটালগ)
                  </li>
                </ul>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <h4 className="font-bold text-slate-900">এই কোর্সটি কেন আপনার জন্য?</h4>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                  {course.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ol>
              </div>
            </section>

            <section className="rounded-sm border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <BookOpen className="h-4 w-4 text-pink-500" />
                  পাঠ্যক্রম{' '}
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {totalLessons} Lessons
                  </span>
                </h3>
              </div>
              <CourseCurriculum chapters={course.chapters} />
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-center text-sm font-semibold text-blue-700">Course Prerequisite</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                {course.prerequisites.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-pink-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-center text-sm font-semibold text-blue-700">Course Information</h3>
              <dl className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between gap-2 border-b border-slate-50 pb-2">
                  <dt className="text-slate-500">Total Lesson</dt>
                  <dd className="font-semibold">{course.lessonsCount}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-slate-50 pb-2">
                  <dt className="text-slate-500">Total Attended</dt>
                  <dd className="font-semibold">{course.enrolled}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-slate-50 pb-2">
                  <dt className="text-slate-500">Is Certificate Available</dt>
                  <dd className="font-semibold">{course.certificate ? 'Yes' : 'No'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Language</dt>
                  <dd className="font-semibold">{course.language}</dd>
                </div>
              </dl>
            </div>

            <a
              href="/register"
              className="flex w-full items-center justify-center rounded-sm bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700"
            >
              Buy This Course »
            </a>

            {related.length > 0 && (
              <div className="overflow-hidden rounded-sm border border-slate-200 shadow-sm">
                <div className="bg-sky-500 px-4 py-2.5 text-center text-sm font-bold text-white">Related Courses</div>
                <ul className="divide-y divide-slate-100 bg-white">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/courses/${r.slug}`}
                        className="flex items-center gap-3 px-3 py-3 transition hover:bg-slate-50"
                      >
                        <span className="grid size-12 shrink-0 place-items-center rounded bg-slate-100 text-2xl">{r.emoji}</span>
                        <span className="text-sm font-semibold text-slate-800">{r.titleBn}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}
