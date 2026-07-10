/* ============================================================================
   HALLEY Desert Camp — imza anı: "o gecenin gökyüzü haritası"
   Vanilla JS, framework yok. Canvas2D yıldız alanı + tarihe bağlı takımyıldız +
   ay evresi + gece→şafak scroll. Astronomik tablo statiktir (canlı API yok).
   ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---- statik astronomik tablo -------------------------------------------
     Takımyıldız yerel koordinatları 0..1 kutuda; çizgiler yıldız index çiftleri.
     Mevsime göre o gece görünen takımyıldızlar (kuzey yarımküre, gerçekçi). */
  var CONS = {
    orion:   { name:'Orion',      stars:[[.30,.10],[.70,.14],[.24,.42],[.50,.50],[.76,.46],[.40,.66],[.60,.66],[.44,.92],[.58,.94]],
               lines:[[0,2],[1,4],[2,3],[3,4],[3,5],[3,6],[5,7],[6,8],[5,6]] },
    taurus:  { name:'Taurus',     stars:[[.14,.30],[.34,.44],[.50,.52],[.66,.42],[.86,.28],[.52,.70],[.44,.88]],
               lines:[[0,1],[1,2],[2,3],[3,4],[2,5],[5,6]] },
    gemini:  { name:'Gemini',     stars:[[.28,.08],[.72,.10],[.30,.34],[.68,.36],[.34,.60],[.64,.62],[.40,.86],[.60,.88]],
               lines:[[0,2],[2,4],[4,6],[1,3],[3,5],[5,7],[2,3]] },
    ursa:    { name:'Ursa Major', stars:[[.10,.60],[.30,.54],[.50,.58],[.66,.50],[.70,.30],[.86,.24],[.88,.44]],
               lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]] },
    leo:     { name:'Leo',        stars:[[.12,.62],[.30,.56],[.30,.36],[.46,.24],[.60,.30],[.60,.52],[.84,.66],[.72,.58]],
               lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,1],[5,7],[7,6]] },
    lyra:    { name:'Lyra',       stars:[[.50,.10],[.36,.40],[.64,.42],[.40,.74],[.62,.76]],
               lines:[[0,1],[0,2],[1,3],[2,4],[3,4],[1,2]] },
    scorpius:{ name:'Scorpius',   stars:[[.16,.14],[.24,.28],[.34,.40],[.46,.52],[.58,.62],[.70,.70],[.80,.60],[.78,.44],[.66,.40]],
               lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]] },
    cygnus:  { name:'Cygnus',     stars:[[.50,.08],[.50,.40],[.50,.72],[.50,.94],[.20,.30],[.80,.34]],
               lines:[[0,1],[1,2],[2,3],[4,1],[1,5]] },
    cassiopeia:{ name:'Cassiopeia',stars:[[.10,.34],[.30,.60],[.50,.32],[.70,.62],[.90,.36]],
               lines:[[0,1],[1,2],[2,3],[3,4]] },
    pegasus: { name:'Pegasus',    stars:[[.28,.24],[.72,.22],[.30,.66],[.74,.68],[.86,.90],[.14,.44]],
               lines:[[0,1],[1,3],[3,2],[2,0],[3,4],[0,5]] }
  };
  var MONTHS = {
    1:['orion','taurus','gemini'], 2:['orion','gemini','ursa'], 3:['ursa','leo','gemini'],
    4:['leo','ursa','lyra'], 5:['leo','lyra','ursa'], 6:['scorpius','lyra','cygnus'],
    7:['scorpius','lyra','cygnus'], 8:['cygnus','scorpius','pegasus'], 9:['cygnus','cassiopeia','pegasus'],
    10:['pegasus','cassiopeia','cygnus'], 11:['cassiopeia','pegasus','taurus'], 12:['orion','taurus','cassiopeia']
  };
  var AZ = [0.22, 0.5, 0.82]; // aktif 3 takımyıldızın panorama azimutu

  function moonInfo(date) {
    var syn = 29.530588853;
    var ref = Date.UTC(2000, 0, 6, 18, 14, 0);
    var days = (date.getTime() - ref) / 86400000;
    var phase = (days % syn) / syn; if (phase < 0) phase += 1;
    var illum = (1 - Math.cos(2 * Math.PI * phase)) / 2;
    var names = ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous',
                 'Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'];
    var idx = Math.floor(((phase * 8) + 0.5)) % 8;
    return { phase: phase, illum: illum, name: names[idx] };
  }
  function moonPath(phase) {
    var R = 46, C = 50;
    var waxing = phase <= 0.5;
    var rx = R * Math.abs(Math.cos(2 * Math.PI * phase));
    var gibbous = phase > 0.25 && phase < 0.75;
    var outer = waxing ? 1 : 0;
    var inner = gibbous ? (1 - outer) : outer;
    var top = C + ',' + (C - R), bot = C + ',' + (C + R);
    return 'M ' + top + ' A ' + R + ' ' + R + ' 0 0 ' + outer + ' ' + bot +
           ' A ' + rx + ' ' + R + ' 0 0 ' + inner + ' ' + top + ' Z';
  }

  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    try { init(); } catch (e) { /* imza başarısızsa site içerikle çalışmaya devam eder */ }
  });

  function init() {
    var canvas = document.getElementById('sky');
    var dateInput = document.getElementById('nightDate');
    var moonHost = document.getElementById('moonDisc');
    var moonName = document.getElementById('moonName');
    var pano, ctx, W = 0, H = 0, dpr = 1, stars = [], W2 = 0;
    var rot = 0, targetRot = 0, vel = 0, dragging = false, lastX = 0, running = false;
    var active = [], lineProg = 0, lastT = 0;

    /* --- tarih durumu --- */
    var today = new Date();
    function iso(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
    if (dateInput) {
      dateInput.min = iso(today);
      if (!dateInput.value) dateInput.value = iso(today);
    }

    function pickDate() {
      var v = dateInput && dateInput.value ? dateInput.value : iso(today);
      var parts = v.split('-');
      var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (isNaN(d.getTime())) d = today;
      return d;
    }

    function updateSky(animate) {
      var d = pickDate();
      var keys = MONTHS[d.getMonth() + 1] || MONTHS[1];
      active = keys.map(function (k, i) { return { c: CONS[k], az: AZ[i] }; });
      lineProg = animate && !reduce ? 0 : 1;
      // ay evresi
      var m = moonInfo(d);
      if (moonHost) {
        moonHost.innerHTML =
          '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">' +
          '<circle cx="50" cy="50" r="47" fill="#0e0a1a"/>' +
          '<path d="' + moonPath(m.phase) + '" fill="url(#mg)"/>' +
          '<defs><radialGradient id="mg" cx="38%" cy="34%" r="70%">' +
          '<stop offset="0" stop-color="#f6f1e6"/><stop offset="1" stop-color="#b3ab9c"/>' +
          '</radialGradient></defs></svg>';
      }
      if (moonName) moonName.textContent = m.name;
      // rezervasyon formu tarihiyle senkron
      var bookDate = document.getElementById('bookDate');
      if (bookDate && dateInput) { bookDate.value = dateInput.value; }
      if (reduce) drawStatic();
    }

    /* --- canvas kurulum --- */
    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W2 = W * 1.9;
      // yıldız sayısı alan + dpr sınırlı (performans bütçesi)
      var count = Math.min(320, Math.round((W * H) / 5200));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random(), y: Math.pow(Math.random(), 1.3) * 0.72,
          r: Math.random() * 1.1 + 0.25, layer: Math.random() < 0.32 ? 1.7 : 1,
          tw: Math.random() * Math.PI * 2, ts: 0.6 + Math.random() * 1.6,
          tint: ['#EDE4D3', '#C8DCFF', '#FFE7C8', '#C8FFF0'][Math.floor(Math.random() * 4)]
        });
      }
      if (reduce) drawStatic();
    }

    function wrapX(x) { x %= W2; if (x < 0) x += W2; return x; }

    function drawStar(s, t) {
      var baseX = s.x * W2;
      var x = wrapX(baseX - rot * s.layer);
      if (x < -4 || x > W + 4) return;
      var y = s.y * H;
      var a = reduce ? 0.9 : (0.55 + 0.45 * Math.sin(t * s.ts + s.tw));
      ctx.globalAlpha = Math.max(0.15, a);
      ctx.fillStyle = s.tint;
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill();
      if (s.r > 1) {
        ctx.globalAlpha = a * 0.28;
        ctx.beginPath(); ctx.arc(x, y, s.r * 2.6, 0, Math.PI * 2); ctx.fill();
      }
    }

    function drawConstellation(item) {
      var c = item.c, cx = wrapX(item.az * W2 - rot * 1.4);
      // yerel kutu ölçek/pozisyon
      var scale = Math.min(W, 720) * 0.24;
      var ox = cx - scale / 2, oy = H * 0.14 + (item.az * 37 % 60);
      // ekran dışıysa atla (wrap kopyası da denenir)
      var candidates = [ox, ox - W2, ox + W2];
      candidates.forEach(function (bx) {
        if (bx + scale < -30 || bx > W + 30) return;
        var pts = c.stars.map(function (p) { return [bx + p[0] * scale, oy + p[1] * scale]; });
        // çizgiler (progress ile "çiziliyor")
        ctx.globalAlpha = 0.55; ctx.strokeStyle = '#7B5CFF'; ctx.lineWidth = 1.1;
        ctx.lineCap = 'round';
        var segs = c.lines.length, drawn = lineProg * segs;
        for (var i = 0; i < segs; i++) {
          var a = pts[c.lines[i][0]], b = pts[c.lines[i][1]];
          if (!a || !b) continue;
          var f = Math.max(0, Math.min(1, drawn - i));
          if (f <= 0) continue;
          ctx.beginPath(); ctx.moveTo(a[0], a[1]);
          ctx.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); ctx.stroke();
        }
        // yıldız düğümleri
        for (var j = 0; j < pts.length; j++) {
          var pj = pts[j];
          ctx.globalAlpha = 0.9; ctx.fillStyle = '#5FF0D6';
          ctx.beginPath(); ctx.arc(pj[0], pj[1], 2.1, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 0.22;
          ctx.beginPath(); ctx.arc(pj[0], pj[1], 6, 0, Math.PI * 2); ctx.fill();
        }
        // etiket (çizim bitince)
        if (lineProg > 0.85) {
          ctx.globalAlpha = 0.85; ctx.fillStyle = '#EDE4D3';
          ctx.font = '500 12px "Space Grotesk", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(c.name.toUpperCase(), bx + 2, oy - 8);
        }
      });
    }

    function frame(now) {
      if (!ctx) { running = false; return; }
      var t = now / 1000;
      // inertia + hafif otomatik sürüklenme
      if (!dragging) {
        if (Math.abs(vel) > 0.01) { rot += vel; vel *= 0.94; }
        else if (!reduce) { rot += 0.12; }
      }
      ctx.clearRect(0, 0, W, H);
      if (lineProg < 1) lineProg = Math.min(1, lineProg + 0.018);
      for (var i = 0; i < stars.length; i++) drawStar(stars[i], t);
      for (var k = 0; k < active.length; k++) drawConstellation(active[k]);
      ctx.globalAlpha = 1;
      if (running) requestAnimationFrame(frame);
    }

    function drawStatic() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) drawStar(stars[i], 0);
      for (var k = 0; k < active.length; k++) drawConstellation(active[k]);
      ctx.globalAlpha = 1;
    }

    function start() { if (!running && !reduce && ctx) { running = true; requestAnimationFrame(frame); } }
    function stop() { running = false; }

    /* --- sürükle: gök kubbeyi döndür --- */
    function onDown(e) {
      dragging = true; vel = 0;
      lastX = (e.touches ? e.touches[0].clientX : e.clientX);
    }
    function onMove(e) {
      if (!dragging) return;
      var x = (e.touches ? e.touches[0].clientX : e.clientX);
      var dx = x - lastX; lastX = x;
      rot -= dx; vel = -dx * 0.5;
      if (reduce) drawStatic();
    }
    function onUp() { dragging = false; }

    if (canvas) {
      canvas.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      canvas.addEventListener('touchstart', onDown, { passive: true });
      canvas.addEventListener('touchmove', onMove, { passive: true });
      canvas.addEventListener('touchend', onUp);
      window.addEventListener('resize', debounce(resize, 180));
      resize();
    }
    updateSky(false);

    if (dateInput) dateInput.addEventListener('change', function () { updateSky(true); start(); });

    // hero görünür değilken rAF durdur (performans)
    if (canvas && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) start(); else stop(); });
      }, { threshold: 0.02 });
      io.observe(canvas);
    } else { start(); }

    /* ---- scroll: gece → şafak (--dawn) ---- */
    var hero = document.querySelector('.hero');
    var ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var h = hero ? hero.offsetHeight : window.innerHeight;
        var dawn = Math.max(0, Math.min(1, window.scrollY / (h * 0.9)));
        document.documentElement.style.setProperty('--dawn', dawn.toFixed(3));
        var nav = document.querySelector('.nav');
        if (nav) nav.classList.toggle('solid', window.scrollY > 40);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- reveal-on-scroll ---- */
  ready(function () {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduce) {
      els.forEach(function (e) { e.classList.add('in'); }); return;
    }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  });

  /* ---- nav toggle (mobil) ---- */
  ready(function () {
    var t = document.querySelector('.nav-toggle');
    var links = document.getElementById('navLinks');
    if (!t || !links) return;
    t.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { links.classList.remove('open'); t.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { links.classList.remove('open'); t.setAttribute('aria-expanded', 'false'); }
    });
  });

  /* ---- rezervasyon formu (demo; backend deploy'da bağlanır) ---- */
  ready(function () {
    var form = document.getElementById('bookForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var done = document.getElementById('bookDone');
      if (done) { done.classList.add('show'); done.focus(); }
      form.querySelector('.book-fields').style.display = 'none';
    });
  });

  function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }
})();


/* Filo yamasi 2026-07-09: mobil menuyu disari tiklayinca / ESC ile kapat */
(function () {
  function baglan() {
    var t = document.querySelector('.nav-toggle, .menu-toggle, #navToggle');
    if (!t) return;
    var pid = t.getAttribute('aria-controls');
    var p = (pid && document.getElementById(pid)) ||
            document.querySelector('.nav-list, .nav-links, #navLinks');
    if (!p) return;
    function kapat() {
      ['is-open', 'open'].forEach(function (c) {
        if (p.classList.contains(c)) {
          p.classList.remove(c);
          t.setAttribute('aria-expanded', 'false');
        }
      });
    }
    document.addEventListener('click', function (e) {
      if (!p.contains(e.target) && !t.contains(e.target)) kapat();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') kapat(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', baglan);
  else baglan();
})();
