import { redirect } from "next/navigation";

/**
 * Legacy Content Management route.
 * Redirects to the canonical curriculum admin hub.
 * Old ContentClient.tsx is kept on disk for reference only.
 */
export default function ContentPageRedirect() {
  redirect("/dashboard/admin/curriculum");
}
