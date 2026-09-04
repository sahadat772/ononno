"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  FolderPlus,
  Layers,
  Loader2,
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

  const availableSubjects = useMemo(() => {
    if (!classId) return [];
    const matched = subjects.filter(
      (s) => String(s.class_id || "") === String(classId),
    );
    if (matched.length === 0 && subjects.length > 0) return subjects;
    return matched;
  }, [subjects, classId]);

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
          `Folder ready: ${data.folderPath}. এখন Drive/Supabase-এ PDF রাখো।`,
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

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-emerald-400/25 bg-slate-950/80 p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <Layers className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              Import — Folder / Catalog
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Folder তৈরি → তুমি PDF রাখো (Drive/Supabase) → Refresh catalog →
              Extract. Study generation Lessons page-এ।
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Loaded: {classes.length} classes, {subjects.length} subjects
            </p>
          </div>
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

      {/* Card 1: Create folder */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-white">
          <FolderPlus className="size-4 text-amber-300" />
          ১) Class / Subject → Create folder
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Drive-এ path:{" "}
          <code className="text-slate-300">curriculum/class-X/subject/</code>
          বানাবে। তারপর তুমি নিজে (Gmail) সেই folder-এ PDF রাখবে — server PDF
          upload করবে না।
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
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
              <option value="">Class বেছে নাও</option>
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
              <option value="">
                {!classId ? "আগে Class বেছে নাও" : "Subject বেছে নাও"}
              </option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name_bn || s.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          disabled={!classId || !subjectId || Boolean(busy)}
          onClick={() => void createFolder()}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-50"
        >
          {busy === "folder" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <FolderPlus className="size-3.5" />
          )}
          Create folder
        </button>

        {folderHint && (
          <p className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-sky-200">
            Path: <code className="text-white">{folderHint}</code>
            <br />
            Google Drive → ONONNO-Curriculum → এই path-এ PDF upload করো (তোমার
            Gmail দিয়ে)।
          </p>
        )}
      </div>

      {/* Card 2: Catalog + extract */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-white">
          <FileText className="size-4 text-sky-300" />
          ২) Refresh catalog → Extract
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Storage (Drive/Supabase) folder থেকে PDF খুঁজে catalog-এ আনবে, তারপর
          Extract + Commit — আগের মতো।
        </p>

        <button
          type="button"
          disabled={!classId || !subjectId || Boolean(busy)}
          onClick={() => void refreshCatalog()}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 disabled:opacity-50"
        >
          {busy === "refresh" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Refresh catalog
        </button>

        <div className="mt-4 divide-y divide-white/8 rounded-xl border border-white/8">
          {catalog.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              কোনো PDF source নেই — folder-এ PDF রেখে Refresh catalog চাপো।
            </p>
          ) : (
            catalog.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
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
                  <span className="rounded-full bg-sky-400/10 px-2 py-1 text-xs text-sky-300">
                    {s.source_status || "uploaded"}
                  </span>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => void extractAndCommit(s.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-violet-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
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
        <div className="rounded-2xl border border-sky-400/25 bg-sky-950/20 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-sky-200">
            <CheckCircle2 className="size-4" /> Hierarchy ready
          </h2>
          <Link
            href="/dashboard/admin/curriculum/lessons"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-xs font-bold text-white"
          >
            Lessons — AI Generate
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}
