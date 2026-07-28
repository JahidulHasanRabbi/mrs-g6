"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Ep369Shell from './Ep369Shell';
import { EP369_ASSETS } from './assets';

// Figma tile order: Lucky Spin, Penalty Kick (center), Smash Egg.
const GAME_TILES = [
  { id: 'lucky-spin', image: EP369_ASSETS.home.tileLuckySpin, label: 'Lucky Spin', link: '/spin' },
  { id: 'penalty-kick', image: EP369_ASSETS.home.tilePenaltyKick, label: 'Penalty Kick', link: '/penalty-kick' },
  { id: 'smash-egg', image: EP369_ASSETS.home.tileSmashEgg, label: 'Smash Egg', link: '/smash-egg' },
];

/**
 * EP369 main menu (Figma node 101:4745): enchanted-forest stage with the fae
 * queen, the crest and the three game tiles.
 */
export default function Ep369Home() {
  const router = useRouter();

  return (
    <Ep369Shell
      bg={EP369_ASSETS.home.bg}
      onInfoClick={() => router.push('/terms-and-conditions')}
      bgOverlay={
        <div
          className="absolute left-1/2 top-[12%] h-[64%] w-[80%] -translate-x-1/2 pointer-events-none"
          aria-hidden
        >
          <Image
            src={EP369_ASSETS.home.fae}
            alt=""
            fill
            priority
            className="object-contain object-top"
            sizes="340px"
          />
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center gap-[12px] min-h-[calc(100vh-184px)] px-3">
        {/* EP369 crest */}
        <motion.div
          className="relative w-[206px] h-[138px] shrink-0"
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <Image src={EP369_ASSETS.home.crest} alt="EP369" fill priority className="object-contain" sizes="206px" />
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
    </Ep369Shell>
  );
}
