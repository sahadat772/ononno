import type {
  CurriculumContentStatus,
  CurriculumSourceStatus,
} from "@/types/curriculum-import";

const sourceTransitions: Record<CurriculumSourceStatus, CurriculumSourceStatus[]> = {
  uploaded: ["extracting", "archived"],
  extracting: ["extracted", "uploaded", "archived"],
  extracted: ["reviewed", "archived"],
  reviewed: ["archived"],
  archived: [],
};

const contentTransitions: Record<CurriculumContentStatus, CurriculumContentStatus[]> = {
  draft: ["extracted", "archived"],
  extracted: ["reviewed", "archived"],
  reviewed: ["generating", "draft", "archived"],
  generating: ["generated", "reviewed"],
  generated: ["approved", "reviewed", "archived"],
  approved: ["published", "reviewed", "archived"],
  published: ["archived", "reviewed"],
  archived: [],
};

export function canTransitionSource(
  from: CurriculumSourceStatus,
  to: CurriculumSourceStatus,
) {
  return sourceTransitions[from].includes(to);
}

export function canTransitionContent(
  from: CurriculumContentStatus,
  to: CurriculumContentStatus,
) {
  return contentTransitions[from].includes(to);
}

export function assertContentTransition(
  from: CurriculumContentStatus,
  to: CurriculumContentStatus,
) {
  if (!canTransitionContent(from, to)) {
    throw new Error(`Invalid curriculum content transition: ${from} → ${to}`);
  }
}
