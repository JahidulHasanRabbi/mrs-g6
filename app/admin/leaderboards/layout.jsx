"use client";

import { usePathname } from "next/navigation";

function resolveTitle(pathname) {
  if (!pathname) return "Deposit";
  if (pathname.startsWith("/admin/leaderboards/deposit")) return "Deposit";
  if (pathname.startsWith("/admin/leaderboards/referrer")) return "Referrer";
  return "Deposit";
}

export default function LeaderboardsLayout({ children }) {
  const pathname = usePathname();
  const title = resolveTitle(pathname);

  return (
    <main className="xl:admin-content-pl min-h-screen px-4 py-4 sm:px-6 sm:py-6 xl:pr-12">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-end px-2">
          <div className="flex w-full flex-col gap-1">
            <p className="text-[12px] font-medium leading-[18px] text-white">LEADERBOARDS</p>
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
  );
}
