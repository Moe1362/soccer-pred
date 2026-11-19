# SOCCER Pred

Every football match worldwide that has bookmaker odds, ranked by the favorite's win probability.

- **Data:** ESPN's public scoreboard (odds usually from DraftKings).
- **Probabilities:** 1X2 decimal odds are inverted and the bookmaker margin is removed proportionally, so home + draw + away = 100%.
- **Extras:** "not to lose" (win or draw), the favorite's decimal odds, over/under goals line, last-5 form, league-table position and points, country and venue, goalscorers for live and finished matches, and a running accuracy table.
- **Hero video:** an original, code-rendered night-match scene (floodlights, crowd, a curling shot into the net) with a pause button.
- **Accounts & favorites:** sign up, sign in and log out, then star any match to keep it in a Favorites tab. In the Claude-hosted app the account is tied to the viewer's Claude sign-in and favorites sync across devices. This static copy has no account server, so profiles and favorites are stored in the browser.
- **Times:** US Pacific (PT).

These are estimates, not guarantees. An 80% favorite still fails to win about one match in five.

## How it runs

`.github/workflows/update.yml` runs `fetch_matches.py` twice a day (and on demand from the Actions tab). The script:

1. downloads fixtures and odds for the next few days,
2. remembers pre-match odds in `odds_cache.json` (ESPN removes odds once a match ends),
3. records finished matches in `history.json` for the accuracy table,
4. builds `index.html` from `template.html` with the data embedded.

The site is served by GitHub Pages from `index.html` on the `main` branch.

## Run locally

```bash
python3 fetch_matches.py   # needs only the Python standard library
open index.html
```
