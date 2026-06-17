"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SMASH_EGG_ASSETS } from "./smashEggAssets";

const RANK_COLORS = {
  1: { border: "#00ff51", text: "#00ff51", bgFrom: "rgba(0,255,81,0.15)", bgTo: "rgba(0,255,81,0)" },
  2: { border: "#ffd700", text: "#ffd700", bgFrom: "rgba(255,215,0,0.15)", bgTo: "rgba(255,215,0,0)" },
  3: { border: "#fd8b00", text: "#fd8b00", bgFrom: "rgba(127,86,56,0.15)", bgTo: "rgba(127,86,56,0)" },
};

function RankBadge({ rank, color }) {
  return (
    <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
      <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 0L9.33 3.5V12L5 16L0.67 12V3.5L5 0Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="0.5" />
      </svg>
      <span
        className="absolute text-black text-[8px] font-bold top-[3px]"
        style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}
      >
        {rank}
      </span>
    </div>
  );
}

function PrizeRow({ rank, name, image, index }) {
  const colors = RANK_COLORS[rank] || RANK_COLORS[3];

  return (
    <motion.div
      className="flex items-center gap-3 pl-4 pr-3 py-3 rounded-r-lg border-l-4 w-full"
      style={{
        borderColor: colors.border,
        background: `linear-gradient(to right, ${colors.bgFrom}, ${colors.bgTo})`,
      }}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      {/* Prize Image */}
      <div className="w-12 h-12 rounded-md bg-[#231f14] border border-[rgba(77,71,50,0.4)] shrink-0 overflow-hidden relative">
        {image && (
          <Image src={image} alt={name} fill className="object-cover p-px" />
        )}
      </div>

      {/* Prize Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] leading-[15px]"
          style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif", color: colors.text }}
        >
          RANK {String(rank).padStart(2, "0")}
        </p>
        <p
          className="text-base leading-6 text-[#fff6df]"
          style={{ fontFamily: "var(--font-rubik), 'Rubik', sans-serif" }}
        >
          {name}
        </p>
      </div>

      <RankBadge rank={rank} color={colors.border} />
    </motion.div>
  );
}

function FreeCreditCard({ label, index }) {
  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-[9px] rounded-lg bg-[#2e2a1e] border border-[rgba(77,71,50,0.2)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
    >
      <div className="relative w-[26px] h-[26px] shrink-0">
        <Image
          src={SMASH_EGG_ASSETS.coinsIcon}
          alt=""
          fill
          className="object-contain"
        />
      </div>
      <div>
        <p
          className="text-[9px] text-[#ffb77d] uppercase leading-[13.5px]"
          style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}
        >
          FREE CREDIT
        </p>
        <p
          className="text-[10px] text-[#d0c6ab] leading-[15px]"
          style={{ fontFamily: "var(--font-rubik), 'Rubik', sans-serif" }}
        >
          {label}
        </p>
      </div>
    </motion.div>
  );
}

export default function PrizeList({ prizes = [], creditRanges = [] }) {
  const defaultPrizes = prizes.length > 0 ? prizes : [
    { rank: 1, name: "VIVO V40", image: null },
    { rank: 2, name: "SAMSUNG WATCH 7", image: null },
    { rank: 3, name: "SAMSUNG BUDS", image: null },
  ];

  const defaultCredits = creditRanges.length > 0 ? creditRanges : [
    "RM100 ~ RM300",
    "RM30 ~ RM100",
    "RM10 ~ RM30",
    "RM3 ~ RM10",
    "RM0.5 ~ RM3.00",
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

      <div className="relative z-10 flex flex-col gap-6">
        {/* Title */}
        <h2
          className="text-xl text-[#fff6df] uppercase tracking-[2px] leading-[30px]"
          style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}
        >
          PRIZE LIST
        </h2>

        {/* Ranked Prizes */}
        <div className="flex flex-col gap-3">
          {defaultPrizes.map((prize, i) => (
            <PrizeRow
              key={prize.rank}
              rank={prize.rank}
              name={prize.name}
              image={prize.image}
              index={i}
            />
          ))}
        </div>

        {/* Free Credit Grid */}
        <div className="grid grid-cols-2 gap-2">
          {defaultCredits.slice(0, 4).map((label, i) => (
            <FreeCreditCard key={label} label={label} index={i} />
          ))}
          {defaultCredits.length > 4 && (
            <div className="col-span-2 flex justify-center">
              <div className="w-full">
                <FreeCreditCard label={defaultCredits[4]} index={4} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
