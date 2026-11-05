# Overrun ⚔️

A turn-based conquest game you play with friends **over text**, the way you'd play an iMessage game.

**Play:** https://kadencrutchfield-blip.github.io/Risk/

## How it works

- One person opens the link, enters 2–6 player names, and taps **Start game**.
- On your turn: **reinforce → attack → fortify**, then tap **End turn & send**.
- The share sheet opens. Send the link to your group chat or the next player.
- The next player taps the link and takes their turn. Keep going until one player owns the whole map.

The whole game state is stored in the link itself, so you don't need a server, accounts, or an app install. Dice rolls come from a seed stored in the link, so reopening an old link replays the same rolls instead of giving you a fresh chance.

## Rules in brief

- **Reinforcements:** territories ÷ 3 (minimum 3), plus region bonuses, plus card sets.
- **Battles:** the attacker rolls up to 3 dice and the defender up to 2. The highest dice are compared in pairs, and ties go to the defender.
- **Cards:** conquer at least one territory in a turn to earn a card. Trade in 3 of a kind or one of each for 4, 6, 8, 10, 12, 15, then +5 troops for each set after that.
- **Regions:** Frostmark +2, Highreach +3, Heartland +3, Sunscar +2, Emerald Isles +2, Ashlands +3.

## Development

Everything lives in `index.html`. Open it in a browser to play locally.
