// Midnight Vault — boot: wire the canvas, the input and the sound to
// the heist, run the fixed-step loop, and stage screenshot scenes when
// the page is opened with ?shot=<name>.

import { VIEW } from './settings.js';
import { createHeist, stepHeist, startNight } from './heist.js';
import { drawHeist } from './canvas.js';
import { makeInput, takePressed, clearPressed } from './keys.js';
import { makeChimes } from './chimes.js';
import { applyScene } from './tableau.js';

const canvas = document.getElementById('vaultCanvas');
const ctx = canvas.getContext('2d');
const heist = createHeist();
const input = makeInput(canvas);
const chimes = makeChimes();

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

function coinAimPoint() {
  if (input.click) return input.click;
  const b = heist.burglar;
  return { x: b.x + Math.cos(b.facing) * 220, y: b.y + Math.sin(b.facing) * 220 };
}

function beginNight() {
  chimes.unlock();
  startNight(heist);
}

function handlePressed() {
  // Space / click starts (or restarts) from the menu screens.
  if (takePressed(input, 'Space')) {
    if (heist.phase === 'title' || heist.phase === 'caught' || heist.phase === 'escaped') {
      beginNight();
      return;
    }
    if (heist.phase === 'paused') heist.phase = 'playing';
  }
  if (takePressed(input, 'KeyP') || takePressed(input, 'Escape')) {
    if (heist.phase === 'playing') heist.phase = 'paused';
    else if (heist.phase === 'paused') heist.phase = 'playing';
  }
  if (takePressed(input, 'KeyM')) chimes.toggleMute();
  if (heist.phase !== 'playing') return;
  if (takePressed(input, 'KeyQ')) {
    heist.gadget = 'smoke';
    chimes.smoke();
  }
  if (takePressed(input, 'KeyE')) {
    heist.gadget = 'coin';
    heist.coinAt = coinAimPoint();
    chimes.coin();
  }
  if (takePressed(input, 'KeyF')) {
    heist.gadget = 'hack';
    chimes.hack();
  }
}

function handleClick() {
  if (!input.click) return;
  const at = input.click;
  input.click = null;
  chimes.unlock();
  if (heist.phase === 'title' || heist.phase === 'caught' || heist.phase === 'escaped') {
    beginNight();
    return;
  }
  if (heist.phase === 'playing') heist.burglar.clickTarget = at;
}

let last = performance.now();
let hadPrize = false;
let wasSeen = false;

function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  handlePressed();
  handleClick();

  const tick = { keys: input.keys, click: null, gadget: heist.gadget || null, coinAt: heist.coinAt || null };
  heist.gadget = null;
  heist.coinAt = null;
  const phaseBefore = heist.phase;
  stepHeist(heist, tick, dt);
  if (heist.burglar.hasPrize && !hadPrize) chimes.pickup();
  hadPrize = heist.burglar.hasPrize;
  if (heist.suspicion.seenNow && !wasSeen) chimes.spotted();
  wasSeen = heist.suspicion.seenNow;
  if (heist.phase !== phaseBefore) {
    if (heist.phase === 'caught') chimes.caught();
    if (heist.phase === 'escaped') chimes.escaped();
  }
  clearPressed(input);
  drawHeist(ctx, heist, now / 1000);
  requestAnimationFrame(frame);
}

if (shot) {
  // Staged scene: pose once, paint once, and tell the screenshot
  // helper the frame is ready. No loop runs, so nothing moves.
  // Show the canvas at its true 1280x960, without the page chrome.
  canvas.style.maxWidth = 'none';
  canvas.style.maxHeight = 'none';
  canvas.style.width = '1280px';
  canvas.style.height = '960px';
  const hint = document.querySelector('.hint');
  if (hint) hint.style.display = 'none';
  applyScene(heist, shot);
  drawHeist(ctx, heist, 1.6);
  window.__shotReady = true;
} else {
  drawHeist(ctx, heist, 0);
  requestAnimationFrame(frame);
}
