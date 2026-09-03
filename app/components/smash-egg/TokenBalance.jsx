"use client";

import Image from "next/image";
import { SMASH_EGG_ASSETS } from "./smashEggAssets";

function formatTokenAmount(value) {
  const amount = Number(String(value ?? 0).replace(/,/g, ""));
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function TokenBalance({ balance, tokensPerRound }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* KR Coin Balance Pill */}
      <div
        className="flex items-center gap-2 h-[46px] px-6 py-[11px] rounded-full border border-[rgba(255,225,109,0.3)]"
        style={{
          backgroundColor: "rgba(57,53,40,0.8)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
        }}
      >
        <div className="relative w-[18px] h-[18px] shrink-0">
          <Image
            src={SMASH_EGG_ASSETS.tokenIcon}
            alt=""
            fill
            className="object-contain"
          />
        </div>
        <p
          className="text-[#eae2cf] text-base whitespace-nowrap"
          style={{ fontFamily: "var(--font-rubik), 'Rubik', sans-serif", fontWeight: 500 }}
        >
          KR Coin Balance:{" "}
          <span className="text-[#ffe16d]">{formatTokenAmount(balance)}</span>
        </p>
      </div>

      {/* KR Coins Per Round Pill */}
      <div
        className="flex items-center h-[46px] px-6 py-[11px] rounded-full border border-[rgba(77,71,50,0.4)] relative overflow-hidden"
      >
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            backgroundColor: "rgba(46,42,30,0.7)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        />
        <p
          className="text-[#d0c6ab] text-base whitespace-nowrap relative z-10"
          style={{ fontFamily: "var(--font-rubik), 'Rubik', sans-serif", fontWeight: 500 }}
        >
          {formatTokenAmount(tokensPerRound)} KR Coins / round
        </p>
      </div>
    </div>
  );
}
