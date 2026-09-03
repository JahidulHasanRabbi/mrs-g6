/**
 * The MRS modules offered on every themed homepage, in the order the
 * "MRS Homepage Update" brief lists them.
 *
 * `key` indexes the per-theme `assets.modules` map — each skin ships its own
 * badge art for the same nine modules (Figma 544:24-32 and the five sibling
 * groups), so only the art changes between skins.
 */
export const HOME_MODULES = [
  { id: 'lucky-spin', key: 'luckySpin', label: 'Lucky Spin', href: '/spin' },
  { id: 'penalty-kick', key: 'penaltyKick', label: 'Penalty Kick', href: '/penalty-kick' },
  { id: 'avatar', key: 'avatar', label: 'Avatar', href: '/avatar' },
  { id: 'smash-egg', key: 'smashEgg', label: 'Smash Egg', href: '/smash-egg' },
  { id: 'leaderboard', key: 'leaderboard', label: 'Leaderboard', href: '/leaderboard' },
  { id: 'missions', key: 'missions', label: 'Missions', href: '/missions' },
  { id: 'vip', key: 'vip', label: 'VIP Membership', href: '/vip' },
  { id: 'daily-checkin', key: 'dailyCheckin', label: 'Daily Check-in', href: '/daily-checkin' },
  { id: 'mart', key: 'mart', label: 'Mart', href: '/mart' },
];

/** Bind the shared module list to one skin's badge art. */
export function moduleTiles(modules) {
  return HOME_MODULES.map((module) => ({ ...module, image: modules[module.key] }));
}
