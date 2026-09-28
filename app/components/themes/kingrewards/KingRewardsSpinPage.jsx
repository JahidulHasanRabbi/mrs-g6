"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import KingRewardsShell from './KingRewardsShell';
import { GlassCard, GoldPlaque, KrImage, PageTitle } from './KrUi';
import { KrResultDialog, KrRewardList, KrTermsPanel, KrWinnersPanel, formatKrAmount, formatKrDate } from './KrSpinPanels';
import LuckySpinGrid from '../../spin/LuckySpinGrid';
import { maskName } from '../../smash-egg/smashEggData';
import { KR_ASSETS, KR_COLORS, KR_FONT } from './assets';
import { oneSpin, tenSpin, fiftySpin, getAllLuckySpinItems, getPublicTermsAndConditions, getWinningList } from '../../../api/memberApi';
import { mapSpinResults, mapLuckySpinItems } from '../../../api/responseMappers';
import { tokenStorage } from '../../../api/tokenStorage';
import { useUser } from '../../../contexts/UserContext';

const SPIN_GRID_ASSETS = { centerButton: KR_ASSETS.spin.spinNow };

// Figma 706:1061 tiles: corners blue, edges gold; the chase/winner turns a tile gold.
const BLUE_TILE = {
  background: 'linear-gradient(to top, rgba(66,97,146,0.4) 0%, rgba(20,43,71,0.4) 51.925%, rgba(129,129,129,0.23) 100%)',
  boxShadow: 'inset 0 12px 12px rgba(241,247,255,0.25)',
  color: '#ffffff',
};
const GOLD_TILE = {
  background: 'linear-gradient(to top, #625a00 0%, #f2b229 51.925%, #a9a256 100%)',
  boxShadow: 'inset 0 8px 12px #fff2d1',
  color: '#00122b',
};
const CORNERS = new Set([0, 2, 5, 7]);
const TILE_RADIUS = '24.5%';

