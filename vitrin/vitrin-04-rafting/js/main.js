/* =========================================================================
   DALGA Outdoor — main.js
   Signature: scroll velocity → live river discharge (m³/s) meter + water churn
   + faint headline tremor. Rapids grade picker recolours & re-paces the page.
   No framework. GSAP/ScrollTrigger optional (graceful fallback).
   ========================================================================= */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 860px)').matches;

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* shared live state ---------------------------------------------------- */
  var baseFlow = 55;   // m³/s baseline, set by rapids grade (default = III)
  var liveFlow = 0;    // 0..1 normalised discharge, drives water + tremor

  /* ---------------------------------------------------------------- nav -- */
  var toggle = document.querySelector('.nav-toggle');
  var navList = document.getElementById('nav-list');
  if (toggle && navList) {
    toggle.addEventListener('click', function () {
      var open = navList.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navList.addEventListener('click', function (e) {
      if (e.target.closest('a') && navList.classList.contains('is-open')) {
        navList.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ------------------------------------------------------ rapids picker -- */
  var grades = Array.prototype.slice.call(document.querySelectorAll('.grade'));
  var readout = document.getElementById('gradeReadout');
  var flowValue = document.getElementById('flowValue');
  var GRADE_TEXT = {
    1: ['Easy', 'ripples and gentle floats — pure warm-up water.'],
    2: ['Novice', 'small waves, easy channels, a first taste of the pull.'],
    3: ['Intermediate', 'regular rapids, clear lines, big fun.'],
    4: ['Advanced', 'powerful waves and tight moves — you’ll earn it.'],
    5: ['Expert', 'long, violent rapids for confident paddlers only.'],
    6: ['Extreme', 'the edge of runnable. Guided expeditions, on request.']
  };
  function selectGrade(btn) {
    grades.forEach(function (g) {
      var on = g === btn;
      g.classList.toggle('is-on', on);
      g.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    var grade = parseInt(btn.getAttribute('data-grade'), 10);
    baseFlow = parseFloat(btn.getAttribute('data-flow')) || 55;
    root.style.setProperty('--pace', (grade / 6).toFixed(2));
    // accent warms up as the water gets bigger
    var accent = grade >= 6 ? 'var(--orange)' : (grade >= 5 ? 'var(--yellow)' : 'var(--teal)');
    root.style.setProperty('--grade-accent', accent);
    if (readout) {
      var t = GRADE_TEXT[grade];
      readout.innerHTML = 'Grade <strong>' + toRoman(grade) + '</strong> — ' + t[0] + ' · ' + t[1];
    }
    if (reduce && flowValue) flowValue.textContent = Math.round(baseFlow);
  }
  function toRoman(n) { return ['', 'I', 'II', 'III', 'IV', 'V', 'VI'][n] || ('' + n); }
  grades.forEach(function (btn, i) {
    btn.addEventListener('click', function () { selectGrade(btn); });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); grades[(i + 1) % grades.length].focus(); grades[(i + 1) % grades.length].click(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); grades[(i - 1 + grades.length) % grades.length].focus(); grades[(i - 1 + grades.length) % grades.length].click(); }
    });
  });

  /* ------------------------------------------------ flow meter (signature) */
  var meter = document.getElementById('flowMeter');
  (function initFlowMeter() {
    if (!flowValue) return;
    if (reduce) {                       // static, no velocity read
      flowValue.textContent = Math.round(baseFlow);
      if (meter) meter.classList.add('is-live');
      root.style.setProperty('--flow', '0');
      return;
    }
    var lastY = window.scrollY, surge = 0, disp = baseFlow, shown = -1, live = false;
    function loop() {
      var y = window.scrollY;
      surge += Math.abs(y - lastY) * 1.5;
      lastY = y;
      surge *= 0.90;                    // decay back to calm
      if (surge > 150) surge = 150;
      var target = baseFlow + surge;
      disp += (target - disp) * 0.16;   // lerp — no jitter
      var r = Math.round(disp);
      if (r !== shown) { flowValue.textContent = r; shown = r; }
      liveFlow = Math.min(disp / 200, 1);
      root.style.setProperty('--flow', liveFlow.toFixed(3));
      if (!live && y > 120) { live = true; if (meter) meter.classList.add('is-live'); }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  })();

  /* ---------------------------------------------------- hero water canvas */
  (function initWater() {
    if (reduce) return;
    var c = document.getElementById('heroWater');
    if (!c || !c.getContext) return;
    var ctx = c.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = 0, h = 0, t = 0, raf = 0;
    var lines = mobile ? 3 : 5;
    function size() {
      var r = c.getBoundingClientRect();
      w = c.width = Math.max(1, Math.round(r.width * dpr));
      h = c.height = Math.max(1, Math.round(r.height * dpr));
    }
    size();
    window.addEventListener('resize', size, { passive: true });
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < lines; i++) {
        var yBase = h * (0.56 + i * 0.085);
        var amp = (7 + i * 4 + liveFlow * 22) * dpr;
        var speed = 0.55 + i * 0.16 + liveFlow * 1.1;
        ctx.beginPath();
        for (var x = 0; x <= w; x += 16 * dpr) {
          var y = yBase + Math.sin(x * 0.006 / dpr + t * speed + i) * amp;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = (i % 2)
          ? 'rgba(20,184,166,' + (0.10 + liveFlow * 0.20).toFixed(3) + ')'
          : 'rgba(232,247,244,' + (0.07 + liveFlow * 0.18).toFixed(3) + ')';
        ctx.lineWidth = (1.1 + i * 0.3) * dpr;
        ctx.stroke();
      }
      t += 0.016;
      raf = requestAnimationFrame(draw);
    }
    // only animate while the hero is on screen (battery / INP)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        if (ents[0].isIntersecting) { if (!raf) raf = requestAnimationFrame(draw); }
        else { cancelAnimationFrame(raf); raf = 0; }
      }).observe(c);
    } else {
      raf = requestAnimationFrame(draw);
    }
  })();

  /* ------------------------------------------------------------ reveals -- */
  (function initReveals() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!els.length) return;
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      els.forEach(function (el) {
        window.ScrollTrigger.create({
          trigger: el, start: 'top 88%', once: true,
          onEnter: function () { el.classList.add('is-in'); }
        });
      });
    } else if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      els.forEach(function (el) { io.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add('is-in'); });
    }
  })();

  /* ---------------------------------------------- trip → prefill booking */
  Array.prototype.slice.call(document.querySelectorAll('[data-trip]')).forEach(function (b) {
    b.addEventListener('click', function () {
      var sel = document.getElementById('f-trip');
      if (!sel) return;
      var want = (b.getAttribute('data-trip') || '').trim();
      Array.prototype.slice.call(sel.options).forEach(function (o) {
        if (o.text.trim() === want) sel.value = o.value || o.text;
      });
    });
  });

  /* -------------------------------------------------------------- form -- */
  var form = document.getElementById('bookForm');
  if (form) {
    var status = document.getElementById('formStatus');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        if (status) { status.textContent = 'Please fill in the required fields.'; status.classList.add('is-err'); }
        form.reportValidity();
        return;
      }
      if (status) {
        status.classList.remove('is-err');
        status.textContent = 'Got it — your request is in. (Demo form: nothing was actually sent.) A real DALGA crew would reply the same day.';
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Request received ✓'; }
    });
  }
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
