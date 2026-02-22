"use client";

const USER_LOGS_DATA = [
  {
    id: 1,
    username: "john88",
    datetime: "27 Jun, 3:42 PM",
    prize: "RM10 Free Credit",
    device: "iPhone Safari",
    ipAddress: "203.0.113.11",
  },
  {
    id: 2,
    username: "john88",
    datetime: "27 Jun, 3:42 PM",
    prize: "RM10 Free Credit",
    device: "iPhone Safari",
    ipAddress: "203.0.113.11",
  },
  {
    id: 3,
    username: "john88",
    datetime: "27 Jun, 3:42 PM",
    prize: "RM10 Free Credit",
    device: "iPhone Safari",
    ipAddress: "203.0.113.11",
  },
  {
    id: 4,
    username: "john88",
    datetime: "27 Jun, 3:42 PM",
    prize: "RM10 Free Credit",
    device: "iPhone Safari",
    ipAddress: "203.0.113.11",
  },
  {
    id: 5,
    username: "john88",
    datetime: "27 Jun, 3:42 PM",
    prize: "RM10 Free Credit",
    device: "iPhone Safari",
    ipAddress: "203.0.113.11",
  },
  {
    id: 6,
    username: "john88",
    datetime: "27 Jun, 3:42 PM",
    prize: "RM10 Free Credit",
    device: "iPhone Safari",
    ipAddress: "203.0.113.11",
  },
  {
    id: 7,
    username: "john88",
    datetime: "27 Jun, 3:42 PM",
    prize: "RM10 Free Credit",
    device: "iPhone Safari",
    ipAddress: "203.0.113.11",
  },
  {
    id: 8,
    username: "john88",
    datetime: "27 Jun, 3:42 PM",
    prize: "RM10 Free Credit",
    device: "iPhone Safari",
    ipAddress: "203.0.113.11",
  },
];

export default function UserLogsTable({ selectedYear = "2024" }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-black border-b border-white/10">
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-bold text-white font-['Times_New_Roman']">
                  Username
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
                <span className="text-[18px] font-bold text-white font-['Times_New_Roman']">
                  Date & Time
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
                <span className="text-[18px] font-bold text-white font-['Times_New_Roman']">
                  Prize
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
                <span className="text-[18px] font-bold text-white font-['Times_New_Roman']">
                  Device
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
                <span className="text-[18px] font-bold text-white font-['Times_New_Roman']">
                  IP Address
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
          {USER_LOGS_DATA.map((log) => (
            <tr
              key={log.id}
              className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
            >
              <td className="px-4 py-4">
                <p className="text-[14px] text-white font-['Times_New_Roman']">
                  {log.username}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-[14px] text-white/80 font-['Times_New_Roman']">
                  {log.datetime}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-[14px] text-white/80 font-['Times_New_Roman']">
                  {log.prize}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-[14px] text-white/80 font-['Times_New_Roman']">
                  {log.device}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-[14px] text-white/80 font-['Times_New_Roman']">
                  {log.ipAddress}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
