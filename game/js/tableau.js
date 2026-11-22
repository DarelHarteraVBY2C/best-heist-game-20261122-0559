// Midnight Vault — the four staged scenes the screenshots are taken
// from. Each one poses the same live game in a fixed, readable moment:
// no animation runs while a shot is staged, so the frame is exact.

function poseWarden(w, x, y, facing, mode = 'patrol') {
  w.x = x;
  w.y = y;
  w.facing = facing;
  w.mode = mode;
  w.chaseTarget = null;
  w.unseenFor = 0;
}

function poseLens(lens, angle, disabledUntil = 0) {
  lens.angle = angle;
  lens.disabledUntil = disabledUntil;
}

export function applyScene(h, name) {
  const [vera, dmitri, sofia] = h.staff.wardens;
  const [north, vault] = h.staff.lenses;
  h.message = '';
  h.messageUntil = 0;
  h.flash = 0;

  if (name === 'heist') {
    // The cover: Rook mid-crossing, cones everywhere, the Star still in
    // the vault, the alarm partway up.
    h.phase = 'playing';
    h.elapsed = 96;
    h.burglar.x = 470;
    h.burglar.y = 600;
    h.burglar.facing = Math.PI / 4;
    h.suspicion.value = 42;
    h.suspicion.seenNow = true;
    h.suspicion.seenBy = 'Dmitri';
    poseWarden(vera, 200, 520, 0);
    poseWarden(dmitri, 610, 470, Math.PI * 0.75);
    poseWarden(sofia, 1060, 470, -Math.PI / 2);
    poseLens(north, Math.PI / 2 + 0.5);
    poseLens(vault, Math.PI - 0.4);
    h.smokes = [{ x: 380, y: 660, r: 112, until: 9999 }];
    h.coins = [{ x: 560, y: 700, until: 0 }];
  } else if (name === 'escape') {
    // The getaway: prize in hand, the south door in sight, Dmitri
    // closing in and the alarm high.
    h.phase = 'playing';
    h.elapsed = 214;
    h.burglar.x = 640;
    h.burglar.y = 780;
    h.burglar.facing = Math.PI / 2;
    h.burglar.hasPrize = true;
    h.suspicion.value = 68;
    h.suspicion.seenNow = true;
    h.suspicion.seenBy = 'Dmitri';
    poseWarden(vera, 200, 300, Math.PI / 2);
    poseWarden(dmitri, 640, 640, Math.PI / 2, 'chase');
    dmitri.chaseTarget = { x: 640, y: 780 };
    poseWarden(sofia, 1120, 560, Math.PI);
    poseLens(north, Math.PI / 2 - 0.6);
    poseLens(vault, Math.PI + 0.3);
    h.smokes = [];
    h.coins = [];
  } else if (name === 'caught') {
    // The end of the night: alarm at 100, Vera standing over Rook.
    h.phase = 'caught';
    h.elapsed = 151;
    h.burglar.x = 500;
    h.burglar.y = 520;
    h.burglar.facing = Math.PI;
    h.suspicion.value = 100;
    h.suspicion.seenNow = true;
    h.suspicion.seenBy = 'Vera';
    h.caughtBy = 'Vera';
    poseWarden(vera, 540, 520, Math.PI, 'chase');
    vera.chaseTarget = { x: 500, y: 520 };
    poseWarden(dmitri, 700, 470, Math.PI);
    poseWarden(sofia, 1060, 430, -Math.PI / 2);
    poseLens(north, Math.PI / 2 + 0.2);
    poseLens(vault, Math.PI - 0.2);
    h.smokes = [];
    h.coins = [];
  } else {
    // 'title' and anything unknown: the title screen over the hall.
    h.phase = 'title';
    h.elapsed = 0;
    h.suspicion.value = 0;
    h.suspicion.seenNow = false;
    poseWarden(vera, 200, 300, Math.PI / 2);
    poseWarden(dmitri, 560, 470, 0);
    poseWarden(sofia, 1060, 500, Math.PI / 2);
    poseLens(north, Math.PI / 2 - 0.3);
    poseLens(vault, Math.PI + 0.35);
    h.smokes = [];
    h.coins = [];
  }
}
