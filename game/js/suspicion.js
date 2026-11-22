// Midnight Vault — the suspicion meter. It climbs while any warden or
// lens has eyes on Rook, and bleeds away while he stays out of sight.
// At 100 the night is over: the gallery locks down and Rook is caught.

import { SUSPICION } from './settings.js';
import { distance } from './museum.js';

export function makeSuspicion() {
  return { value: 0, seenNow: false, seenBy: null, closestSeen: Infinity };
}

export function stepSuspicion(s, dt, watchers) {
  // watchers: [{ seen: boolean, name: string, dist: number }]
  let seen = null;
  let closest = Infinity;
  for (const w of watchers) {
    if (w.seen) {
      if (w.dist < closest) {
        closest = w.dist;
        seen = w.name;
      }
    }
  }
  s.seenNow = seen !== null;
  s.seenBy = seen;
  s.closestSeen = closest;
  if (seen) {
    const rate =
      closest <= SUSPICION.closeDistance
        ? SUSPICION.riseClosePerSecond
        : SUSPICION.risePerSecond;
    s.value += rate * dt;
  } else {
    s.value -= SUSPICION.fallPerSecond * dt;
  }
  s.value = Math.max(0, Math.min(SUSPICION.caughtAt, s.value));
  return s.value >= SUSPICION.caughtAt;
}

export function alarmColor(value) {
  if (value < 40) return '#37c978';
  if (value < 75) return '#e8b64c';
  return '#e05252';
}
