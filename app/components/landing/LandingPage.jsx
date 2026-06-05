"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { MotionConfig, motion } from "framer-motion";
import { VIP_TIERS, GAMES, PARTNERS, FOOTER_LINKS, BG_DOTS, TELEGRAM_URL } from "./landingData";

// useLayoutEffect on the client (so the carousel recenters before paint, which
// keeps the infinite-loop snap invisible) but falls back to useEffect on the
// server to avoid React's SSR warning.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* Inline-mask icon: the Iconify SVGs use currentColor, so masking with
 * `bg-current` lets each icon inherit its parent's text color. */
function MaskIcon({ src, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`block shrink-0 bg-current ${className}`}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

const mono = "font-[family-name:var(--font-jetbrains-mono)]";
const sora = "font-[family-name:var(--font-sora)]";
const goldGlowText = { textShadow: "0px 0px 20px #826e00, 0px 0px 10px #ffd700" };

const EASE = [0.22, 1, 0.36, 1]; // expo-out (an ease-out) — entrances land soft

// On-load entrance — intentionally BIG and clearly choreographed (the user
// wants a noticeable hero moment, not a subtle one). Still transform/opacity +
// a single headline blur so it stays 60fps; MotionConfig honours reduced-motion.
const fadeUp = {
  hidden: { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};
// Showpiece headline: a large rise + scale-up out of a heavy blur, paired with a
// gold shimmer that sweeps across the letters (the backgroundPosition travel).
const heroTitle = {
  hidden: {
    opacity: 0,
    y: 64,
    scale: 0.88,
    filter: "blur(18px)",
    backgroundPosition: "160% 0%",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    backgroundPosition: "-60% 0%",
    transition: { duration: 1.1, ease: EASE },
  },
};
// Dramatic spring pop with real overshoot — badges/logo punch in from small.
const popIn = {
  hidden: { opacity: 0, scale: 0.2, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 12, mass: 0.8 },
  },
};
// A visible cascade (≈130ms apart) so you actually watch items arrive in order.
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.2 } },
};
// Reveal once, when ~a quarter of the element has scrolled into view.
const inView = { once: true, amount: 0.25 };

