"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ProgressBar from "./StepIndicator";
import { FORM_FIELDS } from "./constants";
import DateInputDMY from "./DateInputDMY";
import { GlassCard, GoldText, PageTitle } from "../themes/kingrewards/KrUi";
import { KrMemberAvatar, KrOutlineButton, KrPlaqueButton, useKrPickedFrameId } from "../themes/kingrewards/KingRewardsProfileParts";
import KingRewardsDialog from "../themes/kingrewards/KingRewardsDialog";
import KingRewardsButton from "../themes/kingrewards/KingRewardsButton";
import { KR_ASSETS, KR_COLORS, KR_FONT, KR_SURFACES } from "../themes/kingrewards/assets";

// 16px keeps iOS Safari from zooming the page when a field takes focus.
const INPUT_CLASS =
  "w-full min-h-[36px] rounded-[6px] bg-[#091f46] py-2 pl-2 text-[16px] leading-[1.2] text-[#f2f2f2] outline-none placeholder:text-[#dbdbdb]/50 focus:shadow-[0_0_0_2px_rgba(255,240,102,0.35)]";
const INPUT_STYLE = { fontFamily: KR_FONT, border: `1.5px solid ${KR_COLORS.goldBright}`, colorScheme: "dark" };
// Clears the fixed 64px header and ~80px bottom nav when a field is scrolled to.
const FIELD_SCROLL_MARGIN = { scrollMarginTop: 80, scrollMarginBottom: 120 };

function TrailingIcon({ src, onClick }) {
  return (
    <img
      src={src}
      alt=""
      onClick={onClick}
      className={`absolute right-2 top-1/2 size-4 -translate-y-1/2 ${onClick ? "cursor-pointer" : "pointer-events-none"}`}
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
    // The browser's own date box follows its locale, so DateInputDMY shows dd/mm/yyyy itself.
    control = (
      <div className="relative">
        <DateInputDMY
          id={id}
          value={value}
          onChange={(v) => onChange(id, v)}
          className={`${INPUT_CLASS} cursor-pointer pr-7`}
          style={INPUT_STYLE}
        />
        <TrailingIcon src={KR_ASSETS.profile.iconCalendar} />
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
    <div data-kr-field className="flex flex-col gap-2 rounded-[8px] p-2" style={{ ...KR_SURFACES.inner, ...FIELD_SCROLL_MARGIN }}>
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

/**
 * Keeps the focused field (and the Save row under it) in view while the
 * mobile keyboard opens, instead of leaving it under the keyboard or the nav.
 */
function useKeepFocusedFieldVisible(formRef) {
  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return undefined;
    let lastHeight = vv.height;
    const onResize = () => {
      // Only a keyboard opening (a big shrink), not the URL bar sliding away.
      const opened = vv.height < lastHeight - 120;
      lastHeight = vv.height;
      const el = document.activeElement;
      if (opened && el && formRef.current?.contains(el)) revealField(el);
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, [formRef]);
}

function revealField(el) {
  const target = el.closest("[data-kr-field]") || el;
  target.scrollIntoView({ block: "center", behavior: "smooth" });
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
  saved,
  onSavedClose,
}) {
  const formRef = useRef(null);
  useKeepFocusedFieldVisible(formRef);
  // Until a frame is picked the avatar wears the KR ring, so the cell says Default.
  const pickedFrameId = useKrPickedFrameId();

  const onFieldFocus = (e) => {
    // Only typing fields raise the keyboard; select/date open native pickers.
    const typing = e.target.tagName === "TEXTAREA" || (e.target.tagName === "INPUT" && e.target.type !== "date");
    if (!typing) return;
    const el = e.target;
    // The keyboard takes ~300ms to open; reveal once the viewport has shrunk.
    setTimeout(() => revealField(el), 320);
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <PageTitle>Edit Profile</PageTitle>

      <motion.div
        className="w-full max-w-[380px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <GlassCard className="flex w-full flex-col gap-6 px-2 py-4">
          <div className="flex items-center gap-2">
            <KrMemberAvatar src={profileImage} name={name} size={74} />
            <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
              <p className="max-w-full truncate text-[16px] font-medium leading-[1.2]" style={{ fontFamily: KR_FONT, color: KR_COLORS.goldText }}>
                {name || "—"}
              </p>
              <KrOutlineButton style={{ padding: "10px 16px" }} onClick={onProfileEdit}>
                <img src={KR_ASSETS.profile.iconEdit} alt="" className="size-4" />
                Profile Image
              </KrOutlineButton>
            </div>
          </div>

          <ProgressBar progress={progress} />

          <div className="flex gap-2">
            <PickerCell icon={KR_ASSETS.profile.iconFrame} label="Frame" value={pickedFrameId ? frameName : ""} onClick={onOpenFrame} />
            <PickerCell icon={KR_ASSETS.profile.iconTheme} label="Theme" value={themeName} onClick={onOpenTheme} />
          </div>

          <form
            ref={formRef}
            noValidate
            onFocus={onFieldFocus}
            onSubmit={(e) => {
              e.preventDefault();
              if (!isSubmitting) onSubmit();
            }}
            className="flex flex-col gap-4"
          >
            {FORM_FIELDS.map((field) => (
              <KrField key={field.id} {...field} value={formData[field.id]} onChange={onChange} />
            ))}

            {error && (
              <p
                role="alert"
                className="rounded-[8px] px-3 py-2 text-center text-[12px] leading-[1.3] text-white"
                style={{ fontFamily: KR_FONT, background: "rgba(217,6,20,0.25)", border: "1px solid rgba(255,120,120,0.6)" }}
              >
                {error}
                <span className="mt-1 block text-[11px] opacity-80">Your entries are kept. Please try saving again.</span>
              </p>
            )}

            <div className="flex items-stretch justify-between gap-3" style={FIELD_SCROLL_MARGIN}>
              <KrOutlineButton style={{ paddingInline: 28 }} onClick={onBack} disabled={isSubmitting}>
                Back
              </KrOutlineButton>
              <KrPlaqueButton type="submit" className="min-w-[132px]" style={{ padding: "10px 32px", fontSize: 14 }} disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save"}
              </KrPlaqueButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>

      <KingRewardsDialog open={!!saved} onClose={onSavedClose}>
        <div className="flex w-full flex-col items-center gap-3 px-4 text-center" style={{ fontFamily: KR_FONT }}>
          <GoldText as="h2" className="block text-[22px] font-bold uppercase">
            Profile Saved
          </GoldText>
          <p className="text-[14px] leading-[1.4] text-white">
            {saved?.earned
              ? "Thanks for completing your profile. 10 free KR Coins have been added."
              : "Your profile changes have been saved."}
          </p>
        </div>
        <KingRewardsButton variant="gold" className="mx-4 w-[calc(100%-32px)]" onClick={onSavedClose}>
          OK
        </KingRewardsButton>
      </KingRewardsDialog>
    </div>
  );
}
