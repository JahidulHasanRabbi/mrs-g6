"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 6;

// TODO (Backend): replace with token history API data.
// Token History fields: created_at, category, details, amount
const MOCK_TOKEN_HISTORY = [
  {
    created_at: "3.4.2026",
    category: "1",
    details: "Good token",
    amount: "RM 200",
  },
  {
    created_at: "3.5.2026",
    category: "2",
    details: "Excellent token",
    amount: "RM 250",
  },
  {
    created_at: "3.6.2026",
    category: "3",
    details: "Average token",
    amount: "RM 150",
  },
  {
    created_at: "3.7.2026",
    category: "4",
    details: "Below average token",
    amount: "RM 100",
  },
  {
    created_at: "3.8.2026",
    category: "5",
    details: "Poor token",
    amount: "RM 50",
  },
  {
    created_at: "3.9.2026",
    category: "6",
    details: "Exceptional token",
    amount: "RM 300",
  },
  {
    created_at: "3.10.2026",
    category: "7",
    details: "Seasonal token",
    amount: "RM 180",
  },
  {
    created_at: "3.11.2026",
    category: "8",
    details: "Loyalty token",
    amount: "RM 220",
  },
  {
    created_at: "3.12.2026",
    category: "9",
    details: "Mystery token",
    amount: "RM 260",
  },
];

// TODO (Backend): replace with reward history API data.
// Reward History fields: created_at, category, details, reward_name
const MOCK_REWARD_HISTORY = [
  {
    created_at: "3.4.2026",
    category: "1",
    details: "Good rewards",
    reward_name: "Reward 1",
  },
  {
    created_at: "3.5.2026",
    category: "2",
    details: "Better incentives",
    reward_name: "Reward 2",
  },
  {
    created_at: "3.6.2026",
    category: "3",
    details: "Exclusive perks",
    reward_name: "Reward 3",
  },
  {
    created_at: "3.7.2026",
    category: "4",
    details: "Bonus opportunities",
    reward_name: "Reward 4",
  },
  {
    created_at: "3.8.2026",
    category: "5",
    details: "Special access",
    reward_name: "Reward 5",
  },
  {
    created_at: "3.9.2026",
    category: "6",
    details: "Loyalty benefits",
    reward_name: "Reward 6",
  },
  {
    created_at: "3.10.2026",
    category: "7",
    details: "Referral surprise",
    reward_name: "Reward 7",
  },
  {
    created_at: "3.11.2026",
    category: "8",
    details: "Weekend booster",
    reward_name: "Reward 8",
  },
  {
    created_at: "3.12.2026",
    category: "9",
    details: "VIP exclusive",
    reward_name: "Reward 9",
  },
];

const HISTORY_CONFIG = {
  token: {
    title: "Token History",
    contentWidth: "302px",
    contentOffset: "37px",
    contentTop: "114px",
    paginationTop: "346px",
    gridTemplateColumns: "70px 44px 110px 60px",
    columns: [
      {
        key: "created_at",
        label: "Date/time",
        cellClassName: "whitespace-nowrap",
      },
      {
        key: "category",
        label: "Category",
        cellClassName: "whitespace-nowrap",
      },
      { key: "details", label: "Token details" },
      { key: "amount", label: "Amount", cellClassName: "whitespace-nowrap" },
    ],
    rows: MOCK_TOKEN_HISTORY,
  },
  reward: {
    title: "Reward History",
    contentWidth: "308px",
    contentOffset: "33px",
    contentTop: "114px",
    paginationTop: "346px",
    gridTemplateColumns: "70px 42px 104px 74px",
    columns: [
      {
        key: "created_at",
        label: "Date/time",
        cellClassName: "whitespace-nowrap",
      },
      {
        key: "category",
        label: "Category",
        cellClassName: "whitespace-nowrap",
      },
      { key: "details", label: "Reward details" },
      {
        key: "reward_name",
        label: "Reward name",
        cellClassName: "whitespace-nowrap",
      },
    ],
    rows: MOCK_REWARD_HISTORY,
  },
};

function HistoryButton({ title, onClick, delay = 0 }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="relative flex h-[41px] w-[146px] shrink-0 items-center justify-center transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3cb68] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2416]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
      aria-label={`Open ${title}`}
    >
      <Image
        src="/assets/profile/history-title-banner.png"
        alt=""
        fill
        sizes="146px"
        className="object-cover drop-shadow-[0_4px_10px_rgba(233,175,65,0.35)]"
      />
      <span className="relative z-10 font-['Times_New_Roman'] text-[14px] font-bold tracking-[0.01em] text-[#60803c]">
        {title}
      </span>
    </motion.button>
  );
}

