// Midnight Vault — everything painted: the gallery floor, the vault,
// the cones of sight, the burglar, the HUD, and the title/caught/
// escaped screens. Pure drawing from state; no game rules here.

import { VIEW, HUD_H, PALETTE, WARDEN, LENS } from './settings.js';
import { alarmColor } from './suspicion.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCone(ctx, x, y, angle, half, range, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawFloor(ctx, h) {
  const f = h.floor.bounds;
  ctx.fillStyle = PALETTE.floorA;
  ctx.fillRect(0, HUD_H, VIEW.w, VIEW.h - HUD_H);
  // Checker tiles.
  ctx.fillStyle = PALETTE.floorB;
  const tile = 64;
  for (let y = f.y; y < f.y + f.h; y += tile) {
    for (let x = f.x; x < f.x + f.w; x += tile) {
      if (((x - f.x) / tile + (y - f.y) / tile) % 2 === 0) {
        ctx.fillRect(x, y, Math.min(tile, f.x + f.w - x), Math.min(tile, f.y + f.h - y));
      }
    }
  }
  // Vault room floor, a shade richer.
  const v = h.floor.vault;
  ctx.fillStyle = PALETTE.vaultFloor;
  ctx.fillRect(v.x, v.y, v.w, v.h);
  ctx.strokeStyle = PALETTE.goldDim;
  ctx.lineWidth = 2;
  ctx.strokeRect(v.x, v.y, v.w, v.h);
  ctx.fillStyle = PALETTE.goldDim;
  ctx.font = '600 13px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('V A U L T', v.x + v.w / 2, v.y + v.h - 12);

  // Walls and solids.
  for (const s of h.floor.solids) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.strokeStyle = PALETTE.wallEdge;
    ctx.lineWidth = 1;
    ctx.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, s.h - 1);
  }
  // Display cases read as glass: a lighter inset.
  for (const c of h.floor.cases) {
    ctx.fillStyle = PALETTE.caseGlass;
    ctx.fillRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8);
    ctx.strokeStyle = PALETTE.caseEdge;
    ctx.strokeRect(c.x + 4.5, c.y + 4.5, c.w - 9, c.h - 9);
  }
  // The statue.
  const st = h.floor.statue;
  ctx.fillStyle = '#6d6a80';
  ctx.beginPath();
  ctx.arc(st.x + st.w / 2, st.y + st.h / 2, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#9a94a8';
  ctx.stroke();
}

function drawDoor(ctx, h) {
  const d = h.floor.door;
  ctx.fillStyle = PALETTE.doorGreen;
  ctx.fillRect(d.x, d.y, d.w, d.h);
  ctx.fillStyle = 'rgba(55, 201, 120, 0.25)';
  ctx.fillRect(d.x - 8, d.y - 26, d.w + 16, 26);
  ctx.fillStyle = '#0d3d22';
  ctx.font = '700 13px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', d.x + d.w / 2, d.y + 16);
}

