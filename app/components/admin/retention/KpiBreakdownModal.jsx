"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ASSETS, GRAD_GOLD } from "./constants";

// Per-brand breakdown popup for the overview KPI tiles.
// Mirrors the PIC-Profile KPI card layout (total on top, one row per brand)
// but rendered as a centered modal, matching SetTargetModal's chrome.
//
// `kpi` carries the tile's label + formatted total. `brands` is the ordered
// list of brand codes to show (KG/LV/EP/AB/UB/N1). `rows` is the per-brand
// values already formatted by the caller: [{ brand, value }]. When `rows` is
// empty the modal still shows the total plus a notice that the per-brand
// split isn't available yet (backend dependency).
export default function KpiBreakdownModal({ isOpen, onClose, kpi, brands, rows }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const valueByBrand = new Map((rows ?? []).map((r) => [r.brand, r.value]));
  const hasBreakdown = (rows ?? []).length > 0;

  const modal = (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-[440px] rounded-[16px] border border-[#f2cb7a]/40 bg-[#0a0e0a] p-8 shadow-[0_0_32px_rgba(222,162,32,0.2)]"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${kpi?.label} breakdown`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="b-4 uppercase leading-[18px] text-white/60" style={{ letterSpacing: "-0.5px" }}>
              Brand Breakdown
            </span>
            <h2
              className="min-w-0 bg-clip-text text-transparent"
              style={{
                backgroundImage: GRAD_GOLD,
                fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "22px",
                lineHeight: "30px",
                letterSpacing: "-0.5px",
              }}
            >
              {kpi?.label}
            </h2>
          </div>
          <p
            className="shrink-0 whitespace-nowrap bg-clip-text text-transparent tabular-nums"
            style={{
              backgroundImage: GRAD_GOLD,
              fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "18px",
              lineHeight: "30px",
            }}
          >
            {kpi?.total}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {(brands ?? []).map((brand) => (
            <div key={brand} className="flex w-full items-center gap-3">
              <img src={`${ASSETS}/shop-icon.svg`} alt="" className="h-6 w-6 shrink-0" />
              <span className="min-w-0 flex-1 b-4 text-white">{brand}</span>
              <span className="shrink-0 b-4 whitespace-nowrap tabular-nums text-[#84ebb4]">
                {hasBreakdown ? valueByBrand.get(brand) ?? kpi?.zero : "—"}
              </span>
            </div>
          ))}
        </div>

        {!hasBreakdown && (
          <p className="mt-5 rounded-[8px] border border-[#f2cb7a]/30 bg-[#f2cb7a]/5 px-4 py-2 text-[12px] leading-[18px] text-[#f6dda6]">
            Per-brand breakdown isn&apos;t available for this metric yet.
          </p>
        )}

        <div className="mt-8 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-[8px] border border-[#f2cb7a] bg-transparent px-6 py-2 text-[14px] font-medium text-white transition hover:bg-white/5"
          >
            <CloseGlyph />
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}

function CloseGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
