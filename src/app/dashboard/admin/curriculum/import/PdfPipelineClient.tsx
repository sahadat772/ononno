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
  Layers,
  Loader2,
  Plus,
  RefreshCw,
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

  /** Only subjects for selected class — never leak other classes */
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
      setSuccess(
        data.message ||
          `Folder ready: ${data.folderPath}. এখন Drive-এ PDF রাখো।`,
      );
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
      if (!syncRes.ok) {
        throw new Error(syncData.message || syncData.error || "Sync failed");
      }

      const p = new URLSearchParams();
      p.set("class_id", classId);
      p.set("subject_id", subjectId);
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
      if (!res.ok) throw new Error(data.message || data.error || "Extract failed");

      const structure = data.structure ?? { chapters: data.chapters ?? [] };
      if (!structure.chapters?.length) {
        throw new Error("No chapters returned from extract");
      }

      const commitRes = await fetch(
        `/api/admin/curriculum/sources/${id}/commit-structure`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ structure }),
        },
      );
      const commitData = await commitRes.json();
      if (!commitRes.ok) {
        throw new Error(
          commitData.message || commitData.error || "Commit failed",
        );
      }

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

  const step1Done = Boolean(classId && subjectId);
  const step2Done = Boolean(folderHint || catalog.length > 0);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/10 via-slate-950/90 to-emerald-500/5 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-violet-400/15 text-violet-300 ring-1 ring-violet-400/25">
              <Layers className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/dashboard/admin/curriculum"
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="size-3" /> Curriculum
                </Link>
                <span className="text-[11px] text-slate-600">·</span>
                <span className="text-[11px] text-slate-500">PDF Import</span>
              </div>
              <h1 className="mt-1.5 text-xl font-black text-white md:text-2xl">
                Import — Class → Subject → Drive PDF
              </h1>
              <p className="mt-1 max-w-xl text-sm text-slate-400">
                Class বেছে নাও → সেই class-এর subject দেখাবে → folder বানাও →
                Drive-এ NCTB PDF রাখো → catalog refresh → extract।
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right text-xs text-slate-400">
            <p>
              <span className="font-bold text-white">{classes.length}</span>{" "}
              classes
            </p>
            <p>
              <span className="font-bold text-white">{subjects.length}</span>{" "}
              subjects total
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {[
            { n: 1, label: "Class + Subject", ok: step1Done },
            { n: 2, label: "Folder + PDF", ok: step2Done },
            { n: 3, label: "Extract", ok: done },
          ].map((s) => (
            <div
              key={s.n}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                s.ok
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                  : "border-white/10 bg-white/5 text-slate-400"
              }`}
            >
              <span
                className={`grid size-5 place-items-center rounded-full text-[10px] font-black ${
                  s.ok ? "bg-emerald-400 text-slate-950" : "bg-white/10"
                }`}
              >
                {s.ok ? "✓" : s.n}
              </span>
              {s.label}
            </div>
          ))}
        </div>
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

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-lg shadow-black/20">
        <h2 className="flex items-center gap-2 text-sm font-bold text-white">
          <span className="grid size-6 place-items-center rounded-lg bg-amber-400/15 text-[11px] font-black text-amber-300">
            1
          </span>
          <FolderPlus className="size-4 text-amber-300" />
          Class ও Subject বেছে নাও
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Class select করলে{" "}
          <strong className="text-slate-300">শুধু সেই class-এর subjects</strong>{" "}
          দেখাবে। না থাকলে Subjects page থেকে add করো।
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block text-xs font-medium text-slate-400">
            Class
            <select
              value={classId}
              onChange={(e) => onClassChange(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-600 bg-[#0a1020] px-3 py-3 text-sm text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
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

          <label className="block text-xs font-medium text-slate-400">
            Subject
            <span className="ml-2 font-normal text-slate-600">
              {classId ? `(${availableSubjects.length}টি এই class-এ)` : ""}
            </span>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={!classId}
              className="mt-1.5 w-full rounded-xl border border-slate-600 bg-[#0a1020] px-3 py-3 text-sm text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {!classId
                  ? "আগে Class বেছে নাও"
                  : availableSubjects.length === 0
                    ? "এই class-এ subject নেই"
                    : "Subject বেছে নাও…"}
              </option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name_bn || s.name}
                  {s.name_bn && s.name ? ` · ${s.name}` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        {classId && availableSubjects.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {selectedClass?.name || "Class"} — সব subject (
              {availableSubjects.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {availableSubjects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSubjectId(s.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    subjectId === s.id
                      ? "border-violet-400/50 bg-violet-500/20 text-violet-100"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  {s.name_bn || s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {classId && availableSubjects.length === 0 && (
          <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            <p className="font-semibold">
              এই class-এ Supabase-এ কোনো subject নেই।
            </p>
            <p className="mt-1 text-xs text-amber-200/80">
              Subjects page → Class সিলেক্ট → Add Subject। তারপর এখানে ফিরে এসো।
            </p>
            <Link
              href="/dashboard/admin/curriculum/subjects"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950"
            >
              <Plus className="size-3.5" />
              Subjects — Add
            </Link>
          </div>
        )}

        {selectedSubject && (
          <p className="mt-3 text-xs text-slate-500">
            Selected:{" "}
            <span className="font-semibold text-slate-200">
              {selectedClass?.name}
            </span>{" "}
            →{" "}
            <span className="font-semibold text-violet-200">
              {selectedSubject.name_bn || selectedSubject.name}
            </span>
          </p>
        )}

        <button
          type="button"
          disabled={!classId || !subjectId || Boolean(busy)}
          onClick={() => void createFolder()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-50"
        >
          {busy === "folder" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FolderPlus className="size-4" />
          )}
          Create Drive folder
        </button>

        {folderHint && (
          <div className="mt-3 rounded-xl border border-sky-500/25 bg-sky-500/10 px-4 py-3 text-xs text-sky-100">
            <p className="font-semibold text-sky-200">Folder path</p>
            <code className="mt-1 block break-all text-white">{folderHint}</code>
            <p className="mt-2 text-sky-200/80">
              Google Drive → ONONNO-Curriculum → এই path-এ NCTB PDF upload করো।
            </p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-lg shadow-black/20">
        <h2 className="flex items-center gap-2 text-sm font-bold text-white">
          <span className="grid size-6 place-items-center rounded-lg bg-sky-400/15 text-[11px] font-black text-sky-300">
            2
          </span>
          <FileText className="size-4 text-sky-300" />
          Refresh catalog → Extract
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Drive folder থেকে PDF sync করে catalog-এ আনবে, তারপর Extract + Commit।
        </p>

        <button
          type="button"
          disabled={!classId || !subjectId || Boolean(busy)}
          onClick={() => void refreshCatalog()}
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-100 hover:bg-sky-500/20 disabled:opacity-50"
        >
          {busy === "refresh" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Refresh catalog
        </button>

        <div className="mt-4 divide-y divide-white/8 overflow-hidden rounded-xl border border-white/10">
          {catalog.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <BookOpen className="mx-auto size-8 text-slate-600" />
              <p className="mt-2 text-sm text-slate-500">
                {!classId || !subjectId
                  ? "আগে Class ও Subject select করো।"
                  : "কোনো PDF নেই — folder-এ PDF রেখে Refresh catalog চাপো।"}
              </p>
            </div>
          ) : (
            catalog.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {s.title || s.file_name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {s.file_name}
                    {s.storage_provider ? ` · ${s.storage_provider}` : ""}
                    {s.storage_path ? ` · ${s.storage_path}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sky-400/10 px-2.5 py-1 text-[11px] font-medium text-sky-300">
                    {s.source_status || "uploaded"}
                  </span>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => void extractAndCommit(s.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-2 text-xs font-bold text-white hover:bg-violet-400 disabled:opacity-50"
                  >
                    {busy === s.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <WandSparkles className="size-3.5" />
                    )}
                    Extract + Commit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {done && (
        <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 to-sky-500/10 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-emerald-200">
            <CheckCircle2 className="size-4" /> Hierarchy ready
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Chapter/lesson structure commit হয়েছে। এখন lesson body AI generate
            করতে পারো।
          </p>
          <Link
            href="/dashboard/admin/curriculum/lessons"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-400"
          >
            Lessons — AI Generate
            <ChevronRight className="size-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
