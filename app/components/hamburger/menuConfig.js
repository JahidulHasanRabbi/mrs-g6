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
      { icon: "/assets/images/coming-soon-icon.png", label: "Coming Soon", link: "/coming-soon", disabled: true },
    ],
  },
  mainItems: [
    { icon: "/assets/images/my-account-icon.png", label: "My Account", link: "/profile" },
    { icon: "/assets/images/leaderboard-icon.png", label: "Leaderboard", link: "/leaderboard" },
    { icon: "/assets/images/vip-membership-icon.png", label: "VIP Membership", link: "/vip-details" },
    { icon: "/assets/images/pagcor-mart-icon.png", label: "Mart", link: "/mart" },
  ],
  social: {
    title: "Stay Connected",
    icon: "/assets/images/mini-game-icon.png",
    links: [
      { icon: "/assets/images/facebook-icon.png", url: process.env.FACEBOOK_URL, label: "Facebook", disabled: !process.env.FACEBOOK_URL },
      { icon: "/assets/images/youtube-icon.png", url: process.env.YOUTUBE_URL, label: "YouTube", disabled: !process.env.YOUTUBE_URL },
      { icon: "/assets/images/instagram-icon.png", url: process.env.INSTAGRAM_URL, label: "Instagram", disabled: !process.env.INSTAGRAM_URL },
      { icon: "/assets/images/twitter-icon.png", url: process.env.TWITTER_URL, label: "Twitter", disabled: !process.env.TWITTER_URL },
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
