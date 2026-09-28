"use client";

import Link from 'next/link';
import { useUser } from '../../../contexts/UserContext';
import KrCheckinStreakMeter from './KrCheckinStreakMeter';

/** Home streak meter: the member's check-in streak, linking to the check-in page. */
export default function KingRewardsStreakMeter() {
  const { userData } = useUser();
  return (
    <Link href="/daily-checkin" className="block w-full">
      <KrCheckinStreakMeter streak={userData?.currentStreak ?? 0} />
    </Link>
  );
}
