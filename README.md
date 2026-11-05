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

Everything lives in `index.html`. Open it in a browser to play locally.
