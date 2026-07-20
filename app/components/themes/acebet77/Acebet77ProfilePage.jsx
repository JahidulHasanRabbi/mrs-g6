"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import HistorySection from "../../profile/HistorySection";
import { ACEBET_ASSETS, ACEBET_COLORS } from "./assets";
import { useUser } from "../../../contexts/UserContext";

const EDIT_ROWS = [
  { key: "displayPhoto", label: "Display Photo" },
  { key: "gender", label: "Gender" },
  { key: "birthday", label: "Birthday" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "interest", label: "Interest" },
];

/**
 * Acebet77 Profile (Figma 285:309). Stacked over the themed shell background:
 *
 *   • VIP card — crown-topped ornate frame with avatar + name + total token +
 *     "VIP Details >" link + level progress bar (driven by UserContext).
 *   • Shared <HistorySection> — the same Token History / Reward History
 *     buttons + modals the default portal ships. Data + functionality are
 *     unchanged; only the surrounding chrome is themed.
 *   • Edit Profiles scroll — scroll frame with six numbered rows; each row
 *     navigates to /personal-data (mirrors the default ProfilePage).
 */
export default function Acebet77ProfilePage() {
  const router = useRouter();
  const { userData, profilePicture } = useUser();

  const name = userData?.name || "";
  const balance = userData?.balance ?? "0.00";
  const currentLevel = userData?.currentLevel || "Gold";
  const nextLevel = userData?.nextLevel || "Platinum";
  const progress = Number.isFinite(userData?.progress) ? userData.progress : 0;
  const tokensNeeded = userData?.tokensNeeded ?? 0;

  const goPersonalData = () => router.push("/personal-data");
  const goVip = () => router.push("/vip");

  // AppLayout wraps content-only routes (profile/vip/mart/personal-data) in
  // ThemedPageShell -> AcebetShell already, so we render only the content and
  // don't stack a second shell (which would duplicate header + bottom nav).
  return (
    <>
      <div className="flex flex-col items-center gap-5 px-4">
        {/* "My Profile" title plaque */}
        <motion.img
          src={ACEBET_ASSETS.profile.title}
          alt="My Profile"
          draggable={false}
          className="mt-2 h-auto w-[340px] max-w-[92%] select-none object-contain"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        />

        {/* VIP progress card (crown frame). Aspect keeps the crown/dividers
            in proportion; the interior copy is positioned by %. */}
        <motion.div
          className="relative w-full max-w-[360px]"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.08 }}
        >
          <div className="relative aspect-[1448/1086] w-full">
            <img
              src={ACEBET_ASSETS.frames.crown}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-fill"
            />
            <div className="absolute inset-x-[13%] top-[25%] bottom-[13%] flex flex-col justify-between">
              {/* Top row: avatar + name + token + VIP Details */}
              <div className="flex items-start gap-3">
                <div className="h-[50px] w-[50px] shrink-0 overflow-hidden rounded-full ring-2 ring-[#e9af41] bg-[rgba(0,0,0,0.3)]">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-[20px]"
                      style={{ color: ACEBET_COLORS.gold, fontFamily: "var(--font-acme), serif" }}
                    >
                      {(name?.[0] ?? "?").toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[16px] leading-tight"
                    style={{ color: ACEBET_COLORS.gold, fontFamily: "var(--font-acme), 'Times New Roman', serif" }}
                    title={name}
                  >
                    {name || "—"}
                  </p>
                  <p
                    className="mt-1 text-[10px] leading-tight"
                    style={{ color: ACEBET_COLORS.gold, fontFamily: "var(--font-rubik), sans-serif" }}
                  >
                    Total Token: {balance}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goVip}
                  className="shrink-0 cursor-pointer text-[10px] leading-none whitespace-nowrap self-start"
                  style={{ color: ACEBET_COLORS.gold, fontFamily: "var(--font-acme), 'Times New Roman', serif" }}
                >
                  VIP Details &nbsp;<span className="text-[12px]">&gt;</span>
                </button>
              </div>

              {/* Level + progress bar */}
              <div className="mt-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[16px] leading-none"
                    style={{
                      color: ACEBET_COLORS.gold,
                      fontFamily: "var(--font-acme), 'Times New Roman', serif",
                      textShadow: "0 0 12px rgba(242,186,51,0.6), 0 0 4px rgba(242,186,51,0.35)",
                    }}
                  >
                    {currentLevel}
                  </span>
                  <img src={ACEBET_ASSETS.profile.iconStar} alt="" className="h-4 w-4" draggable={false} />
                </div>
                <p
                  className="text-[10.5px] leading-tight"
                  style={{ color: ACEBET_COLORS.gold, fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  Get {Number(tokensNeeded).toLocaleString("en-US")} more to go {nextLevel}
                </p>
                <div
                  className="relative h-2 w-full overflow-hidden rounded-full border border-[#e9af41] bg-[#51340c]"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                >
                  <div
                    className="h-full rounded-full bg-[#e9af41]"
                    style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                  />
                </div>
                <div
                  className="flex items-center justify-between text-[10px]"
                  style={{ color: ACEBET_COLORS.gold, fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  <span>{currentLevel}</span>
                  <span>{nextLevel}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shared Token History / Reward History section — same component and
            same modals as the default profile page. Only the surrounding page
            chrome (title plaque + VIP card + edit scroll) is themed. */}
        <div className="w-full max-w-[360px]">
          <HistorySection />
        </div>

        {/* Edit Profiles scroll — the scroll frame stretches to fit however
            many rows we show. Content is in normal flow (padded to clear the
            rolled top/bottom of the art); the frame image is absolutely
            positioned behind it with `object-fill` so it grows with the box. */}
        <motion.div
          className="relative w-full max-w-[360px]"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.14 }}
        >
          <img
            src={ACEBET_ASSETS.frames.scroll}
            alt=""
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
          />
          {/* Padding: ~16% top/bottom clears the rolled scroll ornaments;
              ~14% sides clears the gold rails. */}
          <div className="relative flex flex-col px-[15%] pt-[16%] pb-[15%]">
              <p
                className="mb-2 text-center text-[15px]"
                style={{ color: ACEBET_COLORS.gold, fontFamily: "var(--font-acme), 'Times New Roman', serif" }}
              >
                Edit Profiles
              </p>
              <ul className="flex flex-col gap-2">
                {EDIT_ROWS.map((row, i) => (
                  <li key={row.key}>
                    <button
                      type="button"
                      onClick={goPersonalData}
                      className="flex w-full cursor-pointer items-center justify-between rounded-md py-1 transition-colors active:bg-[rgba(233,175,65,0.08)]"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {/* Numbered badge — small ornate circle with digit centred. */}
                        <span className="relative flex h-[22px] w-[22px] shrink-0 items-center justify-center">
                          <img
                            src={ACEBET_ASSETS.profile.badgeNum}
                            alt=""
                            className="absolute inset-0 h-full w-full select-none object-contain"
                            draggable={false}
                          />
                          <span
                            className="relative z-10 text-[9px] leading-none"
                            style={{ color: "#fde685", fontFamily: "var(--font-rubik), sans-serif" }}
                          >
                            {i + 1}
                          </span>
                        </span>
                        <span
                          className="text-[13px] leading-none"
                          style={{ color: ACEBET_COLORS.gold, fontFamily: "var(--font-acme), 'Times New Roman', serif" }}
                        >
                          {row.label}
                        </span>
                      </span>
                      <img
                        src={ACEBET_ASSETS.profile.iconChevron}
                        alt=""
                        className="h-4 w-4 shrink-0"
                        draggable={false}
                      />
                    </button>
                  </li>
                ))}
              </ul>
          </div>
        </motion.div>
      </div>
    </>
  );
}
