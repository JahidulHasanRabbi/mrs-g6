"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import KgameShell from './KgameShell';
import { KGAME99_ASSETS } from './assets';

// Figma 154:773 tile order: Lucky Spin, Penalty Kick, Smash Egg.
const GAME_TILES = [
  { id: 'lucky-spin', image: KGAME99_ASSETS.home.tileLuckySpin, label: 'Lucky Spin', link: '/spin' },
  { id: 'penalty-kick', image: KGAME99_ASSETS.home.tilePenaltyKick, label: 'Penalty Kick', link: '/penalty-kick' },
  { id: 'smash-egg', image: KGAME99_ASSETS.home.tileSmashEgg, label: 'Smash Egg', link: '/smash-egg' },
];

/**
 * Kgame99 main menu (Figma node 154:773): celestial "crystal kingdom" backdrop
 * with the crowned queen standing on the platform (left), the Kgame99 crest and
 * the three game tiles on the platform.
 *
 * The queen + crest + tiles render as plain <img> (not next/image fill): the
 * optimizer's fill+object-contain path paints a white letterbox behind
 * transparent PNGs in this layout, so plain tags keep them cleanly cut out.
 */
export default function Kgame99Home() {
  const router = useRouter();

  return (
    <KgameShell
      bg={KGAME99_ASSETS.home.bg}
      onInfoClick={() => router.push('/terms-and-conditions')}
      bgOverlay={
        <motion.img
          src={KGAME99_ASSETS.home.king}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute bottom-[15%] left-[-15%] h-full w-[90%] select-none object-contain object-bottom"
          initial={{ opacity: 0, x: -30 }}
          // Slide/fade in once, then keep the queen gently floating: a clear
          // vertical bob with a slower ethereal sway (different periods so it
          // reads as organic drift, not a metronome).
          animate={{ opacity: 1, x: 0, y: [0, -22, 0], rotate: [0, -1.4, 0, 1.4, 0] }}
          transition={{
            opacity: { duration: 0.6, ease: 'easeOut' },
            x: { type: 'spring', stiffness: 140, damping: 18 },
            y: { repeat: Infinity, duration: 3.6, ease: 'easeInOut' },
            rotate: { repeat: Infinity, duration: 7.2, ease: 'easeInOut' },
          }}
        />
      }
    >
      <div className="relative h-[calc(100dvh-184px)] w-full">
        {/* Kgame99 crest — centred over the scene. Width is viewport-fluid so it
            scales down on small phones instead of crowding the scene. */}
        <motion.img
          src={KGAME99_ASSETS.home.crest}
          alt="Kgame99"
          draggable={false}
          className="absolute left-1/2 top-[42%] w-[min(58vw,200px)] -translate-x-1/2 -translate-y-1/2 select-none object-contain drop-shadow-[0_6px_18px_rgba(4,20,48,0.55)]"
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        />

        {/* Game tiles — sit on the platform (lower third). The row spans the
            column width (inset-x-0 + justify-center + padding) and the tiles are
            viewport-fluid, so all three always fit narrow phones instead of the
            outer two being clipped off-screen. */}
        <div className="absolute inset-x-0 top-[64%] flex items-center justify-center gap-2 px-3">
          {GAME_TILES.map((tile, i) => (
            <motion.div
              key={tile.id}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 260, damping: 20 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={tile.link}
                aria-label={tile.label}
                className="relative block aspect-square w-[clamp(70px,26vw,120px)]"
              >
                <img
                  src={tile.image}
                  alt={tile.label}
                  draggable={false}
                  className="h-full w-full select-none object-contain drop-shadow-[0_6px_14px_rgba(4,20,48,0.45)]"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </KgameShell>
  );
}
