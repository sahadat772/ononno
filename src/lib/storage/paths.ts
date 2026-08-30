/**
 * Canonical logical storage paths for curriculum PDFs.
 *
 * Convention (both Supabase and future Google Drive):
 *   curriculum/class-{classNumber}/{subjectSlug}/{fileName}.pdf
 *
 * Business logic MUST use DB ids (class_id, subject_id), not folder names.
 * Paths are for human organization + provider object keys only.
 */

export type CurriculumPathParts = {
  classNumber: number;
  subjectSlug: string;
  fileName?: string;
};

/** Sanitize a single path segment (slug-safe). */
export function sanitizePathSegment(value: string, fallback = "item"): string {
  const cleaned = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return cleaned || fallback;
}

/** Safe PDF file name for storage keys. */
export function sanitizePdfFileName(fileName: string): string {
  const base = fileName.replace(/\.pdf$/i, "");
  const safe = sanitizePathSegment(base, "curriculum");
  return `${safe}.pdf`;
}

/**
 * Prefix for a class + subject folder (no trailing file).
 * Example: curriculum/class-6/bangla
 */
export function buildCurriculumFolderPath(parts: {
  classNumber: number;
  subjectSlug: string;
}): string {
  const classSeg = `class-${Number(parts.classNumber) || 0}`;
  const subjectSeg = sanitizePathSegment(parts.subjectSlug, "subject");
  return `curriculum/${classSeg}/${subjectSeg}`;
}

/**
 * Full object path for a PDF.
 * Example: curriculum/class-6/bangla/bangla.pdf
 */
export function buildCurriculumPdfPath(parts: CurriculumPathParts): string {
  const folder = buildCurriculumFolderPath(parts);
  const file = sanitizePdfFileName(parts.fileName ?? `${parts.subjectSlug}.pdf`);
  return `${folder}/${file}`;
}

/**
 * Legacy UUID-based paths from earlier uploads:
 *   {classId}/{subjectId}/{timestamp}-name.pdf
 * New code should prefer buildCurriculumPdfPath.
 */
export function isLegacyUuidStoragePath(path: string): boolean {
  return !path.startsWith("curriculum/");
}
