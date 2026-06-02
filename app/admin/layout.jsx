"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "../components/admin/Sidebar";
import RetentionTopBar from "../components/admin/retention/RetentionTopBar";
import { AdminRouteGuard } from "../components/guards/AdminRouteGuard";
import { getStoredSidebarCollapsed, SidebarProvider, useSidebar } from "../contexts/SidebarContext";
import { ToastProvider } from "../components/admin/ui/Toast";

// Sidebar widths — must match the values the sidebar component renders with.
// Kept here so both the aside and any consumer of `--admin-sidebar-w` agree.
const SIDEBAR_WIDTH_EXPANDED = 326;
const SIDEBAR_WIDTH_COLLAPSED = 88;
const SIDEBAR_TRANSITION = { duration: 0.3, ease: [0.4, 0, 0.2, 1] };

function AdminShellLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07190d]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#f2cb7a]/30 border-t-[#f2cb7a]" />
        <p className="text-[13px] font-medium text-[#fbeed2]/70">Loading admin panel...</p>
      </div>
    </div>
  );
}

function AdminLayoutInner({ children }) {
  const { collapsed } = useSidebar();
  const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    // Expose the current sidebar width as a CSS variable. Admin pages use the
    // `admin-content-pl` helper class (defined in globals.css) which reads this
    // variable to keep its left padding in sync with the sidebar — so the
    // content reflows smoothly when the user toggles collapse/expand.
    <div
      className="min-h-screen bg-[#07190d]"
      style={{ "--admin-sidebar-w": `${width}px` }}
    >
      <motion.aside
        className="fixed left-6 top-6 bottom-6 z-20 hidden xl:block"
        animate={{ width }}
        transition={SIDEBAR_TRANSITION}
        initial={false}
      >
        <Sidebar />
      </motion.aside>

      <div className="px-4 pt-4 sm:px-6 sm:pt-6 xl:admin-content-pl xl:pr-12">
        <RetentionTopBar />
      </div>

      {children}
    </div>
  );
}

/**
 * Admin layout — renders the persistent sidebar + dark background once,
 * so navigating between admin pages doesn't unmount/remount the sidebar.
 *
 * Each admin page renders its own <main> with the `admin-content-pl` helper
 * class to clear the fixed sidebar. The padding animates with the sidebar.
 *
 * The login page (/admin/login) bypasses this chrome — it's a
 * full-bleed centered form.
 */
export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [initialSidebarCollapsed, setInitialSidebarCollapsed] = useState(false);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    setInitialSidebarCollapsed(getStoredSidebarCollapsed(false));
    setMounted(true);
  }, []);

  if (isLogin) {
    return children;
  }

  if (!mounted) {
    return <AdminShellLoading />;
  }

  return (
    <SidebarProvider initialCollapsed={initialSidebarCollapsed}>
      <ToastProvider>
        <AdminRouteGuard>
          <AdminLayoutInner>{children}</AdminLayoutInner>
        </AdminRouteGuard>
      </ToastProvider>
    </SidebarProvider>
  );
}
