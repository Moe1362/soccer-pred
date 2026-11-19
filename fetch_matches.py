#!/usr/bin/env python3
"""Fetch football fixtures worldwide from ESPN's public scoreboard, turn bookmaker
odds into fair win probabilities, keep a running record of finished matches, and
build the app page (index.html) from template.html.

Usage: python3 fetch_matches.py [--standalone]   (run from any directory;\n--standalone writes a complete HTML document for static hosting)
Files next to this script: template.html (page), history.json (finished matches),
data.json (last payload), index.html (published page).
"""
import json
import math
import pathlib
import time
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
                            "of": len(entries), "group": g.get("name") if len(groups) > 1 else "",
                            "gf": st.get("pointsFor"), "ga": st.get("pointsAgainst")}
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


MESSI = "https://site.api.espn.com/apis/common/v3/sports/soccer/athletes/45843"


def messi():
    """Season summary and last matches for Lionel Messi (ESPN athlete 45843)."""
    try:
        a = get(MESSI)["athlete"]
        gl = get(MESSI + "/gamelog")
    except Exception as e:
        print("messi fetch failed", e, file=sys.stderr)
        return None
    summ = a.get("statsSummary") or {}
    stats = {x.get("name"): x.get("displayValue") for x in summ.get("statistics", [])}
    names = gl.get("names") or []
    per = {}
    for stype in gl.get("seasonTypes", []):
        for cat in stype.get("categories", []):
            for ev in cat.get("events", []):
                per[ev["eventId"]] = dict(zip(names, ev.get("stats", [])))
    games = []
    for eid, ev in (gl.get("events") or {}).items():
        st = per.get(eid, {})
        games.append({"date": ev.get("gameDate", ""), "opp": (ev.get("opponent") or {}).get("displayName", ""),
                      "oppAbbr": (ev.get("opponent") or {}).get("abbreviation", ""), "at": ev.get("atVs", ""),
                      "score": ev.get("score", ""), "res": ev.get("gameResult", ""), "lg": ev.get("leagueShortName", ""),
                      "g": int(st.get("totalGoals") or 0), "a": int(st.get("goalAssists") or 0),
                      "sh": int(st.get("totalShots") or 0)})
    games.sort(key=lambda g: g["date"], reverse=True)
    team = a.get("team") or {}
    return {"name": a.get("displayName"), "team": team.get("displayName"), "teamId": team.get("id"),
            "jersey": a.get("jersey"), "pos": (a.get("position") or {}).get("displayName"), "age": a.get("age"),
            "season": summ.get("displayName", ""), "apps": stats.get("starts-subIns", ""),
            "goals": stats.get("totalGoals", ""), "assists": stats.get("goalAssists", ""),
            "shots": stats.get("totalShots", ""), "games": games[:8],
            "seasonGoals": sum(g["g"] for g in games), "seasonAssists": sum(g["a"] for g in games), "seasonGames": len(games)}


# ---------- model estimate for matches without bookmaker odds ----------
HOME_ADV = 1.12   # home sides score about 12% more, away sides about 12% less


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def model_probs(table, hid, aid):
    """1X2 + over/under from a Poisson model built on each team's goals for/against per game,
    shrunk toward the league average (5 virtual average games), with home advantage."""
    rows = [r for r in table.values() if _num(r.get("gp"))]
    th, ta = table.get(hid), table.get(aid)
    if not th or not ta or len(rows) < 4:
        return None
    games = sum(_num(r["gp"]) for r in rows)
    goals = sum(_num(r.get("gf")) or 0 for r in rows)
    if games < 8 or goals <= 0:
        return None
    mu = goals / games                                  # goals per team per game
    def rating(r, key):
        gp, g = _num(r.get("gp")) or 0, _num(r.get(key)) or 0
        return (g + 5 * mu) / (gp + 5) / mu
    lh = mu * rating(th, "gf") * rating(ta, "ga") * HOME_ADV
    la = mu * rating(ta, "gf") * rating(th, "ga") / HOME_ADV
    pois = lambda l, k: math.exp(-l) * l ** k / math.factorial(k)
    ph = pd = pa = over = 0.0
    for i in range(11):
        for j in range(11):
            q = pois(lh, i) * pois(la, j)
            if i > j: ph += q
            elif i == j: pd += q
            else: pa += q
            if i + j >= 3: over += q
    tot = ph + pd + pa
    p = [round(ph / tot * 100, 1), round(pd / tot * 100, 1), round(pa / tot * 100, 1)]
    return {"p": p, "dec": [round(100 / x, 2) for x in p], "margin": 0, "src": "Model",
            "model": True, "ou": {"line": 2.5, "pOver": round(over / tot * 100, 1)}, "xg": [round(lh, 2), round(la, 2)]}


# ---------- TheSportsDB: leagues ESPN does not cover ----------
TSDB = "https://www.thesportsdb.com/api/v1/json/123/"
TSDB_LEAGUES = {"4742": ("Persian Gulf Pro League", "Iran"), "4678": ("UAE Pro League", "UAE")}


def tsdb(path):
    time.sleep(1.2)                                   # free key: stay well under the rate limit
    try:
        return get(TSDB + path)
    except Exception as e:
        print("thesportsdb failed", path, e, file=sys.stderr)
        return {}


