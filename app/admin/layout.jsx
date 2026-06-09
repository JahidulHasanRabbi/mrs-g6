"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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

// Content slide on nav change — keyed by pathname so it replays whenever the
// sidebar selection changes. Enters from above and drops into place
// (top → bottom). The sidebar and topbar live outside this wrapper so they
// stay put while only the page body animates.
const CONTENT_SLIDE = {
  initial: { opacity: 0, y: -48 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

// Hamburger glyph for the mobile drawer toggle (shown below the xl breakpoint
// where the fixed desktop sidebar is hidden).
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function AdminLayoutInner({ children }) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the route changes — tapping a menu item
  // navigates, so the drawer should get out of the way.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

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

      {/* Mobile drawer — below xl the fixed sidebar is hidden, so the same
          Sidebar slides in over the content with a tap-to-dismiss backdrop. */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="xl:hidden">
            <motion.div
              className="fixed inset-0 z-40 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-2 top-2 bottom-2 z-50 w-[326px] max-w-[85vw]"
              initial={{ x: "-110%" }}
              animate={{ x: 0 }}
              exit={{ x: "-110%" }}
              transition={SIDEBAR_TRANSITION}
            >
              <Sidebar />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="px-4 pt-4 sm:px-6 sm:pt-6 xl:admin-content-pl xl:pr-12">
        <div className="flex items-stretch gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex shrink-0 items-center justify-center rounded-[12px] border border-[#f2cb7a]/40 bg-[#141828] px-3 text-[#e9af41] transition-colors hover:bg-white/5 xl:hidden"
          >
            <MenuIcon />
          </button>
          <div className="min-w-0 flex-1">
            <RetentionTopBar />
          </div>
        </div>
      </div>

      <motion.div
        key={pathname}
        initial={CONTENT_SLIDE.initial}
        animate={CONTENT_SLIDE.animate}
        transition={CONTENT_SLIDE.transition}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
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
