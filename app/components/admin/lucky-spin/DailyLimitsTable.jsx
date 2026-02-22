"use client";

const DAILY_LIMITS_DATA = [
  {
    id: 1,
    memberName: "john88",
    lastLogin: "26 June, 2:44 PM",
    activeSection: "Spin Wheel",
    timeSpent: "18 mins",
    vipTier: "VIP 4",
    hasSetLimit: true,
  },
  {
    id: 2,
    memberName: "john88",
    lastLogin: "26 June, 2:44 PM",
    activeSection: "Spin Wheel",
    timeSpent: "18 mins",
    vipTier: "VIP 4",
    hasSetLimit: true,
  },
  {
    id: 3,
    memberName: "john88",
    lastLogin: "26 June, 2:44 PM",
    activeSection: "Spin Wheel",
    timeSpent: "18 mins",
    vipTier: "VIP 4",
    hasSetLimit: true,
  },
  {
    id: 4,
    memberName: "john88",
    lastLogin: "26 June, 2:44 PM",
    activeSection: "Spin Wheel",
    timeSpent: "18 mins",
    vipTier: "VIP 4",
    hasSetLimit: true,
  },
  {
    id: 5,
    memberName: "john88",
    lastLogin: "26 June, 2:44 PM",
    activeSection: "Spin Wheel",
    timeSpent: "18 mins",
    vipTier: "VIP 4",
    hasSetLimit: true,
  },
];

export default function DailyLimitsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-black border-b border-white/10">
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-white font-['Times_New_Roman']">
                  Member Name
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
                  Last Login
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
                  Active Section
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
                  Time Spent
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
                  VIP Tier
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
                  Actions
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
          {DAILY_LIMITS_DATA.map((member) => (
            <tr
              key={member.id}
              className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
            >
              <td className="px-4 py-4">
                <p className="text-[14px] text-white font-['Times_New_Roman']">
                  {member.memberName}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-[14px] text-white/80 font-['Times_New_Roman']">
                  {member.lastLogin}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-[14px] text-white/80 font-['Times_New_Roman']">
                  {member.activeSection}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-[14px] text-white/80 font-['Times_New_Roman']">
                  {member.timeSpent}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-[14px] text-white/80 font-['Times_New_Roman']">
                  {member.vipTier}
                </p>
              </td>
              <td className="px-4 py-4">
                <button className="rounded border border-[#f04a4a] px-4 py-2 text-sm text-[#f04a4a] transition-colors hover:bg-[#f04a4a]/10">
                  Set Limit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
