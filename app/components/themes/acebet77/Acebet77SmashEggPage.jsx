"use client";

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AcebetShell from './AcebetShell';
import AcebetDialog from './AcebetDialog';
import AcebetButton from './AcebetButton';
import AcebetOrnateCard from './AcebetOrnateCard';
import { ACEBET_ASSETS, ACEBET_COLORS } from './assets';
import {
  getAllSmashEggItems,
  getSmashEggSettings,
  oneSmash,
} from '../../../api/memberApi';
import { mapSmashEggItems } from '../../../api/responseMappers';
import { tokenStorage } from '../../../api/tokenStorage';
import { useUser } from '../../../contexts/UserContext';

const WELCOME_SEEN_KEY = 'mrs_acebet77_egg_welcome_seen';

/**
 * Acebet77 Smash Egg (Figma nodes 4:588 loading / 4:533 welcome /
 * 4:503 idle egg / 63:1939 cracked / 63:2034 congratulations).
 * Reuses the standard smash-egg APIs; single-tap smash flow.
 */
export default function Acebet77SmashEggPage() {
  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isCracked, setIsCracked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultDialog, setResultDialog] = useState(null); // { title, items, message }
  const [smashRewards, setSmashRewards] = useState([]);
  const [tokensPerRound, setTokensPerRound] = useState(10);
  const [gameEnabled, setGameEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { userData, refreshUserData } = useUser();

  const tokenBalance = userData?.balance ?? 0;

  // Boot sequence: load rewards + settings while the loading screen's
  // progress bar fills (Figma 4:588), then surface the welcome dialog once
  // per session (Figma 4:533).
  useEffect(() => {
    let cancelled = false;
    const progressTimer = setInterval(() => {
      setBootProgress((p) => Math.min(p + Math.random() * 22, 92));
    }, 180);

    async function boot() {
      try {
        const [itemsRes, settingsRes] = await Promise.allSettled([
          getAllSmashEggItems(),
          getSmashEggSettings(),
        ]);
        if (cancelled) return;
        if (itemsRes.status === 'fulfilled') {
          setSmashRewards(mapSmashEggItems(itemsRes.value));
        }
        if (settingsRes.status === 'fulfilled') {
          const settings = settingsRes.value;
          if (settings?.cost_per_smash != null) setTokensPerRound(Number(settings.cost_per_smash));
          setGameEnabled(Number(settings?.game_status ?? 1) === 1 && !settings?.maintenance_mode);
          setMaintenanceMode(Boolean(settings?.maintenance_mode));
        }
      } finally {
        if (!cancelled) {
          clearInterval(progressTimer);
          setBootProgress(100);
          setTimeout(() => {
            if (cancelled) return;
            setBooting(false);
            try {
              if (!sessionStorage.getItem(WELCOME_SEEN_KEY)) setShowWelcome(true);
            } catch {
              setShowWelcome(true);
            }
          }, 450);
        }
      }
    }
    boot();

    return () => {
      cancelled = true;
      clearInterval(progressTimer);
    };
  }, []);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    try {
      sessionStorage.setItem(WELCOME_SEEN_KEY, '1');
    } catch {}
  }, []);

  const smashResultsRef = useRef(null);

  const handleSmash = useCallback(async () => {
    const memberUuid = tokenStorage.getMemberUuid();
    if (!memberUuid) {
      setResultDialog({ title: 'Oops', message: 'Please log in to smash.' });
      return;
    }
    if (!gameEnabled) {
      setResultDialog({
        title: maintenanceMode ? 'Maintenance' : 'Closed',
        message: maintenanceMode ? 'Smash Egg is under maintenance.' : 'Smash Egg is currently closed.',
      });
      return;
    }
    if (isProcessing || isCracked) return;

    setIsProcessing(true);
    try {
      const response = await oneSmash(memberUuid);
      const results = Array.isArray(response) ? response : [response].filter(Boolean);
      smashResultsRef.current = results;
      setIsCracked(true);
      refreshUserData?.().catch(() => {});
      setTimeout(() => {
        const first = smashResultsRef.current?.[0];
        setResultDialog({
          title: 'Congratulations',
          prize: first?.reward_name || 'Reward',
          image: first?.image || null,
        });
        setIsProcessing(false);
      }, 1200);
    } catch (error) {
      const message =
        error?.data?.details || error?.data?.detail || error?.message || 'Smash failed. Please try again.';
      const lowerMessage = String(message).toLowerCase();
      if (lowerMessage.includes('maintenance') || lowerMessage.includes('close')) {
        setGameEnabled(false);
        setMaintenanceMode(lowerMessage.includes('maintenance'));
      }
      setResultDialog({ title: 'Oops', message });
      setIsProcessing(false);
      setIsCracked(false);
    }
  }, [gameEnabled, maintenanceMode, isProcessing, isCracked, refreshUserData]);

  const closeResult = useCallback(() => {
    setResultDialog(null);
    setIsCracked(false);
  }, []);

  const handleClaimNow = useCallback(() => {
    const savedO = tokenStorage.getRedirectO?.();
    if (!savedO) {
      window.location.href = '/promotion';
      return;
    }
    const base = String(savedO).startsWith('http') ? savedO : `https://${savedO}`;
    window.location.href = `${base.replace(/\/$/, '')}/promotion`;
  }, []);

  const handleDownloadNow = useCallback(() => {
    const savedO = tokenStorage.getRedirectO?.();
    if (savedO) {
      const base = String(savedO).startsWith('http') ? savedO : `https://${savedO}`;
      window.location.href = base;
    }
  }, []);

  // --- Loading screen (Figma 4:588) ---
  if (booting) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-black">
        <div className="fixed inset-0 left-1/2 -translate-x-1/2 w-full max-w-[475px]">
          <Image src={ACEBET_ASSETS.egg.bgLoading} alt="" fill priority className="object-cover" sizes="475px" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6 pt-[240px] px-6">
          <motion.div
            className="relative w-[132px] h-[147px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          >
            <Image src={ACEBET_ASSETS.egg.logo} alt="Smash Egg" fill priority className="object-cover" sizes="132px" />
          </motion.div>
          <div className="w-full max-w-[342px] rounded-[16px] border border-[rgba(255,246,223,0.15)] bg-[rgba(35,31,20,0.7)] backdrop-blur-[6px] p-[9px]">
            <div
              className="h-[12px] rounded-[8px] transition-all duration-300"
              style={{ width: `${bootProgress}%`, backgroundColor: ACEBET_COLORS.goldBright }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AcebetShell bg={ACEBET_ASSETS.egg.bg}>
      <div className="relative flex flex-col items-center px-4">
        {/* Light rays behind the egg */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-[80px] w-[552px] h-[556px] pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
        >
          <Image src={ACEBET_ASSETS.egg.rays} alt="" fill className="object-contain" sizes="552px" />
        </motion.div>

        {/* Token pills */}
        <div className="relative z-10 flex flex-col items-center gap-4 mt-2">
          <div className="flex items-center gap-2 h-[46px] px-[25px] rounded-full border border-[rgba(255,225,109,0.3)] bg-[rgba(57,53,40,0.8)] backdrop-blur-[6px]">
            <img src={ACEBET_ASSETS.egg.iconToken} alt="" className="w-[18px] h-[18px]" />
            <p className="text-[16px]" style={{ fontFamily: 'var(--font-rubik), sans-serif', color: ACEBET_COLORS.creamMuted }}>
              Free Token Balance:{' '}
              <span style={{ color: ACEBET_COLORS.tokenYellow }}>{tokenBalance}</span>
            </p>
          </div>
          <div className="flex items-center h-[46px] px-[25px] rounded-full border border-[rgba(77,71,50,0.4)] bg-[rgba(46,42,30,0.7)] backdrop-blur-[6px]">
            <p className="text-[16px]" style={{ fontFamily: 'var(--font-rubik), sans-serif', color: ACEBET_COLORS.sand }}>
              {tokensPerRound} Tokens / round
            </p>
          </div>
        </div>

        {/* The egg */}
        <motion.button
          onClick={handleSmash}
          disabled={isProcessing}
          aria-label="Smash the egg"
          className="relative z-10 w-[248px] h-[343px] mt-6 cursor-pointer disabled:cursor-not-allowed"
          whileTap={{ scale: 0.96 }}
          animate={
            isCracked
              ? { rotate: [0, -3, 3, -3, 3, 0], transition: { duration: 0.5 } }
              : { y: [0, -8, 0], transition: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' } }
          }
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={isCracked ? 'cracked' : 'intact'}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Image
                src={isCracked ? ACEBET_ASSETS.egg.eggCracked : ACEBET_ASSETS.egg.eggIntact}
                alt="Golden egg"
                fill
                priority
                className="object-contain"
                sizes="248px"
              />
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Click to Smash */}
        <div className="relative z-10 w-full flex justify-center mt-6">
          <div className="relative flex items-center justify-center h-[75px] w-full max-w-[358px]">
            <button
              onClick={handleSmash}
              disabled={isProcessing}
              className="relative flex items-center justify-center w-full h-full cursor-pointer active:scale-[0.97] transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <img src={ACEBET_ASSETS.egg.btnWide} alt="" className="absolute inset-0 w-full h-full object-fill" />
              <span
                className="relative z-10 text-[24px]"
                style={{ fontFamily: 'var(--font-berkshire-swash), cursive', color: ACEBET_COLORS.goldBright }}
              >
                {isProcessing ? 'Smashing…' : 'Click to Smash'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Welcome dialog (Figma 4:533): heading + free-token grant inside the
          ornate frame; Start Playing button below. */}
      <AcebetDialog open={showWelcome} onClose={dismissWelcome} frameless>
        <AcebetOrnateCard>
          <div className="flex items-center gap-2">
            <img src={ACEBET_ASSETS.ui.iconGift} alt="" className="w-6 h-6" />
            <p className="text-[20px] tracking-[2px] uppercase" style={{ fontFamily: 'var(--font-acme), sans-serif', color: ACEBET_COLORS.cream }}>
              Welcome!
            </p>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 rounded-[8px] border border-[rgba(77,71,50,0.35)] bg-[#030304] px-4 py-3 w-full">
            <img src={ACEBET_ASSETS.ui.iconCoins} alt="" className="w-[26px] h-[26px] shrink-0" />
            <div className="flex flex-col items-center">
              <p className="text-[12px] uppercase" style={{ color: '#ffb77d', fontFamily: 'var(--font-acme), sans-serif' }}>
                You have received
              </p>
              <p className="text-[11px] mt-1" style={{ color: ACEBET_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}>
                {tokenBalance} Free Tokens
              </p>
            </div>
          </div>
        </AcebetOrnateCard>
        <AcebetButton onClick={dismissWelcome}>Start Playing</AcebetButton>
      </AcebetDialog>

      {/* Result dialog (Figma 63:2034): heading + reward inside the ornate
          frame; action buttons below it. */}
      <AcebetDialog open={!!resultDialog} onClose={closeResult} frameless>
        {resultDialog?.prize ? (
          <>
            <AcebetOrnateCard>
              <div className="flex items-center gap-2">
                <img src={ACEBET_ASSETS.ui.iconParty} alt="" className="w-6 h-6" />
                <p className="text-[18px] tracking-[2px] uppercase text-center" style={{ fontFamily: 'var(--font-acme), sans-serif', color: ACEBET_COLORS.cream }}>
                  {resultDialog.title}
                </p>
              </div>
              {/* Jackpot reward: ribbon + live amount + coin pile. The amount is
                  rendered as real text (the source art had a placeholder baked in). */}
              <div className="relative mt-2 w-full rounded-[10px] overflow-hidden bg-black">
                <img src={ACEBET_ASSETS.egg.jackpotRibbon} alt="Jackpot unlocked" className="block w-full" />
                <div className="relative -mt-1 flex flex-col items-center px-3">
                  <div
                    className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 w-[200px] h-[100px]"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(255,205,90,0.28) 0%, rgba(255,205,90,0) 70%)' }}
                    aria-hidden
                  />
                  <p className="relative text-[11px]" style={{ color: '#fff', fontFamily: 'var(--font-rubik), sans-serif' }}>
                    You&apos;ve unlocked
                  </p>
                  <p
                    className="relative mt-0.5 max-w-full break-words text-center font-bold"
                    style={{
                      // Scale down for long reward names (token/sequence codes)
                      // so they wrap inside the panel instead of overflowing.
                      fontSize:
                        (resultDialog.prize?.length ?? 0) > 22
                          ? 'clamp(14px, 4.2vw, 18px)'
                          : (resultDialog.prize?.length ?? 0) > 12
                            ? 'clamp(18px, 6vw, 24px)'
                            : 'clamp(26px, 8vw, 34px)',
                      lineHeight: 1.1,
                      fontFamily: 'var(--font-acme), sans-serif',
                      color: '#ffd24a',
                      background: 'linear-gradient(180deg, #fff2c0 0%, #ffcf4a 45%, #e79a10 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.5)) drop-shadow(0 0 16px rgba(255,205,90,0.55))',
                    }}
                  >
                    {resultDialog.prize}
                  </p>
                </div>
                <img src={ACEBET_ASSETS.egg.jackpotCoins} alt="" className="block w-full -mt-1" />
              </div>
            </AcebetOrnateCard>
            <AcebetButton onClick={handleClaimNow}>Claim Now</AcebetButton>
            <AcebetButton variant="gold" onClick={handleDownloadNow}>
              Download Now
            </AcebetButton>
          </>
        ) : (
          <>
            <AcebetOrnateCard>
              <p className="text-[20px] tracking-[2px] uppercase text-center" style={{ fontFamily: 'var(--font-acme), sans-serif', color: ACEBET_COLORS.cream }}>
                {resultDialog?.title}
              </p>
              <p className="mt-3 text-[14px] text-center" style={{ color: ACEBET_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}>
                {resultDialog?.message}
              </p>
            </AcebetOrnateCard>
            <AcebetButton onClick={closeResult}>Close</AcebetButton>
          </>
        )}
      </AcebetDialog>
    </AcebetShell>
  );
}
