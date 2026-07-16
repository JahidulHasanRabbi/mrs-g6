"use client";

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import UbetclubShell from './UbetclubShell';
import UbetDialog from './UbetDialog';
import UbetButton from './UbetButton';
import UbetOrnateCard from './UbetOrnateCard';
import PrizeList from '../../smash-egg/PrizeList';
import WinnerList from '../../smash-egg/WinnerList';
import SmashEggTerms from '../../smash-egg/SmashEggTerms';
import { buildRewardBoard, mapWinningHistory, SMASH_EGG_TERMS_CATEGORY } from '../../smash-egg/smashEggData';
import { UBET_ASSETS, UBET_COLORS } from './assets';
import {
  getAllSmashEggItems,
  getSmashEggSettings,
  getSmashEggWinningList,
  getPublicTermsAndConditions,
  oneSmash,
} from '../../../api/memberApi';
import { mapSmashEggItems } from '../../../api/responseMappers';
import { tokenStorage } from '../../../api/tokenStorage';
import { useUser } from '../../../contexts/UserContext';

const WELCOME_SEEN_KEY = 'mrs_ubetclub_egg_welcome_seen';

/**
 * Ubetclub Smash Egg (Figma 77:2438 loading / 77:2359 welcome / 77:2312 idle /
 * 77:2188 cracked / 77:2235 jackpot). Reuses the standard smash-egg APIs;
 * single-tap smash flow.
 */
