/* SOCCER Pred, Webflow edition. Built by webflow/build_webflow.py from template.html. */
(function(){
"use strict";
if (window.__SP) return; window.__SP = 1;
var me = document.currentScript && document.currentScript.src || "";
var base = me ? me.replace(/sp\.js(\?.*)?$/, "") : "https://cdn.jsdelivr.net/gh/Moe1362/soccer-pred@main/webflow/";
var DATA_URL = "https://raw.githubusercontent.com/Moe1362/soccer-pred/main/data.json";
function addCss(href){ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; document.head.appendChild(l); }
addCss("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap");
var st = document.createElement("style"); st.textContent = "\n/* Layout: analyst board. Summary strip, day + filter bar, then one dense row per fixture\n   (kick-off | teams with form | 1-X-2 probability | markets | status), stacking to cards on phones. */\n:root{\n  --bg:#060814; --surface:#0d1124; --raise:#131833; --ink:#f2f4f7; --muted:#9aa3c7; --faint:#646d92; --line:#1e2545;\n  --accent:#2cf6b3; --accent-2:#7a5cff; --accent-3:#ff4d9d; --accent-ink:#021a12; --accent-soft:rgba(44,246,179,.12);\n  --tier4:#2cf6b3; --tier3:#5ad1ff; --tier2:#b69cff; --tier1:#6b7684;\n  --live:#ff4d9d; --win:#3ddc97; --loss:#ff5f6d; --draw:#6b7684;\n  --font:\"Inter\",system-ui,\"Segoe UI\",sans-serif; --display:\"Space Grotesk\",\"Inter\",system-ui,sans-serif;\n  --r:14px; color-scheme:dark;\n}\n*{box-sizing:border-box}\nbody{background:var(--bg);color:var(--ink);font-family:var(--font);font-size:14px;line-height:1.5;font-variant-numeric:tabular-nums;\n  padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px 56px}\n.wrap{max-width:1080px;margin:0 auto;display:flex;flex-direction:column;gap:16px}\nbutton,select,input{font:inherit;color:inherit}\n:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n\n/* header */\n.head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px}\n.brand{display:flex;align-items:center;gap:12px}\n.mark{width:40px;height:40px;border-radius:10px;background:var(--accent);display:grid;place-items:center;flex:none}\n.mark svg{width:24px;height:24px}\n.brand h1{margin:0;font-family:var(--display);font-size:1.5rem;font-weight:700;letter-spacing:-.01em}\n.brand h1 span{color:var(--accent)}\n.brand p{margin:0;color:var(--muted);font-size:.82rem}\n.updated{font-size:.8rem;color:var(--muted);display:flex;align-items:center;gap:6px}\n.dot{width:7px;height:7px;border-radius:50%;background:var(--accent);display:inline-block}\n\n/* KPI strip */\n.kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));background:var(--surface);border:1px solid var(--line);border-radius:var(--r)}\n.kpi{padding:12px 16px;border-left:1px solid var(--line);min-width:0}\n.kpi:first-child{border-left:0}\n.kpi .v{font-family:var(--display);font-size:1.45rem;font-weight:700;line-height:1.2}\n.kpi .l{font-size:.75rem;color:var(--muted)}\n.kpi .s{font-size:.75rem;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n@media (max-width:640px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.kpi:nth-child(3){border-left:0}.kpi:nth-child(n+3){border-top:1px solid var(--line)}}\n\n/* toolbar */\n.bar{display:flex;flex-direction:column;gap:10px}\n.days{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px}\n.day{flex:none;border:1px solid var(--line);background:var(--surface);border-radius:10px;padding:6px 14px;cursor:pointer;text-align:center;line-height:1.3}\n.day b{display:block;font-size:.88rem}\n.day small{color:var(--muted);font-size:.72rem}\n.day[aria-pressed=\"true\"]{background:var(--ink);border-color:var(--ink);color:var(--bg)}\n.day[aria-pressed=\"true\"] small{color:inherit;opacity:.75}\n.filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.seg{display:flex;border:1px solid var(--line);border-radius:9px;background:var(--surface);overflow:hidden}\n.seg button{border:0;background:none;padding:5px 11px;cursor:pointer;color:var(--muted);font-size:.82rem;border-left:1px solid var(--line)}\n.seg button:first-child{border-left:0}\n.seg button[aria-pressed=\"true\"]{background:var(--accent-soft);color:var(--accent);font-weight:700}\n.filters select,.filters input{border:1px solid var(--line);background:var(--surface);border-radius:9px;padding:5px 10px;font-size:.82rem;min-width:0}\n.filters input{flex:1 1 170px}\n.filters select{max-width:240px}\n.flabel{font-size:.72rem;color:var(--faint);text-transform:uppercase;letter-spacing:.06em}\n\n/* table */\n.board{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);overflow:hidden}\n.thead,.row{display:grid;grid-template-columns:4.6rem minmax(0,1fr) 15rem 9.5rem 8.8rem;gap:14px;align-items:center;padding:10px 16px}\n.thead{font-size:.7rem;color:var(--faint);border-bottom:1px solid var(--line);background:var(--raise);padding-block:7px;text-transform:uppercase;letter-spacing:.06em}\n.row{border-top:1px solid var(--line)}\n.row:first-of-type{border-top:0}\n.lg{padding:7px 16px;background:var(--raise);border-top:1px solid var(--line);font-size:.75rem;color:var(--muted);font-weight:600}\n.time b{display:block;font-size:.95rem}\n.time small{color:var(--faint);font-size:.72rem}\n.teams{display:flex;flex-direction:column;gap:5px;min-width:0}\n.t{display:flex;align-items:center;gap:8px;min-width:0}\n.crest{width:24px;height:24px;border-radius:50%;flex:none;display:grid;place-items:center;font-size:.55rem;font-weight:800;letter-spacing:.02em;border:1px solid var(--line)}\n.tn{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.t.fav .tn{font-weight:700}\n.t .sc{margin-left:auto;font-weight:800;font-size:.95rem}\n.form{display:flex;gap:2px;flex:none}\n.form i{width:6px;height:6px;border-radius:50%;background:var(--draw)}\n.form i.W{background:var(--win)}.form i.L{background:var(--loss)}\n.league-sm{font-size:.72rem;color:var(--faint);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n\n.x12{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}\n.cell{border:1px solid var(--line);border-radius:8px;padding:4px 0 5px;text-align:center;line-height:1.2;background:var(--raise)}\n.cell small{display:block;font-size:.64rem;color:var(--faint);text-transform:uppercase;letter-spacing:.04em}\n.cell b{font-size:.92rem;font-weight:700}\n.cell.fav{background:var(--accent-soft);border-color:var(--accent)}\n.cell.fav b{color:var(--accent);font-weight:800}\n.cell.hit{box-shadow:inset 0 -3px 0 var(--win)}\n.pbar{display:flex;height:4px;border-radius:4px;overflow:hidden;margin-top:6px;background:var(--line)}\n.pbar span{height:100%}\n\n.mk{display:flex;flex-direction:column;gap:3px;font-size:.78rem;color:var(--muted)}\n.mk div{display:flex;justify-content:space-between;gap:6px}\n.mk b{color:var(--ink);font-weight:600}\n\n.st{display:flex;flex-direction:column;align-items:flex-start;gap:4px}\n.tier{font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:99px;color:#0b0b0b;white-space:nowrap;text-transform:uppercase;letter-spacing:.04em}\n.tier.t4{background:var(--tier4)}.tier.t3{background:var(--tier3)}.tier.t2{background:var(--tier2)}.tier.t1{background:var(--tier1)}\n.status{font-size:.74rem;color:var(--muted);white-space:nowrap}\n.status.live{color:var(--live);font-weight:700}\n.status.ok{color:var(--win);font-weight:700}\n.status.bad{color:var(--loss);font-weight:700}\n.status a{color:inherit}\n.empty{padding:36px 16px;text-align:center;color:var(--muted)}\n\n@media (max-width:860px){\n  .thead{display:none}\n  .row{grid-template-columns:3.6rem minmax(0,1fr);grid-template-areas:\"time teams\" \"x12 x12\" \"mk mk\" \"st st\";gap:10px 12px;padding:12px 14px}\n  .time{grid-area:time}.teams{grid-area:teams}.x12w{grid-area:x12}\n  .mk{grid-area:mk;flex-direction:row;flex-wrap:wrap;gap:6px}\n  .mk div{flex:1 1 0;min-width:5.5rem;flex-direction:column;justify-content:flex-start;gap:0;background:var(--raise);border-radius:8px;padding:5px 8px;font-size:.72rem}\n  .mk b{font-size:.9rem}\n  .st{grid-area:st;flex-direction:row;flex-wrap:wrap;align-items:center;gap:6px 12px}\n}\n\n/* accuracy */\n.panel{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:16px}\n.panel h2{margin:0 0 4px;font-family:var(--display);font-size:1.05rem}\n.panel p{margin:0;color:var(--muted);font-size:.84rem;max-width:72ch}\n.cal{width:100%;border-collapse:collapse;margin-top:12px;font-size:.84rem}\n.cal th{font-weight:500;color:var(--faint);font-size:.7rem;text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);text-transform:uppercase;letter-spacing:.05em}\n.cal td{padding:8px;border-bottom:1px solid var(--line)}\n.cal tr:last-child td{border-bottom:0}\n.meter{height:6px;background:var(--line);border-radius:6px;position:relative;min-width:90px}\n.meter span{position:absolute;inset-block:0;left:0;border-radius:6px;background:var(--accent)}\n.meter i{position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--ink)}\n.tablewrap{overflow-x:auto}\n.foot{font-size:.76rem;color:var(--faint);line-height:1.7;max-width:90ch}\n\n/* motion */\n@keyframes rise{from{transform:translateY(10px);opacity:.001}to{transform:none;opacity:1}}\n@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}\n@keyframes pulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 60%,transparent)}70%{box-shadow:0 0 0 8px transparent}100%{box-shadow:0 0 0 0 transparent}}\n@keyframes livepulse{50%{opacity:.35}}\n@keyframes spin{from{transform:rotate(-200deg) scale(.6)}to{transform:none}}\n@keyframes pop{0%{transform:scale(.6)}60%{transform:scale(1.12)}100%{transform:scale(1)}}\n@keyframes shine{from{background-position:-150% 0}to{background-position:250% 0}}\n.mark svg{animation:spin .9s cubic-bezier(.2,.8,.2,1.2) both}\n.mark{transition:transform .3s}\n.mark:hover svg{animation:spin .7s cubic-bezier(.2,.8,.2,1.2)}\n.dot{animation:pulse 2s infinite}\n.kpi{animation:rise .5s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i,0)*70ms)}\n.row,.lg{animation:rise .45s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(min(var(--i,0),14)*35ms);transition:background .2s,transform .2s}\n.row:hover{background:var(--raise)}\n.row:hover .cell.fav{transform:translateY(-2px);box-shadow:0 4px 12px color-mix(in srgb,var(--accent) 25%,transparent)}\n.cell{transition:transform .2s,box-shadow .2s}\n.pbar span{transform-origin:left;animation:grow .8s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(min(var(--i,0),14)*35ms + 150ms)}\n.cell.fav{background-image:linear-gradient(100deg,transparent 30%,color-mix(in srgb,var(--accent) 22%,transparent) 50%,transparent 70%);background-size:200% 100%;background-repeat:no-repeat;animation:shine 1.4s ease-out both;animation-delay:calc(min(var(--i,0),14)*35ms + 300ms)}\n.tier{animation:pop .45s cubic-bezier(.2,.8,.2,1.3) both;animation-delay:calc(min(var(--i,0),14)*35ms + 250ms)}\n.status.live::first-letter{animation:livepulse 1s infinite}\n.status.live{animation:livepulse 1.6s ease-in-out infinite}\n.meter span{transform-origin:left;animation:grow 1s cubic-bezier(.2,.7,.2,1) both}\n.day,.seg button{transition:background .2s,color .2s,transform .15s,border-color .2s}\n.day:hover{transform:translateY(-2px)}\n.day:active,.seg button:active{transform:scale(.96)}\n.form i{animation:pop .35s both;animation-delay:calc(var(--j,0)*60ms + 200ms)}\n@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}\n\n/* cinematic hero */\nbody{padding-block:0 56px}\n.hero{position:relative;overflow:hidden;margin-left:calc(-1*max(16px,env(safe-area-inset-left,0px)));margin-right:calc(-1*max(16px,env(safe-area-inset-right,0px)));margin-bottom:20px;border-bottom:1px solid var(--line);isolation:isolate}\n#fx{position:absolute;inset:0;width:100%;height:100%;z-index:-2}\n.hero-glow{position:absolute;inset:-20% -10% auto;height:120%;z-index:-1;pointer-events:none;\n  background:radial-gradient(40% 50% at 20% 30%,rgba(124,92,255,.35),transparent 70%),radial-gradient(35% 45% at 80% 20%,rgba(122,92,255,.28),transparent 70%),radial-gradient(40% 40% at 60% 80%,rgba(44,246,179,.18),transparent 70%);\n  filter:blur(20px);animation:drift 18s ease-in-out infinite alternate}\n.hero::after{content:\"\";position:absolute;inset:auto 0 0;height:120px;background:linear-gradient(transparent,var(--bg));z-index:-1}\n.hero-in{max-width:1080px;margin:0 auto;padding:20px max(16px,env(safe-area-inset-right,0px)) 28px max(16px,env(safe-area-inset-left,0px));display:flex;flex-direction:column;gap:clamp(32px,7vw,72px)}\n.hero-copy{display:flex;flex-direction:column;gap:16px;max-width:720px}\n.eyebrow{align-self:flex-start;font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:5px 12px;border-radius:99px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);backdrop-filter:blur(8px);animation:rise .6s both}\n.headline{margin:0;font-family:var(--display);font-weight:700;font-size:clamp(2.1rem,6vw,4.2rem);line-height:1.02;letter-spacing:-.03em;text-wrap:balance;animation:blurIn 1s cubic-bezier(.2,.7,.2,1) .1s both}\n.grad{background:linear-gradient(90deg,var(--accent),var(--accent-2),var(--accent-3),var(--accent));background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:flow 6s linear infinite}\n.lede{margin:0;color:var(--muted);font-size:1.02rem;max-width:58ch;animation:rise .7s .3s both}\n.cta{align-self:flex-start;display:inline-flex;align-items:center;gap:10px;padding:12px 22px;border-radius:99px;font-weight:700;color:var(--accent-ink);text-decoration:none;\n  background:linear-gradient(90deg,var(--accent),var(--accent-2));box-shadow:0 0 0 0 rgba(44,246,179,.5),0 10px 30px -8px rgba(122,92,255,.6);animation:rise .7s .45s both,ctaPulse 2.6s 1.4s infinite;transition:transform .2s}\n.cta:hover{transform:translateY(-2px) scale(1.03)}\n.cta svg{animation:bob 1.6s ease-in-out infinite}\n.head .updated{color:var(--muted)}\n\n/* marquee of top picks */\n.marquee{position:relative;overflow:hidden;padding:4px 0 28px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}\n.track{display:flex;gap:14px;width:max-content;animation:scrollx 60s linear infinite}\n.marquee:hover .track{animation-play-state:paused}\n.pick{width:250px;flex:none;position:relative;border-radius:var(--r);padding:14px;background:rgba(20,26,33,.7);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(10px);display:flex;flex-direction:column;gap:8px;transition:transform .3s,border-color .3s}\n.pick:hover{transform:translateY(-6px);border-color:rgba(44,246,179,.5)}\n.pick .pp{font-family:var(--display);font-size:2rem;font-weight:700;line-height:1;background:linear-gradient(90deg,var(--accent),var(--accent-2));-webkit-background-clip:text;background-clip:text;color:transparent}\n.pick .pt{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.pick .pm{font-size:.74rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.pick .pb{height:3px;border-radius:3px;background:var(--line);overflow:hidden}\n.pick .pb span{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent-2))}\n\n/* glowing animated border on the board */\n@property --ang{syntax:\"<angle>\";inherits:false;initial-value:0deg}\n.board{position:relative;border-color:transparent;background:linear-gradient(var(--surface),var(--surface)) padding-box,conic-gradient(from var(--ang),var(--line) 0 60%,var(--accent) 75%,var(--accent-2) 85%,var(--line) 100%) border-box;border:1px solid transparent;animation:spinBorder 8s linear infinite}\n.kpis{background:rgba(15,19,24,.8);backdrop-filter:blur(10px)}\n.kpi .v{background:linear-gradient(180deg,var(--ink),var(--muted));-webkit-background-clip:text;background-clip:text;color:transparent}\n.row{position:relative}\n.row::before{content:\"\";position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .3s;background:radial-gradient(260px circle at var(--mx,50%) var(--my,50%),rgba(44,246,179,.09),transparent 70%)}\n.row:hover::before{opacity:1}\n.day[aria-pressed=\"true\"]{background:linear-gradient(90deg,var(--accent),var(--accent-2));border-color:transparent;color:var(--accent-ink)}\n.cell.fav{border-color:rgba(44,246,179,.6)}\n\n@keyframes drift{0%{transform:translate3d(0,0,0) rotate(0)}100%{transform:translate3d(-4%,3%,0) rotate(8deg)}}\n@keyframes flow{to{background-position:300% 0}}\n@keyframes blurIn{from{filter:blur(14px);transform:translateY(16px) scale(.98);opacity:.001}to{filter:none;transform:none;opacity:1}}\n@keyframes ctaPulse{0%{box-shadow:0 0 0 0 rgba(44,246,179,.45),0 10px 30px -8px rgba(122,92,255,.6)}70%{box-shadow:0 0 0 14px rgba(44,246,179,0),0 10px 30px -8px rgba(122,92,255,.6)}100%{box-shadow:0 0 0 0 rgba(44,246,179,0),0 10px 30px -8px rgba(122,92,255,.6)}}\n@keyframes bob{50%{transform:translateY(3px)}}\n@keyframes scrollx{to{transform:translateX(-50%)}}\n@keyframes spinBorder{to{--ang:360deg}}\n@media (prefers-reduced-motion:reduce){.track{animation:none!important}}\n\n.pos{flex:none;display:inline-flex;align-items:baseline;gap:4px;font-size:.68rem;font-weight:700;color:var(--accent);background:var(--accent-soft);border:1px solid rgba(44,246,179,.25);border-radius:6px;padding:0 6px;line-height:1.6}\n.pos small{font-weight:500;color:var(--muted);font-size:.64rem}\n.ctry{color:var(--ink);font-weight:600}\n.venue{font-size:.7rem;color:var(--faint);display:flex;align-items:center;gap:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.venue svg{flex:none}\n.goals{display:flex;gap:6px;align-items:flex-start;font-size:.72rem;color:var(--muted);margin-top:2px;padding:5px 8px;border-radius:8px;background:var(--raise);border:1px solid var(--line)}\n.goals svg{flex:none;margin-top:3px;color:var(--accent)}\n.goals em{font-style:normal;color:var(--ink);font-weight:600;margin-right:2px}\n.goals .g{white-space:nowrap;margin-right:8px}\n.goals .g b{color:var(--accent);font-weight:600}\n.goals > div{display:flex;flex-direction:column;gap:2px;min-width:0}\n.goals > div > div{display:flex;flex-wrap:wrap;column-gap:2px}\n\n/* navbar */\nhtml{scroll-behavior:smooth;scroll-padding-top:calc(72px + env(safe-area-inset-top,0px))}\nbody::before{content:\"\";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:60;background:rgba(6,8,20,.85)}\n.nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:50;margin-left:calc(-1*max(16px,env(safe-area-inset-left,0px)));margin-right:calc(-1*max(16px,env(safe-area-inset-right,0px)));background:rgba(6,8,20,.55);backdrop-filter:blur(14px) saturate(140%);-webkit-backdrop-filter:blur(14px) saturate(140%);border-bottom:1px solid rgba(255,255,255,.06);animation:navIn .6s cubic-bezier(.2,.7,.2,1) both}\n.nav-in{max-width:1080px;margin:0 auto;display:flex;align-items:center;gap:20px;padding:12px max(16px,env(safe-area-inset-right,0px)) 12px max(16px,env(safe-area-inset-left,0px))}\n.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink)}\n.brand .mark{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--accent),var(--accent-2));display:grid;place-items:center;flex:none}\n.brand .mark svg{width:20px;height:20px}\n.bname{font-family:var(--display);font-weight:700;font-size:1.15rem;letter-spacing:-.01em;white-space:nowrap}\n.bname span{color:var(--accent)}\n.links{display:flex;gap:4px;margin-left:auto}\n.links a{position:relative;color:var(--muted);text-decoration:none;font-size:.88rem;font-weight:500;padding:6px 12px;border-radius:8px;transition:color .2s,background .2s}\n.links a:hover{color:var(--ink);background:rgba(255,255,255,.05)}\n.links a::after{content:\"\";position:absolute;left:12px;right:12px;bottom:2px;height:2px;border-radius:2px;background:linear-gradient(90deg,var(--accent),var(--accent-2));transform:scaleX(0);transform-origin:left;transition:transform .3s}\n.links a:hover::after,.links a.on::after{transform:scaleX(1)}\n.links a.on{color:var(--ink)}\n.acct{display:flex;align-items:center;gap:10px}\n.signin{border:1px solid rgba(44,246,179,.45);background:rgba(44,246,179,.08);color:var(--accent);font-weight:700;font-size:.85rem;padding:7px 16px;border-radius:99px;cursor:pointer;transition:background .2s,transform .15s}\n.signin:hover{background:rgba(44,246,179,.18);transform:translateY(-1px)}\n.who{display:flex;align-items:center;gap:8px;font-size:.85rem;padding:3px 12px 3px 3px;border-radius:99px;border:1px solid var(--line);background:var(--raise);animation:pop .4s both}\n.who img{width:28px;height:28px;border-radius:50%;object-fit:cover}\n.who small{display:block;color:var(--faint);font-size:.66rem;line-height:1.1}\n.who b{display:block;font-weight:600;line-height:1.2;max-width:12ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.burger{display:none;background:none;border:0;cursor:pointer;padding:8px;flex-direction:column;gap:4px}\n.burger span{display:block;width:20px;height:2px;border-radius:2px;background:var(--ink);transition:transform .25s,opacity .25s}\n.burger[aria-expanded=\"true\"] span:nth-child(1){transform:translateY(6px) rotate(45deg)}\n.burger[aria-expanded=\"true\"] span:nth-child(2){opacity:0}\n.burger[aria-expanded=\"true\"] span:nth-child(3){transform:translateY(-6px) rotate(-45deg)}\n@media (max-width:760px){\n  .burger{display:flex}\n  .acct{margin-left:auto}\n  .links{position:absolute;top:100%;left:0;right:0;flex-direction:column;gap:0;margin:0;padding:8px max(16px,env(safe-area-inset-left,0px));background:rgba(6,8,20,.96);border-bottom:1px solid var(--line);transform:translateY(-8px);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s}\n  .links.open{opacity:1;transform:none;pointer-events:auto}\n  .links a{padding:12px}\n  .who b,.who small{display:none}.who{padding:3px}\n}\n/* sign-in panel */\n.auth[hidden],[hidden]{display:none!important}\n.auth{position:fixed;inset:0;z-index:70;display:grid;place-items:center;padding:16px;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);animation:fadeIn .2s both}\n.auth-card{position:relative;max-width:400px;width:100%;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:28px 24px;display:flex;flex-direction:column;gap:14px;animation:blurIn .4s both}\n.auth-card h3{margin:0;font-family:var(--display);font-size:1.3rem}\n.auth-card p{margin:0;color:var(--muted);font-size:.9rem}\n.auth-x{position:absolute;top:10px;right:12px;background:none;border:0;color:var(--muted);font-size:1.4rem;cursor:pointer}\n\n/* hero grid + Messi card */\n.hero-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:clamp(24px,4vw,48px);align-items:center}\n@media (max-width:900px){.hero-grid{grid-template-columns:1fr}}\n.hero-in{padding-top:clamp(28px,5vw,56px)}\n.eyebrow{display:inline-flex;align-items:center;gap:8px}\n#hello{display:block;font-size:.42em;color:var(--muted);font-weight:600;letter-spacing:0;margin-bottom:10px}\n#hello:empty{display:none}\n.messi{position:relative;border-radius:20px;padding:22px;background:linear-gradient(160deg,rgba(124,92,255,.18),rgba(15,19,24,.85) 45%,rgba(122,92,255,.14));border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(12px);overflow:hidden;animation:blurIn .9s .25s cubic-bezier(.2,.7,.2,1) both;box-shadow:0 30px 80px -30px rgba(124,92,255,.45)}\n.messi::before{content:\"\";position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:conic-gradient(from var(--ang),transparent 0 70%,var(--accent) 80%,var(--accent-2) 90%,transparent);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:spinBorder 6s linear infinite;pointer-events:none}\n.mx-top{display:flex;align-items:center;gap:14px}\n.jersey{width:64px;height:64px;flex:none;position:relative;display:grid;place-items:center;font-family:var(--display);font-weight:700;font-size:1.6rem;color:#fff;\n  background:linear-gradient(90deg,#f7b5cd 0 18%,#231f20 18% 82%,#f7b5cd 82%);clip-path:polygon(22% 0,38% 8%,62% 8%,78% 0,100% 18%,88% 36%,82% 30%,82% 100%,18% 100%,18% 30%,12% 36%,0 18%);animation:float 4s ease-in-out infinite}\n.mx-name{font-family:var(--display);font-size:1.35rem;font-weight:700;line-height:1.1}\n.mx-sub{color:var(--muted);font-size:.8rem}\n.mx-live{margin-left:auto;font-size:.66rem;text-transform:uppercase;letter-spacing:.08em;color:var(--accent);border:1px solid rgba(44,246,179,.35);border-radius:99px;padding:3px 8px;white-space:nowrap}\n.mx-big{display:flex;align-items:flex-end;gap:12px;margin:18px 0 6px}\n.mx-big .n{font-family:var(--display);font-size:clamp(3.6rem,8vw,5rem);font-weight:700;line-height:.9;background:linear-gradient(180deg,#fff,var(--accent) 70%,var(--accent-2));-webkit-background-clip:text;background-clip:text;color:transparent}\n.mx-big .l{color:var(--muted);font-size:.85rem;padding-bottom:8px}\n.mx-big .l b{display:block;color:var(--ink);font-size:1rem}\n.mx-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}\n.mx-stats div{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:8px;text-align:center}\n.mx-stats b{display:block;font-family:var(--display);font-size:1.15rem}\n.mx-stats small{color:var(--faint);font-size:.66rem;text-transform:uppercase;letter-spacing:.05em}\n.mx-h{margin:16px 0 8px;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:var(--faint)}\n.mx-games{display:flex;flex-direction:column;gap:6px}\n.mg{display:grid;grid-template-columns:22px minmax(0,1fr) auto auto;gap:10px;align-items:center;font-size:.8rem;padding:6px 8px;border-radius:9px;background:rgba(255,255,255,.03);animation:rise .4s both;animation-delay:calc(600ms + var(--k)*80ms)}\n.mg .r{width:22px;height:22px;border-radius:6px;display:grid;place-items:center;font-weight:800;font-size:.7rem;color:#0b0b0b}\n.mg .r.W{background:var(--win)}.mg .r.D{background:var(--draw)}.mg .r.L{background:var(--loss)}\n.mg .o{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted)}\n.mg .o b{color:var(--ink);font-weight:600}\n.mg .ga{display:flex;gap:4px}\n.mg .ga span{font-size:.68rem;font-weight:700;padding:1px 6px;border-radius:5px;background:rgba(44,246,179,.15);color:var(--accent)}\n.mg .ga span.as{background:rgba(124,92,255,.2);color:#c9b8ff}\n.mg .sc{font-weight:700}\n.mx-next{margin-top:12px;font-size:.8rem;color:var(--muted);padding:8px 10px;border-radius:10px;border:1px dashed rgba(255,255,255,.12)}\n.mx-next b{color:var(--ink)}\n\n/* footer */\n.footer{margin-top:40px;margin-left:calc(-1*max(16px,env(safe-area-inset-left,0px)));margin-right:calc(-1*max(16px,env(safe-area-inset-right,0px)));margin-bottom:-56px;border-top:1px solid var(--line);background:linear-gradient(180deg,var(--bg),#04060f);position:relative;overflow:hidden}\n.footer::before{content:\"\";position:absolute;left:50%;top:-1px;width:60%;height:1px;transform:translateX(-50%);background:linear-gradient(90deg,transparent,var(--accent),var(--accent-2),transparent);animation:sweep 5s ease-in-out infinite alternate}\n.foot-in,.foot-method,.foot-bar{max-width:1080px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}\n.foot-in{display:grid;grid-template-columns:minmax(0,1.6fr) repeat(3,minmax(0,1fr));gap:24px;padding-block:36px 20px}\n@media (max-width:760px){.foot-in{grid-template-columns:1fr 1fr}.foot-brand{grid-column:1/-1}}\n.foot-brand p{color:var(--muted);font-size:.84rem;max-width:36ch;margin:12px 0 0}\n.foot-col{display:flex;flex-direction:column;gap:8px;font-size:.84rem;min-width:0}\n.foot-col h4,.foot-method h4{margin:0 0 4px;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:var(--faint);font-weight:600}\n.foot-col a{color:var(--muted);text-decoration:none;transition:color .2s}\n.foot-col a:hover{color:var(--accent)}\n.foot-col span{color:var(--faint)}\n.foot-method{padding-block:8px 20px}\n.foot-method p{margin:0;color:var(--faint);font-size:.78rem;line-height:1.7;max-width:90ch}\n.foot-bar{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;padding-block:16px calc(20px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);font-size:.74rem;color:var(--faint)}\n\n@keyframes navIn{from{transform:translateY(-100%)}to{transform:none}}\n@keyframes fadeIn{from{opacity:0}}\n@keyframes float{50%{transform:translateY(-4px) rotate(-2deg)}}\n@keyframes sweep{from{width:20%}to{width:80%}}\n\n/* hero video */\n.hero{min-height:min(720px,92vh)}\n.hero .hero-in{min-height:min(560px,70vh);justify-content:center}\n.hero-shade{position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(90deg,rgba(4,6,16,.88) 0%,rgba(4,6,16,.55) 45%,rgba(4,6,16,.05) 75%),linear-gradient(0deg,var(--bg) 0%,transparent 30%)}\n@media (max-width:760px){.hero-shade{background:linear-gradient(180deg,rgba(4,6,16,.75),rgba(4,6,16,.35) 60%,var(--bg))}}\n.grain{position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:.07;mix-blend-mode:overlay;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");animation:grainShift .4s steps(3) infinite}\n.vctl{position:absolute;right:max(16px,env(safe-area-inset-right,0px));bottom:150px;z-index:2;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(6,8,20,.5);color:var(--ink);display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(6px)}\n.vctl:hover{border-color:var(--accent);color:var(--accent)}\n.hero-grid{grid-template-columns:minmax(0,1fr)}\n.hero-copy{max-width:640px}\n@keyframes grainShift{0%{transform:translate(0,0)}33%{transform:translate(-8px,5px)}66%{transform:translate(6px,-7px)}}\n\n/* account buttons, panel, menu */\n.ghost{border:1px solid rgba(255,255,255,.14);background:transparent;color:var(--ink);font-weight:600;font-size:.85rem;padding:7px 14px;border-radius:99px;cursor:pointer;transition:border-color .2s,background .2s}\n.ghost:hover{border-color:rgba(255,255,255,.35);background:rgba(255,255,255,.05)}\n.signin{background:linear-gradient(90deg,var(--accent),var(--accent-2));color:var(--accent-ink);border:0}\n.signin:hover{background:linear-gradient(90deg,var(--accent),var(--accent-2));filter:brightness(1.08)}\n.auth-tabs{display:grid;grid-template-columns:1fr 1fr;background:var(--raise);border:1px solid var(--line);border-radius:12px;padding:3px;margin-right:28px}\n.auth-tabs button{border:0;background:none;color:var(--muted);font-weight:600;padding:8px;border-radius:9px;cursor:pointer}\n.auth-tabs button[aria-selected=\"true\"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 0 rgba(255,255,255,.05),0 4px 14px rgba(0,0,0,.4)}\n.auth-form{display:flex;flex-direction:column;gap:8px}\n.auth-form h3{margin:8px 0 0;font-family:var(--display);font-size:1.3rem}\n.auth-form label{font-size:.78rem;color:var(--muted);margin-top:6px}\n.auth-form label small{color:var(--faint)}\n.auth-form input{background:var(--raise);border:1px solid var(--line);border-radius:10px;padding:10px 12px;color:var(--ink);font-size:.95rem;transition:border-color .2s,box-shadow .2s}\n.auth-form input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(44,246,179,.15)}\n.muted{color:var(--muted);font-size:.88rem;margin:0}\n.fine{color:var(--faint);font-size:.74rem;margin:2px 0 0;line-height:1.5}\n.err{color:var(--loss);font-size:.82rem;margin:0}\n.cta.wide{align-self:stretch;justify-content:center;margin-top:8px;border:0;cursor:pointer;animation:none}\n.acct-card{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;background:var(--raise);border:1px solid var(--line)}\n.acct-card img{width:40px;height:40px;border-radius:50%}\n.acct-card b{display:block}.acct-card small{color:var(--muted);font-size:.78rem}\n.who-wrap{position:relative}\n.who{cursor:pointer;color:var(--ink);font:inherit;text-align:left}\n.who .av{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-weight:800;background:linear-gradient(135deg,var(--accent),var(--accent-2));color:var(--accent-ink);overflow:hidden;flex:none}\n.who .av img{width:100%;height:100%;object-fit:cover}\n.menu{position:absolute;right:0;top:calc(100% + 8px);min-width:220px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:6px;box-shadow:0 20px 50px rgba(0,0,0,.5);display:flex;flex-direction:column;animation:rise .2s both;z-index:60}\n.menu-head{padding:10px 10px 8px;border-bottom:1px solid var(--line);margin-bottom:4px}\n.menu-head b{display:block}.menu-head small{color:var(--muted);font-size:.76rem}\n.menu button{background:none;border:0;color:var(--ink);text-align:left;padding:9px 10px;border-radius:8px;cursor:pointer;font-size:.88rem}\n.menu button:hover{background:var(--raise)}\n.menu .danger{color:var(--loss)}\n.toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:80;background:var(--surface);color:var(--ink);border:1px solid rgba(44,246,179,.35);padding:10px 18px;border-radius:99px;font-size:.88rem;font-weight:600;box-shadow:0 12px 40px rgba(0,0,0,.5)}\n.toast.show{animation:toastIn .35s cubic-bezier(.2,.8,.2,1.2) both}\n@keyframes toastIn{from{transform:translate(-50%,20px);opacity:0}to{transform:translate(-50%,0);opacity:1}}\n\n/* favorites */\n.st-top{display:flex;align-items:center;gap:8px}\n.star{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line);background:transparent;cursor:pointer;flex:none;transition:transform .2s,border-color .2s,background .2s}\n.star svg{fill:none;stroke:var(--muted);stroke-width:1.6;transition:fill .2s,stroke .2s}\n.star:hover{border-color:var(--accent);transform:scale(1.08)}\n.star:hover svg{stroke:var(--accent)}\n.star.on{border-color:var(--accent);background:rgba(44,246,179,.12)}\n.star.on svg{fill:var(--accent);stroke:var(--accent);animation:pop .4s cubic-bezier(.2,.8,.2,1.4)}\n.favday{border-color:rgba(44,246,179,.3)}\n.favday b{color:var(--accent)}\n.day.favday[aria-pressed=\"true\"] b{color:var(--accent-ink)}\n.fav-empty{display:flex;flex-direction:column;align-items:center;gap:8px}\n.fav-empty b{font-size:1.05rem;color:var(--ink)}\n.fav-empty p{margin:0}\n.big-star svg{width:44px;height:44px;fill:rgba(44,246,179,.15);stroke:var(--accent);stroke-width:1.2;animation:float 3s ease-in-out infinite}\n.fav-cta{display:flex;gap:10px;margin-top:6px}\n.fav-cta .cta{border:0;cursor:pointer;animation:none}\n.row.saved{opacity:.8}\n\n.src{font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#c9b8ff;border:1px dashed rgba(124,92,255,.6);border-radius:99px;padding:1px 8px;white-space:nowrap;cursor:help}\n\n.hl{display:inline-flex;align-items:center;gap:7px;font-size:.74rem;font-weight:700;color:var(--ink);text-decoration:none;padding:3px 10px 3px 3px;border-radius:99px;background:rgba(122,92,255,.12);border:1px solid rgba(122,92,255,.4);transition:background .2s,transform .2s;white-space:nowrap}\n.hl:hover{background:rgba(122,92,255,.25);transform:translateY(-1px)}\n.hl-ic{width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent-2),#ff2e63);color:#fff;box-shadow:0 0 0 0 rgba(122,92,255,.6);animation:hlPulse 2s infinite}\n@keyframes hlPulse{70%{box-shadow:0 0 0 7px rgba(122,92,255,0)}100%{box-shadow:0 0 0 0 rgba(122,92,255,0)}}\n\n/* ===== Webflow edition: new structure + livelier motion ===== */\nbody{margin:0;padding-top:0}\na{color:inherit;text-decoration:none}\nh1,h2,h3,h4{margin:0}\n.nav a,.footer a{color:inherit}\n.grad{background:linear-gradient(90deg,#2cf6b3,#5ad1ff,#7a5cff,#ff4d9d,#2cf6b3);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:flow 8s linear infinite}\n#fxbox{position:absolute;inset:0;z-index:-2}\n#fxbox canvas{position:absolute;inset:0;width:100%;height:100%;display:block}\n.aurora{position:absolute;inset:0;z-index:-1;pointer-events:none;overflow:hidden;mix-blend-mode:screen;opacity:.55}\n.aurora i{position:absolute;width:46vw;height:46vw;border-radius:50%;filter:blur(70px);opacity:.5;animation:aur 18s ease-in-out infinite alternate}\n.aurora i:nth-child(1){background:#2cf6b3;left:-12vw;top:-18vw}\n.aurora i:nth-child(2){background:#7a5cff;right:-14vw;top:-10vw;animation-duration:22s;animation-delay:-6s}\n.aurora i:nth-child(3){background:#ff4d9d;left:30vw;bottom:-30vw;animation-duration:26s;animation-delay:-11s;opacity:.3}\n@keyframes aur{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(6vw,4vw,0) scale(1.15)}100%{transform:translate3d(-4vw,8vw,0) scale(.9)}}\n.hero-stats{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}\n.hero-stats span{border:1px solid rgba(255,255,255,.12);background:rgba(13,17,36,.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:999px;padding:6px 12px;font-size:.78rem;color:#cfd5f5}\n.hero-stats b{color:#2cf6b3}\n\n/* section heads */\n.sec-head{max-width:1080px;margin:56px auto 18px;display:flex;flex-direction:column;gap:8px}\n.sec-head .kicker{font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:#2cf6b3;font-weight:700}\n.sec-head h2{font-family:var(--display);font-size:clamp(1.6rem,3.6vw,2.4rem);line-height:1.1;letter-spacing:-.02em}\n.sec-head p{color:var(--muted);max-width:620px;margin:0}\n\n/* how it works */\n.how{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}\n.how-card{position:relative;padding:22px;border-radius:18px;background:linear-gradient(160deg,#131833,#0b0f22);border:1px solid #1e2545;overflow:hidden;transition:transform .35s cubic-bezier(.2,.7,.2,1),border-color .35s,box-shadow .35s}\n.how-card:hover{transform:translateY(-6px);border-color:rgba(44,246,179,.5);box-shadow:0 18px 50px -20px rgba(44,246,179,.45)}\n.how-card::after{content:\"\";position:absolute;inset:-1px;background:radial-gradient(400px 120px at var(--mx,50%) 0%,rgba(122,92,255,.25),transparent 70%);pointer-events:none;opacity:0;transition:opacity .35s}\n.how-card:hover::after{opacity:1}\n.how-num{font-family:var(--display);font-size:2.6rem;font-weight:700;line-height:1;background:linear-gradient(135deg,#2cf6b3,#7a5cff);-webkit-background-clip:text;background-clip:text;color:transparent}\n.how-card h3{font-family:var(--display);font-size:1.12rem;margin:14px 0 6px}\n.how-card p{margin:0;color:var(--muted);font-size:.88rem}\n@media (max-width:767px){.how{grid-template-columns:1fr}}\n\n/* spotlight: top 3 of the day */\n.spots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;min-width:0}\n.spots[hidden]{display:none}\n.spot{min-width:0;display:flex;gap:14px;align-items:center;padding:16px;border-radius:18px;background:linear-gradient(150deg,rgba(44,246,179,.10),rgba(122,92,255,.08) 60%,rgba(13,17,36,.9));border:1px solid rgba(44,246,179,.22);animation:rise .6s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i)*120ms);transition:transform .3s,box-shadow .3s}\n.spot:hover{transform:translateY(-4px) scale(1.01);box-shadow:0 16px 44px -18px rgba(44,246,179,.55)}\n.ring{--a:calc(var(--p)*3.6deg);flex:none;width:68px;height:68px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#2cf6b3 0,#5ad1ff calc(var(--a)*.6),#7a5cff var(--a),rgba(255,255,255,.08) var(--a));animation:spin .9s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i)*120ms + 150ms)}\n.ring span{width:54px;height:54px;border-radius:50%;background:#0b0f22;display:grid;place-items:center;font-family:var(--display);font-weight:700;font-size:1.05rem}\n.spot-body{display:flex;flex-direction:column;gap:2px;min-width:0}\n.spot-body small{color:#2cf6b3;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.spot-body b{font-size:1rem;display:flex;align-items:center;gap:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.spot-body .vs,.spot-body .when{color:var(--muted);font-size:.8rem}\n.spot-body .lv{display:inline-block;width:7px;height:7px;border-radius:50%;background:#ff4d9d;animation:livepulse 1.2s infinite}\n@media (max-width:860px){.spots{grid-template-columns:1fr}}\n\n/* loading */\n.loading{display:flex;align-items:center;gap:6px;padding:40px 16px;justify-content:center;color:var(--muted)}\n.loading i{width:8px;height:8px;border-radius:50%;background:#2cf6b3;animation:bounce 1s infinite ease-in-out}\n.loading i:nth-child(2){animation-delay:.15s;background:#5ad1ff}.loading i:nth-child(3){animation-delay:.3s;background:#7a5cff}\n.loading span{margin-left:8px}\n@keyframes bounce{0%,80%,100%{transform:scale(.5);opacity:.5}40%{transform:scale(1);opacity:1}}\n\n/* livelier board */\n.row{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .25s,background .25s}\n.row:hover{transform:translateX(4px);box-shadow:inset 3px 0 0 #2cf6b3,0 10px 30px -18px rgba(44,246,179,.5)}\n.board,.kpis,.panel{box-shadow:0 30px 80px -50px rgba(122,92,255,.45)}\n.kpi .v{background:linear-gradient(90deg,#eef1ff,#2cf6b3);-webkit-background-clip:text;background-clip:text;color:transparent}\n.board-sec{max-width:1080px;margin:0 auto}\n.cta-band{max-width:1080px;margin:56px auto 0;padding:34px;border-radius:22px;text-align:center;background:linear-gradient(120deg,rgba(44,246,179,.16),rgba(122,92,255,.18),rgba(255,77,157,.14));background-size:200% 200%;animation:flow 10s linear infinite;border:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;align-items:center;gap:12px}\n.cta-band h2{font-family:var(--display);font-size:clamp(1.4rem,3vw,2rem)}\n.cta-band p{color:#cfd5f5;margin:0;max-width:520px}\n@media (prefers-reduced-motion:reduce){.aurora i,.grad,.cta-band{animation:none!important}}\n.acct a{white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;text-decoration:none}\n@media (max-width:479px){.nav-in{gap:10px}.acct{gap:6px}.acct .ghost,.acct .signin{padding:6px 11px;font-size:.78rem}.burger{padding:6px}}\n.nav{background:rgba(6,8,20,.86)}\n.cta-band .cta{align-self:center}\n.how-sec{padding-bottom:12px}\n"; document.head.appendChild(st);
var SHELL = "<div class=\"auth\" id=\"authPanel\" hidden>\n  <div class=\"auth-card\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"authTitle\">\n    <button class=\"auth-x\" id=\"authClose\" type=\"button\" aria-label=\"Close\">\u00d7</button>\n    <div class=\"auth-tabs\" role=\"tablist\">\n      <button type=\"button\" role=\"tab\" id=\"tabUp\" aria-selected=\"true\">Sign up</button>\n      <button type=\"button\" role=\"tab\" id=\"tabIn\" aria-selected=\"false\">Sign in</button>\n    </div>\n    <form id=\"formUp\" class=\"auth-form\" novalidate>\n      <h3 id=\"authTitle\">Create your account</h3>\n      <p class=\"muted\">Save favorite games and see them on every device.</p>\n      <label for=\"upName\">Display name</label>\n      <input id=\"upName\" type=\"text\" maxlength=\"40\" autocomplete=\"nickname\" required>\n      <label for=\"upTeam\">Favorite team <small>(optional)</small></label>\n      <input id=\"upTeam\" type=\"text\" maxlength=\"60\" placeholder=\"e.g. Real Madrid\">\n      <p class=\"err\" id=\"upErr\" hidden></p>\n      <button class=\"cta wide\" type=\"submit\"><span>Create account</span></button>\n      <p class=\"fine\" id=\"upFine\"></p>\n    </form>\n    <form id=\"formIn\" class=\"auth-form\" hidden novalidate>\n      <h3>Welcome back</h3>\n      <div class=\"acct-card\" id=\"inCard\"></div>\n      <p class=\"err\" id=\"inErr\" hidden></p>\n      <button class=\"cta wide\" type=\"submit\" id=\"inBtn\"><span>Sign in</span></button>\n      <p class=\"fine\">No password to remember: your SOCCER Pred account is tied to the Claude account you are signed in with.</p>\n    </form>\n  </div>\n</div>\n<div class=\"toast\" id=\"toast\" role=\"status\" aria-live=\"polite\" hidden></div>\n<div id=\"sp-board\">\n  <section class=\"kpis\" id=\"kpis\" aria-label=\"Day summary\"></section>\n  <section class=\"spots\" id=\"spot\" aria-label=\"Top picks of the day\"></section>\n  <section class=\"bar\">\n    <div class=\"days\" id=\"days\" role=\"group\" aria-label=\"Day\"></div>\n    <div class=\"filters\">\n      <span class=\"flabel\">Min. chance</span>\n      <div class=\"seg\" id=\"minSeg\" role=\"group\" aria-label=\"Minimum win probability\"></div>\n      <span class=\"flabel\">Sort</span>\n      <div class=\"seg\" id=\"sortSeg\" role=\"group\" aria-label=\"Sort by\"></div>\n      <select id=\"league\" aria-label=\"League\"></select>\n      <input id=\"q\" type=\"search\" placeholder=\"Search team\u2026\" aria-label=\"Search team\">\n    </div>\n  </section>\n  <section class=\"board\" aria-label=\"Matches\">\n    <div class=\"thead\"><span>Time (PT)</span><span>Match</span><span>1X2 probability</span><span>Markets</span><span>Status</span></div>\n    <div id=\"rows\"></div>\n  </section>\n  <section class=\"panel\" id=\"accuracy\">\n    <h2>Prediction accuracy</h2>\n    <p id=\"calNote\"></p>\n    <div class=\"tablewrap\"><table class=\"cal\" id=\"cal\"></table></div>\n  </section>\n</div>";
var ICONS = {"mark": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#021a12\" stroke-width=\"1.8\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7.5l3.6 2.6-1.4 4.2H9.8L8.4 10.1z\" fill=\"#021a12\"/><path d=\"M12 3v4.5M20.6 9.2l-5 0.9M17.3 19.4l-3.1-5.1M6.7 19.4l3.1-5.1M3.4 9.2l5 0.9\"/></svg>", "burger": "<span></span><span></span><span></span>", "vctl": "<svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"currentColor\"><rect x=\"6\" y=\"5\" width=\"4\" height=\"14\" rx=\"1\"/><rect x=\"14\" y=\"5\" width=\"4\" height=\"14\" rx=\"1\"/></svg>"};
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
  var rows = document.getElementById("rows"); if (rows) rows.innerHTML = '<div class="loading"><i></i><i></i><i></i><span>Loading today\u2019s picks\u2026</span></div>';
  fetch(DATA_URL + "?t=" + Math.floor(Date.now()/300000), {cache: "no-store"}).then(function(r){ if (!r.ok) throw 0; return r.json(); })
    .then(run).catch(function(){ if (rows) rows.innerHTML = '<div class="empty">Could not load match data. Refresh the page to try again.</div>'; });
});
function run(DATA){


const TZ = "America/Los_Angeles";
const $ = id => document.getElementById(id);
const pc = n => Math.round(n) + "%";
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const dayKey = d => new Intl.DateTimeFormat("en-CA",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"}).format(d);
const hm = d => new Intl.DateTimeFormat("en-US",{timeZone:TZ,hour:"numeric",minute:"2-digit",hour12:true}).format(d);
const favSide = m => m.p[0] >= m.p[2] ? 0 : 2;
const favP = m => m.p[favSide(m)];
const tierOf = p => p >= 75 ? [4,"Very strong"] : p >= 65 ? [3,"Strong"] : p >= 55 ? [2,"Moderate"] : [1,"Close"];
const winIdx = w => w === "home" ? 0 : w === "draw" ? 1 : w === "away" ? 2 : -1;

const ms = (DATA?.matches || []).map(m => ({...m, d:new Date(m.ts), key:dayKey(new Date(m.ts))}));
const todayKey = dayKey(new Date());
const keys = [...new Set(ms.map(m => m.key))].sort();
const st = { day: keys.includes(todayKey) ? todayKey : (keys.find(k => k >= todayKey) || keys[keys.length-1]), min: 65, sort: "p", league: "", q: "" };
try { const s = JSON.parse(localStorage.getItem("sp-prefs") || "{}"); if (s.min != null) st.min = s.min; if (s.sort) st.sort = s.sort; } catch(e) {}
const save = () => { try { localStorage.setItem("sp-prefs", JSON.stringify({min:st.min, sort:st.sort})); } catch(e) {} };

/* account state (filled in by the accounts block at the end) */
var session = null, profile = null, favs = new Map();
const starSvg = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>`;
function favIds(){ return session ? [...favs.keys()] : []; }
function starBtn(id){ const on = !!session && favs.has(id);
  return `<button type="button" class="star${on?" on":""}" data-fav="${esc(id)}" aria-pressed="${on}" aria-label="${on?"Remove from favorites":"Add to favorites"}" title="${on?"Remove from favorites":"Add to favorites"}">${starSvg}</button>`; }
function renderFavs(){
  const ids = favIds();
  const live = ms.filter(m => favs.has(m.id) && session);
  renderKpis(live);
  $("league").innerHTML = `<option value="">All leagues</option>`;
  if (!session) {
    $("rows").innerHTML = `<div class="empty fav-empty"><div class="big-star">${starSvg}</div><b>Save the games you care about</b><p>Create a free account to star matches and find them here on any device.</p><div class="fav-cta"><button type="button" class="cta" onclick="document.getElementById('btnSignup')?.click()"><span>Sign up</span></button><button type="button" class="ghost" onclick="document.getElementById('btnSignin')?.click()">Sign in</button></div></div>`;
    return;
  }
  if (!ids.length) { $("rows").innerHTML = `<div class="empty fav-empty"><div class="big-star">${starSvg}</div><b>No favorites yet</b><p>Tap the star on any match to add it here.</p></div>`; return; }
  const rows = ids.map(id => ms.find(m => m.id === id) || {saved: favs.get(id)}).sort((a,b) => String(a.ts || a.saved.ts || "").localeCompare(String(b.ts || b.saved.ts || "")));
  let i = 0;
  $("rows").innerHTML = rows.map(m => m.saved ? `<div class="row saved" style="--i:${i++}"><div class="time"><b>${m.saved.ts ? new Intl.DateTimeFormat("en-US",{timeZone:TZ,month:"short",day:"numeric"}).format(new Date(m.saved.ts)) : "–"}</b><small>saved</small></div>
      <div class="teams"><div class="t"><span class="tn">${esc(m.saved.home || "Match")}</span></div><div class="t"><span class="tn">${esc(m.saved.away || "")}</span></div><div class="league-sm">${esc([m.saved.country, m.saved.league].filter(Boolean).join(" · "))}</div></div>
      <div class="x12w"><span class="status">This match is no longer in the live feed.</span></div><div class="mk"></div><div class="st"><div class="st-top">${starBtn(m.saved.id)}</div></div></div>` : rowHtml(m, i++)).join("");
}

function dayLabel(k){
  const base = new Date(todayKey+"T12:00:00Z"), d = new Date(k+"T12:00:00Z");
  const diff = Math.round((d-base)/864e5);
  const names = {"-1":"Yesterday","0":"Today","1":"Tomorrow"};
  const wd = new Intl.DateTimeFormat("en-US",{weekday:"long",timeZone:"UTC"}).format(d);
  const dm = new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",timeZone:"UTC"}).format(d);
  return [names[diff] || wd, dm];
}

function crest(t){
  const bg = /^[0-9a-f]{6}$/i.test(t.color) ? "#"+t.color : "#8b95a1";
  const r=parseInt(bg.slice(1,3),16), g=parseInt(bg.slice(3,5),16), b=parseInt(bg.slice(5,7),16);
  const fg = (0.299*r+0.587*g+0.114*b) > 150 ? "#111" : "#fff";
  return `<span class="crest" style="background:${bg};color:${fg}">${esc(t.abbr.slice(0,3))}</span>`;
}
const form = f => f ? `<span class="form" title="Last 5 matches (oldest → newest)">${[...f.slice(-5)].map((c,j)=>`<i class="${c}" style="--j:${j}"></i>`).join("")}</span>` : "";

function renderKpis(list){
  const strong = list.filter(m => favP(m) >= 70).length;
  const top = list.slice().sort((a,b)=>favP(b)-favP(a))[0];
  const leagues = new Set(list.map(m=>m.league)).size;
  const hist = calStats().all;
  $("kpis").innerHTML = [
    [list.length, "Matches this day", `${leagues} ${leagues===1?"competition":"competitions"}`],
    [strong, "Favorites at 70%+", "win probability"],
    [top ? pc(favP(top)) : "–", "Top win chance", top ? (favSide(top)===0?top.h.short:top.a.short) : ""],
    [hist.n ? pc(hist.hit/hist.n*100) : "–", "Favorite hit rate", hist.n ? `${hist.n} matches tracked` : "Tracking started today"],
  ].map(([v,l,s],i)=>`<div class="kpi" style="--i:${i}"><div class="v" data-count="${esc(v)}">${v}</div><div class="l">${l}</div><div class="s">${esc(s)}</div></div>`).join("");
}


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

function renderDays(){
  const nf = favIds().length;
  $("days").innerHTML = `<button class="day favday" aria-pressed="${st.day==="fav"}" data-k="fav"><b>★ Favorites</b><small>${session ? nf+" saved" : "Sign in to save"}</small></button>` + keys.map(k => { const [a,b] = dayLabel(k); const n = ms.filter(m=>m.key===k).length;
    return `<button class="day" aria-pressed="${k===st.day}" data-k="${k}"><b>${a}</b><small>${b} · ${n} matches</small></button>`; }).join("");
  $("days").querySelectorAll("button").forEach(b => b.onclick = () => { st.day = b.dataset.k; st.league = ""; render(); });
}

function seg(id, opts, cur, set){
  $(id).innerHTML = opts.map(([v,l]) => `<button aria-pressed="${v===cur}" data-v="${v}">${l}</button>`).join("");
  $(id).querySelectorAll("button").forEach(b => b.onclick = () => { set(b.dataset.v); save(); render(); });
}

const pin = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>`;
const ballIc = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5l3.6 2.6-1.4 4.2H9.8L8.4 10.1z" fill="currentColor"/></svg>`;
const ord = n => { n = +n; const s = ["th","st","nd","rd"], v = n % 100; return n + (s[(v-20)%10] || s[v] || s[0]); };
function pos(t){
  if (!t.pos || !t.pos.rank) return "";
  const p = t.pos, tip = `${ord(p.rank)} of ${p.of}${p.group?` in ${p.group}`:""} · ${p.pts} pts from ${p.gp} games`;
  return `<span class="pos" title="${esc(tip)}">${ord(p.rank)}<small>${p.pts} pts</small></span>`;
}
function goals(m){
  if (!m.goals || !m.goals.length) return "";
  const side = id => m.goals.filter(g => g.t === id).map(g => `<span class="g">${esc(g.n)} <b>${esc(g.m)}</b>${g.pk?" (pen)":""}${g.og?" (OG)":""}</span>`).join("");
  const h = side(m.h.id), a = side(m.a.id);
  return `<div class="goals">${ballIc}<div>${h?`<div><em>${esc(m.h.short)}</em> ${h}</div>`:""}${a?`<div><em>${esc(m.a.short)}</em> ${a}</div>`:""}</div></div>`;
}
function hlBtn(m){
  if (m.state === "pre") return "";
  const day = new Intl.DateTimeFormat("en-CA",{timeZone:"UTC"}).format(m.d);
  const yt = "https://www.youtube.com/results?search_query=" + encodeURIComponent(`${m.h.name} vs ${m.a.name} highlights ${day}`);
  const href = m.video || yt, src = m.video ? "ESPN" : "YouTube";
  return `<a class="hl" href="${esc(href)}" target="_blank" rel="noopener" title="Watch highlights on ${src}"><span class="hl-ic"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg></span>${m.state==="in"?"Watch live clips":"Highlights"}</a>`;
}
function rowHtml(m, idx=0){
  const fs = favSide(m), fp = favP(m), [tn, tl] = tierOf(fp), w = winIdx(m.winner);
  const team = (t, i) => `<div class="t ${i*2===fs?"fav":""}">${crest(t)}<span class="tn" title="${esc(t.name)}">${esc(t.name)}</span>${pos(t)}${form(t.form)}${m.score?`<span class="sc">${esc(m.score[i] ?? "")}</span>`:""}</div>`;
  const cells = [["1","Home"],["X","Draw"],["2","Away"]].map(([lab,name],i)=>`<div class="cell ${i===fs?"fav":""} ${w===i?"hit":""}"><small>${lab} · ${name}</small><b>${pc(m.p[i])}</b></div>`).join("");
  const bar = `<div class="pbar"><span style="width:${m.p[0]}%;background:${fs===0?"var(--accent)":"var(--faint)"}"></span><span style="width:${m.p[1]}%;background:var(--line)"></span><span style="width:${m.p[2]}%;background:${fs===2?"var(--accent)":"var(--faint)"}"></span></div>`;
  const dc = m.p[fs] + m.p[1];
  const ou = m.ou ? `<div><span>Over ${m.ou.line} goals</span><b>${pc(m.ou.pOver)}</b></div>` : "";
  let status = `<span class="status">Not started</span>`;
  if (m.state === "in") status = `<span class="status live">● Live ${esc(m.clock||"")}</span>`;
  if (m.state === "post") status = w < 0 ? `<span class="status">${esc(m.detail)}</span>` : (w === fs ? `<span class="status ok">✓ Correct</span>` : `<span class="status bad">✗ ${w===1?"Draw":"Upset"}</span>`);
  return `<div class="row" style="--i:${idx}">
    <div class="time"><b>${hm(m.d).replace(/\s?[AP]M$/,"")}</b><small>${hm(m.d).slice(-2)} PT</small></div>
    <div class="teams">${team(m.h,0)}${team(m.a,1)}<div class="league-sm"><span class="ctry">${esc(m.country||"")}</span>${m.country?" · ":""}${esc(m.league)}</div>${m.venue?`<div class="venue" title="${esc(m.venue)}">${pin} ${esc(m.venue)}</div>`:""}${goals(m)}</div>
    <div class="x12w"><div class="x12">${cells}</div>${bar}</div>
    <div class="mk"><div><span>Not to lose</span><b>${pc(dc)}</b></div><div><span>${m.model?"Fair odds":"Win odds"}</span><b>${m.dec[fs].toFixed(2)}</b></div>${ou}</div>
    <div class="st"><div class="st-top"><span class="tier t${tn}">${tl}</span>${starBtn(m.id)}</div>${m.model?`<span class="src" title="No bookmaker odds for this match. Estimated from each team's goals scored and conceded per game this season, with home advantage.">Model estimate</span>`:""}${status}${hlBtn(m)}${m.url?`<span class="status"><a href="${esc(m.url)}" target="_blank" rel="noopener">Match details ↗</a></span>`:""}</div>
  </div>`;
}

function calStats(){
  const tiers = {4:{n:0,hit:0,exp:0},3:{n:0,hit:0,exp:0},2:{n:0,hit:0,exp:0},1:{n:0,hit:0,exp:0}}, all={n:0,hit:0};
  for (const [ts,p,w] of (DATA?.history||[])) {
    const fs = p[0] >= p[2] ? 0 : 2, fp = p[fs], t = tierOf(fp)[0], hit = winIdx(w) === fs;
    tiers[t].n++; tiers[t].hit += hit; tiers[t].exp += fp; all.n++; all.hit += hit;
  }
  return {tiers, all};
}

function renderCal(){
  const {tiers, all} = calStats();
  if (!all.n) {
    $("calNote").textContent = "From today, every finished match is recorded with its pre-match probability. After a few days this table shows how often each confidence tier actually delivered.";
    $("cal").innerHTML = ""; return;
  }
  $("calNote").textContent = `Of ${all.n} finished matches in the last 60 days, the favorite won ${all.hit}. The dark tick on each row is the average probability the odds implied; when the green bar sits close to it, the probabilities were realistic.`;
  const names = {4:"Very strong (75%+)",3:"Strong (65–75%)",2:"Moderate (55–65%)",1:"Close (under 55%)"};
  $("cal").innerHTML = `<tr><th>Tier</th><th>Matches</th><th>Favorite won</th><th>Implied</th><th style="width:35%">Comparison</th></tr>` +
    [4,3,2,1].map(t => { const x = tiers[t]; if (!x.n) return "";
      const real = x.hit/x.n*100, exp = x.exp/x.n;
      return `<tr><td><span class="tier t${t}">${names[t]}</span></td><td>${x.n}</td><td><b>${pc(real)}</b></td><td>${pc(exp)}</td><td><div class="meter"><span style="width:${real}%"></span><i style="left:${exp}%"></i></div></td></tr>`; }).join("");
}

function render(){
  renderDays();
  seg("minSeg", [["0","All"],["55","55%+"],["65","65%+"],["75","75%+"]], String(st.min), v => st.min = +v);
  seg("sortSeg", [["p","Chance"],["t","Time"],["l","League"]], st.sort, v => st.sort = v);
  if (st.day === "fav") { renderFavs(); renderCal(); return; }
  const dayList = ms.filter(m => m.key === st.day);
  renderKpis(dayList); renderSpot(dayList);
  const lgs = [...new Set(dayList.map(m=>m.league))].sort((a,b)=>{ const ca=(dayList.find(m=>m.league===a)||{}).country||"", cb=(dayList.find(m=>m.league===b)||{}).country||""; return ca.localeCompare(cb)||a.localeCompare(b); });
  const ctryOf = l => (dayList.find(m=>m.league===l)||{}).country || "";
  if (st.league && !lgs.includes(st.league)) st.league = "";
  $("league").innerHTML = `<option value="">All leagues (${lgs.length})</option>` + lgs.map(l=>`<option ${l===st.league?"selected":""} value="${esc(l)}">${esc(ctryOf(l) ? ctryOf(l)+" · "+l : l)}</option>`).join("");
  const q = st.q.toLowerCase();
  let list = dayList.filter(m => favP(m) >= st.min && (!st.league || m.league === st.league) && (!q || (m.h.name+" "+m.a.name+" "+m.league+" "+(m.country||"")+" "+(m.venue||"")+" "+(m.goals||[]).map(g=>g.n).join(" ")).toLowerCase().includes(q)));
  if (st.sort === "p") list.sort((a,b) => favP(b)-favP(a) || a.d-b.d);
  if (st.sort === "t") list.sort((a,b) => a.d-b.d || favP(b)-favP(a));
  if (st.sort === "l") list.sort((a,b) => a.league.localeCompare(b.league) || a.d-b.d);
  if (!list.length) { $("rows").innerHTML = `<div class="empty">No matches fit these filters. Set the minimum chance to "All" or pick another day.</div>`; renderCal(); return; }
  let html = "", last = null, i = 0;
  for (const m of list) {
    if (st.sort === "l" && m.league !== last) { html += `<div class="lg" style="--i:${i}">${esc(m.league)}</div>`; last = m.league; }
    html += rowHtml(m, i++);
  }
  $("rows").innerHTML = html;
  renderCal();
  countUp();
}

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
function countUp(){
  if (reduce) return;
  document.querySelectorAll(".kpi .v, .cell.fav b").forEach((el, n) => {
    const m = el.textContent.match(/^(\d+)(%?)$/); if (!m) return;
    const end = +m[1], suf = m[2], t0 = performance.now() + (el.closest(".row") ? Math.min(n,14)*35 : 0), dur = 700;
    const step = now => { const k = Math.min(1, Math.max(0, (now - t0) / dur)); const e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * e) + suf; if (k < 1) requestAnimationFrame(step); };
    el.textContent = "0" + suf; requestAnimationFrame(step);
  });
}

if (DATA) {
  const g = new Date(DATA.generated);
  $("footUpd").textContent = "Data updated " + new Intl.DateTimeFormat("en-US",{timeZone:TZ,month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(g) + " PT";
  $("updated").textContent = "Live odds · updated " + new Intl.DateTimeFormat("en-US",{timeZone:TZ,weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(g) + " PT";
}
$("league").onchange = e => { st.league = e.target.value; render(); };
$("q").oninput = e => { st.q = e.target.value.trim(); render(); };
render();

/* hero: top upcoming picks marquee */
(function(){
  const now = Date.now();
  const picks = ms.filter(m => m.state === "pre" && m.d.getTime() > now).sort((a,b)=>favP(b)-favP(a)).slice(0,12);
  if (!picks.length) { document.querySelector(".marquee").hidden = true; return; }
  const card = m => { const fs = favSide(m), t = fs===0?m.h:m.a, o = fs===0?m.a:m.h;
    return `<div class="pick"><div class="pp">${pc(favP(m))}</div><div class="pt">${esc(t.name)}</div><div class="pm">vs ${esc(o.name)} · ${esc(dayLabel(m.key)[0])} ${hm(m.d)} PT</div><div class="pb"><span style="width:${favP(m)}%"></span></div><div class="pm">${esc(m.league)}</div></div>`; };
  const html = picks.map(card).join("");
  $("track").innerHTML = html + html.replace(/class="pick"/g,'class="pick" aria-hidden="true"');
})();

/* 3D hero (three.js): a night stadium with floodlights, a looping shot into the net,
   and glowing probability pillars for the day's top upcoming favorites.
   Camera follows the mouse and dollies down the pitch as you scroll.
   Runs inside run(DATA): uses ms, favP, favSide, pc, hm, dayLabel, reduce, $. */
function startHero3D(){
  const box = $("fxbox"), old = $("fx");
  if (!box || !old) return Promise.reject("no hero box");
  const probe = document.createElement("canvas");
  if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return Promise.reject("no webgl");
  return import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js").then(THREE => {
    const cv = document.createElement("canvas"); cv.id = "fx3d"; cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "3D night stadium: floodlights, a ball curling into the net, and glowing pillars showing today's strongest favorites");
    old.replaceWith(cv); cv.id = "fx";
    const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: "high-performance" });
    R.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.15;
    const S = new THREE.Scene(); S.background = new THREE.Color("#060814"); S.fog = new THREE.FogExp2("#060814", 0.0055);
    const cam = new THREE.PerspectiveCamera(38, 1, 0.5, 600);
    const MINT = new THREE.Color("#2cf6b3"), VIO = new THREE.Color("#7a5cff"), PINK = new THREE.Color("#ff4d9d");
    const tex = (w, h, draw) => { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

    // pitch
    const pitchTex = tex(1024, 664, (g, w, h) => {
      for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? "#0e3a28" : "#11452f"; g.fillRect(i * w / 12, 0, w / 12 + 1, h); }
      g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 4; const m = 20;
      g.strokeRect(m, m, w - 2 * m, h - 2 * m); g.beginPath(); g.moveTo(w / 2, m); g.lineTo(w / 2, h - m); g.stroke();
      g.beginPath(); g.arc(w / 2, h / 2, 88, 0, 7); g.stroke();
      [[m, 1], [w - m, -1]].forEach(([x0, d]) => { g.strokeRect(Math.min(x0, x0 + d * 160), h / 2 - 200, 160, 400); g.strokeRect(Math.min(x0, x0 + d * 55), h / 2 - 90, 55, 180); });
    });
    const pitch = new THREE.Mesh(new THREE.PlaneGeometry(105, 68), new THREE.MeshStandardMaterial({ map: pitchTex, roughness: .95, metalness: 0 }));
    pitch.rotation.x = -Math.PI / 2; S.add(pitch);
    const apron = new THREE.Mesh(new THREE.PlaneGeometry(260, 200), new THREE.MeshStandardMaterial({ color: "#071a14", roughness: 1 }));
    apron.rotation.x = -Math.PI / 2; apron.position.y = -.05; S.add(apron);

    // goals
    const white = new THREE.MeshStandardMaterial({ color: "#f4f7ff", emissive: "#9fb4ff", emissiveIntensity: .25, roughness: .4 });
    const netMat = new THREE.MeshBasicMaterial({ color: "#dfe8ff", wireframe: true, transparent: true, opacity: .22 });
    function goal(x, d){
      const G = new THREE.Group(), post = new THREE.CylinderGeometry(.14, .14, 2.44, 10);
      [-3.66, 3.66].forEach(z => { const p = new THREE.Mesh(post, white); p.position.set(0, 1.22, z); G.add(p); });
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, 7.6, 10), white); bar.rotation.x = Math.PI / 2; bar.position.y = 2.44; G.add(bar);
      const back = new THREE.Mesh(new THREE.PlaneGeometry(7.32, 2.44, 18, 7), netMat); back.position.set(d * 2, 1.22, 0); back.rotation.y = Math.PI / 2; G.add(back);
      const top = new THREE.Mesh(new THREE.PlaneGeometry(2, 7.32, 5, 18), netMat); top.rotation.x = -Math.PI / 2; top.position.set(d, 2.44, 0); G.add(top);
      G.position.x = x; S.add(G); return { G, back };
    }
    const goalR = goal(52.5, 1); goal(-52.5, -1);

    // lights: soft fill + four floodlight towers with visible beams
    S.add(new THREE.HemisphereLight("#7aa2ff", "#0b2a1d", .9));
    const beamMat = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    [[-62, -46, MINT], [62, -46, VIO], [-62, 46, VIO], [62, 46, PINK]].forEach(([x, z, c]) => {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(.5, .8, 34, 8), new THREE.MeshStandardMaterial({ color: "#1b2140", roughness: .8 }));
      tower.position.set(x, 17, z); S.add(tower);
      const head = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 1), new THREE.MeshBasicMaterial({ color: "#fffaf0" })); head.position.set(x, 35, z); head.lookAt(0, 0, 0); S.add(head);
      const L = new THREE.SpotLight("#fff6e5", 5200, 240, .6, .55, 1.5); L.position.set(x, 35, z); L.target.position.set(x * .2, 0, z * .2); S.add(L, L.target);
      const len = Math.hypot(x * .8, 35, z * .8), cone = new THREE.Mesh(new THREE.ConeGeometry(14, len, 24, 1, true), beamMat(c));
      cone.position.set(x * .6, 17.5, z * .6); cone.lookAt(x, 35, z); cone.rotateX(Math.PI / 2); S.add(cone);
    });

    // stands with a twinkling crowd
    const N = 5200, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), pal = [MINT, VIO, PINK, new THREE.Color("#eef1ff"), new THREE.Color("#5ad1ff")];
    for (let i = 0; i < N; i++) {
      const side = i % 4, t = Math.random(), tier = Math.random();
      const r = 6 + tier * 22, yy = 2 + tier * 14;
      let x, z; if (side < 2) { x = (t - .5) * 120; z = (side ? 1 : -1) * (34 + r); } else { z = (t - .5) * 80; x = (side === 2 ? 1 : -1) * (52.5 + r); }
      pos.set([x, yy, z], i * 3); const c = pal[(Math.random() * 5) | 0].clone().multiplyScalar(.35 + Math.random() * .6); col.set([c.r, c.g, c.b], i * 3);
    }
    const crowdG = new THREE.BufferGeometry(); crowdG.setAttribute("position", new THREE.BufferAttribute(pos, 3)); crowdG.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const crowd = new THREE.Points(crowdG, new THREE.PointsMaterial({ size: .55, vertexColors: true, transparent: true, opacity: .85, depthWrite: false }));
    S.add(crowd);

    // ball
    const ballTex = tex(512, 256, (g, w, h) => { g.fillStyle = "#f6f8ff"; g.fillRect(0, 0, w, h); g.fillStyle = "#151a2c";
      for (let i = 0; i < 14; i++) { const x = (i % 7) * w / 7 + (i > 6 ? w / 14 : 0), y = i > 6 ? h * .72 : h * .3; g.beginPath();
        for (let k = 0; k < 5; k++) { const a = k * 1.2566 - 1.57; g.lineTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26); } g.fill(); } });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.9, 32, 20), new THREE.MeshStandardMaterial({ map: ballTex, roughness: .45 }));
    S.add(ball);
    const trailN = 26, trail = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(trailN * 3), 3)),
      new THREE.PointsMaterial({ color: MINT, size: .9, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
    S.add(trail); const hist = [];

    // confetti burst on each goal
    const CN = 420, cPos = new Float32Array(CN * 3), cVel = new Float32Array(CN * 3), cCol = new Float32Array(CN * 3);
    for (let i = 0; i < CN; i++) { const c = pal[i % 3]; cCol.set([c.r, c.g, c.b], i * 3); cPos[i * 3 + 1] = -50; }
    const confG = new THREE.BufferGeometry(); confG.setAttribute("position", new THREE.BufferAttribute(cPos, 3)); confG.setAttribute("color", new THREE.BufferAttribute(cCol, 3));
    const conf = new THREE.Points(confG, new THREE.PointsMaterial({ size: .5, vertexColors: true, transparent: true, depthWrite: false })); S.add(conf);
    function burst(){ for (let i = 0; i < CN; i++) { cPos.set([52 + Math.random() * 2, 2 + Math.random() * 2, (Math.random() - .5) * 6], i * 3);
      cVel.set([-(Math.random() * .5 + .1), Math.random() * .7 + .25, (Math.random() - .5) * .8], i * 3); } }

    // probability pillars: top upcoming favorites
    const now = Date.now();
    const picks = ms.filter(m => m.state === "pre" && m.d.getTime() > now).sort((a, b) => favP(b) - favP(a)).slice(0, 5);
    const pillars = [];
    const label = (m, i) => tex(512, 256, (g, w, h) => { const fs = favSide(m), t = fs === 0 ? m.h : m.a;
      g.fillStyle = "rgba(10,14,32,.82)"; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 36); g.fill();
      g.strokeStyle = "rgba(44,246,179,.6)"; g.lineWidth = 4; g.stroke();
      g.fillStyle = "#2cf6b3"; g.font = "700 92px 'Space Grotesk', sans-serif"; g.fillText(pc(favP(m)), 36, 112);
      g.fillStyle = "#eef1ff"; g.font = "600 40px Inter, sans-serif"; g.fillText(String(t.name).slice(0, 18), 36, 168);
      g.fillStyle = "#9aa3c7"; g.font = "500 30px Inter, sans-serif"; g.fillText(`#${i + 1} · ${dayLabel(m.key)[0]} ${hm(m.d)} PT`, 36, 214); });
    picks.forEach((m, i) => {
      const p = favP(m), hgt = 4 + (p - 45) * .32, x = 15 + i * 7.5, z = -10 + i * 4;
      const mat = new THREE.MeshStandardMaterial({ color: MINT.clone().lerp(VIO, i / 4).multiplyScalar(.5), emissive: MINT.clone().lerp(VIO, i / 4), emissiveIntensity: .7, roughness: .5, metalness: .2 });
      const pil = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1, 6), mat); pil.geometry.translate(0, .5, 0);
      pil.position.set(x, 0, z); pil.scale.y = .001; S.add(pil);
      const ring = new THREE.Mesh(new THREE.RingGeometry(2, 2.6, 6), new THREE.MeshBasicMaterial({ color: mat.color, transparent: true, opacity: .6, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(x, .05, z); S.add(ring);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: label(m, i), transparent: true, depthWrite: false })); sp.scale.set(11, 5.5, 1); sp.position.set(x, hgt + 3.4, z); sp.material.opacity = 0; S.add(sp);
      pillars.push({ pil, ring, sp, hgt, mat, delay: .6 + i * .18, m });
    });

    // interaction: mouse parallax, scroll dolly, hover + click on pillars
    let mx = 0, my = 0, tx = 0, ty = 0, scrollK = 0, hover = null, playing = !reduce, visible = true;
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(-9, -9);
    box.parentElement.addEventListener("pointermove", e => { const r = cv.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width * 2 - 1; ty = (e.clientY - r.top) / r.height * 2 - 1; ndc.set(tx, -ty); });
    box.parentElement.addEventListener("click", e => { if (hover && !e.target.closest("a,button")) { st.day = hover.m.key; render(); $("board-top").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); } });
    addEventListener("scroll", () => { const hh = box.parentElement.offsetHeight || 1; scrollK = Math.min(1, Math.max(0, scrollY / hh)); }, { passive: true });
    if ("IntersectionObserver" in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(box);
    function size(){ const w = box.clientWidth || innerWidth, h = box.clientHeight || 600; R.setSize(w, h, false); cam.aspect = w / h;
      cam.fov = w < 700 ? 52 : 38; cam.updateProjectionMatrix(); }
    size(); addEventListener("resize", size);

    const clock = new THREE.Clock(); let t = 0, lastShot = -1;
    const tgt = new THREE.Vector3();
    function frame(){
      const dt = Math.min(.05, clock.getDelta()); if (playing) t += dt;
      mx += (tx - mx) * .05; my += (ty - my) * .05;
      const narrow = cam.aspect < 1;
      // camera: high orbit that sweeps down toward the goal as you scroll
      const a = -.35 + Math.sin(t * .12) * .08 + mx * .18;
      const dist = 92 - scrollK * 38, ht = 44 - scrollK * 30 - my * 6;
      cam.position.set(Math.sin(a) * dist + scrollK * 20, ht, Math.cos(a) * dist);
      tgt.set(narrow ? 26 : 4 + scrollK * 24, 3, -2); cam.lookAt(tgt);
      // ball: 3.6s shot loop from midfield into the right goal's top corner
      const L = 4.2, k = (t % L) / 1.6, shot = Math.floor(t / L);
      if (k <= 1) { const e = k < 0 ? 0 : 1 - Math.pow(1 - k, 2.2);
        ball.position.set(-4 + e * 59, .9 + Math.sin(e * Math.PI) * 7 + e * .8, 10 - e * 12 - Math.sin(e * Math.PI) * 6);
        ball.rotation.z -= dt * 14; ball.rotation.x += dt * 6; }
      else { const f = Math.min(1, (k - 1) * 1.6); ball.position.set(55.4 - f * .5, 3.2 - f * 2.3, -2 + f * .4); }
      if (k > 1 && shot !== lastShot) { lastShot = shot; burst(); }
      const bulge = k > 1 ? Math.max(0, 1 - (k - 1) * 1.4) : 0; goalR.back.position.x = 2 + bulge * .9;
      hist.unshift(ball.position.clone()); hist.length = Math.min(hist.length, trailN);
      const tp = trail.geometry.attributes.position; for (let i = 0; i < trailN; i++) { const v = hist[i] || ball.position; tp.setXYZ(i, v.x, v.y, v.z); } tp.needsUpdate = true;
      trail.material.opacity = k <= 1 ? .55 : .0;
      for (let i = 0; i < CN; i++) { const j = i * 3; if (cPos[j + 1] < -10) continue; cVel[j + 1] -= .018; cPos[j] += cVel[j]; cPos[j + 1] += cVel[j + 1]; cPos[j + 2] += cVel[j + 2]; if (cPos[j + 1] < 0) cPos[j + 1] = -50; }
      confG.attributes.position.needsUpdate = true;
      crowd.material.opacity = .7 + Math.sin(t * 3) * .12;
      // pillars rise, pulse, and react to hover
      ray.setFromCamera(ndc, cam); const hit = ray.intersectObjects(pillars.map(p => p.pil))[0];
      hover = hit ? pillars.find(p => p.pil === hit.object) : null; cv.style.cursor = hover ? "pointer" : "";
      pillars.forEach((p, i) => { const g = reduce ? 1 : Math.min(1, Math.max(0, (clock.elapsedTime - p.delay) / 1.1)), e = 1 - Math.pow(1 - g, 3);
        const on = hover === p, s = on ? 1.18 : 1;
        p.pil.scale.set(p.pil.scale.x + (s - p.pil.scale.x) * .15, Math.max(.001, p.hgt * e), p.pil.scale.z + (s - p.pil.scale.z) * .15);
        p.mat.emissiveIntensity = (on ? 1.3 : .6) + Math.sin(t * 2 + i) * .2;
        p.ring.scale.setScalar(1 + ((t * .6 + i * .2) % 1) * .8); p.ring.material.opacity = .6 * (1 - ((t * .6 + i * .2) % 1));
        p.sp.material.opacity = e * (on ? 1 : .9); p.sp.position.y = p.hgt * e + 3.4 + Math.sin(t * 1.5 + i) * .25; });
      R.render(S, cam);
    }
    function loop(){ if (visible && !document.hidden) frame(); requestAnimationFrame(loop); }
    if (reduce) { t = 1.2; for (let i = 0; i < 3; i++) frame(); addEventListener("resize", frame); } else requestAnimationFrame(loop);

    const btn = $("vctl");
    if (btn) { const ic = on => on ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>' : '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 5l12 7-12 7z"/></svg>';
      btn.innerHTML = ic(playing); btn.setAttribute("aria-label", playing ? "Pause animation" : "Play animation");
      btn.onclick = () => { playing = !playing; btn.innerHTML = ic(playing); btn.setAttribute("aria-label", playing ? "Pause animation" : "Play animation"); if (reduce && playing) requestAnimationFrame(loop); }; }
    document.documentElement.classList.add("sp-3d");
  });
}

