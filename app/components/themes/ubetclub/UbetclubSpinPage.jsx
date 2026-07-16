"use client";

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import UbetclubShell from './UbetclubShell';
import UbetDialog from './UbetDialog';
import UbetButton from './UbetButton';
import UbetOrnateCard from './UbetOrnateCard';
import { UBET_ASSETS, UBET_COLORS } from './assets';
import { oneSpin, tenSpin, fiftySpin, getAllLuckySpinItems } from '../../../api/memberApi';
import { mapSpinResults, mapLuckySpinItems } from '../../../api/responseMappers';
import { tokenStorage } from '../../../api/tokenStorage';
import { useUser } from '../../../contexts/UserContext';

const SLOT_COUNT = 8;
// Tile centers (% of the square wheel art) in clockwise ring order from the
// top-left, so the highlight visibly circles the 3x3 grid around SPIN NOW.
const SLOT_CENTERS = [
  { l: 24, t: 23 }, { l: 50, t: 23 }, { l: 76, t: 23 }, { l: 76, t: 50 },
  { l: 76, t: 77 }, { l: 50, t: 77 }, { l: 24, t: 77 }, { l: 24, t: 50 },
];
const HILITE = 27; // highlight box size, % of wheel

/**
 * Ubetclub Lucky Spin (Figma 77:2738 wheel / 77:2667 intro / 77:2702 panel).
 * A single motion value drives the highlight racing around the eight prize
 * tiles and lands on the slot matching the server result — no separate timers,
 * so the animation can never drift out of sync.
 */
