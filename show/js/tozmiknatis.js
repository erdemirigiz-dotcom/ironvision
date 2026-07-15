"use strict";
/* ============================================================================
   DEMİR TOZU — MIKNATIS (TOOLS sahnesi, ikinci canvas)
   Binlerce ince demir tozu tanesi (kısa çizgi parçacığı) dağınık dururken
   görünmez bir mıknatıs alanı onları çekip "TOOLS" yazısına dizer. Taneler
   önce hareket yönünde, yerine otururken de harfin kenar teğetinde hizalanır
   (gerçek demir tozu görünümü). Dağınıkken çelik grisi (#8a8f98), dizilince
   kor turuncusu (#ff8a4d) ile ısınır. Bölüm görünür olunca tek sefer tetiklenir.
   ========================================================================== */
window.TozMiknatis = (function () {
  let canvas, ctx, W = 0, H = 0;
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let parts = [];
  let started = false, finished = false, running = false;
  let t0 = 0, rafId = 0;
  const DUR = 1500, HOLD = 600;

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  // "TOOLS" hedef noktaları + her noktada kenar-teğet açısı
  function buildTargets() {
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const g = off.getContext("2d");
    g.fillStyle = "#fff";
    g.textAlign = "center";
    g.textBaseline = "middle";
    let fs = Math.min(H * 0.62, W * 0.24);
    const font = (s) => '800 ' + s + 'px "Space Grotesk","Segoe UI",system-ui,Arial,sans-serif';
    g.font = font(fs);
    while (g.measureText("TOOLS").width > W * 0.86 && fs > 12) { fs -= 2; g.font = font(fs); }
    g.font = font(fs);
    // harf arası hafif açılım (letter-spacing taklidi)
    g.fillText("T O O L S", W / 2, H * 0.5);

    const img = g.getImageData(0, 0, W, H).data;
    const A = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 0 : img[(y * W + x) * 4 + 3];
    // Örnekleme SIKLAŞTI (4/5 → 3/4): harf gövdesi dolu, iskelet değil.
    const step = W < 600 ? 3 : 4;
    const pts = [];
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        if (A(x, y) > 128) {
          const gx = A(x + 2, y) - A(x - 2, y);
          const gy = A(x, y + 2) - A(x, y - 2);
          // teğet = gradyana dik; gradyan yoksa yatay alan çizgisi
          const ta = (Math.abs(gx) + Math.abs(gy) < 20) ? 0 : Math.atan2(gx, -gy);
          pts.push({ x: x, y: y, a: ta });
        }
      }
    }
    return pts;
  }

  function deviceCount() {
    const hc = navigator.hardwareConcurrency || 4;
    // Tane sayısı arttı: harf dolu görünür (iskelet değil).
    let base = W < 600 ? 950 : (W < 1000 ? 1700 : 2400);
    return Math.round(base * clamp(hc / 8 + 0.45, 0.5, 1.1));
  }

  function build() {
    const targets = buildTargets();
    if (!targets.length) { parts = []; return; }
    const n = Math.min(deviceCount(), targets.length * 3);
    const len = clamp(W / 200, 6, 11);
    parts = new Array(n);
    for (let i = 0; i < n; i++) {
      const t = targets[(Math.random() * targets.length) | 0];
      parts[i] = {
        x: Math.random() * W, y: Math.random() * H,
        tx: t.x, ty: t.y, ta: t.a,
        ang: Math.random() * Math.PI,
        len: len * (0.7 + Math.random() * 0.6),
        delay: (t.x / W) * 480 + Math.random() * 220,
        drift: Math.random() * Math.PI * 2
      };
    }
  }

  function resize() {
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    build();
    if (started) { finished = false; running = true; t0 = t0 || performance.now(); frame(performance.now()); }
    else drawIdle();
  }

  // En yakın açıya (π simetrisi: çizgi a ile a+π aynı görünür) yumuşat
  function easeAngle(cur, target, k) {
    let d = target - cur;
    while (d > Math.PI / 2) d -= Math.PI;
    while (d < -Math.PI / 2) d += Math.PI;
    return cur + d * k;
  }

  function drawParticle(p, heat) {
    const c = Math.cos(p.ang), s = Math.sin(p.ang), hl = p.len / 2;
    const r = Math.round(138 + (255 - 138) * heat);
    const gg = Math.round(143 + (138 - 143) * heat);
    const b = Math.round(152 + (77 - 152) * heat);
    ctx.strokeStyle = "rgb(" + r + "," + gg + "," + b + ")";
    ctx.globalAlpha = 0.35 + 0.55 * heat + 0.25 * (1 - heat) * 0.4;
    ctx.beginPath();
    ctx.moveTo(p.x - c * hl, p.y - s * hl);
    ctx.lineTo(p.x + c * hl, p.y + s * hl);
    ctx.stroke();
  }

  function drawIdle() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.ang += 0.002;
      drawParticle(p, 0);
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    const el = now - t0;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    let allDone = true;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const prog = clamp((el - p.delay) / DUR, 0, 1);
      if (prog < 1) allDone = false;
      const e = easeOut(prog);
      p.x = p.x + (p.tx - p.x) * (0.08 + 0.12 * e);
      p.y = p.y + (p.ty - p.y) * (0.08 + 0.12 * e);
      const dx = p.tx - p.x, dy = p.ty - p.y, dist = Math.hypot(dx, dy);
      const desired = dist > 10 ? Math.atan2(dy, dx) : p.ta;
      p.ang = easeAngle(p.ang, desired, 0.18);
      drawParticle(p, e);
    }
    ctx.globalAlpha = 1;
    if (allDone && el > DUR + HOLD) {
      // Son kare KOR ISINMASIYLA çizili kalır; döngü durur (tek seferlik).
      running = false; finished = true;
      drawSettled();
      return;
    }
    if (running) rafId = requestAnimationFrame(frame);
  }

  // Dizilme bitince kor ısınması belirginleşir: sıcak bloom + tam ısı.
  function drawSettled() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.shadowColor = "#ff6a30";
    ctx.shadowBlur = 6;
    for (let i = 0; i < parts.length; i++) drawParticle(parts[i], 1);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  return {
    init: function (canvasEl) {
      canvas = canvasEl;
      ctx = canvas.getContext("2d");
      resize();
      let rt = null;
      window.addEventListener("resize", function () {
        clearTimeout(rt); rt = setTimeout(resize, 200);
      });
    },
    tetikle: function () {
      if (started) return;
      started = true; running = true; finished = false;
      t0 = performance.now();
      rafId = requestAnimationFrame(frame);
    }
  };
})();
