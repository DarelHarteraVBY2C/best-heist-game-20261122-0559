// Midnight Vault — the heist itself: one state object, and the single
// step that moves it. Boot owns the loop; this module owns the rules.

import { buildFloor, distance } from './museum.js';
import { staffRoster, stepWardens, wardenSees, lensSees, lureWardens, hackNearestLens } from './wardens.js';
import { makeBurglar, stepBurglar, throwSmoke, tossCoin, useHack } from './catburglar.js';
import { makeSuspicion, stepSuspicion } from './suspicion.js';

export const PHASES = ['title', 'playing', 'paused', 'caught', 'escaped'];

export function createHeist() {
  const floor = buildFloor();
  const staff = staffRoster();
  return {
    phase: 'title',
    floor,
    staff,
    burglar: makeBurglar(),
    suspicion: makeSuspicion(),
    smokes: [],
    coins: [],
    elapsed: 0,
    caughtBy: null,
    score: 0,
    flash: 0, // red vignette timer after being spotted
    message: '',
    messageUntil: 0,
  };
}

function scoreHeist(h) {
  const timeBonus = Math.max(0, 9000 - Math.floor(h.elapsed) * 22);
  const gadgetBonus =
    (h.burglar.smokeLeft + h.burglar.coinsLeft + h.burglar.hacksLeft) * 350;
  const alarmBonus = Math.max(0, Math.floor((100 - h.suspicion.value) * 12));
  return timeBonus + gadgetBonus + alarmBonus;
}

function say(h, text, seconds) {
  h.message = text;
  h.messageUntil = h.elapsed + seconds;
}

// One fixed tick of the night. input: { keys:Set, click:{x,y}|null,
// gadget:'smoke'|'coin'|'hack'|null, coinAt:{x,y}|null }.
export function stepHeist(h, input, dt) {
  if (h.phase !== 'playing') return;
  h.elapsed += dt;
  h.flash = Math.max(0, h.flash - dt);

  stepBurglar(h.burglar, input, dt, h.floor);

  // Gadgets, fired on the tick the key was pressed.
  if (input.gadget === 'smoke') {
    const ev = throwSmoke(h.burglar, h.smokes, h.elapsed);
    if (ev) say(h, 'Smoke out — their eyes are useless for now.', 2);
    else say(h, 'No smoke bombs left.', 1.5);
  }
  if (input.gadget === 'coin' && input.coinAt) {
    const ev = tossCoin(h.burglar, h.coins, input.coinAt.x, input.coinAt.y);
    if (ev) {
      const lured = lureWardens(h.staff, ev.x, ev.y);
      say(h, lured ? `${lured} heard the coin. Go.` : 'The coin clinks — nobody close enough.', 2);
    } else {
      say(h, 'No coins left — or too far to throw.', 1.5);
    }
  }
  if (input.gadget === 'hack') {
    const ev = useHack(h.burglar);
    if (ev) {
      const hit = hackNearestLens(h.staff, h.burglar.x, h.burglar.y, h.elapsed);
      say(h, hit ? `${hit} is dark for 12 seconds.` : 'No camera in range.', 2);
    } else {
      say(h, 'No hacks left.', 1.5);
    }
  }

  // Smoke clouds fade.
  h.smokes = h.smokes.filter((s) => h.elapsed < s.until);

  const events = stepWardens(h.staff, dt, h.elapsed, h.burglar, h.floor, h.smokes);

  // Who sees Rook right now?
  const watchers = [];
  for (const w of h.staff.wardens) {
    watchers.push({
      seen: wardenSees(w, h.burglar.x, h.burglar.y, h.floor, h.smokes),
      name: w.name,
      dist: distance(w.x, w.y, h.burglar.x, h.burglar.y),
    });
  }
  for (const lens of h.staff.lenses) {
    watchers.push({
      seen: lensSees(lens, h.burglar.x, h.burglar.y, h.elapsed, h.floor, h.smokes),
      name: lens.name,
      dist: distance(lens.x, lens.y, h.burglar.x, h.burglar.y),
    });
  }
  const wasSeen = h.suspicion.seenNow;
  const caught = stepSuspicion(h.suspicion, dt, watchers);
  if (h.suspicion.seenNow && !wasSeen) {
    h.flash = 0.7;
    if (events.spottedBy) say(h, `Spotted by ${events.spottedBy}! Break line of sight!`, 2);
  }
  if (caught) {
    h.phase = 'caught';
    h.caughtBy = h.suspicion.seenBy || 'the gallery';
    return;
  }

  // The prize: lift it by touching the pedestal.
  const p = h.floor.prize;
  if (!h.burglar.hasPrize && distance(h.burglar.x, h.burglar.y, p.x, p.y) <= p.radius + 16) {
    h.burglar.hasPrize = true;
    say(h, 'The Midnight Star is yours. Get to the south door!', 3);
  }

  // The door: carrying the prize through it ends the night in gold.
  const d = h.floor.door;
  if (
    h.burglar.hasPrize &&
    h.burglar.x >= d.x - 6 &&
    h.burglar.x <= d.x + d.w + 6 &&
    h.burglar.y >= d.y - 18
  ) {
    h.phase = 'escaped';
    h.score = scoreHeist(h);
  }
}

export function startNight(h) {
  const fresh = createHeist();
  Object.assign(h, fresh, { phase: 'playing' });
}
