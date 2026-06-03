// Static content for the public marketing landing page (Figma node 1334:1355).
// Kept separate from the component so copy/asset edits don't touch layout code.

export const VIP_TIERS = [
  { name: "Bronze", img: "/assets/landing/badge-bronze.png" },
  { name: "Silver", img: "/assets/landing/badge-silver.png" },
  { name: "Gold", img: "/assets/landing/badge-gold.png" },
  { name: "Platinum", img: "/assets/landing/badge-platinum.png" },
  { name: "Diamond", img: "/assets/landing/badge-diamond.png" },
  { name: "Emerald", img: "/assets/landing/badge-emerald.png" },
  { name: "Ruby", img: "/assets/landing/badge-ruby.png" },
  { name: "Sapphire", img: "/assets/landing/badge-sapphire.png" },
  { name: "Amethyst", img: "/assets/landing/badge-amethyst.png" },
];

export const GAMES = [
  {
    name: "Egg Smash",
    img: "/assets/landing/game-egg.png",
    description:
      "Crack open mystery eggs for instant prizes. Every smash could reveal bonus points, free spins, or exclusive rewards.",
  },
  {
    name: "Daily Spin",
    img: "/assets/landing/game-spin.png",
    description:
      "Spin the wheel of fortune once a day for guaranteed rewards. Build your streak to unlock bigger and better prizes.",
  },
  {
    name: "Mart",
    img: "/assets/landing/game-mart.png",
    description:
      "Redeem your earned points for exclusive gifts, bonus rewards, and special items. Discover a wide selection of exciting redemption options.",
  },
  {
    name: "Leaderboard",
    img: "/assets/landing/game-leaderboard.png",
    description:
      "Compete against players worldwide and climb the ranks. Top the leaderboard each season to claim elite rewards.",
  },
  {
    name: "VIP Check-in",
    img: "/assets/landing/game-vip-checkin.png",
    description:
      "Check in daily to earn VIP points and keep your membership tier. Consistency pays off with premium perks and bonuses.",
  },
  {
    name: "VIP Membership",
    img: "/assets/landing/game-vip-membership.png",
    description:
      "Unlock exclusive benefits across nine prestige tiers. Enjoy higher rewards, priority support, and luxury bonuses.",
  },
];

// Shared Telegram contact — every partner's Telegram button points here.
export const TELEGRAM_URL = "https://t.me/imlvyhere";

export const PARTNERS = [
  { name: "Kgame99", logo: "/assets/landing/partner-kgame99.png", claimUrl: "https://kgame99.com/RFA27807719" },
  { name: "LV918", logo: "/assets/landing/partner-lv918.png", claimUrl: "https://lv918.com/RFA27808136" },
  { name: "Ubetclub", logo: "/assets/landing/partner-ubetclub.png", claimUrl: "https://ubetclub.com/RFA27808309" },
  { name: "EP369", logo: "/assets/landing/partner-ep369.png", claimUrl: "https://ep369.me/RFA27807A91" },
  { name: "Acebet77", logo: "/assets/landing/partner-acebet77.png", claimUrl: "https://acebet77.me/RFA27807081" },
  { name: "N1gang", logo: "/assets/landing/partner-n1gang.png", claimUrl: "https://n1gang.net/RFA27808A91" },
];

export const FOOTER_LINKS = [
  "Privacy Policy",
  "Terms of Service",
  "Responsible Gaming",
  "Affiliate Program",
  "FAQ",
];

// A small, fixed sprinkle of gold motes for the background. Positions are
// hardcoded (percentages) rather than randomized so SSR and client render match.
export const BG_DOTS = [
  { top: "4%", left: "27%", size: 5, opacity: 0.47 },
  { top: "9%", left: "70%", size: 4, opacity: 0.26 },
  { top: "14%", left: "13%", size: 3, opacity: 0.5 },
  { top: "18%", left: "68%", size: 4, opacity: 0.14 },
  { top: "24%", left: "10%", size: 5, opacity: 0.36 },
  { top: "30%", left: "59%", size: 5, opacity: 0.38 },
  { top: "37%", left: "85%", size: 3, opacity: 0.32 },
  { top: "43%", left: "23%", size: 4, opacity: 0.48 },
  { top: "52%", left: "68%", size: 5, opacity: 0.28 },
  { top: "58%", left: "46%", size: 4, opacity: 0.42 },
  { top: "64%", left: "80%", size: 3, opacity: 0.22 },
  { top: "71%", left: "17%", size: 5, opacity: 0.42 },
  { top: "77%", left: "57%", size: 5, opacity: 0.38 },
  { top: "83%", left: "40%", size: 4, opacity: 0.29 },
  { top: "88%", left: "84%", size: 4, opacity: 0.32 },
  { top: "92%", left: "26%", size: 3, opacity: 0.19 },
];
