"""Builds the Webflow edition assets (sp.css, sp.js) from ../template.html.
The Webflow page holds the static structure (nav, hero, how-it-works, board mount, footer);
sp.js injects the stylesheet, the sign-in panel and the board, loads data.json from GitHub and runs the app."""
import re, pathlib, json
HERE = pathlib.Path(__file__).parent
T = (HERE.parent / "template.html").read_text()

css = T[T.index("<style>")+7:T.index("</style>")]
js = T[T.index("<script>\nconst DATA")+8:T.rindex("</script>")]

COLORS = [  # new palette: midnight navy, neon mint, electric violet, hot pink
  ("#ffc83d","#2cf6b3"),("rgba(255,200,61,","rgba(44,246,179,"),("#ff5f45","#7a5cff"),("rgba(255,95,69,","rgba(122,92,255,"),
  ("#7c5cff","#ff4d9d"),("#07090c","#060814"),("rgba(7,9,12,","rgba(6,8,20,"),("rgba(5,7,10,","rgba(4,6,16,"),("#05070a","#04060f"),
  ("#1a1200","#021a12"),("#ffa94d","#5ad1ff"),("#0f1318","#0d1124"),("#141a21","#131833"),("#1f2731","#1e2545"),
  ("#9aa3ae","#9aa3c7"),("#69737f","#646d92"),("#c9a2ff","#b69cff"),("--live:#7a5cff","--live:#ff4d9d"),
  ("rgba(255,240,200,","rgba(200,255,240,"),("rgba(255,230,170,","rgba(180,255,230,"),
]
def recolor(s):
  for a,b in COLORS: s = s.replace(a,b)
  return s
css = recolor(css); js = recolor(js)

css += (HERE / "extra.css").read_text()

# --- JS changes for Webflow mounting ---
js = js.replace("const DATA = /*__DATA__*/null;", "")
js = js.replace('const c = $("fx"), x = c.getContext("2d");', 'const c = $("fx"); if (!c) return; const x = c.getContext("2d");')
js = js.replace('const b = $("burger"), L = $("links");', 'const b = $("burger"), L = $("links"); if (!b || !L) return;')
js = js.replace("  renderKpis(dayList);\n", "  renderKpis(dayList); renderSpot(dayList);\n")
spot = r'''
function renderSpot(list){
  const el = $("spot"); if (!el) return;
  const top = list.filter(m => m.state !== "post").sort((a,b)=>favP(b)-favP(a)).slice(0,3);
  if (!top.length) { el.innerHTML = ""; el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = top.map((m,i) => { const fs = favSide(m), t = fs===0?m.h:m.a, o = fs===0?m.a:m.h, p = favP(m);
    return `<article class="spot" style="--i:${i};--p:${p}"><div class="ring"><span>${pc(p)}</span></div>
      <div class="spot-body"><small>#${i+1} lock · ${esc(m.country ? m.country+" · " : "")}${esc(m.league)}</small>
      <b>${crest(t)} ${esc(t.name)}</b><span class="vs">to beat ${esc(o.name)}${fs===0?" at home":" away"}</span>
      <span class="when">${m.state==="in" ? '<i class="lv"></i> Live now' : hm(m.d)+" PT"}${m.model?" · model":""}</span></div></article>`; }).join("");
}
'''
js = js.replace("function renderDays(){", spot + "\nfunction renderDays(){", 1)

# 3D hero (three.js) with the 2D canvas scene as fallback
a = js.index("/* hero video: an original")
b = js.index("/* navbar: mobile menu")
block = js[a:b]
head = block.index("(function(){"); tail = block.rindex("})();")
block = block[:head] + "function hero2d(){" + block[head+12:tail] + "}\n" + block[tail+5:]
js = js[:a] + (HERE / "three_hero.js").read_text() + "\n" + block + "startHero3D().catch(function(e){ console.warn('3D hero unavailable, using 2D', e); hero2d(); });\n\n" + js[b:]

