export const curriculumSourceStatuses = [
  "uploaded",
  "extracting",
  "extracted",
  "reviewed",
  "archived",
] as const;

export const curriculumContentStatuses = [
  "draft",
  "extracted",
  "reviewed",
  "generating",
  "generated",
  "approved",
  "published",
  "archived",
] as const;

export type CurriculumSourceStatus = (typeof curriculumSourceStatuses)[number];
export type CurriculumContentStatus = (typeof curriculumContentStatuses)[number];

export type PageRange = { pageStart: number; pageEnd: number };

export type ExtractedLessonMap = PageRange & {
  title: string;
  titleBn: string;
  lessonNumber: number;
};

export type ExtractedChapterMap = PageRange & {
  title: string;
  titleBn: string;
  chapterNumber: number;
  lessons: ExtractedLessonMap[];
};

export type CurriculumImportRun = {
  id: string;
  sourceId: string;
  status: CurriculumSourceStatus;
  model: string;
  chapters: ExtractedChapterMap[];
  createdAt: string;
};
