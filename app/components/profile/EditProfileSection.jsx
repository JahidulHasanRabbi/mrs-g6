"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PROFILE_ASSETS } from "./profileAssets";
import FluidFrame from "../ui/FluidFrame";

const Row = ({ index, label, onClick, top, complete }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="absolute left-[45px] right-[49px] h-[22px]"
      style={{ top }}
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.15 + index * 0.07, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <span className="absolute left-[22px] top-1/2 -translate-y-1/2 text-[#60803c] text-[12px] font-bold font-['Times_New_Roman']">
        {label}
      </span>

      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[18px] h-[18px]">
        <Image alt="" src={PROFILE_ASSETS.numberBadge} fill className="object-cover" />
        <span className="absolute inset-0 flex items-center justify-center text-[#fde685] text-[8px] font-medium font-['Poppins']">
          {index + 1}
        </span>
      </span>

      {complete && (
        <span
          aria-label={`${label} completed`}
          className="absolute right-[22px] top-1/2 -translate-y-1/2 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#3a8a2a] shadow-[0_0_4px_rgba(58,138,42,0.6)]"
        >
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2.5 6.2 L4.9 8.6 L9.5 3.6"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[16px] h-[18px]">
        <Image alt="" src={PROFILE_ASSETS.editIcon} fill className="object-cover" />
      </span>
    </motion.button>
  );
};

export default function EditProfileSection({
  onDisplayPhoto,
  onGender,
  onBirthday,
  onPhone,
  onEmail,
  onInterest,
  completion = {},
}) {
  const rows = [
    { label: "Display Photo", onClick: onDisplayPhoto, top: 52,  complete: !!completion.displayPhoto },
    { label: "Gender",        onClick: onGender,       top: 84,  complete: !!completion.gender },
    { label: "Birthday",      onClick: onBirthday,     top: 114, complete: !!completion.birthday },
    { label: "Phone",         onClick: onPhone,        top: 147, complete: !!completion.phone },
    { label: "Email",         onClick: onEmail,        top: 179, complete: !!completion.email },
    { label: "Interest",      onClick: onInterest,     top: 211, complete: !!completion.interest },
  ];

  return (
    <motion.div
      className="mx-auto w-full"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
    >
      <FluidFrame designWidth={403} designHeight={295}>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 origin-top w-[366px] h-[268px] scale-[1.1]">
        <Image alt="" src={PROFILE_ASSETS.editProfileBg} fill className="object-cover" />

        <motion.p
          className="absolute left-[45px] top-[35px] -translate-y-1/2 text-[#60803c] text-[16px] font-bold font-['Times_New_Roman']"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
        >
          Edit Profiles
        </motion.p>

        {rows.map((r, i) => (
          <Row
            key={r.label}
            index={i}
            label={r.label}
            onClick={r.onClick}
            top={r.top}
            complete={r.complete}
          />
        ))}
      </div>
      </FluidFrame>
    </motion.div>
  );
}
