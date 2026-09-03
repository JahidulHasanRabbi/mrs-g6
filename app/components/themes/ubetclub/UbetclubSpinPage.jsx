"use client";

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import UbetclubShell from './UbetclubShell';
import UbetDialog from './UbetDialog';
import UbetButton from './UbetButton';
import UbetOrnateCard from './UbetOrnateCard';
import LuckySpinGrid from '../../spin/LuckySpinGrid';
import FramedWinningPanel from '../shared/FramedWinningPanel';
import FramedTerms from '../shared/FramedTerms';
import { buildFramedSkin } from '../shared/framedSkin';
import { UBET_ASSETS, UBET_COLORS } from './assets';
import { oneSpin, tenSpin, fiftySpin, getAllLuckySpinItems, getPublicTermsAndConditions } from '../../../api/memberApi';
import { mapSpinResults, mapLuckySpinItems } from '../../../api/responseMappers';
import { tokenStorage } from '../../../api/tokenStorage';
import { useUser } from '../../../contexts/UserContext';

const UBET_FRAMED_SKIN = buildFramedSkin(UBET_ASSETS, UBET_COLORS, { x: '13%', top: '24%', bottom: '15%' }, { scrollbarClass: 'scrollbar-ubet' });

// Ubetclub Lucky Spin. The wheel is the shared <LuckySpinGrid> — the same
// spin/selection engine as the default portal — fed ubetclub's artwork. Only
// the images change; ring cycling, deceleration, winner highlight and
// manual-stop all come from the shared code.
// Plaque PNGs carry transparent padding (visible frame ~0.89× the box here).
// The frame art's clear interior reaches ~8% in from the edges, so the grid is
// pushed out (framePad 11 → 25.3% column pitch) and the boxes sized up
// (tile 28 → ~25% visible) to fill the red interior instead of floating in it.
const UBET_GEOMETRY = { framePad: 11, tile: 28, center: 32 };

// Derives a short "KR Coins / Prize / Free credit" label from the raw item_type
// enum so the rewards panel can show more than just the reward name.
function ubetItemTypeLabel(value) {
  if (value == null) return 'Free credit';
  const normalized = String(value).replace(/_/g, ' ').trim().toUpperCase();
  if (normalized === 'FREE CREDIT' || normalized === '1') return 'Free credit';
  if (normalized === 'TOKEN' || normalized === '2') return 'KR Coins';
  if (normalized === 'PRIZE' || normalized === 'ITEM' || normalized === '3') return 'Prize';
  return String(value);
}