/* hero video: an original, code-rendered night-match scene (stadium lights, crowd, a curling shot into the net) */
function hero2d(){
  const c = $("fx"); if (!c) return; const x = c.getContext("2d"); if (!x) return;
  let w = 0, h = 0, dpr = 1, raf = 0, playing = !reduce, start = performance.now(), pausedAt = 0;
  let crowd = [], confetti = [], netHit = 0, flashes = [];
  const P = 7.5;                       // loop length in seconds
  const rnd = (a, b) => a + Math.random() * (b - a);
  function size(){
    dpr = Math.min(2, devicePixelRatio || 1); w = c.clientWidth; h = c.clientHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); x.setTransform(dpr, 0, 0, dpr, 0, 0);
    crowd = Array.from({length: Math.round(w * 0.9)}, () => ({ x: Math.random() * w, y: rnd(.2, .47) * h, r: rnd(.8, 2.4),
      c: ["#2cf6b3","#7a5cff","#ff4d9d","#e8edf5","#3ddc97","#5aa9ff"][Math.floor(Math.random() * 6)], a: rnd(.15, .55), p: Math.random() * 6 }));
  }
  const goal = () => { const gw = Math.min(w * .26, 360), gx = w * .64, gy = h * .5; return { x: gx, y: gy, w: gw, h: gw * .38 }; };
  function ballAt(k){ // k: 0..1 along the shot
    const g = goal(), s = { x: w * .22, y: h * .93 }, e = { x: g.x + g.w * .86, y: g.y + g.h * .2 }, c1 = { x: w * .62, y: h * .98 };
    const u = 1 - k; return { x: u*u*s.x + 2*u*k*c1.x + k*k*e.x, y: u*u*s.y + 2*u*k*c1.y + k*k*e.y, r: (1 - k * .72) * Math.max(10, w * .014) };
  }
  function frame(now){
    const t = ((now - start) / 1000) % P;
    const shotK = Math.min(1, Math.max(0, (t - 1.0) / 1.5)), ease = shotK < 1 ? 1 - Math.pow(1 - shotK, 2.2) : 1;
    const hitT = t - 2.5;                                  // seconds since the ball hit the net
    if (hitT >= 0 && hitT < 0.05 && netHit < .5) { netHit = 1; burst(); }
    netHit *= .94;
    const zoom = 1 + .05 * (t / P) + (hitT > 0 && hitT < .35 ? .012 * Math.sin(hitT * 60) : 0);
    x.setTransform(dpr * zoom, 0, 0, dpr * zoom, -w * dpr * (zoom - 1) * .6, -h * dpr * (zoom - 1) * .4);
    // sky
    let g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#04060a"); g.addColorStop(.45, "#0a1220"); g.addColorStop(1, "#04060f");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    // stands + crowd
    x.fillStyle = "#0b111b"; x.beginPath(); x.moveTo(0, h * .18); x.quadraticCurveTo(w * .5, h * .1, w, h * .18); x.lineTo(w, h * .5); x.lineTo(0, h * .5); x.fill();
    for (const d of crowd) { x.globalAlpha = d.a * (.7 + .3 * Math.sin(t * 2 + d.p) + (hitT > 0 && hitT < 2 ? .5 : 0)); x.fillStyle = d.c; x.beginPath(); x.arc(d.x, d.y + (hitT > 0 && hitT < 2 ? -Math.abs(Math.sin(t * 9 + d.p)) * 2 : 0), d.r, 0, 7); x.fill(); }
    x.globalAlpha = 1;
    // camera flashes in the crowd
    if (Math.random() < (hitT > 0 && hitT < 2.5 ? .55 : .06)) flashes.push({ x: Math.random() * w, y: rnd(.2, .46) * h, life: 1 });
    x.globalCompositeOperation = "lighter";
    for (const f of flashes) { const rg = x.createRadialGradient(f.x, f.y, 0, f.x, f.y, 14 * f.life); rg.addColorStop(0, `rgba(255,255,255,${.9 * f.life})`); rg.addColorStop(1, "transparent"); x.fillStyle = rg; x.fillRect(f.x - 16, f.y - 16, 32, 32); f.life -= .08; }
    flashes = flashes.filter(f => f.life > 0);
    // floodlights and beams
    [[.08, .06], [.36, .02], [.64, .02], [.92, .06]].forEach(([fx, fy], i) => {
      const lx = fx * w, ly = fy * h, sway = Math.sin(t * .6 + i) * .04;
      const bg = x.createLinearGradient(lx, ly, w * (.5 + sway), h * .9); bg.addColorStop(0, "rgba(200,255,240,.22)"); bg.addColorStop(1, "rgba(200,255,240,0)");
      x.fillStyle = bg; x.beginPath(); x.moveTo(lx - 8, ly); x.lineTo(w * (.5 + sway) - w * .28, h); x.lineTo(w * (.5 + sway) + w * .28, h); x.lineTo(lx + 8, ly); x.fill();
      const gl = x.createRadialGradient(lx, ly, 0, lx, ly, 90); gl.addColorStop(0, "rgba(255,250,235,.95)"); gl.addColorStop(.12, "rgba(255,225,160,.5)"); gl.addColorStop(1, "transparent");
      x.fillStyle = gl; x.fillRect(lx - 90, ly - 90, 180, 180);
    });
    x.globalCompositeOperation = "source-over";
    // pitch with mowing stripes in perspective
    const hz = h * .48;
    for (let i = 0; i < 16; i++) { const y0 = hz + Math.pow(i / 16, 1.8) * (h - hz), y1 = hz + Math.pow((i + 1) / 16, 1.8) * (h - hz);
      x.fillStyle = i % 2 ? "#0f3a24" : "#12452b"; x.fillRect(0, y0, w, y1 - y0 + 1); }
    g = x.createRadialGradient(w * .55, h * .75, 0, w * .55, h * .75, w * .6); g.addColorStop(0, "rgba(200,255,240,.16)"); g.addColorStop(1, "rgba(0,0,0,.35)");
    x.fillStyle = g; x.fillRect(0, hz, w, h - hz);
    // box lines
    const G = goal(); x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(G.x - G.w * .55, G.y + G.h + 2); x.lineTo(G.x - G.w * .9, h * .78); x.lineTo(G.x + G.w * 1.9, h * .78); x.lineTo(G.x + G.w * 1.45, G.y + G.h + 2); x.stroke();
    x.beginPath(); x.moveTo(0, G.y + G.h + 2); x.lineTo(w, G.y + G.h + 2); x.stroke();
    // net (mesh bulges where the ball hits)
    const hx = G.x + G.w * .86, hy = G.y + G.h * .2;
    x.strokeStyle = "rgba(230,240,255,.28)"; x.lineWidth = .8;
    const cols = 22, rows = 9, depth = G.w * .12;
    const pt = (i, j) => { const px = G.x + i / cols * G.w, py = G.y + j / rows * G.h; const d = Math.hypot(px - hx, py - hy), push = netHit * Math.max(0, 1 - d / (G.w * .35)) * depth * 1.6;
      return [px + push * .5 + depth * .35, py - push * .25 + depth * .2]; };
    for (let i = 0; i <= cols; i++) { x.beginPath(); for (let j = 0; j <= rows; j++) { const [a, b] = pt(i, j); j ? x.lineTo(a, b) : x.moveTo(a, b); } x.stroke(); }
    for (let j = 0; j <= rows; j++) { x.beginPath(); for (let i = 0; i <= cols; i++) { const [a, b] = pt(i, j); i ? x.lineTo(a, b) : x.moveTo(a, b); } x.stroke(); }
    // goal frame
    x.strokeStyle = "#f4f6fa"; x.lineWidth = Math.max(3, G.w * .018); x.lineCap = "round"; x.shadowColor = "rgba(255,255,255,.6)"; x.shadowBlur = 10;
    x.beginPath(); x.moveTo(G.x, G.y + G.h); x.lineTo(G.x, G.y); x.lineTo(G.x + G.w, G.y); x.lineTo(G.x + G.w, G.y + G.h); x.stroke(); x.shadowBlur = 0;
    // ball, with trail and spin
    if (t > .6 && t < 4.6) {
      const k = t < 1 ? 0 : ease; const B = hitT > 0 ? (() => { const e = ballAt(1); return { x: e.x + Math.min(hitT, .4) * 30, y: e.y + Math.pow(Math.max(0, hitT - .2), 2) * 120, r: e.r }; })() : ballAt(k);
      if (hitT > 1.6 && hitT < 2.1) x.globalAlpha = 1 - (hitT - 1.6) / .5; if (hitT >= 2.1) x.globalAlpha = 0;
      if (shotK > 0 && shotK < 1) for (let i = 1; i <= 14; i++) { const p = ballAt(Math.max(0, ease - i * .018)); x.fillStyle = `rgba(44,246,179,${.22 * (1 - i / 14)})`; x.beginPath(); x.arc(p.x, p.y, p.r * (1 - i / 22), 0, 7); x.fill(); }
      x.fillStyle = "rgba(0,0,0,.35)"; x.beginPath(); x.ellipse(B.x + B.r * .3, Math.min(h * .97, B.y + B.r * 3.2), B.r * 1.1, B.r * .35, 0, 0, 7); x.fill();
      const bgr = x.createRadialGradient(B.x - B.r * .35, B.y - B.r * .35, B.r * .1, B.x, B.y, B.r); bgr.addColorStop(0, "#ffffff"); bgr.addColorStop(1, "#b9c2cf");
      x.fillStyle = bgr; x.beginPath(); x.arc(B.x, B.y, B.r, 0, 7); x.fill();
      x.save(); x.translate(B.x, B.y); x.rotate(t * 9); x.fillStyle = "#1a1f27";
      for (let i = 0; i < 5; i++) { const a = i * 1.2566; x.beginPath(); x.arc(Math.cos(a) * B.r * .62, Math.sin(a) * B.r * .62, B.r * .2, 0, 7); x.fill(); }
      x.beginPath(); x.arc(0, 0, B.r * .26, 0, 7); x.fill(); x.restore(); x.globalAlpha = 1;
    }
    // goal flash and confetti
    if (hitT > 0 && hitT < .6) { x.fillStyle = `rgba(180,255,230,${.28 * (1 - hitT / .6)})`; x.fillRect(0, 0, w, h); }
    for (const p of confetti) { p.x += p.vx; p.y += p.vy; p.vy += .06; p.vx *= .99; p.rot += p.vr; p.life -= .006;
      x.save(); x.translate(p.x, p.y); x.rotate(p.rot); x.globalAlpha = Math.max(0, p.life); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); }
    x.globalAlpha = 1; confetti = confetti.filter(p => p.life > 0 && p.y < h + 20);
    if (t > P - .25 && netHit < .05) netHit = 0;
    if (playing) raf = requestAnimationFrame(frame);
  }
  function burst(){ const G = goal(); for (let i = 0; i < 160; i++) confetti.push({ x: G.x + G.w * rnd(.2, 1), y: G.y + rnd(-20, G.h), vx: rnd(-5, 5), vy: rnd(-9, -2), vr: rnd(-.3, .3), rot: Math.random() * 6, s: rnd(5, 10), life: 1,
    c: ["#2cf6b3","#7a5cff","#ff4d9d","#ffffff","#3ddc97"][Math.floor(Math.random() * 5)] }); }
  const btn = $("vctl");
  function setPlaying(on){ playing = on; btn.setAttribute("aria-label", on ? "Pause video" : "Play video");
    btn.innerHTML = on ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>' : '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 5l12 7-12 7z"/></svg>';
    if (on) { start += performance.now() - pausedAt; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } else { pausedAt = performance.now(); cancelAnimationFrame(raf); } }
  btn.onclick = () => setPlaying(!playing);
  size(); addEventListener("resize", () => { size(); if (!playing) frame(pausedAt || performance.now()); });
  if (playing) raf = requestAnimationFrame(frame); else { pausedAt = start + 2600; netHit = 1; frame(pausedAt); setPlaying(false); }
  document.addEventListener("visibilitychange", () => { if (document.hidden && playing) { cancelAnimationFrame(raf); pausedAt = performance.now(); } else if (!document.hidden && playing) { start += performance.now() - pausedAt; raf = requestAnimationFrame(frame); } });
}



