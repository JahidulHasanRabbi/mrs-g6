"use client";

import Image from "next/image";
import { SPIN_ASSETS } from "./spinAssets";

const TermItem = ({ text }) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="relative w-[18px] h-[18px] shrink-0 mt-1">
      <Image
        alt="Bullet"
        src={SPIN_ASSETS.bulletIcon}
        fill
        className="object-contain"
      />
    </div>
    <p className="text-white text-[11px] font-semibold leading-[1.4]">{text}</p>
  </div>
);

export default function TermsConditions() {
  const terms = [
    "Members' monthly accumulated deposit must reach RM500 or above to be entitled to this promotion.",
    "VIP birthday bonus is calculated based on your registration date.",
    "All bonuses are subject to a rollover requirement of x3.",
    "All bonuses are subject to rules regarding Minimum/Maximum Withdrawal of the bonus amount.",
    "Do not mix with other credits or bonuses; otherwise, all credits will be forfeited.",
    "Bonuses are allowed to be used on event games only (MEGAH52 Slot Game & ACEWIN2 Slot Game).",
  ];

  return (
    <div 
      className="relative w-full max-w-[450px] mx-auto rounded-[6px] p-5"
      style={{
        background: "rgba(255, 255, 255, 0.3)",
        boxShadow: "0px 0px 10px 0px rgba(233, 175, 65, 0.3)"
      }}
    >
      <div 
        className="bg-[#e9af41] rounded-[6px] px-4 py-2 inline-block mb-5"
        style={{ boxShadow: "1px 4px 11px 0px rgba(0, 0, 0, 0.1)" }}
      >
        <p className="text-white text-[12px] font-semibold text-center">Terms & Condition</p>
      </div>
      
      <div className="space-y-2">
        {terms.map((term, index) => (
          <TermItem key={index} text={term} />
        ))}
      </div>
    </div>
  );
}