function renderTile({ prize, hasImage, label, index, isActive, isWinner }) {
  const skin = isActive || isWinner || !CORNERS.has(index) ? GOLD_TILE : BLUE_TILE;
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-1 overflow-hidden p-[9%]"
      style={{ ...skin, border: `2px solid ${KR_COLORS.goldBright}`, borderRadius: TILE_RADIUS }}
    >
      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <KrImage
          src={hasImage ? prize : null}
          className="max-h-full max-w-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </div>
      {label && (
        <span
          className="w-full truncate text-center text-[10px] font-semibold"
          style={{ fontFamily: KR_FONT, color: skin.color, lineHeight: 1.2 }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// Centre diamond is 139x140 on the 364px grid box, nudged 7px up.
const KR_CSS_GRID = {
  className: 'gap-2 rounded-[8px] p-2',
  // minHeight 0: otherwise tall prize images override the square aspect-ratio.
  style: { background: 'rgba(0,0,0,0.05)', border: `1px solid ${KR_COLORS.goldBright}`, minHeight: 0 },
  tileRadius: TILE_RADIUS,
  centerStyle: { width: '38.2%', aspectRatio: '139 / 140', top: '48.1%' },
  renderTile,
};

const WINNER_TABS = [
  { id: 'list', label: 'Winner List' },
  { id: 'record', label: 'Win Record' },
];

const INSUFFICIENT = /enough|insufficient|balance|credit|token/i;

export default function KingRewardsSpinPage() {
  const [spinItems, setSpinItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [userWinnings, setUserWinnings] = useState([]);
  const [winners, setWinners] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const [termsText, setTermsText] = useState('');
  const { userData, refreshUserData } = useUser();
  const router = useRouter();

  const tokenBalance = userData?.balance ?? 0;

  const spinResultsRef = useRef(null);
  const spinErrorRef = useRef(null);
  const gridSpinTriggerRef = useRef(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await getAllLuckySpinItems();
        setSpinItems(mapLuckySpinItems(response));
      } catch (error) {
        console.error('Error fetching spin items:', error);
      } finally {
        setItemsLoading(false);
      }
    }
    fetchItems();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchTerms() {
      try {
        const response = await getPublicTermsAndConditions(1);
        if (!cancelled) setTermsText(response?.terms_and_conditions ?? '');
      } catch (error) {
        console.error('Failed to load spin terms:', error);
      }
    }
    fetchTerms();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchWinners = async () => {
      try {
        const data = await getWinningList();
        if (cancelled || !Array.isArray(data)) return;
        setWinners(
          data.map((it) => ({ date: formatKrDate(it.datetime_obtained), user: maskName(it.display_name), amount: it.prize_name }))
        );
      } catch (error) {
        console.error('Failed to fetch winning list:', error);
      }
    };
    fetchWinners();
    const interval = setInterval(fetchWinners, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleSpinComplete = useCallback(() => {
    setIsSpinning(false);

    if (spinErrorRef.current) {
      setDialog({ type: 'error', title: 'Spin Failed', message: spinErrorRef.current });
      spinErrorRef.current = null;
      return;
    }

    const results = spinResultsRef.current;
    spinResultsRef.current = null;
    if (!results) return;

    if (results.length > 0) {
      const newWinnings = results.map((r) => ({
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        reward: r.reward_name,
      }));
      setUserWinnings((prev) => [...newWinnings, ...prev]);

      const grouped = {};
      results.forEach((r) => {
        const key = r.reward_name;
        if (!grouped[key]) grouped[key] = { name: r.reward_name, image: r.image, count: 0 };
        grouped[key].count += 1;
      });
      const items = Object.values(grouped).map((g) => ({
        key: g.name,
        image: g.image,
        text: `${g.count > 1 ? `${g.count}x ` : ''}${g.name}`,
      }));
      setDialog({ type: 'win', items });
    } else {
      setDialog({ type: 'win', items: [{ key: 'done', text: 'Spin completed successfully!' }] });
    }
  }, []);

  const handleSpinAction = useCallback(
    async (spinFunction, spinType) => {
      const memberUuid = tokenStorage.getMemberUuid();
      if (!memberUuid) {
        setDialog({ type: 'error', title: 'Error', message: 'Please log in to spin.' });
        return false;
      }
      if (isSpinning || isProcessingRef.current) return false;
      isProcessingRef.current = true;

      try {
        spinResultsRef.current = null;
        spinErrorRef.current = null;
        const response = await spinFunction(memberUuid);
        spinResultsRef.current = mapSpinResults(response);
        setIsSpinning(true);
        await refreshUserData();
        isProcessingRef.current = false;
        return true;
      } catch (error) {
        console.error(`Error during ${spinType}:`, error);
        setIsSpinning(false);
        isProcessingRef.current = false;
        const errorDetails = error.data?.details || error.data?.detail || error.message || '';
        setDialog(
          INSUFFICIENT.test(errorDetails)
            ? { type: 'insufficient' }
            : { type: 'error', title: 'Spin Failed', message: errorDetails || 'An error occurred. Please try again.' }
        );
        return false;
      }
    },
    [isSpinning, refreshUserData]
  );

  const handleCenterSpin = useCallback(async () => {
    const ok = await handleSpinAction(oneSpin, 'one spin');
    if (ok && spinResultsRef.current?.length > 0) {
      return { uuid: spinResultsRef.current[0].uuid };
    }
    return ok;
  }, [handleSpinAction]);

  const handleMultiSpin = useCallback(
    async (spinFunction, spinType) => {
      const ok = await handleSpinAction(spinFunction, spinType);
      const trigger = gridSpinTriggerRef.current;
      if (ok && trigger && spinResultsRef.current?.length > 0) {
        trigger(spinResultsRef.current[0].uuid);
      }
    },
    [handleSpinAction]
  );

  const closeDialog = useCallback(() => setDialog(null), []);

  const handleReturnToWebsite = useCallback(() => {
    const savedO = tokenStorage.getRedirectO();
    if (!savedO) {
      window.location.href = '/promotion';
      return;
    }
    const base = savedO.startsWith('http') ? savedO : `https://${savedO}`;
    window.location.href = `${base.replace(/\/$/, '')}/promotion`;
  }, []);

  const rewardRows = useMemo(
    () =>
      spinItems.map((item, i) => ({
        key: item.uuid || i,
        rank: i + 1,
        rankLabel: `Rank ${String(i + 1).padStart(2, '0')}`,
        name: item.reward_name,
        image: item.image,
      })),
    [spinItems]
  );

  const recordRows = useMemo(() => {
    const me = maskName(userData?.name || '') || 'You';
    return userWinnings.map((w) => ({ date: w.date, user: me, amount: w.reward }));
  }, [userWinnings, userData?.name]);

  const dialogProps = (() => {
    if (!dialog) return {};
    if (dialog.type === 'win') {
      return {
        tone: 'win',
        title: 'Prize Won!',
        subtitle: 'Congratulations!',
        items: dialog.items,
        primary: { label: 'Spin Again?', onClick: closeDialog },
        secondary: { label: 'Return to Website', onClick: handleReturnToWebsite },
      };
    }
    if (dialog.type === 'insufficient') {
      return {
        tone: 'warning',
        title: 'Warning!',
        subtitle: 'Not enough KR Coins',
        items: [{ key: 'left', text: `${formatKrAmount(tokenBalance)} KR Coins Left` }],
        primary: { label: 'Get KR Coins?', onClick: () => router.push('/missions') },
        secondary: { label: 'Back', onClick: closeDialog },
      };
    }
    return {
      tone: 'warning',
      title: dialog.title,
      subtitle: dialog.message,
      secondary: { label: 'Back', onClick: closeDialog },
    };
  })();

  return (
    <KingRewardsShell bg={KR_ASSETS.spin.bg} balance={tokenBalance}>
      <div className="mx-auto flex w-full max-w-[412px] flex-col items-center gap-4 px-4 pt-4">
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <PageTitle>Lucky Spin</PageTitle>
        </motion.div>

        <GlassCard className="flex w-full flex-col items-center px-2 py-4">
          <LuckySpinGrid
            assets={SPIN_GRID_ASSETS}
            cssGrid={KR_CSS_GRID}
            items={spinItems}
            isSpinning={isSpinning}
            onSpinClick={handleCenterSpin}
            onSpinComplete={handleSpinComplete}
            spinTriggerRef={gridSpinTriggerRef}
          />
        </GlassCard>

        {!itemsLoading && (
          <div className="flex w-full items-stretch gap-3 pb-12 min-[380px]:gap-6">
            {[
              { label: 'SPIN X10', cost: 100, fn: tenSpin, type: 'ten spins' },
              { label: 'SPIN X50', cost: 500, fn: fiftySpin, type: 'fifty spins' },
            ].map((btn) => (
              <GoldPlaque
                key={btn.label}
                onClick={() => handleMultiSpin(btn.fn, btn.type)}
                disabled={isSpinning}
                className="min-h-[54px] min-w-0 flex-1 !px-4"
              >
                <span className="flex flex-col items-center gap-1 leading-[1.2]">
                  <span className="flex items-center gap-0.5 whitespace-nowrap text-[12px] font-semibold">
                    <img src={KR_ASSETS.ui.iconCoins} alt="" className="h-[19px] w-[19px] shrink-0" />
                    {btn.cost} KR Coins
                  </span>
                  <span className="text-[12px] font-bold">{btn.label}</span>
                </span>
              </GoldPlaque>
            ))}
          </div>
        )}

        <KrRewardList rows={rewardRows} loading={itemsLoading} rowShadow />

        <KrWinnersPanel
          tabs={WINNER_TABS}
          active={activeTab}
          onTab={setActiveTab}
          heading={activeTab === 'list' ? 'Winner List' : 'Win Record'}
          rows={activeTab === 'list' ? winners : recordRows}
          emptyText={activeTab === 'list' ? 'No winners yet.' : "You haven't won anything yet — spin to play!"}
        />

        <KrTermsPanel termsText={termsText} />
      </div>

      <KrResultDialog open={!!dialog} onClose={closeDialog} {...dialogProps} />
    </KingRewardsShell>
  );
}
