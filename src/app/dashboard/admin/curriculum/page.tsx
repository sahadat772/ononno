import CurriculumDashboardClient from "./components/CurriculumDashboardClient";
import { getActiveVersion, getVersions } from "@/lib/curriculum";

export default async function CurriculumDashboard() {
  const [versionsResult, activeResult] = await Promise.allSettled([getVersions(), getActiveVersion()]);
  const versions = versionsResult.status === "fulfilled" ? versionsResult.value : [];
  const active = activeResult.status === "fulfilled" ? activeResult.value : null;
  return <CurriculumDashboardClient versionName={active?.name ?? "NCTB 2026"} versionCount={Math.max(versions.length, 1)} />;
}
