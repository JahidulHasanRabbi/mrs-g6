"use client";

import Image from "next/image";
import { SPIN_ASSETS } from "./spinAssets";

const RewardItem = ({ icon, title }) => (
  <div 
    className="relative w-full h-[62px] rounded-[6px] border border-white overflow-hidden"
    style={{
      background: "linear-gradient(0.57deg, rgba(242, 195, 107, 0) 74.37%, rgb(221, 143, 31) 94%), linear-gradient(90deg, rgba(7, 25, 13, 0.44) 0%, rgba(7, 25, 13, 0.44) 100%)",
      boxShadow: "3px 3px 48px 3px rgba(231, 196, 87, 0.5)"
    }}
  >
    <div className="absolute inset-0 flex items-center gap-6 px-4">
      <div className="relative w-[50px] h-[51px] shrink-0">
        <Image
          alt={title}
          src={icon}
          fill
          className="object-cover"
        />
      </div>
      <p className="text-white text-xl font-bold text-start mx-auto">
        {title}
      </p>
    </div>
  </div>
);

const CreditCard = ({ range }) => (
  <div className="relative w-[130px] h-[96px]">
    <Image
      alt="Coin Frame"
      src={SPIN_ASSETS.coinFrame}
      fill
      className="object-cover"
    />
    <div className="absolute left-[-60px] bottom-[6px] w-[130px] h-[50px]">
      <Image
        alt="Coin"
        src={SPIN_ASSETS.coin2}
        fill
        className="object-contain"
      />
    </div>
    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#a67520] font-bold text-center gap-0 -mt-2">
      <p className="text-[16px]  leading-tight">FREE</p>
      <p className="text-[16px]  leading-tight">CREDIT</p>
      <p className="text-[12px]  leading-tight mt-1">{range}</p>
    </div>
  </div>
);

export default function RewardsList() {
  const rewards = [
    { icon: SPIN_ASSETS.prize1, title: "I Phone 17 Pro Max" },
    { icon: SPIN_ASSETS.prize2, title: "Sexy Toy" },
    { icon: SPIN_ASSETS.prize3, title: "Birthday" },
  ];

  const creditCards = [
    "RM1.00 ~ RM5.00",
    "RM5.00 ~ RM15.00",
    "RM15.00 ~ RM45.00",
    "RM45.00 ~ RM135.00",
    "RM135.00 ~ RM400.00",
  ];

  return (
    <div className="relative w-[420px] h-[950px] mx-auto">
      <Image
        alt="Scroll Background"
        src={SPIN_ASSETS.scrollBackground}
        fill
        className="object-cover"
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center px-10 py-12">
        <h2 className="text-[36px] font-bold text-[#a67520] text-center mb-4">
          Rewards List
        </h2>
        
        <div className="flex flex-col gap-3 w-full max-w-[300px]">
          {rewards.map((reward, index) => (
            <RewardItem key={index} {...reward} />
          ))}
          
          <div className="flex justify-center gap-8 mt-2">
            <CreditCard range={creditCards[0]} />
            <CreditCard range={creditCards[1]} />
          </div>
          
          <div className="flex justify-center gap-8">
            <CreditCard range={creditCards[2]} />
            <CreditCard range={creditCards[3]} />
          </div>
          
          <div className="flex justify-center">
            <CreditCard range={creditCards[4]} />
          </div>
        </div>
      </div>
    </div>
  );
}