export default function UbetclubSpinPage() {
  const [spinItems, setSpinItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(null);
  const [dialog, setDialog] = useState(null); // { type: 'win'|'error', title, message }
  const { refreshUserData } = useUser();

  const spinResultsRef = useRef(null);
  const isProcessingRef = useRef(false);
  const spin = useMotionValue(0);
  const spinRef = useRef(0);
  const spinAnimRef = useRef(null);

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
    return () => spinAnimRef.current?.stop();
  }, []);

  const finishSpin = useCallback(() => {
    setIsSpinning(false);
    const results = spinResultsRef.current;
    spinResultsRef.current = null;
    if (!results) return;

    if (results.length > 0) {
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

  // Race the highlight around the ring and land on the winner. One motion value
  // is the single source of truth; the lit tile is derived from it each frame.
  const spinToWinner = useCallback((targetIndex, onDone) => {
    const from = spinRef.current;
    const base = from + SLOT_COUNT * 5; // at least 5 full loops
    const extra = (((targetIndex - (Math.round(base) % SLOT_COUNT)) % SLOT_COUNT) + SLOT_COUNT) % SLOT_COUNT;
    const to = base + extra;
    spinRef.current = to;
    const litFor = (v) => ((Math.round(v) % SLOT_COUNT) + SLOT_COUNT) % SLOT_COUNT;
    spinAnimRef.current = animate(spin, to, {
      duration: 3.4,
      ease: [0.1, 0.6, 0.2, 1],
      onUpdate: (v) => setHighlightIndex(litFor(v)),
      onComplete: () => {
        setHighlightIndex(targetIndex);
        onDone();
      },
    });
  }, [spin]);

  const handleSpin = useCallback(
    async (spinFunction, spinType) => {
      const memberUuid = tokenStorage.getMemberUuid();
      if (!memberUuid) {
        setDialog({ type: 'error', title: 'Error', message: 'Please log in to spin.' });
        return;
      }
      if (isSpinning || isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        const response = await spinFunction(memberUuid);
        const results = mapSpinResults(response);
        spinResultsRef.current = results;
        setIsSpinning(true);
        await refreshUserData();

        const winnerUuid = results[0]?.uuid;
        let targetIndex = spinItems.findIndex((item) => item.uuid === winnerUuid);
        if (targetIndex < 0) targetIndex = Math.floor(SLOT_COUNT / 2);
        spinToWinner(targetIndex % SLOT_COUNT, finishSpin);
      } catch (error) {
        console.error(`Error during ${spinType}:`, error);
        setIsSpinning(false);
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
      } finally {
        isProcessingRef.current = false;
      }
    },
    [isSpinning, spinItems, refreshUserData, spinToWinner, finishSpin]
  );

  const handleReturnToWebsite = useCallback(() => {
    const savedO = tokenStorage.getRedirectO();
    if (!savedO) {
      window.location.href = '/promotion';
      return;
    }
    const base = savedO.startsWith('http') ? savedO : `https://${savedO}`;
    window.location.href = `${base.replace(/\/$/, '')}/promotion`;
  }, []);

  const lit = highlightIndex != null ? SLOT_CENTERS[highlightIndex] : null;

  return (
    <UbetclubShell bg={UBET_ASSETS.spin.bg}>
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

        {/* Wheel */}
        <div className="relative w-full max-w-[360px] aspect-square">
          <Image src={UBET_ASSETS.spin.wheel} alt="" fill priority className="object-contain" sizes="360px" />

          {/* Moving highlight over the winning tile */}
          {lit && (
            <div
              className="pointer-events-none absolute rounded-[16px] transition-all duration-100"
              style={{
                left: `${lit.l - HILITE / 2}%`,
                top: `${lit.t - HILITE / 2}%`,
                width: `${HILITE}%`,
                height: `${HILITE}%`,
                border: `3px solid ${UBET_COLORS.goldBright}`,
                boxShadow: `0 0 18px 4px rgba(242,195,107,0.9), inset 0 0 14px rgba(255,246,223,0.5)`,
                background: 'rgba(255,246,223,0.14)',
              }}
            />
          )}

          {/* Center SPIN NOW (baked into the wheel art) — transparent hit area */}
          <motion.button
            onClick={() => handleSpin(oneSpin, 'one spin')}
            disabled={isSpinning || itemsLoading}
            aria-label="Spin now"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[26%] aspect-square rounded-full cursor-pointer disabled:cursor-not-allowed"
            whileTap={{ scale: 0.92 }}
          />
        </div>

        {/* Loading plaque / multi-spin buttons */}
        {itemsLoading ? (
          <div className="relative flex h-[56px] w-[280px] items-center justify-center">
            <img src={UBET_ASSETS.spin.btnPlay} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span
              className="relative z-10 text-[16px]"
              style={{ fontFamily: 'var(--font-berkshire-swash), cursive', color: UBET_COLORS.goldBright }}
            >
              Loading...
            </span>
          </div>
        ) : (
          <div className="flex w-full items-center justify-center gap-4">
            {[
              { label: 'Play x10', fn: tenSpin, type: 'ten spins' },
              { label: 'Play x50', fn: fiftySpin, type: 'fifty spins' },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => handleSpin(btn.fn, btn.type)}
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
          <div className="absolute inset-[13%] flex flex-col">
            <p
              className="mb-2 text-center text-[18px] uppercase tracking-[2px]"
              style={{ fontFamily: 'var(--font-acme), sans-serif', color: UBET_COLORS.cream }}
            >
              Rewards
            </p>
            <div className="flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
              {spinItems.length === 0 ? (
                <p className="mt-6 text-center text-[13px]" style={{ color: UBET_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}>
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
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center text-[14px]" style={{ color: UBET_COLORS.gold }}>
                        🧧
                      </span>
                    )}
                    <span className="text-[13px]" style={{ color: UBET_COLORS.creamMuted, fontFamily: 'var(--font-rubik), sans-serif' }}>
                      {item.reward_name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result / error dialog */}
      <UbetDialog open={!!dialog} onClose={() => setDialog(null)}>
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
            <UbetButton onClick={() => setDialog(null)}>Spin Again</UbetButton>
            <UbetButton variant="gold" onClick={handleReturnToWebsite}>
              Return To Website
            </UbetButton>
          </>
        ) : (
          <UbetButton onClick={() => setDialog(null)}>Close</UbetButton>
        )}
      </UbetDialog>
    </UbetclubShell>
  );
}
