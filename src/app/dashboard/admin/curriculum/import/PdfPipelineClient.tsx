"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
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
  classes,
  subjects,
  initialSources,
}: {
  classes: CurriculumClass[];
  subjects: CurriculumSubject[];
  initialSources: Source[];
}) {
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");
  const [sources, setSources] = useState(initialSources);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lastImportedId, setLastImportedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const availableSubjects = useMemo(
    () => subjects.filter((s) => !classId || s.class_id === classId),
    [subjects, classId],
  );

  const catalog = useMemo(
    () =>
      sources.filter((s) => {
        if (classId && s.class_id && s.class_id !== classId) return false;
        if (subjectId && s.subject_id && s.subject_id !== subjectId)
          return false;
        return true;
      }),
    [sources, classId, subjectId],
  );

  async function refresh() {
    setBusy("refresh");
    setError(null);
    try {
      const p = new URLSearchParams();
      if (classId) p.set("class_id", classId);
      if (subjectId) p.set("subject_id", subjectId);
      const res = await fetch(`/api/admin/curriculum/sources?${p}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Refresh failed");
      setSources(Array.isArray(data) ? data : []);
      setSuccess("Catalog refreshed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setBusy(null);
    }
  }

  async function downloadFromUrl() {
    if (!classId || !subjectId) {
      setError("আগে Class ও Subject select করো।");
      return;
    }
    const url = pdfUrl.trim();
    if (!url) {
      setError("PDF download link দাও (direct .pdf URL)।");
      return;
    }

    setBusy("download");
    setError(null);
    setSuccess(null);
    setDone(false);
    try {
      const res = await fetch("/api/admin/curriculum/sources/from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          subjectId,
          url,
          title: pdfTitle.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (res.status === 409 && data.existingSourceId) {
        setLastImportedId(data.existingSourceId);
        setActiveId(data.existingSourceId);
        setSuccess(
          `এই PDF আগেই catalog-এ আছে — নিচে Extract this PDF চাপো। (${data.existingTitle || data.existingSourceId})`,
        );
        await refresh();
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || "Download failed");
      }

      const source = data.source as Source;
      setSources((prev) => [source, ...prev.filter((s) => s.id !== source.id)]);
      setLastImportedId(source.id);
      setActiveId(source.id);
      setSuccess(
        `Download ও storage সম্পন্ন (${data.storageProvider || "storage"}). এখন Extract this PDF চাপো।`,
      );
      setPdfUrl("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setBusy(null);
    }
  }

  async function extractAndCommit(id: string) {
    setBusy(id);
    setActiveId(id);
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
        `Done: ${commitData.chapterCount ?? 0} chapters, ${commitData.lessonCount ?? 0} lessons. Continue on Lessons page.`,
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

  const canDownload = Boolean(classId && subjectId && pdfUrl.trim());

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-emerald-400/25 bg-slate-950/80 p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <Layers className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              Import — Link / Catalog
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Class → Subject → PDF link download (Drive/Supabase) → Extract +
              Commit. Study generation Lessons page-এ।
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

      {/* Step 1: class / subject / URL */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-white">
          <Download className="size-4 text-amber-300" />
          ১) PDF link থেকে storage-এ আনো
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Direct <span className="text-slate-300">.pdf</span> download URL দাও
          (viewer পেজ নয়)। System download করে{" "}
          <span className="text-slate-300">CURRICULUM_STORAGE_PROVIDER</span>{" "}
          অনুযায়ী Drive বা Supabase-এ রাখবে।
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block text-xs text-slate-400">
            Class
            <select
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setSubjectId("");
                setLastImportedId(null);
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
              onChange={(e) => {
                setSubjectId(e.target.value);
                setLastImportedId(null);
              }}
              disabled={!classId}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#0a1020] px-3 py-2.5 text-sm text-white disabled:opacity-50"
            >
              <option value="">Subject বেছে নাও</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name_bn || s.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-3 block text-xs text-slate-400">
          Title (optional)
          <input
            value={pdfTitle}
            onChange={(e) => setPdfTitle(e.target.value)}
            placeholder="যেমন: NCTB Class 1 বাংলা"
            className="mt-1 w-full rounded-lg border border-slate-600 bg-[#0a1020] px-3 py-2.5 text-sm text-white placeholder:text-slate-600"
          />
        </label>

        <label className="mt-3 block text-xs text-slate-400">
          PDF download link
          <input
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            placeholder="https://.../something.pdf"
            className="mt-1 w-full rounded-lg border border-slate-600 bg-[#0a1020] px-3 py-2.5 text-sm text-white placeholder:text-slate-600"
          />
        </label>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canDownload || Boolean(busy)}
            onClick={() => void downloadFromUrl()}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-50"
          >
            {busy === "download" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            Download & Store
          </button>

          {lastImportedId && (
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void extractAndCommit(lastImportedId)}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
            >
              {busy === lastImportedId ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <WandSparkles className="size-3.5" />
              )}
              Extract this PDF
            </button>
          )}
        </div>
      </div>

      {/* Step 2: existing catalog */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-white">
          <FileText className="size-4 text-sky-300" />
          ২) Catalog (আগে থাকা PDF)
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          আগে import করা sources — Refresh করে list নাও, তারপর Extract +
          Commit।
        </p>

        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void refresh()}
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
              এই filter-এ কোনো PDF source নেই — উপরে link দিয়ে Download &
              Store করো।
            </p>
          ) : (
            catalog.map((s) => (
              <div
                key={s.id}
                className={`flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                  lastImportedId === s.id ? "bg-violet-500/10" : ""
                }`}
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
          <p className="mt-2 text-xs text-slate-400">
            Lessons page → select 1–2 lessons → Generate study → Approve →
            Publish
          </p>
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
