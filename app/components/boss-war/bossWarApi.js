// Boss War service — the ONLY module the screens import for data.
//
// Source switch: NEXT_PUBLIC_BOSS_WAR_MOCK defaults to the stateful mock
// until the backend ships; set it to "false" to hit the live adapter. Both
// sources export identical functions (leaderboard mockApi/worldcupApi pattern).
//
// View-model contract (shared by both sources — see viewModels.js):
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
//   earnRules    → { deposit:[{amount,ap}], free:[{id,label,ap}], miniGames, tiles:[{...EARN_TILES, claimable}] }
//   claimAp      → { gained, ap }

import * as mock from "./bossWarMock";
import * as live from "./bossWarLive";

export const USE_MOCK = process.env.NEXT_PUBLIC_BOSS_WAR_MOCK !== "false";
const source = USE_MOCK ? mock : live;

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

export const getGameStatus = wrap((...a) => source.getGameStatus(...a), "Could not load Boss War.");
export const getAttackPoints = wrap((...a) => source.getAttackPoints(...a), "Could not load your Attack Points.");
export const getBossList = wrap((...a) => source.getBossList(...a), "Could not load the boss list.");
export const getBattle = wrap((...a) => source.getBattle(...a), "Could not load this boss.");
export const attack = wrap((...a) => source.attack(...a), "Attack failed. Please try again.");
export const getResults = wrap((...a) => source.getResults(...a), "Could not load your results.");
export const getLeaderboard = wrap((...a) => source.getLeaderboard(...a), "Could not load the leaderboard.");
export const getRewards = wrap((...a) => source.getRewards(...a), "Could not load rewards.");
export const getHistory = wrap((...a) => source.getHistory(...a), "Could not load your history.");
export const getEarnRules = wrap((...a) => source.getEarnRules(...a), "Could not load Attack Point rules.");
export const claimAp = wrap((...a) => source.claimAp(...a), "Could not claim Attack Points.");
