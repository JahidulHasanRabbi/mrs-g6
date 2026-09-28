"use client";

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import KingRewardsShell from './KingRewardsShell';
import { GlassCard, GoldText, PageTitle } from './KrUi';
import { KrResultDialog, KrRewardList, KrTermsPanel, KrWinnersPanel, formatKrAmount, formatKrDate } from './KrSpinPanels';
import KrDrawButtons from './KrDrawButtons';
import EggAnimation from '../../smash-egg/EggAnimation';
import SmashEggHistoryDialog from '../../smash-egg/SmashEggHistoryDialog';
import { useSmashEggGame, HISTORY_PAGE_SIZE } from '../../smash-egg/useSmashEggGame';
import { maskName } from '../../smash-egg/smashEggData';
import { useUser } from '../../../contexts/UserContext';
import { KR_ASSETS, KR_COLORS, KR_FONT } from './assets';

const WELCOME_SEEN_KEY = 'mrs_kingrewards_egg_welcome_seen';
const INSUFFICIENT = /enough|insufficient|balance|credit|token/i;
const CHIP_STYLE = {
  background: KR_COLORS.navy,
  border: `1px solid ${KR_COLORS.goldBright}`,
  boxShadow: 'inset -2px 8px 8px rgba(165,196,255,0.25)',
  fontFamily: KR_FONT,
};

const WINNER_TABS = [
  { id: 'list', label: 'Winner List' },
  { id: 'record', label: 'Win Record' },
];

