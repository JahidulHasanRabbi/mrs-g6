"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "../contexts/ThemeContext";
import ThemedPageShell from "../components/themes/shared/ThemedPageShell";
import { FooterNav } from "../components/footer";
import { HamburgerMenu } from "../components/hamburger";
import LeaderboardTabs from "../components/leaderboard-new/LeaderboardTabs";
import LeaderboardView from "../components/leaderboard-new/LeaderboardView";
import {
  LEADERBOARD_TYPES,
  LEADERBOARD_CONFIG,
  ENABLED_LEADERBOARD_TYPES,
} from "../components/leaderboard-new/constants";
import { formatAmount } from "../components/leaderboard-new/format";
import {
  TURNOVER_PREVIEW_BOARD,
  TURNOVER_EVENT_COUNTDOWN,
  PREVIEW_MY_RANK,
  PREVIEW_MY_RANK_STATES,
} from "../components/leaderboard-new/turnoverPreview";
import { PHASE4_PREVIEW_ENABLED, TURNOVER_MAINTENANCE } from "../config/phase4";
import {
  getPublicDepositRanking,
  getPublicWithdrawRanking,
  getPublicReferralRanking,
  getPublicLeaderboardInfo,
  getPublicLeaderboardCampaign,
  getPublicTermsAndConditions,
  getMemberDepositRewardItems,
  getMemberReferrerRewardItems,
  getMemberWithdrawalRewardItems,
  getPublicLeaderboardStatus,
} from "../api/memberApi";

// type = leaderboard info/ranking API. termsCategory = main T&C API category.
const BOARD_META = {
  [LEADERBOARD_TYPES.DEPOSIT]: {
    type: 1,
    termsCategory: 2,
    getRanking: getPublicDepositRanking,
    getRewards: getMemberDepositRewardItems,
  },
  [LEADERBOARD_TYPES.WITHDRAWAL]: {
    type: 2,
    termsCategory: 3,
    getRanking: getPublicWithdrawRanking,
    getRewards: getMemberWithdrawalRewardItems,
  },
  [LEADERBOARD_TYPES.REFERRER]: {
    type: 3,
    termsCategory: 4,
    getRanking: getPublicReferralRanking,
    getRewards: getMemberReferrerRewardItems,
  },
};

const EMPTY_BOARD = {
  top3: [],
  table: [],
  endDate: null,
  notes: [],
  terms: [],
  infoTerms: [],
  myRank: null,
};

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

function formatPrize(reward) {
  if (!reward) return "";
  // Token rewards (item_type 3) carry token_amount instead of credit_amount.
  const tokens = reward.token_amount;
  if (tokens != null && tokens !== "" && Number(tokens) > 0) {
    return `${formatAmount(tokens)} Tokens`;
  }
  const credit = reward.credit_amount ?? reward.reward_amount ?? reward.prize_amount;
  if (credit != null && credit !== "") return `RM ${formatAmount(credit)}`;
  return reward.reward_name || reward.prize || reward.prize_name || "";
}

function buildPrizeMap(rewardsResponse) {
  const map = new Map();
  asList(rewardsResponse).forEach((reward) => {
    const position = Number(reward.position ?? reward.rank_position ?? reward.rank);
    if (!Number.isFinite(position) || position <= 0) return;
    map.set(position, formatPrize(reward));
  });
  return map;
}

function getEntryPrize(entry, rank, prizeMap) {
  return prizeMap.get(Number(rank)) || formatPrize(entry);
}

function collectInfoNotes(rows) {
  return asList(rows).flatMap((row) => splitLines(row?.information));
}

function collectInfoTerms(rows) {
  return asList(rows).flatMap((row) => splitLines(row?.terms_and_conditions));
}
function pickLatestNonEmpty(rows, field) {
  const list = asList(rows);
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const value = list[i]?.[field];
    if (String(value || "").trim()) return list[i];
  }
  return list[0] || null;
}


