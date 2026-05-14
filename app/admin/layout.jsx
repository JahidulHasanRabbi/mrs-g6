"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "../components/admin/Sidebar";
import { SidebarProvider, useSidebar } from "../contexts/SidebarContext";

// Sidebar widths — must match the values the sidebar component renders with.
// Kept here so both the aside and any consumer of `--admin-sidebar-w` agree.
const SIDEBAR_WIDTH_EXPANDED = 326;
const SIDEBAR_WIDTH_COLLAPSED = 88;
const SIDEBAR_TRANSITION = { duration: 0.3, ease: [0.4, 0, 0.2, 1] };

function AdminLayoutInner({ children }) {
  const { collapsed } = useSidebar();
  const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    // Expose the current sidebar width as a CSS variable so pages that want to
    // respond to the collapse (e.g. shifting their left padding) can do so via
    // `pl-[calc(var(--admin-sidebar-w)+...)]`. Existing pages still use a fixed
    // xl:pl-[388px] and continue to work — they just keep an empty band when
    // the sidebar is collapsed.
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

      {children}
    </div>
  );
}

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
    <SidebarProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SidebarProvider>
  );
}
