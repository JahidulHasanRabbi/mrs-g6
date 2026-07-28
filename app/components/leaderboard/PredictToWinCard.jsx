"use client";

import { useEffect, useState } from "react";
import { LB_COLORS } from "./constants";
import { GlowCard, HeroButton } from "./primitives";
import { getWorldCupBannerList } from "../../api/memberApi";

function Arrow({ dir, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "left" ? "Previous banner" : "Next banner"}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-opacity hover:opacity-80"
      style={{ background: "rgba(var(--lb-accent-rgb), 0.15)", color: LB_COLORS.primary }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        {dir === "left" ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  );
}

export default function PredictToWinCard({ onJoinNow, eligibility }) {
  const [banners, setBanners] = useState([]);
  const [idx, setIdx] = useState(0);

  const hasEligibility = !!eligibility;
  const requiredPoints = Number(eligibility?.required_points ?? 3000);
  const totalPoints = Number(eligibility?.total_points ?? 0);
  const additionalPoints = Math.max(0, requiredPoints - totalPoints);
  const isEligible = hasEligibility && (eligibility?.eligible === true || additionalPoints === 0);

  useEffect(() => {
    getWorldCupBannerList({ location: 1 })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        setBanners(list);
        setIdx(0);
      })
      .catch((err) => {
        console.error("Failed to load World Cup banner:", err);
      });
  }, []);

  const total = banners.length;
  const banner = banners[idx] ?? null;

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  const title = banner?.title || "PREDICT TO\nWIN";
  const subtitle = banner?.subtitle || "Predict the winner in the upcoming FIFA World Cup and win bonus prizes";
  const label = banner?.label_text;
  const sectionTitle = banner?.section_title;
  const description = banner?.description;
  const image = banner?.image;

  return (
    <GlowCard>
      <div className="flex flex-col items-center gap-4 py-4">

        {/* Banner image — with arrows when >1 banners */}
        {image && (
          <div className="w-full mb-1">
            {total > 1 ? (
              <div className="flex w-full items-center gap-3">
                <Arrow dir="left" onClick={prev} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={title}
                  className="flex-1 h-auto rounded-lg object-cover"
                  style={{ maxHeight: "200px", minWidth: 0 }}
                />
                <Arrow dir="right" onClick={next} />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={title}
                className="w-full h-auto rounded-lg object-cover"
                style={{ maxHeight: "200px" }}
              />
            )}
          </div>
        )}

        {/* Dot indicators — only when >1 banners */}
        {total > 1 && (
          <div className="flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Go to banner ${i + 1}`}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === idx ? 24 : 8,
                  background: i === idx ? LB_COLORS.primary : "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </div>
        )}

        {label && (
          <span
            className="px-3 py-1 rounded-full text-xs uppercase"
            style={{
              background: "rgba(233,175,65,0.15)",
              color: LB_COLORS.gold,
              fontFamily: "'Lexend',sans-serif",
              fontWeight: 600,
            }}
          >
            {label}
          </span>
        )}

        {sectionTitle && (
          <p
            className="text-[11px] uppercase tracking-wider"
            style={{
              color: LB_COLORS.primary,
              fontFamily: "'Lexend',sans-serif",
              fontWeight: 600,
            }}
          >
            {sectionTitle}
          </p>
        )}

        <h2
          className="text-center uppercase whitespace-pre-line"
          style={{
            color: LB_COLORS.primary,
            fontFamily: "'Anybody','Lexend',sans-serif",
            fontWeight: 700,
            fontSize: 28,
            lineHeight: "34px",
          }}
        >
          {title}
        </h2>

        <p
          className="text-center px-2"
          style={{
            color: LB_COLORS.textMuted,
            fontFamily: "'Lexend',sans-serif",
            fontSize: 14,
            lineHeight: "22px",
          }}
        >
          {subtitle}
        </p>

        {description && (
          <p
            className="text-center text-[12px] px-2"
            style={{
              color: LB_COLORS.textMuted,
              fontFamily: "'Lexend',sans-serif",
              lineHeight: "18px",
              opacity: 0.8,
            }}
          >
            {description}
          </p>
        )}

        <div
          className="w-full rounded-[8px] px-3 py-2 text-center"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${LB_COLORS.borderSoft}` }}
        >
          <p className="text-[11px] uppercase" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif" }}>
            Required Points to Join FIFA 2026 Prediction
          </p>
          <p
            className="text-[16px]"
            style={{
              color: isEligible ? LB_COLORS.primary : LB_COLORS.gold,
              fontFamily: "'Anybody','Lexend',sans-serif",
              fontWeight: 700,
            }}
          >
            {requiredPoints.toLocaleString()}
          </p>
          {hasEligibility && !isEligible && (
            <p className="mt-1 text-[11px]" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif" }}>
              Need {additionalPoints.toLocaleString()} more points
            </p>
          )}
        </div>

        <div className="w-full pt-2">
          <HeroButton onClick={onJoinNow}>Join Prediction Now</HeroButton>
        </div>
      </div>
    </GlowCard>
  );
}
