"use client";

import { usePathname } from "next/navigation";
import AppLayout from "./components/layout/AppLayout";
import { MemberRouteGuard } from "./components/guards/MemberRouteGuard";

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname?.startsWith("/admin/");

  if (isAdminRoute) {
    return <div className="admin-typography min-h-screen w-full">{children}</div>;
  }

  return (
    <MemberRouteGuard>
      <div className="min-h-screen max-w-[475px] mx-auto overflow-hidden">
        <AppLayout>{children}</AppLayout>
      </div>
    </MemberRouteGuard>
  );
}
