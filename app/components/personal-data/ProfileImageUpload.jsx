"use client";

import Image from "next/image";
import { FORM_COLORS } from "./constants";
import { PencilIcon } from "./FormIcons";

export default function ProfileImageUpload({ imageSrc, onEditClick }) {
  return (
    <div className="relative w-[140px] h-[140px]">
      {/* Profile Image */}
      <div
        className="w-full h-full rounded-full overflow-hidden border-4"
        style={{ borderColor: FORM_COLORS.primary }}
      >
        <Image
          src={imageSrc}
          alt="Profile"
          width={140}
          height={140}
          className="object-cover"
        />
      </div>

      {/* Edit Button */}
      <button
        onClick={onEditClick}
        className="absolute bottom-0 right-0 w-[38px] h-[38px] rounded-[12.727px] flex items-center justify-center shadow-lg"
        style={{ backgroundColor: FORM_COLORS.primary }}
        aria-label="Edit profile picture"
      >
        <PencilIcon />
      </button>
    </div>
  );
}
