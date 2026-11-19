#!/usr/bin/env python3
"""Fetch football fixtures worldwide from ESPN's public scoreboard, turn bookmaker
odds into fair win probabilities, keep a running record of finished matches, and
build the app page (index.html) from template.html.

Usage: python3 fetch_matches.py [--standalone]   (run from any directory;\n--standalone writes a complete HTML document for static hosting)
Files next to this script: template.html (page), history.json (finished matches),
data.json (last payload), index.html (published page).
"""
import json
import pathlib
import sys
import urllib.request
from datetime import datetime, timedelta, timezone

HERE = pathlib.Path(__file__).resolve().parent
URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard?dates={d}&limit=1000"
HISTORY_DAYS = 60


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def american_to_decimal(v):
    if v is None:
        return None
    s = str(v).strip().upper()
    if s in ("EVEN", "EV", "PK"):
        return 2.0
    try:
        n = float(s.replace("+", ""))
    except ValueError:
        return None
    if n == 0:
        return None
    return 1 + n / 100 if n > 0 else 1 + 100 / abs(n)


def line(node, *path):
    node = node or {}
    for p in path:
        node = node.get(p) or {}
    for k in ("close", "current", "open"):
        o = (node.get(k) or {})
        if o.get("odds") not in (None, ""):
            return o
    return None


def fair(decs):
    inv = [1 / x for x in decs]
    tot = sum(inv)
    return [round(x / tot * 100, 1) for x in inv], round((tot - 1) * 100, 1)


def parse_odds(odds):
    for o in odds or []:
        if not isinstance(o, dict):
            continue
        ml = o.get("moneyline") or {}
        raw = [(line(ml, s) or {}).get("odds") for s in ("home", "draw", "away")]
        if raw[0] is None:
            raw = [(o.get("homeTeamOdds") or {}).get("moneyLine"),
                   (o.get("drawOdds") or {}).get("moneyLine"),
                   (o.get("awayTeamOdds") or {}).get("moneyLine")]
        dec = [american_to_decimal(x) for x in raw]
        if any(x is None or x <= 1 for x in dec):
            continue
        p, margin = fair(dec)
        res = {"p": p, "dec": [round(x, 2) for x in dec], "margin": margin,
               "src": (o.get("provider") or {}).get("name", "")}
        ov, un = line(o.get("total"), "over"), line(o.get("total"), "under")
        if ov and un:
            do, du = american_to_decimal(ov["odds"]), american_to_decimal(un["odds"])
            try:
                ln = float(str(ov.get("line", "")).lstrip("ou"))
            except ValueError:
                ln = o.get("overUnder")
            if do and du and do > 1 and du > 1 and ln:
                res["ou"] = {"line": ln, "pOver": fair([do, du])[0][0]}
        return res
    return None


COUNTRY = {"afc": "Asia", "aff": "Southeast Asia", "arg": "Argentina", "aus": "Australia", "aut": "Austria",
    "bel": "Belgium", "bol": "Bolivia", "bra": "Brazil", "caf": "Africa", "campeones": "International",
    "can": "Canada", "chi": "Chile", "chn": "China", "club": "International", "col": "Colombia",
    "concacaf": "North & Central America", "conmebol": "South America", "crc": "Costa Rica", "den": "Denmark",
    "ecu": "Ecuador", "eng": "England", "esp": "Spain", "fifa": "International", "fra": "France",
    "friendly": "International", "ger": "Germany", "global": "International", "gre": "Greece",
    "gua": "Guatemala", "hon": "Honduras", "ind": "India", "ita": "Italy", "jpn": "Japan",
    "ksa": "Saudi Arabia", "mex": "Mexico", "ned": "Netherlands", "nonfifa": "International", "nor": "Norway",
    "par": "Paraguay", "per": "Peru", "por": "Portugal", "rsa": "South Africa", "rus": "Russia",
    "sco": "Scotland", "slv": "El Salvador", "swe": "Sweden", "tur": "Turkey", "uefa": "Europe",
    "uru": "Uruguay", "usa": "USA", "ven": "Venezuela"}
STANDINGS = "https://site.api.espn.com/apis/v2/sports/soccer/{slug}/standings"
LEAGUES = "https://site.api.espn.com/apis/site/v2/leagues/dropdown?sport=soccer&limit=1000"


def league_slugs():
    try:
        return {l["id"]: l["slug"] for l in get(LEAGUES).get("leagues", [])}
    except Exception as e:
        print("league list failed", e, file=sys.stderr)
        return {}


def standings(slug):
    """team id -> {rank, pts, gp, of, group}"""
    out = {}
    try:
        data = get(STANDINGS.format(slug=slug))
    except Exception:
        return out
    groups = data.get("children") or ([data] if data.get("standings") else [])
    for g in groups:
        entries = (g.get("standings") or {}).get("entries") or []
        for e in entries:
            st = {x.get("name"): x.get("displayValue") for x in e.get("stats", [])}
            tid = (e.get("team") or {}).get("id")
            if tid and st.get("rank"):
                out[tid] = {"rank": st.get("rank"), "pts": st.get("points"), "gp": st.get("gamesPlayed"),
                            "of": len(entries), "group": g.get("name") if len(groups) > 1 else ""}
    return out


def scorers(comp):
    goals = []
    for d in comp.get("details") or []:
        if not d.get("scoringPlay") or d.get("shootout"):
            continue
        ath = (d.get("athletesInvolved") or [{}])[0]
        goals.append({"t": (d.get("team") or {}).get("id"), "n": ath.get("shortName") or ath.get("displayName") or "?",
                      "m": (d.get("clock") or {}).get("displayValue", ""),
                      "pk": bool(d.get("penaltyKick")), "og": bool(d.get("ownGoal"))})
    return goals


