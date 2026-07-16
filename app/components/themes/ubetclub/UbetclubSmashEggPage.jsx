"use client";

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import UbetclubShell from './UbetclubShell';
import UbetDialog from './UbetDialog';
import UbetButton from './UbetButton';
import UbetOrnateCard from './UbetOrnateCard';
import TokenBalance from '../../smash-egg/TokenBalance';
import DrawButtons from '../../smash-egg/DrawButtons';
import PrizeList from '../../smash-egg/PrizeList';
import WinnerList from '../../smash-egg/WinnerList';
import SmashEggTerms from '../../smash-egg/SmashEggTerms';
import ThemedResultModal from '../../smash-egg/ThemedResultModal';
import SmashEggHistoryDialog from '../../smash-egg/SmashEggHistoryDialog';
import { useSmashEggGame, HISTORY_PAGE_SIZE } from '../../smash-egg/useSmashEggGame';
import { SMASH_EGG_ASSETS } from '../../smash-egg/smashEggAssets';
import { UBET_ASSETS, UBET_COLORS } from './assets';

const WELCOME_SEEN_KEY = 'mrs_ubetclub_egg_welcome_seen';

/**
 * Ubetclub Smash Egg (Figma 77:2438 loading / 77:2359 welcome / 77:2312 idle /
 * 77:2188 cracked / 77:2235 jackpot). Runs the shared useSmashEggGame engine so
 * its features + logic mirror the default portal exactly — only the skin
 * (background, egg art, boot/welcome flourish) differs.
 */
