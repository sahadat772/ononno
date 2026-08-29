/**
 * Page-range field mapping for curriculum chapters/lessons.
 * Canonical application fields: page_start, page_end
 * Legacy/migration DB fields: source_page_start, source_page_end
 */
export type PageRange = {
  page_start: number | null;
  page_end: number | null;
};

export function resolvePageRange(row: {
  page_start?: number | null;
  page_end?: number | null;
  source_page_start?: number | null;
  source_page_end?: number | null;
}): PageRange {
  return {
    page_start: row.page_start ?? row.source_page_start ?? null,
    page_end: row.page_end ?? row.source_page_end ?? null,
  };
}

export function pageRangeWritePayload(
  pageStart?: number | null,
  pageEnd?: number | null,
): {
  page_start: number | null;
  page_end: number | null;
  source_page_start: number | null;
  source_page_end: number | null;
} {
  const start = pageStart ?? null;
  const end = pageEnd ?? null;
  return {
    page_start: start,
    page_end: end,
    source_page_start: start,
    source_page_end: end,
  };
}