export default function UbetclubSpinPage() {
  const [spinItems, setSpinItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [dialog, setDialog] = useState(null); // { type: 'win'|'error', title, message }
  const [userWinnings, setUserWinnings] = useState([]);
  const [activeWinningView, setActiveWinningView] = useState('record');
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

  // Lucky Spin terms live under category 1 (matches the default portal).
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
      // Record the win in the session "Winning List".
      const newWinnings = results.map((r) => ({
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        reward: r.reward_name,
      }));
      setUserWinnings((prev) => [...newWinnings, ...prev]);

      const rewardCounts = {};
      results.forEach((r) => {
        rewardCounts[r.reward_name] = (rewardCounts[r.reward_name] || 0) + 1;
      });
      const rewardsList = Object.entries(rewardCounts)
        .map(([name, count]) => `${count > 1 ? `${count}x ` : ''}${name}`)
        .join(', ');
      setDialog({ type: 'win', title: 'Congratulations', message: rewardsList });
    } else {
      setDialog({ type: 'win', title: 'Spin Complete', message: 'Spin completed successfully!' });
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
        const results = mapSpinResults(response);
        spinResultsRef.current = results;
        setIsSpinning(true);
        await refreshUserData();
        isProcessingRef.current = false;
        return true;
      } catch (error) {
        console.error(`Error during ${spinType}:`, error);
        setIsSpinning(false);
        isProcessingRef.current = false;
        const errorDetails = error.data?.details || error.data?.detail || error.message || '';
        const lowerError = errorDetails.toLowerCase();
        const insufficient =
          lowerError.includes('enough') ||
          lowerError.includes('insufficient') ||
          lowerError.includes('balance') ||
          lowerError.includes('credit') ||
          lowerError.includes('token');
        setDialog({
          type: 'error',
          title: insufficient ? 'Insufficient Points' : 'Spin Failed',
          message: insufficient
            ? "You don't have enough points to spin. Please earn more points first!"
            : errorDetails || 'An error occurred. Please try again.',
        });
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

  return (
    <UbetclubShell bg={UBET_ASSETS.spin.bg} onInfoClick={() => router.push('/profile')} balance={tokenBalance} profileMode>
      <div className="flex flex-col items-center gap-5 px-4">
        {/* LUCKY SPIN title */}
        <motion.div
          className="relative w-[300px] h-[128px] shrink-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <Image src={UBET_ASSETS.spin.title} alt="Lucky Spin" fill priority className="object-contain" sizes="300px" />
        </motion.div>

        {/* Wheel — shared engine, ubetclub art */}
        <LuckySpinGrid
          assets={UBET_ASSETS.spin.grid}
          themed={UBET_GEOMETRY}
          items={spinItems}
          isSpinning={isSpinning}
          onSpinClick={handleCenterSpin}
          onSpinComplete={handleSpinComplete}
          spinTriggerRef={gridSpinTriggerRef}
        />

        {/* Multi-spin buttons */}
        {!itemsLoading && (
          <div className="flex w-full items-center justify-center gap-4">
            {[
              { label: 'SPIN X10', fn: tenSpin, type: 'ten spins' },
              { label: 'SPIN X50', fn: fiftySpin, type: 'fifty spins' },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => handleMultiSpin(btn.fn, btn.type)}
                disabled={isSpinning}
                className="relative flex h-[56px] w-[160px] items-center justify-center overflow-hidden cursor-pointer transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <img src={UBET_ASSETS.spin.btnPlay} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <span
                  className="relative z-10 text-[15px]"
                  style={{ fontFamily: 'var(--font-berkshire-swash), cursive', color: UBET_COLORS.goldBright }}
                >
                  {btn.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Rewards panel (Figma 77:2702 ornate frame) */}
        <div className="relative w-full max-w-[370px] aspect-[1448/1086]">
          <Image src={UBET_ASSETS.spin.panel} alt="" fill className="object-contain" sizes="370px" />
          {/* Panel art's crown/flourish decorations eat more of the top than the
              bottom, so the safe content box needs asymmetric insets — a uniform
              inset let row icons sit under the top crown ornament. */}
          <div className="absolute inset-x-[13%] top-[24%] bottom-[15%] flex flex-col">
            <div className="scrollbar-ubet flex-1 space-y-2 overflow-y-auto pr-1.5">
              {spinItems.length === 0 ? (
                <p className="mt-6 text-center text-[13px]" style={{ color: UBET_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}>
                  {itemsLoading ? 'Loading rewards…' : 'No rewards available.'}
                </p>
              ) : (
                spinItems.map((item, i) => {
                  const typeLabel = ubetItemTypeLabel(item.item_type);
                  const hasTokens = item.token_amount != null && Number(item.token_amount) > 0;
                  const meta = hasTokens ? `${typeLabel} · ${item.token_amount} token` : typeLabel;
                  return (
                    <div
                      key={item.uuid || i}
                      className="flex items-center gap-2.5 rounded-[10px] border border-[rgba(242,195,107,0.22)] bg-[rgba(24,8,10,0.55)] px-2.5 py-1.5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[rgba(242,195,107,0.3)] bg-[rgba(72,14,15,0.6)]">
                        {item.image ? (
                          <img src={item.image} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[16px]">🧧</span>
                        )}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span
                          className="truncate text-[13px] leading-tight"
                          style={{ color: UBET_COLORS.cream, fontFamily: 'var(--font-rubik), sans-serif' }}
                        >
                          {item.reward_name}
                        </span>
                        <span
                          className="truncate text-[10px] uppercase tracking-[0.5px]"
                          style={{ color: UBET_COLORS.goldBright, fontFamily: 'var(--font-rubik), sans-serif' }}
                        >
                          {meta}
                        </span>
                      </div>
                      <span
                        className="shrink-0 rounded-full border border-[rgba(242,195,107,0.3)] px-2 py-0.5 text-[10px] font-semibold"
                        style={{ color: UBET_COLORS.tokenYellow, fontFamily: 'var(--font-rubik), sans-serif' }}
                      >
                        {item.unlimited ? '∞' : `x${item.quantity ?? 0}`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Winning Record / Winning List toggle + panels, then T&C. */}
        <div className="flex w-full items-center justify-center gap-3">
          <UbetButton
            variant={activeWinningView === 'record' ? 'gold' : 'red'}
            className={`!max-w-[150px] ${activeWinningView === 'record' ? '' : 'opacity-60'}`}
            textSize={14}
            onClick={() => setActiveWinningView('record')}
          >
            Winning Record
          </UbetButton>
          <UbetButton
            variant={activeWinningView === 'list' ? 'gold' : 'red'}
            className={`!max-w-[150px] ${activeWinningView === 'list' ? '' : 'opacity-60'}`}
            textSize={14}
            onClick={() => setActiveWinningView('list')}
          >
            Winning List
          </UbetButton>
        </div>

        <FramedWinningPanel skin={UBET_FRAMED_SKIN} variant={activeWinningView} rows={userWinnings} />

        <FramedTerms skin={UBET_FRAMED_SKIN} termsText={termsText} />
      </div>

      {/* Result / error dialog */}
      <UbetDialog open={!!dialog} onClose={closeDialog}>
        <UbetOrnateCard>
          <div className="flex items-center gap-2">
            {dialog?.type === 'win' && <img src={UBET_ASSETS.ui.iconParty} alt="" className="h-6 w-6" />}
            <p
              className="text-center text-[20px] uppercase tracking-[2px]"
              style={{ fontFamily: 'var(--font-acme), sans-serif', color: dialog?.type === 'error' ? '#ff9d9d' : UBET_COLORS.cream }}
            >
              {dialog?.title}
            </p>
          </div>
          {dialog?.type === 'win' ? (
            <div className="mt-3 flex w-full flex-col items-center gap-1.5 rounded-[8px] border border-[rgba(242,195,107,0.35)] bg-[rgba(24,8,10,0.6)] px-4 py-3">
              <div className="flex items-center gap-2">
                <img src={UBET_ASSETS.ui.iconCoin} alt="" className="h-[22px] w-[22px] shrink-0" />
                <p className="text-[12px] uppercase tracking-[1px]" style={{ color: UBET_COLORS.goldBright, fontFamily: 'var(--font-acme), sans-serif' }}>
                  You have won
                </p>
              </div>
              <p
                className="max-h-[84px] overflow-y-auto break-words text-center text-[13px] leading-snug"
                style={{ color: UBET_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}
              >
                {dialog?.message}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-center text-[14px]" style={{ color: UBET_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}>
              {dialog?.message}
            </p>
          )}
        </UbetOrnateCard>
        {dialog?.type === 'win' ? (
          <>
            <UbetButton onClick={closeDialog}>Spin Again</UbetButton>
            <UbetButton variant="gold" onClick={handleReturnToWebsite}>
              Return To Website
            </UbetButton>
          </>
        ) : (
          <UbetButton onClick={closeDialog}>Close</UbetButton>
        )}
      </UbetDialog>
    </UbetclubShell>
  );
}
