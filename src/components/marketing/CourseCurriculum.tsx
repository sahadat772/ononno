'use client'

import { useState } from 'react'
import { ChevronDown, Eye, Lock } from 'lucide-react'
import type { CourseChapter } from '@/lib/courses-catalog'

export default function CourseCurriculum({ chapters }: { chapters: CourseChapter[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(chapters.map((c, i) => [c.id, i === 0])),
  )

  const expandAll = () => {
    setOpen(Object.fromEntries(chapters.map((c) => [c.id, true])))
  }
  const collapseAll = () => {
    setOpen(Object.fromEntries(chapters.map((c) => [c.id, false])))
  }

  return (
    <div>
      <div className="flex gap-2 border-b border-slate-100 px-4 py-2">
        <button
          type="button"
          onClick={expandAll}
          className="rounded-sm bg-sky-500 px-3 py-1 text-xs font-bold text-white hover:bg-sky-600"
        >
          + Show All
        </button>
        <button
          type="button"
          onClick={collapseAll}
          className="rounded-sm bg-slate-400 px-3 py-1 text-xs font-bold text-white hover:bg-slate-500"
        >
          − Close All
        </button>
      </div>

      <ul className="divide-y divide-slate-100">
        {chapters.map((ch) => {
          const isOpen = open[ch.id]
          return (
            <li key={ch.id}>
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [ch.id]: !o[ch.id] }))}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-50"
              >
                <span className="text-sm font-bold text-slate-800">
                  {ch.title}{' '}
                  <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {ch.lessons.length} Lessons
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <ul className="border-t border-slate-50 bg-slate-50/50">
                  {ch.lessons.map((lesson, idx) => (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5 last:border-0"
                    >
                      <span className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="text-xs font-semibold text-slate-400">
                          {idx + 1}.
                        </span>
                        {lesson.title}
                      </span>
                      {lesson.sample ? (
                        <a
                          href="/register"
                          className="inline-flex items-center gap-1 rounded-sm bg-pink-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-pink-600"
                        >
                          <Eye className="h-3 w-3" /> নমুনা দেখুন
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                          <Lock className="h-3 w-3" /> লক
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
