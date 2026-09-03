"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Ep369Shell from './Ep369Shell';
import HomeModuleCarousel from '../shared/HomeModuleCarousel';
import SpecialForYouBanner from '../shared/SpecialForYouBanner';
import { moduleTiles } from '../shared/homeModules';
import { EP369_ASSETS } from './assets';

const TILES = moduleTiles(EP369_ASSETS.modules);

/**
 * EP369 main menu: the crest over the swipeable MRS module list, with
 * Special For You underneath. The brand character that used to stand on the
 * backdrop is gone — the game list owns the stage now.
 */
export default function Ep369Home() {
  const router = useRouter();

  return (
    <Ep369Shell bg={EP369_ASSETS.home.bg} onInfoClick={() => router.push('/terms-and-conditions')}>
      <div className="flex min-h-[calc(100dvh-184px)] w-full flex-col items-center justify-center gap-4 px-4">
        <motion.img
          src={EP369_ASSETS.home.crest}
          alt="EP369"
          draggable={false}
          className="w-[min(52vw,196px)] select-none object-contain"
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        />

        <HomeModuleCarousel tiles={TILES} />
        <SpecialForYouBanner />
      </div>
    </Ep369Shell>
  );
}