function HistoryPagination({ currentPage, totalPages, onPageChange }) {
  const pageItems =
    totalPages <= 5
      ? Array.from({ length: totalPages }, (_, index) => index + 1)
      : [1, 2, 3, "ellipsis", totalPages];

  return (
    <div className="relative flex items-center justify-center gap-5 font-['Times_New_Roman'] text-[16px] text-[#efc868]">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="leading-none transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Previous history page"
      >
        ←
      </button>

      {pageItems.map((item) => {
        if (item === "ellipsis") {
          return (
            <span key="ellipsis" className="text-[14px] opacity-70">
              ...
            </span>
          );
        }

        return (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={
              currentPage === item
                ? "font-bold text-[#efc868]"
                : "opacity-80 transition-opacity hover:opacity-100"
            }
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="leading-none transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Next history page"
      >
        →
      </button>
    </div>
  );
}

function HistoryModal({ type, onClose }) {
  const config = HISTORY_CONFIG[type];
  const [currentPage, setCurrentPage] = useState(1);
  const [modalScale, setModalScale] = useState(1);

  const totalPages = Math.max(1, Math.ceil(config.rows.length / PAGE_SIZE));

  const visibleRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return config.rows.slice(start, start + PAGE_SIZE);
  }, [config.rows, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [type]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const updateModalScale = () => {
      const widthScale = (window.innerWidth - 16) / 376;
      const heightScale = (window.innerHeight - 24) / 498;
      const nextScale = Math.min(1, widthScale, heightScale);

      setModalScale(nextScale > 0 ? nextScale : 1);
    };

    updateModalScale();
    window.addEventListener("resize", updateModalScale);

    return () => {
      window.removeEventListener("resize", updateModalScale);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
        className="relative h-[498px] w-[376px] origin-center"
        style={{ transform: `scale(${modalScale})` }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src="/assets/profile/history-frame.png"
            alt=""
            fill
            sizes="376px"
            priority
            className="pointer-events-none select-none object-fill"
          />

          <h3
            id="history-modal-title"
            className="absolute left-1/2 top-[42px] -translate-x-1/2 font-['Times_New_Roman'] text-[20px] font-bold text-[#f1cf75] drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
          >
            {config.title}
          </h3>

          <div
            className="absolute overflow-hidden rounded-[12px] border border-transparent"
            style={{
              left: config.contentOffset,
              top: config.contentTop,
              width: config.contentWidth,
            }}
          >
            <div
              className="grid items-start gap-x-[6px] pb-[12px] font-['Times_New_Roman'] text-[11px] font-normal text-[#efc868]"
              style={{ gridTemplateColumns: config.gridTemplateColumns }}
            >
              {config.columns.map((column) => (
                <div
                  key={column.key}
                  className="whitespace-pre-line px-0 text-left leading-[1.1]"
                >
                  {column.label}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-[10px]">
              {visibleRows.map((row, rowIndex) => (
                <div
                  key={`${config.title}-${row.created_at}-${rowIndex}`}
                  className="grid items-start gap-x-[6px] font-['Times_New_Roman'] text-[10.5px] leading-[1.15] text-[#f8f0db]"
                  style={{ gridTemplateColumns: config.gridTemplateColumns }}
                >
                  {config.columns.map((column) => (
                    <div
                      key={column.key}
                      className={`px-0 text-left break-words ${column.cellClassName || ""}`}
                    >
                      {row[column.key]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: config.paginationTop }}
          >
            <HistoryPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>

          <div className="absolute bottom-[43px] left-1/2 -translate-x-1/2">
            <button
              type="button"
              onClick={onClose}
              className="relative flex h-[58px] w-[204px] items-center justify-center transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3cb68] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2416]"
            >
              <Image
                src="/assets/profile/close-icon.png"
                alt=""
                fill
                sizes="204px"
                className="object-cover"
              />
              <span className="relative z-10 font-['Times_New_Roman'] text-[18px] font-bold tracking-[0.02em] text-[#6c5212] drop-shadow-[0_1px_0_rgba(255,248,205,0.7)]">
                Close
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HistorySection() {
  const [activeHistory, setActiveHistory] = useState(null);

  return (
    <>
      <div className="mx-auto mt-4 flex w-[336px] justify-between px-[8px] min-[465px]:w-[370px]">
        <HistoryButton
          title="Token History"
          onClick={() => setActiveHistory("token")}
          delay={0.1}
        />
        <HistoryButton
          title="Reward History"
          onClick={() => setActiveHistory("reward")}
          delay={0.18}
        />
      </div>

      <AnimatePresence>
        {activeHistory ? (
          <HistoryModal
            type={activeHistory}
            onClose={() => setActiveHistory(null)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
