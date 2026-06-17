"use client";

import { motion } from "framer-motion";

function WinnerItem({ date, name, prize, index }) {
  return (
    <motion.div
      className="border-l border-[#c3a813] pl-[13px] pr-3 py-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <p
        className="text-[10px] text-[#999077] leading-[15px]"
        style={{ fontFamily: "var(--font-rubik), 'Rubik', sans-serif" }}
      >
        {date}
      </p>
      <p
        className="text-base text-[#ffe16d] leading-6 pt-1"
        style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}
      >
        {name}
      </p>
      <p
        className="text-base text-[#ffb77d] leading-6"
        style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}
      >
        {prize}
      </p>
    </motion.div>
  );
}

export default function WinnerList({ winners = [] }) {
  const displayWinners = winners.length > 0 ? winners : [
    { date: "2026-04-30", name: "Fat**************************", prize: "Free Credit RM 3" },
    { date: "2026-04-30", name: "Heb**********", prize: "Free Credit RM 0.81" },
    { date: "2026-05-01", name: "Jad**********", prize: "Free Credit RM 5.00" },
    { date: "2026-05-02", name: "Mad**********", prize: "Free Credit RM 2.50" },
    { date: "2026-04-30", name: "Kha**************************", prize: "Free Credit RM 30.6" },
    { date: "2026-04-30", name: "Kus***************", prize: "Free Credit RM 0.75" },
  ];

  return (
    <div
      className="relative w-[358px] max-w-full mx-auto rounded-xl border border-[rgba(255,246,223,0.2)] p-6 overflow-hidden"
      style={{
        boxShadow: "0 0 20px rgba(233,196,0,0.1), inset 0 0 15px rgba(233,196,0,0.05)",
      }}
    >
      {/* Glass background */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          backgroundColor: "rgba(35,31,20,0.7)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Title */}
        <h2
          className="text-xl text-[#fff6df] uppercase tracking-[2px] leading-[30px]"
          style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}
        >
          WINNER
        </h2>

        {/* Winner Entries */}
        <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto">
          {displayWinners.map((winner, i) => (
            <WinnerItem
              key={`${winner.date}-${winner.name}-${i}`}
              date={winner.date}
              name={winner.name}
              prize={winner.prize}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
