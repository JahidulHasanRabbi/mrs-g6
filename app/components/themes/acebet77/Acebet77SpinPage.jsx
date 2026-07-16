"use client";

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import AcebetShell from './AcebetShell';
import AcebetDialog from './AcebetDialog';
import AcebetButton from './AcebetButton';
import AcebetOrnateCard from './AcebetOrnateCard';
import { ACEBET_ASSETS, ACEBET_COLORS } from './assets';
import { oneSpin, tenSpin, fiftySpin, getAllLuckySpinItems } from '../../../api/memberApi';
import { mapSpinResults, mapLuckySpinItems } from '../../../api/responseMappers';
import { tokenStorage } from '../../../api/tokenStorage';
import { useUser } from '../../../contexts/UserContext';

const SLOT_COUNT = 8;
// Tile centres (% of the square wheel art) in clockwise ring order from the
// top-left, so the highlight visibly circles the 3x3 grid around SPIN NOW.
const SLOT_CENTERS = [
  { l: 24, t: 23 }, { l: 50, t: 23 }, { l: 76, t: 23 }, { l: 76, t: 50 },
  { l: 76, t: 77 }, { l: 50, t: 77 }, { l: 24, t: 77 }, { l: 24, t: 50 },
];
const HILITE = 27; // highlight box size, % of wheel

/**
 * Acebet77 Lucky Spin (updated Figma 15:195 idle / 30:118 spinning /
 * 14:117 loading / 39:116 rewards panel). The wheel is a flat 3x3 prize grid
 * with a centre SPIN NOW button: a single motion value drives the highlight
 * racing around the eight tiles and lands on the slot matching the server
 * result, so the animation can never drift out of sync.
 */
export default function Acebet77SpinPage() {
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
      duration: 3.6,
      ease: [0.12, 0.7, 0.2, 1],
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
    <AcebetShell bg={ACEBET_ASSETS.spin.bg}>
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

        {/* Wheel: flat 3x3 prize grid + centre SPIN NOW (Figma 15:195) */}
        <div className="relative w-full max-w-[370px] aspect-[370/367]">
          <Image src={ACEBET_ASSETS.spin.wheel} alt="" fill priority className="object-contain" sizes="370px" />

          {/* Moving highlight over the winning tile */}
          {lit && (
            <div
              className="pointer-events-none absolute rounded-[14px] transition-all duration-100"
              style={{
                left: `${lit.l - HILITE / 2}%`,
                top: `${lit.t - HILITE / 2}%`,
                width: `${HILITE}%`,
                height: `${HILITE}%`,
                border: `3px solid ${ACEBET_COLORS.goldBright}`,
                boxShadow: '0 0 18px 4px rgba(255,225,109,0.9), inset 0 0 14px rgba(255,246,223,0.5)',
                background: 'rgba(255,246,223,0.14)',
              }}
            />
          )}

          {/* Centre SPIN NOW (baked into the wheel art) — transparent hit area */}
          <motion.button
            onClick={() => handleSpin(oneSpin, 'one spin')}
            disabled={isSpinning || itemsLoading}
            aria-label="Spin now"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] aspect-square rounded-full cursor-pointer disabled:cursor-not-allowed"
            whileTap={{ scale: 0.92 }}
          />
        </div>

        {/* Loading plaque (Figma 14:117) */}
        {itemsLoading && (
          <div className="relative flex items-center justify-center h-[58px] w-[280px]">
            <img src={ACEBET_ASSETS.spin.btnPlay} alt="" className="absolute inset-0 w-full h-full object-fill" />
            <span
              className="relative z-10 text-[16px]"
              style={{ fontFamily: 'var(--font-berkshire-swash), cursive', color: ACEBET_COLORS.goldBright }}
            >
              Loading...
            </span>
          </div>
        )}

        {/* Multi-spin buttons */}
        {!itemsLoading && (
          <div className="flex items-center justify-center gap-4 w-full">
            {[
              { label: 'Play x10', fn: tenSpin, type: 'ten spins' },
              { label: 'Play x50', fn: fiftySpin, type: 'fifty spins' },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => handleSpin(btn.fn, btn.type)}
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
          <div className="absolute inset-[13%] flex flex-col">
            <p
              className="text-center text-[18px] tracking-[2px] uppercase mb-2"
              style={{ fontFamily: 'var(--font-acme), sans-serif', color: ACEBET_COLORS.cream }}
            >
              Rewards
            </p>
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
      </div>

      {/* Result / error dialog: heading + detail inside the ornate frame,
          action buttons below (keeps the heading clear of the crown). */}
      <AcebetDialog open={!!dialog} onClose={() => setDialog(null)} frameless>
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
            <AcebetButton onClick={() => setDialog(null)}>Spin Again</AcebetButton>
            <AcebetButton variant="gold" onClick={handleReturnToWebsite}>
              Return To Website
            </AcebetButton>
          </>
        ) : (
          <AcebetButton onClick={() => setDialog(null)}>Close</AcebetButton>
        )}
      </AcebetDialog>
    </AcebetShell>
  );
}