export default function KingRewardsSmashEggPage() {
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
  const { userData } = useUser();
  const router = useRouter();

  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  // Remounts the egg after each dialog so a tap that never cracked it (e.g. logged out) can't leave it stuck mid-slam.
  const [eggKey, setEggKey] = useState(0);

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

  const handleCloseResult = useCallback(() => {
    closeModal();
    setEggKey((k) => k + 1);
  }, [closeModal]);

  const handleTab = useCallback(
    (id) => {
      setActiveTab(id);
      if (id === 'record') loadHistoryPage(1);
    },
    [loadHistoryPage]
  );

  const rewardRows = useMemo(
    () => [
      ...rewardBoard.prizes.map((p) => ({
        key: `p-${p.rank}`,
        rank: p.rank,
        rankLabel: `Rank ${String(p.rank).padStart(2, '0')}`,
        name: p.name,
        image: p.image,
      })),
      ...rewardBoard.creditRanges.map((c, i) => ({ key: `c-${i}`, rankLabel: 'Free Credit', name: c.label, image: c.image })),
    ],
    [rewardBoard]
  );

  const winnerRows = useMemo(
    () => winningHistory.slice(0, 50).map((w) => ({ date: formatKrDate(w.date), user: w.name, amount: w.prize })),
    [winningHistory]
  );

  const recordRows = useMemo(() => {
    const me = maskName(userData?.name || '') || 'You';
    return historyRows.map((r) => ({ date: formatKrDate(r.created), user: me, amount: r.reward_name || 'Reward' }));
  }, [historyRows, userData?.name]);

  const resultProps = (() => {
    if (!wonPrize) return {};
    if (Array.isArray(wonPrize.items)) {
      const items = wonPrize.items.length
        ? wonPrize.items.map((it, i) => ({
            key: `${it.uuid || it.name}-${i}`,
            image: it.image,
            text: `${it.count > 1 ? `${it.count}x ` : ''}${it.name}`,
          }))
        : [{ key: 'done', text: wonPrize.label }];
      return {
        tone: 'win',
        title: 'Smashed!',
        subtitle: 'Congratulations!',
        items,
        primary: { label: 'Smash Again?', onClick: handleCloseResult },
        secondary: { label: 'Return to Website', onClick: handleReturnToWebsite },
      };
    }
    if (INSUFFICIENT.test(wonPrize.label || '')) {
      return {
        tone: 'warning',
        title: 'Warning!',
        subtitle: 'Not enough KR Coins',
        items: [{ key: 'left', text: `${formatKrAmount(tokenBalance)} KR Coins Left` }],
        primary: { label: 'Get KR Coins?', onClick: () => router.push('/missions') },
        secondary: { label: 'Back', onClick: handleCloseResult },
      };
    }
    return { tone: 'warning', title: 'Warning!', subtitle: wonPrize.label, secondary: { label: 'Back', onClick: handleCloseResult } };
  })();

  if (booting) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[#021a3f]">
        <div className="fixed inset-0 left-1/2 w-full max-w-[475px] -translate-x-1/2">
          <Image src={KR_ASSETS.egg.bg} alt="" fill priority className="object-cover" sizes="475px" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6 px-6 pt-[160px]">
          <PageTitle>Egg Smash</PageTitle>
          <motion.img
            src={KR_ASSETS.egg.eggIntact}
            alt=""
            className="h-[260px] w-auto object-contain"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{ opacity: { duration: 0.4 }, scale: { type: 'spring', stiffness: 200, damping: 16 }, y: { repeat: Infinity, duration: 2.4 } }}
          />
          <GlassCard radius={12} bordered className="w-full max-w-[342px] p-[6px]">
            <div
              className="h-[12px] rounded-[8px] transition-all duration-300"
              style={{ width: `${bootProgress}%`, backgroundImage: 'linear-gradient(90deg, #fef064 0%, #f59e0a 50%, #d97706 100%)' }}
            />
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <KingRewardsShell bg={KR_ASSETS.egg.bg} onInfoClick={openHistory} showBattlePoints={false}>
      <div className="mx-auto flex w-full max-w-[412px] flex-col items-center gap-4 px-4 pt-4">
        <PageTitle>Egg Smash</PageTitle>

        <div className="flex flex-col items-center gap-4">
          <div className="flex h-[46px] items-center gap-1 rounded-[12px] px-[9px]" style={CHIP_STYLE}>
            <img src={KR_ASSETS.ui.iconCoins} alt="" className="h-[19px] w-[19px] shrink-0" />
            <p className="whitespace-nowrap text-[16px] font-medium leading-6" style={{ color: '#eae2cf' }}>
              KR Coin Balance: <span style={{ color: '#ffe16d' }}>{formatKrAmount(tokenBalance)}</span>
            </p>
          </div>
          <div className="flex h-[46px] items-center rounded-[12px] px-[9px]" style={CHIP_STYLE}>
            <p className="whitespace-nowrap text-[16px] font-medium leading-6" style={{ color: '#d0c6ab' }}>
              {formatKrAmount(tokensPerRound)} KR Coins / round
            </p>
          </div>
        </div>

        <div className="relative z-[5] -mb-[85px] w-full">
          <EggAnimation
            key={eggKey}
            isCracked={isCracked}
            onTap={handleEggTap}
            eggSrc={KR_ASSETS.egg.eggIntact}
            crackedSrc={KR_ASSETS.egg.eggIntact}
            nestSrc={null}
            burstOnCrack
          />
        </div>

        <div className="relative z-10 w-full pb-8">
          <KrDrawButtons onDraw={handleDraw} disabled={isProcessing || !gameEnabled} tokensPerRound={tokensPerRound} />
        </div>

        <KrRewardList rows={rewardRows} loading={isLoading} />

        <KrWinnersPanel
          tabs={WINNER_TABS}
          active={activeTab}
          onTab={handleTab}
          heading={activeTab === 'list' ? 'Winner List' : 'Win Record'}
          bordered={false}
          {...(activeTab === 'list'
            ? { rows: winnerRows }
            : {
                rows: recordRows,
                loading: historyLoading,
                emptyText: 'No smash history yet.',
                page: historyPage,
                total: historyTotal,
                pageSize: HISTORY_PAGE_SIZE,
                onPage: loadHistoryPage,
              })}
        />

        <KrTermsPanel termsText={termsText} bordered={false} />
      </div>

      {!gameEnabled && (
        <div className="fixed inset-x-0 top-[64px] bottom-[104px] z-30 grid place-items-center bg-black/60 px-6 backdrop-blur-md">
          <GlassCard className="w-full max-w-[360px] px-6 py-7 text-center">
            <GoldText as="p" className="block text-[22px] font-bold">
              {maintenanceMode ? 'Smash Egg is under maintenance' : 'Smash Egg is currently closed'}
            </GoldText>
            <p className="mt-3 text-[14px] leading-5" style={{ fontFamily: KR_FONT, color: '#e2e2e2' }}>
              Please check back later.
            </p>
          </GlassCard>
        </div>
      )}

      <KrResultDialog
        open={showWelcome}
        onClose={dismissWelcome}
        title="Welcome!"
        subtitle="You have received"
        items={[{ key: 'welcome', text: `${formatKrAmount(tokenBalance)} Free KR Coins` }]}
        primary={{ label: 'Start Playing', onClick: dismissWelcome }}
      />

      <KrResultDialog open={isModalOpen} onClose={handleCloseResult} {...resultProps} />

      <AnimatePresence>
        {historyOpen && (
          <motion.div
            key="smash-history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center px-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
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
    </KingRewardsShell>
  );
}