function Header() {
  return (
    <motion.header
      initial={{ y: "-100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="sticky top-0 z-20 w-full shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#041502] to-[#1e5119]" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0px_0px_24px_0px_black]" />
      <div className="relative mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:gap-6 sm:px-6 lg:px-10">
        <Image
          src="/assets/landing/logo.png"
          alt="KingGroup44"
          width={800}
          height={300}
          priority
          style={{ width: "auto" }}
          className="h-12 w-auto sm:h-16"
        />
        {/* Scrolling ticker — the text drifts continuously like a headline.
         * Two copies + an x animation of 0 → -50% (one copy width) loops
         * seamlessly. MotionConfig pauses it for reduced-motion users. */}
        <div className="relative hidden flex-1 overflow-hidden md:block">
          <motion.div
            className="flex w-max whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 18, ease: "linear", repeat: Infinity }}
          >
            {[0, 1].map((copy) => (
              <span
                key={copy}
                aria-hidden={copy === 1 || undefined}
                className={`pr-16 text-sm font-bold tracking-[1.2px] text-[#ffd700] ${mono}`}
              >
                Spin, score, predict, and win exciting rewards on KingGroup44!
              </span>
            ))}
          </motion.div>
        </div>
        <button
          type="button"
          aria-label="Open menu"
          className="ml-auto grid size-10 place-items-center text-[#ffd700] md:ml-0"
        >
          <MaskIcon src="/assets/landing/icons/pajamas-hamburger.svg" className="size-7" />
        </button>
      </div>
    </motion.header>
  );
}

function Hero() {
  return (
    <section className="flex w-full flex-col items-center gap-10 overflow-hidden px-4 py-10 sm:px-6 lg:px-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="flex w-full max-w-[821px] flex-col items-center gap-4 pb-6 text-center"
      >
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ scale: 0.2, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 11, mass: 0.8, delay: 0.15 }}
            className="rounded-full"
            style={{ filter: "drop-shadow(0 0 18px rgba(255,215,0,0.55))" }}
          >
            <Image
              src="/assets/landing/logo.png"
              alt=""
              width={800}
              height={300}
              priority
              className="h-12 w-12 rounded-full object-contain"
            />
          </motion.div>
          <span
            className="bg-gradient-to-r from-[#ffe86d] via-[#ffd700] to-[#ffe86d] bg-clip-text text-2xl capitalize tracking-[3.6px] text-transparent"
            style={{ fontFamily: '"Lucida Calligraphy", "Brush Script MT", cursive' }}
          >
            KingGroup44
          </span>
        </motion.div>
        <motion.h1
          variants={heroTitle}
          // Gradient text (base = the original #e4e1e7) with a bright band the
          // entrance sweeps across for a one-shot gold shimmer.
          className={`bg-clip-text text-4xl font-extrabold leading-tight tracking-[-1.28px] text-transparent sm:text-5xl lg:text-[64px] lg:leading-[65px] ${sora}`}
          style={{
            backgroundImage:
              "linear-gradient(110deg, #e4e1e7 0%, #e4e1e7 42%, #fff7cc 49%, #ffffff 52%, #fff7cc 55%, #e4e1e7 62%, #e4e1e7 100%)",
            backgroundSize: "250% 100%",
          }}
        >
          The Next-Gen Mini Game Platform
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className={`max-w-[640px] text-base leading-7 text-[#d0c6ab] sm:text-lg ${mono}`}
        >
          Enter a world of high-stakes entertainment with our exclusive collection of premium
          mini-games and luxury rewards.
        </motion.p>
      </motion.div>

      <VipTierBar />
    </section>
  );
}