export default function UbetclubSmashEggPage() {
  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isCracked, setIsCracked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultDialog, setResultDialog] = useState(null); // { title, prize, image, message }
  const [tokensPerRound, setTokensPerRound] = useState(10);
  const [gameEnabled, setGameEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [smashRewards, setSmashRewards] = useState([]);
  const [winningHistory, setWinningHistory] = useState([]);
  const [termsText, setTermsText] = useState('');
  const { userData, refreshUserData } = useUser();
  const router = useRouter();

  const tokenBalance = userData?.balance ?? 0;
  const rewardBoard = useMemo(() => buildRewardBoard(smashRewards), [smashRewards]);

  // Boot: load settings while the loading bar fills, then show the welcome
  // dialog once per session.
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

  // Live winner feed — poll every 30s (same cadence as the default portal).
  useEffect(() => {
    let cancelled = false;
    async function loadWinners() {
      try {
        const response = await getSmashEggWinningList();
        if (!cancelled) setWinningHistory(mapWinningHistory(response));
      } catch (error) {
        console.error('Failed to load smash egg winners:', error);
      }
    }
    loadWinners();
    const interval = setInterval(loadWinners, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Smash Egg terms live under category 6.
  useEffect(() => {
    let cancelled = false;
    async function loadTerms() {
      try {
        const response = await getPublicTermsAndConditions(SMASH_EGG_TERMS_CATEGORY);
        if (!cancelled) setTermsText(response?.terms_and_conditions ?? '');
      } catch (error) {
        console.error('Failed to load smash egg terms:', error);
      }
    }
    loadTerms();
    return () => {
      cancelled = true;
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

  // --- Loading screen (Figma 77:2438) ---
  if (booting) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-black">
        <div className="fixed inset-0 left-1/2 -translate-x-1/2 w-full max-w-[475px]">
          <Image src={UBET_ASSETS.egg.bg} alt="" fill priority className="object-cover" sizes="475px" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-7 px-6 pt-[220px]">
          <motion.div
            className="relative h-[150px] w-[150px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          >
            <Image src={UBET_ASSETS.home.tileSmashEgg} alt="Smash Egg" fill priority className="object-contain" sizes="150px" />
          </motion.div>
          <div className="w-full max-w-[342px] rounded-[16px] border border-[rgba(242,195,107,0.25)] bg-[rgba(24,8,10,0.7)] p-[9px] backdrop-blur-[6px]">
            <div
              className="h-[12px] rounded-[8px] transition-all duration-300"
              style={{ width: `${bootProgress}%`, backgroundColor: UBET_COLORS.goldBright }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <UbetclubShell bg={UBET_ASSETS.egg.bg} onInfoClick={() => router.push('/terms-and-conditions')}>
      <div className="relative flex flex-col items-center px-4">
        {/* Rays behind the egg */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[70px] h-[540px] w-[540px] -translate-x-1/2"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
        >
          <Image src={UBET_ASSETS.egg.rays} alt="" fill className="object-contain" sizes="540px" />
        </motion.div>

        {/* Token pills */}
        <div className="relative z-10 mt-2 flex flex-col items-center gap-4">
          <div className="flex h-[46px] items-center gap-2 rounded-full border border-[rgba(255,225,109,0.3)] bg-[rgba(57,53,40,0.8)] px-[25px] backdrop-blur-[6px]">
            <img src={UBET_ASSETS.ui.iconCoin} alt="" className="h-[18px] w-[18px]" />
            <p className="text-[16px]" style={{ fontFamily: 'var(--font-rubik), sans-serif', color: '#eae2cf' }}>
              Free Token Balance: <span style={{ color: '#ffe16d' }}>{tokenBalance}</span>
            </p>
          </div>
          <div className="flex h-[46px] items-center rounded-full border border-[rgba(77,71,50,0.4)] bg-[rgba(46,42,30,0.7)] px-[25px] backdrop-blur-[6px]">
            <p className="text-[16px]" style={{ fontFamily: 'var(--font-rubik), sans-serif', color: '#d0c6ab' }}>
              {tokensPerRound} Tokens / round
            </p>
          </div>
        </div>

        {/* The egg */}
        <motion.button
          onClick={handleSmash}
          disabled={isProcessing}
          aria-label="Smash the egg"
          className="relative z-10 mt-6 h-[330px] w-[248px] cursor-pointer disabled:cursor-not-allowed"
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
                src={isCracked ? UBET_ASSETS.egg.eggCracked : UBET_ASSETS.egg.eggIntact}
                alt="Fortune egg"
                fill
                priority
                className="object-contain"
                sizes="248px"
              />
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Click to Smash */}
        <div className="relative z-10 mt-6 flex w-full justify-center">
          <button
            onClick={handleSmash}
            disabled={isProcessing}
            className="relative flex h-[70px] w-full max-w-[358px] items-center justify-center overflow-hidden cursor-pointer transition-transform active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <img src={UBET_ASSETS.ui.btnRed} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span
              className="relative z-10 text-[24px]"
              style={{ fontFamily: 'var(--font-berkshire-swash), cursive', color: UBET_COLORS.goldBright }}
            >
              {isProcessing ? 'Smashing…' : 'Click to Smash'}
            </span>
          </button>
        </div>

        {/* Prize list / winner feed / T&C — parity with the default portal,
            reusing the theme-agnostic dark-glass cards unmodified. */}
        <div className="relative z-10 mt-8 flex w-full flex-col items-center gap-6 pb-4">
          <PrizeList prizes={rewardBoard.prizes} creditRanges={rewardBoard.creditRanges} />
          <WinnerList winners={winningHistory} />
          <SmashEggTerms termsText={termsText} />
        </div>
      </div>

      {/* Welcome dialog (Figma 77:2359) */}
      <UbetDialog open={showWelcome} onClose={dismissWelcome}>
        <UbetOrnateCard>
          <div className="flex items-center gap-2">
            <img src={UBET_ASSETS.ui.iconParty} alt="" className="h-6 w-6" />
            <p className="text-[20px] uppercase tracking-[2px]" style={{ fontFamily: 'var(--font-acme), sans-serif', color: UBET_COLORS.cream }}>
              Welcome!
            </p>
          </div>
          <div className="mt-3 flex w-full items-center justify-center gap-2 rounded-[8px] border border-[rgba(242,195,107,0.35)] bg-[rgba(24,8,10,0.6)] px-4 py-3">
            <img src={UBET_ASSETS.ui.iconCoin} alt="" className="h-[26px] w-[26px] shrink-0" />
            <div className="flex flex-col items-center">
              <p className="text-[12px] uppercase" style={{ color: UBET_COLORS.goldBright, fontFamily: 'var(--font-acme), sans-serif' }}>
                You have received
              </p>
              <p className="mt-1 text-[11px]" style={{ color: UBET_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}>
                {tokenBalance} Free Tokens
              </p>
            </div>
          </div>
        </UbetOrnateCard>
        <UbetButton onClick={dismissWelcome}>Start Playing</UbetButton>
      </UbetDialog>

      {/* Result dialog (Figma 77:2235) */}
      <UbetDialog open={!!resultDialog} onClose={closeResult}>
        {resultDialog?.prize ? (
          <>
            <UbetOrnateCard>
              <div className="flex items-center gap-2">
                <img src={UBET_ASSETS.ui.iconParty} alt="" className="h-6 w-6" />
                <p className="text-center text-[18px] uppercase tracking-[2px]" style={{ fontFamily: 'var(--font-acme), sans-serif', color: UBET_COLORS.cream }}>
                  {resultDialog.title}
                </p>
              </div>
              {/* Jackpot-style reward panel with the live reward as gold text. */}
              <div className="mt-3 flex w-full flex-col items-center gap-1 rounded-[10px] border border-[rgba(242,195,107,0.4)] bg-[rgba(24,8,10,0.72)] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[1px]" style={{ color: UBET_COLORS.goldBright, fontFamily: 'var(--font-acme), sans-serif' }}>
                  You&apos;ve unlocked
                </p>
                {resultDialog.image && (
                  <img src={resultDialog.image} alt="" className="my-1 h-12 w-12 object-contain" />
                )}
                <p
                  className="max-w-full break-words text-center font-bold"
                  style={{
                    fontSize:
                      (resultDialog.prize?.length ?? 0) > 22
                        ? 'clamp(14px, 4.2vw, 18px)'
                        : (resultDialog.prize?.length ?? 0) > 12
                          ? 'clamp(18px, 6vw, 24px)'
                          : 'clamp(24px, 8vw, 32px)',
                    lineHeight: 1.1,
                    fontFamily: 'var(--font-acme), sans-serif',
                    background: 'linear-gradient(180deg, #fff2c0 0%, #f2c36b 45%, #dd8f1f 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.5))',
                  }}
                >
                  {resultDialog.prize}
                </p>
              </div>
            </UbetOrnateCard>
            <UbetButton onClick={handleClaimNow}>Claim Now</UbetButton>
            <UbetButton variant="gold" onClick={handleDownloadNow}>
              Download Now
            </UbetButton>
          </>
        ) : (
          <>
            <UbetOrnateCard>
              <p className="text-center text-[20px] uppercase tracking-[2px]" style={{ fontFamily: 'var(--font-acme), sans-serif', color: UBET_COLORS.cream }}>
                {resultDialog?.title}
              </p>
              <p className="mt-3 text-center text-[14px]" style={{ color: UBET_COLORS.sand, fontFamily: 'var(--font-rubik), sans-serif' }}>
                {resultDialog?.message}
              </p>
            </UbetOrnateCard>
            <UbetButton onClick={closeResult}>Close</UbetButton>
          </>
        )}
      </UbetDialog>
    </UbetclubShell>
  );
}
