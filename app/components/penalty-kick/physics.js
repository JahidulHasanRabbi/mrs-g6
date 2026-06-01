// Pure trajectory math for the penalty-kick swipe. No physics library —
// closed-form parametric paths over t in [0,1] are enough for a single shot.

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// Convert a captured swipe path into {aim, power, curl}.
// `path` is an array of {x, y, t} samples, oldest first.
// Coordinates are in element-local CSS pixels; t is performance.now() ms.
export function resolveSwipe(path) {
  if (!path || path.length < 2) {
    return { aim: 0, power: 0, curl: 0, valid: false };
  }

  const first = path[0];
  const last = path[path.length - 1];

  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const dt = Math.max(16, last.t - first.t); // never divide by zero

  // Aim: horizontal swipe component, normalized so a 120px horizontal
  // travel maps to a full -1..1 goal-line offset.
  const aim = clamp(dx / 120, -1, 1);

  // Power: average speed in px/ms. Anything over 1.5 px/ms is full power.
  const speed = Math.hypot(dx, dy) / dt;
  const power = clamp(speed / 1.5, 0, 1);

  // Curl: how far the midpoint deviates perpendicular to the start→end line.
  // Magnitude / sign gives the magnus offset; clamped to a sensible range.
  let curl = 0;
  if (path.length >= 3) {
    const mid = path[Math.floor(path.length / 2)];
    // Perpendicular distance from mid to the line first→last (signed).
    const len = Math.hypot(dx, dy) || 1;
    const cross = ((mid.x - first.x) * dy - (mid.y - first.y) * dx) / len;
    curl = clamp(cross / 60, -1, 1);
  }

  return { aim, power, curl, valid: power > 0.15 };
}

// Build a unit-time (0..1) parametric trajectory.
// Caller passes pixel space dimensions and the resolved swipe.
//
//   width  — playing surface width in px
//   height — playing surface height in px (ball→goal vertical distance)
//   { aim, power, curl } — swipe result. The ball lands exactly where the
//     player aimed — outcome is decided by the keeper's dive, not by
//     nudging the ball.
//
// Returns { x(t), y(t), scale(t) } — call each with t ∈ [0,1].
//
// The end position must match the visual goal mouth — defined by the layout
// in GoalFrame.jsx (`top: 40%`, width 340 of ~475 surface = ~71% wide) and
// Keeper.jsx (feet at `top: 50%`). Update these constants in lockstep if
// the goal moves.
//
// The values are deliberately tighter than the visible goal's outer edges
// so that even an aim of ±1 (the swipe-resolution clamp) lands the BALL —
// not just the ball's centre — clearly inside the posts and under the bar.
// Otherwise corner shots clip the post and the "Goal!" dialog disagrees
// with the visual.
// Vertical landing position — fixed at the keeper's chest/shoulder
// height so every shot ends inside the goal mouth at a consistent band
// (the marked target stripe). Vertical aim variation was tried earlier
// but felt inconsistent; locking the height keeps the read clean —
// only horizontal aim and curl matter for outcome.
const GOAL_LINE_Y_PCT = 0.25;      // ball lands at keeper-shoulder height
const GOAL_HALF_WIDTH_PCT = 0.36;  // ball stays clear of the posts at aim=1

export function buildTrajectory({
  width,
  height,
  aim,
  power,
  curl,
  offTarget = false,
}) {
  const goalHalfWidth = width * GOAL_HALF_WIDTH_PCT;
  // Off-target shots push the ball ~1.8× past the goal edge along the
  // aim direction — far enough that the post is clearly missed. The
  // ball is still rendered at the same height so it visually flies wide
  // (not over the bar). Keeper does NOT dive for these.
  const horizontalScale = offTarget ? 1.8 : 1;
  const endX = width / 2 + aim * goalHalfWidth * horizontalScale;

  const startX = width / 2;
  // startY aligns with the ReadyPhase ball at bottom: 14vh. In surface
  // fractions that lands the ball center around 0.79 of the wrapper
  // height — so the kicking ball appears exactly where the resting ball
  // was, no vertical jump at phase swap.
  const startY = height * 0.79;
  const endY = height * GOAL_LINE_Y_PCT;

  // Arc height — power scales the parabola peak. Capped so the trajectory
  // peak stays below the crossbar, even at max power.
  const arcHeight = 25 + power * 50;

  // Curl pushes laterally along the path. Peak deviation at t=0.5.
  const curlAmount = curl * 60;

  function x(t) {
    const linear = startX + (endX - startX) * t;
    // Sine bump for the curl — zero at endpoints, peak at midpoint.
    return linear + Math.sin(t * Math.PI) * curlAmount;
  }

  function y(t) {
    const linear = startY + (endY - startY) * t;
    // Parabolic lift — subtract because screen y grows downward.
    return linear - Math.sin(t * Math.PI) * arcHeight;
  }

  // Ball shrinks as it travels away (perspective fake).
  function scale(t) {
    return 1 - t * 0.55;
  }

  return { x, y, scale, endX, endY };
}

