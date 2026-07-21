"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, useCallback } from "react";
import { getMemberTokenHistory, getMemberRewardHistory } from "../../api/memberApi";
import { tokenStorage } from "../../api/tokenStorage";
import { useTheme } from "../../contexts/ThemeContext";
import { ACEBET_ASSETS, ACEBET_COLORS } from "../themes/acebet77/assets";
import { UBET_ASSETS, UBET_COLORS } from "../themes/ubetclub/assets";
import { EP369_ASSETS, EP369_COLORS } from "../themes/ep369/assets";

const PAGE_SIZE = 6;

function formatHistoryDate(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const HISTORY_CONFIG = {
  token: {
    title: "Token History",
    contentWidth: "288px",
    contentOffset: "30px",
    contentTop: "114px",
    paginationTop: "346px",
    gridTemplateColumns:
      "minmax(0,26%) minmax(0,26%) minmax(0,26%) minmax(0,22%)",
    columns: [
      {
        key: "created",
        label: "Date/time",
        cellClassName: "whitespace-nowrap overflow-hidden pl-1",
        headerAlign: "text-left pl-1",
      },
      {
        key: "category",
        label: "Category",
        cellClassName: "break-words overflow-hidden pr-1",
      },
      {
        key: "token_details",
        label: "Token details",
        cellClassName: "break-words overflow-hidden pr-1",
      },
      {
        key: "amount",
        label: "Amount",
        cellClassName: "break-words overflow-hidden text-right pr-1",
        headerAlign: "text-right pr-1",
      },
    ],
  },
  reward: {
    title: "Reward History",
    contentWidth: "288px",
    contentOffset: "30px",
    contentTop: "114px",
    paginationTop: "346px",
    gridTemplateColumns:
      "minmax(0,24%) minmax(0,24%) minmax(0,26%) minmax(0,26%)",
    columns: [
      {
        key: "created",
        label: "Date/time",
        cellClassName: "whitespace-nowrap overflow-hidden pl-1",
        headerAlign: "text-left pl-1",
      },
      {
        key: "category",
        label: "Category",
        cellClassName: "break-words overflow-hidden pr-1",
      },
      {
        key: "reward_details",
        label: "Reward details",
        cellClassName: "break-words overflow-hidden pr-1",
      },
      {
        key: "reward_name",
        label: "Reward name",
        cellClassName: "break-words overflow-hidden text-right pr-1",
        headerAlign: "text-right pr-1",
      },
    ],
  },
};

function HistoryButton({ title, onClick, delay = 0, bannerSrc, textColor, objectFit = "object-cover" }) {
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
        src={bannerSrc}
        alt=""
        fill
        sizes="146px"
        className={`${objectFit} drop-shadow-[0_4px_10px_rgba(233,175,65,0.35)]`}
      />
      <span
        className="relative z-10 font-['Times_New_Roman'] text-[14px] font-bold tracking-[0.01em]"
        style={{ color: textColor }}
      >
        {title}
      </span>
    </motion.button>
  );
}

function HistoryPagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("ellipsis-1");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("ellipsis-1");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("ellipsis-1");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("ellipsis-2");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const pageItems = getPageNumbers();

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

      {pageItems.map((item, idx) => {
        if (typeof item === "string" && item.startsWith("ellipsis")) {
          return (
            <span key={`ellipsis-${idx}`} className="text-[14px] opacity-70">
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
  const { isAcebet77, isUbetclub, isEp369 } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [modalScale, setModalScale] = useState(1);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const themed = isAcebet77 || isUbetclub || isEp369;
  const frameSrc = isAcebet77
    ? ACEBET_ASSETS.frames.scroll
    : isUbetclub
      ? UBET_ASSETS.frames.scroll
      : isEp369
        ? EP369_ASSETS.frames.scroll
        : "/assets/profile/history-frame.png";
  const closeSrc = isAcebet77
    ? ACEBET_ASSETS.spin.btnPlay
    : isUbetclub
      ? UBET_ASSETS.spin.btnPlay
      : isEp369
        ? EP369_ASSETS.spin.btnPlay
        : "/assets/profile/close-icon.png";
  const closeTextColor = isAcebet77
    ? ACEBET_COLORS.goldBright
    : isUbetclub
      ? UBET_COLORS.goldBright
      : isEp369
        ? EP369_COLORS.goldBright
        : "#6c5212";

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchHistory = useCallback(async (page) => {
    const uuid = tokenStorage.getMemberUuid();
    if (!uuid) return;

    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      let res;
      if (type === "token") {
        res = await getMemberTokenHistory(uuid, params);
      } else {
        res = await getMemberRewardHistory(uuid, params);
      }
      setRows(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      console.error("Failed to load history:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    setCurrentPage(1);
    fetchHistory(1);
  }, [type, fetchHistory]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchHistory(page);
  };

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
            src={frameSrc}
            alt=""
            fill
            sizes="376px"
            priority
            className="pointer-events-none select-none object-fill"
          />

          <h3
            id="history-modal-title"
            className="absolute left-1/2 -translate-x-1/2 font-['Times_New_Roman'] text-[20px] font-bold text-[#f1cf75] drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
            style={{ top: themed ? "78px" : "42px" }}
          >
            {config.title}
          </h3>

          {/* The themed scroll frames (acebet77 / ubetclub) have thicker
              rolled tops/bottoms and wider gold rails on the sides than the
              default green frame, so the fixed contentOffset overflows into
              their left ornament. Shift the table inward and shrink its
              width to sit inside the dark interior. Ubetclub's frame has
              even wider side ornaments than acebet77's, so it needs a
              deeper inset. */}
          <div
            className="absolute overflow-hidden rounded-[12px] border border-transparent"
            style={{
              left: isUbetclub ? "60px" : (isAcebet77 || isEp369) ? "48px" : config.contentOffset,
              top: config.contentTop,
              width: isUbetclub ? "256px" : (isAcebet77 || isEp369) ? "280px" : config.contentWidth,
            }}
          >
            <div
              className="grid items-start gap-x-[6px] pb-[12px] font-['Times_New_Roman'] text-[min(11px,3vw)] font-normal text-[#efc868]"
              style={{ gridTemplateColumns: config.gridTemplateColumns }}
            >
              {config.columns.map((column) => (
                <div
                  key={column.key}
                  className={`whitespace-pre-line px-0 leading-[1.1] ${column.headerAlign || "text-left"}`}
                >
                  {column.label}
                </div>
              ))}
            </div>

            {/* Rows scroll internally instead of pushing past the pagination
                and Close button below. Multi-line values (e.g. long reward
                names) previously ran through the pagination row and overlaid
                its text. The cap matches the space between the header (bottom
                of contentTop + ~30px header row) and the pagination row. */}
            <div
              className="flex flex-col gap-[10px] overflow-y-auto pr-1 [scrollbar-color:rgba(233,175,65,0.5)_transparent] [scrollbar-width:thin]"
              style={{ maxHeight: "195px" }}
            >
              {loading ? (
                <div className="text-center font-['Times_New_Roman'] text-[12px] text-[#f8f0db]/50 pt-10">
                  Loading...
                </div>
              ) : rows.length === 0 ? (
                <div className="text-center font-['Times_New_Roman'] text-[12px] text-[#f8f0db]/50 pt-10">
                  No records found.
                </div>
              ) : (
                rows.map((row, rowIndex) => (
                  <div
                    key={`${config.title}-${row.id || rowIndex}`}
                    className="grid items-start gap-x-[6px] font-['Times_New_Roman'] text-[min(10.5px,2.8vw)] leading-[1.15] text-[#f8f0db]"
                    style={{ gridTemplateColumns: config.gridTemplateColumns }}
                  >
                    {config.columns.map((column) => {
                      let cellValue = row[column.key];
                      if (column.key === "created") cellValue = formatHistoryDate(cellValue);

                      if (cellValue === null || cellValue === undefined || cellValue === "") {
                        cellValue = "—";
                      }

                      return (
                        <div
                          key={column.key}
                          className={`px-0 text-left break-words ${column.cellClassName || ""}`}
                        >
                          {cellValue}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>

          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: config.paginationTop }}
          >
            <HistoryPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>

          <div className="absolute bottom-[43px] left-1/2 -translate-x-1/2">
            <button
              type="button"
              onClick={onClose}
              className="relative flex h-[58px] w-[204px] items-center justify-center transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3cb68] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2416]"
            >
              <Image
                src={closeSrc}
                alt=""
                fill
                sizes="204px"
                className={themed ? "object-fill" : "object-cover"}
              />
              <span
                className="relative z-10 font-['Times_New_Roman'] text-[18px] font-bold tracking-[0.02em] drop-shadow-[0_1px_0_rgba(255,248,205,0.7)]"
                style={{ color: closeTextColor }}
              >
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
  const { isAcebet77, isUbetclub, isEp369 } = useTheme();

  let buttonSkin;
  if (isAcebet77) {
    buttonSkin = { bannerSrc: ACEBET_ASSETS.spin.btnPlay, textColor: ACEBET_COLORS.goldBright, objectFit: "object-fill" };
  } else if (isUbetclub) {
    buttonSkin = { bannerSrc: UBET_ASSETS.spin.btnPlay, textColor: UBET_COLORS.goldBright, objectFit: "object-fill" };
  } else if (isEp369) {
    buttonSkin = { bannerSrc: EP369_ASSETS.spin.btnPlay, textColor: EP369_COLORS.goldBright, objectFit: "object-fill" };
  } else {
    buttonSkin = { bannerSrc: "/assets/profile/history-title-banner.png", textColor: "#60803c", objectFit: "object-cover" };
  }

  return (
    <>
      <div className="mx-auto mt-4 flex w-full max-w-[336px] justify-between px-[8px] min-[465px]:max-w-[370px]">
        <HistoryButton
          title="Token History"
          onClick={() => setActiveHistory("token")}
          delay={0.1}
          {...buttonSkin}
        />
        <HistoryButton
          title="Reward History"
          onClick={() => setActiveHistory("reward")}
          delay={0.18}
          {...buttonSkin}
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
