// Shared constants for the retention surface.
// Pulled out so every page imports the same gradient strings + asset base —
// changes to brand colors or asset paths happen in exactly one place.

export const ASSETS = "/assets/admin/pic-dashboard";

// Pre-computed gradient strings so React doesn't re-allocate them on every
// render. Module-level constants per Vercel `rendering-hoist-jsx`.
export const GRAD_DARK = "linear-gradient(178deg, #141828 0%, #333333 99.7%)";
export const GRAD_GOLD = "linear-gradient(99deg, #DC9D16 1%, #F2CB7A 98%)";
export const GRAD_CARD = "linear-gradient(178deg, #11320e 0%, #031101 99.7%)";

export const PERIODS = ["Daily", "Monthly", "Yearly"];
