"use client";

import { usePathname } from "next/navigation";
import Sidebar from "../components/admin/Sidebar";

/**
 * Admin layout — renders the persistent sidebar + dark background once,
 * so navigating between admin pages doesn't unmount/remount the sidebar.
 *
 * Each admin page is responsible for its own <main> with the appropriate
 * left padding (xl:pl-[388px]) to clear the fixed sidebar.
 *
 * The login page (/admin/login) bypasses this chrome — it's a
 * full-bleed centered form.
 */
export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return children;
  }

  return (
    <div className="min-h-screen bg-[#07190d]">
      {/* Persistent sidebar — never remounts during admin → admin navigation */}
      <aside className="fixed left-6 top-6 bottom-6 z-20 w-[326px] hidden xl:block">
        <Sidebar />
      </aside>

      {children}
    </div>
  );
}
