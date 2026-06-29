"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
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
import {
  getPublicDepositRanking,
  getPublicWithdrawRanking,
  getPublicReferralRanking,
  getPublicLeaderboardInfo,
  getPublicLeaderboardCampaign,
  getPublicTermsAndConditions,
} from "../../api/memberApi";

// type = leaderboard info/ranking API. termsCategory = main T&C API category.
const BOARD_META = {
  [LEADERBOARD_TYPES.DEPOSIT]: {
    type: 1,
    termsCategory: 2,
    getRanking: getPublicDepositRanking,
  },
  [LEADERBOARD_TYPES.WITHDRAWAL]: {
    type: 2,
    termsCategory: 3,
    getRanking: getPublicWithdrawRanking,
  },
  [LEADERBOARD_TYPES.REFERRER]: {
    type: 3,
    termsCategory: 4,
    getRanking: getPublicReferralRanking,
  },
};

const EMPTY_BOARD = { top3: [], table: [], endDate: null, notes: [], terms: [] };

function asList(response) {
  if (Array.isArray(response)) return response;
  return response?.results ?? (response ? [response] : []);
}

function splitLines(text) {
  return String(text || "")
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatAmount(amount) {
  if (amount == null) return "";
  const num = Number(String(amount).replace(/,/g, ""));
  return Number.isFinite(num) ? num.toLocaleString("en-US") : String(amount);
}

function Top20LeaderboardPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [data, setData] = useState(EMPTY_BOARD);
  const [loading, setLoading] = useState(true);
  // Cache each tab's loaded board so switching back doesn't refetch.
  const boardCache = useRef({});

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

  useEffect(() => {
    let cancelled = false;
    // Already loaded this tab - show cached data, skip the API calls.
    if (boardCache.current[activeTab]) {
      setData(boardCache.current[activeTab]);
      setLoading(false);
      return;
    }
    const meta = BOARD_META[activeTab];
    setData(EMPTY_BOARD);
    setLoading(true);
    Promise.all([
      meta.getRanking().catch(() => []),
      getPublicLeaderboardInfo(meta.type).catch(() => null),
      getPublicLeaderboardCampaign(meta.type).catch(() => null),
      getPublicTermsAndConditions(meta.termsCategory).catch(() => null),
    ]).then(([ranking, info, campaign, mainTerms]) => {
      if (cancelled) return;
      const entries = asList(ranking).map((e, i) => ({
        rank: e.rank ?? i + 1,
        user: e.display_name ?? "",
        value: formatAmount(e.amount),
      }));
      const infoRec = asList(info)[0];
      const campRec = asList(campaign)[0];
      const board = {
        top3: entries.slice(0, 3),
        table: entries.slice(3),
        endDate: campRec?.end_date ? new Date(campRec.end_date).getTime() : null,
        notes: infoRec?.information ? splitLines(infoRec.information) : [],
        terms: splitLines(mainTerms?.terms_and_conditions),
      };
      boardCache.current[activeTab] = board;
      setData(board);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const config = LEADERBOARD_CONFIG[activeTab];

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
              currentUserRank={null}
              campaignEndDate={data.endDate}
              periodLabel=""
              updateNotes={data.notes}
              terms={data.terms}
              loading={loading}
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