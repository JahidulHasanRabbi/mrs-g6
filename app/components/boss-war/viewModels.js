// Server→view-model mappers: the one place the API's boss shape becomes the
// shape the screens render.

import { BOSS_TYPE_LABEL, DEFAULT_BOSS_ART } from "./constants";

// boss → { id, name, type, typeLabel, hp, hpMax, hpPct, status, startsAt,
//          endsAt, participants, totalDamage, myDamage, myRank, gem, art,
//          available }
export function bossView(server) {
  if (!server) return null;
  const id = server.uuid ?? server.id;
  const hpMax = Number(server.hp_max ?? server.hpMax ?? 0);
  const hp = Math.max(0, Number(server.hp_remaining ?? server.hp ?? hpMax));
  const status = server.status || (hp === 0 ? "defeated" : "active");
  const type = server.boss_type ?? server.type ?? "daily";
  return {
    id,
    name: server.name || "Boss",
    type,
    typeLabel: BOSS_TYPE_LABEL[type] || "Boss",
    hp,
    hpMax,
    hpPct: hpMax ? Math.round((hp / hpMax) * 100) : 0,
    status,
    startsAt: server.starts_at ?? server.startsAt ?? null,
    endsAt: server.ends_at ?? server.endsAt ?? null,
    participants: Number(server.participants ?? 0),
    totalDamage: Number(server.total_damage ?? server.totalDamage ?? 0),
    myDamage: Number(server.my_damage ?? server.myDamage ?? 0),
    myRank: server.my_rank ?? server.myRank ?? null,
    gem: server.reward_gem ?? "common",
    art: server.image || DEFAULT_BOSS_ART,
  };
}

export function apView(server) {
  const current = Number(server?.current ?? server?.balance ?? 0);
  return {
    current,
    // No server-side ceiling exists. Falling back to the balance keeps the
    // "current / max" card honest; the battle screen anchors `max` to the
    // balance the visit started with so the number can drain as you attack.
    max: Number(server?.max ?? server?.cap ?? current),
    perAttack: Number(server?.per_attack ?? server?.perAttack ?? 1),
  };
}