startHero3D().catch(function(e){ console.warn('3D hero unavailable, using 2D', e); hero2d(); });

/* navbar: mobile menu + active section */
(function(){
  const b = $("burger"), L = $("links"); if (!b || !L) return;
  b.onclick = () => { const o = L.classList.toggle("open"); b.setAttribute("aria-expanded", o); };
  L.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { L.classList.remove("open"); b.setAttribute("aria-expanded", false); }));
  const secs = ["board-top","accuracy","method"].map(id => document.getElementById(id)).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) L.querySelectorAll("a").forEach(a => a.classList.toggle("on", a.id !== "navFavs" && a.getAttribute("href") === "#"+e.target.id)); }), {rootMargin:"-40% 0px -55% 0px"});
    secs.forEach(s => io.observe(s));
  }
})();

/* accounts + favorites
   Hosted on claude.ai: identity is verified by the viewer's Claude account (user capability);
   the profile and favorites live in the artifact database under data/users/<id>/, private to that person.
   Static copy (GitHub): no account backend, favorites are kept in this browser only. */
(function(){
  const box = $("acct"), panel = $("authPanel"), bIn = $("btnSignin"), bUp = $("btnSignup");
  let me = null, col = null, mode = "loading";       // loading | hosted | guest (no Claude sign-in) | local (static copy)
  const toast = msg => { const t = $("toast"); t.textContent = msg; t.hidden = false; t.classList.remove("show"); void t.offsetWidth; t.classList.add("show"); clearTimeout(toast.h); toast.h = setTimeout(() => { t.hidden = true; }, 2600); };
  const lsGet = k => { try { return localStorage.getItem(k); } catch(e) { return null; } };
  const mem = {};   // fallback when browser storage is blocked
  const lsSet = (k, v) => { mem[k] = v; try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch(e) {} };
  const stored = k => { const v = lsGet(k); return v != null ? v : (mem[k] ?? null); };

  function openAuth(tab){
    panel.hidden = false; showTab(tab || (profile ? "in" : "up"));
    if (tab !== "in") setTimeout(() => $("upName").focus(), 50);
  }
  function closeAuth(){ panel.hidden = true; }
  function showTab(tab){
    $("tabUp").setAttribute("aria-selected", tab === "up"); $("tabIn").setAttribute("aria-selected", tab === "in");
    $("formUp").hidden = tab !== "up"; $("formIn").hidden = tab !== "in";
    $("upErr").hidden = $("inErr").hidden = true;
    const card = $("inCard"); card.replaceChildren();
    if (mode === "hosted" && me) {
      const img = document.createElement("img"); img.src = me.avatarUrl; img.alt = "";
      const d = document.createElement("div"); const b = document.createElement("b"); b.textContent = profile ? profile.name : (me.name || "Your Claude account");
      const sm = document.createElement("small"); sm.textContent = profile ? "SOCCER Pred account found" : "No SOCCER Pred account yet";
      d.append(b, sm); card.append(img, d);
    } else {
      const p = document.createElement("p"); p.className = "muted";
      p.textContent = mode === "guest" ? "Sign in to claude.ai first, then reopen this page to use your account." :
        mode === "local" ? "Accounts work in the hosted SOCCER Pred app. On this copy your favorites are saved in this browser." : "Checking your account…";
      card.append(p);
    }
    $("upFine").textContent = mode === "hosted" ? "Your account is linked to your Claude sign-in, so there is no password to manage. Only you can see your favorites." :
      mode === "local" ? "This copy has no account server. Your profile and favorites are saved in this browser only." :
      "Sign in to claude.ai first, then reopen this page to create your account.";
  }
  bIn.onclick = () => openAuth("in");
  bUp.onclick = () => openAuth("up");
  $("tabUp").onclick = () => showTab("up"); $("tabIn").onclick = () => showTab("in");
  $("authClose").onclick = closeAuth;
  panel.addEventListener("click", e => { if (e.target === panel) closeAuth(); });
  addEventListener("keydown", e => { if (e.key === "Escape") { closeAuth(); closeMenu(); } });

  // sign up
  $("formUp").addEventListener("submit", async e => {
    e.preventDefault();
    const name = $("upName").value.trim(), team = $("upTeam").value.trim(), err = $("upErr");
    if (name.length < 2) { err.textContent = "Enter a display name of at least 2 characters."; err.hidden = false; $("upName").focus(); return; }
    if (mode === "guest" || mode === "loading") { err.textContent = "Sign in to claude.ai first, then reopen this page."; err.hidden = false; return; }
    const body = { name, team, createdAt: new Date().toISOString() };
    try {
      if (mode === "hosted") await col.doc("profile").set(body);
      else lsSet("sp-local-profile", JSON.stringify(body));
      profile = body; startSession(); closeAuth(); toast(`Account created. Welcome, ${name}!`);
    } catch (x) { err.textContent = "Could not create the account right now. Try again in a moment."; err.hidden = false; }
  });
  // sign in
  $("formIn").addEventListener("submit", e => {
    e.preventDefault();
    const err = $("inErr");
    if (!profile) { err.textContent = mode === "guest" ? "Sign in to claude.ai first, then reopen this page." : "No account found. Create one on the Sign up tab."; err.hidden = false; return; }
    startSession(); closeAuth(); toast(`Signed in as ${profile.name}`);
  });
  function sessionKey(){ return mode === "hosted" ? me.id : "local"; }
  function startSession(){ lsSet("sp-session", sessionKey()); session = sessionKey(); refresh(); }
  function logout(){ lsSet("sp-session", null); session = null; closeMenu(); if (st.day === "fav") st.day = keys.includes(todayKey) ? todayKey : keys[0]; refresh(); toast("You have been logged out"); }

  // account menu
  function closeMenu(){ const m = document.querySelector(".menu"); if (m) m.hidden = true; const c = document.querySelector(".who"); if (c) c.setAttribute("aria-expanded", false); }
  function drawAcct(){
    if (!session || !profile) {
      box.replaceChildren(bIn, bUp);
      $("hello").textContent = ""; return;
    }
    const chip = document.createElement("button"); chip.type = "button"; chip.className = "who"; chip.setAttribute("aria-haspopup", "menu"); chip.setAttribute("aria-expanded", "false");
    const av = document.createElement("span"); av.className = "av";
    if (mode === "hosted" && me.avatarUrl) { const img = document.createElement("img"); img.src = me.avatarUrl; img.alt = ""; av.append(img); } else av.textContent = profile.name.slice(0, 1).toUpperCase();
    const tx = document.createElement("span"); const sm = document.createElement("small"); sm.textContent = "Signed in"; const b = document.createElement("b"); b.textContent = profile.name; tx.append(sm, b);
    chip.append(av, tx);
    const menu = document.createElement("div"); menu.className = "menu"; menu.hidden = true; menu.setAttribute("role", "menu");
    const head = document.createElement("div"); head.className = "menu-head"; const hb = document.createElement("b"); hb.textContent = profile.name; const hs = document.createElement("small");
    hs.textContent = profile.team ? `Supports ${profile.team}` : (mode === "hosted" ? "Linked to your Claude account" : "Saved in this browser"); head.append(hb, hs);
    const fav = document.createElement("button"); fav.type = "button"; fav.setAttribute("role", "menuitem"); fav.textContent = `★ My favorites (${favs.size})`;
    fav.onclick = () => { closeMenu(); st.day = "fav"; render(); $("board-top").scrollIntoView({behavior: reduce ? "auto" : "smooth"}); };
    const out = document.createElement("button"); out.type = "button"; out.setAttribute("role", "menuitem"); out.className = "danger"; out.textContent = "Log out"; out.onclick = logout;
    menu.append(head, fav, out);
    chip.onclick = () => { const o = menu.hidden; menu.hidden = !o; chip.setAttribute("aria-expanded", o); };
    const wrap = document.createElement("div"); wrap.className = "who-wrap"; wrap.append(chip, menu);
    box.replaceChildren(wrap);
    $("hello").textContent = `Welcome back, ${profile.name.split(" ")[0]}.`;
  }
  document.addEventListener("click", e => { if (!e.target.closest(".who-wrap")) closeMenu(); });
  function refresh(){ drawAcct(); render(); }

  // favorites
  window.toggleFav = async function(id){
    if (!session) { toast("Sign in to save favorite games"); openAuth(profile ? "in" : "up"); return; }
    const m = ms.find(x => x.id === id);
    if (favs.has(id)) {
      favs.delete(id); render();
      try { if (mode === "hosted") await col.doc("fav_" + id).delete(); else saveLocalFavs(); toast("Removed from favorites"); } catch (x) { toast("Could not remove it. Try again."); }
    } else {
      const rec = m ? { kind: "fav", id, ts: m.ts, home: m.h.name, away: m.a.name, league: m.league, country: m.country || "", addedAt: new Date().toISOString() } : { kind: "fav", id, addedAt: new Date().toISOString() };
      favs.set(id, rec); render();
      try { if (mode === "hosted") await col.doc("fav_" + id).set(rec); else saveLocalFavs(); toast("★ Added to favorites"); } catch (x) { favs.delete(id); render(); toast("Could not save it. Try again."); }
    }
  };
  function saveLocalFavs(){ lsSet("sp-local-favs", JSON.stringify([...favs.values()])); }
  $("rows").addEventListener("click", e => { const b = e.target.closest("[data-fav]"); if (b) toggleFav(b.dataset.fav); });
  $("navFavs").addEventListener("click", () => { if (!session) { openAuth(profile ? "in" : "up"); return; } st.day = "fav"; render(); });

  // boot
  function bootLocal(){
    mode = "local";
    try { profile = JSON.parse(lsGet("sp-local-profile") || "null"); } catch(e) { profile = null; }
    try { favs = new Map((JSON.parse(lsGet("sp-local-favs") || "[]")).map(f => [f.id, f])); } catch(e) { favs = new Map(); }
    session = profile && stored("sp-session") === "local" ? "local" : null; refresh();
  }
  if (!(window.claude && window.claude.use)) { bootLocal(); return; }
  Promise.all([window.claude.use("user"), window.claude.use("db")]).then(async ([user, db]) => {
    if (!user || !db) { mode = "guest"; refresh(); return; }
    me = await user.me();
    if (!me || !me.id) { mode = "guest"; refresh(); return; }
    mode = "hosted";
    if (!$("upName").value) $("upName").value = me.name || "";
    col = db.collection("data/users/" + me.id);
    const timer = setTimeout(() => toast("Your account is taking a while to load…"), 10000);
    col.onSnapshot(snap => {
      clearTimeout(timer);
      let prof = null; const f = new Map();
      for (const d of snap.docs) { const v = d.data(); if (d.id === "profile") prof = v; else if (d.id.startsWith("fav_") && v) f.set(v.id, v); }
      profile = prof; favs = f;
      session = profile && stored("sp-session") === me.id ? me.id : null;
      refresh();
    }, () => { clearTimeout(timer); toast("Could not load your account. Reload the page to try again."); });
  }).catch(() => { mode = "guest"; refresh(); });
})();


}
})();
