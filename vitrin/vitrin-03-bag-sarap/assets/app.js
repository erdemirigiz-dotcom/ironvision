/* SALKIM — interactions. Vanilla, no framework, transform/opacity/attr only.
   Signature moment: "the season circle — from vine to glass".               */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- language switcher ---------- */
  var langBtn = document.querySelector(".lang-btn");
  var langMenu = document.querySelector(".lang-menu");
  if (langBtn && langMenu) {
    langBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = langMenu.getAttribute("data-open") === "true";
      langMenu.setAttribute("data-open", open ? "false" : "true");
      langBtn.setAttribute("aria-expanded", open ? "false" : "true");
    });
    langMenu.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        if (window.ASMA_I18N) window.ASMA_I18N.apply(b.getAttribute("data-lang"));
        langMenu.setAttribute("data-open", "false");
        langBtn.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", function () {
      langMenu.setAttribute("data-open", "false");
      langBtn.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { langMenu.setAttribute("data-open", "false"); langBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- reveal on scroll (opacity/transform only) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- SIGNATURE: vine -> glass morph, scrubbed by hero scroll ----------
     4 stacked layers (bud, cluster, press, glass) crossfade with scroll progress
     over the hero. Only opacity + a tiny translateY/scale. rAF-throttled.        */
  var stage = document.querySelector(".stage");
  var morphLayers = stage ? Array.prototype.slice.call(stage.querySelectorAll(".morph-layer")) : [];
  var scrub = stage ? stage.querySelector(".stage-scrub i") : null;
  var hero = document.querySelector(".hero");

  function setStageProgress(p) {
    // p in [0,1] across N layers
    var n = morphLayers.length;
    if (!n) return;
    var pos = p * (n - 1); // 0..n-1
    morphLayers.forEach(function (layer, i) {
      var d = Math.abs(pos - i);
      var op = Math.max(0, 1 - d);          // triangular crossfade
      layer.style.opacity = op.toFixed(3);
      var lift = (1 - op) * 10;              // subtle rise as it fades
      layer.style.transform = "translateY(" + lift.toFixed(1) + "px) scale(" + (0.96 + 0.04 * op).toFixed(3) + ")";
    });
    if (scrub) scrub.style.transform = "scaleX(" + p.toFixed(3) + ")";
  }

  if (morphLayers.length) {
    if (reduce) {
      // show final glass stage, static scrub
      setStageProgress(1);
    } else {
      var ticking = false;
      var onScroll = function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var rect = hero.getBoundingClientRect();
          // 0 = hero at top (bud); 1 once the hero has scrolled ~72% away (glass)
          var span = (rect.height * 0.72) || 1;
          var p = Math.min(1, Math.max(0, -rect.top / span));
          setStageProgress(p);
          ticking = false;
        });
      };
      setStageProgress(0);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ---------- SIGNATURE: harvest wheel + season menu ---------- */
  var wheel = document.querySelector(".wheel");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".season-tabs button"));
  var panelTitle = document.querySelector("[data-season-title]");
  var panelNote = document.querySelector("[data-season-note]");
  var vDish = document.querySelector("[data-season='dish']");
  var vWine = document.querySelector("[data-season='wine']");
  var vWalk = document.querySelector("[data-season='walk']");
  var SEASONS = ["spring", "summer", "autumn", "winter"];
  var WHEEL_ANGLE = { winter: 0, spring: 90, summer: 180, autumn: 270 };
  var current = "autumn"; // default: harvest, the vineyard's signature moment

  function dict(k) {
    var d = window.ASMA_I18N ? window.ASMA_I18N.dict[k] : null;
    var lang = document.documentElement.getAttribute("lang") || "en";
    if (lang !== "en" && lang.length > 2) lang = lang.slice(0, 2);
    return d ? (d[lang] || d.en) : k;
  }

  function renderSeason(s) {
    current = s;
    if (panelTitle) { panelTitle.setAttribute("data-i18n", s + ".title"); panelTitle.textContent = dict(s + ".title"); }
    if (panelNote) { panelNote.setAttribute("data-i18n", s + ".note"); panelNote.textContent = dict(s + ".note"); }
    if (vDish) { vDish.setAttribute("data-i18n", s + ".dish"); vDish.textContent = dict(s + ".dish"); }
    if (vWine) { vWine.setAttribute("data-i18n", s + ".wine"); vWine.textContent = dict(s + ".wine"); }
    if (vWalk) { vWalk.setAttribute("data-i18n", s + ".walk"); vWalk.textContent = dict(s + ".walk"); }
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-season") === s;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.setAttribute("tabindex", on ? "0" : "-1");
    });
    if (wheel) {
      var a = WHEEL_ANGLE[s] || 0;
      wheel.style.transform = "rotate(" + (-a) + "deg)";
      // keep month labels upright by counter-rotating the label group
      var labels = wheel.querySelector(".wheel-labels");
      if (labels) labels.style.transform = "rotate(" + a + "deg)";
      wheel.querySelectorAll(".season-arc").forEach(function (arc) {
        arc.setAttribute("data-active", arc.getAttribute("data-season") === s ? "true" : "false");
      });
    }
  }

  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { renderSeason(t.getAttribute("data-season")); });
    t.addEventListener("keydown", function (e) {
      var idx = SEASONS.indexOf(current);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); renderSeason(SEASONS[(idx + 1) % 4]); tabs[(idx + 1) % 4].focus(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); renderSeason(SEASONS[(idx + 3) % 4]); tabs[(idx + 3) % 4].focus(); }
    });
  });
  if (tabs.length) renderSeason(current);

  // re-render active season text when language changes
  document.addEventListener("asma:lang", function () { renderSeason(current); });

  /* ---------- reservation form (demo, no backend) ---------- */
  var form = document.querySelector("#reserve-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.querySelector(".form-status");
      if (status) {
        status.setAttribute("data-show", "true");
        status.setAttribute("role", "status");
      }
      form.reset();
      if (status && status.scrollIntoView) status.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  }

  /* ---------- footer year ---------- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = String(new Date().getFullYear());
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
