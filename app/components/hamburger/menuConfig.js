/**
 * Menu configuration - separating data from presentation
 * Following Facebook's pattern of configuration-driven UIs
 * Updated with new Figma design specifications
 */

export const MENU_CONFIG = {
  miniGames: {
    title: "Mini Game",
      icon: "/assets/images/mini-game-icon.svg",
    items: [
      { icon: "/assets/images/kasih-spin-icon.png", label: "Lucky Spin", link: "/spin" },
      { icon: "/assets/penalty-kick/icons/soccer-gold.svg", label: "Penalty Kick", link: "/penalty-kick" },
      { icon: "/assets/rpg/ui/logo-gem.svg", label: "RPG", link: "/rpg" },
      { icon: "/assets/smash-egg/egg-icon.svg", label: "Smash Egg", link: "/smash-egg" },
    ],
  },
  mainItems: [
    {
      icon: "/assets/images/leaderboard-icon.png",
      label: "Leaderboard",
      link: "/leaderboard",
      children: [
        // World Cup entry is preserved for possible future reuse.
        // { icon: "/assets/images/leaderboard-icon.png", label: "WorldCup Leaderboard", link: "/leaderboard" },
        { icon: "/assets/leaderboard/wallet-icon.svg", label: "Top 20 Deposit", link: "/leaderboard" },
        { icon: "/assets/leaderboard/withdrawal-icon.svg", label: "Top 20 Withdraw", link: "/leaderboard?tab=withdrawal" },
        { icon: "/assets/leaderboard/referrer-icon.svg", label: "Top 20 Referral", link: "/leaderboard?tab=referrer" },
      ],
    },
    { icon: "/assets/penalty-kick/icons/flag-gold.svg", label: "Missions", link: "/missions" },
    { icon: "/assets/images/vip-membership-icon.png", label: "VIP Membership", link: "/vip" },
    { icon: "/assets/images/pagcor-mart-icon.png", label: "Mart", link: "/mart" },
  ],
  stayConnected: {
    title: "Stay Connected",
    icon: "/assets/images/mini-game-icon.png",
    items: [
      { icon: "/assets/images/feedback-icon.svg", label: "Feedback / Complain", action: "feedback" },
    ],
  },
  // Standalone items rendered after Stay Connected — kept outside any section so
  // they remain visible when sections collapse.
  extraItems: [
    { icon: "/assets/images/live-chat-icon.png", label: "Live Chat", action: "livechat" },
    { icon: "/assets/images/terms-icon.png", label: "Term & Condition", link: "/terms-and-conditions" },
    { icon: "/assets/images/logout-icon.png", label: "Back to Station", action: "station" },
  ],
};

export const ANIMATION_CONFIG = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  sidebar: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  section: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3 },
  },
};

export const THEME_CONFIG = {
  background: "#07190d",
  sidebarBg: "#265134",
  headerBg: "#265134",
  sectionBg: "#c08f32",
  textPrimary: "#ffffff",
  textSecondary: "rgba(255, 255, 255, 0.8)",
};
