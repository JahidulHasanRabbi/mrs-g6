"use client";

import { useState } from "react";
import MemberActivityEditModal from "./MemberActivityEditModal";

const MEMBER_ACTIVITY_DATA = [
  {
    id: 1,
    userTier: "Regular User",
    maxSpinsPerDay: 3,
    bonusSpin: 0,
    resetTime: "12:00 AM",
    hasEdit: true,
  },
  {
    id: 2,
    userTier: "VIP 5",
    maxSpinsPerDay: 5,
    bonusSpin: 0,
    resetTime: "12:00 AM",
    hasEdit: true,
  },
  {
    id: 3,
    userTier: "Regular User",
    maxSpinsPerDay: 3,
    bonusSpin: 0,
    resetTime: "12:00 AM",
    hasEdit: true,
  },
  {
    id: 4,
    userTier: "Regular User",
    maxSpinsPerDay: 3,
    bonusSpin: 0,
    resetTime: "12:00 AM",
    hasEdit: true,
  },
  {
    id: 5,
    userTier: "Regular User",
    maxSpinsPerDay: 3,
    bonusSpin: 0,
    resetTime: "12:00 AM",
    hasEdit: true,
  },
];

export default function MemberActivityTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const handleEditClick = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-black border-b border-white/10">
              <th className="px-4 py-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-bold text-white font-['Times_New_Roman']">
                    User Tier
                  </span>
                  <div className="relative h-8 w-8">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M10 18L16 12L22 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 7L16 13L22 7" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-bold text-white font-['Times_New_Roman']">
                    Max Spins/Day
                  </span>
                  <div className="relative h-8 w-8">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M10 18L16 12L22 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 7L16 13L22 7" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-bold text-white font-['Times_New_Roman']">
                    Bonus Spin
                  </span>
                  <div className="relative h-8 w-8">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M10 18L16 12L22 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 7L16 13L22 7" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-bold text-white font-['Times_New_Roman']">
                    Reset Time
                  </span>
                  <div className="relative h-8 w-8">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M10 18L16 12L22 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 7L16 13L22 7" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-bold text-white font-['Times_New_Roman']">
                    Editable
                  </span>
                  <div className="relative h-8 w-8">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M10 18L16 12L22 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 7L16 13L22 7" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {MEMBER_ACTIVITY_DATA.map((member) => (
              <tr
                key={member.id}
                className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-4 py-4">
                  <p className="text-[14px] text-white font-['Times_New_Roman']">
                    {member.userTier}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-[14px] text-white/80 font-['Times_New_Roman']">
                    {member.maxSpinsPerDay}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-[14px] text-white/80 font-['Times_New_Roman']">
                    {member.bonusSpin}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-[14px] text-white/80 font-['Times_New_Roman']">
                    {member.resetTime}
                  </p>
                </td>
                <td className="px-4 py-4">
                  {member.hasEdit ? (
                    <button
                      type="button"
                      onClick={() => handleEditClick(member)}
                      className="rounded bg-[#06b800] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#06b800]/90 w-[86px]"
                    >
                      Edit
                    </button>
                  ) : (
                    <p className="text-[14px] text-white/80 font-['Times_New_Roman']">
                      No
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MemberActivityEditModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={selectedMember}
      />
    </>
  );
}
