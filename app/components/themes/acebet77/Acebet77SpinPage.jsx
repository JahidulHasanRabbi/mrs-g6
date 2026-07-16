"use client";

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AcebetShell from './AcebetShell';
import AcebetDialog from './AcebetDialog';
import AcebetButton from './AcebetButton';
import AcebetOrnateCard from './AcebetOrnateCard';
import LuckySpinGrid from '../../spin/LuckySpinGrid';
import SpinWinningPanel from '../../spin/SpinWinningPanel';
import SmashEggTerms from '../../smash-egg/SmashEggTerms';
import { ACEBET_ASSETS, ACEBET_COLORS } from './assets';
import { oneSpin, tenSpin, fiftySpin, getAllLuckySpinItems, getPublicTermsAndConditions } from '../../../api/memberApi';
import { mapSpinResults, mapLuckySpinItems } from '../../../api/responseMappers';
import { tokenStorage } from '../../../api/tokenStorage';
import { useUser } from '../../../contexts/UserContext';

// Acebet77 Lucky Spin. The wheel itself is the shared <LuckySpinGrid> — the
// same spin/selection engine the default portal uses — fed acebet's artwork and
// a square-frame geometry. Only the images change; the timing, ring cycling,
// deceleration, winner highlight and manual-stop all come from the shared code.
const ACEBET_GEOMETRY = { framePad: 15, tile: 23, center: 27 };

