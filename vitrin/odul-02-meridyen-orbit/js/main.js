/* =========================================================================
   MERIDYEN — main.js
   Signature (imza anı): ORBIT — a tilted 3D ring of nocturnal-stay plates.
   A loader types the wordmark, the ring spins one full turn into place, then
   scroll drives the ring around its ellipse. Progressive enhancement only:
   no-JS / phones / reduced-motion get the readable rail + collection index.
   Vanilla JS. GSAP + ScrollTrigger vendored locally. No real images.
   ========================================================================= */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = window.matchMedia('(min-width: 861px)').matches;

  var STAYS = [
    { n: 'Númana', t: 't-dusk' }, { n: 'Sölve', t: 't-sea' },
    { n: 'Vespra', t: 't-ember' }, { n: 'Mera', t: 't-dune' },
    { n: 'Koru', t: 't-forest' }, { n: 'Silva', t: 't-forest' },
    { n: 'Akya', t: 't-sea' }, { n: 'Nokta', t: 't-dusk' }
  ];

  /* footer year + hero facts --------------------------------------------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
  var count = document.getElementById('count');
  if (count) count.textContent = STAYS.length;
  var moon = document.getElementById('moon');
  if (moon) {
    try {
      var d = new Date(); d.setDate(d.getDate() + ((29 - (Math.floor(Date.now() / 864e5) % 29)) % 29));
      moon.textContent = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(d);
    } catch (e) { moon.textContent = '—'; }
  }

  /* nav ------------------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var navList = document.getElementById('nav-list');
  if (toggle && navList) {
    toggle.addEventListener('click', function () {
      var open = navList.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navList.addEventListener('click', function (e) {
      if (e.target.closest('a') && navList.classList.contains('is-open')) {
        navList.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* sticky header --------------------------------------------------------- */
  var header = document.getElementById('top');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 24); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* reveals --------------------------------------------------------------- */
  (function reveals() {
    var els = [].slice.call(document.querySelectorAll('[data-reveal]'));
    if (!els.length || reduce) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      els.forEach(function (e) { io.observe(e); });
    } else { els.forEach(function (e) { e.classList.add('is-in'); }); }
  })();

  /* loader ---------------------------------------------------------------- */
  function hideLoader() {
    var l = document.getElementById('loader');
    if (l) l.classList.add('is-done');
  }

  /* ============ ORBIT — the signature ring ============ */
  function buildOrbit() {
    var orbit = document.querySelector('.orbit');
    var ring = document.getElementById('ring');
    var readout = document.getElementById('orbitReadout');
    if (!orbit || !ring) { hideLoader(); return; }
    if (reduce || !desktop || !window.gsap || !window.ScrollTrigger) { hideLoader(); return; }

    var gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);

    var REPEAT = 4;                       // 8 stays → 32 plates (image-reuse trick)
    var plates = [];
    var total = STAYS.length * REPEAT;
    var R = Math.min(window.innerWidth * 0.34, 400);
    for (var i = 0; i < total; i++) {
      var s = STAYS[i % STAYS.length];
      var a = (i / total) * 360;
      var p = document.createElement('div');
      p.className = 'plate';
      p.style.transform = 'rotate(' + a + 'deg) translateY(' + (-R) + 'px) rotate(' + (-a) + 'deg)';
      p.innerHTML = '<div class="pl-face ' + s.t + '"></div>' +
        '<span class="pl-idx">' + String((i % STAYS.length) + 1).padStart(2, '0') + '</span>' +
        '<span class="pl-label">' + s.n + '</span>';
      ring.appendChild(p);
      plates.push({ el: p, a: a });
    }

    orbit.classList.add('is-live');       // CSS shows the 3D stage, hides the rail

    var stage = document.querySelector('.orbit-stage');
    gsap.to({}, {
      scrollTrigger: {
        trigger: stage, start: 'top top',
        end: '+=' + Math.round(window.innerHeight * 2.4),
        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var spin = self.progress * 320;          // just under a full turn across the scroll
          document.documentElement.style.setProperty('--spin', spin.toFixed(2));
          if (readout) {
            var frontIdx = Math.round((spin / 360) * total) % STAYS.length;
            readout.textContent = STAYS[((frontIdx % STAYS.length) + STAYS.length) % STAYS.length].n;
          }
        }
      }
    });

    // loader → intro spin into place, then hand over to scroll
    var introDur = 1.1;
    gsap.set(document.documentElement, { '--spin-intro': -380 });
    hideLoader();
    gsap.to(document.documentElement, {
      '--spin-intro': 0, duration: introDur, ease: 'power3.out', delay: 0.15,
      onComplete: function () { ST.refresh(); }
    });

    // subtle mouse parallax on the tilt
    window.addEventListener('pointermove', function (e) {
      var dx = (e.clientX / window.innerWidth - 0.5) * 6;
      ring.style.setProperty('--px', dx.toFixed(2));
    }, { passive: true });
  }

  /* loader fill then build ------------------------------------------------ */
  (function boot() {
    var fill = document.getElementById('loaderFill');
    if (reduce || !window.gsap || !desktop) { buildOrbit(); return; }
    window.gsap.to(fill, { scaleX: 1, duration: 0.9, ease: 'power2.inOut', onComplete: buildOrbit });
    // safety net: never leave the loader up
    setTimeout(hideLoader, 3000);
  })();

  /* form ------------------------------------------------------------------ */
  var form = document.getElementById('enquireForm');
  if (form) {
    var status = document.getElementById('formStatus');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        if (status) { status.textContent = 'Please add your name and a way to reach you.'; status.classList.add('is-err'); }
        form.reportValidity(); return;
      }
      if (status) {
        status.classList.remove('is-err');
        status.textContent = 'Enquiry received — a keeper would reply by hand the same day. (Demo form: nothing was sent.)';
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Enquiry received ✦'; }
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
