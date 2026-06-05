"use client";

import { usePathname } from "next/navigation";
import AppLayout from "./components/layout/AppLayout";
import { MemberRouteGuard } from "./components/guards/MemberRouteGuard";
import { UserProvider } from "./contexts/UserContext";

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
      <MemberRouteGuard>
        <div className="min-h-screen max-w-[475px] mx-auto overflow-hidden">
          <AppLayout>{children}</AppLayout>
        </div>
      </MemberRouteGuard>
    </UserProvider>
  );
}
