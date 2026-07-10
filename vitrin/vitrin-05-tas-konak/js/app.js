/* =========================================================================
   KALEHAN Konak — app.js
   İmza anı: "Işık saati". Sayfa ilerlemesi (t: 0..1) güneşi avluda gezdirir;
   taş duvarlar sabahtan akşama ısınır, gölge açısı döner. Tek kaynak: scroll
   (kadran sürüklemesi scroll'u oynatır). Kural: sadece transform/opacity;
   no-JS ve prefers-reduced-motion'da her şey görünür, sahne sabit sabah ışığı.
   ========================================================================= */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';

  /* ---- renk yardımcıları ---- */
  function hexToRgb(h) {
    h = h.replace('#', '');
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function mix(c1, c2, u) {
    return 'rgb(' + Math.round(lerp(c1[0], c2[0], u)) + ',' +
      Math.round(lerp(c1[1], c2[1], u)) + ',' + Math.round(lerp(c1[2], c2[2], u)) + ')';
  }
  // 3 durak: şafak(0) · öğle(0.5) · akşam(1) — anahtar kareler
  function ramp(t, dawn, noon, dusk) {
    return t < 0.5 ? mix(dawn, noon, t / 0.5) : mix(noon, dusk, (t - 0.5) / 0.5);
  }
  var K = {
    skyTop: [hexToRgb('#9DB4C4'), hexToRgb('#7FB4D6'), hexToRgb('#3B3350')],
    skyBot: [hexToRgb('#F4D9BE'), hexToRgb('#DCEBF2'), hexToRgb('#E8A268')],
    wall:   [hexToRgb('#C7AE90'), hexToRgb('#DAC5A2'), hexToRgb('#CB8A56')],
    ground: [hexToRgb('#CDBB9C'), hexToRgb('#DDCDAD'), hexToRgb('#B9895C')],
    sun:    [hexToRgb('#F7D9A0'), hexToRgb('#FFF6E0'), hexToRgb('#F2A85C')]
  };

  /* ---- sahne ölçüleri (transform-only konumlandırma için önbellek) ---- */
  var scene = document.getElementById('scene');
  var sunEl = document.getElementById('sceneSun');
  var dim = { w: 0, h: 0, sw: 0 };
  function measure() {
    if (!scene) return;
    dim.w = scene.clientWidth;
    dim.h = scene.clientHeight;
    dim.sw = sunEl ? sunEl.offsetWidth : dim.w * 0.38;
  }

  /* ---- DOM referansları ---- */
  var phaseName = document.getElementById('phaseName');
  var phaseTime = document.getElementById('phaseTime');
  var dialTime = document.getElementById('dialTime');
  var dialHand = document.getElementById('dialHand');
  var dial = document.getElementById('dial');
  var shadow = document.getElementById('sceneShadow');

  function hhmm(t) {
    var mins = Math.round(lerp(6 * 60, 20 * 60, t)); // 06:00 → 20:00
    var h = Math.floor(mins / 60), m = mins % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  function phaseOf(t) {
    if (t < 0.16) return 'First light';
    if (t < 0.34) return 'Morning';
    if (t < 0.52) return 'Midday';
    if (t < 0.72) return 'Afternoon';
    if (t < 0.88) return 'Golden hour';
    return 'Dusk';
  }

  var lastT = -1;
  function applyDay(t) {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    if (Math.abs(t - lastT) < 0.002) return;
    lastT = t;
    var elev = Math.sin(t * Math.PI); // 0 → 1 (öğle) → 0

    // renkler
    root.style.setProperty('--sky-top', ramp(t, K.skyTop[0], K.skyTop[1], K.skyTop[2]));
    root.style.setProperty('--sky-bot', ramp(t, K.skyBot[0], K.skyBot[1], K.skyBot[2]));
    root.style.setProperty('--wall', ramp(t, K.wall[0], K.wall[1], K.wall[2]));
    root.style.setProperty('--ground', ramp(t, K.ground[0], K.ground[1], K.ground[2]));
    root.style.setProperty('--sun-col', ramp(t, K.sun[0], K.sun[1], K.sun[2]));

    // güneş konumu — transform (px, ölçü önbellekten; responsive resize'da yenilenir)
    var fx = lerp(0.06, 0.94, t);
    var fy = lerp(0.82, 0.12, elev);
    if (sunEl && dim.w) {
      var tx = fx * dim.w - dim.sw / 2;
      var ty = fy * dim.h - dim.sw / 2;
      sunEl.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px)';
    }

    // gölge — açı + uzunluk + koyuluk (öğlede kısa/keskin, uçlarda uzun/soluk)
    var rot = lerp(46, -46, t);
    var scaleY = lerp(1.7, 0.4, elev);
    var op = lerp(0.07, 0.34, elev);
    if (shadow) {
      shadow.style.transform = 'rotate(' + rot.toFixed(1) + 'deg) scaleY(' + scaleY.toFixed(2) + ')';
      shadow.style.opacity = op.toFixed(2);
    }

    // yıldızlar akşama doğru
    root.style.setProperty('--star-op', Math.max(0, Math.min(1, (t - 0.74) / 0.26)).toFixed(2));

    // kadran + etiketler
    var time = hhmm(t), ph = phaseOf(t);
    if (dialTime) dialTime.textContent = time;
    if (phaseTime) phaseTime.textContent = time;
    if (phaseName) phaseName.textContent = ph;
    if (dialHand) dialHand.style.transform =
      'translate(-50%,-100%) rotate(' + lerp(-120, 120, t).toFixed(1) + 'deg)';
    if (dial) {
      dial.setAttribute('aria-valuenow', Math.round(t * 100));
      dial.setAttribute('aria-valuetext', time + ', ' + ph.toLowerCase());
    }
  }

  /* ---- scroll → t bağlama ---- */
  function scrollProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  }

  measure();
  window.addEventListener('resize', function () { measure(); applyDay(lastT < 0 ? 0.33 : lastT); }, { passive: true });

  if (reduce) {
    // hareket azalt: sabit, hoş bir sabah ışığı — scroll'a bağlama yok
    applyDay(0.33);
  } else {
    // İMZA: günü doğrudan sayfa ilerlemesine bağla (0'da 06:00 → sonda 20:00 dusk).
    // rAF-throttle + yalnızca CSS değişken/transform yazımı → her frame ağır iş YOK.
    var dayTick = false;
    window.addEventListener('scroll', function () {
      if (!dayTick) { dayTick = true; requestAnimationFrame(function () { applyDay(scrollProgress()); dayTick = false; }); }
    }, { passive: true });
    applyDay(scrollProgress());

    // GSAP yalnızca bölüm açılış animasyonları için (imza ondan bağımsız çalışır)
    if (hasGSAP) {
      root.classList.add('anim-ready');
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.gsap.utils.toArray('.reveal').forEach(function (el, i) {
        window.gsap.to(el, {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 86%' }, delay: (i % 3) * 0.06
        });
      });
      window.ScrollTrigger.addEventListener('refresh', measure);
      window.ScrollTrigger.refresh();
    }
    // GSAP yoksa .anim-ready eklenmez → .reveal'ler CSS'te görünür kalır (no-JS güvencesi)
  }

  /* ---- kadran sürükleme: günü ileri-geri oynat (=scroll) ---- */
  if (dial && !reduce) {
    var dragging = false, lastX = 0;
    function scrollByDelta(dx) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: Math.max(0, Math.min(max, window.scrollY + dx)), behavior: 'auto' });
    }
    dial.addEventListener('pointerdown', function (e) {
      dragging = true; lastX = e.clientX; dial.setPointerCapture(e.pointerId);
    });
    dial.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX; lastX = e.clientX;
      scrollByDelta(dx * 7);
    });
    function endDrag(e) { if (dragging) { dragging = false; try { dial.releasePointerCapture(e.pointerId); } catch (x) {} } }
    dial.addEventListener('pointerup', endDrag);
    dial.addEventListener('pointercancel', endDrag);
    dial.addEventListener('keydown', function (e) {
      var step = window.innerHeight * 0.5;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { scrollByDelta(step); e.preventDefault(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { scrollByDelta(-step); e.preventDefault(); }
    });
  }

  /* ---- header durum + mobil yapışkan çubuk ---- */
  var hdr = document.getElementById('hdr');
  var bar = document.getElementById('stickybar');
  var reserve = document.getElementById('reserve');
  var barTick = false;
  function onScrollUI() {
    var y = window.scrollY;
    if (hdr) hdr.classList.toggle('scrolled', y > 20);
    if (bar) {
      var pastHero = y > window.innerHeight * 0.7;
      var inReserve = false;
      if (reserve) {
        var r = reserve.getBoundingClientRect();
        inReserve = r.top < window.innerHeight && r.bottom > 0;
      }
      var menuOpen = nav && nav.classList.contains('open');
      bar.classList.toggle('show', pastHero && !inReserve && !menuOpen);
    }
  }
  window.addEventListener('scroll', function () {
    if (!barTick) { barTick = true; requestAnimationFrame(function () { onScrollUI(); barTick = false; }); }
  }, { passive: true });

  /* ---- mobil menü ---- */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  function closeNav() {
    if (!nav) return;
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeNav(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  }

  /* ---- rezervasyon formu (backend yok — istek onayı) ---- */
  var form = document.getElementById('bookForm');
  var done = document.getElementById('formDone');
  var arrive = document.getElementById('fArrive');
  var depart = document.getElementById('fDepart');
  var today = new Date().toISOString().slice(0, 10);
  if (arrive) arrive.min = today;
  if (depart) depart.min = today;
  if (arrive && depart) {
    arrive.addEventListener('change', function () { depart.min = arrive.value || today; });
  }
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var name = (document.getElementById('fName').value || 'there').trim().split(' ')[0];
      if (done) {
        done.textContent = 'Thank you, ' + name + '. Your request has reached us — ' +
          'a real person will reply within the day to confirm the room and answer anything. ' +
          '(Demo: this form is not yet connected to a booking system.)';
        done.classList.add('show');
      }
      form.reset();
      if (arrive) arrive.min = today;
    });
  }

  /* ---- yıl ---- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  onScrollUI();
})();
