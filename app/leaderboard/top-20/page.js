"use client";

import { Suspense, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { FooterNav } from "../../components/footer";
import { HamburgerMenu } from "../../components/hamburger";
import LeaderboardTabs from "../../components/leaderboard-new/LeaderboardTabs";
import LeaderboardView from "../../components/leaderboard-new/LeaderboardView";
import {
  LEADERBOARD_TYPES,
  LEADERBOARD_CONFIG,
} from "../../components/leaderboard-new/constants";

const MOCK_DEPOSIT = {
  top3: [
    { rank: 1, user: "60*******100", value: "1,700", prize: "RM 1,888" },
    { rank: 2, user: "60*******100", value: "1,400", prize: "RM 1,888" },
    { rank: 3, user: "60*******100", value: "1,200", prize: "RM 888" },
  ],
  table: Array.from({ length: 17 }, (_, i) => ({
    rank: i + 4,
    user: `${(i + 6) * 10}****787`,
    value: `${(840 - i * 40).toFixed(2)}`,
    prize: `RM ${288 + i * 20}`,
    isCurrentUser: i + 4 === 5,
  })),
};

const MOCK_REFERRER = {
  top3: [
    { rank: 1, user: "60*******100", value: "700", prize: "RM 1,888" },
    { rank: 2, user: "60*******100", value: "400", prize: "RM 1,888" },
    { rank: 3, user: "60*******100", value: "200", prize: "RM 888" },
  ],
  table: Array.from({ length: 17 }, (_, i) => ({
    rank: i + 4,
    user: `${(i + 6) * 10}****787`,
    value: `${233 - i * 12}`,
    prize: `RM ${288 + i * 20}`,
    isCurrentUser: i + 4 === 5,
  })),
};

const MOCK_WITHDRAWAL = {
  top3: [
    { rank: 1, user: "60*******100", value: "1,700" },
    { rank: 2, user: "60*******100", value: "1,400" },
    { rank: 3, user: "60*******100", value: "1,200" },
  ],
  table: Array.from({ length: 17 }, (_, i) => ({
    rank: i + 4,
    user: `${(i + 6) * 10}****78${i % 2 === 0 ? "6" : "7"}`,
    value: `RM ${288 + i * 20}`,
    isCurrentUser: i + 4 === 5,
  })),
};

const MOCK_DATA = {
  [LEADERBOARD_TYPES.DEPOSIT]: MOCK_DEPOSIT,
  [LEADERBOARD_TYPES.REFERRER]: MOCK_REFERRER,
  [LEADERBOARD_TYPES.WITHDRAWAL]: MOCK_WITHDRAWAL,
};

const CAMPAIGN_END = new Date("2026-07-31T23:59:59").getTime();

const UPDATE_NOTES = [
  "* Result Will Be Updated On Every Monday.",
  "* Current Result: Updated On 01 July 2026 - Showing Deposit Made On July Only",
];

const TERMS = [
  "Deposit Leaderboard campaign is valid from 1st July 2026 to 31st July 2026. Only successful deposits made within this period qualify for ranking points.",
  "Ranking is determined by the total accumulated deposit amount. In the event of a tie, the user who reached the total amount first will be ranked higher.",
  "Prizes will be credited to the winner's wallet within 3 working days after the campaign ends. All prizes are subject to a 1x turnover requirement before withdrawal.",
  "Any form of fraudulent activity, including multiple account creation or bonus abuse, will result in immediate disqualification and account suspension.",
  "KingGroup reserves the right to modify or cancel the promotion at any time without prior notice. The management's decision is final and binding.",
];

function Top20LeaderboardPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabParam = searchParams.get("tab");
  const activeTab =
    tabParam && Object.values(LEADERBOARD_TYPES).includes(tabParam)
      ? tabParam
      : LEADERBOARD_TYPES.DEPOSIT;

  const handleTabChange = useCallback(
    (tab) => {
      const params = new URLSearchParams();
      if (tab !== LEADERBOARD_TYPES.DEPOSIT) params.set("tab", tab);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  const config = LEADERBOARD_CONFIG[activeTab];
  const data = MOCK_DATA[activeTab];

  return (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(0,130,43,1) 0%, rgba(4,78,28,1) 25%, rgba(5,51,21,1) 50%, rgba(7,25,13,1) 100%)",
      }}
    >
      <div className="fixed top-0 left-1/2 z-50 flex h-[72px] w-full max-w-[475px] -translate-x-1/2 items-center justify-between border-b-2 border-[#e9af41]/60 bg-[#0a1a0a]/95 px-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex cursor-pointer flex-col items-center gap-0"
            aria-label="Open menu"
          >
            <img
              src="/assets/images/hamburger-icon.png"
              alt="Menu"
              className="h-9 w-9 object-contain"
            />
            <p
              className="-mt-1 text-[14px] font-bold"
              style={{
                fontFamily: '"Times New Roman", serif',
                color: "#e9af41",
              }}
            >
              Menu
            </p>
          </button>

          <h1
            className="text-2xl font-semibold uppercase tracking-[-1.2px]"
            style={{
              color: config.color,
              fontFamily: "var(--font-inter)",
              transition: "color 0.3s ease",
            }}
          >
            Leaderboards
          </h1>
        </div>
      </div>

      <div className="flex-1 pb-[140px] pt-[84px]">
        <div className="flex w-full flex-col items-center gap-6">
          <div className="w-full px-4">
            <LeaderboardTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          <AnimatePresence mode="wait">
            <LeaderboardView
              key={activeTab}
              config={config}
              top3={data.top3}
              tableEntries={data.table}
              currentUserRank={5}
              campaignEndDate={CAMPAIGN_END}
              periodLabel="June 2026 Leaderboard"
              updateNotes={UPDATE_NOTES}
              terms={TERMS}
            />
          </AnimatePresence>
        </div>
      </div>

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <FooterNav />
    </div>
  );
}

export default function Top20LeaderboardPage() {
  return (
    <Suspense fallback={null}>
      <Top20LeaderboardPageInner />
    </Suspense>
  );
}
