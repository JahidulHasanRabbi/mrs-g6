"use client";

import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import RetentionTopBar from "../../components/admin/retention/RetentionTopBar";

// Shared chrome for every /admin/settings/* page:
//   - Auth guard (redirects unauthenticated admins to /admin/login)
//   - <main> with the padding that clears the fixed admin sidebar
//   - Gold-accented topbar (reused from the retention surface — the bar is
//     visually generic enough that we don't need a settings-specific copy)
//
// Mirrors app/admin/retention/layout.jsx so the two surfaces share the same
// chrome footprint without coupling their page contents.

export default function SettingsLayout({ children }) {
  return (
    <AdminRouteGuard>
      <main className="xl:admin-content-pl min-h-screen px-6 py-6 xl:pr-12">
        <div className="flex flex-col gap-4">
          <RetentionTopBar />
          {children}
        </div>
      </main>
    </AdminRouteGuard>
  );
}
