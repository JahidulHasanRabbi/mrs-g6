"use client";

import Image from "next/image";
import { SPIN_ASSETS } from "./spinAssets";

const SpinItem = ({ background, prize, position, size = "w-[114px] h-[112px]" }) => (
  <div className={`absolute ${position}`}>
    <Image
      alt=""
      src={background}
      width={114}
      height={112}
      className={`${size} object-cover pointer-events-none`}
    />
    {prize && (
      <Image
        alt=""
        src={prize}
        width={72}
        height={69}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none"
      />
    )}
  </div>
);

export default function LuckySpinGrid() {
  const gridItems = [
    { background: SPIN_ASSETS.itemGold, position: "left-[-8px] top-[-10px]" },
    { background: SPIN_ASSETS.itemGreen, prize: SPIN_ASSETS.prize1, position: "left-[96px] top-[-13px]", size: "w-[99px] h-[112px]" },
    { background: SPIN_ASSETS.itemGold, position: "left-[194px] top-[-10px]" },
    { background: SPIN_ASSETS.itemGreen, position: "left-[-7px] top-[88px]", size: "w-[100px] h-[112px]" },
    { background: SPIN_ASSETS.itemGreen, prize: SPIN_ASSETS.prize2, position: "left-[196px] top-[87px]", size: "w-[101px] h-[114px]" },
    { background: SPIN_ASSETS.itemGold, position: "left-[-9px] top-[193px]" },
    { background: SPIN_ASSETS.itemGreen, prize: SPIN_ASSETS.prize3, position: "left-[96px] top-[191px]", size: "w-[100px] h-[113px]" },
    { background: SPIN_ASSETS.itemGold, position: "left-[194px] top-[194px]" },
  ];

  return (
    <div className="relative w-[376px] h-[348px] mx-auto">
      <Image
        alt="Spin Grid Background"
        src={SPIN_ASSETS.background}
        fill
        className="object-cover pointer-events-none"
      />

      <div className="absolute left-[41px] top-[21px] w-[290px] h-[298px]">
        {gridItems.map((item, index) => (
          <SpinItem key={index} {...item} />
        ))}

        <div className="absolute left-[77px] top-[73px] w-[143px] h-[143px] cursor-pointer hover:scale-105 transition-transform">
          <Image
            alt="Spin Now Button"
            src={SPIN_ASSETS.centerButton}
            width={143}
            height={143}
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
