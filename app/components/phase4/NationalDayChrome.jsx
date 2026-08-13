import { NATIONAL_DAY_CHROME_ENABLED } from "../../config/phase4";

// Jalur Gemilang palette. Kept literal (not themed) — the client asked for the
// national colours to read as themselves on top of every station skin.
const FLAG = {
  blue: "#02307e",
  blueLight: "#0a45a6",
  red: "#cc0001",
  white: "#fbfbf8",
  gold: "#f7cf45",
};

/* ---------------------------------------------------------------- drapes --
 * A drape is a stack of bands that all share one wave curve, each band drawn
 * at a different vertical offset. Constant offsets keep the stripes parallel
 * while the curve does the waving — enough to read as cloth at 220px wide
 * without warping a mesh. A wave is { x0, y0, seg: [c1x,c1y,c2x,c2y,x,y][] }.
 */
function bandPath(wave, top, bottom) {
  const { x0, y0, seg } = wave;
  const last = seg[seg.length - 1];

  let d = `M ${x0} ${y0 + top}`;
  seg.forEach((s) => {
    d += ` C ${s[0]} ${s[1] + top} ${s[2]} ${s[3] + top} ${s[4]} ${s[5] + top}`;
  });
  d += ` L ${last[4]} ${last[5] + bottom}`;

  // The same curve walked backwards, so both edges stay exactly parallel.
  for (let i = seg.length - 1; i >= 0; i -= 1) {
    const s = seg[i];
    const prev = i > 0 ? seg[i - 1] : null;
    const endX = prev ? prev[4] : x0;
    const endY = (prev ? prev[5] : y0) + bottom;
    d += ` C ${s[2]} ${s[3] + bottom} ${s[0]} ${s[1] + bottom} ${endX} ${endY}`;
  }

  return `${d} Z`;
}

// `stripes` is a list of [thickness, colour] stacked downward from the top of
// the drape. Resolved to `<path>` elements once at module scope — every input
// is a constant, and these overlays sit in an always-mounted fixed nav.
function stripeStack(wave, stripes) {
  let cursor = 0;
  return stripes.map(([thickness, fill], index) => {
    const top = cursor;
    cursor += thickness;
    return <path key={index} d={bandPath(wave, top, cursor)} fill={fill} />;
  });
}

const flagStripes = (unit) =>
  Array.from({ length: 14 }, (_, i) => [unit, i % 2 === 0 ? FLAG.red : FLAG.white]);

/* ----------------------------------------------------------- flag emblem --
 * Crescent opening right with the 14-point Bintang Persekutuan beside it,
 * drawn inside a 44x30 box. `EMBLEM_PATHS` is the in-SVG form; `CrescentStar`
 * wraps it for the absolutely-positioned corner marks.
 */
const starPoints = (cx, cy, outer, inner) =>
  Array.from({ length: 28 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI) / 14;
    const r = i % 2 === 0 ? outer : inner;
    return `${(cx + Math.cos(angle) * r).toFixed(2)},${(cy + Math.sin(angle) * r).toFixed(2)}`;
  }).join(" ");

const STAR_POINTS = starPoints(31, 15, 7.6, 3.2);

const EMBLEM_PATHS = (
  <g fill={FLAG.gold}>
    <path d="M19.5 4.2A10.9 10.9 0 1 0 19.5 25.8a8.7 8.7 0 1 1 0-21.6Z" />
    <polygon points={STAR_POINTS} />
  </g>
);

const EMBLEM_FILTER =
  "drop-shadow(0 0 3px rgba(247,207,69,.5)) drop-shadow(0 1px 1px rgba(0,0,0,.6))";

function CrescentStar({ className = "" }) {
  return (
    <svg viewBox="0 0 44 30" className={className} aria-hidden="true" style={{ filter: EMBLEM_FILTER }}>
      {EMBLEM_PATHS}
    </svg>
  );
}

/* -------------------------------------------------------------- fireworks --
 * Thin radial rays, no fill mass — the reference uses these purely as corner
 * sparkle, and anything heavier competes with the nav icons.
 */
