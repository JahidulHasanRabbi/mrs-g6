"use client";

import { useEffect, useState } from "react";
import { LB_COLORS } from "./constants";
import { GlowCard, SectionBadge, HeroButton } from "./primitives";
import { getWorldCupBannerList } from "../../api/memberApi";

const FALLBACK_SLIDES = [
  { title: "Real-time Rankings", body: "Live leaderboard allows players to get real-time updates on their rankings and see where they stand among others.", emoji: "🏆" },
  { title: "Lucrative Prizes", body: "The higher you step up the leaderboard ladder, the more luxury gifts and prizes you can get your hands on!", emoji: "🎁" },
  { title: "Fair Play Challenges", body: "Pit yourself against others of the same membership tier and secure a top spot on the leaderboard every month!", emoji: "🤝" },
  { title: "Wide Game Selection", body: "Compete with each other across a broad range of game categories including Sports, Live Casinos, Slots, and Lottery.", emoji: "🎮" },
];

function Arrow({ dir, onClick }) {
  return (
    <button
      onClick={onClick}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
      style={{ background: "rgba(var(--lb-accent-rgb), 0.15)", color: LB_COLORS.primary }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        {dir === "left" ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  );
}

export default function Onboarding({ onJoinNow }) {
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [i, setI] = useState(0);

  useEffect(() => {
    getWorldCupBannerList({ location: 2 })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        if (!list.length) return;
        setSlides(list.map((b) => ({
          title: b.title || b.section_title || "",
          body: b.description || b.subtitle || "",
          emoji: "🏆",
          image: b.image || null,
        })));
        setI(0);
      })
      .catch((err) => {
        console.error("Failed to load Onboarding banners:", err);
      });
  }, []);

  const s = slides[i];
  const prev = () => setI((i - 1 + slides.length) % slides.length);
  const next = () => setI((i + 1) % slides.length);

  return (
    <div className="flex justify-center px-4 pb-8 pt-2">
      <GlowCard>
        <div className="flex flex-col items-center gap-4">
          <h2
            className="text-center uppercase"
            style={{
              color: LB_COLORS.primary,
              fontFamily: "'Anybody','Lexend',sans-serif",
              fontWeight: 700,
              fontSize: 26,
              lineHeight: "32px",
            }}
          >
            BECOME<br />TOP 10 PLAYERS
          </h2>
          <p className="text-center" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif", fontSize: 14 }}>
            Join a country to start earning XP and climbing the ranks!
          </p>

          <div className="w-full pt-2">
            <SectionBadge size="lg">Exclusive Rewards</SectionBadge>
          </div>

          <div className="flex w-full items-center gap-4 py-4">
            <Arrow dir="left" onClick={prev} />
            <div className="flex flex-1 items-center justify-center">
              {s.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image} alt={s.title} className="h-[150px] w-[150px] rounded-full object-cover" />
              ) : (
                <div
                  className="grid h-[150px] w-[150px] place-items-center rounded-full"
                  style={{ background: "rgba(var(--lb-accent-rgb), 0.06)", fontSize: 72 }}
                  aria-hidden="true"
                >
                  {s.emoji}
                </div>
              )}
            </div>
            <Arrow dir="right" onClick={next} />
          </div>

          <h3
            className="text-center uppercase"
            style={{
              color: LB_COLORS.primary,
              fontFamily: "'Lexend',sans-serif",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "1.2px",
              textShadow: "0 0 10px rgba(var(--lb-accent-rgb), 0.8)",
            }}
          >
            {s.title}
          </h3>
          <p className="text-center" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif", fontSize: 14, lineHeight: "22px" }}>
            {s.body}
          </p>

          <div className="flex gap-1 pt-2">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className="h-1 w-6 rounded-full"
                style={{ background: idx === i ? LB_COLORS.primary : "rgba(255,255,255,0.2)" }}
              />
            ))}
          </div>

          <div className="w-full pt-2">
            <HeroButton onClick={onJoinNow}>Join Now</HeroButton>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
