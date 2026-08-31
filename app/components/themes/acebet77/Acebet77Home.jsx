"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AcebetShell from './AcebetShell';
import HomeModuleCarousel from '../shared/HomeModuleCarousel';
import SpecialForYouBanner from '../shared/SpecialForYouBanner';
import { moduleTiles } from '../shared/homeModules';
import { ACEBET_ASSETS } from './assets';

const TILES = moduleTiles(ACEBET_ASSETS.modules);

/**
 * Acebet77 main menu: the crest over the swipeable MRS module list, with
 * Special For You underneath. The brand character that used to stand on the
 * backdrop is gone — the game list owns the stage now.
 */
export default function Acebet77Home() {
  const router = useRouter();

  return (
    <AcebetShell bg={ACEBET_ASSETS.home.bg} onInfoClick={() => router.push('/terms-and-conditions')}>
      <div className="flex min-h-[calc(100dvh-184px)] w-full flex-col items-center justify-center gap-4 px-4">
        <motion.img
          src={ACEBET_ASSETS.home.crest}
          alt="Acebet77"
          draggable={false}
          className="w-[min(52vw,196px)] select-none object-contain"
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        />

        <HomeModuleCarousel tiles={TILES} />
        <SpecialForYouBanner />
      </div>
    </AcebetShell>
  );
}
