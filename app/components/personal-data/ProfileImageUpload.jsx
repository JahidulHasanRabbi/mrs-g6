"use client";

import { FORM_COLORS } from "./constants";
import { PencilIcon } from "./FormIcons";
import ProfileFrame from "../profile/ProfileFrame";

export default function ProfileImageUpload({
  imageSrc,
  onEditClick,
  frameId,
}) {
  return (
    <div className="relative w-[160px] h-[160px]">
      <ProfileFrame
        src={imageSrc}
        frameId={frameId}
        size={160}
        alt="Profile"
      />

      {/* Edit Button (uploads a new photo) */}
      <button
        type="button"
        onClick={onEditClick}
        className="absolute bottom-0 right-0 w-[38px] h-[38px] rounded-[12.727px] flex items-center justify-center shadow-lg z-10"
        style={{ backgroundColor: FORM_COLORS.primary }}
        aria-label="Edit profile picture"
      >
        <PencilIcon />
      </button>
    </div>
  );
}
