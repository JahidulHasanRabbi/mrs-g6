"use client";

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import Ep369Shell from './Ep369Shell';
import Ep369Dialog from './Ep369Dialog';
import Ep369Button from './Ep369Button';
import Ep369OrnateCard from './Ep369OrnateCard';
import { EP369_ASSETS, EP369_COLORS } from './assets';
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
const HILITE = 27;

/**
 * EP369 Lucky Spin (Figma 101:4639 wheel / 101:4568 intro / 101:4603 panel).
 * A single motion value drives the highlight racing around the eight prize
 * tiles and lands on the slot matching the server result.
 */
export default function Ep369SpinPage() {
  const [spinItems, setSpinItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(null);
  const [dialog, setDialog] = useState(null);
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

  const spinToWinner = useCallback((targetIndex, onDone) => {
    const from = spinRef.current;
    const base = from + SLOT_COUNT * 5;
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
    <Ep369Shell bg={EP369_ASSETS.spin.bg}>
      <div className="flex flex-col items-center gap-5 px-4">
        <motion.div
          className="relative w-[300px] h-[150px] shrink-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <Image src={EP369_ASSETS.spin.title} alt="Lucky Spin" fill priority className="object-contain" sizes="300px" />
        </motion.div>

        <div className="relative w-full max-w-[360px] aspect-square">
          <Image src={EP369_ASSETS.spin.wheel} alt="" fill priority className="object-contain" sizes="360px" />

          {lit && (
            <div
              className="pointer-events-none absolute rounded-[16px] transition-all duration-100"
              style={{
                left: `${lit.l - HILITE / 2}%`,
                top: `${lit.t - HILITE / 2}%`,
                width: `${HILITE}%`,
                height: `${HILITE}%`,
                border: `3px solid ${EP369_COLORS.goldBright}`,
                boxShadow: `0 0 18px 4px rgba(242,195,107,0.9), inset 0 0 14px rgba(255,246,223,0.5)`,
                background: 'rgba(255,246,223,0.14)',
              }}
            />
          )}

          <motion.button
            onClick={() => handleSpin(oneSpin, 'one spin')}
            disabled={isSpinning || itemsLoading}
            aria-label="Spin now"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[26%] aspect-square rounded-full cursor-pointer disabled:cursor-not-allowed"
            whileTap={{ scale: 0.92 }}
          />
        </div>

        {itemsLoading ? (
          <div className="relative flex h-[56px] w-[280px] items-center justify-center">
            <img src={EP369_ASSETS.spin.btnPlay} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span
              className="relative z-10 text-[16px]"
              style={{ fontFamily: 'var(--font-berkshire-swash), cursive', color: EP369_COLORS.goldBright }}
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
          <div className="absolute inset-[11%] flex flex-col">
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
      </div>

      <Ep369Dialog open={!!dialog} onClose={() => setDialog(null)}>
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
            <Ep369Button onClick={() => setDialog(null)}>Spin Again</Ep369Button>
            <Ep369Button variant="gold" onClick={handleReturnToWebsite}>
              Return To Website
            </Ep369Button>
          </>
        ) : (
          <Ep369Button onClick={() => setDialog(null)}>Close</Ep369Button>
        )}
      </Ep369Dialog>
    </Ep369Shell>
  );
}
