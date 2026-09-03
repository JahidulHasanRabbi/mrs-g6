"use client";

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Lv918Shell from './Lv918Shell';
import Lv918Dialog from './Lv918Dialog';
import Lv918Button from './Lv918Button';
import Lv918OrnateCard from './Lv918OrnateCard';
import Lv918BottomNav from './Lv918BottomNav';
import LuckySpinGrid from '../../spin/LuckySpinGrid';
import Lv918ListPanel from './Lv918ListPanel';
import Lv918SectionHeading from './Lv918SectionHeading';
import { SMASH_EGG_ASSETS } from '../../smash-egg/smashEggAssets';
import { LV918_ASSETS, LV918_COLORS } from './assets';
import { oneSpin, tenSpin, fiftySpin, getAllLuckySpinItems, getPublicTermsAndConditions, getWinningList } from '../../../api/memberApi';
import { mapSpinResults, mapLuckySpinItems } from '../../../api/responseMappers';
import { tokenStorage } from '../../../api/tokenStorage';
import { useUser } from '../../../contexts/UserContext';

// Mask all but the first/last couple of characters (mirrors SpinWinningPanel).
function maskUsername(name) {
  if (!name) return '';
  if (name.includes('*')) return name;
  if (name.length <= 2) return `${name[0]}*`;
  if (name.length <= 4) return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`;
  return `${name.slice(0, 2)}${'*'.repeat(name.length - 4)}${name.slice(-2)}`;
}

function formatWinDate(value) {
  const dt = new Date(value || Date.now());
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Lv918 Lucky Spin. The wheel itself is the shared <LuckySpinGrid> — the
// same spin/selection engine the default portal uses — fed lv918's artwork and
// a square-frame geometry. Only the images change; the timing, ring cycling,
// deceleration, winner highlight and manual-stop all come from the shared code.
// Plaque PNGs carry transparent padding (visible frame ~0.86× the box here), so
// the box is sized up to ~26% → visible ~22% at the 24% column pitch, closing
// the dark gaps between tiles so the 3x3 grid reads as full like the reference.
const LV918_GEOMETRY = { framePad: 16, tile: 24, center: 24 };

export default function Lv918SpinPage() {
  const [spinItems, setSpinItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [booting, setBooting] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [dialog, setDialog] = useState(null); // { type: 'win'|'error', title, message }
  const [userWinnings, setUserWinnings] = useState([]);
  const [activeWinningView, setActiveWinningView] = useState('record');
  const [records, setRecords] = useState([]);
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

  // Global winner feed for the "Winning Record" view — polls every 30s.
  useEffect(() => {
    let cancelled = false;
    const fetchWinnings = async () => {
      try {
        const data = await getWinningList();
        if (cancelled || !Array.isArray(data)) return;
        setRecords(
          data.map((item) => ({
            date: formatWinDate(item.datetime_obtained),
            name: maskUsername(item.display_name),
            reward: item.prize_name,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch winning list:', error);
      }
    };
    fetchWinnings();
    const interval = setInterval(fetchWinnings, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
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

  // Boot/loading flourish (Figma 154:596): celestial backdrop, the queen on the
  // left, the LUCKY SPIN logo and a "Loading…" bar. Clears once the spin items
  // have loaded (with a short minimum so it doesn't flash).
  useEffect(() => {
    if (itemsLoading) return undefined;
    const t = setTimeout(() => setBooting(false), 650);
    return () => clearTimeout(t);
  }, [itemsLoading]);

  if (booting) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-black">
        <div className="fixed inset-0 left-1/2 w-full max-w-[475px] -translate-x-1/2">
          <img src={LV918_ASSETS.spin.bg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        {/* Queen (left) */}
        <img
          src={LV918_ASSETS.home.king}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute bottom-[120px] left-[-16%] z-10 h-[56%] w-auto select-none object-contain"
        />
        {/* LUCKY SPIN logo + Loading bar */}
        <div className="relative z-20 flex flex-col items-center px-6 pt-[34vh]">
          <motion.img
            src={LV918_ASSETS.home.tileLuckySpin}
            alt="Lucky Spin"
            draggable={false}
            className="h-[150px] w-[150px] select-none object-contain drop-shadow-[0_8px_20px_rgba(4,20,48,0.5)]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          />
          <div className="relative mt-8 flex aspect-2172/724 w-75 max-w-[86%] items-center justify-center">
            {/* Dedicated ornate loading frame (Figma 154:596 / node 170:1130).
                object-contain keeps the gold corners un-stretched. */}
            <img
              src={LV918_ASSETS.spin.loadingBar}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-contain"
            />
            <motion.span
              className="relative z-10 text-[17px]"
              style={{ fontFamily: 'var(--font-berkshire-swash), cursive', color: LV918_COLORS.goldBright }}
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            >
              Loading…
            </motion.span>
          </div>
        </div>
        <Lv918BottomNav />
      </div>
    );
  }

  return (
    <Lv918Shell bg={LV918_ASSETS.spin.bg} onInfoClick={() => router.push('/profile')} balance={tokenBalance} profileMode>
      <div className="flex flex-col items-center gap-6 px-4">
        {/* LUCKY SPIN title */}
        <motion.div
          className="relative w-[318px] h-[106px] shrink-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          {/* Plain <img>: Next's optimizer flattens transparent PNG alpha to
              white when it serves small-width WebP, so bypass it for cutouts. */}
          <img src={LV918_ASSETS.spin.title} alt="Lucky Spin" draggable={false} className="absolute inset-0 h-full w-full select-none object-contain" />
        </motion.div>

        {/* Wheel — shared engine, lv918 art */}
        <LuckySpinGrid
          assets={LV918_ASSETS.spin.grid}
          themed={LV918_GEOMETRY}
          items={spinItems}
          isSpinning={isSpinning}
          onSpinClick={handleCenterSpin}
          onSpinComplete={handleSpinComplete}
          spinTriggerRef={gridSpinTriggerRef}
        />

        {/* Multi-spin buttons */}
        {/* Two ornate plaques — KR Coin cost + spin multiplier, like the base
            theme (100 KR Coins / SPIN X10, 500 KR Coins / SPIN X50). */}
        {!itemsLoading && (
          <div className="flex w-full items-center justify-center gap-4">
            {[
              { id: 'x10', fn: tenSpin, type: 'ten spins', tokens: '100', spins: 'SPIN X10' },
              { id: 'x50', fn: fiftySpin, type: 'fifty spins', tokens: '500', spins: 'SPIN X50' },
            ].map((btn) => (
              <button
                key={btn.id}
                aria-label={`${btn.tokens} KR Coins, ${btn.spins}`}
                onClick={() => handleMultiSpin(btn.fn, btn.type)}
                disabled={isSpinning}
                // Taller plaques: the button keeps the art's native 3:1 ratio
                // (no stretch) but scales up with the column so the two stacked
                // lines aren't cramped, and shrinks on narrow phones.
                className="@container relative flex aspect-[3/1] max-w-[208px] flex-1 cursor-pointer items-center justify-center transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <img src={LV918_ASSETS.spin.btnPlay} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none object-fill" />
                {/* cqi, not px: the plaque is fluid (flex-1) but a fixed size
                    overflowed the bevel once the button dropped below 208px. */}
                <span className="relative z-10 flex flex-col items-center justify-center gap-0.5 leading-[1.1]">
                  <span className="whitespace-nowrap text-[5.5cqi]" style={{ fontFamily: 'var(--font-rubik), sans-serif', color: LV918_COLORS.cream }}>
                    {btn.tokens} KR Coins
                  </span>
                  <span className="whitespace-nowrap text-[7.8cqi] leading-none" style={{ fontFamily: 'var(--font-berkshire-swash), cursive', color: LV918_COLORS.goldBright }}>
                    {btn.spins}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Rewards panel (ornate frame). The source art is a wide 16:9 frame, so
            it's stretched to fill a taller box (object-fill) — the frame reads
            larger and the reward list sits directly on the pink interior (no
            dark scrim). The list is inset within the gold rails (~15% sides,
            ~20% top, ~19% bottom); dark-rose text keeps rows legible on pink. */}
        <div className="relative aspect-6/5 w-full max-w-95">
          <img src={LV918_ASSETS.spin.panel} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none object-fill" />
          <div className="absolute inset-x-[15%] top-[20%] bottom-[19%]">
            <div className="h-full overflow-y-auto px-2 py-1 scrollbar-lv918">
              {spinItems.length === 0 ? (
                <p className="mt-6 text-center text-[13px]" style={{ color: LV918_COLORS.inkSoft, fontFamily: 'var(--font-rubik), sans-serif' }}>
                  {itemsLoading ? 'Loading rewards…' : 'No rewards available.'}
                </p>
              ) : (
                spinItems.map((item, i) => (
                  <div
                    key={item.uuid || i}
                    className="flex items-center gap-2.5 border-b border-[rgba(138,47,87,0.20)] py-2 last:border-b-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[7px] bg-[rgba(255,255,255,0.55)] ring-1 ring-[rgba(138,47,87,0.28)]">
                      {item.image ? (
                        <img src={item.image} alt="" className="h-full w-full object-contain p-0.5" />
                      ) : (
                        <span className="text-[14px]" style={{ color: LV918_COLORS.gold }}>🎁</span>
                      )}
                    </div>
                    <span
                      className="min-w-0 flex-1 truncate text-[13px]"
                      title={item.reward_name}
                      style={{ color: LV918_COLORS.inkStrong, fontFamily: 'var(--font-rubik), sans-serif' }}
                    >
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
          <Lv918Button
            variant={activeWinningView === 'record' ? 'gold' : 'dark'}
            className={`!max-w-[150px] ${activeWinningView === 'record' ? '' : 'opacity-60'}`}
            textSize={14}
            onClick={() => setActiveWinningView('record')}
          >
            Winning Record
          </Lv918Button>
          <Lv918Button
            variant={activeWinningView === 'list' ? 'gold' : 'dark'}
            className={`!max-w-[150px] ${activeWinningView === 'list' ? '' : 'opacity-60'}`}
            textSize={14}
            onClick={() => setActiveWinningView('list')}
          >
            Winning List
          </Lv918Button>
        </div>

        {/* Winning Record / Winning List on the ornate panel (Figma 154:692).
            The toggle plaques above already label the view, so no title inside. */}
        <Lv918ListPanel height={300}>
          {(() => {
            const items = activeWinningView === 'record'
              ? records
              : userWinnings.map((r) => ({ date: r.date, reward: r.reward, name: null }));
            if (items.length === 0) {
              return (
                <p className="pt-2 text-[13px]" style={{ color: LV918_COLORS.inkSoft, fontFamily: 'var(--font-rubik), sans-serif' }}>
                  {activeWinningView === 'record' ? 'No winners yet.' : "You haven't won anything yet — spin to play!"}
                </p>
              );
            }
            return items.map((item, i) => (
              <div key={`${item.date}-${item.name}-${item.reward}-${i}`} className="border-l-2 border-[#c9791f] py-1.5 pl-3">
                <p className="text-[10px] leading-[15px]" style={{ color: LV918_COLORS.inkMuted, fontFamily: 'var(--font-rubik), sans-serif' }}>{item.date}</p>
                {item.name != null && (
                  <p className="text-[15px] leading-6" style={{ color: LV918_COLORS.ink, fontFamily: 'var(--font-acme), sans-serif' }}>{item.name}</p>
                )}
                <p className="truncate text-[15px] leading-6" style={{ color: LV918_COLORS.inkStrong, fontFamily: 'var(--font-acme), sans-serif' }}>{item.reward}</p>
              </div>
            ));
          })()}
        </Lv918ListPanel>

        {/* Terms & Conditions — heading OUTSIDE the frame, in theme gold. */}
        <Lv918SectionHeading className="mt-1">Terms &amp; Conditions</Lv918SectionHeading>
        <Lv918ListPanel height={250}>
          {(() => {
            const terms = String(termsText || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
            if (terms.length === 0) {
              return (
                <p className="pt-2 text-[13px]" style={{ color: LV918_COLORS.inkSoft, fontFamily: 'var(--font-rubik), sans-serif' }}>
                  No terms and conditions available.
                </p>
              );
            }
            return terms.map((term, i) => (
              <div key={i} className="flex items-start gap-2 py-1">
                <img src={SMASH_EGG_ASSETS.termsIcon} alt="" className="mt-[3px] h-4 w-[18px] shrink-0 object-contain" />
                <p className="flex-1 text-[13px] leading-5" style={{ color: LV918_COLORS.inkStrong, fontFamily: 'var(--font-acme), sans-serif' }}>{term}</p>
              </div>
            ));
          })()}
        </Lv918ListPanel>
      </div>

      {/* Result / error dialog */}
      <Lv918Dialog open={!!dialog} onClose={closeDialog} frameless>
        <Lv918OrnateCard>
          <div className="flex items-center gap-2">
            {dialog?.type === 'win' && (
              <img src={LV918_ASSETS.ui.iconParty} alt="" className="w-6 h-6" />
            )}
            <p
              className="text-[20px] tracking-[2px] uppercase text-center"
              style={{ fontFamily: 'var(--font-acme), sans-serif', color: dialog?.type === 'error' ? '#ff9d9d' : LV918_COLORS.cream }}
            >
              {dialog?.title}
            </p>
          </div>
          {dialog?.type === 'win' ? (
            <div className="mt-3 flex w-full flex-col items-center gap-1.5 rounded-[8px] ring-1 ring-inset ring-[rgba(242,203,122,0.3)] bg-[rgba(8,20,44,0.5)] px-4 py-3">
              <div className="flex items-center gap-2">
                <img src={LV918_ASSETS.ui.iconCoins} alt="" className="w-[24px] h-[24px] shrink-0" />
                <p className="text-[12px] uppercase tracking-[1px]" style={{ color: '#ffb77d', fontFamily: 'var(--font-acme), sans-serif' }}>
                  You have won
                </p>
              </div>
              <p
                className="max-h-[96px] overflow-y-auto break-words text-center text-[13px] leading-snug"
                style={{ color: LV918_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}
              >
                {dialog?.message}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-[14px] text-center" style={{ color: LV918_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}>
              {dialog?.message}
            </p>
          )}
        </Lv918OrnateCard>
        {dialog?.type === 'win' ? (
          <>
            <Lv918Button onClick={closeDialog}>Spin Again</Lv918Button>
            <Lv918Button variant="gold" onClick={handleReturnToWebsite}>
              Return To Website
            </Lv918Button>
          </>
        ) : (
          <Lv918Button onClick={closeDialog}>Close</Lv918Button>
        )}
      </Lv918Dialog>
    </Lv918Shell>
  );
}
