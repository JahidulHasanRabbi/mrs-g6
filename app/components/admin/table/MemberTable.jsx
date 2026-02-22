"use client";

import { useMemo } from "react";

const MOCK_DATA = [
  { id: 1, member: "john88", lastLogin: "26 Jun, 2:44 PM", activeSection: "Spin Wheel", timeSpent: "18 mins", vipTier: "VIP 1" },
  { id: 2, member: "john88", lastLogin: "26 Jun, 2:44 PM", activeSection: "Spin Wheel", timeSpent: "18 mins", vipTier: "VIP 1" },
  { id: 3, member: "john88", lastLogin: "26 Jun, 2:44 PM", activeSection: "Spin Wheel", timeSpent: "18 mins", vipTier: "VIP 1" },
  { id: 4, member: "john88", lastLogin: "26 Jun, 2:44 PM", activeSection: "Spin Wheel", timeSpent: "18 mins", vipTier: "VIP 1" },
  { id: 5, member: "john88", lastLogin: "26 Jun, 2:44 PM", activeSection: "Spin Wheel", timeSpent: "18 mins", vipTier: "VIP 1" },
  { id: 6, member: "john88", lastLogin: "26 Jun, 2:44 PM", activeSection: "Spin Wheel", timeSpent: "18 mins", vipTier: "VIP 1" },
  { id: 7, member: "john88", lastLogin: "26 Jun, 2:44 PM", activeSection: "Spin Wheel", timeSpent: "18 mins", vipTier: "VIP 1" },
  { id: 8, member: "john88", lastLogin: "26 Jun, 2:44 PM", activeSection: "Spin Wheel", timeSpent: "18 mins", vipTier: "VIP 1" },
  { id: 9, member: "john88", lastLogin: "26 Jun, 2:44 PM", activeSection: "Spin Wheel", timeSpent: "18 mins", vipTier: "VIP 1" },
  { id: 10, member: "john88", lastLogin: "26 Jun, 2:44 PM", activeSection: "Spin Wheel", timeSpent: "18 mins", vipTier: "VIP 1" },
];

export default function MemberTable() {
  const data = useMemo(() => MOCK_DATA, []);

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 border-b border-white/10 bg-black/25 px-5 py-2 backdrop-blur">
        <p className="text-sm font-medium text-gray-400">Member Name :</p>
        <p className="text-sm font-medium text-gray-400">Last Login :</p>
        <p className="text-sm font-medium text-gray-400">Active Section :</p>
        <p className="text-sm font-medium text-gray-400">Time Spent :</p>
        <p className="text-sm font-medium text-gray-400">VIP Tier :</p>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-white/10">
        {data.map((row) => (
          <div key={row.id} className="grid grid-cols-5 gap-4 px-5 py-2.5">
            <p className="text-sm text-gray-300">{row.member}</p>
            <p className="text-sm text-gray-300">{row.lastLogin}</p>
            <p className="text-sm text-gray-300">{row.activeSection}</p>
            <p className="text-sm text-gray-300">{row.timeSpent}</p>
            <p className="text-sm text-gray-300">{row.vipTier}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
