"use strict";
/* ============================================================================
   SAHNE MOTORU — Yarasa Sürüsü (IRON VISION show-site)
   v2 — gerçek sürü davranışı (sığırcık sürüsü dili):
     - SERBEST MOD artık boids: komşuya HİZALAN + YAKLAŞ + AYRIL + ortak akış
       alanı. Sürü tek tek titremez; kütle halinde süzülür, dalgalanır, yön
       değiştirir. Uzamsal ızgara (grid) komşu aramayı O(n) tutar.
     - YAZI KURULURKEN taneler KESKİN ve küçük: ayrı "crisp" sprite (minimal
       blur) + küçük tane boyutu → siyah zeminde harf formu net okunur. Mobilde
       tane daha da küçük, örnekleme sıklaşır, kuran yarasa oranı yüksek.
     - Hero metin kutusu için itme bölgesi (korumaKutusu): slogan civarına
       serbest sürü yığılmaz.
   Dışa API (SahneMotoru): init / kur / dagit / yogunluk / nabiz / korumaKutusu /
   durum / dur. Hareket dt-bazlı normalize (120 Hz ekranda da aynı hız).
   Canvas position:fixed viewport'u kaplar; site.js sürer.
   ========================================================================== */
window.SahneMotoru = (function () {

  let canvas, ctx;
  const DPR = Math.min(2, window.devicePixelRatio || 1);

  let W = 0, H = 0, cw = 0, ch = 0;

  let bats = [];
  let targets = [];
  let assignedCount = 0;   // yazıyı kuran yarasa sayısı
  let activeCount = 0;     // o an çizilen (yumuşak geçişli)
  let desiredActive = 0;   // hedeflenen çizim sayısı (yoğunluk × perfCap)
  let perfCap = 0;         // FPS frenine göre üst sınır
  let densityFrac = 1;     // 0..1 dış yoğunluk isteği (seyrelme)

  const pointer = { x: -9999, y: -9999, active: false };
  let koruma = null;       // hero metin kutusu itme bölgesi (viewport koord.)

  const S = { FREE: "free", FORMING: "forming", LOCKED: "locked", DISPERSING: "dispersing" };
  const FORM_MS = 3600, DISPERSE_MS = 1100;
  let state = S.FREE;
  let stateStart = 0, formStart = 0;
  let formYFrac = 0.42, formText = "IRON\nVISION";
  let pulse = 0;           // bölüm başlığı geçişinde kısa parlaklık artışı

  let running = false, rafId = 0, lastT = 0;
  let paused = false;      // sekme arka plandayken döngü duraklar
  let fps = 60, frameCount = 0, fpsTime = 0;
  let mobile = false;      // dar ekran sinyali (tane boyutu + örnekleme)

  // ---- Sürü (boids) parametreleri ------------------------------------------
  const GCELL = 52;                     // ızgara hücresi = algı yarıçapı
  const PERCEPT2 = GCELL * GCELL;
  const SEPR = 18, SEPR2 = SEPR * SEPR; // ayrışma yarıçapı (MURMUR ~16/46 ≈ 18/52 oranı)
  const MAXN = 5;                       // topolojik komşu sayısı (3-5'li gruplar hissi)
  let CRUISE = 0.95;                    // seyir hızı — masaüstü; mobilde buildBats düşürür (Demir 28.07: telefonda fazla hızlı)
  // MURMUR reçetesi (rehber): ayrışma 1.8 : hizalanma 0.7 : yaklaşma 0.55.
  // İvme şemamıza 0.1 ölçek → ayrışma AÇIK ARA baskın; kütle yapışmaz, aralıklı
  // akan dereler gibi süzülür (eski değerlerde hizalanma baskındı → tek tip bulut).
  const W_SEP = 0.18, W_ALI = 0.07, W_COH = 0.030; // ayrıl / hizala / yaklaş (küçük gruplar)
  const FLOW = 0.028;                   // akış alanı — kümeleri yavaşça sürükler
  const BNDK = 0.011;                   // yumuşak geri-çağırma gücü (kenardan taşmaya izin var)
  let gridHeads = null, gridNext = null, gcw = 0, gch = 0;

  // Hedef nokta bulutu önbelleği (metin + punto + boyut anahtarı).
  const targetCache = new Map();

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  // ---- Gövde rengi kademesi: soluk demir → parlak kor-krem ------------------
  function batColor(t) {
    return "rgb(" + Math.round(lerp(150, 255, t)) + "," +
                    Math.round(lerp(86, 210, t)) + "," +
                    Math.round(lerp(54, 190, t)) + ")";
  }

  // ---- Kanat silueti (quadratic eğri) --------------------------------------
  function drawBatPath(g, s, wingOpen) {
    const w = s * (1.0 + 1.1 * wingOpen), h = s * 0.95;
    g.beginPath();
    g.moveTo(0, -h);
    g.quadraticCurveTo(w, -h * 0.2, w * 0.7, h * 0.6);
    g.quadraticCurveTo(s * 0.3, h * 0.1, 0, h);
    g.quadraticCurveTo(-s * 0.3, h * 0.1, -w * 0.7, h * 0.6);
    g.quadraticCurveTo(-w, -h * 0.2, 0, -h);
    g.closePath();
  }

  // ---- Sprite önişleme ------------------------------------------------------
  // Ambient (serbest) sürü için korlu/yumuşak sprite kademeleri.
  const TIERS = 4, WING_FRAMES = 5, SPRITE_SIZE = 34;
  let sprites = [];
  // Yazıyı kuran taneler için AYRI keskin sprite (minimal blur, parlak kor):
  // küçük çizildiğinde bile harf kenarı net kalır (okunaklılık).
  const CRISP_SIZE = 20;
  let crisp = [];

  function buildSprites() {
    sprites = [];
    for (let ti = 0; ti < TIERS; ti++) {
      const t = ti / (TIERS - 1), row = [];
      for (let fi = 0; fi < WING_FRAMES; fi++) {
        const wingOpen = 0.12 + 0.88 * (fi / (WING_FRAMES - 1));
        const c = document.createElement("canvas");
        c.width = SPRITE_SIZE; c.height = SPRITE_SIZE;
        const g = c.getContext("2d");
        g.translate(SPRITE_SIZE / 2, SPRITE_SIZE / 2);
        // NET kuş kuralı: bulanıklık yok — yazıyı kuran keskin kuşlarla aynı aile.
        // Derinlik hissi blur'la değil renk/parlaklık kademesiyle verilir.
        g.fillStyle = batColor(0.35 + t * 0.55);
        g.shadowColor = "#ff5a28";
        g.shadowBlur = 1.6;
        drawBatPath(g, SPRITE_SIZE * 0.26, wingOpen);
        g.fill();
        row.push(c);
      }
      sprites.push(row);
    }
    crisp = [];
    for (let fi = 0; fi < WING_FRAMES; fi++) {
      const wingOpen = 0.12 + 0.88 * (fi / (WING_FRAMES - 1));
      const c = document.createElement("canvas");
      c.width = CRISP_SIZE; c.height = CRISP_SIZE;
      const g = c.getContext("2d");
      g.translate(CRISP_SIZE / 2, CRISP_SIZE / 2);
      g.fillStyle = batColor(0.92);   // parlak kor-krem
      g.shadowColor = "#ff6a30";
      g.shadowBlur = 1.4;             // minimal — harf kenarı net
      drawBatPath(g, CRISP_SIZE * 0.30, wingOpen);
      g.fill();
      crisp.push(c);
    }
  }

  // ---- Hedef nokta bulutu: metni offscreen çizip piksel örnekle -------------
  const FONT = '800 %spx "Space Grotesk", "Segoe UI", system-ui, Arial, sans-serif';
  function buildTargets() {
    if (W < 2 || H < 2) { targets = []; return; }

    const cacheKey = formText + "|" + formYFrac + "|" + W + "x" + H;
    let pts = targetCache.get(cacheKey);

    if (!pts) {
      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const g = off.getContext("2d");
      g.fillStyle = "#fff";
      g.textAlign = "center";
      g.textBaseline = "middle";

      const lines = formText.split("\n");
      const cy = H * formYFrac;
      let fs = Math.min(H * 0.30, W * 0.30);
      g.font = FONT.replace("%s", fs);
      const longest = lines.reduce((a, b) => (g.measureText(b).width > g.measureText(a).width ? b : a));
      while (g.measureText(longest).width > W * 0.9 && fs > 12) {
        fs -= 2; g.font = FONT.replace("%s", fs);
      }
      const lineGap = fs * 1.02;
      const startY = cy - (lines.length - 1) * lineGap / 2;
      for (let i = 0; i < lines.length; i++) {
        g.fillText(lines[i], W / 2, startY + i * lineGap);
      }

      const data = g.getImageData(0, 0, W, H).data;
      // Mobilde örnekleme SIKLAŞIR (step 2) → harf gövdesi dolu, iskelet değil.
      const step = mobile ? 2 : 3;
      pts = [];
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if (data[(y * W + x) * 4 + 3] > 128) pts.push({ x: x, y: y });
        }
      }
      for (let i = pts.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        const tmp = pts[i]; pts[i] = pts[j]; pts[j] = tmp;
      }
      targetCache.set(cacheKey, pts);
    }

    // Kuran yarasa oranı yükseldi (0.82 → 0.92): harf daha dolu okunur.
    const maxTargets = Math.max(1, Math.floor(bats.length * 0.92));
    targets = pts.length > maxTargets ? pts.slice(0, maxTargets) : pts;
  }

  // ---- Cihaz sinyaline göre başlangıç sayısı --------------------------------
  // Mobilde sayı ARTTI, tane KÜÇÜLDÜ: aynı kotayla harf daha dolu ve net.
  function computeCount() {
    const hc = navigator.hardwareConcurrency || 4;
    let base;
    if (W < 500) base = 900;
    else if (W < 700) base = 1120;
    else if (W < 1000) base = 1300;
    else base = Math.min(2000, 1400 + (W - 1000) / 700 * 600);
    const coreScale = clamp(hc / 8 + 0.4, 0.5, 1.15);
    return Math.round(base * coreScale);
  }

  function buildBats() {
    mobile = W < 600;
    CRUISE = mobile ? 0.68 : 0.95;
    const n = computeCount();
    bats = new Array(n);
    for (let i = 0; i < n; i++) {
      const depth = 0.3 + Math.random() * 0.7;
      const a = Math.random() * Math.PI * 2, sp = 0.7 + Math.random() * 0.8;
      bats[i] = {
        x: Math.random() * W, y: Math.random() * H,
        vx: Math.cos(a) * sp * depth, vy: Math.sin(a) * sp * depth,
        depth: depth,
        phase: Math.random() * Math.PI * 2,
        flap: 4 + Math.random() * 4,
        ang: a,
        mode: "free",
        tx: 0, ty: 0, delay: 0, lock: 0,
        amp: 1.2 + Math.random() * 2.2,   // kuş başına salınım genliği (canlı kilit)
        oscF: 0.30 + Math.random() * 0.55, // kuş başına salınım frekansı (ağır kanlı)
        esc: 0                            // >0: hedeften kopmuş kısa serbest tur (ms kalan)
      };
    }
    perfCap = n;
    activeCount = n;
    desiredActive = Math.round(n * densityFrac);
    assignedCount = Math.floor(n * 0.7);
    gridNext = new Int32Array(n);
  }

  function buildGridDims() {
    gcw = Math.max(1, Math.ceil(W / GCELL));
    gch = Math.max(1, Math.ceil(H / GCELL));
    gridHeads = new Int32Array(gcw * gch);
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    cw = canvas.width = Math.round(W * DPR);
    ch = canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    targetCache.clear();   // boyut değişti: eski nokta bulutları geçersiz
    buildBats();
    buildGridDims();
    if (state === S.FORMING || state === S.LOCKED) buildTargets(), assignTargets();
  }
  let resizeTimer = null;
  function onResize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 200); }

  function assignTargets() {
    assignedCount = Math.min(bats.length, targets.length);
    for (let i = 0; i < bats.length; i++) {
      const b = bats[i];
      if (i < assignedCount) {
        const t = targets[i];
        b.mode = "form"; b.tx = t.x; b.ty = t.y;
        b.delay = (t.x / W) * 1200 + Math.random() * 550;
      } else {
        b.mode = "free";
      }
    }
  }

  function kick() {
    const cx = W / 2, cy = H / 2;
    for (let i = 0; i < bats.length; i++) {
      const b = bats[i]; b.mode = "free";
      const dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy) || 1;
      b.vx += dx / d * (2 + Math.random() * 2);
      b.vy += dy / d * (1.5 + Math.random() * 2);
    }
  }

  // ---- Etkileşim ------------------------------------------------------------
  function onMove(e) {
    const t = (e.touches && e.touches[0]) ? e.touches[0] : e;
    pointer.x = t.clientX; pointer.y = t.clientY; pointer.active = true;
  }
  function onLeave() { pointer.active = false; }

  // ---- Uzamsal ızgara: serbest yarasaları hücrelere bağla (komşu araması) ---
  function buildGrid() {
    gridHeads.fill(-1);
    for (let i = 0; i < activeCount; i++) {
      const b = bats[i];
      if (b.mode === "form") continue;
      let gx = (b.x / GCELL) | 0, gy = (b.y / GCELL) | 0;
      gx = gx < 0 ? 0 : gx >= gcw ? gcw - 1 : gx;
      gy = gy < 0 ? 0 : gy >= gch ? gch - 1 : gy;
      const ci = gy * gcw + gx;
      gridNext[i] = gridHeads[ci];
      gridHeads[ci] = i;
    }
  }

  // ---- Ana döngü ------------------------------------------------------------
  function tick(now) {
    const dtRaw = lastT ? now - lastT : 16.7;
    lastT = now;
    const dtf = clamp(dtRaw / 16.6667, 0, 3);   // 60fps referanslı ölçek

    const el = now - stateStart;
    if (state === S.FORMING && el > FORM_MS) { state = S.LOCKED; stateStart = now; }
    else if (state === S.DISPERSING && el > DISPERSE_MS) { state = S.FREE; stateStart = now; }

    if (pulse > 0) pulse = Math.max(0, pulse - 0.02 * dtf);

    // Canlı kilit: uniform "nefes" YOK. Her kuş kendi faz/genliğinde salınır
    // (aşağıda) ve her an ~%1-2'si hedeften kopup kısa serbest tur atar.
    // Serbest uçuşta soluklaştırma da yok — kuşlar tam görünür.

    desiredActive = Math.min(Math.round(bats.length * densityFrac), perfCap);
    if (state === S.FORMING || state === S.LOCKED) desiredActive = Math.max(desiredActive, assignedCount);
    if (activeCount < desiredActive) activeCount = Math.min(desiredActive, activeCount + Math.ceil(24 * dtf));
    else if (activeCount > desiredActive) activeCount = Math.max(desiredActive, activeCount - Math.ceil(24 * dtf));

    buildGrid();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    const t = now;
    const FORM_GRAIN = mobile ? 5.2 : 6.6;   // yazı tanesi bir tık küçüldü (mobil netlik korunur)

    for (let i = 0; i < activeCount; i++) {
      const b = bats[i];

      if (b.mode === "form" && (now - formStart) > b.delay) {
        if (b.esc > 0) {
          // KAFASINA GÖRE UÇAN KUŞ: hedeften kopmuş kısa serbest tur. Zayıf
          // tether uzaklaşıp kaybolmasını önler; süre bitince güçlü çekim geri oturtur.
          b.esc -= dtRaw;
          b.vx += (Math.random() - 0.5) * 0.12 * dtf;
          b.vy += (Math.random() - 0.5) * 0.12 * dtf;
          b.vx += (b.tx - b.x) * 0.0006 * dtf;
          b.vy += (b.ty - b.y) * 0.0006 * dtf;
          const d = Math.pow(0.985, dtf); b.vx *= d; b.vy *= d;
        } else if ((now - formStart) > 500 && Math.random() < 0.00021 * dtf) {
          // Anlık ~%1-2: kop, tura çık
          const a = Math.random() * Math.PI * 2, k = 0.45 + Math.random() * 0.55;
          b.vx += Math.cos(a) * k; b.vy += Math.sin(a) * k;
          b.esc = 1400 + Math.random() * 1200;
        } else {
          // Kuş başına minik salınım (uniform nefes DEĞİL): hedef etrafında titre
          const ptm = now * 0.001;
          const ox = Math.sin(ptm * b.oscF + b.phase) * b.amp;
          const oy = Math.cos(ptm * b.oscF * 0.8 + b.phase * 1.3) * b.amp;
          b.vx += ((b.tx + ox) - b.x) * 0.007 * dtf;
          b.vy += ((b.ty + oy) - b.y) * 0.007 * dtf;
          const damp = Math.pow(0.91, dtf);
          b.vx *= damp; b.vy *= damp;
          // Hız tavanı: uzaktan gelen kuş da SÜZÜLEREK gelir ("üşüşen sinek" yok),
          // hedefe yaklaştıkça yay zaten doğal yavaşlatır.
          const spF = Math.hypot(b.vx, b.vy), mxF = 1.9;
          if (spF > mxF) { b.vx = b.vx / spF * mxF; b.vy = b.vy / spF * mxF; }
        }
      } else if (b.mode !== "form") {
        // ---- SÜRÜ DAVRANIŞI (boids): hizala + yaklaş + ayrıl + akış --------
        let nb = 0, aliX = 0, aliY = 0, cohX = 0, cohY = 0, sepX = 0, sepY = 0, sepN = 0;
        let gx = (b.x / GCELL) | 0, gy = (b.y / GCELL) | 0;
        gx = gx < 0 ? 0 : gx >= gcw ? gcw - 1 : gx;
        gy = gy < 0 ? 0 : gy >= gch ? gch - 1 : gy;
        let done = false;
        for (let oy = -1; oy <= 1 && !done; oy++) {
          const ry = gy + oy; if (ry < 0 || ry >= gch) continue;
          for (let ox = -1; ox <= 1 && !done; ox++) {
            const rx = gx + ox; if (rx < 0 || rx >= gcw) continue;
            let j = gridHeads[ry * gcw + rx];
            while (j !== -1) {
              if (j !== i) {
                const o = bats[j];
                const dx = o.x - b.x, dy = o.y - b.y, d2 = dx * dx + dy * dy;
                if (d2 < PERCEPT2) {
                  aliX += o.vx; aliY += o.vy; cohX += dx; cohY += dy;
                  if (d2 < SEPR2 && d2 > 0.01) {
                    const inv = 1 / Math.sqrt(d2), wt = 1 - Math.sqrt(d2) / SEPR;
                    sepX -= dx * inv * wt; sepY -= dy * inv * wt; sepN++;
                  }
                  if (++nb >= MAXN) { done = true; break; }
                }
              }
              j = gridNext[j];
            }
          }
        }

        let ax = 0, ay = 0;
        if (nb > 0) {
          const inv = 1 / nb;
          let vxm = aliX * inv, vym = aliY * inv, m = Math.hypot(vxm, vym);
          if (m > 0.001) { ax += (vxm / m * CRUISE - b.vx) * W_ALI; ay += (vym / m * CRUISE - b.vy) * W_ALI; }
          let cxm = cohX * inv, cym = cohY * inv; m = Math.hypot(cxm, cym);
          if (m > 0.001) { ax += (cxm / m * CRUISE - b.vx) * W_COH; ay += (cym / m * CRUISE - b.vy) * W_COH; }
          if (sepN > 0) { m = Math.hypot(sepX, sepY); if (m > 0.001) { ax += (sepX / m * CRUISE - b.vx) * W_SEP; ay += (sepY / m * CRUISE - b.vy) * W_SEP; } }
        }
        // AKAN KÜMELER: düşük frekanslı, konuma göre değişen + zamanla YAVAŞÇA
        // dönen akış alanı. Geniş tutarlı bölgeler → küme küme farklı yönlere;
        // "wind" tüm alanın yönünü ~30-60 sn'de kaydırır (tek tip süzülme yok).
        const wind = t * 0.00006;
        const fieldAng = Math.sin(b.y * 0.0034 + wind) * 1.6
                       + Math.cos(b.x * 0.0034 - wind * 0.8) * 1.6
                       + wind * 2.0;
        ax += Math.cos(fieldAng) * FLOW;
        ay += Math.sin(fieldAng) * FLOW;
        // Yumuşak sınır: kenardan ~%10 DIŞARI taşabilir, ötesinde nazikçe geri
        // çağrılır → parçalar ekran dışına çıkıp geri girer (kütle içeride kalır).
        const OX = W * 0.04, OY = H * 0.04;
        if (b.x < -OX) ax += (-OX - b.x) * BNDK; else if (b.x > W + OX) ax -= (b.x - (W + OX)) * BNDK;
        if (b.y < -OY) ay += (-OY - b.y) * BNDK; else if (b.y > H + OY) ay -= (b.y - (H + OY)) * BNDK;
        // Hero metin kutusu itmesi: slogan civarına yığılma
        if (koruma) {
          const pad = 44;
          if (b.x > koruma.x - pad && b.x < koruma.x + koruma.w + pad &&
              b.y > koruma.y - pad && b.y < koruma.y + koruma.h + pad) {
            const cxk = koruma.x + koruma.w / 2, cyk = koruma.y + koruma.h / 2;
            const dx = b.x - cxk, dy = b.y - cyk, d = Math.hypot(dx, dy) || 1;
            ax += dx / d * 0.85; ay += dy / d * 0.85;
          }
        }
        b.vx += ax * dtf; b.vy += ay * dtf;
        // Hız tabanı + tavan: titremesin, süzülsün (mobilde tavan/taban düşük)
        const spdK = mobile ? 0.7 : 1;
        const sp = Math.hypot(b.vx, b.vy), mx = (1.15 + b.depth * 0.9) * spdK, mn = (0.36 + b.depth * 0.24) * spdK;
        if (sp > mx) { b.vx = b.vx / sp * mx; b.vy = b.vy / sp * mx; }
        else if (sp < mn && sp > 0.001) { b.vx = b.vx / sp * mn; b.vy = b.vy / sp * mn; }
      }

      // İşaretçi (imleç/parmak) itmesi — küçük yerel kaçış
      if (pointer.active) {
        const dx = b.x - pointer.x, dy = b.y - pointer.y, d2 = dx * dx + dy * dy, R = 110;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 3.5 * dtf;
          b.vx += dx / d * f; b.vy += dy / d * f;
        }
      }

      b.x += b.vx * dtf; b.y += b.vy * dtf;

      // Uzak sert yakalama: taşmaya izin var ama ~%35'ten öteye kaçmasın (wrap yok)
      if (b.mode !== "form") {
        const FX = W * 0.14, FY = H * 0.14;
        if (b.x < -FX) { b.x = -FX; b.vx = Math.abs(b.vx); }
        else if (b.x > W + FX) { b.x = W + FX; b.vx = -Math.abs(b.vx); }
        if (b.y < -FY) { b.y = -FY; b.vy = Math.abs(b.vy); }
        else if (b.y > H + FY) { b.y = H + FY; b.vy = -Math.abs(b.vy); }
      }

      if (b.mode === "form") {
        const dist = Math.hypot(b.tx - b.x, b.ty - b.y);
        const near = Math.max(0, 1 - dist / 40);
        const boost = (state === S.LOCKED) ? 1 : 0.45;
        b.lock += (near * boost - b.lock) * clamp(0.08 * dtf, 0, 1);
      } else {
        b.lock += (0 - b.lock) * clamp(0.05 * dtf, 0, 1);
      }

      if (Math.hypot(b.vx, b.vy) > 0.12) {
        const targetAng = Math.atan2(b.vy, b.vx) + Math.PI / 2;
        let da = targetAng - b.ang;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        b.ang += da * clamp(0.15 * dtf, 0, 1);
      }

      const frame = (Math.abs(Math.sin(now * 0.0035 * b.flap + b.phase)) * (WING_FRAMES - 1)) | 0;
      const cos = Math.cos(b.ang), sin = Math.sin(b.ang);

      if (b.mode === "form") {
        // KESKİN küçük tane — harf formu net (mobilde daha da küçük)
        const spr = crisp[frame];
        let alpha = 0.5 + b.lock * 0.48 + pulse * 0.12; if (alpha > 1) alpha = 1;
        const drawSize = FORM_GRAIN * (0.82 + b.depth * 0.32);
        const sc = drawSize / CRISP_SIZE;
        ctx.globalAlpha = alpha;
        ctx.setTransform(DPR * sc * cos, DPR * sc * sin, -DPR * sc * sin, DPR * sc * cos, DPR * b.x, DPR * b.y);
        ctx.drawImage(spr, -CRISP_SIZE / 2, -CRISP_SIZE / 2);
      } else {
        // Serbest: TEK AİLE kuralı — yazıyı kuran KESKİN taneyle aynı sprite.
        // Bulanıklık komple yok: küçük, dolu (opak), net kuşlar. Derinlik sadece
        // ufak boyut farkıyla verilir; saydamlıktan gelen "pamuk küme" bitti.
        const spr = crisp[frame];
        let alpha = 0.88 + b.depth * 0.12 + pulse * 0.1; if (alpha > 1) alpha = 1;
        const drawSize = 3.6 + b.depth * 3.8;
        const sc = drawSize / CRISP_SIZE;
        ctx.globalAlpha = alpha;
        ctx.setTransform(DPR * sc * cos, DPR * sc * sin, -DPR * sc * sin, DPR * sc * cos, DPR * b.x, DPR * b.y);
        ctx.drawImage(spr, -CRISP_SIZE / 2, -CRISP_SIZE / 2);
      }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;

    frameCount++;
    if (now - fpsTime > 500) {
      fps = Math.round(frameCount * 1000 / (now - fpsTime));
      frameCount = 0; fpsTime = now;
      const floor = Math.max(assignedCount, 240);
      if (fps < 38 && perfCap > floor) perfCap = Math.max(floor, perfCap - 120);
      else if (fps > 55 && perfCap < bats.length) perfCap = Math.min(bats.length, perfCap + 80);
    }

    if (running && !paused) rafId = requestAnimationFrame(tick);
  }

  // ---- Sekme görünürlüğü: arka planda döngüyü tamamen duraklat -------------
  function onVisibility() {
    if (document.hidden) {
      paused = true;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    } else if (running && paused) {
      paused = false;
      lastT = 0;
      fpsTime = performance.now();
      frameCount = 0;
      rafId = requestAnimationFrame(tick);
    }
  }

  // ---- Genel API ------------------------------------------------------------
  return {
    init: function (canvasEl) {
      canvas = canvasEl;
      ctx = canvas.getContext("2d");
      buildSprites();
      resize();
      window.addEventListener("resize", onResize);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onMove, { passive: true });
      window.addEventListener("pointerup", onLeave);
      window.addEventListener("pointerleave", onLeave);
      window.addEventListener("pointercancel", onLeave);
      document.addEventListener("visibilitychange", onVisibility);
      running = true;
      stateStart = fpsTime = performance.now();
      lastT = 0;
      rafId = requestAnimationFrame(tick);
    },
    // Metni kur ve kilitli tut (otomatik dağılma yok). opts.yFrac dikey merkez.
    kur: function (metin, opts) {
      opts = opts || {};
      formText = metin;
      formYFrac = (typeof opts.yFrac === "number") ? opts.yFrac : 0.42;
      densityFrac = 1;
      buildTargets();
      assignTargets();
      state = S.FORMING;
      stateStart = formStart = performance.now();
    },
    // Yazıyı dağıt, serbest sürüye geç
    dagit: function () {
      kick();
      state = S.DISPERSING;
      stateStart = performance.now();
    },
    // Serbest gezerken sürüyü seyrelt/koyulaştır (0..1)
    yogunluk: function (frac) { densityFrac = clamp(frac, 0.05, 1); },
    // Bölüm başlığı geçişinde kısa parlaklık dalgası
    nabiz: function () { pulse = 1; },
    // Hero slogan kutusu (viewport koord.) — serbest sürü buraya yığılmaz.
    // rect: DOMRect ya da null (temizle).
    korumaKutusu: function (rect) {
      koruma = rect ? { x: rect.left, y: rect.top, w: rect.width, h: rect.height } : null;
    },
    durum: function () { return state; },
    dur: function () { running = false; if (rafId) cancelAnimationFrame(rafId); }
  };
})();
