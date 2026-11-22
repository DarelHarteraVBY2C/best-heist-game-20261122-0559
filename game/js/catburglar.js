// Midnight Vault — Rook, the burglar: keyboard and click-to-move
// movement, wall sliding, and the three gadgets in the coat pockets.

import { BURGLAR, GADGETS, START } from './settings.js';
import { circleHitsSolid, distance } from './museum.js';

export function makeBurglar() {
  return {
    x: START.x,
    y: START.y,
    facing: -Math.PI / 2,
    moving: false,
    clickTarget: null,
    smokeLeft: GADGETS.smokeCount,
    coinsLeft: GADGETS.coinCount,
    hacksLeft: GADGETS.hackCount,
    hasPrize: false,
  };
}

// Move one axis at a time so Rook slides along walls instead of
// sticking on their corners.
function tryStep(b, dx, dy, floor) {
  const nx = b.x + dx;
  const ny = b.y + dy;
  if (!circleHitsSolid(nx, b.y, BURGLAR.radius, floor.solids)) b.x = nx;
  if (!circleHitsSolid(b.x, ny, BURGLAR.radius, floor.solids)) b.y = ny;
}

export function stepBurglar(b, input, dt, floor) {
  let mx = 0;
  let my = 0;
  if (input.keys.has('KeyA') || input.keys.has('ArrowLeft')) mx -= 1;
  if (input.keys.has('KeyD') || input.keys.has('ArrowRight')) mx += 1;
  if (input.keys.has('KeyW') || input.keys.has('ArrowUp')) my -= 1;
  if (input.keys.has('KeyS') || input.keys.has('ArrowDown')) my += 1;

  b.moving = false;
  if (mx !== 0 || my !== 0) {
    const len = Math.hypot(mx, my);
    const step = BURGLAR.walkSpeed * dt;
    tryStep(b, (mx / len) * step, (my / len) * step, floor);
    b.facing = Math.atan2(my, mx);
    b.moving = true;
    b.clickTarget = null;
  } else if (b.clickTarget) {
    const d = distance(b.x, b.y, b.clickTarget.x, b.clickTarget.y);
    if (d < 6) {
      b.clickTarget = null;
    } else {
      const step = Math.min(d, BURGLAR.clickSpeed * dt);
      const dx = ((b.clickTarget.x - b.x) / d) * step;
      const dy = ((b.clickTarget.y - b.y) / d) * step;
      tryStep(b, dx, dy, floor);
      b.facing = Math.atan2(dy, dx);
      b.moving = true;
    }
  }

  // Keep Rook inside the hall.
  const f = floor.bounds;
  b.x = Math.max(f.x + BURGLAR.radius, Math.min(f.x + f.w - BURGLAR.radius, b.x));
  b.y = Math.max(f.y + BURGLAR.radius, Math.min(f.y + f.h - BURGLAR.radius, b.y));
}

// Gadget use. Each returns a small event object or null when it cannot
// fire (out of stock, out of range, or the wrong moment).
export function throwSmoke(b, smokes, now) {
  if (b.smokeLeft <= 0) return null;
  b.smokeLeft -= 1;
  smokes.push({ x: b.x, y: b.y, r: GADGETS.smokeRadius, until: now + GADGETS.smokeSeconds });
  return { type: 'smoke', left: b.smokeLeft };
}

export function tossCoin(b, coins, x, y) {
  if (b.coinsLeft <= 0) return null;
  if (distance(b.x, b.y, x, y) > GADGETS.coinRange) return null;
  b.coinsLeft -= 1;
  coins.push({ x, y, until: 0 });
  return { type: 'coin', left: b.coinsLeft, x, y };
}

export function useHack(b) {
  if (b.hacksLeft <= 0) return null;
  b.hacksLeft -= 1;
  return { type: 'hack', left: b.hacksLeft };
}
