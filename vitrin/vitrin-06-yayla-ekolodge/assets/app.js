/* =========================================================================
   RAKIM — Highland Eco-Lodge · vitrin-06
   Vanilla JS. No framework, no external libs. Transform/opacity motion only.
   Signature moment: fog curtain (scroll + drag) + altitude-band navigation.
   ========================================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---- Header: solid background after scrolling past hero top ---------- */
  var header = document.querySelector(".site-header");
  var mobileCta = document.querySelector(".mobile-cta");
  var hero = document.querySelector(".hero");

  /* ---- Mobile nav toggle ---------------------------------------------- */
  var nav = document.querySelector(".site-nav");
  var toggle = document.querySelector(".nav-toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Signature moment: fog curtain ---------------------------------- */
  // fogClear 0 -> full fog, 1 -> cleared. Combined from scroll + user drag.
  var scrollClear = 0;
  var dragClear = 0;
  var ridges = Array.prototype.slice.call(
    document.querySelectorAll(".hero__ridge")
  );
  var fogLayers = Array.prototype.slice.call(document.querySelectorAll(".fog"));

  function applyFog() {
    var clear = Math.min(1, scrollClear + dragClear);
    root.style.setProperty("--fog-clear", clear.toFixed(3));
    // reveal ridge depth as fog lifts (near ridge clears last)
    for (var i = 0; i < ridges.length; i++) {
      var depth = parseFloat(ridges[i].getAttribute("data-depth") || "0");
      // far ridges (depth ~0) become crisp early; near ridges (depth ~1) later
      var op = Math.min(1, 0.35 + clear * (1.1 - depth * 0.5));
      ridges[i].style.opacity = op.toFixed(2);
    }
    // subtle parallax drift on fog layers (transform only)
    if (!reduceMotion) {
      for (var j = 0; j < fogLayers.length; j++) {
        var speed = (j + 1) * 26;
        fogLayers[j].style.transform =
          "translate3d(" +
          (dragClear * (j % 2 ? -40 : 40)).toFixed(1) +
          "px," +
          (-scrollClear * speed).toFixed(1) +
          "px,0)";
      }
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      // header state
      if (header) header.classList.toggle("is-solid", y > 40);
      // mobile CTA: show after leaving hero
      if (mobileCta) {
        var past = hero ? y > hero.offsetHeight * 0.6 : y > 500;
        mobileCta.classList.toggle("is-shown", past);
      }
      // fog clears across first viewport of scroll
      if (hero) {
        scrollClear = Math.max(0, Math.min(1, y / (window.innerHeight * 0.9)));
      }
      applyFog();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---- Drag to "part the fog" (pointer) -------------------------------- */
  if (hero && !reduceMotion) {
    var dragging = false;
    var startX = 0;
    var startClear = 0;
    hero.addEventListener("pointerdown", function (e) {
      // ignore drags starting on interactive controls
      if (e.target.closest("a,button,input,select")) return;
      dragging = true;
      startX = e.clientX;
      startClear = dragClear;
      hero.setPointerCapture && hero.setPointerCapture(e.pointerId);
    });
    hero.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = Math.abs(e.clientX - startX);
      dragClear = Math.min(0.85, startClear + dx / (window.innerWidth * 0.5));
      applyFog();
    });
    function endDrag() {
      dragging = false;
    }
    hero.addEventListener("pointerup", endDrag);
    hero.addEventListener("pointercancel", endDrag);
  }

  applyFog();
  onScroll();

  /* ---- Altitude bands: active state + tint + dot nav ------------------- */
  var bands = Array.prototype.slice.call(document.querySelectorAll(".band"));
  var bandNav = document.querySelector(".band-nav");
  var bandNavBtns = bandNav
    ? Array.prototype.slice.call(bandNav.querySelectorAll("button"))
    : [];

  function setActiveBand(id) {
    for (var i = 0; i < bands.length; i++) {
      var on = bands[i].id === id;
      bands[i].classList.toggle("is-active", on);
      if (on) {
        var tint = bands[i].getAttribute("data-tint");
        if (tint) root.style.setProperty("--band-tint", tint);
      }
    }
    for (var k = 0; k < bandNavBtns.length; k++) {
      bandNavBtns[k].setAttribute(
        "aria-current",
        bandNavBtns[k].getAttribute("data-target") === id ? "true" : "false"
      );
    }
  }

  if (bands.length && "IntersectionObserver" in window) {
    var bandObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) setActiveBand(en.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    bands.forEach(function (b) {
      bandObs.observe(b);
    });

    // show dot-nav only while the bands region is on screen
    var bandsWrap = document.querySelector(".bands");
    if (bandsWrap && bandNav) {
      var navObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            bandNav.classList.toggle("is-visible", en.isIntersecting);
          });
        },
        { rootMargin: "-10% 0px -10% 0px" }
      );
      navObs.observe(bandsWrap);
    }
  }

  bandNavBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.getAttribute("data-target"));
      if (target)
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center",
        });
    });
  });

  /* ---- Reveal on scroll ----------------------------------------------- */
  var reveals = Array.prototype.slice.call(
    document.querySelectorAll(".reveal")
  );
  if (reveals.length && "IntersectionObserver" in window && !reduceMotion) {
    var revObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            revObs.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    reveals.forEach(function (el) {
      revObs.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---- Reservation form (demo: no backend) ---------------------------- */
  var form = document.querySelector(".form");
  if (form) {
    var status = form.querySelector(".form__status");
    var dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
      var today = new Date().toISOString().split("T")[0];
      dateInput.min = today;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (status) {
        status.classList.add("is-shown");
        status.setAttribute("role", "status");
        status.textContent =
          "Thank you — your request has reached us. We reply within one working day. (Demo form: no data is stored.)";
      }
      form.reset();
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
