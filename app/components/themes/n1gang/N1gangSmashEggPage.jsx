"use client";

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import N1gangShell from './N1gangShell';
import N1gangDialog from './N1gangDialog';
import N1gangButton from './N1gangButton';
import N1gangOrnateCard from './N1gangOrnateCard';
import TokenBalance from '../../smash-egg/TokenBalance';
import DrawButtons from '../../smash-egg/DrawButtons';
import FramedPrizeList from '../shared/FramedPrizeList';
import FramedWinnerList from '../shared/FramedWinnerList';
import FramedTerms from '../shared/FramedTerms';
import { buildFramedSkin } from '../shared/framedSkin';
import ThemedResultModal from '../../smash-egg/ThemedResultModal';
import SmashEggHistoryDialog from '../../smash-egg/SmashEggHistoryDialog';
import { useSmashEggGame, HISTORY_PAGE_SIZE } from '../../smash-egg/useSmashEggGame';
import { SMASH_EGG_ASSETS } from '../../smash-egg/smashEggAssets';
import { N1GANG_ASSETS, N1GANG_COLORS } from './assets';

const WELCOME_SEEN_KEY = 'mrs_n1gang_egg_welcome_seen';
// Insets match the spin page — the panel plate has no baked header.
const N1GANG_FRAMED_SKIN = buildFramedSkin(N1GANG_ASSETS, N1GANG_COLORS, { x: '11%', top: '13%', bottom: '15%' }, { scrollbarClass: 'scrollbar-n1gang' });

export default function N1gangSmashEggPage() {
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

  if (booting) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-black">
        <div className="fixed inset-0 left-1/2 -translate-x-1/2 w-full max-w-[475px]">
          <Image src={N1GANG_ASSETS.egg.bgLoading} alt="" fill priority className="object-cover" sizes="475px" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6 pt-[240px] px-6">
          <motion.div
            className="relative w-[132px] h-[147px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          >
            <Image src={N1GANG_ASSETS.egg.logo} alt="Smash Egg" fill priority className="object-cover" sizes="132px" />
          </motion.div>
          <div className="w-full max-w-[342px] rounded-[16px] border border-[rgba(255,246,223,0.15)] bg-[rgba(35,31,20,0.7)] backdrop-blur-[6px] p-[9px]">
            <div
              className="h-[12px] rounded-[8px] transition-all duration-300"
              style={{ width: `${bootProgress}%`, backgroundColor: N1GANG_COLORS.goldBright }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <N1gangShell bg={N1GANG_ASSETS.egg.bg} onInfoClick={openHistory} title="SMASH EGG" titleIcon={SMASH_EGG_ASSETS.headerEggIcon}>
      <div className="relative flex flex-col items-center px-4">
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-[80px] w-[552px] h-[556px] pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
        >
          <Image src={N1GANG_ASSETS.egg.rays} alt="" fill className="object-contain" sizes="552px" />
        </motion.div>

        <div className="relative z-10 mt-2">
          <TokenBalance balance={tokenBalance} tokensPerRound={tokensPerRound} />
        </div>

        <motion.button
          onClick={handleEggTap}
          disabled={isProcessing}
          aria-label="Smash the egg"
          className="relative z-10 w-[248px] h-[343px] mt-6 cursor-pointer disabled:cursor-not-allowed"
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
                src={isCracked ? N1GANG_ASSETS.egg.eggCracked : N1GANG_ASSETS.egg.eggIntact}
                alt="Golden egg"
                fill
                priority
                className="object-contain"
                sizes="248px"
              />
            </motion.div>
          </AnimatePresence>
        </motion.button>

        <div className="relative z-10 mt-6 w-full max-w-[390px]">
          <DrawButtons onDraw={handleDraw} disabled={isProcessing || !gameEnabled} tokensPerRound={tokensPerRound} />
        </div>

        <div className="relative z-10 mt-8 flex w-full flex-col items-center gap-6 pb-4">
          <FramedPrizeList skin={N1GANG_FRAMED_SKIN} prizes={rewardBoard.prizes} creditRanges={rewardBoard.creditRanges} />
          <FramedWinnerList skin={N1GANG_FRAMED_SKIN} winners={winningHistory} />
          <FramedTerms skin={N1GANG_FRAMED_SKIN} termsText={termsText} />
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

      <N1gangDialog open={showWelcome} onClose={dismissWelcome} frameless>
        <N1gangOrnateCard>
          <div className="flex items-center gap-2">
            <img src={N1GANG_ASSETS.ui.iconGift} alt="" className="w-6 h-6" />
            <p className="text-[20px] tracking-[2px] uppercase" style={{ fontFamily: 'var(--font-acme), sans-serif', color: N1GANG_COLORS.cream }}>
              Welcome!
            </p>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 rounded-[8px] border border-[rgba(77,71,50,0.35)] bg-[#030304] px-4 py-3 w-full">
            <img src={N1GANG_ASSETS.ui.iconCoins} alt="" className="w-[26px] h-[26px] shrink-0" />
            <div className="flex flex-col items-center">
              <p className="text-[12px] uppercase" style={{ color: '#ffb77d', fontFamily: 'var(--font-acme), sans-serif' }}>
                You have received
              </p>
              <p className="text-[11px] mt-1" style={{ color: N1GANG_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}>
                {tokenBalance} Free Tokens
              </p>
            </div>
          </div>
        </N1gangOrnateCard>
        <N1gangButton onClick={dismissWelcome}>Start Playing</N1gangButton>
      </N1gangDialog>

      <ThemedResultModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onReturn={handleReturnToWebsite}
        prize={wonPrize}
        frameBg="/assets/acebet77-popup.webp"
        insets={{ x: '10%', top: '18%', bottom: '13%' }}
      />

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
    </N1gangShell>
  );
}
