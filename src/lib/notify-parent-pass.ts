/** Client: notify parents after lesson exam pass (best-effort). */
export function notifyParentOnLessonPass(opts: {
  scorePercent: number
  lessonTitle?: string
  lessonId?: string
}) {
  try {
    void fetch('/api/push/parent-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    })
  } catch {
    /* ignore */
  }
}
