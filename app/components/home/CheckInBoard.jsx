"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { HOME_ASSETS } from "./homeAssets";
import { getMemberInfo, checkIn } from "@/app/api/memberApi";
import { tokenStorage } from "@/app/api/tokenStorage";
import SuccessModal from "@/app/components/ui/SuccessModal";

const POPUP_BG_IMG = "/assets/home/popup-deposit-bg.png";
const POPUP_CLOSE_IMG = "/assets/home/popup-close.png";
const POPUP_DAY7_BG_IMG = "/assets/home/popup-day7-bg.png";
const POPUP_DAY7_CLOSE_IMG = "/assets/home/popup-day7-close.png";

function AssetFill({ src, alt, className }) {
  if (!src) {
    return (
      <div
        className={className}
        style={{
          background: "rgba(0,0,0,0.15)",
          border: "1px solid rgba(233,175,65,0.35)",
        }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes="(max-width: 475px) 100vw, 475px"
    />
  );
}

export default function CheckInBoard() {
  const [checkedDays, setCheckedDays] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isPopupBgLoaded, setIsPopupBgLoaded] = useState({
    default: false,
    day7: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [memberInfo, setMemberInfo] = useState(null);

  useEffect(() => {
    const preload = (src) =>
      new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
      });

    let cancelled = false;

    (async () => {
      if (typeof window === "undefined") return;
      const okDefault = await preload(POPUP_BG_IMG);
      await preload(POPUP_CLOSE_IMG);
      const okDay7 = await preload(POPUP_DAY7_BG_IMG);
      await preload(POPUP_DAY7_CLOSE_IMG);
      if (!cancelled) {
        setIsPopupBgLoaded({ default: Boolean(okDefault), day7: Boolean(okDay7) });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch member info to determine checked days
  useEffect(() => {
    const fetchMemberInfo = async () => {
      try {
        const memberUuid = tokenStorage.getMemberUuid();
        if (!memberUuid) return;

        setIsLoading(true);
        const data = await getMemberInfo(memberUuid);
        setMemberInfo(data);

        // Calculate checked days based on last_check_in_date
        if (data.last_check_in_date) {
          const lastCheckIn = new Date(data.last_check_in_date);
          const today = new Date();
          const diffTime = Math.abs(today - lastCheckIn);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // If checked in today or within the last day, mark days as checked
          // This is a simplified logic - adjust based on actual API behavior
          if (diffDays <= 1) {
            // Calculate which days should be marked as checked
            // For now, we'll mark days sequentially based on check-in streak
            const checked = [];
            for (let i = 1; i <= Math.min(diffDays, 7); i++) {
              checked.push(i);
            }
            setCheckedDays(checked);
          }
        }
      } catch (err) {
        console.error("Failed to fetch member info:", err);
        setError("Failed to load check-in status");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberInfo();
  }, []);

  const days = useMemo(
    () => [
      { day: 1, label: "DAY 1", reward: "+100", x: 20, y: 30, iconSrc: HOME_ASSETS.electricSign },
      { day: 2, label: "DAY 2", reward: "+100", x: 40, y: 30, iconSrc: HOME_ASSETS.electricSign },
      { day: 3, label: "DAY 3", reward: "+100", x: 60, y: 30, iconSrc: HOME_ASSETS.dayCard3 },
      { day: 4, label: "DAY 4", reward: "+100", x: 80, y: 30, iconSrc: HOME_ASSETS.electricSign },
      { day: 5, label: "DAY 5", reward: "+100", x: 20, y: 65, iconSrc: HOME_ASSETS.dayCard5 },
      { day: 6, label: "DAY 6", reward: "+100", x: 40, y: 65, iconSrc: HOME_ASSETS.electricSign },
      { day: 7, label: "DAY 7", reward: "", x: 70, y: 65, isSpecial: true },
    ],
    [],
  );

  const onPressDay = (day) => {
    if (checkedDays.includes(day)) return;
    setCheckedDays((prev) => [...prev, day]);
  };

  const onDayClick = async (day) => {
    // Check if already checked in
    if (checkedDays.includes(day.day)) {
      setSuccessMessage("You have already checked in for this day!");
      setShowSuccessModal(true);
      return;
    }

    try {
      const memberUuid = tokenStorage.getMemberUuid();
      if (!memberUuid) {
        setError("Please log in to check in");
        return;
      }

      setIsLoading(true);
      setError(null);

      // Call check-in API
      const response = await checkIn(memberUuid);
      
      // Mark day as checked
      setCheckedDays((prev) => [...prev, day.day]);
      
      // Display success message with earned tokens
      const tokensEarned = response.tokens_earned || response.reward || 100; // Fallback to 100 if not specified
      setSuccessMessage(`Congratulations! You've checked in for today and earned ${tokensEarned} tokens!`);
      setShowSuccessModal(true);

      // Refresh member info after successful check-in
      const updatedInfo = await getMemberInfo(memberUuid);
      setMemberInfo(updatedInfo);

    } catch (err) {
      console.error("Check-in failed:", err);
      
      // Extract error message from various possible locations
      let errorMessage = "";
      
      if (err.data) {
        errorMessage = err.data.details || err.data.detail || err.data.message || err.data.error || "";
      }
      
      if (!errorMessage && err.message) {
        errorMessage = err.message;
      }
      
      // Check if already checked in error
      if (errorMessage.toLowerCase().includes("already checked in")) {
        setSuccessMessage("Already checked in today! Try again tomorrow.");
        setShowSuccessModal(true);
      } else {
        setError(errorMessage || "Failed to check in. Please try again.");
        setSuccessMessage(errorMessage || "Failed to check in. Please try again.");
        setShowSuccessModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching member info
  if (isLoading) {
    return (
      <section className="relative w-full px-2 sm:px-4">
        <div className="relative w-full mx-auto" style={{ maxWidth: 475, minHeight: 400 }}>
          <div className="flex items-center justify-center h-full">
            <div className="text-[#60803C] text-lg">Loading check-in board...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full px-2 sm:px-4">
      <motion.div
        className="relative w-full mx-auto"
        initial={{ opacity: 0, y: 34, scale: 0.98, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 20,
          delay: 0.08,
        }}
        style={{
          maxWidth: 475,
        }}
      >
        <div className="relative w-full mt-2 sm:mt-4">
          {/* Frame Background */}
          <div
            className="relative w-full"
            style={{
              aspectRatio: "1 / 1",
            }}
          >
            <Image
              src={HOME_ASSETS.checkinBoard}
              alt="Check in frame"
              fill
              className="object-fill"
              sizes="(max-width: 490px) 100vw, 475px"
            />

            {/* Individual Day Cards Positioned on Frame */}
            <div className="absolute inset-0 ">
              {days.map((d) => {
                const isChecked = checkedDays.includes(d.day);

                if (d.isSpecial) {
                  // Day 7 - Special chest
                  return (
                    <motion.button
                      key={d.day}
                      type="button"
                      onClick={() => onDayClick(d)}
                      className={`absolute w-[35%] h-[30%] sm:w-[36%] sm:h-[30%] ${
                        isChecked ? "grayscale opacity-60" : ""
                      }`}
                      style={{
                        left: `${d.x}%`,
                        top: `${d.y}%`,
                        cursor: isChecked ? "default" : "pointer",
                        outline: "none",
                        background: "transparent",
                        x: "-50%",
                        y: "-50%",
                      }}
                      aria-label={`Check in ${d.label}`}
                      initial={{ opacity: 0, scale: 0.3, y: "-150%", x: "-50%" }}
                      animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: (d.day - 1) * 0.15 + 0.4,
                      }}
                      whileHover={
                        isChecked
                          ? undefined
                          : {
                              scale: 1.15,
                              y: "-55%",
                              transition: { type: "spring", stiffness: 400, damping: 10 },
                            }
                      }
                      whileTap={
                        isChecked
                          ? undefined
                          : {
                              scale: 0.95,
                              transition: { duration: 0.1 },
                            }
                      }
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={HOME_ASSETS.dayCard7}
                          alt="Day 7 reward"
                          fill
                          className="object-contain"
                          sizes="120px"
                        />
                      </div>

                      {/* Day 7 Label */}
                      <div
                        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-center text-lg "
                        style={{
                          fontFamily: '"Times New Roman"',
                          color: "#60803C",
                          fontStyle: "normal",
                          fontWeight: 700,
                          lineHeight: "normal",
                        }}
                      >
                        {d.label}
                      </div>
                    </motion.button>
                  );
                }

                // Days 1-6 - Individual cards with frames
                return (
                  <motion.button
                    key={d.day}
                    type="button"
                    onClick={() => onDayClick(d)}
                    className={`absolute w-[31%] h-[31%] ${
                      isChecked ? "grayscale opacity-60" : ""
                    }`}
                    style={{
                      left: `${d.x}%`,
                      top: `${d.y}%`,
                      cursor: isChecked ? "default" : "pointer",
                      outline: "none",
                      background: "transparent",
                      x: "-50%",
                      y: "-54%",
                    }}
                    aria-label={`Check in ${d.label}`}
                    initial={{ opacity: 0, scale: 0.3, y: "-150%", x: "-50%" }}
                    animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: (d.day - 1) * 0.15 + 0.4,
                    }}
                    whileHover={
                      isChecked
                        ? undefined
                        : {
                            scale: 1.1,
                            y: "-55%",
                            transition: { type: "spring", stiffness: 400, damping: 10 },
                          }
                    }
                    whileTap={
                      isChecked
                        ? undefined
                        : {
                            scale: 0.95,
                            transition: { duration: 0.1 },
                          }
                    }
                  >
                    {/* Card Frame */}
                    <div className="relative w-[120px] h-[130px] sm:w-[150px] sm:h-[150px]">
                      <Image
                        src={HOME_ASSETS.dayCard1}
                        alt="Calendar frame"
                        fill
                        className="object-contain"
                        sizes="80px"
                      />

                      {/* Content inside card */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div
                          className="relative w-[30px] h-[30px] sm:w-[40px] sm:h-[40px]"
                        >
                          <Image
                            src={d.iconSrc}
                            alt="Reward"
                            fill
                            className="object-contain"
                            sizes="48px"
                          />
                        </div>
                        <div
                          className="mt-1"
                          style={{
                            fontFamily: '"Times New Roman"',
                            color: "#FAD707",
                            fontSize: "18px",
                            fontStyle: "normal",
                            fontWeight: 700,
                            lineHeight: "normal",
                          }}
                        >
                          {d.reward}
                        </div>
                      </div>

                      {/* Check mark for completed days
                      {isChecked && (
                        <motion.div
                          className="absolute -top-1 -right-1 flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 18,
                          }}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 999,
                            background: "rgba(0, 255, 160, 0.9)",
                            color: "#07190d",
                            fontWeight: 800,
                            fontSize: 10,
                          }}
                        >
                          ✓
                        </motion.div>
                      )} */}
                    </div>

                    {/* Day Label */}
                    <div
                      className="absolute -bottom-7 sm:-bottom-4 left-1/2 transform -translate-x-1/2 text-center text-lg sm:text-xl"
                      style={{
                        fontFamily: '"Times New Roman"',
                        color: "#60803C",
                        fontStyle: "normal",
                        fontWeight: 700,
                        lineHeight: "normal",
                        marginBottom: "10px",
                      }}
                    >
                      {d.label}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {isPopupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setIsPopupOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          {selectedDay?.isSpecial ? (
            <div
              className="relative w-full max-w-[360px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-black/10" />
              <img
                src={POPUP_DAY7_BG_IMG}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                style={{ opacity: isPopupBgLoaded.day7 ? 1 : 0 }}
              />

              <div className="relative px-10 pb-12 pt-10">
                <div className="flex items-end justify-between">
                  <p
                    className="text-[16px] font-bold leading-[1.1] text-center"
                    style={{
                      fontFamily: '"Times New Roman", serif',
                      color: "#60803C",
                    }}
                  >
                    🎉 Daily Check-in Reward
                  </p>

                  <button
                    type="button"
                    className="relative h-[30px] w-[30px]"
                    onClick={() => setIsPopupOpen(false)}
                    aria-label="Close"
                  >
                    <Image
                      src={POPUP_DAY7_CLOSE_IMG}
                      alt=""
                      width={30}
                      height={30}
                      className="h-full w-full object-contain"
                    />
                  </button>
                </div>

                <p
                  className="mt-2 text-[16px] font-bold leading-[1.5] text-center"
                  style={{
                    fontFamily: '"Times New Roman", serif',
                    color: "#60803C",
                  }}
                >
                  Congratulations! You’ve checked in for today and earned +1 “N1 token”!
                </p>

                <p
                  className="mt-3 text-[12px] font-bold leading-[1.5]"
                  style={{
                    fontFamily: '"Times New Roman", serif',
                    color: "rgba(96,128,60,0.6)",
                  }}
                >
                  ⚠️ Completed checked in for 7 days will get extra “N1 token” 1 to 10 randomly!
                </p>

                <button
                  type="button"
                  className="mt-4 w-full rounded-[99px] px-6 py-[6px] shadow-[1px_4px_11px_0px_rgba(0,0,0,0.1)]"
                  style={{
                    backgroundColor: "#E9AF41",
                    boxShadow:
                      "inset -5px -5px 15px rgba(0,0,0,0.4), 1px 4px 11px rgba(0,0,0,0.1)",
                  }}
                >
                  <span
                    className="text-[16px] font-bold leading-[1.5]"
                    style={{
                      fontFamily: '"Times New Roman", serif',
                      color: "#60803C",
                    }}
                  >
                    Claim Your N1 Token
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className="relative w-full max-w-[360px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-black/10" />
              <img
                src={POPUP_BG_IMG}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                style={{ opacity: isPopupBgLoaded.default ? 1 : 0 }}
              />

              <div className="relative flex flex-col gap-6 px-8 pb-12 pt-14">
                <div className="flex items-start justify-between gap-6">
                  <p
                    className="text-[16px] font-bold leading-[1.1]"
                    style={{
                      fontFamily: '"Times New Roman", serif',
                      color: "#60803C",
                    }}
                  >
                    Earn Tokens with Every Deposit!
                  </p>

                  <button
                    type="button"
                    className="relative h-[30px] w-[30px]"
                    onClick={() => setIsPopupOpen(false)}
                    aria-label="Close"
                  >
                    <Image
                      src={POPUP_CLOSE_IMG}
                      alt=""
                      width={30}
                      height={30}
                      className="h-full w-full object-contain"
                    />
                  </button>
                </div>

                <p
                  className="text-[16px] font-bold leading-[1.5]"
                  style={{
                    fontFamily: '"Times New Roman", serif',
                    color: "#60803C",
                  }}
                >
                  Every Deposit RM10 can get 1pc N1 Token !
                </p>

                <p
                  className="text-[16px] font-bold leading-[1.5]"
                  style={{
                    fontFamily: '"Times New Roman", serif',
                    color: "#60803C",
                  }}
                >
                  {selectedDay?.label}{selectedDay?.reward ? ` · ${selectedDay.reward}` : ""}
                </p>

                <button
                  type="button"
                  className="relative w-full rounded-[99px] px-6 py-[6px] shadow-[1px_4px_11px_0px_rgba(0,0,0,0.1)]"
                  style={{
                    backgroundColor: "#E9AF41",
                    boxShadow:
                      "inset -5px -5px 15px rgba(0,0,0,0.4), 1px 4px 11px rgba(0,0,0,0.1)",
                  }}
                >
                  <span
                    className="text-[16px] font-bold leading-[1.2]"
                    style={{
                      fontFamily: '"Times New Roman", serif',
                      color: "#60803C",
                    }}
                  >
                    Deposit Now
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success Modal for Check-in Results */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="🎉 Daily Check-in"
        message={successMessage || "Check-in successful!"}
        backgroundColor="rgba(96, 128, 60, 1)"
      />
    </section>
  );
}
