/**
 * Phase 2.4 — Quiz Performance Engine
 * Uses existing learning_progress.score (0–100).
 */

export type PerformanceBand = "strong" | "medium" | "weak" | "unknown";

export function scoreToBand(score: number | null | undefined): PerformanceBand {
  if (score == null || !Number.isFinite(score)) return "unknown";
  if (score >= 80) return "strong";
  if (score >= 50) return "medium";
  return "weak";
}

export function bandLabelBn(band: PerformanceBand): string {
  switch (band) {
    case "strong":
      return "শক্তিশালী 🟢";
    case "medium":
      return "মাঝারি 🟡";
    case "weak":
      return "দুর্বল 🔴";
    default:
      return "অজানা";
  }
}

export function bandColor(band: PerformanceBand): string {
  switch (band) {
    case "strong":
      return "text-emerald-300 border-emerald-500/40 bg-emerald-500/10";
    case "medium":
      return "text-amber-300 border-amber-500/40 bg-amber-500/10";
    case "weak":
      return "text-red-300 border-red-500/40 bg-red-500/10";
    default:
      return "text-slate-400 border-white/10 bg-white/5";
  }
}

export type LessonPerformance = {
  lesson_id: string;
  title?: string;
  title_bn?: string | null;
  subject_id?: string | null;
  chapter_id?: string | null;
  score: number;
  band: PerformanceBand;
  band_label: string;
  xp_earned?: number | null;
  completed_at?: string | null;
  status?: string | null;
};

export function toLessonPerformance(row: {
  lesson_id: string;
  score?: number | null;
  xp_earned?: number | null;
  completed_at?: string | null;
  status?: string | null;
  subject_id?: string | null;
  chapter_id?: string | null;
  title?: string;
  title_bn?: string | null;
}): LessonPerformance {
  const score = Number(row.score ?? 0);
  const band = scoreToBand(score);
  return {
    lesson_id: row.lesson_id,
    title: row.title,
    title_bn: row.title_bn,
    subject_id: row.subject_id,
    chapter_id: row.chapter_id,
    score,
    band,
    band_label: bandLabelBn(band),
    xp_earned: row.xp_earned,
    completed_at: row.completed_at,
    status: row.status,
  };
}
