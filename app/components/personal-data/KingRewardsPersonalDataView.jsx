"use client";

import { motion } from "framer-motion";
import ProgressBar from "./StepIndicator";
import { FORM_FIELDS } from "./constants";
import { GlassCard, CardTitle } from "../themes/kingrewards/KrUi";
import { KrAvatar, KrOutlineButton, KrPlaqueButton } from "../themes/kingrewards/KingRewardsProfileParts";
import { KR_ASSETS, KR_COLORS, KR_FONT, KR_SURFACES } from "../themes/kingrewards/assets";

const INPUT_CLASS =
  "w-full min-h-[31px] rounded-[6px] bg-[#091f46] py-2 pl-2 text-[12px] leading-[1.2] text-[#dbdbdb] outline-none placeholder:text-[#dbdbdb]/50 focus:shadow-[0_0_0_2px_rgba(255,240,102,0.35)]";
const INPUT_STYLE = { fontFamily: KR_FONT, border: `1.5px solid ${KR_COLORS.goldBright}`, colorScheme: "dark" };

function TrailingIcon({ src, onClick }) {
  return (
    <img
      src={src}
      alt=""
      onClick={onClick}
      className={`absolute right-2 top-1/2 size-3 -translate-y-1/2 ${onClick ? "cursor-pointer" : "pointer-events-none"}`}
    />
  );
}

function KrField({ id, label, type, value, onChange, placeholder, options = [] }) {
  let control;
  if (type === "select") {
    control = (
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className={`${INPUT_CLASS} cursor-pointer appearance-none pr-7`}
          style={INPUT_STYLE}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#091f46]">
              {o.label}
            </option>
          ))}
        </select>
        <TrailingIcon src={KR_ASSETS.profile.iconCaretDown} />
      </div>
    );
  } else if (type === "date") {
    // en-GB makes Chromium render the native value as dd/mm/yyyy.
    control = (
      <div className="relative">
        <input
          id={id}
          type="date"
          lang="en-GB"
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          onClick={(e) => e.currentTarget.showPicker?.()}
          className={`${INPUT_CLASS} cursor-pointer pr-7 [&::-webkit-calendar-picker-indicator]:opacity-0`}
          style={INPUT_STYLE}
        />
        <TrailingIcon src={KR_ASSETS.profile.iconCalendar} onClick={() => document.getElementById(id)?.showPicker?.()} />
      </div>
    );
  } else {
    control = (
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        placeholder={placeholder}
        className={`${INPUT_CLASS} pr-2`}
        style={INPUT_STYLE}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-[8px] p-2" style={KR_SURFACES.inner}>
      <label htmlFor={id} className="text-[12px] font-semibold leading-[1.2]" style={{ fontFamily: KR_FONT, color: KR_COLORS.gold }}>
        {label}
      </label>
      {control}
    </div>
  );
}

function PickerCell({ icon, label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-1 rounded-[8px] bg-[rgba(255,255,255,0.15)] px-2 py-1 transition-transform active:scale-[0.98]"
    >
      <span className="flex shrink-0 items-center gap-2">
        <img src={icon} alt="" className="size-6 shrink-0" />
        <span className="text-[12px] font-semibold leading-[1.2]" style={{ fontFamily: KR_FONT, color: KR_COLORS.gold }}>
          {label}
        </span>
      </span>
      <span
        className="w-[65px] min-w-0 shrink truncate rounded-[6px] bg-[#091f46] p-2 text-left text-[10px] leading-[1.1]"
        style={{ fontFamily: KR_FONT, color: KR_COLORS.creamMuted, border: `1.5px solid ${KR_COLORS.goldBright}` }}
        title={value}
      >
        {value || "Default"}
      </span>
    </button>
  );
}

/** King Rewards Edit Profile card (Figma 664:2088). State and handlers stay in PersonalDataForm. */
export default function KingRewardsPersonalDataView({
  name,
  formData,
  onChange,
  profileImage,
  onProfileEdit,
  progress,
  frameName,
  themeName,
  onOpenFrame,
  onOpenTheme,
  error,
  isSubmitting,
  onSubmit,
  onBack,
}) {
  return (
    <motion.div
      className="w-full max-w-[380px]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <GlassCard className="flex w-full flex-col gap-6 px-2 py-4">
        <div className="flex flex-col gap-2">
          <div className="pb-2">
            <CardTitle>Edit Profile</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <KrAvatar src={profileImage} name={name} size={74} />
            <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
              <p className="max-w-full truncate text-[16px] font-medium leading-[1.2]" style={{ fontFamily: KR_FONT, color: KR_COLORS.goldText }}>
                {name || "—"}
              </p>
              <KrOutlineButton style={{ padding: "12px 16px" }} onClick={onProfileEdit}>
                <img src={KR_ASSETS.profile.iconEdit} alt="" className="size-4" />
                Profile Image
              </KrOutlineButton>
            </div>
          </div>
        </div>

        <ProgressBar progress={progress} />

        <div className="flex gap-2">
          <PickerCell icon={KR_ASSETS.profile.iconFrame} label="Frame" value={frameName} onClick={onOpenFrame} />
          <PickerCell icon={KR_ASSETS.profile.iconTheme} label="Theme" value={themeName} onClick={onOpenTheme} />
        </div>

        <div className="flex flex-col gap-4">
          {FORM_FIELDS.map((field) => (
            <KrField key={field.id} {...field} value={formData[field.id]} onChange={onChange} />
          ))}

          {error && <p className="text-center text-[12px] text-red-400">{error}</p>}

          <div className="flex items-stretch justify-between">
            <KrOutlineButton style={{ paddingInline: 32 }} onClick={onBack}>
              Back
            </KrOutlineButton>
            <KrPlaqueButton style={{ padding: "8px 32px" }} onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </KrPlaqueButton>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