def tsdb_matches(now):
    out = []
    for lid, (lname, country) in TSDB_LEAGUES.items():
        day_events = {}
        for k in range(-2, 4):
            d = (now.date() + timedelta(days=k)).isoformat()
            for e in tsdb(f"eventsday.php?d={d}&l={lid}").get("events") or []:
                day_events[e["idEvent"]] = e
        if not day_events:
            continue
        season = next(iter(day_events.values())).get("strSeason")
        last_round = max(int(e.get("intRound") or 0) for e in day_events.values())
        # rebuild the full table from this season's results (the free key only returns a top-5 table)
        tab = {}
        for r in range(1, last_round + 1):
            for e in tsdb(f"eventsround.php?id={lid}&r={r}&s={season}").get("events") or []:
                hs, as_ = _num(e.get("intHomeScore")), _num(e.get("intAwayScore"))
                if hs is None or as_ is None or "Not Started" in (e.get("strStatus") or ""):
                    continue
                for tid, name, gf, ga in ((e["idHomeTeam"], e["strHomeTeam"], hs, as_), (e["idAwayTeam"], e["strAwayTeam"], as_, hs)):
                    t = tab.setdefault(tid, {"name": name, "gp": 0, "gf": 0, "ga": 0, "pts": 0, "w": 0, "form": ""})
                    t["gp"] += 1; t["gf"] += gf; t["ga"] += ga
                    t["pts"] += 3 if gf > ga else 1 if gf == ga else 0
                    t["form"] = (t["form"] + ("W" if gf > ga else "D" if gf == ga else "L"))[-5:]
        order = sorted(tab.items(), key=lambda kv: (-kv[1]["pts"], -(kv[1]["gf"] - kv[1]["ga"]), -kv[1]["gf"]))
        table = {tid: {"rank": str(i + 1), "pts": str(t["pts"]), "gp": str(t["gp"]), "of": len(order), "group": "",
                       "gf": str(t["gf"]), "ga": str(t["ga"])} for i, (tid, t) in enumerate(order)}
        for e in day_events.values():
            hid, aid = e["idHomeTeam"], e["idAwayTeam"]
            odds = model_probs(table, hid, aid)
            if not odds:
                continue
            ts = e.get("strTimestamp") or f'{e.get("dateEvent")}T{e.get("strTime") or "00:00:00"}'
            ts = ts.replace("+00:00", "")[:16] + "Z"
            status = e.get("strStatus") or ""
            hs, as_ = e.get("intHomeScore"), e.get("intAwayScore")
            done = status in ("Match Finished", "FT", "AET", "PEN") or (hs not in (None, "") and ts < now.isoformat()[:16] and status not in ("Not Started", "NS"))
            live = status in ("1H", "2H", "HT", "ET", "Live", "In Progress")
            state = "post" if done else "in" if live else "pre"
            winner = ""
            if state == "post" and hs not in (None, ""):
                winner = "home" if int(hs) > int(as_) else "away" if int(as_) > int(hs) else "draw"
            mk = lambda tid, name: {"id": tid, "name": name, "short": name, "abbr": "".join(w[0] for w in name.split()[:3]).upper() if len(name.split()) > 1 else name[:3].upper(),
                                    "color": "", "alt": "", "form": (tab.get(tid) or {}).get("form", ""),
                                    "rec": "", "pos": table.get(tid)}
            out.append({"id": "tsdb" + e["idEvent"], "ts": ts, "league": lname, "country": country,
                        "h": mk(hid, e["strHomeTeam"]), "a": mk(aid, e["strAwayTeam"]),
                        "venue": ", ".join(x for x in (e.get("strVenue"), e.get("strCity"), country) if x),
                        "goals": [], "p": odds["p"], "dec": odds["dec"], "margin": 0, "ou": odds["ou"], "src": "Model", "model": True,
                        "state": state, "clock": "", "detail": status, "score": [hs, as_] if state != "pre" else None,
                        "winner": winner, "url": ""})
    return out


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
        st = comp["status"]["type"]
        h, a = sides["home"], sides["away"]
        lid = ev.get("uid", "").split("~l:")[-1].split("~")[0]
        slug = slugs.get(lid, "")
        if slug and slug not in table_cache:
            table_cache[slug] = standings(slug)
        table = table_cache.get(slug, {})
        odds = parse_odds(comp.get("odds"))
        if odds:
            cache[ev["id"]] = dict(odds, ts=ev["date"])
        else:
            odds = cache.get(ev["id"])
        if not odds:   # no bookmaker price (e.g. Russian league): fall back to the table-based model
            odds = model_probs(table, (h.get("team") or {}).get("id"), (a.get("team") or {}).get("id"))
            if odds:
                cache[ev["id"]] = dict(odds, ts=ev["date"])
        if not odds:
            continue
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
            "p": odds["p"], "dec": odds["dec"], "margin": odds["margin"], "ou": odds.get("ou"), "src": odds["src"], "model": bool(odds.get("model")),
            "state": st.get("state"),
            "clock": comp["status"].get("displayClock", ""),
            "detail": st.get("shortDetail", ""),
            "score": [h.get("score"), a.get("score")] if st.get("state") != "pre" else None,
            "winner": winner,
            "url": next((l["href"] for l in ev.get("links", []) if "desktop" in l.get("rel", [])), ""),
        })

    matches += tsdb_matches(now)

    # running record of finished matches, used for the accuracy table
    hist_path = HERE / "history.json"
    try:
        hist = json.loads(hist_path.read_text())
    except Exception:
        hist = {}
    cutoff = (now - timedelta(days=HISTORY_DAYS)).isoformat()
    for m in matches:
        if m["state"] == "post" and m["winner"] and not m.get("model"):
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
