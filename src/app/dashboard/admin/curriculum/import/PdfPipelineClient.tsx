"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Upload,
  WandSparkles,
  BookOpen,
  Pencil,
} from "lucide-react";

type CurriculumClass = { id: string; name: string; class_number: number };
type CurriculumSubject = {
  id: string;
  name: string;
  name_bn: string;
  class_id: string;
};

type Source = {
  id: string;
  title: string;
  file_name: string;
  source_status?: string;
  status?: string;
  workflow_status?: string;
  extracted_structure?: ExtractedStructure | null;
};

type ExtractedLesson = {
  title: string;
  titleBn: string;
  lessonNumber?: number;
  pageStart?: number;
  pageEnd?: number;
  included?: boolean;
};

type ExtractedChapter = {
  title: string;
  titleBn: string;
  chapterNumber?: number;
  pageStart?: number;
  pageEnd?: number;
  lessons: ExtractedLesson[];
  included?: boolean;
};

type ExtractedStructure = {
  chapters: ExtractedChapter[];
  totalLessons: number;
  sourceConfidence?: string;
};

type Step = "upload" | "extract" | "review" | "committed";

const STEPS: { id: Step; label: string; hint: string }[] = [
  { id: "upload", label: "1. PDF", hint: "Class + Subject + Upload" },
  { id: "extract", label: "2. Structure", hint: "Gemini TOC extract" },
  { id: "review", label: "3. Chapter to Lesson", hint: "Edit and approve map" },
  { id: "committed", label: "4. Study", hint: "Generate then Publish" },
];

function normalizeStructure(raw: unknown): ExtractedStructure | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const chaptersRaw = Array.isArray(obj.chapters) ? obj.chapters : [];
  if (chaptersRaw.length === 0) return null;
  const chapters: ExtractedChapter[] = chaptersRaw.map((ch, ci) => {
    const c = (ch ?? {}) as Record<string, unknown>;
    const lessonsRaw = Array.isArray(c.lessons) ? c.lessons : [];
    return {
      title: String(c.title ?? c.title_bn ?? `Chapter ${ci + 1}`),
      titleBn: String(c.titleBn ?? c.title_bn ?? c.title ?? `Chapter ${ci + 1}`),
      chapterNumber:
        typeof c.chapterNumber === "number"
          ? c.chapterNumber
          : typeof c.chapter_number === "number"
            ? c.chapter_number
            : ci + 1,
      pageStart:
        typeof c.pageStart === "number"
          ? c.pageStart
          : typeof c.page_start === "number"
            ? c.page_start
            : undefined,
      pageEnd:
        typeof c.pageEnd === "number"
          ? c.pageEnd
          : typeof c.page_end === "number"
            ? c.page_end
            : undefined,
      included: c.included === false ? false : true,
      lessons: lessonsRaw.map((ls, li) => {
        const l = (ls ?? {}) as Record<string, unknown>;
        return {
          title: String(l.title ?? l.title_bn ?? `Lesson ${li + 1}`),
          titleBn: String(l.titleBn ?? l.title_bn ?? l.title ?? `Lesson ${li + 1}`),
          lessonNumber:
            typeof l.lessonNumber === "number"
              ? l.lessonNumber
              : typeof l.lesson_number === "number"
                ? l.lesson_number
                : li + 1,
          pageStart:
            typeof l.pageStart === "number"
              ? l.pageStart
              : typeof l.page_start === "number"
                ? l.page_start
                : undefined,
          pageEnd:
            typeof l.pageEnd === "number"
              ? l.pageEnd
              : typeof l.page_end === "number"
                ? l.page_end
                : undefined,
          included: l.included === false ? false : true,
        };
      }),
    };
  });
  const totalLessons =
    typeof obj.totalLessons === "number"
      ? obj.totalLessons
      : typeof obj.total_lessons === "number"
        ? obj.total_lessons
        : chapters.reduce((n, ch) => n + ch.lessons.length, 0);
  return {
    chapters,
    totalLessons,
    sourceConfidence: String(obj.sourceConfidence ?? obj.source_confidence ?? "medium"),
  };
}

function statusOf(source: Source): string {
  return source.source_status ?? source.status ?? source.workflow_status ?? "uploaded";
}

