// Midnight Vault — every tunable number lives here, so balancing the
// heist never means hunting through the simulation code.

export const VIEW = { w: 1280, h: 960 };
export const HUD_H = 64;

// Playable floor: the hall inside the outer walls.
export const FLOOR = { x: 24, y: 88, w: 1232, h: 856 };

export const BURGLAR = {
  radius: 14,
  walkSpeed: 168,
  clickSpeed: 168,
};

export const WARDEN = {
  radius: 15,
  patrolSpeed: 64,
  chaseSpeed: 98,
  investigateSpeed: 84,
  viewRange: 305,
  viewHalfAngle: (32 * Math.PI) / 180,
  loseSightAfter: 2.5,
  investigateTime: 2.2,
};

export const LENS = {
  range: 395,
  halfAngle: (26 * Math.PI) / 180,
  sweepHalf: (55 * Math.PI) / 180,
  sweepPeriod: 5.2,
  disabledSeconds: 12,
};

export const GADGETS = {
  smokeCount: 2,
  smokeRadius: 112,
  smokeSeconds: 6,
  coinCount: 3,
  coinRange: 330,
  coinLureRadius: 285,
  hackCount: 2,
  hackRange: 430,
};

export const SUSPICION = {
  risePerSecond: 52,
  riseClosePerSecond: 74,
  closeDistance: 130,
  fallPerSecond: 13,
  caughtAt: 100,
};

export const PRIZE = { x: 1150, y: 208, radius: 26 };
export const DOOR = { x: 600, y: 930, w: 80, h: 22 };
export const START = { x: 640, y: 886 };

export const PALETTE = {
  floorA: '#171a2c',
  floorB: '#131627',
  floorLine: '#1e2238',
  wall: '#2c3049',
  wallEdge: '#4d5478',
  gold: '#e8b64c',
  goldDim: '#8a6d2f',
  caseGlass: '#274b63',
  caseEdge: '#3f7ea6',
  vaultFloor: '#241d33',
  doorGreen: '#37c978',
  doorGlow: '#1d7a48',
  thief: '#1c1a24',
  thiefTrim: '#e8b64c',
  warden: '#3a2b2b',
  wardenTrim: '#c94f4f',
  coneGuard: 'rgba(224, 84, 84, 0.16)',
  coneGuardEdge: 'rgba(224, 84, 84, 0.45)',
  coneLens: 'rgba(232, 182, 76, 0.15)',
  coneLensEdge: 'rgba(232, 182, 76, 0.5)',
  smoke: 'rgba(178, 182, 196, 0.55)',
  alarmLow: '#37c978',
  alarmMid: '#e8b64c',
  alarmHigh: '#e05252',
  text: '#e8e2d2',
  textDim: '#9a94a8',
};
