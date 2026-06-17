"use client";

import Image from "next/image";
import { SMASH_EGG_ASSETS } from "./smashEggAssets";

const TERMS = [
  "Credit cannot mixed with other deposits and bonuses.",
  "1 Member / 1 ID / 1 Name can only participate in this Lucky Spin Event.",
  "Only slot games are allowed.",
  "The name on the bank account must match the registered name. Incorrect details result in forfeited winnings.",
];

export default function SmashEggTerms() {
  return (
    <div
      className="relative w-[342px] max-w-full mx-auto rounded-2xl border border-[rgba(255,246,223,0.15)] p-8 overflow-hidden"
      style={{
        backgroundColor: "rgba(35,31,20,0.7)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div className="relative z-10 flex flex-col gap-8">
        <h3
          className="text-base text-[#fff6df] leading-6"
          style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}
        >
          Terms &amp; Conditions
        </h3>

        <div className="flex flex-col gap-2">
          {TERMS.map((term, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="shrink-0 pt-[2px]">
                <div className="relative w-[18px] h-4">
                  <Image
                    src={SMASH_EGG_ASSETS.termsIcon}
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <p
                className="text-sm text-[#d0c6ab] leading-[25.6px] flex-1"
                style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}
              >
                {term}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