function apiErrorMessage(data: { error?: string; message?: string }, fallback: string) {
  return data.message || data.error || fallback;
}

function stepIndex(s: Step): number {
  return STEPS.findIndex((x) => x.id === s);
}

export default function PdfPipelineClient({
  classes,
  subjects,
  initialSources,
}: {
  classes: CurriculumClass[];
  subjects: CurriculumSubject[];
  initialSources: Source[];
}) {
  const [step, setStep] = useState<Step>("upload");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [structure, setStructure] = useState<ExtractedStructure | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [commitResult, setCommitResult] = useState<{
    chapterCount: number;
    lessonCount: number;
    skippedChapters?: number;
    skippedLessons?: number;
  } | null>(null);

  const availableSubjects = useMemo(
    () => subjects.filter((s) => !classId || s.class_id === classId),
    [subjects, classId],
  );
  const activeSource = sources.find((s) => s.id === activeSourceId) ?? null;
  const includedChapterCount = structure
    ? structure.chapters.filter((c) => c.included !== false).length
    : 0;
  const includedLessonCount = structure
    ? structure.chapters.reduce(
        (n, ch) =>
          n +
          (ch.included === false
            ? 0
            : ch.lessons.filter((l) => l.included !== false).length),
        0,
      )
    : 0;

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!file || !classId || !subjectId || !title.trim()) {
      setError("Class, Subject, Title and PDF are required.");
      return;
    }
    setBusy("upload");
    setError(null);
    setSuccess(null);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("classId", classId);
      form.set("subjectId", subjectId);
      form.set("title", title.trim());
      form.set("academicYear", "2026");
      const response = await fetch("/api/admin/curriculum/sources", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(data, "PDF upload failed."));
      const uploaded: Source = {
        id: data.id,
        title: data.title ?? title.trim(),
        file_name: data.file_name ?? file.name,
        source_status: data.source_status ?? "uploaded",
        workflow_status: data.workflow_status ?? "draft",
      };
      setSources((prev) => [uploaded, ...prev]);
      setActiveSourceId(uploaded.id);
      setFile(null);
      setSuccess("PDF uploaded. Extract structure next.");
      setStep("extract");
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF upload failed.");
    } finally {
      setBusy(null);
    }
  }

  async function handleExtract(sourceId: string) {
    setBusy(`extract:${sourceId}`);
    setError(null);
    setSuccess(null);
    setCommitResult(null);
    try {
      const response = await fetch(
        `/api/admin/curriculum/sources/${sourceId}/extract-structure`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(data, "Structure extract failed."));
      const normalized =
        normalizeStructure(data.structure) ??
        normalizeStructure({ chapters: data.chapters, totalLessons: data.totalLessons });
      if (!normalized) throw new Error("No chapter/lesson returned.");
      setStructure(normalized);
      setActiveSourceId(sourceId);
      setSources((prev) =>
        prev.map((item) =>
          item.id === sourceId
            ? { ...item, source_status: "extracted", status: "extracted", extracted_structure: normalized }
            : item,
        ),
      );
      setSuccess(`${normalized.chapters.length} chapters, ${normalized.totalLessons} lessons extracted.`);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Structure extract failed.");
    } finally {
      setBusy(null);
    }
  }

  async function handleCommit() {
    if (!activeSourceId || !structure) return;
    const chaptersToCommit = structure.chapters
      .filter((ch) => ch.included !== false)
      .map((ch) => ({ ...ch, lessons: ch.lessons.filter((ls) => ls.included !== false) }))
      .filter((ch) => ch.lessons.length > 0);
    if (chaptersToCommit.length === 0) {
      setError("Select at least one chapter and lesson.");
      return;
    }
    setBusy("commit");
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(
        `/api/admin/curriculum/sources/${activeSourceId}/commit-structure`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            structure: {
              chapters: chaptersToCommit.map((ch) => ({
                title: ch.title,
                titleBn: ch.titleBn,
                title_bn: ch.titleBn,
                chapterNumber: ch.chapterNumber,
                pageStart: ch.pageStart,
                pageEnd: ch.pageEnd,
                page_start: ch.pageStart,
                page_end: ch.pageEnd,
                lessons: ch.lessons.map((ls) => ({
                  title: ls.title,
                  titleBn: ls.titleBn,
                  title_bn: ls.titleBn,
                  lessonNumber: ls.lessonNumber,
                  pageStart: ls.pageStart,
                  pageEnd: ls.pageEnd,
                  page_start: ls.pageStart,
                  page_end: ls.pageEnd,
                })),
              })),
            },
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(data, "Structure commit failed."));
      setCommitResult({
        chapterCount: data.chapterCount ?? 0,
        lessonCount: data.lessonCount ?? 0,
        skippedChapters: data.skippedChapters,
        skippedLessons: data.skippedLessons,
      });
      setSources((prev) =>
        prev.map((item) =>
          item.id === activeSourceId
            ? { ...item, source_status: "reviewed", status: "reviewed", workflow_status: "reviewed" }
            : item,
        ),
      );
      setSuccess("Hierarchy saved. Generate study drafts next.");
      setStep("committed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Structure commit failed.");
    } finally {
      setBusy(null);
    }
  }

  function selectExistingSource(source: Source) {
    setActiveSourceId(source.id);
    setError(null);
    setSuccess(null);
    setCommitResult(null);
    const st = statusOf(source);
    const existing = normalizeStructure(source.extracted_structure);
    if (existing && (st === "extracted" || st === "reviewed")) {
      setStructure(existing);
      setStep(st === "reviewed" ? "committed" : "review");
    } else {
      setStructure(null);
      setStep("extract");
    }
  }

  function updateChapter(chapterIndex: number, patch: Partial<ExtractedChapter>) {
    setStructure((prev) => {
      if (!prev) return prev;
      return { ...prev, chapters: prev.chapters.map((ch, i) => (i === chapterIndex ? { ...ch, ...patch } : ch)) };
    });
  }

  function updateLesson(chapterIndex: number, lessonIndex: number, patch: Partial<ExtractedLesson>) {
    setStructure((prev) => {
      if (!prev) return prev;
      const chapters = prev.chapters.map((ch, i) => {
        if (i !== chapterIndex) return ch;
        return { ...ch, lessons: ch.lessons.map((ls, j) => (j === lessonIndex ? { ...ls, ...patch } : ls)) };
      });
      return { ...prev, chapters, totalLessons: chapters.reduce((n, ch) => n + ch.lessons.length, 0) };
    });
  }

  function startNewUpload() {
    setStep("upload");
    setActiveSourceId(null);
    setStructure(null);
    setCommitResult(null);
    setError(null);
    setSuccess(null);
    setFile(null);
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-emerald-400/25 bg-linear-to-br from-emerald-950/30 to-slate-950/80 p-5 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <FileText className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">PDF to Structure to Chapter to Lesson to Study</h1>
              <p className="mt-1 text-sm text-slate-400">Blueprint pipeline — map chapters/lessons first, then per-lesson study draft.</p>
            </div>
          </div>
          {step !== "upload" && (
            <button type="button" onClick={startNewUpload} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">+ New PDF</button>
          )}
        </div>
        <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, index) => {
            const active = step === s.id;
            const done = stepIndex(step) > index;
            return (
              <li key={s.id} className={`rounded-xl border px-3 py-2.5 text-sm ${active ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200" : done ? "border-white/10 bg-white/5 text-slate-300" : "border-white/5 bg-black/20 text-slate-500"}`}>
                <span className="block font-semibold">{s.label}</span>
                <span className="text-xs opacity-80">{s.hint}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div>}

      {step === "upload" && (
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white"><Upload className="size-4 text-sky-300" />1. PDF Upload</h2>
          <form onSubmit={handleUpload} className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block text-xs text-slate-400">Class
              <select value={classId} onChange={(e) => { setClassId(e.target.value); setSubjectId(""); }} className="mt-1 w-full rounded-lg border border-slate-600 bg-[#0a1020] px-3 py-2.5 text-sm text-white">
                <option value="">-- Select class --</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="block text-xs text-slate-400">Subject
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-600 bg-[#0a1020] px-3 py-2.5 text-sm text-white">
                <option value="">-- Select subject --</option>
                {availableSubjects.map((s) => <option key={s.id} value={s.id}>{s.name_bn || s.name}</option>)}
              </select>
            </label>
            <label className="block text-xs text-slate-400 md:col-span-2">Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. NCTB Class 6 Bangla 2026" className="mt-1 w-full rounded-lg border border-slate-600 bg-[#0a1020] px-3 py-2.5 text-sm text-white" />
            </label>
            <label className="block text-xs text-slate-400 md:col-span-2">PDF file
              <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1 w-full rounded-lg border border-slate-600 bg-[#0a1020] px-3 py-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-emerald-500/20 file:px-3 file:py-1 file:text-emerald-200" />
            </label>
            <button type="submit" disabled={Boolean(busy)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 md:col-span-2">
              {busy === "upload" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Upload PDF
            </button>
          </form>
          {sources.length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="mb-2 text-xs font-semibold text-slate-400">Resume previous source</p>
              <div className="divide-y divide-white/8 rounded-xl border border-white/8">
                {sources.slice(0, 8).map((source) => {
                  const st = statusOf(source);
                  return (
                    <button key={source.id} type="button" onClick={() => selectExistingSource(source)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/5">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-white">{source.title}</span>
                        <span className="text-xs text-slate-500">{source.file_name}</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${st === "reviewed" ? "bg-emerald-400/10 text-emerald-300" : st === "extracted" ? "bg-violet-400/10 text-violet-200" : "bg-sky-400/10 text-sky-300"}`}>{st}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {step === "extract" && (
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white"><WandSparkles className="size-4 text-violet-300" />2. Structure extract</h2>
          <p className="mt-1 text-xs text-slate-500">Gemini extracts table of contents and page ranges only.</p>
          {activeSource ? (
            <div className="mt-4 rounded-xl border border-violet-400/20 bg-violet-500/5 p-4">
              <p className="text-sm font-semibold text-white">{activeSource.title}</p>
              <p className="text-xs text-slate-500">{activeSource.file_name}</p>
              <button type="button" disabled={Boolean(busy)} onClick={() => handleExtract(activeSource.id)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                {busy === `extract:${activeSource.id}` ? <Loader2 className="size-4 animate-spin" /> : <WandSparkles className="size-4" />}
                Extract structure
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No active source. Upload a PDF first.</p>
          )}
          <button type="button" onClick={() => setStep("upload")} className="mt-4 inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
            <ChevronLeft className="size-3.5" /> Back
          </button>
        </div>
      )}

      {step === "review" && structure && (
        <div className="rounded-2xl border border-emerald-400/25 bg-slate-950/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-emerald-300"><Pencil className="size-4" />3. Chapter to Lesson review</h2>
              <p className="mt-1 text-xs text-slate-500">Edit titles and page ranges. Uncheck items to skip.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">Selected: {includedChapterCount} chapters, {includedLessonCount} lessons</div>
          </div>
          <div className="mt-4 space-y-3">
            {structure.chapters.map((chapter, ci) => (
              <div key={`ch-${ci}`} className={`rounded-xl border px-3 py-3 ${chapter.included === false ? "border-white/5 bg-black/20 opacity-60" : "border-white/10 bg-white/4"}`}>
                <div className="flex flex-wrap items-start gap-2">
                  <label className="mt-2"><input type="checkbox" checked={chapter.included !== false} onChange={(e) => updateChapter(ci, { included: e.target.checked })} className="rounded border-slate-500" /></label>
                  <div className="min-w-0 flex-1 grid gap-2 sm:grid-cols-2">
                    <label className="block text-[10px] text-slate-500">Chapter (BN)<input value={chapter.titleBn} onChange={(e) => updateChapter(ci, { titleBn: e.target.value })} className="mt-0.5 w-full rounded-md border border-slate-600 bg-[#0a1020] px-2 py-1.5 text-sm text-white" /></label>
                    <label className="block text-[10px] text-slate-500">Chapter (EN)<input value={chapter.title} onChange={(e) => updateChapter(ci, { title: e.target.value })} className="mt-0.5 w-full rounded-md border border-slate-600 bg-[#0a1020] px-2 py-1.5 text-sm text-white" /></label>
                    <label className="block text-[10px] text-slate-500">Page start<input type="number" min={1} value={chapter.pageStart ?? ""} onChange={(e) => updateChapter(ci, { pageStart: e.target.value ? Number(e.target.value) : undefined })} className="mt-0.5 w-full rounded-md border border-slate-600 bg-[#0a1020] px-2 py-1.5 text-sm text-white" /></label>
                    <label className="block text-[10px] text-slate-500">Page end<input type="number" min={1} value={chapter.pageEnd ?? ""} onChange={(e) => updateChapter(ci, { pageEnd: e.target.value ? Number(e.target.value) : undefined })} className="mt-0.5 w-full rounded-md border border-slate-600 bg-[#0a1020] px-2 py-1.5 text-sm text-white" /></label>
                  </div>
                </div>
                <ol className="mt-3 space-y-2 border-t border-white/8 pt-3">
                  {chapter.lessons.map((lesson, li) => (
                    <li key={`ls-${ci}-${li}`} className={`flex flex-wrap items-start gap-2 rounded-lg px-2 py-2 ${lesson.included === false ? "opacity-50" : "bg-black/20"}`}>
                      <label className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <input type="checkbox" checked={lesson.included !== false} onChange={(e) => updateLesson(ci, li, { included: e.target.checked })} className="rounded border-slate-500" />
                        <span>{li + 1}.</span>
                      </label>
                      <div className="min-w-0 flex-1 grid gap-2 sm:grid-cols-4">
                        <label className="block text-[10px] text-slate-500 sm:col-span-2">Lesson (BN)<input value={lesson.titleBn} onChange={(e) => updateLesson(ci, li, { titleBn: e.target.value })} className="mt-0.5 w-full rounded-md border border-slate-600 bg-[#0a1020] px-2 py-1 text-xs text-white" /></label>
                        <label className="block text-[10px] text-slate-500">Page start<input type="number" min={1} value={lesson.pageStart ?? ""} onChange={(e) => updateLesson(ci, li, { pageStart: e.target.value ? Number(e.target.value) : undefined })} className="mt-0.5 w-full rounded-md border border-slate-600 bg-[#0a1020] px-2 py-1 text-xs text-white" /></label>
                        <label className="block text-[10px] text-slate-500">Page end<input type="number" min={1} value={lesson.pageEnd ?? ""} onChange={(e) => updateLesson(ci, li, { pageEnd: e.target.value ? Number(e.target.value) : undefined })} className="mt-0.5 w-full rounded-md border border-slate-600 bg-[#0a1020] px-2 py-1 text-xs text-white" /></label>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <button type="button" onClick={() => setStep("extract")} className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
              <ChevronLeft className="size-3.5" /> Re-extract
            </button>
            <button type="button" onClick={handleCommit} disabled={Boolean(busy) || includedLessonCount === 0} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
              {busy === "commit" ? <Loader2 className="size-3.5 animate-spin" /> : <BookOpen className="size-3.5" />}
              Commit hierarchy
            </button>
          </div>
        </div>
      )}

      {step === "review" && !structure && (
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-sm text-slate-400">
          No structure yet. <button type="button" onClick={() => setStep("extract")} className="text-emerald-300 underline">Go to extract</button>
        </div>
      )}

      {step === "committed" && (
        <div className="rounded-2xl border border-sky-400/25 bg-sky-950/20 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-sky-200"><CheckCircle2 className="size-4" />4. Hierarchy ready — Study generate</h2>
          {commitResult && (
            <p className="mt-2 text-sm text-slate-300">Created: {commitResult.chapterCount} chapters, {commitResult.lessonCount} lessons</p>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-400"><span className="block font-semibold text-slate-200">Generate</span>Per-lesson study draft from mapped pages</div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-400"><span className="block font-semibold text-slate-200">Approve</span>Admin review — no AI auto-publish</div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-400"><span className="block font-semibold text-slate-200">Publish</span>Students only see published content</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard/admin/curriculum/lessons" className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-xs font-bold text-white">
              Lessons — Generate study draft <ChevronRight className="size-3.5" />
            </Link>
            <Link href="/dashboard/admin/curriculum/chapters" className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200">Chapters</Link>
            <button type="button" onClick={startNewUpload} className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200">Another PDF</button>
          </div>
        </div>
      )}
    </section>
  );
}
