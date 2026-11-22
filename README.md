# Midnight Vault

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![make.fun rank](https://make.fun/badge/best-heist-game-20261122-0559/DarelHarteraVBY2C/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![make.fun reward](https://make.fun/badge/best-heist-game-20261122-0559/DarelHarteraVBY2C/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A complete heist game for the [make.fun best heist game bounty](https://make.fun/bounty/best-heist-game-20261122-0559): cross the Obsidian Gallery, lift the Midnight Star diamond from its vault, and slip out the south door before the guards or the cameras push the alarm to 100%.

## How to play

Open `game/index.html` in a desktop browser (or run `node serve.ts` and open http://localhost:8080). No network, no build step, no libraries.

- **WASD / arrow keys** — move Rook the burglar. **Click** — walk toward that spot.
- **Q** — smoke bomb (2): a cloud that blinds every guard and camera.
- **E** — coin lure (3): toss a coin at the click; the nearest guard walks over to look.
- **F** — hack (2): shut the nearest camera down for 12 seconds.
- **P / Esc** — pause. **Space / click** — start and restart. **M** — mute.

Three guards patrol the hall with vision cones — Vera in the west wing, Dmitri across the central hall, Sofia circling the vault door — and two cameras sweep theirs. The alarm climbs while anyone sees you and falls while you stay hidden. At 100% you are caught. Grab the diamond, then reach the green exit door for a clean getaway — the faster you are and the more gadgets you have left, the higher the score.

Three lanes cross the hall: the west wing past the crates, the middle hall around the statue and the display cases, and the east passage under the vault camera. Read the cones before you move.

## Layout

- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `game/index.html` — the page; `game/css/vault.css` — the page chrome.
- `game/js/settings.js` — every tunable number (speeds, ranges, alarm rates, colours).
- `game/js/museum.js` — the Obsidian Gallery floor plan and geometry (solids, sight lines).
- `game/js/wardens.js` — guard patrols, chases and coin investigations, camera sweeps, spotting.
- `game/js/catburglar.js` — Rook: movement, wall sliding, and the three gadgets.
- `game/js/suspicion.js` — the alarm meter.
- `game/js/heist.js` — the world state and the one step that moves it; win and lose rules.
- `game/js/canvas.js` — everything painted on the canvas, HUD included.
- `game/js/keys.js` — keyboard and mouse.
- `game/js/chimes.js` — synthesized WebAudio cues, no audio files.
- `game/js/tableau.js` — the four deterministic screenshot scenes (`?shot=...`).
- `game/js/boot.js` — wiring, the fixed-step loop, and the five screens.
- `screenshots/` — four real renders of the game's own code (the cover first).
- `shots.json` — the shot list the screenshots were taken from.

## Screenshots

The cover (`1-heist.jpg`) shows the whole game in one frame: Rook crossing the room, guards with vision cones, cameras, the Midnight Star in its vault, and the alarm meter partway up. The others show the title screen, the getaway run with the loot secured, and the caught screen.

## License

MIT. See `LICENSE`.
