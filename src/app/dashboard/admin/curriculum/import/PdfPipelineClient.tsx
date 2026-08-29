"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  Upload,
  WandSparkles,
  BookOpen,
  Layers,
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
};

type ExtractedChapter = {
  title: string;
  titleBn: string;
  chapterNumber?: number;
  pageStart?: number;
  pageEnd?: number;
  lessons: ExtractedLesson[];
};

type ExtractedStructure = {
  chapters: ExtractedChapter[];
  totalLessons: number;
  sourceConfidence?: string;
};

type Step = "upload" | "extract" | "review" | "committed";

const STEPS: { id: Step; label: string; hint: string }[] = [
  { id: "upload", label: "১. PDF Upload", hint: "Class + Subject + PDF" },
  { id: "extract", label: "২. Structure", hint: "Gemini extract" },
  { id: "review", label: "৩. Review", hint: "Chapter/Lesson check" },
  { id: "committed", label: "৪. Commit", hint: "Draft hierarchy" },
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
      titleBn: String(c.titleBn ?? c.title_bn ?? c.title ?? `অধ্যায় ${ci + 1}`),
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
      lessons: lessonsRaw.map((ls, li) => {
        const l = (ls ?? {}) as Record<string, unknown>;
        return {
          title: String(l.title ?? l.title_bn ?? `Lesson ${li + 1}`),
          titleBn: String(l.titleBn ?? l.title_bn ?? l.title ?? `পাঠ ${li + 1}`),
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

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!file || !classId || !subjectId || !title.trim()) {
      setError("Class, Subject, Title এবং PDF file আবশ্যক।");
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
      const response = await fetch("/api/admin/curriculum/sources", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(data, "PDF upload ব্যর্থ।"));
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
      setSuccess("PDF upload হয়েছে। এখন Structure extract করুন।");
      setStep("extract");
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF upload ব্যর্থ।");
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
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(data, "Structure extract ব্যর্থ।"));
      const normalized =
        normalizeStructure(data.structure) ??
        normalizeStructure({ chapters: data.chapters, totalLessons: data.totalLessons });
      if (!normalized) throw new Error("Gemini কোনো chapter/lesson ফেরত দেয়নি।");
      setStructure(normalized);
      setActiveSourceId(sourceId);
      setSources((prev) =>
        prev.map((item) =>
          item.id === sourceId
            ? {
                ...item,
                source_status: "extracted",
                status: "extracted",
                extracted_structure: normalized,
              }
            : item,
        ),
      );
      setSuccess(
        `${normalized.chapters.length} chapter, ${normalized.totalLessons} lesson extract হয়েছে। Review করে Commit করুন।`,
      );
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Structure extract ব্যর্থ।");
    } finally {
      setBusy(null);
    }
  }

  async function handleCommit() {
    if (!activeSourceId || !structure) return;
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
              chapters: structure.chapters.map((ch) => ({
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
      if (!response.ok) throw new Error(apiErrorMessage(data, "Structure commit ব্যর্থ।"));
      setCommitResult({
        chapterCount: data.chapterCount ?? 0,
        lessonCount: data.lessonCount ?? 0,
        skippedChapters: data.skippedChapters,
        skippedLessons: data.skippedLessons,
      });
      setSources((prev) =>
        prev.map((item) =>
          item.id === activeSourceId
            ? {
                ...item,
                source_status: "reviewed",
                status: "reviewed",
                workflow_status: "reviewed",
              }
            : item,
        ),
      );
      setSuccess(
        `${data.chapterCount ?? 0} chapter ও ${data.lessonCount ?? 0} lesson review draft হিসেবে save হয়েছে।`,
      );
      setStep("committed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Structure commit ব্যর্থ।");
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

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-emerald-400/25 bg-linear-to-br from-emerald-950/30 to-slate-950/80 p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <FileText className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              PDF → Structure → Chapter → Lesson
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Blueprint pipeline: Upload PDF → Gemini structure → human review →
              commit hierarchy → per-lesson generate → publish.
            </p>
          </div>
        </div>

        <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, index) => {
            const active = step === s.id;
            const done =
              STEPS.findIndex((x) => x.id === step) > index ||
              (step === "committed" && s.id === "committed");
            return (
              <li
                key={s.id}
                className={`rounded-xl border px-3 py-2.5 text-sm ${
                  active
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
                    : done
                      ? "border-white/10 bg-white/5 text-slate-300"
                      : "border-white/5 bg-black/20 text-slate-500"
                }`}
              >
                <span className="block font-semibold">{s.label}</span>
                <span className="text-xs opacity-80">{s.hint}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-white">
          <Upload className="size-4 text-sky-300" />
          ১. PDF Upload
        </h2>
        <form onSubmit={handleUpload} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block text-xs text-slate-400">
            Class
            <select
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setSubjectId("");
              }}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#0a1020] px-3 py-2.5 text-sm text-white"
            >
              <option value="">-- Class বেছে নিন --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-slate-400">
            Subject
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#0a1020] px-3 py-2.5 text-sm text-white"
            >
              <option value="">-- Subject বেছে নিন --</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name_bn || s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-slate-400 md:col-span-2">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: NCTB Class 6 বাংলা ২০২৬"
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#0a1020] px-3 py-2.5 text-sm text-white"
            />
          </label>
          <label className="block text-xs text-slate-400 md:col-span-2">
            PDF file (max 50MB)
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#0a1020] px-3 py-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-emerald-500/20 file:px-3 file:py-1 file:text-emerald-200"
            />
          </label>
          <button
            type="submit"
            disabled={Boolean(busy)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 md:col-span-2"
          >
            {busy === "upload" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            PDF Upload করুন
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-white">
          <Layers className="size-4 text-violet-300" />
          ২. Source list → Structure extract
        </h2>
        <div className="mt-3 divide-y divide-white/8 rounded-xl border border-white/8">
          {sources.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">
              এখনও কোনো PDF source নেই। আগে upload করুন।
            </p>
          ) : (
            sources.map((source) => {
              const st = statusOf(source);
              const isActive = activeSourceId === source.id;
              return (
                <div
                  key={source.id}
                  className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                    isActive ? "bg-violet-500/5" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => selectExistingSource(source)}
                    className="min-w-0 text-left"
                  >
                    <span className="block text-sm font-semibold text-white">
                      {source.title}
                    </span>
                    <span className="text-xs text-slate-500">{source.file_name}</span>
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        st === "reviewed"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : st === "extracted"
                            ? "bg-violet-400/10 text-violet-200"
                            : st === "extraction_error"
                              ? "bg-rose-400/10 text-rose-300"
                              : "bg-sky-400/10 text-sky-300"
                      }`}
                    >
                      {st}
                    </span>
                    <button
                      type="button"
                      disabled={Boolean(busy)}
                      onClick={() => handleExtract(source.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-violet-400/40 bg-violet-400/10 px-3 py-2 text-xs font-bold text-violet-100 disabled:opacity-50"
                    >
                      {busy === `extract:${source.id}` ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <WandSparkles className="size-3.5" />
                      )}
                      Extract structure
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {structure && (
        <div className="rounded-2xl border border-emerald-400/25 bg-slate-950/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="size-4" />
              <h2 className="text-sm font-bold">
                ৩. Review — {structure.chapters.length} chapter,{" "}
                {structure.totalLessons} lesson
                {structure.sourceConfidence
                  ? ` (${structure.sourceConfidence} confidence)`
                  : ""}
              </h2>
            </div>
            {activeSource && (
              <p className="text-xs text-slate-400">Source: {activeSource.title}</p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {structure.chapters.map((chapter, index) => (
              <details
                key={`${chapter.titleBn}-${index}`}
                className="rounded-lg bg-white/4 px-3 py-2"
                open={index === 0}
              >
                <summary className="cursor-pointer text-sm font-semibold text-white">
                  {chapter.titleBn}
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    পৃষ্ঠা {chapter.pageStart ?? "?"}–{chapter.pageEnd ?? "?"} ·{" "}
                    {chapter.lessons.length} পাঠ
                  </span>
                </summary>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-slate-300">
                  {chapter.lessons.map((lesson, lessonIndex) => (
                    <li key={`${lesson.titleBn}-${lessonIndex}`}>
                      {lesson.titleBn}{" "}
                      <span className="text-slate-500">
                        পৃষ্ঠা {lesson.pageStart ?? "?"}–{lesson.pageEnd ?? "?"}
                      </span>
                    </li>
                  ))}
                </ol>
              </details>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="text-xs text-amber-200">
              Commit করলে chapter/lesson hierarchy তৈরি হবে (review draft)। Publish
              হবে না। Published lesson overwrite হবে না।
            </p>
            <button
              type="button"
              onClick={handleCommit}
              disabled={Boolean(busy) || step === "committed"}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
            >
              {busy === "commit" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <BookOpen className="size-3.5" />
              )}
              {step === "committed" ? "Already committed" : "Commit structure"}
            </button>
          </div>
        </div>
      )}

      {step === "committed" && commitResult && (
        <div className="rounded-2xl border border-sky-400/25 bg-sky-950/20 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-sky-200">
            <CheckCircle2 className="size-4" />
            ৪. Hierarchy ready — পরবর্তী ধাপ
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            নতুন: {commitResult.chapterCount} chapter, {commitResult.lessonCount}{" "}
            lesson
            {(commitResult.skippedChapters || commitResult.skippedLessons) ? (
              <span className="text-slate-500">
                {" "}
                (skipped: {commitResult.skippedChapters ?? 0} chapter,{" "}
                {commitResult.skippedLessons ?? 0} lesson)
              </span>
            ) : null}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard/admin/curriculum/lessons"
              className="inline-flex items-center gap-2 rounded-lg border border-sky-400/40 bg-sky-400/10 px-4 py-2 text-xs font-bold text-sky-100"
            >
              Lessons → Generate study draft
              <ChevronRight className="size-3.5" />
            </Link>
            <Link
              href="/dashboard/admin/curriculum/chapters"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200"
            >
              Chapters দেখুন
            </Link>
            <Link
              href="/dashboard/admin/curriculum"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200"
            >
              Curriculum hub
            </Link>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Blueprint: Generate → Review content → Approve → Publish (published lesson
            overwrite বন্ধ)।
          </p>
        </div>
      )}
    </section>
  );
}
