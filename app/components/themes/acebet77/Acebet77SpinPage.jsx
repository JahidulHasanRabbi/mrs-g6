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
// Slot centers sit on a ring at 22.5% of the wheel width, offset 22.5° so the
// eight slots fall inside the eight painted sectors of the wheel artwork.
const SLOT_RADIUS_PCT = 22.5;
const SLOT_SIZE_PCT = 11.5;
// Angular offset of slot 0 from the top (12 o'clock), so the eight slots fall
// inside the painted sectors. The spin math (crown pointer) references this.
const SLOT_ANGLE_OFFSET = 22.5;

function slotPosition(index) {
  const angle = ((-90 + SLOT_ANGLE_OFFSET + index * 45) * Math.PI) / 180;
  return {
    left: `${50 + SLOT_RADIUS_PCT * Math.cos(angle) - SLOT_SIZE_PCT / 2}%`,
    top: `${50 + SLOT_RADIUS_PCT * Math.sin(angle) - SLOT_SIZE_PCT / 2}%`,
  };
}

/**
 * Acebet77 Lucky Spin (Figma nodes 15:195 idle / 30:118 spinning /
 * 14:117 loading / 39:116 rewards panel). Reuses the standard spin APIs:
 * the wheel highlight runs around the eight prize slots and lands on the
 * slot matching the server result.
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
  // Single source of truth for the spin: the wheel's rotation. The lit slot is
  // derived from this exact value on every frame (see handleSpin's onUpdate),
  // so the spinning medallion and the item highlight can never drift apart.
  const rotation = useMotionValue(0);
  const rotationRef = useRef(0);
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

  // Spin the wheel to the winning slot. A single framer-motion animation drives
  // the rotation; the lit slot is computed from that same rotation on every
  // frame, so the medallion and the highlight are always in lockstep. The wheel
  // does whole turns plus the exact fraction needed to land the winner under the
  // highlight, and ends on a 45°-aligned angle so the medallion sits upright.
  const spinToWinner = useCallback((targetIndex, onDone) => {
    const SEG = 360 / SLOT_COUNT; // 45° per slot
    // The medallion's crown is the pointer: at rotation R it points at screen
    // angle (-90 + R). Slot i sits at angle (-90 + SLOT_ANGLE_OFFSET + i*SEG),
    // so the crown points at slot i when R ≡ SLOT_ANGLE_OFFSET + i*SEG. We
    // derive the lit slot from that exact relationship, and land the spin so
    // the crown points at the winner — the pointer and the highlight are the
    // same thing, spatially and in time.
    const from = rotationRef.current;
    const desired = SLOT_ANGLE_OFFSET + targetIndex * SEG; // target R (mod 360)
    const base = from + 360 * 5; // at least 5 full turns
    const extra = (((desired - (base % 360)) % 360) + 360) % 360;
    const to = base + extra;
    rotationRef.current = to;

    // Which slot the crown currently points at (round to nearest sector).
    const litFor = (rot) =>
      ((Math.round((rot - SLOT_ANGLE_OFFSET) / SEG) % SLOT_COUNT) + SLOT_COUNT) % SLOT_COUNT;
    spinAnimRef.current = animate(rotation, to, {
      duration: 3.6,
      ease: [0.12, 0.7, 0.2, 1],
      onUpdate: (v) => setHighlightIndex(litFor(v)),
      onComplete: () => {
        setHighlightIndex(targetIndex);
        onDone();
      },
    });
  }, [rotation]);

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

  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => ({
    item: spinItems[i] || null,
    isGold: i % 2 === 0,
  }));

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

        {/* Wheel */}
        <div className="relative w-full max-w-[402px] aspect-square">
          <Image src={ACEBET_ASSETS.spin.wheelBase} alt="" fill priority className="object-contain" sizes="402px" />

          {!itemsLoading &&
            slots.map((slot, i) => {
              const pos = slotPosition(i);
              const isLit = highlightIndex === i;
              return (
                <div
                  key={i}
                  className="absolute transition-all duration-100"
                  style={{
                    ...pos,
                    width: `${SLOT_SIZE_PCT}%`,
                    height: `${SLOT_SIZE_PCT}%`,
                    filter: isLit
                      ? 'brightness(1.6) drop-shadow(0 0 12px rgba(255,225,109,0.95))'
                      : 'none',
                    transform: isLit ? 'scale(1.18)' : 'scale(1)',
                    zIndex: isLit ? 3 : 2,
                  }}
                >
                  <img
                    src={slot.isGold ? ACEBET_ASSETS.spin.slotGold : ACEBET_ASSETS.spin.slotGreen}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  <div className="absolute inset-[18%] flex items-center justify-center">
                    {slot.item?.image ? (
                      <img
                        src={slot.item.image}
                        alt={slot.item.reward_name || ''}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextSibling?.style && (e.currentTarget.nextSibling.style.display = 'block');
                        }}
                      />
                    ) : null}
                    <span
                      className="font-bold text-[16px]"
                      style={{
                        color: '#3d2c07',
                        display: slot.item?.image ? 'none' : 'block',
                        fontFamily: 'var(--font-acme), sans-serif',
                      }}
                    >
                      ?
                    </span>
                  </div>
                </div>
              );
            })}

          {/* Center SPIN NOW medallion. It visibly spins (whole turns, so it
              settles upright) while the slot highlight lands on the winner —
              together they read as a real spin with a clear result. */}
          {/* Outer wrapper owns the centering translate; the inner motion
              element owns the rotation so framer-motion's transform doesn't
              clobber the centering. */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[34.5%] aspect-square z-[4]">
            <motion.button
              onClick={() => handleSpin(oneSpin, 'one spin')}
              disabled={isSpinning || itemsLoading}
              aria-label="Spin now"
              className="relative w-full h-full cursor-pointer disabled:cursor-not-allowed"
              whileTap={{ scale: 0.94 }}
              style={{ rotate: rotation }}
            >
              <Image src={ACEBET_ASSETS.spin.spinNow} alt="Spin Now" fill className="object-contain" sizes="140px" />
            </motion.button>
          </div>
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