function InfoTermsModal({ terms, color, onClose }) {
  const rows = Array.isArray(terms) ? terms.filter(Boolean) : [];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-[380px] rounded-2xl border border-[#e9af41]/35 bg-[#0a1a0a] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2
            className="text-[18px] font-bold"
            style={{ color: color || "#e9af41", fontFamily: "var(--font-inter)" }}
          >
            Terms &amp; Conditions
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-[#e9af41]/50 text-[#e9af41]"
            aria-label="Close terms"
          >
            x
          </button>
        </div>

        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
          {rows.length ? rows.map((term, index) => (
            <div key={`${term}-${index}`} className="flex items-start gap-3">
              <span
                className="shrink-0 text-[13px] font-semibold"
                style={{ color: color || "#e9af41", fontFamily: "var(--font-inter)" }}
              >
                {String(index + 1).padStart(2, "0")}.
              </span>
              <p className="text-[13px] leading-5 text-[#ddc1ae]" style={{ fontFamily: "var(--font-inter)" }}>
                {term}
              </p>
            </div>
          )) : (
            <p className="text-[13px] leading-5 text-[#ddc1ae]" style={{ fontFamily: "var(--font-inter)" }}>
              No terms and conditions available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
function Top20LeaderboardPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userData } = useUser();
  const { isThemed } = useTheme();
  const tabParam = searchParams.get("tab");
  const activeTab =
    tabParam && ENABLED_LEADERBOARD_TYPES.includes(tabParam)
      ? tabParam
      : LEADERBOARD_TYPES.DEPOSIT;
  const isTurnoverPreview =
    PHASE4_PREVIEW_ENABLED && activeTab === LEADERBOARD_TYPES.TURNOVER;
  // Review affordance for the mock My Rank states (?myrank=top|unranked).
  // Inert unless the preview flag is on, and gone with the mock data.
  const myRankOverride = PHASE4_PREVIEW_ENABLED
    ? PREVIEW_MY_RANK_STATES[searchParams.get("myrank")] ?? null
    : null;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [data, setData] = useState(EMPTY_BOARD);
  const [loading, setLoading] = useState(true);
  // null = not checked yet, so the maintenance overlay never flashes on load.
  const [maintenance, setMaintenance] = useState(null);
  // Requirement 6: Turnover answers to its own switch, so putting the shared
  // leaderboard into maintenance must not take the event board down with it.
  const isMaintenance = isTurnoverPreview
    ? TURNOVER_MAINTENANCE
    : maintenance === true;
  // Cache each tab's loaded board so switching back doesn't refetch.
  const boardCache = useRef({});

  // Single admin toggle (PUT /leaderboard/status/ { is_open }) covers all
  // three boards (Deposit/Withdraw/Referral) at once — there's no per-type
  // switch, so this one check gates the whole page.
  useEffect(() => {
    // A direct Turnover-preview visit never calls the shared status endpoint;
    // once it has answered, leaving that tab must not refetch it.
    if (isTurnoverPreview || maintenance !== null) return undefined;
    getPublicLeaderboardStatus()
      .then((s) => setMaintenance(s?.is_open === false))
      .catch(() => setMaintenance(false));
    return undefined;
  }, [isTurnoverPreview, maintenance]);

  useEffect(() => {
    if (!isMaintenance || typeof document === "undefined") return undefined;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.scrollTo({ top: 0, left: 0 });
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isMaintenance]);

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
    if (isTurnoverPreview) {
      setData(TURNOVER_PREVIEW_BOARD);
      setLoading(false);
      return undefined;
    }
    if (maintenance !== false) return undefined;
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
      meta.getRewards({ page_size: 100 }).catch(() => []),
    ]).then(([ranking, info, campaign, mainTerms, rewards]) => {
      if (cancelled) return;
      const prizeMap = buildPrizeMap(rewards);
      const entries = asList(ranking).map((e, i) => {
        const rank = e.rank ?? i + 1;
        return {
          rank,
          user: e.display_name ?? "",
          value: formatAmount(e.amount),
          prize: getEntryPrize(e, rank, prizeMap),
        };
      });
      const notes = collectInfoNotes(info);
      const infoTerms = collectInfoTerms(info);
      const campRec = pickLatestNonEmpty(campaign, "end_date");
      const board = {
        top3: entries.slice(0, 3),
        table: entries.slice(3),
        endDate: campRec?.end_date ? new Date(campRec.end_date).getTime() : null,
        notes,
        infoTerms,
        terms: splitLines(mainTerms?.terms_and_conditions),
        // My Rank has no endpoint yet. While the preview flag is on the panel
        // is filled with mock values (tagged PREVIEW in the UI); with the flag
        // off it stays null and the section doesn't render.
        myRank: PHASE4_PREVIEW_ENABLED ? PREVIEW_MY_RANK[activeTab] ?? null : null,
      };
      boardCache.current[activeTab] = board;
      setData(board);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [activeTab, isTurnoverPreview, maintenance]);

  const config = LEADERBOARD_CONFIG[activeTab];

  const page = (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden"
      style={
        isThemed
          ? undefined
          : {
              background:
                "radial-gradient(ellipse at center, rgba(0,130,43,1) 0%, rgba(4,78,28,1) 25%, rgba(5,51,21,1) 50%, rgba(7,25,13,1) 100%)",
            }
      }
    >
      {!isThemed && (
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
                  fontFamily: '\"Times New Roman\", serif',
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
          <button
            type="button"
            onClick={() => setIsInfoOpen(true)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-[#e9af41] text-[18px] font-bold italic text-[#e9af41]"
            style={{ fontFamily: "var(--font-inter)" }}
            aria-label="Leaderboard terms and conditions"
          >
            i
          </button>
        </div>
      )}

      <div className={`flex-1 pb-[140px] ${isThemed ? "pt-2" : "pt-[84px]"}`}>
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
              periodLabel={config.eventPeriod || data.periodLabel || ""}
              updateNotes={data.notes}
              terms={data.terms}
              loading={loading}
              myRank={myRankOverride ?? data.myRank}
              countdownLabel={isTurnoverPreview ? TURNOVER_EVENT_COUNTDOWN.label : undefined}
            />
          </AnimatePresence>
        </div>
      </div>

      {isInfoOpen && (
        <InfoTermsModal
          terms={data.infoTerms}
          color={config.color}
          onClose={() => setIsInfoOpen(false)}
        />
      )}
      {!isThemed && (
        <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      )}
      {!isThemed && <FooterNav />}

      {isMaintenance && (
        <div className="fixed inset-x-0 top-[68px] bottom-[100px] z-30 grid place-items-center bg-black/70 px-6 backdrop-blur-md">
          <div
            className="w-full max-w-[360px] rounded-[16px] border border-white/15 px-6 py-7 text-center shadow-[0_16px_50px_rgba(0,0,0,0.45)]"
            style={{ backgroundColor: "rgba(7,25,13,0.95)" }}
          >
            <p
              className="text-[20px] font-bold"
              style={{ color: "#e9af41", fontFamily: "var(--font-inter)" }}
            >
              Leaderboard is under maintenance
            </p>
            <p
              className="mt-3 text-[12px] leading-5 text-[#a8bdb4]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Please check back later.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // The info chip lives in the themed header; wire it to the same info modal.
  if (isThemed) {
    return (
      <ThemedPageShell
        onInfoClick={() => setIsInfoOpen(true)}
        balance={userData?.balance}
      >
        {page}
      </ThemedPageShell>
    );
  }
  return page;
}

export default function Top20LeaderboardPage() {
  return (
    <Suspense fallback={null}>
      <Top20LeaderboardPageInner />
    </Suspense>
  );
}
