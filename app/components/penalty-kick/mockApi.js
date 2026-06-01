// Mock backend for the penalty kick game. Returns the same shape we expect
// the real /penalty-kick/kick endpoint to return — swap the import in
// page.js with a real api wrapper when the backend is ready.

// Per-zone save probability. Center is easy to save because the keeper
// rests at center — they barely move. Corners require a dive, so they're
// easier to score on. This makes swipe direction genuinely matter:
// shoot corners for goals, shoot at the keeper for saves.
const SAVE_PROBABILITY = {
  easy:   { center: 0.65, corner: 0.20 }, // corners ~80% goal
  medium: { center: 0.85, corner: 0.40 }, // corners ~60% goal
  hard:   { center: 0.95, corner: 0.65 }, // corners ~35% goal
};

const SEED_REWARDS = [
  { id: "r1", name: "BMW Car", quantity: 34053, itemType: "Free credit" },
  { id: "r2", name: "Audi Sedan", quantity: 28470, itemType: "Min withdraw" },
  { id: "r3", name: "Ford Pickup", quantity: 32540, itemType: "Max withdraw" },
  { id: "r4", name: "Tesla Model 3", quantity: 39000, itemType: "Token" },
  { id: "r5", name: "Mercedes SUV", quantity: 45237, itemType: "Prize" },
];

const SEED_HISTORY = [
  { id: "h1", outcome: "goal", amount: 50, claimed: false, label: "Scored a goal", sub: "Tap to claim!" },
  { id: "h2", outcome: "miss", amount: -50, claimed: false, label: "Missed a goal", sub: "Token deducted" },
  { id: "h3", outcome: "goal", amount: 50, claimed: true, label: "Scored a goal", sub: "Redeemed" },
  { id: "h4", outcome: "goal", amount: 50, claimed: false, label: "Scored a goal", sub: "Tap to claim!" },
  { id: "h5", outcome: "miss", amount: -50, claimed: false, label: "Missed a goal", sub: "Token deducted" },
];

const fakeLatency = (ms = 350) => new Promise((r) => setTimeout(r, ms));

// Map a normalized aim (-1..1) into one of three goal zones.
function aimToZone(aim) {
  if (aim < -0.33) return -1;
  if (aim > 0.33) return 1;
  return 0;
}

export async function kickMock(
  _memberUuid,
  { aim = 0, power = 0 } = {},
  { difficulty = "easy" } = {},
) {
  await fakeLatency();

  // Wildness = how reckless the swipe was — high power swung at a sharp
  // angle. Tiny wildness for a tame center kick, big wildness for a
  // power-curve-to-the-corner. Off-target chance ramps from 0 once
  // wildness clears 0.55 and tops out at 0.5 (50 %).
  const wildness = Math.min(1, Math.abs(aim) * Math.max(0, power));
  const missChance = Math.max(0, Math.min(0.5, (wildness - 0.55) * 2));
  const isMiss = Math.random() < missChance;

  if (isMiss) {
    // Ball flies wide. Keeper doesn't react — the shot was never going
    // in. Reward null, tokens still deducted upstream.
    return {
      outcome: "miss",
      reward: null,
      saveDelayMs: 180,
      keeperDive: 0,
      ballZone: aimToZone(aim),
      offTarget: true,
    };
  }

  const ballZone = aimToZone(aim);
  const tbl = SAVE_PROBABILITY[difficulty] ?? SAVE_PROBABILITY.easy;
  const saveChance = ballZone === 0 ? tbl.center : tbl.corner;
  const isSave = Math.random() < saveChance;

  // Keeper goes to the ball on a save. On a goal, the keeper dives the
  // OPPOSITE way — corner shots send the keeper to the other corner, a
  // center shot sends them to one of the corners. Picking "center" as
  // the wrong-way dive looked like the keeper froze on a goal; this
  // version always sells a clean wrong-foot.
  let keeperDive;
  if (isSave) {
    keeperDive = ballZone;
  } else if (ballZone === 0) {
    keeperDive = Math.random() < 0.5 ? -1 : 1;
  } else {
    keeperDive = -ballZone;
  }

  return {
    outcome: isSave ? "save" : "goal",
    reward: !isSave
      ? { uuid: `kick-${Date.now()}`, reward_name: "2 Tokens", credit_amount: 2 }
      : null,
    saveDelayMs: 180 + Math.random() * 120,
    keeperDive,
    ballZone,
    offTarget: false,
  };
}

export async function getKickHistoryMock() {
  await fakeLatency(180);
  return SEED_HISTORY.slice();
}

export async function getGameConfigMock() {
  await fakeLatency(120);
  return {
    tokensBalance: 24.0,
    tokenPerShot: 10.0,
    // Tuned for "this should feel like a real keeper". The real backend
    // will eventually drive this from the admin panel — see
    // KeeperDifficultyModal in app/admin/penalty-kick/.
    difficulty: "medium",
    enabled: true,
  };
}

export async function getRewardsMock() {
  await fakeLatency(150);
  return SEED_REWARDS.slice();
}

export async function saveKeeperDifficultyMock(payload) {
  await fakeLatency();
  return { ok: true, saved: payload };
}

export async function saveCostMock(payload) {
  await fakeLatency();
  return { ok: true, saved: payload };
}

export async function saveGameStatusMock(payload) {
  await fakeLatency();
  return { ok: true, saved: payload };
}

export async function saveKickSequenceMock(payload) {
  await fakeLatency();
  return { ok: true, saved: payload };
}
