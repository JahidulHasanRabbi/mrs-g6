"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import SmashEggHeader from "../components/smash-egg/SmashEggHeader";
import EggAnimation from "../components/smash-egg/EggAnimation";
import TokenBalance from "../components/smash-egg/TokenBalance";
import DrawButtons from "../components/smash-egg/DrawButtons";
import PrizeList from "../components/smash-egg/PrizeList";
import WinnerList from "../components/smash-egg/WinnerList";
import SmashEggTerms from "../components/smash-egg/SmashEggTerms";
import SmashEggHistoryDialog from "../components/smash-egg/SmashEggHistoryDialog";
import { FooterNav } from "../components/footer";
import { HamburgerMenu } from "../components/hamburger";
import { SMASH_EGG_ASSETS } from "../components/smash-egg/smashEggAssets";
import { useUser } from "../contexts/UserContext";
import SmashEggResultModal from "../components/smash-egg/SmashEggResultModal";
import {
  fiftySmash,
  getAllSmashEggItems,
  getPublicTermsAndConditions,
  getSmashEggHistory,
  getSmashEggSettings,
  getSmashEggWinningList,
  hundredSmash,
  oneSmash,
  tenSmash,
} from "../api/memberApi";
import { mapSmashEggItems } from "../api/responseMappers";
import { tokenStorage } from "../api/tokenStorage";
import { BASE_URL } from "../api/api";
import { useTheme } from "../contexts/ThemeContext";
import Acebet77SmashEggPage from "../components/themes/acebet77/Acebet77SmashEggPage";

const HISTORY_PAGE_SIZE = 10;
const SMASH_EGG_TERMS_CATEGORY = 6;

function buildRewardBoard(items) {
  const prizeItems = items
    .filter((item) => item.itemType !== "Free credit")
    .map((item, index) => ({
      rank: index + 1,
      name: item.name,
      image: item.itemType === "Prize" ? item.image : null,
      itemType: item.itemType,
    }));

  const creditRanges = items
    .filter((item) => item.itemType === "Free credit")
    .map((item) => `RM${item.minWithdraw || 0} ~ RM${item.maxWithdraw || 0}`);

  return { prizes: prizeItems, creditRanges };
}

function maskName(name) {
  if (!name) return "";
  if (name.includes("*")) return name;
  if (name.length <= 2) return `${name[0] || ""}*`;
  if (name.length <= 4) return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;
  return `${name.slice(0, 2)}${"*".repeat(name.length - 4)}${name.slice(-2)}`;
}

function mapWinningHistory(items) {
  const rows = Array.isArray(items)
    ? items
    : Array.isArray(items?.value)
      ? items.value
      : Array.isArray(items?.results)
        ? items.results
        : [];

  return rows.map((item) => {
    const date = item.datetime_obtained
      ? new Date(item.datetime_obtained).toISOString().slice(0, 10)
      : "";

    return {
      date,
      name: maskName(item.display_name),
      prize: item.prize_name,
    };
  });
}

function normalizeSmashResults(response) {
  if (Array.isArray(response)) return response;
  if (response && typeof response === "object") {
    if (response.uuid && response.reward_name !== undefined) return [response];
    if (Array.isArray(response.results)) return response.results;
    if (Array.isArray(response.value)) return response.value;
  }
  return [];
}

function inferResultType(result, rewardLookup) {
  const matched = rewardLookup.get(result.uuid);
  if (matched?.itemType) return matched.itemType;
  if (/^RM\s?\d/i.test(String(result.reward_name || ""))) return "Free credit";
  if (/token/i.test(String(result.reward_name || ""))) return "Token";
  return "Prize";
}

function resolveApiImagePath(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;
}

function formatPrizeSummary(results, rewards) {
  if (!results.length) {
    return { label: "Smash completed", items: [] };
  }

  const rewardLookup = new Map(rewards.map((item) => [item.uuid, item]));
  const grouped = results.reduce((acc, item) => {
    const name = item.reward_name || "Reward";
    const itemType = inferResultType(item, rewardLookup);
    const matched = rewardLookup.get(item.uuid);
    const key = `${item.uuid || name}-${name}`;
    if (!acc[key]) {
      acc[key] = {
        uuid: item.uuid,
        name,
        itemType,
        image: itemType === "Prize" ? resolveApiImagePath(item.image || matched?.image) : null,
        count: 0,
      };
    }
    acc[key].count += 1;
    return acc;
  }, {});

  const items = Object.values(grouped);
  return {
    label: items.length === 1
      ? `${items[0].count > 1 ? `${items[0].count}x ` : ""}${items[0].name}`
      : `${results.length} rewards won`,
    items,
  };
}

function DefaultSmashEggPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCracked, setIsCracked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const [smashRewards, setSmashRewards] = useState([]);
  const [winningHistory, setWinningHistory] = useState([]);
  const [tokensPerRound, setTokensPerRound] = useState(10);
  const [gameEnabled, setGameEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [termsText, setTermsText] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { userData, refreshUserData } = useUser();

  const tokenBalance = userData?.balance ?? 0;
  const memberUuid = tokenStorage.getMemberUuid();
  const rewardBoard = useMemo(() => buildRewardBoard(smashRewards), [smashRewards]);

  useEffect(() => {
    let cancelled = false;

    async function loadSmashRewards() {
      try {
        const response = await getAllSmashEggItems();
        if (!cancelled) {
          setSmashRewards(mapSmashEggItems(response));
        }
      } catch (error) {
        console.error("Failed to load smash egg rewards:", error);
      }
    }

    loadSmashRewards();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await getSmashEggSettings();
        if (!cancelled) {
          if (response?.cost_per_smash != null) {
            setTokensPerRound(Number(response.cost_per_smash));
          }
          setGameEnabled(Number(response?.game_status ?? 1) === 1 && !response?.maintenance_mode);
          setMaintenanceMode(Boolean(response?.maintenance_mode));
        }
      } catch (error) {
        console.error("Failed to load smash egg settings:", error);
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTerms() {
      try {
        const response = await getPublicTermsAndConditions(SMASH_EGG_TERMS_CATEGORY);
        if (!cancelled) {
          setTermsText(response?.terms_and_conditions ?? "");
        }
      } catch (error) {
        console.error("Failed to load smash egg terms:", error);
      }
    }

    loadTerms();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadWinningHistory = useCallback(async (options = {}) => {
    const { cancelled } = options;

    try {
      const response = await getSmashEggWinningList();
      if (!cancelled?.()) {
        setWinningHistory(mapWinningHistory(response));
      }
    } catch (error) {
      console.error("Failed to load smash egg winning history:", error);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadWinningHistory({ cancelled: () => cancelled });
    const interval = setInterval(loadWinningHistory, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [loadWinningHistory]);

  const loadHistoryPage = useCallback(async (page = 1) => {
    if (!memberUuid) return;
    setHistoryLoading(true);
    try {
      const response = await getSmashEggHistory(memberUuid, { page, page_size: HISTORY_PAGE_SIZE });
      setHistoryRows(response?.results || []);
      setHistoryTotal(Number(response?.count ?? 0));
      setHistoryPage(page);
    } catch (error) {
      console.error("Failed to load smash egg history:", error);
      setHistoryRows([]);
      setHistoryTotal(0);
    } finally {
      setHistoryLoading(false);
    }
  }, [memberUuid]);

  const runSmash = useCallback(async (smashFn, resetAfter = false) => {
    if (!memberUuid) {
      setWonPrize({ label: "Please log in to smash." });
      setIsModalOpen(true);
      return;
    }

    if (!gameEnabled) {
      setWonPrize({ label: maintenanceMode ? "Smash Egg is under maintenance." : "Smash Egg is currently closed." });
      setIsModalOpen(true);
      return;
    }

    if (isProcessing || isCracked) return;
    setIsProcessing(true);
    setIsCracked(true);

    try {
      const response = await smashFn(memberUuid);
      const results = normalizeSmashResults(response);
      refreshUserData?.().catch(() => {});
      loadWinningHistory();
      loadHistoryPage(1);
      setTimeout(() => {
        setWonPrize(formatPrizeSummary(results, smashRewards));
        setIsModalOpen(true);
        setIsProcessing(false);
        if (resetAfter) setIsCracked(false);
      }, 1200);
    } catch (error) {
      const message = error?.data?.details || error?.data?.detail || error?.message || "Smash failed. Please try again.";
      const lowerMessage = String(message).toLowerCase();
      if (lowerMessage.includes("maintenance") || lowerMessage.includes("close")) {
        setGameEnabled(false);
        setMaintenanceMode(lowerMessage.includes("maintenance"));
      }
      setWonPrize({ label: message });
      setIsModalOpen(true);
      setIsProcessing(false);
      setIsCracked(false);
    }
  }, [isProcessing, isCracked, memberUuid, gameEnabled, maintenanceMode, refreshUserData, loadWinningHistory, loadHistoryPage, smashRewards]);

  const openHistory = useCallback(() => {
    setHistoryOpen(true);
    loadHistoryPage(1);
  }, [loadHistoryPage]);

  const handleEggTap = useCallback(() => {
    runSmash(oneSmash);
  }, [runSmash]);

  const handleDraw = useCallback(async (draws) => {
    if (draws === 10) return runSmash(tenSmash, true);
    if (draws === 50) return runSmash(fiftySmash, true);
    if (draws === 100) return runSmash(hundredSmash, true);
  }, [runSmash]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsCracked(false);
  }, []);

  // "Return to website (Claim)" sends the player to the /promotion page on the
  // external host saved during member auth (e.g. https://n1gang.net/promotion).
  // Falls back to the local /promotion route when no host is saved. Same
  // behaviour as the Spin and Penalty Kick games.
  const handleReturnToWebsite = useCallback(() => {
    const savedO = tokenStorage.getRedirectO?.();
    if (!savedO) {
      window.location.href = "/promotion";
      return;
    }
    const base = String(savedO).startsWith("http") ? savedO : `https://${savedO}`;
    window.location.href = `${base.replace(/\/$/, "")}/promotion`;
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Page Background - covers entire scrollable area */}
      <div
        className="absolute inset-0 z-0 min-h-full"
        style={{
          background: "radial-gradient(ellipse at center top, #3b0202 0%, #3c0202 50%, #1a0a00 100%)",
        }}
      />

      {/* Header */}
      <SmashEggHeader onMenuClick={() => setIsMenuOpen(true)} onInfoClick={openHistory} />

      {/* Hamburger Menu */}
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center gap-6 pt-20 pb-32">
        {/* Background Animation Layer */}
        <div className="absolute top-16 left-0 w-full h-[699px] overflow-hidden pointer-events-none">
          <Image
            src={SMASH_EGG_ASSETS.bgRays}
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute -left-[81px] top-[71px] w-[552px] h-[556px]">
            <Image
              src={SMASH_EGG_ASSETS.bgGlow}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Token Balance */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <TokenBalance balance={tokenBalance} tokensPerRound={tokensPerRound} />
        </motion.div>

        {/* Egg Animation */}
        <motion.div
          className="relative z-10 mt-[-10px]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <EggAnimation isCracked={isCracked} onTap={handleEggTap} />
        </motion.div>

        {/* Draw Buttons */}
        <motion.div
          className="w-full max-w-[390px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <DrawButtons onDraw={handleDraw} disabled={isProcessing || !gameEnabled} tokensPerRound={tokensPerRound} />
        </motion.div>

        {/* Prize List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <PrizeList prizes={rewardBoard.prizes} creditRanges={rewardBoard.creditRanges} />
        </motion.div>

        {/* Winner List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <WinnerList winners={winningHistory} />
        </motion.div>

        {/* Terms & Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <SmashEggTerms termsText={termsText} />
        </motion.div>
      </main>

      {!gameEnabled && (
        <div className="fixed inset-x-0 top-16 bottom-[92px] z-30 grid place-items-center bg-black/70 px-6 backdrop-blur-md">
          <div className="w-full max-w-[360px] rounded-xl border border-[rgba(255,246,223,0.16)] bg-[#231f14]/95 px-6 py-7 text-center shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
            <p
              className="text-[20px] text-[#ffd700]"
              style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}
            >
              {maintenanceMode ? "Smash Egg is under maintenance" : "Smash Egg is currently closed"}
            </p>
            <p
              className="mt-3 text-[12px] leading-5 text-[#d0c6ab]"
              style={{ fontFamily: "var(--font-rubik), 'Rubik', sans-serif" }}
            >
              Please check back later.
            </p>
          </div>
        </div>
      )}

      {/* Footer Nav */}
      <FooterNav />

      {/* Result Modal */}
      <SmashEggResultModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onReturn={handleReturnToWebsite}
        prize={wonPrize}
      />

      <AnimatePresence>
        {historyOpen && (
          <motion.div
            key="smash-history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center px-4"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setHistoryOpen(false);
            }}
          >
            <SmashEggHistoryDialog
              rows={historyRows}
              loading={historyLoading}
              total={historyTotal}
              currentPage={historyPage}
              totalPages={Math.max(1, Math.ceil(historyTotal / HISTORY_PAGE_SIZE))}
              onPageChange={loadHistoryPage}
              onClose={() => setHistoryOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SmashEggPage() {
  const { isAcebet77 } = useTheme();
  if (isAcebet77) return <Acebet77SmashEggPage />;
  return <DefaultSmashEggPage />;
}