def team(c):
    t = c.get("team") or {}
    rec = next((r.get("summary") for r in c.get("records") or [] if r.get("type") == "total"), "")
    return {"id": t.get("id"), "name": t.get("displayName") or t.get("name") or "?",
            "short": t.get("shortDisplayName") or t.get("displayName") or "?",
            "abbr": t.get("abbreviation") or (t.get("displayName") or "?")[:3].upper(),
            "color": t.get("color") or "", "alt": t.get("alternateColor") or "",
            "form": c.get("form") or "", "rec": rec}


def main():
    now = datetime.now(timezone.utc)
    dates = [(now.date() + timedelta(days=k)).strftime("%Y%m%d") for k in range(-3, 3)]
    events = {}
    ok = 0
    for ds in dates:
        try:
            data = get(URL.format(d=ds))
            ok += 1
        except Exception as e:  # keep going if one day fails
            print("fetch failed", ds, e, file=sys.stderr)
            continue
        for ev in data.get("events", []):
            events[ev["id"]] = ev
    if not ok:
        sys.exit("no data fetched")

    # ESPN drops odds once a match is over, so remember the pre-match odds we saw
    cache_path = HERE / "odds_cache.json"
    try:
        cache = json.loads(cache_path.read_text())
    except Exception:
        cache = {}

    slugs = league_slugs()
    table_cache = {}
    matches = []
    for ev in events.values():
        comp = ev["competitions"][0]
        sides = {c.get("homeAway"): c for c in comp.get("competitors", [])}
        if "home" not in sides or "away" not in sides:
            continue
        odds = parse_odds(comp.get("odds"))
        if odds:
            cache[ev["id"]] = dict(odds, ts=ev["date"])
        else:
            odds = cache.get(ev["id"])
        if not odds:
            continue
        st = comp["status"]["type"]
        h, a = sides["home"], sides["away"]
        lid = ev.get("uid", "").split("~l:")[-1].split("~")[0]
        slug = slugs.get(lid, "")
        if slug and slug not in table_cache:
            table_cache[slug] = standings(slug)
        table = table_cache.get(slug, {})
        venue = comp.get("venue") or {}
        addr = venue.get("address") or {}
        winner = "home" if h.get("winner") else "away" if a.get("winner") else ("draw" if st.get("completed") else "")
        matches.append({
            "id": ev["id"],
            "ts": ev["date"],
            "league": comp.get("altGameNote") or ev.get("season", {}).get("slug", ""),
            "h": dict(team(h), pos=table.get((h.get("team") or {}).get("id"))),
            "a": dict(team(a), pos=table.get((a.get("team") or {}).get("id"))),
            "country": COUNTRY.get(slug.split(".")[0], "") if slug else "",
            "venue": ", ".join(x for x in (venue.get("fullName"), addr.get("city"), addr.get("country")) if x),
            "goals": scorers(comp),
            "p": odds["p"], "dec": odds["dec"], "margin": odds["margin"], "ou": odds.get("ou"), "src": odds["src"],
            "state": st.get("state"),
            "clock": comp["status"].get("displayClock", ""),
            "detail": st.get("shortDetail", ""),
            "score": [h.get("score"), a.get("score")] if st.get("state") != "pre" else None,
            "winner": winner,
            "url": next((l["href"] for l in ev.get("links", []) if "desktop" in l.get("rel", [])), ""),
        })

    # running record of finished matches, used for the accuracy table
    hist_path = HERE / "history.json"
    try:
        hist = json.loads(hist_path.read_text())
    except Exception:
        hist = {}
    cutoff = (now - timedelta(days=HISTORY_DAYS)).isoformat()
    for m in matches:
        if m["state"] == "post" and m["winner"]:
            hist[m["id"]] = {"ts": m["ts"], "p": m["p"], "w": m["winner"],
                             "lg": m["league"], "n": f'{m["h"]["short"]} - {m["a"]["short"]}',
                             "s": m["score"]}
    hist = {k: v for k, v in hist.items() if v["ts"] >= cutoff[:16]}
    hist_path.write_text(json.dumps(hist, ensure_ascii=False))
    cache = {k: v for k, v in cache.items() if v.get("ts", "") >= cutoff[:16]}
    cache_path.write_text(json.dumps(cache, ensure_ascii=False))

    # the page shows yesterday .. day after tomorrow (viewer's own time zone)
    lo = (now - timedelta(days=2)).isoformat()[:16]
    matches = [m for m in matches if m["ts"] >= lo]
    matches.sort(key=lambda m: m["ts"])
    payload = {"generated": now.isoformat(timespec="minutes"), "matches": matches,
               "history": [[v["ts"], v["p"], v["w"]] for v in hist.values()]}
    (HERE / "data.json").write_text(json.dumps(payload, ensure_ascii=False))
    tpl = (HERE / "template.html").read_text()
    html = tpl.replace("/*__DATA__*/null", json.dumps(payload, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/"))
    if "--standalone" in sys.argv:  # full HTML document, e.g. for GitHub Pages
        html = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
                '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
                '<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>\n'
                + html + '\n</body></html>\n')
    (HERE / "index.html").write_text(html)
    print(f"{len(matches)} matches, {len(hist)} in history, generated {payload['generated']}")


if __name__ == "__main__":
    main()
