"use client";

import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";

// Shared chrome for every /admin/retention/* page:
//   - Auth guard (redirects unauthenticated users)
//   - <main> with the padding that clears the fixed admin sidebar
//   - The gold-accented topbar (Figma node 142:641)
//
// Layouts persist across route transitions in the App Router, so the topbar
// and its image assets are mounted exactly once for the whole retention
// section — no remount when switching between sub-pages.
//
// New retention pages should just export their unique content and let this
// layout supply everything above.

export default function RetentionLayout({ children }) {
  return (
    <AdminRouteGuard>
      <main className="min-h-screen px-4 py-4 sm:px-6 sm:py-6 xl:admin-content-pl xl:pr-12">
        <div className="flex flex-col gap-4">{children}</div>
      </main>
    </AdminRouteGuard>
  );
}
