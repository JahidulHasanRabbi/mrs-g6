"use client";

import Image from "next/image";
import { SPIN_ASSETS } from "./spinAssets";

const SpinButton = ({ spins, tokens, onClick, image, className = "w-[160px] h-[70px]" }) => {
  return (
    <div 
      className={`relative cursor-pointer hover:scale-105 transition-transform ${className}`}
      onClick={onClick}
    >
      <Image
        alt="Button Background"
        src={image || SPIN_ASSETS.buttonBackground}
        fill
        className="object-contain"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-[#3d1a02] font-bold">
        {tokens && <div className="text-[20px] leading-tight">{tokens} token</div>}
        <div className="text-[18px] leading-tight">{spins}</div>
      </div>
    </div>
  );
};

export default SpinButton;
