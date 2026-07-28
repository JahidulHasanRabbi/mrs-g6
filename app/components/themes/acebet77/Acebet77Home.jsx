"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AcebetShell from './AcebetShell';
import { ACEBET_ASSETS } from './assets';

const GAME_TILES = [
  { id: 'lucky-spin', image: ACEBET_ASSETS.home.tileLuckySpin, label: 'Lucky Spin', link: '/spin' },
  { id: 'smash-egg', image: ACEBET_ASSETS.home.tileSmashEgg, label: 'Smash Egg', link: '/smash-egg' },
  { id: 'penalty-kick', image: ACEBET_ASSETS.home.tilePenaltyKick, label: 'Penalty Kick', link: '/penalty-kick' },
];

/**
 * Acebet77 main menu (Figma node 8:4483): royal throne backdrop with the
 * king on the right, ACEBET77 crest and the three game tiles.
 */
export default function Acebet77Home() {
  const router = useRouter();

  return (
    <AcebetShell
      bg={ACEBET_ASSETS.home.bg}
      onInfoClick={() => router.push('/terms-and-conditions')}
      bgOverlay={
        <div
          className="absolute h-[63%] w-[63%] right-0 top-[12%] pointer-events-none"
          aria-hidden
        >
          <Image
            src={ACEBET_ASSETS.home.king}
            alt=""
            fill
            priority
            className="object-contain object-right-top"
            sizes="300px"
          />
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center gap-[10px] min-h-[calc(100vh-184px)] px-4">
        {/* ACEBET77 crest */}
        <motion.div
          className="relative w-[206px] h-[138px] shrink-0"
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <Image src={ACEBET_ASSETS.home.crest} alt="Acebet77" fill priority className="object-contain" sizes="206px" />
        </motion.div>

        {/* Game tiles */}
        <div className="flex items-center gap-2">
          {GAME_TILES.map((tile, i) => (
            <motion.div
              key={tile.id}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 260, damping: 20 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href={tile.link} aria-label={tile.label} className="block relative w-[110px] h-[110px] min-[430px]:w-[120px] min-[430px]:h-[120px]">
                <Image src={tile.image} alt={tile.label} fill className="object-cover" sizes="120px" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AcebetShell>
  );
}
