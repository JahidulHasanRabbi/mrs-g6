// Boss War service — the ONLY module the screens import for data.
//
// Every call goes to the live /bosswar/ API via bossWarLive.js. (There was a
// stateful sessionStorage mock behind a NEXT_PUBLIC_BOSS_WAR_MOCK switch while
// the backend was pending; both are gone now that the endpoints have shipped.)
//
// View-model contract (see viewModels.js):
//   ap           → { current, max, perAttack }
//   boss         → { id, name, type, typeLabel, hp, hpMax, hpPct, status
//                    ('active'|'defeated'|'upcoming'|'ended'), startsAt, endsAt,
//                    participants, totalDamage, myDamage, myRank, gem, art, available }
//   bossList     → { bosses:[boss], ap, serverTime }
//   battle       → { boss, ap, next: boss|null, nextStartsAt }
//   attackResult → { damage, critical, apUsed, boss, ap, myRank }
//   results      → { boss, rank, damage, calculating, reward:{name,desc,gem},
//                    rewards:{ rank, boss, participation }, next, nextStartsAt }
//   leaderboard  → { rows:[{ rank, name, damage, isMe }], me, total }
//   rewards      → { rank:[tier], boss:[tier], event:[tier] }   tier = { id, rank, name, desc, gem }
//   history      → { rows:[{ id, time, bossName, damage, critical, ap }], hasMore }
//   bossInfo     → { boss, vip:[{ member_tier_name, critical_rate, damage_bonus }] }
//   earnRules    → { deposit:[{amount,ap}], free:[{id,label,ap}], miniGames, tiles:[{...EARN_TILES, claimable}] }

import * as live from "./bossWarLive";

function gameError(err, fallback) {
  const e = new Error(err?.message || fallback);
  e.status = err?.status;
  e.data = err?.data;
  return e;
}

const wrap = (fn, fallback) => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    throw gameError(err, fallback);
  }
};

export const getGameStatus = wrap(live.getGameStatus, "Could not load Boss War.");
export const getAttackPoints = wrap(live.getAttackPoints, "Could not load your Attack Points.");
export const getBossList = wrap(live.getBossList, "Could not load the boss list.");
export const getBattle = wrap(live.getBattle, "Could not load this boss.");
export const attack = wrap(live.attack, "Attack failed. Please try again.");
export const getResults = wrap(live.getResults, "Could not load your results.");
export const getLeaderboard = wrap(live.getLeaderboard, "Could not load the leaderboard.");
export const getRewards = wrap(live.getRewards, "Could not load rewards.");
export const getHistory = wrap(live.getHistory, "Could not load your history.");
export const getBossInfo = wrap(live.getBossInfo, "Could not load boss info.");
export const getEarnRules = wrap(live.getEarnRules, "Could not load Attack Point rules.");
