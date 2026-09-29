"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import KingRewardsShell from './KingRewardsShell';
import KingRewardsModuleRail from './KingRewardsModuleRail';
import KingRewardsStreakMeter from './KingRewardsStreakMeter';
import SpecialForYouBanner from '../shared/SpecialForYouBanner';
import { useUser } from '../../../contexts/UserContext';
import { KR_ASSETS, KR_FONT } from './assets';

/** King Rewards main menu (Figma 664:1094). */
export default function KingRewardsHome() {
  const { userData } = useUser();

  return (
    <KingRewardsShell balance={userData?.balance ?? 0} showBattlePoints>
      <div className="flex w-full flex-col items-center gap-4 px-4 pb-4 pt-4">
        <motion.img
          src={KR_ASSETS.home.logo}
          alt="King Rewards"
          draggable={false}
          className="w-[min(52vw,220px)] select-none object-contain"
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        />

        <div className="flex w-full flex-col items-center gap-2">
          <KingRewardsModuleRail />
          {/* No help/FAQ page exists; Missions is where members earn KR Coins. */}
          <Link
            href="/missions"
            className="px-2 py-1 text-[12px] font-semibold text-white underline underline-offset-2"
            style={{ fontFamily: KR_FONT }}
          >
            How to get KR Coins
          </Link>
        </div>

        <SpecialForYouBanner heading={null} />
        <KingRewardsStreakMeter />
      </div>
    </KingRewardsShell>
  );
}
