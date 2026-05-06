"use client";

import Image from "next/image";
import { motion } from "framer-motion";

// TODO (Backend): Replace with real API data
// Token History fields: created_at, category, details, amount
const MOCK_TOKEN_HISTORY = [
  { created_at: "29.04.2026 8:00 AM", category: "Category A", details: "Here are the details.....", amount: "RM 2,000" },
];

// Reward History fields: created_at, category, details, reward_name
const MOCK_REWARD_HISTORY = [
  { created_at: "29.04.2026 8:00 AM", category: "Category A", details: "Here are the details.....", reward_name: "Reward A" },
];

function HistoryCard({ title, items, renderItem, delay = 0 }) {
  return (
    <motion.div
      className="relative"
      style={{ width: 177, height: 122 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
    >
      {/* Gold border card */}
      <div
        className="absolute inset-0 rounded-[10px]"
        style={{ border: "1px solid #e9af41" }}
      />

      {/* Title banner image — centered, overlaps top border */}
      <div
        className="absolute top-0 flex items-center justify-center"
        style={{ width: 146, height: 41, left: "50%", transform: "translateX(-50%)" }}
      >
        <Image
          src="/assets/profile/history-title-banner.png"
          alt={title}
          fill
          className="object-cover"
        />
        <span
          className="relative z-10 font-['Times_New_Roman'] font-bold text-[14px] whitespace-nowrap"
          style={{ color: "#60803c" }}
        >
          {title}
        </span>
      </div>

      {/* List content — sits below banner */}
      <div className="absolute left-[8px] right-[4px] top-[44px] bottom-[6px] overflow-y-auto">
        {items.length === 0 ? (
          <p
            className="font-['Times_New_Roman'] text-center mt-2"
            style={{ color: "#e9af41", fontSize: 10, opacity: 0.6 }}
          >
            No records
          </p>
        ) : (
          items.map((item, idx) => (
            <ul
              key={idx}
              className="list-disc"
              style={{ paddingLeft: "16.5px", marginBottom: idx < items.length - 1 ? 4 : 0 }}
            >
              {renderItem(item).map((line, i) => (
                <li
                  key={i}
                  className="font-['Times_New_Roman'] not-italic leading-normal"
                  style={{ color: "#e9af41", fontSize: 11, marginBottom: 0 }}
                >
                  {line}
                </li>
              ))}
            </ul>
          ))
        )}
      </div>
    </motion.div>
  );
}

export default function HistorySection() {
  const tokenRender = (item) => [
    `Date/time: ${item.created_at}`,
    `Category: ${item.category}`,
    `Token details: ${item.details}`,
    `Amount: ${item.amount}`,
  ];

  const rewardRender = (item) => [
    `Date/time: ${item.created_at}`,
    `Category: ${item.category}`,
    `Reward details: ${item.details}`,
    `Reward Name: ${item.reward_name}`,
  ];

  return (
    <div className="mx-auto w-[336px] min-[465px]:w-[370px] mt-4 flex justify-between px-[8px]">
      <HistoryCard
        title="Token History"
        items={MOCK_TOKEN_HISTORY}
        renderItem={tokenRender}
        delay={0.1}
      />
      <HistoryCard
        title="Reward History"
        items={MOCK_REWARD_HISTORY}
        renderItem={rewardRender}
        delay={0.2}
      />
    </div>
  );
}
