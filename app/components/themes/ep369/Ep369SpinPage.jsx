"use client";

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Ep369Shell from './Ep369Shell';
import Ep369Dialog from './Ep369Dialog';
import Ep369Button from './Ep369Button';
import Ep369OrnateCard from './Ep369OrnateCard';
import LuckySpinGrid from '../../spin/LuckySpinGrid';
import SpinWinningPanel from '../../spin/SpinWinningPanel';
import SmashEggTerms from '../../smash-egg/SmashEggTerms';
import { EP369_ASSETS, EP369_COLORS } from './assets';
import { oneSpin, tenSpin, fiftySpin, getAllLuckySpinItems, getPublicTermsAndConditions } from '../../../api/memberApi';
import { mapSpinResults, mapLuckySpinItems } from '../../../api/responseMappers';
import { tokenStorage } from '../../../api/tokenStorage';
import { useUser } from '../../../contexts/UserContext';

// EP369 Lucky Spin. The wheel is the shared <LuckySpinGrid> — the same
// spin/selection engine as the default portal — fed EP369's artwork. Only the
// images change; ring cycling, deceleration, winner highlight and manual-stop
// all come from the shared code.
const EP369_GEOMETRY = { framePad: 15, tile: 23, center: 27 };

export default function Ep369SpinPage() {
  const [spinItems, setSpinItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [dialog, setDialog] = useState(null);
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
      // Record the win in the session "Winning List" — the spin already
      // resolved server-side, so the history reflects it regardless of how
      // the animation ended.
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
    <Ep369Shell bg={EP369_ASSETS.spin.bg} onInfoClick={() => router.push('/terms-and-conditions')} balance={tokenBalance}>
      <div className="flex flex-col items-center gap-5 px-4">
        <motion.div
          className="relative w-[300px] h-[150px] shrink-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <Image src={EP369_ASSETS.spin.title} alt="Lucky Spin" fill priority className="object-contain" sizes="300px" />
        </motion.div>

        {/* Wheel — shared engine, EP369 art */}
        <LuckySpinGrid
          assets={EP369_ASSETS.spin.grid}
          themed={EP369_GEOMETRY}
          items={spinItems}
          isSpinning={isSpinning}
          onSpinClick={handleCenterSpin}
          onSpinComplete={handleSpinComplete}
          spinTriggerRef={gridSpinTriggerRef}
        />

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
                <img src={EP369_ASSETS.spin.btnPlay} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <span
                  className="relative z-10 text-[15px]"
                  style={{ fontFamily: 'var(--font-berkshire-swash), cursive', color: EP369_COLORS.goldBright }}
                >
                  {btn.label}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="relative w-full max-w-[370px] aspect-[1672/941]">
          <Image src={EP369_ASSETS.spin.panel} alt="" fill className="object-contain" sizes="370px" />
          {/* Panel art's leaf/gem decorations intrude further on the sides
              (diamond gem accents) and top/bottom (leaf crossbars) than a
              uniform inset accounted for, letting row icons sit under them. */}
          <div className="absolute inset-x-[15%] inset-y-[26%] flex flex-col">
            <div className="flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
              {spinItems.length === 0 ? (
                <p className="mt-4 text-center text-[13px]" style={{ color: EP369_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}>
                  {itemsLoading ? 'Loading rewards…' : 'No rewards available.'}
                </p>
              ) : (
                spinItems.map((item, i) => (
                  <div
                    key={item.uuid || i}
                    className="flex items-center gap-3 border-b border-[rgba(242,195,107,0.18)] py-[7px] last:border-b-0"
                  >
                    {item.image ? (
                      <img src={item.image} alt="" className="h-7 w-7 shrink-0 object-contain" />
                    ) : (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center text-[14px]" style={{ color: EP369_COLORS.gold }}>
                        🍀
                      </span>
                    )}
                    <span className="text-[13px]" style={{ color: EP369_COLORS.creamMuted, fontFamily: 'var(--font-rubik), sans-serif' }}>
                      {item.reward_name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Winning Record / Winning List toggle + panels, then T&C — parity
            with the default portal's spin page, restyled for the dark theme. */}
        <div className="flex w-full items-center justify-center gap-3">
          <Ep369Button
            variant={activeWinningView === 'record' ? 'gold' : 'green'}
            className={`!max-w-[150px] ${activeWinningView === 'record' ? '' : 'opacity-60'}`}
            textSize={14}
            onClick={() => setActiveWinningView('record')}
          >
            Winning Record
          </Ep369Button>
          <Ep369Button
            variant={activeWinningView === 'list' ? 'gold' : 'green'}
            className={`!max-w-[150px] ${activeWinningView === 'list' ? '' : 'opacity-60'}`}
            textSize={14}
            onClick={() => setActiveWinningView('list')}
          >
            Winning List
          </Ep369Button>
        </div>

        <SpinWinningPanel
          variant={activeWinningView}
          rows={userWinnings}
        />

        <SmashEggTerms termsText={termsText} />
      </div>

      <Ep369Dialog open={!!dialog} onClose={closeDialog}>
        <Ep369OrnateCard>
          <div className="flex items-center gap-2">
            {dialog?.type === 'win' && <img src={EP369_ASSETS.ui.iconParty} alt="" className="h-6 w-6" />}
            <p
              className="text-center text-[20px] uppercase tracking-[2px]"
              style={{ fontFamily: 'var(--font-acme), sans-serif', color: dialog?.type === 'error' ? '#ff9d9d' : EP369_COLORS.cream }}
            >
              {dialog?.title}
            </p>
          </div>
          {dialog?.type === 'win' ? (
            <div className="mt-3 flex w-full flex-col items-center gap-1.5 rounded-[8px] border border-[rgba(242,195,107,0.35)] bg-[rgba(0,16,2,0.6)] px-4 py-3">
              <div className="flex items-center gap-2">
                <img src={EP369_ASSETS.ui.iconCoin} alt="" className="h-[22px] w-[22px] shrink-0" />
                <p className="text-[12px] uppercase tracking-[1px]" style={{ color: EP369_COLORS.goldBright, fontFamily: 'var(--font-acme), sans-serif' }}>
                  You have won
                </p>
              </div>
              <p
                className="max-h-[84px] overflow-y-auto break-words text-center text-[13px] leading-snug"
                style={{ color: EP369_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}
              >
                {dialog?.message}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-center text-[14px]" style={{ color: EP369_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}>
              {dialog?.message}
            </p>
          )}
        </Ep369OrnateCard>
        {dialog?.type === 'win' ? (
          <>
            <Ep369Button onClick={closeDialog}>Spin Again</Ep369Button>
            <Ep369Button variant="gold" onClick={handleReturnToWebsite}>
              Return To Website
            </Ep369Button>
          </>
        ) : (
          <Ep369Button onClick={closeDialog}>Close</Ep369Button>
        )}
      </Ep369Dialog>
    </Ep369Shell>
  );
}
