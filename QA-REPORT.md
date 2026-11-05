# Overrun — Launch QA Report

Date: 2026-11-05 · Version: 1.0.1 · Result: **ready to launch**, with the open items below.

## Summary

| Area | Result |
| --- | --- |
| Automated suite (`npm test`) | 103 / 103 checks pass |
| Full-game simulations | 32 / 32 games finish with one winner (4 maps × 2, 2+neutral, 3, 6 players × random/placed troops) |
| Security | 7 / 7 hostile links blocked; 400 random corrupted links handled; script policy verified |
| Lighthouse (mobile) | Performance 100 · Accessibility 100 · Best Practices 100 · SEO 91 |
| Accessibility (axe-core) | 0 serious or critical issues on 5 screens |
| Screen sizes | 320 px to 1280 px wide: no sideways scrolling, nothing cut off |
| Lint (ESLint) | 0 errors |

## Issues found and fixed during QA

| # | Severity | Issue | Fix |
| --- | --- | --- | --- |
| 1 | Critical | A tampered game link could run its own code on whoever opened it (HTML in troop counts or the turn number) | Every link is checked field by field before use; a Content-Security-Policy blocks any injected script as a second layer |
| 2 | High | A crafted link could decompress to many megabytes and stall a phone | Size limits before and after decompression |
| 3 | Medium | Every troop tap rewrote the URL; Safari errors after ~100 rewrites in 10 seconds | Saves are batched (3 rapid taps → 1 write) and flushed when the page is hidden |
| 4 | Medium | Red and purple player names were too dim to read on the dark panels (3.0–4.0 : 1 contrast) | Brighter text colours, all ≥ 5.0 : 1 (WCAG AA) |
| 5 | Low | No site icon (browser logged a 404 on every visit); no iPhone home-screen icon | Added `icon.svg` and `apple-touch-icon.png` |
| 6 | Low | After an update, a browser could pair a cached old `game.js` with the new page | Versioned script URL (`game.js?v=…`) |
| 7 | Low | On 320 px phones the top bar squeezed the current player's name to "Ale…" | Turn number hidden on very narrow screens |
| 8 | Low | An unexpected error would leave the page silently frozen | Friendly "your game is saved in the link" message |
| 9 | Low | Link preview image was 250 KB | Re-encoded as a 76 KB JPEG |

## Performance (4× slowed CPU, roughly a mid-range phone)

| Map | Build | Each board update |
| --- | --- | --- |
| Classic Isles (28) | 19 ms | 0.6 ms |
| Grand Archipelago (42) | 28 ms | 0.7 ms |
| Star Systems (30) | 26 ms | 0.6 ms |
| Galaxy (48) | 52 ms | 1.2 ms |

Saving a game link takes about 9 ms. The longest link seen in 32 full games was 1,141 characters. Page plus code is 63 KB before compression.

## Known limitations and open items

1. **Not tested on Safari's engine (WebKit) or Firefox.** Only Chromium was available in the test environment. Most players will be on iPhones, so **play one game on a real iPhone before announcing it** (see the checklist below).
2. **The live GitHub Pages site wasn't reachable from the test environment.** Everything was tested on a local server that serves the same files.
3. **Links can still be edited to cheat** (for example, giving yourself troops). Without a server that can't be fully prevented. It's a game among friends, built on trust.
4. Lighthouse SEO is 91 only because `robots.txt` can't be placed at the root of a `github.io` project site. That doesn't affect anything, since games live in private links.

## Launch checklist (on a real phone)

- [ ] GitHub Pages is on: repo **Settings → Pages → Deploy from a branch → main → / (root)**
- [ ] https://kadencrutchfield-blip.github.io/Risk/ opens on an iPhone
- [ ] Start a 2-player game, end a turn, tap **Send**, and pick Messages
- [ ] The link preview shows the Overrun image in iMessage
- [ ] Tapping the link on a second phone opens the game on that player's turn
- [ ] The GitHub **Actions** tab shows the QA run as passing
