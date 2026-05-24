"use client";

import { usePathname } from "next/navigation";
import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import RetentionTopBar from "../../components/admin/retention/RetentionTopBar";
import { WorldCupSettingsProvider } from "../../contexts/WorldCupSettingsContext";

const TITLE_BY_PATH = {
  "/admin/world-cup": "World Cup Dashboard",
  "/admin/world-cup/predictions": "Predictions",
  "/admin/world-cup/settings": "Settings",
  "/admin/world-cup/settings/banner": "Settings",
  "/admin/world-cup/settings/reward": "Settings",
  "/admin/world-cup/settings/dummy": "Settings",
};

function resolveTitle(pathname) {
  if (!pathname) return "Settings";
  if (pathname.startsWith("/admin/world-cup/settings")) return "Settings";
  if (pathname.startsWith("/admin/world-cup/predictions")) return "Predictions";
  if (pathname.startsWith("/admin/world-cup")) return "World Cup Dashboard";
  return "World Cup";
}

export default function WorldCupLayout({ children }) {
  const pathname = usePathname();
  const title = TITLE_BY_PATH[pathname] ?? resolveTitle(pathname);

  return (
    <AdminRouteGuard>
      <WorldCupSettingsProvider>
        <main className="xl:admin-content-pl min-h-screen px-4 py-4 sm:px-6 sm:py-6 xl:pr-12">
          <div className="flex flex-col gap-4">
            <RetentionTopBar />
            <div className="flex flex-col items-end px-2">
              <div className="flex w-full flex-col gap-1">
                <p className="text-[12px] font-medium leading-[18px] text-white">WORLD CUP LEADERBOARDS</p>
                <h1
                  className="bg-clip-text text-[34px] font-bold leading-[1.05] text-transparent sm:text-[40px] lg:text-[46px]"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    backgroundImage: "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)",
                  }}
                >
                  {title}
                </h1>
              </div>
            </div>
            {children}
          </div>
        </main>
      </WorldCupSettingsProvider>
    </AdminRouteGuard>
  );
}
