"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  FolderPlus,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Upload,
  WandSparkles,
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
  class_id?: string;
  subject_id?: string;
  storage_path?: string | null;
  storage_provider?: string | null;
  source_status?: string;
  workflow_status?: string;
};

export default function PdfPipelineClient({
  classes: initialClasses,
  subjects: initialSubjects,
  initialSources,
}: {
  classes: CurriculumClass[];
  subjects: CurriculumSubject[];
  initialSources: Source[];
}) {
  const [classes, setClasses] = useState(initialClasses);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [sources, setSources] = useState(initialSources);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [folderHint, setFolderHint] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (classes.length > 0 && subjects.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/curriculum/meta");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data.classes)) setClasses(data.classes);
        if (Array.isArray(data.subjects)) setSubjects(data.subjects);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [classes.length, subjects.length]);

  const availableSubjects = useMemo(() => {
    if (!classId) return [];
    return subjects
      .filter((s) => String(s.class_id || "") === String(classId))
      .slice()
      .sort((a, b) =>
        (a.name_bn || a.name).localeCompare(b.name_bn || b.name, "bn"),
      );
  }, [subjects, classId]);

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === classId) ?? null,
    [classes, classId],
  );
  const selectedSubject = useMemo(
    () => availableSubjects.find((s) => s.id === subjectId) ?? null,
    [availableSubjects, subjectId],
  );
  const catalog = useMemo(
    () =>
      sources.filter((s) => {
        if (classId && s.class_id && String(s.class_id) !== String(classId))
          return false;
        if (
          subjectId &&
          s.subject_id &&
          String(s.subject_id) !== String(subjectId)
        )
          return false;
        return true;
      }),
    [sources, classId, subjectId],
  );

  function onClassChange(next: string) {
    setClassId(next);
    setSubjectId("");
    setError(null);
    setSuccess(null);
    setFolderHint(null);
  }

  async function createFolder() {
    if (!classId || !subjectId) {
      setError("আগে Class ও Subject select করো।");
      return;
    }
    setBusy("folder");
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/curriculum/storage/ensure-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, subjectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Folder failed");
      setFolderHint(data.folderPath || null);
      setSuccess(data.message || `Folder ready: ${data.folderPath}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Folder create failed");
    } finally {
      setBusy(null);
    }
  }

  async function refreshCatalog() {
    if (!classId || !subjectId) {
      setError("Catalog refresh-এর জন্য Class ও Subject select করো।");
      return;
    }
    setBusy("refresh");
    setError(null);
    setSuccess(null);
    try {
      const syncRes = await fetch(
        "/api/admin/curriculum/sources/sync-from-storage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classId, subjectId }),
        },
      );
      const syncData = await syncRes.json();
      if (!syncRes.ok)
        throw new Error(syncData.message || syncData.error || "Sync failed");
      const p = new URLSearchParams({
        class_id: classId,
        subject_id: subjectId,
      });
      const res = await fetch(`/api/admin/curriculum/sources?${p}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "List failed");
      setSources(Array.isArray(data) ? data : []);
      setFolderHint(syncData.folderPath || folderHint);
      setSuccess(syncData.message || "Catalog refreshed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setBusy(null);
    }
  }

  async function extractAndCommit(id: string) {
    setBusy(id);
    setError(null);
    setSuccess(null);
    setDone(false);
    try {
      const res = await fetch(
        `/api/admin/curriculum/sources/${id}/extract-structure`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || data.error || "Extract failed");
      const structure = data.structure ?? { chapters: data.chapters ?? [] };
      if (!structure.chapters?.length)
        throw new Error("No chapters returned from extract");
      const commitRes = await fetch(
        `/api/admin/curriculum/sources/${id}/commit-structure`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ structure }),
        },
      );
      const commitData = await commitRes.json();
      if (!commitRes.ok)
        throw new Error(
          commitData.message || commitData.error || "Commit failed",
        );
      setSuccess(
        `Done: ${commitData.chapterCount ?? 0} chapters, ${commitData.lessonCount ?? 0} lessons.`,
      );
      setDone(true);
      setSources((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, source_status: "reviewed", workflow_status: "reviewed" }
            : s,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extract/commit failed");
    } finally {
      setBusy(null);
    }
  }

  const step1 = Boolean(classId && subjectId);
  const step2 = Boolean(folderHint || catalog.length > 0);
  const selectCls =
    "mt-1.5 w-full rounded-xl border border-slate-600 bg-[#030711] px-3 py-3 text-sm text-white outline-none focus:border-fuchsia-400 disabled:opacity-50";

  return (
    <div className="space-y-5 font-sans text-[#f7f7ff]">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-xl border border-fuchsia-500/60 bg-gradient-to-br from-fuchsia-900/50 to-slate-950 shadow-[0_0_25px_rgba(223,50,206,.25)]">
            <Upload className="size-6 text-pink-300" />
          </div>
          <div>
            <Link
              href="/dashboard/admin/curriculum"
              className="mb-1 inline-flex items-center gap-1 rounded-md border border-slate-600/80 bg-[#080d1b] px-2 py-0.5 text-[10px] text-slate-400 hover:text-pink-300"
            >
              <ArrowLeft className="size-3" /> Curriculum
            </Link>
            <h1 className="text-[clamp(1.4rem,2.8vw,2.1rem)] font-extrabold tracking-tight">
              PDF{" "}
              <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                Import
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Class → Subject → Drive → NCTB PDF → Extract → AI Lessons
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["Classes", classes.length, "border-[#087dff]/55 text-[#48a8ff]"],
            ["Subjects", subjects.length, "border-[#16b76a]/50 text-[#41e88c]"],
            [
              "This class",
              classId ? availableSubjects.length : "—",
              "border-[#a855f7]/55 text-[#c66bff]",
            ],
          ].map(([label, value, cls]) => (
            <div
              key={String(label)}
              className={`min-w-[96px] rounded-xl border bg-[#080d1b] px-4 py-2.5 ${cls}`}
            >
              <p className="text-xl font-black">{value}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                {label}
              </p>
            </div>
          ))}
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {[
          [1, "Class + Subject", step1],
          [2, "Folder + PDF", step2],
          [3, "Extract", done],
        ].map(([n, label, ok]) => (
          <div
            key={String(n)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold ${
              ok
                ? "border-emerald-500/45 bg-emerald-500/15 text-emerald-200"
                : "border-slate-600/80 bg-[#080d1b] text-slate-400"
            }`}
          >
            <span
              className={`grid size-5 place-items-center rounded-md text-[10px] font-black ${
                ok ? "bg-emerald-400 text-slate-950" : "bg-slate-700"
              }`}
            >
              {ok ? "✓" : n}
            </span>
            {label}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <div className="rounded-2xl border border-[#087dff]/30 bg-[#080d1b] p-5 shadow-[0_0_28px_rgba(0,120,255,.08)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl border border-[#087dff]/45 bg-[#087dff]/10 text-[#48a8ff]">
                <FolderPlus className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">1 · Class ও Subject</h2>
                <p className="text-xs text-slate-500">
                  শুধু সিলেক্টেড class-এর subjects
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-slate-400">
                Class
                <select
                  value={classId}
                  onChange={(e) => onClassChange(e.target.value)}
                  className={selectCls}
                >
                  <option value="">Class বেছে নাও…</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.class_number ? ` (${c.class_number})` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-400">
                Subject{" "}
                {classId ? (
                  <span className="ml-1 font-normal text-[#48a8ff]">
                    ({availableSubjects.length})
                  </span>
                ) : null}
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  disabled={!classId}
                  className={selectCls}
                >
                  <option value="">
                    {!classId
                      ? "আগে Class বেছে নাও"
                      : availableSubjects.length === 0
                        ? "Subject নেই"
                        : "Subject বেছে নাও…"}
                  </option>
                  {availableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name_bn || s.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {classId && availableSubjects.length > 0 && (
              <div className="mt-4 flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
                {availableSubjects.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSubjectId(s.id)}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                      subjectId === s.id
                        ? "border-fuchsia-500/50 bg-fuchsia-500/20 text-pink-200"
                        : "border-slate-600/80 bg-[#030711] text-slate-400"
                    }`}
                  >
                    {s.name_bn || s.name}
                  </button>
                ))}
              </div>
            )}

            {classId && availableSubjects.length === 0 && (
              <div className="mt-4 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                <p className="font-semibold">এই class-এ subject নেই</p>
                <Link
                  href="/dashboard/admin/curriculum/subjects"
                  className="mt-2 inline-flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950"
                >
                  <Plus className="size-3.5" /> Add Subject
                </Link>
              </div>
            )}

            {selectedSubject && (
              <p className="mt-3 text-xs text-slate-500">
                <Sparkles className="mr-1 inline size-3 text-fuchsia-400" />
                {selectedClass?.name} →{" "}
                <span className="font-semibold text-pink-300">
                  {selectedSubject.name_bn || selectedSubject.name}
                </span>
              </p>
            )}

            <button
              type="button"
              disabled={!classId || !subjectId || Boolean(busy)}
              onClick={() => void createFolder()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {busy === "folder" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FolderPlus className="size-4" />
              )}
              Create Drive folder
            </button>

            {folderHint && (
              <div className="mt-4 rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-4 py-3 text-xs text-cyan-100">
                <p className="font-bold text-cyan-300">Folder path</p>
                <code className="mt-1 block break-all text-white">{folderHint}</code>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#a855f7]/30 bg-[#080d1b] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl border border-[#a855f7]/45 bg-[#a855f7]/10 text-[#c66bff]">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">2 · Catalog & Extract</h2>
                  <p className="text-xs text-slate-500">Drive PDF sync → commit</p>
                </div>
              </div>
              <button
                type="button"
                disabled={!classId || !subjectId || Boolean(busy)}
                onClick={() => void refreshCatalog()}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-200 disabled:opacity-50"
              >
                {busy === "refresh" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Refresh catalog
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-700/80">
              {catalog.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-slate-500">
                  {!classId || !subjectId
                    ? "Class ও Subject select করো।"
                    : "PDF নেই — folder-এ ফাইল রেখে Refresh চাপো।"}
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {catalog.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {s.title || s.file_name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {s.file_name}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={Boolean(busy)}
                        onClick={() => void extractAndCommit(s.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/20 px-3 py-2 text-xs font-bold text-pink-200 disabled:opacity-50"
                      >
                        {busy === s.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <WandSparkles className="size-3.5" />
                        )}
                        Extract + Commit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-[#16b76a]/35 bg-[#080d1b] p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#41e88c]">
              <BookOpen className="size-4" /> Manual flow
            </h3>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-xs text-slate-400">
              <li>Subjects — class-wise add</li>
              <li>Class + Subject → Create folder</li>
              <li>NCTB PDF Drive-এ রাখো</li>
              <li>Refresh → Extract + Commit</li>
              <li>Lessons → AI Generate</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-fuchsia-500/35 bg-[#080d1b] p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-pink-300">
              <Sparkles className="size-4" /> Study Engine
            </h3>
            <p className="mt-2 text-xs text-slate-400">
              প্রাথমিক (1–5): হালকা · মাধ্যমিক (6+): চারুপাঠ স্টাইল গভীর
            </p>
          </div>
          <Link
            href="/dashboard/admin/curriculum/subjects"
            className="flex items-center justify-between rounded-xl border border-slate-600/80 bg-[#080d1b] px-4 py-3 text-xs font-semibold text-slate-300"
          >
            Subjects manage <ChevronRight className="size-4" />
          </Link>
          <Link
            href="/dashboard/admin/curriculum/lessons"
            className="flex items-center justify-between rounded-xl border border-slate-600/80 bg-[#080d1b] px-4 py-3 text-xs font-semibold text-slate-300"
          >
            Lessons — AI Generate <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      {done && (
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 to-cyan-500/10 p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold text-emerald-300">
            <CheckCircle2 className="size-4" /> Hierarchy ready
          </h2>
          <Link
            href="/dashboard/admin/curriculum/lessons"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white"
          >
            Lessons — AI Generate <ChevronRight className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
