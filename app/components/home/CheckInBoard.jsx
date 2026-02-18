"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { HOME_ASSETS } from "./homeAssets";

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
  const [checkedDays, setCheckedDays] = useState([1, 2]);

  const days = useMemo(
    () => [
      { day: 1, label: "DAY 1", reward: "+100", x: 20, y: 30 },
      { day: 2, label: "DAY 2", reward: "+100", x: 40, y: 30 },
      { day: 3, label: "DAY 3", reward: "+100", x: 60, y: 30 },
      { day: 4, label: "DAY 4", reward: "+100", x: 80, y: 30 },
      { day: 5, label: "DAY 5", reward: "+100", x: 20, y: 65 },
      { day: 6, label: "DAY 6", reward: "+100", x: 40, y: 65 },
      { day: 7, label: "DAY 7", reward: "", x: 70, y: 65, isSpecial: true },
    ],
    [],
  );

  const onPressDay = (day) => {
    if (checkedDays.includes(day)) return;
    setCheckedDays((prev) => [...prev, day]);
  };

  return (
    <section className="relative w-full px-4">
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
        <div className="relative w-full mt-4">
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
              className="object-contain"
              sizes="(max-width: 475px) 100vw, 475px"
            />

            {/* Individual Day Cards Positioned on Frame */}
            <div className="absolute inset-0">
              {days.map((d) => {
                const isChecked = checkedDays.includes(d.day);

                if (d.isSpecial) {
                  // Day 7 - Special chest
                  return (
                    <motion.button
                      key={d.day}
                      type="button"
                      onClick={() => onPressDay(d.day)}
                      className="absolute"
                      style={{
                        left: `${d.x}%`,
                        top: `${d.y}%`,
                        width: "36%",
                        height: "30%",
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
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-center"
                        style={{
                          fontFamily: '"Times New Roman"',
                          color: "#60803C",
                          fontSize: "20px",
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
                    onClick={() => onPressDay(d.day)}
                    className="absolute"
                    style={{
                      left: `${d.x}%`,
                      top: `${d.y}%`,
                      width: "31%",
                      height: "32%",
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
                    <div className="relative w-[150px] h-[150px]">
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
                          className="relative"
                          style={{ width: 40, height: 40 }}
                        >
                          <Image
                            src={HOME_ASSETS.electricSign}
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
                      className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-center"
                      style={{
                        fontFamily: '"Times New Roman"',
                        color: "#60803C",
                        fontSize: "20px",
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
    </section>
  );
}