function VipTierBar() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      variants={stagger}
      className="relative flex w-full max-w-[1360px] flex-col items-center"
    >
      {/* Overlapping "VIP RANK BADGES" pill */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: -16 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
        }}
        className="relative z-10 -mb-5 rounded-full border-2 border-[rgba(170,141,39,0.8)] bg-[#041202] px-4 py-1.5 drop-shadow-[0px_0px_4px_rgba(255,215,0,0.15)]"
      >
        <span
          className={`text-lg font-bold uppercase tracking-[2px] text-[#ffd700] sm:text-2xl sm:tracking-[3.6px] lg:text-4xl ${mono}`}
          style={goldGlowText}
        >
          VIP Rank Badges
        </span>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="relative w-full overflow-hidden rounded-[9999px] border-2 border-[rgba(170,141,39,0.8)] shadow-[0px_0px_8px_6px_rgba(255,215,0,0.15)]"
      >
        {/* Wide, short radial (bright green center fading to near-black at the
         * edges) — matches the Figma gradient so the badge tiles blend into the
         * bar instead of reading as bright boxes. */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[9999px]"
          style={{
            background:
              "radial-gradient(ellipse 52% 52% at 50% 50%, #109d05 8%, #0f7906 31%, #0d5607 54%, #0b3208 77%, #0a2108 88%, #090f09 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[9999px] shadow-[inset_-2px_9px_15.2px_0px_rgba(59,176,48,0.19)]"
        />
        <motion.div
          variants={stagger}
          className="scrollbar-hide relative flex items-center justify-start gap-1 overflow-x-auto px-3 py-4 sm:gap-4 sm:px-4 sm:py-6 lg:justify-between"
        >
          {VIP_TIERS.map((tier) => (
            <motion.div
              key={tier.name}
              variants={popIn}
              className="flex w-[76px] shrink-0 flex-col items-center gap-1 sm:w-[110px] lg:w-auto"
            >
              {/* The shield PNGs are transparent, so a `drop-shadow` filter
               * makes the gold glow hug the shield silhouette (matching Figma's
               * shape-aware effect) instead of the square halo a box-shadow
               * would produce. */}
              <div
                className="relative size-12 sm:size-16 lg:size-20"
                style={{
                  filter:
                    "drop-shadow(0 0 8px #ffd700) drop-shadow(0 0 16px rgba(255,215,0,0.5))",
                }}
              >
                <Image src={tier.img} alt={tier.name} fill sizes="80px" className="object-contain" />
              </div>
              <span
                className={`text-[10px] font-bold tracking-[0.5px] text-[#ffd700] sm:text-xs sm:tracking-[1.2px] ${mono}`}
              >
                {tier.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

const GAME_TITLE_GLOW = { textShadow: "0px 0px 15px #826e00, 0px 0px 7.5px #ffd700" };

function GameCard({ game, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive || undefined}
      className={`flex shrink-0 flex-col items-center gap-4 outline-none transition-transform duration-500 ease-out ${isActive ? "z-10 scale-[1.35]" : "scale-90 opacity-90"
        }`}
    >
      <div
        className={`relative h-[300px] w-[180px] overflow-hidden rounded-2xl transition-shadow duration-500 sm:h-[315px] sm:w-[225px] ${isActive
            ? "border-2 border-[#ffd700] shadow-[0px_0px_10px_0px_#ffd700,0px_0px_24px_0px_#826e00]"
            : ""
          }`}
      >
        <Image src={game.img} alt={game.name} fill sizes="265px" className="object-cover" />
        {isActive && (
          <span className="absolute inset-x-3 bottom-3 rounded-full bg-[#ffd700] px-6 py-3 text-center text-base font-bold text-[#3a3000] drop-shadow-[0px_0px_15px_rgba(255,215,0,0.5)] sm:text-lg">
            <span className={sora}>Play Now</span>
          </span>
        )}
      </div>
      <span
        className={`text-center text-xl font-bold uppercase tracking-[2.7px] text-[#d1caa7] ${mono}`}
        style={GAME_TITLE_GLOW}
      >
        {game.name}
      </span>
    </button>
  );
}

const GAMES_N = GAMES.length;
// Three back-to-back copies of the game list. We keep the active index inside
// the middle copy so the centered card always has real neighbours on both
// sides (no empty gap at the ends); when the index drifts into an outer copy
// we snap it back to the equivalent middle-copy index with transitions off, so
// the loop is seamless and feels infinite.
const GAMES_LOOP = [...GAMES, ...GAMES, ...GAMES];

function GamesSection() {
  const [active, setActive] = useState(GAMES_N); // first card of the middle copy
  const [animate, setAnimate] = useState(false);
  const [paused, setPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  // Slide the track so the active card sits dead-center in the viewport.
  // We measure the card's *layout* box (offsetLeft/Width is unaffected by the
  // CSS transform scale), so centering stays stable as cards pop in and out.
  const recenter = useCallback(() => {
    const viewport = viewportRef.current;
    const card = trackRef.current?.children[active];
    if (!viewport || !card) return;
    setOffset(viewport.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2));
  }, [active]);

  useIsoLayoutEffect(() => {
    recenter();
  }, [recenter]);

  useEffect(() => {
    window.addEventListener("resize", recenter);
    return () => window.removeEventListener("resize", recenter);
  }, [recenter]);

  // Auto-advance one card at a time (the "pop"). Pauses on hover and is
  // disabled entirely for users who prefer reduced motion.
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((i) => i + 1), 2600);
    return () => clearInterval(id);
  }, [paused]);

  // After an animated move finishes, if we've landed in an outer copy, jump
  // invisibly to the matching index in the middle copy (same on-screen pixels).
  const handleTransitionEnd = (e) => {
    if (e.target !== trackRef.current || e.propertyName !== "transform") return;
    if (active >= 2 * GAMES_N || active < GAMES_N) {
      setAnimate(false);
      setActive(GAMES_N + ((((active - GAMES_N) % GAMES_N) + GAMES_N) % GAMES_N));
    }
  };

  // Re-enable transitions after the invisible snap (and on first mount).
  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  const current = GAMES[active % GAMES_N];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      variants={stagger}
      className="flex w-full flex-col items-center gap-2 overflow-hidden py-10"
    >
      <motion.div variants={fadeUp} className="w-full">
        <div
          ref={viewportRef}
          className="w-full overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            ref={trackRef}
            onTransitionEnd={handleTransitionEnd}
            // Vertical padding must clear the *scaled* active card (1.35×) plus its
            // label — the viewport's overflow-hidden (which hides the off-screen
            // loop cards) would otherwise clip them. py-20 leaves headroom.
            className="flex items-center gap-6 py-20 lg:gap-10"
            style={{
              transform: `translateX(${offset}px)`,
              transition: animate ? "transform 500ms ease-out" : "none",
            }}
          >
            {GAMES_LOOP.map((game, i) => (
              <GameCard
                key={i}
                game={game}
                isActive={i === active}
                onSelect={() => setActive(i)}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Detail panel follows the centered card, with the pointer above it.
       * The pointer is an outlined triangle (green fill, gold stroke matching
       * the card border) that floats just above the card — not a solid wedge
       * tucked under it. */}
      <motion.div variants={fadeUp} className="flex flex-col items-center px-4">
        <svg
          aria-hidden="true"
          width="60"
          height="48"
          viewBox="0 0 60 48"
          fill="none"
          className="relative z-10 mb-2 drop-shadow-[0px_0px_8px_rgba(255,215,0,0.35)]"
        >
          <path
            d="M30 5 L56 44 L4 44 Z"
            fill="#0a5205"
            stroke="#ffd700"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <div className="relative w-full max-w-[413px] overflow-hidden rounded-xl border border-[#ffd700] px-8 py-10 shadow-[inset_-9px_8px_10px_0px_rgba(0,0,0,0.25)] sm:px-10 sm:py-12">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a5205] to-[#051d02]" />
          {/* Re-keying on the active game name remounts this block, so its
           * intro replays each time the carousel advances — the copy resolves
           * in with a soft blur/rise instead of snapping between games. */}
          <motion.div
            key={current.name}
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.3, ease: EASE }}
            className="relative flex flex-col gap-2"
          >
            <h3 className={`text-3xl font-bold text-white ${sora}`} style={goldGlowText}>
              {current.name}
            </h3>
            <p className="text-base leading-6 text-[#d0c6ab] font-[family-name:var(--font-inter)]">
              {current.description}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}

function PartnerCard({ partner }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="relative flex flex-col items-stretch gap-6 overflow-hidden rounded-xl border border-[#ffd700] p-8 shadow-[inset_-9px_8px_10px_0px_rgba(0,0,0,0.25)] sm:p-12">
      <div className="absolute inset-0 bg-gradient-to-b from-[#082f06] to-[#031a00]" />
      <div className="relative flex flex-col gap-6">
        {/* Logo + name */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-16">
            <Image src={partner.logo} alt={partner.name} fill sizes="64px" className="object-contain" />
          </div>
          <h3 className={`text-2xl font-bold text-white ${sora}`}>{partner.name}</h3>
        </div>

        {/* Bonus rows */}
        <div className="flex flex-col gap-1 drop-shadow-[0px_0px_5px_rgba(84,233,138,0.8)]">
          <div
            className={`flex items-center justify-between rounded-lg border border-[#0c7f00] bg-[#e3f0e5] px-6 py-3 text-[#0c7f00] ${mono}`}
          >
            <span className="text-lg font-extrabold tracking-[1.2px]">Welcome Bonus</span>
            <span className="text-2xl font-extrabold">60%</span>
          </div>
          <div
            className={`flex items-center justify-between rounded-lg border border-[#0c7f00] bg-[#e3f0e5] px-6 py-3 text-[#0c7f00] ${mono}`}
          >
            <span className="font-extrabold tracking-[1.2px]">
              <span className="block text-lg leading-tight">New Register</span>
              <span className="block text-xs leading-tight">All Slot (Event Game)</span>
            </span>
            <span className="text-2xl font-extrabold">RM 50</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.a
            href={partner.claimUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`flex flex-1 items-center justify-center rounded-lg border border-[#6a5b0a] bg-[#ffd700] py-3 text-xs font-extrabold tracking-[1.2px] text-[#3a3000] ${mono}`}
          >
            Claim Now
          </motion.a>
          <motion.a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#30ccdd] bg-[#1592a0] px-6 py-3 text-xs font-extrabold tracking-[1.2px] text-[#ebebeb] ${mono}`}
          >
            <MaskIcon src="/assets/landing/icons/ph-telegram-logo-duotone.svg" className="size-4" />
            Telegram
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}

function PartnersSection() {
  return (
    <section className="flex w-full flex-col items-center gap-3 px-4 py-10 sm:px-6 lg:px-10">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        variants={fadeUp}
        className="flex items-center gap-2 text-[#ffd700]"
      >
        <MaskIcon src="/assets/landing/icons/fluent-arrow-eject-20-filled.svg" className="size-8 rotate-90" />
        <span
          className={`text-2xl font-bold uppercase tracking-[3.6px] sm:text-3xl lg:text-4xl ${mono}`}
          style={goldGlowText}
        >
          Our Partners
        </span>
        <MaskIcon src="/assets/landing/icons/fluent-arrow-eject-20-filled.svg" className="size-8 -rotate-90" />
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        variants={stagger}
        className="grid w-full max-w-[1360px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {PARTNERS.map((partner) => (
          <PartnerCard key={partner.name} partner={partner} />
        ))}
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="w-full border-t border-[rgba(77,71,50,0.2)] bg-[#010c00]">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        variants={stagger}
        className="mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-4 py-16 sm:px-6 sm:py-20 lg:px-10"
      >
        <motion.div variants={fadeUp}>
          <Image
            src="/assets/landing/logo.png"
            alt="KingGroup44"
            width={800}
            height={300}
            style={{ width: "auto" }}
            className="h-16 w-auto"
          />
        </motion.div>
        <motion.nav
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 pb-6"
        >
          {FOOTER_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className={`text-xs font-bold tracking-[1.2px] text-[#999077] transition-colors hover:text-[#ffd700] ${mono}`}
            >
              {link}
            </a>
          ))}
        </motion.nav>
        <motion.p variants={fadeUp} className={`text-center text-base text-[#999077] ${sora}`}>
          © 2026 KingGroup44. High-Stakes Digital Entertainment.
        </motion.p>
      </motion.div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      {/* No `overflow-hidden` here: it would create a scroll container and break
     * the header's `position: sticky`. Horizontal-overflow clipping lives on the
     * background-motes layer (and the individual sections) instead. */}
      <div className="relative isolate min-h-screen w-full bg-[#020b01]">
        {/* Background gradient + gold motes */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, #0a3406 0%, #052003 35%, #021001 65%, #000000 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {BG_DOTS.map((dot, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-gradient-to-b from-[#ffd000] to-[#997d00]"
              style={{ top: dot.top, left: dot.left, width: dot.size, height: dot.size }}
              animate={{ opacity: [dot.opacity * 0.35, dot.opacity, dot.opacity * 0.35] }}
              transition={{
                duration: 3 + (i % 4),
                repeat: Infinity,
                ease: "easeInOut",
                delay: (i % 5) * 0.4,
              }}
            />
          ))}
        </div>

        <Header />
        <main className="flex w-full flex-col items-center">
          <Hero />
          <GamesSection />
          <PartnersSection />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
