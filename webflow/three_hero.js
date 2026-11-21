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
