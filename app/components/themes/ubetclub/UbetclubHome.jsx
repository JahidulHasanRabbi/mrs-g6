"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import UbetclubShell from './UbetclubShell';
import { UBET_ASSETS } from './assets';

const GAME_TILES = [
  { id: 'lucky-spin', image: UBET_ASSETS.home.tileLuckySpin, label: 'Lucky Spin', link: '/spin' },
  { id: 'smash-egg', image: UBET_ASSETS.home.tileSmashEgg, label: 'Smash Egg', link: '/smash-egg' },
  { id: 'penalty-kick', image: UBET_ASSETS.home.tilePenaltyKick, label: 'Penalty Kick', link: '/penalty-kick' },
];

/**
 * Ubetclub main menu (Figma node 77:3674): red New-Year stage with the God of
 * Wealth on the left, the crowned crest and the three game tiles.
 */
export default function UbetclubHome() {
  const router = useRouter();

  return (
    <UbetclubShell
      bg={UBET_ASSETS.home.bg}
      onInfoClick={() => router.push('/terms-and-conditions')}
      bgOverlay={
        <div
          className="absolute left-[-4%] top-[7%] h-[62%] w-[66%] pointer-events-none"
          aria-hidden
        >
          <Image
            src={UBET_ASSETS.home.godWealth}
            alt=""
            fill
            priority
            className="object-contain object-left-top"
            sizes="320px"
          />
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center gap-[12px] min-h-[calc(100vh-184px)] px-3">
        {/* Ubetclub crest */}
        <motion.div
          className="relative w-[206px] h-[138px] shrink-0"
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <Image src={UBET_ASSETS.home.crest} alt="Ubetclub" fill priority className="object-contain" sizes="206px" />
        </motion.div>

        {/* Game tiles */}
        <div className="flex items-center gap-[6px]">
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
                className="block relative w-[112px] h-[112px] min-[430px]:w-[120px] min-[430px]:h-[120px]"
              >
                <Image src={tile.image} alt={tile.label} fill className="object-contain" sizes="120px" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </UbetclubShell>
  );
}
