/* SAFİ — behaviour. Static site, no framework. GSAP + ScrollTrigger (local). */
(function () {
  "use strict";
  var doc = document;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isDesktop = matchMedia("(min-width: 961px)").matches;
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  /* -------- year -------- */
  var y = doc.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ======================================================================
     i18n — swap innerHTML for [data-i18n] nodes; EN captured on load.
     ====================================================================== */
  var i18nNodes = [].slice.call(doc.querySelectorAll("[data-i18n]"));
  var EN = {};
  i18nNodes.forEach(function (el) { EN[el.getAttribute("data-i18n")] = el.innerHTML; });

  function setLang(lang) {
    var dict = lang === "tr" ? window.SAFI_TR : EN;
    i18nNodes.forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (dict && dict[k] != null) el.innerHTML = dict[k];
    });
    doc.documentElement.lang = lang;
    doc.documentElement.setAttribute("data-lang", lang);
    [].forEach.call(doc.querySelectorAll("[data-lang-btn]"), function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang-btn") === lang));
    });
    try { localStorage.setItem("hasat-lang", lang); } catch (e) {}
  }
  [].forEach.call(doc.querySelectorAll("[data-lang-btn]"), function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang-btn")); });
  });
  try {
    var saved = localStorage.getItem("hasat-lang");
    if (saved === "tr") setLang("tr");
  } catch (e) {}

  /* ======================================================================
     Mobile nav
     ====================================================================== */
  var nav = doc.querySelector(".nav");
  var toggle = doc.querySelector(".nav__toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest(".nav__links a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* header shadow + mobile order bar on scroll */
  var header = doc.querySelector(".site-header");
  var bar = doc.getElementById("order-bar");
  var hero = doc.querySelector(".hero");
  function onScroll() {
    var yy = window.pageYOffset;
    if (header) header.classList.toggle("is-stuck", yy > 8);
    if (bar) {
      var past = hero ? yy > hero.offsetHeight * 0.7 : yy > 500;
      var order = doc.getElementById("order");
      var nearOrder = order && (order.getBoundingClientRect().top < window.innerHeight * 1.2 && order.getBoundingClientRect().bottom > 0);
      bar.classList.toggle("is-on", past && !nearOrder);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ======================================================================
     Reveal on view (IntersectionObserver, transform/opacity only)
     ====================================================================== */
  var reveals = [].slice.call(doc.querySelectorAll(".reveal"));
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ======================================================================
     Signature: olive → drop → filling bottle. Manual render(progress).
     ====================================================================== */
  var olive = doc.querySelector(".olive-body");
  var drop = doc.querySelector(".drop");
  var liquid = doc.querySelector(".liquid-rect");
  var dossier = doc.querySelector(".dossier");
  var label = doc.querySelector(".label-lot");
  var EMPTY = 300;                 /* rect height → translate-down when empty */
  var lots = {
    early:   { color: "#7C9235", fill: 0.62, label: "EARLY HARVEST" },
    reserve: { color: "#9CAF3F", fill: 0.78, label: "ESTATE RESERVE" },
    late:    { color: "#C9A94A", fill: 0.90, label: "LATE HARVEST" }
  };
  var current = lots.early;
  var lastP = reduce ? 1 : 0;

  function render(p) {
    lastP = p;
    if (!liquid) return;
    if (olive) {
      var sq = clamp(p / 0.35);
      olive.style.transform = "scaleY(" + (1 - 0.45 * sq) + ") scaleX(" + (1 + 0.10 * sq) + ")";
    }
    if (drop) {
      var seg = clamp((p - 0.22) / 0.42);
      drop.style.transform = "translateY(" + (seg * 150) + "px)";
      drop.style.opacity = (p > 0.2 && p < 0.66) ? "1" : "0";
    }
    var fillProg = clamp((p - 0.38) / 0.6);
    var level = current.fill * fillProg;
    liquid.style.transform = "translateY(" + (EMPTY * (1 - level)) + "px)";
    if (dossier) dossier.style.opacity = String(0.15 + 0.85 * clamp((p - 0.45) / 0.3));
  }

  function setLot(key, animate) {
    current = lots[key] || lots.early;
    doc.documentElement.style.setProperty("--liquid", current.color);
    if (label) label.textContent = current.label;
    var card = doc.querySelector('.lot[data-lot="' + key + '"]');
    if (card) {
      var name = doc.getElementById("dossier-name");
      if (name) name.textContent = card.getAttribute("data-name");
      var map = { "d-harvest": "data-harvest", "d-alt": "data-alt", "d-acid": "data-acid", "d-yield": "data-yield" };
      Object.keys(map).forEach(function (id) {
        var node = doc.getElementById(id);
        if (node) node.textContent = card.getAttribute(map[id]);
      });
    }
    [].forEach.call(doc.querySelectorAll(".lot"), function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lot") === key));
    });
    if (liquid && animate && (reduce || !isDesktop)) {
      liquid.style.transition = "transform .7s cubic-bezier(.22,.61,.36,1), fill .5s";
    }
    render(lastP);
  }

  [].forEach.call(doc.querySelectorAll(".lot"), function (b) {
    b.addEventListener("click", function () { setLot(b.getAttribute("data-lot"), true); });
  });

  /* initial state */
  doc.documentElement.style.setProperty("--liquid", current.color);

  var GSAP = window.gsap, ST = window.ScrollTrigger;
  if (reduce || !GSAP || !ST) {
    /* static: show the finished, filled signature */
    render(1);
  } else {
    GSAP.registerPlugin(ST);
    ST.create({
      trigger: "#sig-pin",
      start: "top top",
      end: "+=110%",
      scrub: 0.4,
      pin: isDesktop,
      anticipatePin: 1,
      onUpdate: function (self) { render(self.progress); },
      onRefreshInit: function () { render(0); }
    });
    render(0);
    if (!isDesktop) {
      /* no pin on mobile: reveal the filled bottle when the stage first enters */
      var stage = doc.querySelector(".sig__stage");
      if (stage && "IntersectionObserver" in window) {
        var io2 = new IntersectionObserver(function (en) {
          if (en[0].isIntersecting) {
            if (liquid) liquid.style.transition = "transform 1s cubic-bezier(.22,.61,.36,1)";
            if (olive) olive.style.transition = "transform .8s ease";
            if (dossier) dossier.style.transition = "opacity .8s ease";
            render(1);
            io2.disconnect();
          }
        }, { threshold: 0.4 });
        io2.observe(stage);
      }
    }
  }

  /* ======================================================================
     Order form — no backend; friendly confirm (placeholder wiring)
     ====================================================================== */
  var form = doc.getElementById("order-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = doc.getElementById("form-status");
      var tr = doc.documentElement.lang === "tr";
      if (!form.checkValidity()) {
        if (status) status.textContent = tr
          ? "Lütfen ad ve geçerli bir e-posta gir."
          : "Please enter your name and a valid email.";
        return;
      }
      if (status) status.textContent = tr
        ? "Teşekkürler — talebin alındı (demo). [PLACEHOLDER] ödeme bağlantısıyla dönülecek."
        : "Thanks — request received (demo). We'll reply with a [PLACEHOLDER] payment link.";
      form.reset();
    });
  }
})();
