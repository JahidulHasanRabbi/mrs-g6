"use client";

import { useState } from "react";
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
import SmashEggResultModal from "../components/smash-egg/SmashEggResultModal";
import { useTheme } from "../contexts/ThemeContext";
import { THEME_IDS } from "../config/themes";
import { lazySkins, skinFor } from "../components/themes/skinRoute";

// One chunk per skin, warmed at module scope — see lazySkins.
const SKINS = lazySkins({
  [THEME_IDS.ACEBET77]: () => import("../components/themes/acebet77/Acebet77SmashEggPage"),
  [THEME_IDS.UBETCLUB]: () => import("../components/themes/ubetclub/UbetclubSmashEggPage"),
  [THEME_IDS.EP369]: () => import("../components/themes/ep369/Ep369SmashEggPage"),
  [THEME_IDS.KGAME99]: () => import("../components/themes/kgame99/Kgame99SmashEggPage"),
  [THEME_IDS.LV918]: () => import("../components/themes/lv918/Lv918SmashEggPage"),
  [THEME_IDS.N1GANG]: () => import("../components/themes/n1gang/N1gangSmashEggPage"),
});
import { useSmashEggGame, HISTORY_PAGE_SIZE } from "../components/smash-egg/useSmashEggGame";

function DefaultSmashEggPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
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
    historyOpen,
    historyRows,
    historyLoading,
    historyPage,
    historyTotal,
    setHistoryOpen,
    handleEggTap,
    handleDraw,
    openHistory,
    loadHistoryPage,
    closeModal,
    handleReturnToWebsite,
  } = useSmashEggGame();

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
          {/* Sunburst behind the egg — slow continuous spin, matching the
              themed smash pages (ubetclub / acebet77 / ep369). */}
          <motion.div
            className="absolute -left-[81px] top-[71px] w-[552px] h-[556px]"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
          >
            <Image
              src={SMASH_EGG_ASSETS.bgGlow}
              alt=""
              fill
              className="object-cover"
            />
          </motion.div>
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
  const { themeId } = useTheme();

  const skin = skinFor(SKINS, themeId);
  if (skin) return skin;
  return <DefaultSmashEggPage />;
}
