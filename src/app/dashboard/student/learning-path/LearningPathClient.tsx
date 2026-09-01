'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { STUDY_TIME_PRESETS, MIN_STUDY_MINUTES } from '@/lib/study-session'

interface Props {
  studentId: string
  studentName: string
  classLevel: string
}

type ClassOpt = { id: string; name: string; class_number: number }
type SubjectOpt = { id: string; name: string; name_bn: string; class_id: string }
type ChapterOpt = {
  id: string
  title: string
  title_bn: string
  subject_id: string
  chapter_number: number
}
type LessonOpt = {
  id: string
  title: string
  title_bn?: string
  duration_minutes?: number
  chapter_id: string
  subject_id: string
}

type PlanItem = {
  lesson_id: string
  title: string
  title_bn?: string | null
  item_type: string
  planned_minutes: number
  position: number
}

const typeLabel: Record<string, string> = {
  lesson: '📖 পাঠ',
  review: '🧠 রিভিউ',
  quiz: '✍️ কুইজ',
  summary: '📊 সারসংক্ষেপ',
}

function formatClock(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

export default function LearningPathClient({ studentName, classLevel }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<'time' | 'scope' | 'plan' | 'active' | 'done'>('time')
  const [minutes, setMinutes] = useState(15)
  const [customMin, setCustomMin] = useState('')
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [chapterId, setChapterId] = useState('')
  const [classes, setClasses] = useState<ClassOpt[]>([])
  const [subjects, setSubjects] = useState<SubjectOpt[]>([])
  const [chapters, setChapters] = useState<ChapterOpt[]>([])
  const [lessons, setLessons] = useState<LessonOpt[]>([])
  const [loadingOpts, setLoadingOpts] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState<PlanItem[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [plannedMinutes, setPlannedMinutes] = useState(15)
  const [sessionStatus, setSessionStatus] = useState<string>('planned')
  const [actualSeconds, setActualSeconds] = useState(0)
  const [tick, setTick] = useState(0)
  const [actionBusy, setActionBusy] = useState(false)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const localTickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadOptions = useCallback(async (params: {
    class_id?: string
    subject_id?: string
    chapter_id?: string
  }) => {
    setLoadingOpts(true)
    setError(null)
    try {
      const q = new URLSearchParams()
      if (params.class_id) q.set('class_id', params.class_id)
      if (params.subject_id) q.set('subject_id', params.subject_id)
      if (params.chapter_id) q.set('chapter_id', params.chapter_id)
      const res = await fetch(`/api/student/study-planner/options?${q}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Load failed')
      setClasses(data.classes ?? [])
      setSubjects(data.subjects ?? [])
      setChapters(data.chapters ?? [])
      setLessons(data.lessons ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Options load ব্যর্থ')
    } finally {
      setLoadingOpts(false)
    }
  }, [])

  useEffect(() => {
    void loadOptions({})
  }, [loadOptions])

  const filteredSubjects = useMemo(
    () => (classId ? subjects.filter((s) => s.class_id === classId) : subjects),
    [subjects, classId],
  )

  const filteredChapters = useMemo(
    () =>
      subjectId ? chapters.filter((c) => c.subject_id === subjectId) : chapters,
    [chapters, subjectId],
  )

  const filteredLessons = useMemo(() => {
    let list = lessons
    if (subjectId) list = list.filter((l) => l.subject_id === subjectId)
    if (chapterId) list = list.filter((l) => l.chapter_id === chapterId)
    return list
  }, [lessons, subjectId, chapterId])

  const effectiveMinutes = useMemo(() => {
    if (customMin) {
      const n = parseInt(customMin, 10)
      if (Number.isFinite(n)) return Math.max(MIN_STUDY_MINUTES, n)
    }
    return minutes
  }, [minutes, customMin])

  const displaySeconds =
    sessionStatus === 'active' ? actualSeconds + tick : actualSeconds

  const plannedSec = plannedMinutes * 60
  const progressPct = Math.min(100, Math.round((displaySeconds / Math.max(plannedSec, 1)) * 100))

  const clearTimers = () => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current)
    if (localTickRef.current) clearInterval(localTickRef.current)
    heartbeatRef.current = null
    localTickRef.current = null
  }

  useEffect(() => () => clearTimers(), [])

  const callAction = async (
    action: 'start' | 'pause' | 'resume' | 'heartbeat' | 'complete' | 'abandon',
    delta?: number,
  ) => {
    if (!sessionId) return null
    const res = await fetch(`/api/student/study-sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        delta_seconds: delta,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || data.error || 'Action failed')
    if (data.session) {
      setSessionStatus(data.session.status)
      setActualSeconds(data.session.actual_seconds ?? 0)
    }
    return data
  }

  const startLocalTick = () => {
    if (localTickRef.current) clearInterval(localTickRef.current)
    setTick(0)
    localTickRef.current = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)
  }

  const startHeartbeat = () => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current)
    heartbeatRef.current = setInterval(() => {
      void (async () => {
        try {
          // flush local tick into server every 15s
          const delta = 15
          await callAction('heartbeat', delta)
          setTick(0)
        } catch {
          // ignore transient
        }
      })()
    }, 15000)
  }

  const goScope = () => {
    if (effectiveMinutes < MIN_STUDY_MINUTES) {
      setError(`কমপক্ষে ${MIN_STUDY_MINUTES} মিনিট বেছে নাও`)
      return
    }
    setError(null)
    setStep('scope')
  }

  const createSession = async () => {
    if (!subjectId) {
      setError('Subject বেছে নাও')
      return
    }
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/student/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planned_minutes: effectiveMinutes,
          class_id: classId || null,
          subject_id: subjectId,
          chapter_id: chapterId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Create failed')
      setPlan(data.plan ?? [])
      setSessionId(data.session?.id ?? null)
      setPlannedMinutes(data.session?.planned_minutes ?? effectiveMinutes)
      setSessionStatus(data.session?.status ?? 'planned')
      setActualSeconds(0)
      setTick(0)
      setStep('plan')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Session তৈরি ব্যর্থ')
    } finally {
      setCreating(false)
    }
  }

  const beginSession = async () => {
    if (!sessionId) return
    setActionBusy(true)
    setError(null)
    try {
      await callAction('start')
      setTick(0)
      startLocalTick()
      startHeartbeat()
      setStep('active')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Start ব্যর্থ')
    } finally {
      setActionBusy(false)
    }
  }

  const pauseSession = async () => {
    setActionBusy(true)
    try {
      // flush remaining tick
      if (tick > 0) {
        await callAction('heartbeat', Math.min(tick, 120))
        setTick(0)
      }
      await callAction('pause')
      clearTimers()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pause ব্যর্থ')
    } finally {
      setActionBusy(false)
    }
  }

  const resumeSession = async () => {
    setActionBusy(true)
    try {
      await callAction('resume')
      setTick(0)
      startLocalTick()
      startHeartbeat()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Resume ব্যর্থ')
    } finally {
      setActionBusy(false)
    }
  }

  const completeSession = async () => {
    setActionBusy(true)
    try {
      if (sessionStatus === 'active' && tick > 0) {
        await callAction('heartbeat', Math.min(tick, 120))
        setTick(0)
      }
      await callAction('complete')
      clearTimers()
      setStep('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Complete ব্যর্থ')
    } finally {
      setActionBusy(false)
    }
  }

  const openLesson = () => {
    const firstLesson = plan.find((p) => p.item_type === 'lesson')
    if (!firstLesson) return
    const les = lessons.find((l) => l.id === firstLesson.lesson_id)
    const ch = chapterId || les?.chapter_id
    const sub = subjectId || les?.subject_id
    if (sub && ch) {
      window.open(
        `/dashboard/student/academic/learn/class-1/${sub}/${ch}/${firstLesson.lesson_id}`,
        '_blank',
      )
    }
  }

  const onBack = () => {
    if (step === 'time') router.push('/dashboard/student')
    else if (step === 'scope') setStep('time')
    else if (step === 'plan') setStep('scope')
    else if (step === 'active' || step === 'done') setStep('plan')
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-sm md:text-base">
              📚 আজকের পড়ার পরিকল্পনা
            </h1>
            <p className="text-white/40 text-xs">
              Timer · published only · min {MIN_STUDY_MINUTES}m · {classLevel}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-violet-500/30 bg-linear-to-r from-violet-600/20 to-purple-600/20 p-5"
        >
          <p className="font-bold text-lg">আস-সালামু আলাইকুম, {studentName}! 👋</p>
          <p className="text-white/60 text-sm mt-1">
            সময় বেছে নাও → plan → টাইমার চালিয়ে পড়ো। Planned ও Actual আলাদা track হয়।
          </p>
        </motion.div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {step === 'time' && (
          <section className="space-y-4">
            <h2 className="font-semibold">আজ কতক্ষণ পড়তে চাও?</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {STUDY_TIME_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMinutes(m)
                    setCustomMin('')
                  }}
                  className={`rounded-2xl border py-3 font-bold transition ${
                    !customMin && minutes === m
                      ? 'border-violet-400 bg-violet-500/20 text-violet-200'
                      : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {m} মি
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs text-white/50">নিজের মতো (≥{MIN_STUDY_MINUTES})</label>
              <input
                type="number"
                min={MIN_STUDY_MINUTES}
                max={240}
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                placeholder={`যেমন ${MIN_STUDY_MINUTES}, 20, 40...`}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-violet-400"
              />
            </div>
            <p className="text-sm text-violet-300">নির্বাচিত: {effectiveMinutes} মিনিট</p>
            <button
              type="button"
              onClick={goScope}
              className="w-full py-4 rounded-2xl bg-linear-to-r from-violet-500 to-purple-600 font-bold text-lg"
            >
              পরবর্তী → Subject বেছে নাও
            </button>
          </section>
        )}

        {step === 'scope' && (
          <section className="space-y-4">
            <p className="text-sm text-white/50">সময়: {effectiveMinutes} মিনিট</p>
            {loadingOpts && <p className="text-white/40 text-sm">লোড হচ্ছে...</p>}

            <div>
              <label className="text-xs text-white/50">Class (ঐচ্ছিক)</label>
              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value)
                  setSubjectId('')
                  setChapterId('')
                  void loadOptions({ class_id: e.target.value || undefined })
                }}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-[#12122a] px-4 py-3"
              >
                <option value="">সব / বেছে নাও</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/50">Subject *</label>
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value)
                  setChapterId('')
                  void loadOptions({
                    class_id: classId || undefined,
                    subject_id: e.target.value || undefined,
                  })
                }}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-[#12122a] px-4 py-3"
              >
                <option value="">-- Subject --</option>
                {filteredSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_bn || s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/50">Chapter (ঐচ্ছিক)</label>
              <select
                value={chapterId}
                onChange={(e) => {
                  setChapterId(e.target.value)
                  void loadOptions({
                    class_id: classId || undefined,
                    subject_id: subjectId || undefined,
                    chapter_id: e.target.value || undefined,
                  })
                }}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-[#12122a] px-4 py-3"
              >
                <option value="">সব chapter</option>
                {filteredChapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title_bn || c.title}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-white/40">
              Available published lessons: {filteredLessons.length}
            </p>

            <button
              type="button"
              disabled={creating || !subjectId}
              onClick={() => void createSession()}
              className="w-full py-4 rounded-2xl bg-linear-to-r from-violet-500 to-purple-600 font-bold text-lg disabled:opacity-50"
            >
              {creating ? 'Plan তৈরি হচ্ছে...' : 'Study Plan তৈরি করো ✨'}
            </button>
          </section>
        )}

        {step === 'plan' && (
          <section className="space-y-4">
            <h2 className="font-semibold">তোমার Session Plan</h2>
            <p className="text-sm text-white/50">
              Planned: {plannedMinutes} মিনিট · {plan.length} ধাপ
            </p>
            <div className="space-y-2">
              {plan.map((item) => (
                <div
                  key={`${item.position}-${item.item_type}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 flex justify-between gap-3"
                >
                  <div>
                    <p className="text-xs text-violet-300">
                      {typeLabel[item.item_type] || item.item_type}
                    </p>
                    <p className="font-semibold">{item.title_bn || item.title}</p>
                  </div>
                  <span className="text-sm text-white/40 shrink-0">
                    ⏱ {item.planned_minutes} মি
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              disabled={actionBusy || !sessionId}
              onClick={() => void beginSession()}
              className="w-full py-4 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 font-bold text-lg disabled:opacity-50"
            >
              {actionBusy ? 'শুরু হচ্ছে...' : 'টাইমার চালিয়ে পড়া শুরু 🚀'}
            </button>
            <button
              type="button"
              onClick={() => setStep('time')}
              className="w-full py-3 rounded-2xl border border-white/10 text-white/70"
            >
              নতুন plan
            </button>
          </section>
        )}

        {step === 'active' && (
          <section className="space-y-5">
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
              <p className="text-xs text-emerald-300/80 mb-2">
                {sessionStatus === 'paused' ? '⏸ পজ' : '▶️ চলছে'}
              </p>
              <p className="text-5xl font-black tracking-tight tabular-nums">
                {formatClock(displaySeconds)}
              </p>
              <p className="mt-2 text-sm text-white/50">
                Planned {plannedMinutes} মি · Actual {formatClock(displaySeconds)}
              </p>
              <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-emerald-400 to-teal-400 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-white/40 mt-2">{progressPct}% of plan</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {sessionStatus === 'active' ? (
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() => void pauseSession()}
                  className="py-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-200 font-bold"
                >
                  ⏸ পজ
                </button>
              ) : (
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() => void resumeSession()}
                  className="py-3 rounded-2xl border border-sky-500/40 bg-sky-500/10 text-sky-200 font-bold"
                >
                  ▶️ চালিয়ে যাও
                </button>
              )}
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => void completeSession()}
                className="py-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-200 font-bold"
              >
                ✅ সম্পন্ন
              </button>
            </div>

            <button
              type="button"
              onClick={openLesson}
              className="w-full py-4 rounded-2xl bg-linear-to-r from-violet-500 to-purple-600 font-bold"
            >
              পাঠ খুলো (নতুন ট্যাব) 📖
            </button>

            <div className="space-y-2">
              {plan.map((item) => (
                <div
                  key={`${item.position}-${item.item_type}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm flex justify-between"
                >
                  <span>
                    {typeLabel[item.item_type]} · {item.title_bn || item.title}
                  </span>
                  <span className="text-white/40">{item.planned_minutes}ম</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {step === 'done' && (
          <section className="text-center space-y-4">
            <p className="text-5xl">🎉</p>
            <h2 className="text-xl font-bold text-emerald-300">Session সম্পন্ন!</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/40">Planned</p>
                <p className="text-2xl font-bold">{plannedMinutes} মি</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/40">Actual</p>
                <p className="text-2xl font-bold">{formatClock(actualSeconds)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                clearTimers()
                setSessionId(null)
                setPlan([])
                setStep('time')
              }}
              className="w-full py-4 rounded-2xl bg-linear-to-r from-violet-500 to-purple-600 font-bold"
            >
              নতুন session
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/student')}
              className="w-full py-3 rounded-2xl border border-white/10 text-white/70"
            >
              Dashboard ←
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