export default function UbetclubSmashEggPage() {
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
    isLoading,
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

  // Boot/loading + welcome are themed presentational flourishes (kept per the
  // Figma). Data loads in the shared hook; the boot screen finishes once the
  // hook reports the initial rewards + settings are ready.
  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!booting) return undefined;
    const timer = setInterval(() => {
      setBootProgress((p) => Math.min(p + Math.random() * 22, 92));
    }, 180);
    return () => clearInterval(timer);
  }, [booting]);

  useEffect(() => {
    if (!booting || isLoading) return undefined;
    setBootProgress(100);
    const t = setTimeout(() => {
      setBooting(false);
      try {
        if (!sessionStorage.getItem(WELCOME_SEEN_KEY)) setShowWelcome(true);
      } catch {
        setShowWelcome(true);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [booting, isLoading]);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    try {
      sessionStorage.setItem(WELCOME_SEEN_KEY, '1');
    } catch {}
  }, []);

  // --- Loading screen (Figma 77:2438) ---
  if (booting) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-black">
        <div className="fixed inset-0 left-1/2 -translate-x-1/2 w-full max-w-[475px]">
          <Image src={UBET_ASSETS.egg.bg} alt="" fill priority className="object-cover" sizes="475px" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-7 px-6 pt-[220px]">
          <motion.div
            className="relative h-[150px] w-[150px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          >
            <Image src={UBET_ASSETS.home.tileSmashEgg} alt="Smash Egg" fill priority className="object-contain" sizes="150px" />
          </motion.div>
          <div className="w-full max-w-[342px] rounded-[16px] border border-[rgba(242,195,107,0.25)] bg-[rgba(24,8,10,0.7)] p-[9px] backdrop-blur-[6px]">
            <div
              className="h-[12px] rounded-[8px] transition-all duration-300"
              style={{ width: `${bootProgress}%`, backgroundColor: UBET_COLORS.goldBright }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <UbetclubShell bg={UBET_ASSETS.egg.bg} onInfoClick={openHistory} title="SMASH EGG" titleIcon={SMASH_EGG_ASSETS.headerEggIcon}>
      <div className="relative flex flex-col items-center px-4">
        {/* Rays behind the egg */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[70px] h-[540px] w-[540px] -translate-x-1/2"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
        >
          <Image src={UBET_ASSETS.egg.rays} alt="" fill className="object-contain" sizes="540px" />
        </motion.div>

        {/* Token balance — shared with the default portal (Token Balance +
            Tokens / round). */}
        <div className="relative z-10 mt-2">
          <TokenBalance balance={tokenBalance} tokensPerRound={tokensPerRound} />
        </div>

        {/* The egg — tap to smash once (parity with the default portal). */}
        <motion.button
          onClick={handleEggTap}
          disabled={isProcessing}
          aria-label="Smash the egg"
          className="relative z-10 mt-6 h-[330px] w-[248px] cursor-pointer disabled:cursor-not-allowed"
          whileTap={{ scale: 0.96 }}
          animate={
            isCracked
              ? { rotate: [0, -3, 3, -3, 3, 0], transition: { duration: 0.5 } }
              : { y: [0, -8, 0], transition: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' } }
          }
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={isCracked ? 'cracked' : 'intact'}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Image
                src={isCracked ? UBET_ASSETS.egg.eggCracked : UBET_ASSETS.egg.eggIntact}
                alt="Fortune egg"
                fill
                priority
                className="object-contain"
                sizes="248px"
              />
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Draw buttons (10 / 50 / 100) — parity with the default portal. */}
        <div className="relative z-10 mt-6 w-full max-w-[390px]">
          <DrawButtons onDraw={handleDraw} disabled={isProcessing || !gameEnabled} tokensPerRound={tokensPerRound} />
        </div>

        {/* Prize list / winner feed / T&C — parity with the default portal,
            reusing the theme-agnostic dark-glass cards unmodified. */}
        <div className="relative z-10 mt-8 flex w-full flex-col items-center gap-6 pb-4">
          <PrizeList prizes={rewardBoard.prizes} creditRanges={rewardBoard.creditRanges} />
          <WinnerList winners={winningHistory} />
          <SmashEggTerms termsText={termsText} />
        </div>
      </div>

      {!gameEnabled && (
        <div className="fixed inset-x-0 top-[64px] bottom-[120px] z-30 grid place-items-center bg-black/70 px-6 backdrop-blur-md">
          <div className="w-full max-w-[360px] rounded-xl border border-[rgba(255,246,223,0.16)] bg-[#231f14]/95 px-6 py-7 text-center shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
            <p className="text-[20px] text-[#ffd700]" style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}>
              {maintenanceMode ? 'Smash Egg is under maintenance' : 'Smash Egg is currently closed'}
            </p>
            <p className="mt-3 text-[12px] leading-5 text-[#d0c6ab]" style={{ fontFamily: "var(--font-rubik), 'Rubik', sans-serif" }}>
              Please check back later.
            </p>
          </div>
        </div>
      )}

      {/* Welcome dialog (Figma 77:2359) — themed flourish, kept per design. */}
      <UbetDialog open={showWelcome} onClose={dismissWelcome}>
        <UbetOrnateCard>
          <div className="flex items-center gap-2">
            <img src={UBET_ASSETS.ui.iconParty} alt="" className="h-6 w-6" />
            <p className="text-[20px] uppercase tracking-[2px]" style={{ fontFamily: 'var(--font-acme), sans-serif', color: UBET_COLORS.cream }}>
              Welcome!
            </p>
          </div>
          <div className="mt-3 flex w-full items-center justify-center gap-2 rounded-[8px] border border-[rgba(242,195,107,0.35)] bg-[rgba(24,8,10,0.6)] px-4 py-3">
            <img src={UBET_ASSETS.ui.iconCoin} alt="" className="h-[26px] w-[26px] shrink-0" />
            <div className="flex flex-col items-center">
              <p className="text-[12px] uppercase" style={{ color: UBET_COLORS.goldBright, fontFamily: 'var(--font-acme), sans-serif' }}>
                You have received
              </p>
              <p className="mt-1 text-[11px]" style={{ color: UBET_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}>
                {tokenBalance} Free Tokens
              </p>
            </div>
          </div>
        </UbetOrnateCard>
        <UbetButton onClick={dismissWelcome}>Start Playing</UbetButton>
      </UbetDialog>

      {/* Result modal — same content + actions as the default portal (You Won
          + prize summary + Return to website (Claim) + Close), dressed in the
          Ubetclub ornate popup frame. */}
      <ThemedResultModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onReturn={handleReturnToWebsite}
        prize={wonPrize}
        frameBg="/assets/ubetclub-popup.png"
        insets={{ x: '10%', top: '17%', bottom: '13%' }}
      />

      {/* Winning record — shared Smash History dialog, opened from the info
          button (parity with the default portal). */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            key="smash-history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center px-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
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
    </UbetclubShell>
  );
}
