/* =========================================================================
   ATÖLYE VYRON — main.js
   Signature (imza anı): STAGE — a scroll-driven, pinned stacked case-study
   deck. The front plate tips forward from its top edge (rotateX) and lifts
   away, promoting the piece beneath. Progressive enhancement only: no-JS,
   phones and reduced-motion get the honest readable stack instead.
   Vanilla JS. GSAP + ScrollTrigger vendored locally.
   ========================================================================= */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = window.matchMedia('(min-width: 861px)').matches;

  /* footer year + studio clock ------------------------------------------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  (function clock() {
    var el = document.getElementById('clock');
    if (!el) return;
    function tick() {
      try {
        el.textContent = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul'
        }).format(new Date());
      } catch (e) { el.textContent = ''; }
    }
    tick();
    setInterval(tick, 30000);
  })();

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
        navList.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    var closeNav = function () {
      if (navList.classList.contains('is-open')) {
        navList.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    };
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#nav-list') && !e.target.closest('.nav-toggle')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* sticky header state --------------------------------------------------- */
  var header = document.getElementById('top');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* reveals --------------------------------------------------------------- */
  (function reveals() {
    var els = [].slice.call(document.querySelectorAll('[data-reveal]'));
    if (!els.length || reduce) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      els.forEach(function (e) { io.observe(e); });
    } else { els.forEach(function (e) { e.classList.add('is-in'); }); }
  })();

  /* hero canvas — muted "film" placeholder (drifting light bands) --------- */
  (function heroFilm() {
    if (reduce) return;
    var c = document.getElementById('heroCanvas');
    if (!c || !c.getContext) return;
    var ctx = c.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = 0, h = 0, t = 0, raf = 0;
    function size() {
      var r = c.getBoundingClientRect();
      w = c.width = Math.max(1, Math.round(r.width * dpr));
      h = c.height = Math.max(1, Math.round(r.height * dpr));
    }
    size();
    window.addEventListener('resize', size, { passive: true });
    var bands = 4;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < bands; i++) {
        var cx = (0.2 + 0.6 * ((Math.sin(t * 0.12 + i * 1.7) + 1) / 2)) * w;
        var cy = (0.3 + 0.5 * ((Math.cos(t * 0.09 + i) + 1) / 2)) * h;
        var rad = (0.35 + i * 0.12) * Math.max(w, h);
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        var a = (i === 0 ? 0.10 : 0.045);
        g.addColorStop(0, 'rgba(231,80,46,' + a + ')');
        g.addColorStop(1, 'rgba(231,80,46,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      t += 0.016;
      raf = requestAnimationFrame(draw);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { if (!raf) raf = requestAnimationFrame(draw); }
        else { cancelAnimationFrame(raf); raf = 0; }
      }).observe(c);
    } else { raf = requestAnimationFrame(draw); }
  })();

  /* marquee: pause when off-screen (INP / battery) ------------------------ */
  (function marquee() {
    if (reduce) return;
    var m = document.getElementById('marquee');
    if (!m || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (en) {
      m.style.animationPlayState = en[0].isIntersecting ? 'running' : 'paused';
    }).observe(m);
  })();

  /* ============ STAGE — the signature stacked-deck engine ============ */
  (function stage() {
    var stage = document.querySelector('.stage');
    var deck = document.getElementById('deck');
    var source = document.getElementById('deckSource');
    var rail = document.getElementById('stageRail');
    if (!stage || !deck || !source) return;
    if (reduce || !desktop || !window.gsap || !window.ScrollTrigger) return; // keep honest stack

    var gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);

    // clone the canonical cards into the 3D deck
    var src = [].slice.call(source.querySelectorAll('.card'));
    if (src.length < 2) return;
    var cards = src.map(function (li) {
      var c = li.cloneNode(true);
      c.removeAttribute('data-reveal');
      deck.appendChild(c);
      return c;
    });
    var N = cards.length;

    stage.classList.add('is-live'); // CSS now shows the pinned deck, hides fallback

    // resting stack: card 0 in front, deeper cards peek lower + smaller
    cards.forEach(function (c, i) {
      gsap.set(c, { zIndex: N - i, y: i * 16, scale: 1 - i * 0.035,
                    transformOrigin: 'top center', transformPerspective: 1600 });
    });

    // dots
    var dots = [];
    if (rail) {
      cards.forEach(function (_, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Go to piece ' + (i + 1));
        if (i === 0) b.classList.add('is-on');
        rail.appendChild(b);
        dots.push(b);
      });
    }

    var pin = document.querySelector('.stage-pin');
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: '+=' + ((N - 1) * Math.round(window.innerHeight * 0.9)),
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          var active = Math.min(N - 1, Math.round(self.progress * (N - 1)));
          dots.forEach(function (d, i) { d.classList.toggle('is-on', i === active); });
        }
      }
    });

    for (var i = 0; i < N - 1; i++) {
      // top plate tips forward from its top edge and lifts away
      tl.to(cards[i], { rotateX: -85, yPercent: -55, opacity: 0, ease: 'power2.inOut', duration: 1 }, i);
      // the piece beneath is promoted to the resting front position
      tl.to(cards[i + 1], { y: 0, scale: 1, ease: 'power2.out', duration: 1 }, i);
    }

    // dot click → jump to that segment
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () {
        var stt = tl.scrollTrigger;
        if (!stt) return;
        var p = (N === 1) ? 0 : i / (N - 1);
        var y = stt.start + (stt.end - stt.start) * p;
        window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      });
    });

    ST.refresh();
  })();

  /* form ------------------------------------------------------------------ */
  var form = document.getElementById('projectForm');
  if (form) {
    var status = document.getElementById('formStatus');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        if (status) { status.textContent = 'Please fill in name and a way to reach you.'; status.classList.add('is-err'); }
        form.reportValidity();
        return;
      }
      if (status) {
        status.classList.remove('is-err');
        status.textContent = 'Brief received — a real person would reply the same day. (Demo form: nothing was sent.)';
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Brief received ✓'; }
    });
  }
})();
