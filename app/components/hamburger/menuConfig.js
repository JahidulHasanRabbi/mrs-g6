/**
 * Menu configuration - separating data from presentation
 * Following Facebook's pattern of configuration-driven UIs
 * Updated with new Figma design specifications
 *
 * Previous icon assets are intentionally kept in public and documented here
 * for reference/rollback. Do not delete them:
 *
 * Mini Game section: /assets/images/mini-game-icon.svg
 * Lucky Spin: /assets/images/kasih-spin-icon.png
 * Penalty Kick: /assets/penalty-kick/icons/soccer-gold.svg
 * Smash Egg: /assets/smash-egg/egg-icon.svg
 * Leaderboard: /assets/images/leaderboard-icon.png
 * Top Deposit: /assets/leaderboard/wallet-icon.svg
 * Top Withdraw: /assets/leaderboard/withdrawal-icon.svg
 * Top Referral: /assets/leaderboard/referrer-icon.svg
 * Missions: /assets/penalty-kick/icons/flag-gold.svg
 * VIP Membership: /assets/images/vip-membership-icon.png
 * Mart: /assets/images/pagcor-mart-icon.png
 * Stay Connected: /assets/images/mini-game-icon.png
 * Feedback: /assets/images/feedback-icon.svg
 * Live Chat: /assets/images/live-chat-icon.png
 * Terms: /assets/images/terms-icon.png
 * Back to Station: /assets/images/logout-icon.png
 */

export const MENU_CONFIG = {
  miniGames: {
    title: "Mini Game",
    icon: "/assets/menu-icons/mini-game.svg",
    items: [
      { icon: "/assets/menu-icons/lucky-spin.svg", label: "Lucky Spin", link: "/spin" },
      { icon: "/assets/menu-icons/penalty-kick.svg", label: "Penalty Kick", link: "/penalty-kick" },
      { icon: "/assets/rpg/hero/male-front.webp", label: "Avatar", link: "/rpg" },
      { icon: "/assets/menu-icons/smash-egg.svg", label: "Smash Egg", link: "/smash-egg" },
    ],
  },
  mainItems: [
    {
      icon: "/assets/menu-icons/leaderboard.svg",
      label: "Leaderboard",
      link: "/leaderboard",
      children: [
        { icon: "/assets/menu-icons/deposit.svg", label: "Top 20 Deposit", link: "/leaderboard" },
        { icon: "/assets/menu-icons/withdrawal.svg", label: "Top 20 Withdraw", link: "/leaderboard?tab=withdrawal" },
        { icon: "/assets/menu-icons/referral.svg", label: "Top 20 Referral", link: "/leaderboard?tab=referrer" },
      ],
    },
    { icon: "/assets/menu-icons/missions.svg", label: "Missions", link: "/missions" },
    { icon: "/assets/menu-icons/vip.svg", label: "VIP Membership", link: "/vip" },
    { icon: "/assets/menu-icons/daily-checkin.svg", label: "Daily Check-in", link: "/daily-checkin" },
    { icon: "/assets/menu-icons/mart.svg", label: "Mart", link: "/mart" },
  ],
  stayConnected: {
    title: "Stay Connected",
    icon: "/assets/menu-icons/connected.svg",
    items: [
      { icon: "/assets/menu-icons/feedback.svg", label: "Feedback / Complain", action: "feedback" },
    ],
  },
  // Standalone items rendered after Stay Connected — kept outside any section so
  // they remain visible when sections collapse.
  extraItems: [
    { icon: "/assets/menu-icons/livechat.svg", label: "Live Chat", action: "livechat" },
    { icon: "/assets/menu-icons/terms.svg", label: "Term & Condition", link: "/terms-and-conditions" },
    { icon: "/assets/menu-icons/station.svg", label: "Back to Station", action: "station" },
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
