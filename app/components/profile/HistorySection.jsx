"use client";

import { motion } from "framer-motion";

// TODO (Backend): Replace MOCK_TOKEN_HISTORY with real API call
// Expected fields per record: created_at, category, details, amount (+ for credit, - for debit)
const MOCK_TOKEN_HISTORY = [
  {
    created_at: "29.04.2026 8:00 AM",
    category: "Category A",
    details: "Here are the details......",
    amount: "+RM 2,000",
  },
];

// TODO (Backend): Replace MOCK_REWARD_HISTORY with real API call
// Expected fields per record: created_at, category, details, reward_name
const MOCK_REWARD_HISTORY = [
  {
    created_at: "29.04.2026 8:00 AM",
    category: "Category A",
    details: "Here are the details......",
    reward_name: "Reward A",
  },
];

function HistoryCard({ title, items, fields }) {
  return (
    <motion.div
      className="flex-1 min-w-0 rounded-lg overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0d2318 0%, #0a1c12 100%)",
        border: "1.5px solid #b8882a",
        boxShadow: "inset 0 0 12px rgba(184,136,42,0.08)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Title Banner */}
      <div
        className="flex items-center justify-center py-[7px] px-2"
        style={{
          background:
            "linear-gradient(90deg, #3a2200 0%, #7a5010 30%, #b8882a 50%, #7a5010 70%, #3a2200 100%)",
          borderBottom: "1.5px solid #b8882a",
        }}
      >
        <span
          className="text-[#fde685] font-bold font-['Times_New_Roman'] text-[11px] tracking-wide text-center"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
        >
          {title}
        </span>
      </div>

      {/* Records */}
      <div className="p-2 min-h-[100px] max-h-[200px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-[80px]">
            <p className="text-[#b8882a] text-[10px] font-['Times_New_Roman'] opacity-70 text-center">
              No records found
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * idx }}
              >
                {fields.map((field) => (
                  <p
                    key={field.key}
                    className="text-[9.5px] font-['Times_New_Roman'] leading-[1.55]"
                    style={{ color: field.highlight ? "#fde685" : "#c9a050" }}
                  >
                    <span className="font-bold">{field.label}: </span>
                    <span>{item[field.key] ?? "—"}</span>
                  </p>
                ))}
                {idx < items.length - 1 && (
                  <div className="mt-2 border-t border-[#b8882a] opacity-30" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function HistorySection() {
  const tokenFields = [
    { key: "created_at", label: "Date/time" },
    { key: "category",   label: "Category" },
    { key: "details",    label: "Token details" },
    { key: "amount",     label: "Amount", highlight: true },
  ];

  const rewardFields = [
    { key: "created_at",  label: "Date/time" },
    { key: "category",    label: "Category" },
    { key: "details",     label: "Reward details" },
    { key: "reward_name", label: "Reward Name", highlight: true },
  ];

  return (
    <motion.div
      className="mx-auto w-[336px] min-[465px]:w-[370px] mt-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div
        className="rounded-xl p-[1.5px]"
        style={{
          background:
            "linear-gradient(135deg, #b8882a 0%, #3a2200 40%, #b8882a 100%)",
        }}
      >
        <div
          className="rounded-xl p-3 flex gap-2"
          style={{ background: "#0a1c12" }}
        >
          <HistoryCard
            title="Token History"
            items={MOCK_TOKEN_HISTORY}
            fields={tokenFields}
          />
          <HistoryCard
            title="Reward History"
            items={MOCK_REWARD_HISTORY}
            fields={rewardFields}
          />
        </div>
      </div>
    </motion.div>
  );
}
