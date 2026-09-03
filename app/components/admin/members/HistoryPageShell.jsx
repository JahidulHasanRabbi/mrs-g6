"use client";

import Link from "next/link";

/**
 * Shared page shell for all member-history sub-pages.
 *
 * The admin sidebar + dark background are provided by app/admin/layout.jsx
 * (so they persist across navigation). This shell only renders the page
 * title with bell icon, a "Back to Member List" link, and the member
 * subtitle.
 *
 * @param {Object} props
 * @param {string} props.title       - e.g. "Member KR Coins"
 * @param {string} props.memberName  - displayed in the subtitle
 * @param {string} props.memberId    - displayed in the subtitle
 * @param {React.ReactNode} props.children - table card content
 */
export default function HistoryPageShell({ title, memberName, memberId, children }) {
  return (
    <main className="min-h-screen px-4 pt-6 pb-10 sm:px-6 md:px-8 xl:pl-[388px] xl:pr-10 xl:pt-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-1">
          <h1 className=" font-bold text-[22px] sm:text-[28px] text-white">
            {title}
          </h1>
          {/* Bell icon */}
        </div>

        {/* Back link */}
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-1 text-[13px] text-white/60 hover:text-white transition-colors mb-1"
        >
          <span>&#8249;</span> Back to Member List
        </Link>

        {/* Subtitle */}
        {memberName && (
          <p className=" text-[14px] text-[#e9af41] mb-4">
            Viewing history for: <span className="font-bold">{memberName}</span>
            {memberId && (
              <span className="text-white/40 ml-2 text-[12px]">(ID: {memberId})</span>
            )}
          </p>
        )}

      {/* Page-specific content (table card) */}
      {children}
    </main>
  );
}