shell = (HERE / "shell.html").read_text()
icons = json.dumps({
  "mark": '<svg viewBox="0 0 24 24" fill="none" stroke="#021a12" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7.5l3.6 2.6-1.4 4.2H9.8L8.4 10.1z" fill="#021a12"/><path d="M12 3v4.5M20.6 9.2l-5 0.9M17.3 19.4l-3.1-5.1M6.7 19.4l3.1-5.1M3.4 9.2l5 0.9"/></svg>',
  "burger": "<span></span><span></span><span></span>",
  "vctl": '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
})

out = """/* SOCCER Pred, Webflow edition. Built by webflow/build_webflow.py from template.html. */
(function(){
"use strict";
if (window.__SP) return; window.__SP = 1;
var me = document.currentScript && document.currentScript.src || "";
var base = me ? me.replace(/sp\\.js(\\?.*)?$/, "") : "https://cdn.jsdelivr.net/gh/Moe1362/soccer-pred@main/webflow/";
var DATA_URL = "https://raw.githubusercontent.com/Moe1362/soccer-pred/main/data.json";
function addCss(href){ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; document.head.appendChild(l); }
addCss("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap");
var st = document.createElement("style"); st.textContent = """ + json.dumps(css) + """; document.head.appendChild(st);
var SHELL = """ + json.dumps(shell) + """;
var ICONS = """ + icons + """;
function ready(fn){ document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn(); }
ready(function(){
  document.documentElement.classList.add("sp-on");
  // Webflow can drop some id attributes; restore the ones the app relies on
  [[".links","links"],[".footer","method"],[".hero","hero"],[".how-sec","how"],[".wrap","board-top"],[".track","track"]].forEach(function(p){ var n = document.querySelector(p[0]); if (n && !n.id) n.id = p[1]; });
  var mount = document.getElementById("board-top");
  if (!mount) return;
  var tmp = document.createElement("div"); tmp.innerHTML = SHELL;
  // overlays go to <body>, board goes into the Webflow mount
  ["authPanel","toast"].forEach(function(id){ var n = tmp.querySelector("#"+id); if (n) document.body.appendChild(n); });
  var board = tmp.querySelector("#sp-board"); while (board.firstChild) mount.appendChild(board.firstChild);
  document.querySelectorAll(".mark").forEach(function(m){ if (!m.querySelector("svg")) m.innerHTML = ICONS.mark; });
  var bg = document.getElementById("burger"); if (bg && !bg.children.length) bg.innerHTML = ICONS.burger;
  var box = document.getElementById("fxbox");
  if (box && !document.getElementById("fx")) {
    box.innerHTML = '<canvas id="fx" role="img" aria-label="Animated stadium scene: a ball curls into the top corner of the net under floodlights"></canvas><div class="grain" aria-hidden="true"></div><button class="vctl" id="vctl" type="button" aria-label="Pause video">' + ICONS.vctl + '</button><div class="hero-shade" aria-hidden="true"></div>';
  }
  document.addEventListener("click", function(e){ var a = e.target.closest && e.target.closest('a[href="#"]'); if (a) e.preventDefault(); }, true);
  var band = document.getElementById("bandSignup"); if (band) band.addEventListener("click", function(){ var b = document.getElementById("btnSignup"); if (b) b.click(); else { var c = document.querySelector(".who-wrap button"); if (c) c.click(); } });
  document.querySelectorAll(".how-card").forEach(function(c){ c.addEventListener("pointermove", function(e){ var r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); }); });
  var rows = document.getElementById("rows"); if (rows) rows.innerHTML = '<div class="loading"><i></i><i></i><i></i><span>Loading today\\u2019s picks\\u2026</span></div>';
  fetch(DATA_URL + "?t=" + Math.floor(Date.now()/300000), {cache: "no-store"}).then(function(r){ if (!r.ok) throw 0; return r.json(); })
    .then(run).catch(function(){ if (rows) rows.innerHTML = '<div class="empty">Could not load match data. Refresh the page to try again.</div>'; });
});
function run(DATA){
""" + js + """
}
})();
"""
(HERE / "sp.css").write_text(css)
(HERE / "sp.js").write_text(out)
print("sp.js", len(out), "chars")
