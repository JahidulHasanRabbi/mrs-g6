"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
} from "../../api/memberApi";
import { mapSmashEggItems } from "../../api/responseMappers";
import { tokenStorage } from "../../api/tokenStorage";
import { BASE_URL } from "../../api/api";
import { useUser } from "../../contexts/UserContext";
import {
  SMASH_EGG_TERMS_CATEGORY,
  buildRewardBoard,
  mapWinningHistory,
} from "./smashEggData";

export const HISTORY_PAGE_SIZE = 10;

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

/**
 * Shared Smash Egg game engine. Owns all state, data loading, and handlers
 * so the default portal page and every themed skin run identical logic —
 * only the presentation (background, egg art, chrome) differs per page.
 *
 * `isLoading` is true until the initial rewards + settings have resolved, so
 * themed skins that show a boot/loading screen can gate on real data readiness.
 */
export function useSmashEggGame() {
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
  const [rewardsLoaded, setRewardsLoaded] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const { userData, refreshUserData } = useUser();

  const tokenBalance = userData?.balance ?? 0;
  const memberUuid = tokenStorage.getMemberUuid();
  const rewardBoard = useMemo(() => buildRewardBoard(smashRewards), [smashRewards]);
  const isLoading = !(rewardsLoaded && settingsLoaded);

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
      } finally {
        if (!cancelled) setRewardsLoaded(true);
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
      } finally {
        if (!cancelled) setSettingsLoaded(true);
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

  return {
    // state
    isCracked,
    isProcessing,
    isModalOpen,
    wonPrize,
    tokenBalance,
    tokensPerRound,
    gameEnabled,
    maintenanceMode,
    termsText,
    rewardBoard,
    winningHistory,
    isLoading,
    // history dialog
    historyOpen,
    historyRows,
    historyLoading,
    historyPage,
    historyTotal,
    setHistoryOpen,
    // handlers
    runSmash,
    handleEggTap,
    handleDraw,
    openHistory,
    loadHistoryPage,
    closeModal,
    handleReturnToWebsite,
  };
}
