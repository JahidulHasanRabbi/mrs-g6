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
      className="flex flex-col rounded-[10px]"
      style={{ width: 177, border: "1px solid #e9af41" }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
    >
      {/* Title banner — centered on top border */}
      <div className="relative flex items-center justify-center mx-auto" style={{ width: 146, height: 41, flexShrink: 0 }}>
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

      {/* List content — grows to fit all items, no scroll */}
      <div className="px-[8px] pb-[8px]">
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
              style={{ paddingLeft: "16.5px", marginBottom: idx < items.length - 1 ? 6 : 0 }}
            >
              {renderItem(item).map((line, i) => (
                <li
                  key={i}
                  className="font-['Times_New_Roman'] not-italic leading-normal"
                  style={{ color: "#e9af41", fontSize: 11 }}
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
