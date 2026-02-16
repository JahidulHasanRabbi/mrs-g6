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
      { icon: "/assets/images/kasih-spin-icon.png", label: "Kasih Spin", link: "/spin" },
      { icon: "/assets/images/coming-soon-icon.png", label: "Coming Soon", link: "/coming-soon", disabled: true },
    ],
  },
  mainItems: [
    { icon: "/assets/images/my-account-icon.png", label: "My Account", link: "/my-account" },
    { icon: "/assets/images/leaderboard-icon.png", label: "Leaderboard", link: "/leaderboard" },
    { icon: "/assets/images/vip-membership-icon.png", label: "VIP Membership", link: "/membership-tier" },
    { icon: "/assets/images/pagcor-mart-icon.png", label: "Pagcor Mart", link: "/mart" },
  ],
  social: {
    title: "Stay Connected",
    icon: "/assets/images/mini-game-icon.png",
    links: [
      { icon: "/assets/images/facebook-icon.png", url: process.env.NEXT_PUBLIC_FACEBOOK || "https://facebook.com", label: "Facebook" },
      { icon: "/assets/images/instagram-icon.png", url: process.env.NEXT_PUBLIC_INSTAGRAM || "https://instagram.com", label: "Instagram" },
      { icon: "/assets/images/telegram-icon.png", url: process.env.NEXT_PUBLIC_TELEGRAM || "https://telegram.com", label: "Telegram" },
      { icon: "/assets/images/whatsapp-icon.png", url: process.env.NEXT_PUBLIC_WHATSAPP || "https://whatsapp.com", label: "WhatsApp" },
    ],
  },
  bottomItems: [
    { icon: "/assets/images/live-chat-icon.png", label: "Live Chat", link: "/live-chat" },
    { icon: "/assets/images/terms-icon.png", label: "Term & Condition", link: "/terms-and-conditions" },
    { icon: "/assets/images/logout-icon.png", label: "Log out", link: "/logout" },
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
