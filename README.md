# Overrun ⚔️

A turn-based conquest game you play with friends **over text**, the way you'd play an iMessage game.

**Play:** https://kadencrutchfield-blip.github.io/Risk/

## How it works

- One person opens the link, enters 2–6 player names, picks the options, and taps **Start game**.
- On your turn: **reinforce → attack → fortify**, then tap **End turn & send**.
- The share sheet opens. Send the link to your group chat or the next player.
- The next player taps the link and takes their turn. Keep going until only one player is left standing.

The whole game state is stored in the link itself, so you don't need a server, accounts, or an app install. Dice rolls come from a seed stored in the link, so reopening an old link replays the same rolls instead of giving you a fresh chance.

## Game options

- **Map:** Classic Isles (28 territories, 6 regions), Grand Archipelago (42 territories, 8 regions), Star Systems (30 planets in 6 star systems), or Galaxy (48 planets in 8 star systems, with two wormholes). On the space map you can only fly along the dotted routes. A black hole, asteroid belts, a nebula and an ion storm block some paths, so you have to go around them, and a wormhole links two far-apart planets.
- **Starting troops:** scattered at random, or *place them yourselves*, where each player's first turn is a setup turn for placing their starting troops.
- **Neutral army (2 players):** a gray army holds a third of the map and never attacks. You win by knocking out your opponent; the neutral army doesn't have to be wiped out.

Tap 🔍 in the top bar to zoom the map in and scroll around it. Tap ↩ to fit it back on screen.

## Rules in brief

- **Reinforcements:** territories ÷ 3 (minimum 3), plus region bonuses, plus card sets.
- **Battles:** the attacker rolls up to 3 dice and the defender up to 2. The highest dice are compared in pairs, and ties go to the defender.
- **Cards:** conquer at least one territory in a turn to earn a card. Trade in 3 of a kind or one of each for 4, 6, 8, 10, 12, 15, then +5 troops for each set after that.
- **Regions:** hold a whole region at the start of your turn for bonus troops (see the in-game menu).
- **Winning:** be the last player standing.

## Development

The page is `index.html` and the game code is `game.js`. Open `index.html` in a browser to play locally.

## Testing

`tests/qa.js` is the QA suite. It serves the game locally and drives it in headless Chromium:

```
npm install
npx playwright install chromium
npm test                     # everything (about a minute)
node tests/qa.js rules ui    # just some suites
```

| Suite | What it checks |
| --- | --- |
| `rules` | Card values, card sets, income, fair and repeatable dice, fortify paths, all 4 maps' connections, setup for every player count and option |
| `sim` | Computer players finish 32 full games across every map, player count and option, checking the game state after every move and sending the link back and forth |
| `ui` | A real tap-through: setup, placement round, undo, attack, capture, fortify, sending the link, menus, zoom |
| `security` | Tampered links, oversized links, a decompression bomb, 400 random corrupted links, the script security policy |
| `layout` | 320 px phones up to laptops: no sideways scrolling, nothing cut off, buttons big enough to tap |
| `a11y` | axe-core accessibility scan of every screen |
| `perf` | Load time, file sizes, map speed on a slowed-down CPU |

GitHub Actions runs the full suite on every push (`.github/workflows/qa.yml`).

## Releasing a change

1. Run `npm test`.
2. If `game.js` changed, bump the `?v=` number on its `<script>` tag in `index.html`, so browsers don't mix a cached old `game.js` with a new page.
3. Push to `main`. GitHub Pages redeploys within a minute or two.

## Security notes

- A game link can be edited by anyone who has it. Before the game uses a link, `validState()` in `game.js` checks every field for the right type and range, and rejects anything else as a broken link.
- Links are size-capped before and after decompression, so an oversized link can't hog memory.
- The page's Content-Security-Policy only allows scripts from `game.js`. Injected or inline scripts won't run even if something gets past the link check.
- The game state lives in the part of the URL after `#`, which browsers never send to the server. GitHub Pages never sees anyone's game.
- Without a server, cheating can't be fully prevented. Someone could still edit a link to give themselves troops; this is a game among friends, built on trust.
