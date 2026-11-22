// Midnight Vault — the wardens (patrolling guards) and the lenses
// (sweeping wall cameras), plus the question both ask every tick:
// can this watcher see the burglar right now?

import { WARDEN, LENS } from './settings.js';
import {
  angleTo,
  angleDiff,
  distance,
  sightBlocked,
  segmentHitsCircle,
} from './museum.js';

function makeWarden(name, waypoints, speed) {
  return {
    kind: 'warden',
    name,
    waypoints,
    waypointIndex: 0,
    x: waypoints[0][0],
    y: waypoints[0][1],
    facing: 0,
    speed,
    mode: 'patrol', // patrol | chase | investigate
    chaseTarget: null,
    unseenFor: 0,
    investigateLeft: 0,
    investigateAt: null,
  };
}

function makeLens(name, x, y, baseAngle, sweepHalf, range, period, phase) {
  return {
    kind: 'lens',
    name,
    x,
    y,
    baseAngle,
    sweepHalf,
    range,
    period,
    phase,
    angle: baseAngle,
    disabledUntil: 0,
  };
}

// The gallery's staff, as the night shift starts.
export function staffRoster() {
  const wardens = [
    makeWarden('Vera', [[200, 180], [200, 780]], 62),
    makeWarden('Dmitri', [[430, 470], [850, 470]], 70),
    makeWarden('Sofia', [[1000, 430], [1000, 640], [1180, 640], [1180, 430]], 66),
  ];
  const lenses = [
    makeLens('North Lens', 640, 96, Math.PI / 2, LENS.sweepHalf, LENS.range, LENS.sweepPeriod, 0),
    makeLens('Vault Lens', 1248, 300, Math.PI, (45 * Math.PI) / 180, 380, 4.4, 1.7),
  ];
  return { wardens, lenses };
}

// A smoke cloud hides whatever sits inside it, and blocks sight across it.
function hiddenBySmoke(x1, y1, x2, y2, smokes) {
  for (const s of smokes) {
    const inside =
      distance(x2, y2, s.x, s.y) <= s.r || distance(x1, y1, s.x, s.y) <= s.r;
    if (inside || segmentHitsCircle(x1, y1, x2, y2, s.x, s.y, s.r)) return true;
  }
  return false;
}

export function wardenSees(w, tx, ty, floor, smokes) {
  const d = distance(w.x, w.y, tx, ty);
  if (d > WARDEN.viewRange) return false;
  if (Math.abs(angleDiff(angleTo(w.x, w.y, tx, ty), w.facing)) > WARDEN.viewHalfAngle) return false;
  if (sightBlocked(w.x, w.y, tx, ty, floor.solids)) return false;
  if (hiddenBySmoke(w.x, w.y, tx, ty, smokes)) return false;
  return true;
}

export function lensSees(lens, tx, ty, now, floor, smokes) {
  if (now < lens.disabledUntil) return false;
  const d = distance(lens.x, lens.y, tx, ty);
  if (d > lens.range) return false;
  if (Math.abs(angleDiff(angleTo(lens.x, lens.y, tx, ty), lens.angle)) > LENS.halfAngle) return false;
  if (sightBlocked(lens.x, lens.y, tx, ty, floor.solids)) return false;
  if (hiddenBySmoke(lens.x, lens.y, tx, ty, smokes)) return false;
  return true;
}

// Walk toward (tx, ty) at speed, stopping on arrival. Returns true when
// the warden arrived this tick.
function walkToward(w, tx, ty, speed, dt) {
  const d = distance(w.x, w.y, tx, ty);
  if (d < 1) return true;
  const step = Math.min(d, speed * dt);
  const nx = w.x + ((tx - w.x) / d) * step;
  const ny = w.y + ((ty - w.y) / d) * step;
  w.facing = angleTo(w.x, w.y, nx, ny);
  w.x = nx;
  w.y = ny;
  return d - step < 1;
}

export function stepWardens(staff, dt, now, burglar, floor, smokes) {
  const events = { spottedBy: null, lostSight: [] };
  for (const w of staff.wardens) {
    const sees = wardenSees(w, burglar.x, burglar.y, floor, smokes);
    if (sees) {
      if (w.mode !== 'chase') events.spottedBy = w.name;
      w.mode = 'chase';
      w.unseenFor = 0;
      w.chaseTarget = { x: burglar.x, y: burglar.y };
    } else if (w.mode === 'chase') {
      w.unseenFor += dt;
      if (w.unseenFor >= WARDEN.loseSightAfter) {
        w.mode = 'patrol';
        w.chaseTarget = null;
        events.lostSight.push(w.name);
      }
    }

    if (w.mode === 'chase' && w.chaseTarget) {
      walkToward(w, w.chaseTarget.x, w.chaseTarget.y, WARDEN.chaseSpeed, dt);
      w.facing = angleTo(w.x, w.y, burglar.x, burglar.y);
    } else if (w.mode === 'investigate' && w.investigateAt) {
      const arrived = walkToward(
        w, w.investigateAt.x, w.investigateAt.y, WARDEN.investigateSpeed, dt,
      );
      if (arrived) {
        w.investigateLeft -= dt;
        w.facing += dt * 1.6;
        if (w.investigateLeft <= 0) {
          w.mode = 'patrol';
          w.investigateAt = null;
        }
      }
    } else {
      const target = w.waypoints[w.waypointIndex];
      const arrived = walkToward(w, target[0], target[1], w.speed, dt);
      if (arrived) w.waypointIndex = (w.waypointIndex + 1) % w.waypoints.length;
    }
  }

  for (const lens of staff.lenses) {
    lens.angle =
      lens.baseAngle +
      lens.sweepHalf * Math.sin(((now + lens.phase) / lens.period) * Math.PI * 2);
  }
  return events;
}

// The nearest patrolling warden drops everything to check a coin.
export function lureWardens(staff, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const w of staff.wardens) {
    if (w.mode === 'chase') continue;
    const d = distance(w.x, w.y, x, y);
    if (d < bestD) {
      bestD = d;
      best = w;
    }
  }
  if (best && bestD <= 285) {
    best.mode = 'investigate';
    best.investigateAt = { x, y };
    best.investigateLeft = WARDEN.investigateTime;
    return best.name;
  }
  return null;
}

// The nearest live lens inside hack range goes dark for a while.
export function hackNearestLens(staff, x, y, now) {
  let best = null;
  let bestD = Infinity;
  for (const lens of staff.lenses) {
    if (now < lens.disabledUntil) continue;
    const d = distance(lens.x, lens.y, x, y);
    if (d < bestD) {
      bestD = d;
      best = lens;
    }
  }
  if (best && bestD <= 430) {
    best.disabledUntil = now + LENS.disabledSeconds;
    return best.name;
  }
  return null;
}
