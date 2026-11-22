// Midnight Vault — the Obsidian Gallery floor plan, and the geometry
// every other module asks about: solid rectangles, line of sight, and
// circle-vs-wall collision. Nothing here touches the DOM.

import { FLOOR, PRIZE, DOOR, START } from './settings.js';

// A solid is { x, y, w, h } in canvas pixels.
export function buildFloor() {
  const solids = [];
  const add = (x, y, w, h) => solids.push({ x, y, w, h });

  // Outer walls (the floor rect's own border is the wall line).
  add(FLOOR.x - 16, FLOOR.y - 16, FLOOR.w + 32, 16); // north
  add(FLOOR.x - 16, FLOOR.y + FLOOR.h, FLOOR.w + 32, 16); // south
  add(FLOOR.x - 16, FLOOR.y - 16, 16, FLOOR.h + 32); // west
  add(FLOOR.x + FLOOR.w, FLOOR.y - 16, 16, FLOOR.h + 32); // east

  // The vault room, north-east: walled off except for one doorway in
  // its south wall. The Midnight Star sits on its pedestal inside.
  add(952, 96, 16, 264); // vault west wall
  add(968, 344, 96, 16); // vault south wall, west of the door
  add(1144, 344, 112, 16); // vault south wall, east of the door

  // Display cases: two columns, two rows, leaving three lanes across.
  add(296, 236, 128, 44);
  add(856, 236, 128, 44);
  add(296, 636, 128, 44);
  add(856, 636, 128, 44);

  // The marble statue at the centre of the hall.
  add(600, 420, 80, 80);

  // Crates stacked in the west wing.
  add(132, 492, 96, 64);
  add(132, 700, 96, 64);

  // A long bench along the north wall, west of the vault.
  add(420, 128, 180, 36);

  return {
    bounds: FLOOR,
    solids,
    vault: { x: 968, y: 96, w: 288, h: 248 },
    prize: { ...PRIZE },
    door: { ...DOOR },
    start: { ...START },
    cases: solids.slice(6, 10),
    statue: solids[10],
  };
}

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// Does a circle at (cx, cy) with radius r overlap any solid?
export function circleHitsSolid(cx, cy, r, solids) {
  for (const s of solids) {
    const nx = Math.max(s.x, Math.min(cx, s.x + s.w));
    const ny = Math.max(s.y, Math.min(cy, s.y + s.h));
    const dx = cx - nx;
    const dy = cy - ny;
    if (dx * dx + dy * dy < r * r) return s;
  }
  return null;
}

// Liang–Barsky: does segment (x1,y1)-(x2,y2) cross rectangle r?
export function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const clip = (p, q) => {
    if (p === 0) return q >= 0;
    const t = q / p;
    if (p < 0) {
      if (t > t1) return false;
      if (t > t0) t0 = t;
    } else {
      if (t < t0) return false;
      if (t < t1) t1 = t;
    }
    return true;
  };
  if (!clip(-dx, x1 - r.x)) return false;
  if (!clip(dx, r.x + r.w - x1)) return false;
  if (!clip(-dy, y1 - r.y)) return false;
  if (!clip(dy, r.y + r.h - y1)) return false;
  return true;
}

// Is the sight line between two points blocked by any solid?
export function sightBlocked(x1, y1, x2, y2, solids) {
  for (const s of solids) {
    if (segmentHitsRect(x1, y1, x2, y2, s)) return true;
  }
  return false;
}

// Does segment (x1,y1)-(x2,y2) pass through circle (cx,cy,r)?
export function segmentHitsCircle(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((cx - x1) * dx + (cy - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = x1 + t * dx - cx;
  const py = y1 + t * dy - cy;
  return px * px + py * py <= r * r;
}

export function angleTo(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

export function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}
