"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { generateLeaderboardRanking } from "../../api/adminApi";
import Button from "../../components/admin/ui/Button";
import { useToast } from "../../components/admin/ui/Toast";

const BOARDS = {
  "/admin/leaderboards/deposit": { title: "Deposit", type: 1 },
  "/admin/leaderboards/referrer": { title: "Referrer", type: 3 },
  "/admin/leaderboards/withdrawal": { title: "Withdrawal", type: 2 },
};

function resolveTitle(pathname) {
  if (!pathname) return "Deposit";
  if (pathname.startsWith("/admin/leaderboards/deposit")) return "Deposit";
  if (pathname.startsWith("/admin/leaderboards/referrer")) return "Referrer";
  if (pathname.startsWith("/admin/leaderboards/withdrawal")) return "Withdrawal";
  return "Deposit";
}

function resolveBoard(pathname) {
  return BOARDS[pathname?.replace(/\/$/, "")] ?? null;
}

function RankingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 21V11" />
      <path d="M12 21V3" />
      <path d="M18 21v-7" />
      <path d="M3 21h18" />
    </svg>
  );
}

export default function LeaderboardsLayout({ children }) {
  const pathname = usePathname();
  const title = resolveTitle(pathname);
  const board = resolveBoard(pathname);
  const toast = useToast();
  const [generating, setGenerating] = useState(false);

  const onGenerateRanking = async () => {
    if (!board || generating) return;
    setGenerating(true);
    try {
      const rows = await generateLeaderboardRanking(board.type);
      const count = Array.isArray(rows) ? rows.length : 0;
      toast.success(`${board.title} ranking generated`, {
        description: `Stored latest Top ${count || 20} batch.`,
      });
    } catch (error) {
      const detail =
        error?.data?.detail ||
        (error?.data && typeof error.data === "object"
          ? Object.values(error.data).flat()[0]
          : null) ||
        error?.message ||
        "Please try again.";
      toast.error(`Failed to generate ${board.title.toLowerCase()} ranking`, {
        description: detail,
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="xl:admin-content-pl min-h-screen px-4 py-4 sm:px-6 sm:py-6 xl:pr-12">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-end gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
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
          {board && (
            <Button
              type="button"
              size="lg"
              loading={generating}
              iconLeft={<RankingIcon />}
              onClick={onGenerateRanking}
              className="w-full sm:w-auto"
            >
              Generate Ranking
            </Button>
          )}
        </div>
        {children}
      </div>
    </main>
  );
}