export default function Acebet77SpinPage() {
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

  // Fires when the wheel animation lands (auto or manual stop). Builds the
  // result dialog from the server result captured before the spin started.
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

  // Runs the API call, stashes the result, and returns success/failure. Shared
  // by the centre button and the x10/x50 plaques (identical to the default).
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

  // Centre button (one spin): return the winning uuid so the grid can animate.
  const handleCenterSpin = useCallback(async () => {
    const ok = await handleSpinAction(oneSpin, 'one spin');
    if (ok && spinResultsRef.current?.length > 0) {
      return { uuid: spinResultsRef.current[0].uuid };
    }
    return ok;
  }, [handleSpinAction]);

  // x10 / x50: run the API then drive the same wheel animation via the trigger.
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
    <AcebetShell bg={ACEBET_ASSETS.spin.bg} onInfoClick={() => router.push('/terms-and-conditions')} balance={tokenBalance}>
      <div className="flex flex-col items-center gap-6 px-4">
        {/* LUCKY SPIN title */}
        <motion.div
          className="relative w-[318px] h-[106px] shrink-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <Image src={ACEBET_ASSETS.spin.title} alt="Lucky Spin" fill priority className="object-contain" sizes="318px" />
        </motion.div>

        {/* Wheel — shared engine, acebet art */}
        <LuckySpinGrid
          assets={ACEBET_ASSETS.spin.grid}
          themed={ACEBET_GEOMETRY}
          items={spinItems}
          isSpinning={isSpinning}
          onSpinClick={handleCenterSpin}
          onSpinComplete={handleSpinComplete}
          spinTriggerRef={gridSpinTriggerRef}
        />

        {/* Multi-spin buttons */}
        {!itemsLoading && (
          <div className="flex items-center justify-center gap-4 w-full">
            {[
              { label: 'SPIN X10', fn: tenSpin, type: 'ten spins' },
              { label: 'SPIN X50', fn: fiftySpin, type: 'fifty spins' },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => handleMultiSpin(btn.fn, btn.type)}
                disabled={isSpinning}
                className="relative flex items-center justify-center h-[58px] w-[164px] cursor-pointer active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <img src={ACEBET_ASSETS.spin.btnPlay} alt="" className="absolute inset-0 w-full h-full object-fill" />
                <span
                  className="relative z-10 text-[14px]"
                  style={{ fontFamily: 'var(--font-berkshire-swash), cursive', color: ACEBET_COLORS.goldBright }}
                >
                  {btn.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Rewards panel (Figma 39:116 ornate frame) */}
        <div className="relative w-full max-w-[402px] aspect-[1448/1086]">
          <Image src={ACEBET_ASSETS.spin.panel} alt="" fill className="object-contain" sizes="402px" />
          {/* The frame's crown ornament intrudes ~20% from the top and its
              flourish ~13% from the bottom, while the side gems sit ~9% in — a
              uniform 13% inset let rows slide under the crown, so use an
              asymmetric safe-content box. */}
          <div className="absolute inset-x-[9%] top-[20%] bottom-[13%] flex flex-col">
            <div className="flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
              {spinItems.length === 0 ? (
                <p className="text-center text-[13px] mt-6" style={{ color: ACEBET_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}>
                  {itemsLoading ? 'Loading rewards…' : 'No rewards available.'}
                </p>
              ) : (
                spinItems.map((item, i) => (
                  <div
                    key={item.uuid || i}
                    className="flex items-center gap-3 py-[7px] border-b border-[rgba(233,175,65,0.18)] last:border-b-0"
                  >
                    {item.image ? (
                      <img src={item.image} alt="" className="w-7 h-7 object-contain shrink-0" />
                    ) : (
                      <span className="w-7 h-7 shrink-0 flex items-center justify-center text-[14px]" style={{ color: ACEBET_COLORS.gold }}>
                        🎁
                      </span>
                    )}
                    <span className="text-[13px]" style={{ color: ACEBET_COLORS.creamMuted, fontFamily: 'var(--font-rubik), sans-serif' }}>
                      {item.reward_name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Winning Record / Winning List toggle + panels, then T&C. */}
        <div className="flex w-full items-center justify-center gap-3">
          <AcebetButton
            variant={activeWinningView === 'record' ? 'gold' : 'dark'}
            className={`!max-w-[150px] ${activeWinningView === 'record' ? '' : 'opacity-60'}`}
            textSize={14}
            onClick={() => setActiveWinningView('record')}
          >
            Winning Record
          </AcebetButton>
          <AcebetButton
            variant={activeWinningView === 'list' ? 'gold' : 'dark'}
            className={`!max-w-[150px] ${activeWinningView === 'list' ? '' : 'opacity-60'}`}
            textSize={14}
            onClick={() => setActiveWinningView('list')}
          >
            Winning List
          </AcebetButton>
        </div>

        <SpinWinningPanel variant={activeWinningView} rows={userWinnings} />

        <SmashEggTerms termsText={termsText} />
      </div>

      {/* Result / error dialog */}
      <AcebetDialog open={!!dialog} onClose={closeDialog} frameless>
        <AcebetOrnateCard>
          <div className="flex items-center gap-2">
            {dialog?.type === 'win' && (
              <img src={ACEBET_ASSETS.ui.iconParty} alt="" className="w-6 h-6" />
            )}
            <p
              className="text-[20px] tracking-[2px] uppercase text-center"
              style={{ fontFamily: 'var(--font-acme), sans-serif', color: dialog?.type === 'error' ? '#ff9d9d' : ACEBET_COLORS.cream }}
            >
              {dialog?.title}
            </p>
          </div>
          {dialog?.type === 'win' ? (
            <div className="mt-3 flex w-full flex-col items-center gap-1.5 rounded-[8px] border border-[rgba(77,71,50,0.4)] bg-[#030304] px-4 py-3">
              <div className="flex items-center gap-2">
                <img src={ACEBET_ASSETS.ui.iconCoins} alt="" className="w-[24px] h-[24px] shrink-0" />
                <p className="text-[12px] uppercase tracking-[1px]" style={{ color: '#ffb77d', fontFamily: 'var(--font-acme), sans-serif' }}>
                  You have won
                </p>
              </div>
              <p
                className="max-h-[96px] overflow-y-auto break-words text-center text-[13px] leading-snug"
                style={{ color: ACEBET_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}
              >
                {dialog?.message}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-[14px] text-center" style={{ color: ACEBET_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}>
              {dialog?.message}
            </p>
          )}
        </AcebetOrnateCard>
        {dialog?.type === 'win' ? (
          <>
            <AcebetButton onClick={closeDialog}>Spin Again</AcebetButton>
            <AcebetButton variant="gold" onClick={handleReturnToWebsite}>
              Return To Website
            </AcebetButton>
          </>
        ) : (
          <AcebetButton onClick={closeDialog}>Close</AcebetButton>
        )}
      </AcebetDialog>
    </AcebetShell>
  );
}
