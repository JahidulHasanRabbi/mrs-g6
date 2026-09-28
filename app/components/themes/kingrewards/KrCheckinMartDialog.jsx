"use client";

import KingRewardsDialog from "./KingRewardsDialog";
import KingRewardsButton from "./KingRewardsButton";
import { GoldText, KrImage } from "./KrUi";
import { KR_ASSETS, KR_FONT, KR_GRADIENTS } from "./assets";

const TITLE_SHADOW = "drop-shadow(0 4px 1.5px rgba(0,0,0,0.1)) drop-shadow(0 10px 4px rgba(0,0,0,0.04))";

// Figma sets 14–24px leading at 32px, which clips the gradient's descenders.
const TITLE_TEXT = { fontSize: 32, lineHeight: "36px", letterSpacing: 1.4 };

function DialogTitle({ tone, children }) {
  return (
    <div className="flex min-h-9 items-center justify-center gap-1" style={{ filter: TITLE_SHADOW }}>
      {tone === "warning" ? (
        <>
          <img src={KR_ASSETS.ui.iconWarning} alt="" className="size-8 shrink-0" />
          <span
            className="font-bold uppercase"
            style={{
              ...TITLE_TEXT,
              fontFamily: KR_FONT,
              backgroundImage: KR_GRADIENTS.red,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {children}
          </span>
        </>
      ) : (
        <GoldText className="text-center font-bold uppercase" style={TITLE_TEXT}>
          {children}
        </GoldText>
      )}
    </div>
  );
}

/** Body line 1: Barlow Medium 18/27, #e2e2e2. */
export function KrDialogLine({ children }) {
  return (
    <p className="text-center text-[18px] font-medium leading-[27px] text-[#e2e2e2]" style={{ fontFamily: KR_FONT }}>
      {children}
    </p>
  );
}

/** Optional prize row: art, then Medium 16/24 in #f2ba33. */
export function KrDialogPrize({ image, imageClassName = "size-16", children }) {
  return (
    <div className="flex max-w-full items-center justify-center gap-4">
      {image && <KrImage src={image} className={`shrink-0 object-contain ${imageClassName}`} />}
      <span className="min-w-0 text-[16px] font-medium leading-6 text-[#f2ba33]" style={{ fontFamily: KR_FONT }}>
        {children}
      </span>
    </div>
  );
}

/**
 * The Mart / Check-in result modal (Figma 829:7824, 829:8037, 857:3577…):
 * a gold success title or a red WARNING!, the body, then "Back".
 */
export default function KrCheckinMartDialog({ open, onClose, tone = "success", title, children }) {
  return (
    <KingRewardsDialog open={open} onClose={onClose}>
      <div className="flex w-full flex-col gap-8">
        {title && <DialogTitle tone={tone}>{title}</DialogTitle>}
        <div className="flex flex-col items-center gap-4 px-2">{children}</div>
      </div>
      <div className="flex w-full flex-col items-center gap-4">
        <KingRewardsButton variant="dark" onClick={onClose}>
          Back
        </KingRewardsButton>
      </div>
    </KingRewardsDialog>
  );
}
