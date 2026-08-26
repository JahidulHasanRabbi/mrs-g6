"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import AnimatedSection from "../components/ui/AnimatedSection";
import AnimatedSectionWrapper from "../components/ui/AnimatedSectionWrapper";
import LuckySpinGrid from "../components/spin/LuckySpinGrid";
import SpinButtonsContainer from "../components/spin/SpinButtonsContainer";
import RewardsList from "../components/spin/RewardsList";
import WinningList from "../components/spin/WinningList";
import UserWinningList from "../components/spin/UserWinningList";
import TermsConditions from "../components/spin/TermsConditions";
import SuccessModal from "../components/ui/SuccessModal";
import { oneSpin, tenSpin, fiftySpin, getMemberInfo, getAllLuckySpinItems } from "../api/memberApi";
import { mapSpinResults, mapLuckySpinItems } from "../api/responseMappers";
import { tokenStorage } from "../api/tokenStorage";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "../contexts/ThemeContext";
import { THEME_IDS } from "../config/themes";
import { lazySkins, skinFor } from "../components/themes/skinRoute";

// One chunk per skin, warmed at module scope — see lazySkins.
const SKINS = lazySkins({
  [THEME_IDS.ACEBET77]: () => import("../components/themes/acebet77/Acebet77SpinPage"),
  [THEME_IDS.UBETCLUB]: () => import("../components/themes/ubetclub/UbetclubSpinPage"),
  [THEME_IDS.EP369]: () => import("../components/themes/ep369/Ep369SpinPage"),
  [THEME_IDS.KGAME99]: () => import("../components/themes/kgame99/Kgame99SpinPage"),
  [THEME_IDS.LV918]: () => import("../components/themes/lv918/Lv918SpinPage"),
  [THEME_IDS.N1GANG]: () => import("../components/themes/n1gang/N1gangSpinPage"),
});

function formatSpinReward(result) {
  const name = result?.reward_name || "Reward";
  const type = String(result?.item_type || "").toUpperCase();
  const amount = Number(result?.battle_point_amount ?? 0);
  if ((type === "BATTLE POINT" || type === "5") && amount > 0 && !/\bBP\b|battle point/i.test(name)) {
    return `${name} (${amount.toLocaleString("en-US")} BP)`;
  }
  return name;
}