const RAYS = Array.from({ length: 14 }, (_, i) => {
  const angle = (i * Math.PI * 2) / 14;
  const long = i % 2 === 0;
  const inner = 3.2;
  const outer = long ? 15.5 : 10.5;
  return {
    x1: 18 + Math.cos(angle) * inner,
    y1: 18 + Math.sin(angle) * inner,
    x2: 18 + Math.cos(angle) * outer,
    y2: 18 + Math.sin(angle) * outer,
    long,
  };
});

const BURST_RAYS = (
  <g strokeLinecap="round">
    {RAYS.map((r, i) => (
      <line
        key={i}
        x1={r.x1}
        y1={r.y1}
        x2={r.x2}
        y2={r.y2}
        stroke={r.long ? FLAG.gold : "#e0554f"}
        strokeWidth={r.long ? 0.9 : 0.7}
      />
    ))}
    {RAYS.filter((r) => r.long).map((r, i) => (
      <circle key={i} cx={r.x2} cy={r.y2} r={0.75} fill={FLAG.gold} />
    ))}
    <circle cx="18" cy="18" r="1.5" fill={FLAG.gold} opacity={0.85} />
  </g>
);

function FireworkBurst({ className = "", opacity }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true" opacity={opacity}>
      {BURST_RAYS}
    </svg>
  );
}

/* ------------------------------------------------------------- menu drape --
 * The Jalur Gemilang draped across the drawer head: canton with crescent and
 * star on the left, stripes trailing off the top-right corner. The tail leaves
 * the top edge well before x=200 so the close button keeps its clearance.
 */
const MENU_WAVE = {
  x0: -18,
  y0: 24,
  seg: [
    [14, 12, 44, 32, 76, 24],
    [104, 17, 124, 28, 152, 15],
    [176, -1, 186, -15, 206, -47],
  ],
};

const MENU_FLAG_HEIGHT = 36;
const MENU_STRIPE = MENU_FLAG_HEIGHT / 14;
const MENU_CANTON_RIGHT = 52;

// Stripe fragment lapping into the drawer's bottom-right corner.
const MENU_TAIL_WAVE = {
  x0: 6,
  y0: 20,
  seg: [
    [26, 10, 46, 28, 70, 19],
    [90, 11, 102, 14, 122, 2],
  ],
};

const MENU_TAIL_STRIPES = [
  [1.5, FLAG.white],
  [2.2, FLAG.red],
  [1.5, FLAG.white],
  [2.2, FLAG.red],
  [1.5, FLAG.white],
  [3.4, FLAG.blue],
];

const MENU_DRAPE = (
  <svg viewBox="0 0 220 66" className="absolute inset-x-0 top-0 h-[66px] w-full" aria-hidden="true">
    <defs>
      <clipPath id="nd-canton">
        <rect x="-30" y="-60" width={MENU_CANTON_RIGHT + 30} height="160" />
      </clipPath>
      {/* Soft folds, so the drape reads as cloth rather than a flat sticker. */}
      <linearGradient id="nd-fold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity="0.26" />
        <stop offset="0.24" stopColor="#fff" stopOpacity="0.16" />
        <stop offset="0.46" stopColor="#000" stopOpacity="0.24" />
        <stop offset="0.7" stopColor="#fff" stopOpacity="0.14" />
        <stop offset="1" stopColor="#000" stopOpacity="0.3" />
      </linearGradient>
      <linearGradient id="nd-canton-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={FLAG.blueLight} />
        <stop offset="1" stopColor={FLAG.blue} />
      </linearGradient>
    </defs>

    <g style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,.55))" }}>
      {stripeStack(MENU_WAVE, flagStripes(MENU_STRIPE))}

      <g clipPath="url(#nd-canton)">
        <path d={bandPath(MENU_WAVE, 0, MENU_STRIPE * 7)} fill="url(#nd-canton-fill)" />
        <g transform="translate(6 23) scale(0.58) rotate(5 22 15)">{EMBLEM_PATHS}</g>
      </g>

      <path d={bandPath(MENU_WAVE, 0, MENU_FLAG_HEIGHT)} fill="url(#nd-fold)" />
      <path
        d={bandPath(MENU_WAVE, MENU_FLAG_HEIGHT - 0.6, MENU_FLAG_HEIGHT)}
        fill={FLAG.gold}
        opacity="0.45"
      />
    </g>
  </svg>
);

