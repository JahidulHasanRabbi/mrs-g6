"use client";

import { useState } from "react";
import Link from "next/link";
import { HamburgerMenu } from "../components/hamburger";
import { FooterNav } from "../components/footer";
import { Header } from "../components/header";
import { HOME_ASSETS } from "../components/home/homeAssets";
import LuckySpinGrid from "../components/spin/LuckySpinGrid";

const imgLuckySpinWinningList =
  "http://localhost:3845/assets/f315c0f933f1d247d589c0a45aee6ddd03255f62.png";

export default function SpinPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="min-h-screen w-full pt-[52px] pb-[100px] relative"
      style={{
        backgroundImage: `url(${HOME_ASSETS.backgroundPattern})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Header onMenuClick={() => setIsMenuOpen(true)} />

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <main className="w-full">
        <div className="relative w-[402px] max-w-full mx-auto">
          {!imageError ? (
            <img
              alt="Lucky Spin"
              src={imgLuckySpinWinningList}
              className="w-full h-auto block"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-[700px] flex items-center justify-center text-white/80 text-sm text-center px-6">
              Lucky Spin assets failed to load.
            </div>
          )}

          {/* Spin grid section (Figma node 1079:690) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[264px] w-full flex justify-center">
            <LuckySpinGrid />
          </div>

          {/* Menu hotspot */}
          <button
            type="button"
            className="absolute left-[21px] top-[14px] w-[60px] h-[56px]"
            aria-label="Open menu"
            onClick={() => setIsMenuOpen(true)}
            style={{ background: "transparent" }}
          />

          {/* Spin package hotspots */}
          <button
            type="button"
            className="absolute left-[53px] top-[644px] w-[146px] h-[54px]"
            aria-label="Buy 10 spins"
            style={{ background: "transparent" }}
          />
          <button
            type="button"
            className="absolute left-[210px] top-[644px] w-[146px] h-[54px]"
            aria-label="Buy 50 spins"
            style={{ background: "transparent" }}
          />

          {/* Winning List / Record tabs */}
          <Link
            href="/spin/winning-list"
            className="absolute left-[63px] top-[1508px] w-[131px] h-[36px]"
            aria-label="Winning List"
          />
          <Link
            href="/spin/winning-record"
            className="absolute left-[207px] top-[1508px] w-[131px] h-[36px]"
            aria-label="Winning Record"
          />
        </div>
      </main>

      <FooterNav />
    </div>
  );

}