function DefaultSpinPage() {
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalBgColor, setModalBgColor] = useState("rgba(96, 128, 60, 1)");
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeWinningView, setActiveWinningView] = useState("record");
  const [userWinnings, setUserWinnings] = useState([]);
  const [spinItems, setSpinItems] = useState([]);
  // Whether the result modal should show "Spin Again / Return To Website"
  // action buttons (only true when a spin completes — not for error popups).
  const [modalShowSpinActions, setModalShowSpinActions] = useState(false);
  const { refreshUserData } = useUser();

  const memberUuid = tokenStorage.getMemberUuid();

  // Fetch spin items on mount
  useEffect(() => {
    async function fetchSpinItems() {
      try {
        const response = await getAllLuckySpinItems();
        const mappedItems = mapLuckySpinItems(response);
        setSpinItems(mappedItems);
      } catch (error) {
        console.error('Error fetching spin items:', error);
      }
    }
    fetchSpinItems();
  }, []);

  const spinResultsRef = useRef(null);
  const spinErrorRef = useRef(null);
  const gridSpinTriggerRef = useRef(null);

  const handleSpinComplete = useCallback((_finalGridIndex, _opts = {}) => {
    setIsSpinning(false);

    // Errors short-circuit straight to the failure dialog regardless of
    // whether the spin auto-finished or the player tapped Stop.
    if (spinErrorRef.current) {
      setModalTitle("❌ Spin Failed");
      setModalMessage(spinErrorRef.current);
      setModalBgColor("rgba(180, 60, 60, 1)");
      setModalShowSpinActions(false);
      setIsModalOpen(true);
      spinErrorRef.current = null;
      return;
    }

    if (spinResultsRef.current) {
      const results = spinResultsRef.current;

      // Record the win in the session winnings list — the spin already
      // happened on the server and the result is final, so the UI history
      // must reflect it regardless of how the player ended the animation.
      if (results.length > 0) {
        // Show the reward *name* (e.g. "RM2.64", "Iphone", "2 Token"). The
        // spin API does not return a separate credit_amount — the resolved
        // value already lives in reward_name — so there is no numeric amount
        // to display.
        const newWinnings = results.map(r => ({
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          reward: formatSpinReward(r),
        }));
        setUserWinnings(prev => [...newWinnings, ...prev]);
      }

      // Reward dialog fires for both auto-stop and manual stop. The
      // client wants players who tap Stop to still see the result they
      // landed on, not just the highlighted tile.
      if (results.length > 0) {
        const rewardCounts = {};
        results.forEach(r => {
          const rewardName = formatSpinReward(r);
          rewardCounts[rewardName] = (rewardCounts[rewardName] || 0) + 1;
        });
        const rewardsList = Object.entries(rewardCounts)
          .map(([name, count]) => `${count > 1 ? count + 'x ' : ''}${name}`)
          .join(", ");

        setModalTitle("🎉 Congratulations!");
        setModalMessage(`You won: ${rewardsList}`);
        setModalBgColor("rgba(96, 128, 60, 1)");
        setModalShowSpinActions(true);
      } else {
        setModalTitle("✅ Spin Complete");
        setModalMessage("Spin completed successfully!");
        setModalBgColor("rgba(96, 128, 60, 1)");
        setModalShowSpinActions(true);
      }
      setIsModalOpen(true);
      spinResultsRef.current = null;
    }
  }, []);

  const isProcessingRef = useRef(false);

  const handleSpinAction = useCallback(async (spinFunction, spinType) => {
    if (!memberUuid) {
      setModalTitle("❌ Error");
      setModalMessage("Please log in to spin.");
      setModalBgColor("rgba(180, 60, 60, 1)");
      setIsModalOpen(true);
      return false; // Return false to prevent spin animation
    }

    if (isSpinning || isProcessingRef.current) return false; // Return false to prevent spin animation

    isProcessingRef.current = true;

    try {
      spinResultsRef.current = null;
      spinErrorRef.current = null;
      
      // Call API first before starting spin animation
      const response = await spinFunction(memberUuid);
      const results = mapSpinResults(response).map((result) => {
        const configured = spinItems.find((item) => item.uuid === result.uuid);
        return configured ? { ...result, ...configured } : result;
      });
      spinResultsRef.current = results;
      
      // Only start spinning if API call succeeds
      setIsSpinning(true);
      
      await refreshUserData();
      
      isProcessingRef.current = false;
      return true; // Return true to allow spin animation
    } catch (error) {
      console.error(`Error during ${spinType}:`, error);
      
      // Stop spinning immediately if it was started
      setIsSpinning(false);
      isProcessingRef.current = false;
      
      // Extract error message from error.data.details or error.data.detail
      const errorDetails = error.data?.details || error.data?.detail || error.message || "";
      
      // Check if error is about insufficient points, tokens, or balance
      const lowerError = errorDetails.toLowerCase();
      if (lowerError.includes("enough") || 
          lowerError.includes("insufficient") ||
          lowerError.includes("balance") ||
          lowerError.includes("credit") ||
          lowerError.includes("token")) {
        setModalTitle("❌ Insufficient Points");
        setModalMessage("You don't have enough points to spin. Please earn more points first!");
      } else {
        setModalTitle("❌ Spin Failed");
        setModalMessage(errorDetails || "An error occurred. Please try again.");
      }
      
      setModalBgColor("rgba(180, 60, 60, 1)");
      setIsModalOpen(true);
      
      return false; // Return false to prevent spin animation
    }
  }, [memberUuid, isSpinning, refreshUserData, spinItems]);

  const handleCenterButtonClick = useCallback(async () => {
    const result = await handleSpinAction(oneSpin, "one spin");
    // Return the first result's UUID if successful
    if (result === true && spinResultsRef.current && spinResultsRef.current.length > 0) {
      return { uuid: spinResultsRef.current[0].uuid };
    }
    return result;
  }, [handleSpinAction]);

  const handleButtonClick = useCallback(async (buttonData) => {
    if (buttonData.spins === "SPIN X10") {
      const trigger = gridSpinTriggerRef.current;
      const shouldSpin = await handleSpinAction(tenSpin, "ten spins");
      // Trigger the grid animation if API succeeds with first result's UUID
      if (shouldSpin && trigger && spinResultsRef.current && spinResultsRef.current.length > 0) {
        trigger(spinResultsRef.current[0].uuid);
      }
    } else if (buttonData.spins === "SPIN X50") {
      const trigger = gridSpinTriggerRef.current;
      const shouldSpin = await handleSpinAction(fiftySpin, "fifty spins");
      // Trigger the grid animation if API succeeds with first result's UUID
      if (shouldSpin && trigger && spinResultsRef.current && spinResultsRef.current.length > 0) {
        trigger(spinResultsRef.current[0].uuid);
      }
    } else if (buttonData.spins === "Winning Record") {
      setActiveWinningView("record");
    } else if (buttonData.spins === "Winning List") {
      setActiveWinningView("list");
    }
  }, [handleSpinAction]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalShowSpinActions(false);
  }, []);

  // "Return To Website" sends the player to the /promotion page on the
  // external host saved during member auth (e.g. https://n1gang.net/promotion).
  // Falls back to the local /promotion route when no host is saved.
  const handleReturnToWebsite = useCallback(() => {
    const savedO = tokenStorage.getRedirectO();
    if (!savedO) {
      window.location.href = "/promotion";
      return;
    }
    const base = savedO.startsWith("http") ? savedO : `https://${savedO}`;
    window.location.href = `${base.replace(/\/$/, "")}/promotion`;
  }, []);

  // Two action buttons attached to the win modal (slide 8). Null otherwise so
  // error popups stay button-less.
  const modalActions = useMemo(() => {
    if (!modalShowSpinActions) return null;
    return [
      { label: "Spin Again", onClick: closeModal },
      { label: "Return To Website", onClick: handleReturnToWebsite, variant: "secondary" },
    ];
  }, [modalShowSpinActions, closeModal, handleReturnToWebsite]);

  const spinButtons = useMemo(() => [
    { spins: "SPIN X10", tokens: "100", className: "w-[140px] h-[60px]" },
    { spins: "SPIN X50", tokens: "500", className: "w-[140px] h-[60px]" },
  ], []);

  const winningButtons = useMemo(() => [
    {
      spins: "Winning Record",
      image: "/assets/lucky-spin/buttons/winning.webp",
      className: "w-[160px] h-[70px] sm:w-[200px] sm:h-[80px]",
      dimmed: activeWinningView === "list",
    },
    {
      spins: "Winning List",
      image: "/assets/lucky-spin/buttons/winning.webp",
      className: "w-[160px] h-[70px] sm:w-[200px] sm:h-[80px]",
      dimmed: activeWinningView === "record",
    },
  ], [activeWinningView]);

  return (
    <>
      <AnimatedSection title="" imageSrc='/assets/lucky-spin/lucky-spin.webp' imageAlt="lucky spin" />

        <AnimatedSectionWrapper animation="fadeInUp" delay={0.1} viewportAmount={0.3}>
          <div className="flex justify-center items-center py-8">
            <LuckySpinGrid 
              onSpinClick={handleCenterButtonClick} 
              isSpinning={isSpinning} 
              disabled={isSpinning} 
              onSpinComplete={handleSpinComplete}
              spinTriggerRef={gridSpinTriggerRef}
              items={spinItems}
            />
          </div>
        </AnimatedSectionWrapper>

        <AnimatedSectionWrapper animation="fadeInUp" delay={0.15} viewportAmount={0.3}>
          <div className="flex justify-center px-4 py-4">
            <SpinButtonsContainer
              buttons={spinButtons}
              onButtonClick={handleButtonClick}
              disabled={isSpinning}
            />
          </div>
        </AnimatedSectionWrapper>

        <AnimatedSectionWrapper animation="fadeInUp" delay={0.2} viewportAmount={0.3}>
          <div className="flex justify-center py-8">
            <RewardsList />
          </div>
        </AnimatedSectionWrapper>

        <AnimatedSectionWrapper animation="fadeInUp" delay={0.25} viewportAmount={0.3}>
          <div className="flex flex-wrap justify-center px-4 sm:px-8 py-4 gap-2">
            <SpinButtonsContainer
              buttons={winningButtons}
              onButtonClick={handleButtonClick}
            />
          </div>
        </AnimatedSectionWrapper>

        {activeWinningView === "record" && (
          <AnimatedSectionWrapper animation="fadeInUp" delay={0.3} viewportAmount={0.3}>
            <div className="flex justify-center py-8">
              <WinningList />
            </div>
          </AnimatedSectionWrapper>
        )}

        {activeWinningView === "list" && (
          <AnimatedSectionWrapper animation="fadeInUp" delay={0.3} viewportAmount={0.3}>
            <div className="flex justify-center py-8">
              <UserWinningList winnings={userWinnings} />
            </div>
          </AnimatedSectionWrapper>
        )}

        <AnimatedSectionWrapper animation="fadeInUp" delay={0.35} viewportAmount={0.3}>
          <div className="flex justify-center py-8 px-4">
            <TermsConditions />
          </div>
      </AnimatedSectionWrapper>

      <SuccessModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        message={modalMessage}
        actions={modalActions}
        backgroundColor={modalBgColor}
      />
    </>
  );
}

export default function SpinPage() {
  const { themeId } = useTheme();

  const skin = skinFor(SKINS, themeId);
  if (skin) return skin;
  return <DefaultSpinPage />;
}