// `sticky` + a cancelling negative margin pins the decoration to the drawer
// frame instead of letting it scroll away with the menu list, without adding
// any height of its own.
const MENU_CHROME = (
  <div
    aria-hidden="true"
    className="pointer-events-none sticky top-0 z-20 h-dvh overflow-hidden"
    style={{ marginBottom: "-100dvh" }}
  >
    {MENU_DRAPE}

    {/* Sparkle in the free space beside the close button, clear of the drape. */}
    <FireworkBurst className="absolute right-[28px] top-[26px] w-[22px]" opacity={0.75} />
    <FireworkBurst className="absolute left-[1px] top-[52%] w-[20px]" opacity={0.45} />

    {/* Stripe tail lapping into the bottom-right corner. Kept short so it stays
        in the empty right half of a row and never crosses a label. */}
    <svg
      viewBox="0 0 130 30"
      className="absolute bottom-[4px] right-0 h-[14px] w-[52px]"
      aria-hidden="true"
    >
      <g style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,.55))" }}>
        {stripeStack(MENU_TAIL_WAVE, MENU_TAIL_STRIPES)}
      </g>
    </svg>
  </div>
);

export function NationalDayMenuOverlay() {
  return NATIONAL_DAY_CHROME_ENABLED ? MENU_CHROME : null;
}

/* ------------------------------------------------------- bottom-nav ribbon --
 * The reference runs a furled flag ribbon under the bar's top edge on both
 * sides of the centre bump, so the ribbon is drawn once and mirrored. The
 * inner end fades out where the bump rises rather than ending in a blunt cut.
 */
const NAV_WAVE = {
  x0: -14,
  y0: 30,
  seg: [
    [26, 24, 72, 37, 118, 30],
    [152, 25, 168, 27, 190, 21],
    [200, 18, 205, 15, 216, 7],
  ],
};

const NAV_RIBBON = [
  [1.1, FLAG.white],
  [1.7, FLAG.red],
  [1.1, FLAG.white],
  [3.4, FLAG.blue],
];

const NAV_RIBBON_HALF = (
  <g mask="url(#nd-nav-fade)">
    <path d={bandPath(NAV_WAVE, 0.5, 7.9)} fill="rgba(0,0,0,.42)" />
    {stripeStack(NAV_WAVE, NAV_RIBBON)}
  </g>
);

const NAV_CHROME = (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
    <svg
      viewBox="0 0 475 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nd-nav-fade-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.78" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id="nd-nav-fade">
          <rect x="-20" y="-20" width="260" height="140" fill="url(#nd-nav-fade-grad)" />
        </mask>
      </defs>

      {NAV_RIBBON_HALF}
      <g transform="translate(475 0) scale(-1 1)">{NAV_RIBBON_HALF}</g>
    </svg>

    {/* Corner marks sit in the gutters outside the outermost icons, below the
        ribbon, so they never land on an icon or its label. The bar is a fixed
        100px tall at every width, so these px offsets hold across breakpoints. */}
    <CrescentStar className="absolute left-[5px] top-[40px] w-[23px]" />
    <CrescentStar className="absolute right-[5px] top-[40px] w-[23px] -scale-x-100" />
    <FireworkBurst className="absolute left-[3px] top-[58px] w-[17px]" opacity={0.55} />
    <FireworkBurst className="absolute right-[3px] top-[58px] w-[17px]" opacity={0.55} />
  </div>
);

export function NationalDayBottomNavOverlay() {
  return NATIONAL_DAY_CHROME_ENABLED ? NAV_CHROME : null;
}