function drawPrize(ctx, h, now) {
  const p = h.floor.prize;
  if (h.burglar.hasPrize) return;
  const pulse = 0.6 + 0.4 * Math.sin(now * 3);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(Math.sin(now * 1.2) * 0.15);
  ctx.fillStyle = `rgba(232, 182, 76, ${0.25 + 0.35 * pulse})`;
  ctx.beginPath();
  ctx.arc(0, 0, 34 + 6 * pulse, 0, Math.PI * 2);
  ctx.fill();
  // The Midnight Star: a cut diamond.
  ctx.fillStyle = '#bfe9ff';
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(16, -4);
  ctx.lineTo(0, 18);
  ctx.lineTo(-16, -4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e8fbff';
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(10, -4);
  ctx.lineTo(0, -4);
  ctx.lineTo(-10, -4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '600 12px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MIDNIGHT STAR', p.x, p.y + 44);
}

function drawLens(ctx, lens, now) {
  const disabled = now < lens.disabledUntil;
  drawCone(
    ctx, lens.x, lens.y, lens.angle, LENS.halfAngle, lens.range,
    disabled ? 'rgba(120, 120, 120, 0.06)' : PALETTE.coneLens,
    disabled ? 'rgba(120, 120, 120, 0.25)' : PALETTE.coneLensEdge,
  );
  ctx.fillStyle = disabled ? '#55555f' : '#e8b64c';
  ctx.beginPath();
  ctx.arc(lens.x, lens.y, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0d0e1a';
  ctx.beginPath();
  ctx.arc(lens.x, lens.y, 4, 0, Math.PI * 2);
  ctx.fill();
  if (disabled) {
    ctx.fillStyle = '#9a94a8';
    ctx.font = '700 11px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OFF', lens.x, lens.y - 16);
  }
}

function drawWarden(ctx, w) {
  drawCone(
    ctx, w.x, w.y, w.facing, WARDEN.viewHalfAngle, WARDEN.viewRange,
    w.mode === 'chase' ? 'rgba(224, 84, 84, 0.28)' : PALETTE.coneGuard,
    w.mode === 'chase' ? 'rgba(224, 84, 84, 0.7)' : PALETTE.coneGuardEdge,
  );
  // Body: a dark uniform with a red shoulder flash.
  ctx.fillStyle = PALETTE.warden;
  ctx.beginPath();
  ctx.arc(w.x, w.y, WARDEN.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.wardenTrim;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#e8e2d2';
  ctx.beginPath();
  ctx.arc(w.x + Math.cos(w.facing) * 6, w.y + Math.sin(w.facing) * 6, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.text;
  ctx.font = '600 11px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(w.name.toUpperCase(), w.x, w.y - WARDEN.radius - 8);
  if (w.mode === 'chase') {
    ctx.fillStyle = '#e05252';
    ctx.font = '700 12px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('!', w.x, w.y - WARDEN.radius - 22);
  }
}

function drawBurglar(ctx, b, now) {
  // Click target marker.
  if (b.clickTarget) {
    ctx.strokeStyle = 'rgba(232, 182, 76, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(b.clickTarget.x, b.clickTarget.y, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(b.clickTarget.x - 12, b.clickTarget.y);
    ctx.lineTo(b.clickTarget.x + 12, b.clickTarget.y);
    ctx.moveTo(b.clickTarget.x, b.clickTarget.y - 12);
    ctx.lineTo(b.clickTarget.x, b.clickTarget.y + 12);
    ctx.stroke();
  }
  const bob = b.moving ? Math.sin(now * 14) * 1.5 : 0;
  ctx.save();
  ctx.translate(b.x, b.y + bob);
  ctx.rotate(b.facing);
  // Cloak: a dark teardrop pointing where Rook walks.
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.arc(0, 0, 14, 0.6, Math.PI * 2 - 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PALETTE.thiefTrim;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#e8e2d2';
  ctx.beginPath();
  ctx.arc(7, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (b.hasPrize) {
    ctx.fillStyle = '#bfe9ff';
    ctx.beginPath();
    ctx.arc(b.x, b.y - 20, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEffects(ctx, h) {
  for (const s of h.smokes) {
    ctx.fillStyle = PALETTE.smoke;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(220, 224, 236, 0.35)';
    ctx.beginPath();
    ctx.arc(s.x - 28, s.y + 18, s.r * 0.45, 0, Math.PI * 2);
    ctx.arc(s.x + 30, s.y - 14, s.r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const c of h.coins) {
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(232, 182, 76, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 12, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawHud(ctx, h) {
  ctx.fillStyle = '#0a0b16';
  ctx.fillRect(0, 0, VIEW.w, HUD_H);
  ctx.strokeStyle = '#2c3049';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, HUD_H + 0.5);
  ctx.lineTo(VIEW.w, HUD_H + 0.5);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '700 22px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('MIDNIGHT VAULT', 24, 28);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '12px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('the Obsidian Gallery — one night, one diamond', 24, 48);

  // Alarm meter.
  const ax = 470;
  const aw = 340;
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '700 12px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('ALARM', ax, 20);
  ctx.fillStyle = '#1a1d30';
  roundRect(ctx, ax, 26, aw, 18, 4);
  ctx.fill();
  const v = h.suspicion.value / 100;
  ctx.fillStyle = alarmColor(h.suspicion.value);
  if (v > 0) {
    roundRect(ctx, ax, 26, Math.max(8, aw * v), 18, 4);
    ctx.fill();
  }
  ctx.strokeStyle = '#3a3348';
  roundRect(ctx, ax, 26, aw, 18, 4);
  ctx.stroke();
  ctx.fillStyle = h.suspicion.seenNow ? '#e05252' : PALETTE.textDim;
  ctx.font = '700 13px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(`${Math.floor(h.suspicion.value)}%`, ax + aw + 12, 41);
  if (h.suspicion.seenNow) {
    // Under the bar, so it never collides with the gadget counts.
    ctx.fillStyle = '#e05252';
    ctx.font = '700 12px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(`SEEN — ${h.suspicion.seenBy}`, ax, 59);
  }

  // Gadgets.
  const gadgets = [
    ['Q', 'SMOKE', h.burglar.smokeLeft],
    ['E', 'COIN', h.burglar.coinsLeft],
    ['F', 'HACK', h.burglar.hacksLeft],
  ];
  let gx = 900;
  ctx.textAlign = 'left';
  for (const [key, label, left] of gadgets) {
    ctx.fillStyle = left > 0 ? PALETTE.text : '#55555f';
    ctx.font = '700 14px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(`${key} ${label} ×${left}`, gx, 30);
    gx += 104;
  }
  // Timer + objective.
  const mm = String(Math.floor(h.elapsed / 60)).padStart(2, '0');
  const ss = String(Math.floor(h.elapsed % 60)).padStart(2, '0');
  ctx.fillStyle = PALETTE.text;
  ctx.font = '700 15px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${mm}:${ss}`, VIEW.w - 24, 30);
  ctx.fillStyle = h.burglar.hasPrize ? PALETTE.doorGreen : PALETTE.gold;
  ctx.font = '12px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(
    h.burglar.hasPrize ? '★ Prize secured — reach the EXIT' : '◇ Steal the Midnight Star',
    VIEW.w - 24, 50,
  );

  // Transient message.
  if (h.elapsed < h.messageUntil && h.message) {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(10, 11, 22, 0.82)';
    const mw = ctx.measureText(h.message).width + 32;
    roundRect(ctx, VIEW.w / 2 - mw / 2, HUD_H + 12, mw, 30, 6);
    ctx.fill();
    ctx.fillStyle = PALETTE.text;
    ctx.font = '600 14px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(h.message, VIEW.w / 2, HUD_H + 32);
  }
}

function overlay(ctx, title, titleColor, lines, foot) {
  ctx.fillStyle = 'rgba(5, 6, 14, 0.78)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.textAlign = 'center';
  ctx.fillStyle = titleColor;
  ctx.font = '700 54px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(title, VIEW.w / 2, 330);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '17px "Segoe UI", system-ui, sans-serif';
  let y = 380;
  for (const line of lines) {
    ctx.fillText(line, VIEW.w / 2, y);
    y += 30;
  }
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '600 15px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(foot, VIEW.w / 2, y + 26);
}

export function drawHeist(ctx, h, now) {
  drawFloor(ctx, h);
  drawDoor(ctx, h);
  drawPrize(ctx, h, now);
  for (const lens of h.staff.lenses) drawLens(ctx, lens, now);
  for (const w of h.staff.wardens) drawWarden(ctx, w);
  drawBurglar(ctx, h.burglar, now);
  drawEffects(ctx, h);
  drawHud(ctx, h);

  // Spotted flash: a red edge closing in.
  if (h.flash > 0) {
    ctx.strokeStyle = `rgba(224, 82, 82, ${Math.min(0.85, h.flash)})`;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, VIEW.w - 10, VIEW.h - 10);
  }

  if (h.phase === 'title') {
    overlay(ctx, 'MIDNIGHT VAULT', PALETTE.gold, [
      'One diamond. Three guards. Two cameras. One way out.',
      'Cross the Obsidian Gallery, lift the Midnight Star,',
      'and slip through the south door before the alarm hits 100%.',
      '',
      'WASD / arrows or click to move  •  Q smoke  •  E coin lure  •  F hack a camera',
    ], 'Click or press Space to begin the night');
  } else if (h.phase === 'paused') {
    overlay(ctx, 'PAUSED', PALETTE.text, [
      'The gallery holds its breath.',
    ], 'Press P or Space to keep moving');
  } else if (h.phase === 'caught') {
    overlay(ctx, 'CAUGHT!', '#e05252', [
      `The alarm hit 100% — ${h.caughtBy || 'the gallery'} raised it.`,
      'The vault seals. The night ends in handcuffs.',
    ], 'Press Space to try again');
  } else if (h.phase === 'escaped') {
    overlay(ctx, 'CLEAN GETAWAY', PALETTE.doorGreen, [
      `The Midnight Star is gone, and so are you. Score: ${h.score}`,
      `Time: ${Math.floor(h.elapsed / 60)}:${String(Math.floor(h.elapsed % 60)).padStart(2, '0')}  •  Alarm peaked at ${Math.floor(h.suspicion.value)}%`,
    ], 'Press Space to run it back');
  }
}
