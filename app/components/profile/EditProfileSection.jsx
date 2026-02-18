"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PROFILE_ASSETS } from "./profileAssets";

const Row = ({ index, label, onClick, top }) => {
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
}) {
  const rows = [
    { label: "Display Photo", onClick: onDisplayPhoto, top: 52 },
    { label: "Gender", onClick: onGender, top: 84 },
    { label: "Birthday", onClick: onBirthday, top: 114 },
    { label: "Phone", onClick: onPhone, top: 147 },
    { label: "Email", onClick: onEmail, top: 179 },
    { label: "Interest", onClick: onInterest, top: 211 },
  ];

  return (
    <motion.div
      className="relative mx-auto w-[359px] h-[268px] min-[465px]:w-[395px] min-[465px]:h-[295px]"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
    >
      <div className="absolute left-1/2 top-0 -translate-x-1/2 origin-top w-[359px] h-[268px] scale-[1] min-[465px]:scale-[1.1]">
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
          <Row key={r.label} index={i} label={r.label} onClick={r.onClick} top={r.top} />
        ))}
      </div>
    </motion.div>
  );
}
