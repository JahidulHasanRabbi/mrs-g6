"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import HistorySection from "../../profile/HistorySection";
import { UBET_ASSETS, UBET_COLORS } from "./assets";
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
 * Ubetclub Profile (Figma 77:2702). Same shape as the acebet77 profile:
 * themed VIP card (crown ornate frame) + shared HistorySection + themed
 * Edit Profiles scroll. Only visuals differ — no data or logic changes.
 * AppLayout wraps content-only routes in ThemedPageShell -> UbetclubShell
 * already, so we render just the content.
 */
export default function UbetclubProfilePage() {
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

  return (
    <>
      <div className="flex flex-col items-center gap-5 px-4">
        <motion.img
          src={UBET_ASSETS.profile.title}
          alt="My Profile"
          draggable={false}
          className="mt-2 h-auto w-[340px] max-w-[92%] select-none object-contain"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        />

        {/* VIP progress card — crown ornate frame */}
        <motion.div
          className="relative w-full max-w-[360px]"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.08 }}
        >
          <div className="relative aspect-[1448/1086] w-full">
            <img
              src={UBET_ASSETS.frames.crown}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-fill"
            />
            {/* The ubetclub crown frame has larger corner ornaments and a
                slightly thicker jewel divider at the bottom than the acebet77
                counterpart — pull the content well further inward horizontally
                and lift the bottom a bit so the "VIP Details" link and the
                "sad" (level label) don't run under the gold rails. */}
            <div className="absolute inset-x-[16%] top-[24%] bottom-[16%] flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <div className="h-[50px] w-[50px] shrink-0 overflow-hidden rounded-full ring-2 ring-[#f2c36b] bg-[rgba(0,0,0,0.3)]">
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
                      style={{ color: UBET_COLORS.goldBright, fontFamily: "var(--font-acme), serif" }}
                    >
                      {(name?.[0] ?? "?").toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[16px] leading-tight"
                    style={{ color: UBET_COLORS.goldBright, fontFamily: "var(--font-acme), 'Times New Roman', serif" }}
                    title={name}
                  >
                    {name || "—"}
                  </p>
                  <p
                    className="mt-1 text-[10px] leading-tight"
                    style={{ color: UBET_COLORS.goldBright, fontFamily: "var(--font-rubik), sans-serif" }}
                  >
                    Total Token: {balance}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goVip}
                  className="shrink-0 cursor-pointer text-[10px] leading-none whitespace-nowrap self-start"
                  style={{ color: UBET_COLORS.goldBright, fontFamily: "var(--font-acme), 'Times New Roman', serif" }}
                >
                  VIP Details &nbsp;<span className="text-[12px]">&gt;</span>
                </button>
              </div>

              <div className="mt-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[16px] leading-none"
                    style={{
                      color: UBET_COLORS.goldBright,
                      fontFamily: "var(--font-acme), 'Times New Roman', serif",
                      textShadow: "0 0 12px rgba(242,195,107,0.6), 0 0 4px rgba(242,195,107,0.35)",
                    }}
                  >
                    {currentLevel}
                  </span>
                  <img src={UBET_ASSETS.profile.iconStar} alt="" className="h-4 w-4" draggable={false} />
                </div>
                <p
                  className="text-[10.5px] leading-tight"
                  style={{ color: UBET_COLORS.goldBright, fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  Get {Number(tokensNeeded).toLocaleString("en-US")} more to go {nextLevel}
                </p>
                <div
                  className="relative h-2 w-full overflow-hidden rounded-full border border-[#f2c36b] bg-[#3d0d10]"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                >
                  <div
                    className="h-full rounded-full bg-[#f2c36b]"
                    style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                  />
                </div>
                <div
                  className="flex items-center justify-between text-[10px]"
                  style={{ color: UBET_COLORS.goldBright, fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  <span>{currentLevel}</span>
                  <span>{nextLevel}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shared Token/Reward History — same component the default profile
            uses; only the buttons + modal frame skin per theme. */}
        <div className="w-full max-w-[360px]">
          <HistorySection />
        </div>

        {/* Edit Profiles scroll */}
        <motion.div
          className="relative w-full max-w-[360px]"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.14 }}
        >
          <img
            src={UBET_ASSETS.frames.scroll}
            alt=""
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
          />
          {/* The ubetclub scroll frame's rolled bottom takes more vertical
              space than acebet77's; deeper pb keeps the last row (Interest)
              from riding under the rolled ornament. */}
          <div className="relative flex flex-col px-[16%] pt-[18%] pb-[20%]">
            <p
              className="mb-2 text-center text-[15px]"
              style={{ color: UBET_COLORS.goldBright, fontFamily: "var(--font-acme), 'Times New Roman', serif" }}
            >
              Edit Profiles
            </p>
            <ul className="flex flex-col gap-2">
              {EDIT_ROWS.map((row, i) => (
                <li key={row.key}>
                  <button
                    type="button"
                    onClick={goPersonalData}
                    className="flex w-full cursor-pointer items-center justify-between rounded-md py-1 transition-colors active:bg-[rgba(242,195,107,0.08)]"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="relative flex h-[22px] w-[22px] shrink-0 items-center justify-center">
                        <img
                          src={UBET_ASSETS.profile.badgeNum}
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
                        style={{ color: UBET_COLORS.goldBright, fontFamily: "var(--font-acme), 'Times New Roman', serif" }}
                      >
                        {row.label}
                      </span>
                    </span>
                    {/* Text chevron — same visual weight as the acebet77
                        chevron image, without needing a separate asset. */}
                    <span
                      className="text-[14px] leading-none"
                      style={{ color: UBET_COLORS.goldBright, fontFamily: "var(--font-acme), serif" }}
                    >
                      ›
                    </span>
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
