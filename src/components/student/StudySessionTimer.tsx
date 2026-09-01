'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'ononno_active_study_session'

export type StoredStudySession = {
  sessionId: string
  plannedMinutes: number
  subjectId?: string
  chapterId?: string
  lessonId?: string
}

export function saveActiveStudySession(data: StoredStudySession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export function clearActiveStudySession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function readActiveStudySession(): StoredStudySession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredStudySession
  } catch {
    return null
  }
}

function formatClock(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

type Props = {
  /** Prefer explicit session from URL; falls back to localStorage */
  sessionId?: string | null
  compact?: boolean
}

export default function StudySessionTimer({ sessionId: propSessionId, compact }: Props) {
  const [sessionId, setSessionId] = useState<string | null>(propSessionId ?? null)
  const [plannedMinutes, setPlannedMinutes] = useState(15)
  const [status, setStatus] = useState<string>('active')
  const [actualSeconds, setActualSeconds] = useState(0)
  const [tick, setTick] = useState(0)
  const [busy, setBusy] = useState(false)
  const [visible, setVisible] = useState(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hbRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearLocal = () => {
    if (tickRef.current) clearInterval(tickRef.current)
    if (hbRef.current) clearInterval(hbRef.current)
    tickRef.current = null
    hbRef.current = null
  }

  const callAction = useCallback(
    async (
      id: string,
      action: 'heartbeat' | 'pause' | 'resume' | 'complete',
      delta?: number,
    ) => {
      const res = await fetch(`/api/student/study-sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, delta_seconds: delta }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error)
      if (data.session) {
        setStatus(data.session.status)
        setActualSeconds(data.session.actual_seconds ?? 0)
        if (data.session.planned_minutes) {
          setPlannedMinutes(data.session.planned_minutes)
        }
      }
      return data
    },
    [],
  )

  const startTicks = useCallback(() => {
    clearLocal()
    setTick(0)
    tickRef.current = setInterval(() => setTick((t) => t + 1), 1000)
    hbRef.current = setInterval(() => {
      void (async () => {
        const id = sessionId || readActiveStudySession()?.sessionId
        if (!id) return
        try {
          await callAction(id, 'heartbeat', 15)
          setTick(0)
        } catch {
          /* ignore */
        }
      })()
    }, 15000)
  }, [callAction, sessionId])

  useEffect(() => {
    const stored = readActiveStudySession()
    const id = propSessionId || stored?.sessionId || null
    if (!id) {
      setVisible(false)
      return
    }
    setSessionId(id)
    if (stored?.plannedMinutes) setPlannedMinutes(stored.plannedMinutes)
    setVisible(true)

    void (async () => {
      try {
        const res = await fetch(`/api/student/study-sessions/${id}`)
        const data = await res.json()
        if (res.ok && data.session) {
          setStatus(data.session.status)
          setActualSeconds(data.session.actual_seconds ?? 0)
          setPlannedMinutes(data.session.planned_minutes ?? 15)
          if (data.session.status === 'active') startTicks()
          if (data.session.status === 'completed' || data.session.status === 'abandoned') {
            clearActiveStudySession()
            setVisible(false)
          }
        }
      } catch {
        /* keep local */
        startTicks()
      }
    })()

    return () => clearLocal()
  }, [propSessionId, startTicks])

  if (!visible || !sessionId) return null

  const display = status === 'active' ? actualSeconds + tick : actualSeconds
  const pct = Math.min(100, Math.round((display / Math.max(plannedMinutes * 60, 1)) * 100))

  const onPause = async () => {
    setBusy(true)
    try {
      if (tick > 0) await callAction(sessionId, 'heartbeat', Math.min(tick, 120))
      setTick(0)
      await callAction(sessionId, 'pause')
      clearLocal()
    } catch {
      /* ignore */
    } finally {
      setBusy(false)
    }
  }

  const onResume = async () => {
    setBusy(true)
    try {
      await callAction(sessionId, 'resume')
      startTicks()
    } catch {
      /* ignore */
    } finally {
      setBusy(false)
    }
  }

  const onComplete = async () => {
    setBusy(true)
    try {
      if (status === 'active' && tick > 0) {
        await callAction(sessionId, 'heartbeat', Math.min(tick, 120))
        setTick(0)
      }
      await callAction(sessionId, 'complete')
      clearLocal()
      clearActiveStudySession()
      setVisible(false)
    } catch {
      /* ignore */
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className={`sticky top-0 z-50 border-b border-emerald-500/30 bg-[#0a1a14]/95 backdrop-blur-xl ${
        compact ? 'px-3 py-2' : 'px-4 py-3'
      }`}
    >
      <div className="max-w-2xl mx-auto flex flex-wrap items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-lg">{status === 'paused' ? '⏸' : '⏱'}</span>
          <div className="min-w-0">
            <p className="font-black tabular-nums text-emerald-300 text-lg leading-none">
              {formatClock(display)}
            </p>
            <p className="text-[10px] text-white/40 truncate">
              Planned {plannedMinutes}ম · {pct}% · live tracking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {status === 'active' ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onPause()}
              className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-200"
            >
              পজ
            </button>
          ) : status === 'paused' ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onResume()}
              className="rounded-lg border border-sky-500/40 bg-sky-500/15 px-2.5 py-1 text-xs font-bold text-sky-200"
            >
              চালাও
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void onComplete()}
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-200"
          >
            শেষ
          </button>
          <Link
            href="/dashboard/student/learning-path"
            className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-white/50 hover:text-white"
          >
            Plan
          </Link>
        </div>
        <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-emerald-400 to-teal-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
