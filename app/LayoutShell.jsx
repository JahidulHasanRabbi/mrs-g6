"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import AppLayout from "./components/layout/AppLayout";
import { MemberRouteGuard } from "./components/guards/MemberRouteGuard";
import { UserProvider } from "./contexts/UserContext";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname?.startsWith("/admin/");

  if (isAdminRoute) {
    return <div className="admin-typography min-h-screen w-full">{children}</div>;
  }

  // Public marketing pages render full-bleed (no member chrome, no width clamp,
  // no MemberRouteGuard) — the desktop landing page is designed at 1440px.
  const isPublicRoute = pathname === "/landing" || pathname?.startsWith("/landing/");

  if (isPublicRoute) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  return (
    <UserProvider>
      <ThemeProvider>
        <MemberRouteGuard>
          <div className="min-h-screen max-w-[475px] mx-auto overflow-hidden">
            {/* One boundary for every lazy skin chunk, and it lives above the
                router so it survives navigation. React keeps the screen the
                member is already looking at while the next route's skin loads,
                instead of dropping to a fallback. */}
            <Suspense fallback={<div className="min-h-screen w-full skin-backdrop" />}>
              <AppLayout>{children}</AppLayout>
            </Suspense>
          </div>
        </MemberRouteGuard>
      </ThemeProvider>
    </UserProvider>
  );
}
