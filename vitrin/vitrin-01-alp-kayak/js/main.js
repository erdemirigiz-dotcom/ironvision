/* IGLU Alpine Lodge — interaction layer.
   Everything is progressive: with JS off or IntersectionObserver missing, the page
   is fully readable and all content is visible. transform/opacity only. No framework. */
(function () {
  "use strict";
  var root = document.documentElement;
  var params = new URLSearchParams(location.search);
  var noAnim = params.has("noanim");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var allowMotion = !noAnim && !reduce;

  /* ---------- i18n ---------- */
  var DICT = window.KARVEN_I18N || { en: {}, tr: {} };
  var urlLang = params.get("lang");
  var lang = urlLang || localStorage.getItem("karven-lang") || "en";
  if (!DICT[lang]) lang = "en";

  function applyLang(l) {
    var d = DICT[l] || DICT.en;
    root.setAttribute("lang", l);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (d[k] != null) el.textContent = d[k];
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-aria");
      if (d[k] != null) el.setAttribute("aria-label", d[k]);
    });
    if (d["meta.title"]) document.title = d["meta.title"];
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang-btn") === l));
    });
    localStorage.setItem("karven-lang", l);
    lang = l;
  }
  document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang-btn")); });
  });
  applyLang(lang);

  /* ---------- header stuck state ---------- */
  var head = document.querySelector(".site-head");
  function onScrollHead() {
    if (head) head.classList.toggle("is-stuck", window.scrollY > 24);
  }

  /* ---------- signature: altitude rail ---------- */
  var VALLEY = 1450, SUMMIT = 3100;
  var altEl = document.querySelector("[data-alt-num]");
  var zoneEl = document.querySelector("[data-alt-zone]");
  var snowEl = document.querySelector(".rail__snow");
  var markerEl = document.querySelector(".rail__marker");
  var mAlt = document.querySelector("[data-m-alt]");
  // zone thresholds (progress 0..1) -> {label, wash, line, marker}
  var ZONES = [
    { max: 0.34, key: "forest", label: { en: "Forest", tr: "Orman" }, wash: "#F4F6F8", line: "rgba(156,178,194,.45)", dot: "#2E6F95" },
    { max: 0.72, key: "snowline", label: { en: "Snow line", tr: "Kar hattı" }, wash: "#EEF3F6", line: "rgba(156,178,194,.6)", dot: "#2E6F95" },
    { max: 1.01, key: "summit", label: { en: "Summit", tr: "Zirve" }, wash: "#E9F0F4", line: "rgba(46,111,149,.5)", dot: "#C25A2E" }
  ];
  var curZone = -1;

  function updateRail() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    var alt = Math.round((VALLEY + (SUMMIT - VALLEY) * p) / 10) * 10;
    var altStr = alt.toLocaleString(lang === "tr" ? "tr-TR" : "en-US");
    if (altEl) altEl.textContent = altStr;
    if (mAlt) mAlt.textContent = altStr + " m";
    if (snowEl) snowEl.style.height = (p * 100).toFixed(1) + "%";
    if (markerEl) markerEl.style.bottom = (p * 100).toFixed(1) + "%";
    var zi = 0;
    for (var i = 0; i < ZONES.length; i++) { if (p <= ZONES[i].max) { zi = i; break; } }
    if (zi !== curZone) {
      curZone = zi;
      var z = ZONES[zi];
      root.style.setProperty("--zone-wash", z.wash);
      root.style.setProperty("--zone-line", z.line);
      if (markerEl) markerEl.style.background = z.dot;
      if (zoneEl) zoneEl.textContent = z.label[lang] || z.label.en;
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScrollHead();
      updateRail();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateRail();
  onScrollHead();

  /* ---------- hero video (play only when motion allowed) ---------- */
  var hero = document.querySelector(".hero__media video");
  if (hero) {
    if (allowMotion) {
      var tryPlay = hero.play();
      if (tryPlay && typeof tryPlay.catch === "function") tryPlay.catch(function () {});
      // pause when hero scrolls away
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (ents) {
          ents.forEach(function (e) {
            if (e.isIntersecting) { hero.play().catch(function () {}); }
            else { hero.pause(); }
          });
        }, { threshold: 0.05 }).observe(hero);
      }
    } else {
      hero.removeAttribute("autoplay");
      hero.pause();
    }
  }

  /* ---------- snow canvas (desktop + motion only) ---------- */
  var canvas = document.querySelector(".snow-canvas");
  if (canvas && allowMotion && window.innerWidth > 560) {
    var ctx = canvas.getContext("2d");
    var flakes = [], W = 0, H = 0, raf = 0, running = true;
    function size() {
      var r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = r.width; H = canvas.height = r.height;
    }
    function seed() {
      var n = Math.min(140, Math.round(W / 12));
      flakes = [];
      for (var i = 0; i < n; i++) {
        flakes.push({ x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.8 + 0.5, s: Math.random() * 0.5 + 0.15,
          d: Math.random() * 0.6 - 0.3, o: Math.random() * 0.5 + 0.25 });
      }
    }
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.y += f.s; f.x += f.d;
        if (f.y > H) { f.y = -4; f.x = Math.random() * W; }
        if (f.x > W) f.x = 0; else if (f.x < 0) f.x = W;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, 6.2832);
        ctx.fillStyle = "rgba(255,255,255," + f.o + ")";
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    size(); seed(); frame();
    window.addEventListener("resize", function () { size(); seed(); }, { passive: true });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          running = e.isIntersecting;
          if (running) { cancelAnimationFrame(raf); frame(); }
          else cancelAnimationFrame(raf);
        });
      }, { threshold: 0 }).observe(canvas);
    }
  }

  /* ---------- reveals via IntersectionObserver (light, reliable) ---------- */
  if (allowMotion && "IntersectionObserver" in window) {
    root.classList.add("is-animated");
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }

  /* ---------- reservation form ---------- */
  var form = document.querySelector("#reserve-form");
  if (form) {
    var status = form.querySelector(".form-status");
    var dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
      var today = new Date();
      var iso = today.toISOString().slice(0, 10);
      dateInput.min = iso;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = DICT[lang] || DICT.en;
      var name = form.querySelector('[name="name"]');
      var email = form.querySelector('[name="email"]');
      var okName = name && name.value.trim().length > 1;
      var okEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      if (!okName || !okEmail) {
        if (status) { status.textContent = d["form.err"]; status.className = "form-status err"; }
        (okName ? email : name).focus();
        return;
      }
      if (status) { status.textContent = d["form.ok"]; status.className = "form-status ok"; }
      form.reset();
    });
  }

  /* ---------- mobile sticky bar: hide when reserve in view ---------- */
  var bar = document.querySelector(".mobile-bar");
  var reserve = document.querySelector("#reserve");
  if (bar && reserve && "IntersectionObserver" in window) {
    new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { bar.classList.toggle("is-hidden", e.isIntersecting); });
    }, { threshold: 0.12 }).observe(reserve);
  }
})();
