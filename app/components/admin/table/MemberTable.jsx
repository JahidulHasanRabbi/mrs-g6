"use client";

import { useMemo } from "react";

export default function MemberTable({ members = [] }) {
  const displayData = useMemo(() => {
    // Format member data for display
    return members.slice(0, 10).map((member) => {
      // Format last login datetime
      let lastLogin = 'Never';
      if (member.last_login_datetime) {
        const date = new Date(member.last_login_datetime);
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const time = date.toLocaleString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        lastLogin = `${day} ${month}, ${time}`;
      }

      return {
        id: member.id,
        member: member.username || member.phone_number || 'Unknown',
        lastLogin,
        activeSection: 'N/A', // Not provided by API
        timeSpent: 'N/A', // Not provided by API
        vipTier: member.tier || 'N/A',
        tokens: member.current_tokens || 0
      };
    });
  }, [members]);

  if (!members.length) {
    return (
      <div className="w-full py-8 text-center text-gray-400">
        No member data available
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-6 gap-4 border-b border-white/10 bg-black/25 px-5 py-2 backdrop-blur">
        <p className="text-sm font-medium text-gray-400">Member Name :</p>
        <p className="text-sm font-medium text-gray-400">Last Login :</p>
        <p className="text-sm font-medium text-gray-400">Phone Number :</p>
        <p className="text-sm font-medium text-gray-400">Current Tokens :</p>
        <p className="text-sm font-medium text-gray-400">VIP Tier :</p>
        <p className="text-sm font-medium text-gray-400">Last Check-In :</p>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-white/10">
        {displayData.map((row) => (
          <div key={row.id} className="grid grid-cols-6 gap-4 px-5 py-2.5">
            <p className="text-sm text-gray-300">{row.member}</p>
            <p className="text-sm text-gray-300">{row.lastLogin}</p>
            <p className="text-sm text-gray-300">{members.find(m => m.id === row.id)?.phone_number || 'N/A'}</p>
            <p className="text-sm text-gray-300">{row.tokens.toLocaleString()}</p>
            <p className="text-sm text-gray-300">{row.vipTier}</p>
            <p className="text-sm text-gray-300">
              {members.find(m => m.id === row.id)?.last_check_in_date 
                ? new Date(members.find(m => m.id === row.id).last_check_in_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : 'Never'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
