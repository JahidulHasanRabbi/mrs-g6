"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import UbetclubShell from './UbetclubShell';
import HomeModuleCarousel from '../shared/HomeModuleCarousel';
import SpecialForYouBanner from '../shared/SpecialForYouBanner';
import { moduleTiles } from '../shared/homeModules';
import { UBET_ASSETS } from './assets';

const TILES = moduleTiles(UBET_ASSETS.modules);

/**
 * Ubetclub main menu: the crest over the swipeable MRS module list, with
 * Special For You underneath. The brand character that used to stand on the
 * backdrop is gone — the game list owns the stage now.
 */
export default function UbetclubHome() {
  const router = useRouter();

  return (
    <UbetclubShell bg={UBET_ASSETS.home.bg} onInfoClick={() => router.push('/terms-and-conditions')}>
      <div className="flex min-h-[calc(100dvh-184px)] w-full flex-col items-center justify-center gap-4 px-4">
        <motion.img
          src={UBET_ASSETS.home.crest}
          alt="Ubetclub"
          draggable={false}
          className="w-[min(52vw,196px)] select-none object-contain"
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        />

        <HomeModuleCarousel tiles={TILES} />
        <SpecialForYouBanner />
      </div>
    </UbetclubShell>
  );
}
