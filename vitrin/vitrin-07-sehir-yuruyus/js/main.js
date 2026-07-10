/* KERVAN Walks — signature split-flap board, route drawing, UI wiring.
   Motion is transform/opacity only. Everything degrades without GSAP or with
   prefers-reduced-motion. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  var RED = "#D42A2A", BLUE = "#1B4DE8";
  // AA-safe small-text variants: [textOnLight, textOnDark] per brand accent
  var ACCENT_TEXT = {};
  ACCENT_TEXT[RED] = { tl: "#B01D1D", td: "#F26A6A" };
  ACCENT_TEXT[BLUE] = { tl: "#1740C4", td: "#8AA5FF" };
  var i18n = window.PATIKA_I18N || { lang: "en", t: function () { return ""; } };
  function L() { return i18n.lang; }

  /* ---------------- data ---------------- */
  // Featured walk per neighbourhood drives the board + route section.
  var HOODS = [
    {
      name: "OLD HARBOUR", walk: "HARBOUR TABLE", accent: RED,
      catKey: "flavour",
      cat: { en: "Flavour walk", tr: "Lezzet yürüyüşü" },
      routeName: "Old Harbour Table",
      path: "M36 250 L96 214 L150 232 L206 168 L264 186 L322 120 L366 92",
      stops: [
        { x: 36, y: 250, name: { en: "Fisherman's steps", tr: "Balıkçı basamakları" }, note: { en: "meet here, 09:00", tr: "buluşma, 09:00" } },
        { x: 150, y: 232, name: { en: "The morning bakery", tr: "Sabah fırını" }, note: { en: "first taste", tr: "ilk tadım" } },
        { x: 206, y: 168, name: { en: "Salt & anchovy stall", tr: "Tuz & hamsi tezgâhı" }, note: { en: "market kitchen", tr: "çarşı mutfağı" } },
        { x: 322, y: 120, name: { en: "Widow's tea room", tr: "Çay evi" }, note: { en: "sit-down stop", tr: "oturma molası" } },
        { x: 366, y: 92, name: { en: "Harbour lookout", tr: "Liman seyir noktası" }, note: { en: "finish", tr: "bitiş" } }
      ]
    },
    {
      name: "TANNERS' HILL", walk: "HILL CANVAS", accent: BLUE,
      catKey: "canvas",
      cat: { en: "Canvas walk", tr: "Sanat yürüyüşü" },
      routeName: "Tanners' Hill Canvas",
      path: "M40 90 L104 130 L150 110 L214 176 L270 150 L320 214 L368 240",
      stops: [
        { x: 40, y: 90, name: { en: "Old dye gate", tr: "Eski boya kapısı" }, note: { en: "meet here, 14:00", tr: "buluşma, 14:00" } },
        { x: 150, y: 110, name: { en: "The blue mural", tr: "Mavi duvar resmi" }, note: { en: "the story", tr: "hikâyesi" } },
        { x: 214, y: 176, name: { en: "Printmaker's yard", tr: "Baskı atölyesi" }, note: { en: "working studio", tr: "çalışan atölye" } },
        { x: 320, y: 214, name: { en: "Coffee courtyard", tr: "Kahve avlusu" }, note: { en: "coffee stop", tr: "kahve molası" } },
        { x: 368, y: 240, name: { en: "Rooftop viewpoint", tr: "Çatı seyir noktası" }, note: { en: "finish", tr: "bitiş" } }
      ]
    },
    {
      name: "SPICE QUARTER", walk: "DUSK MARKET", accent: RED,
      catKey: "flavour",
      cat: { en: "Flavour walk", tr: "Lezzet yürüyüşü" },
      routeName: "Spice Quarter at Dusk",
      path: "M40 210 L100 236 L164 190 L216 216 L280 150 L332 176 L370 118",
      stops: [
        { x: 40, y: 210, name: { en: "Lamp-lit arch", tr: "Işıklı kemer" }, note: { en: "meet here, 18:00", tr: "buluşma, 18:00" } },
        { x: 164, y: 190, name: { en: "Spice weighers", tr: "Baharat tartıcıları" }, note: { en: "smell test", tr: "koku turu" } },
        { x: 280, y: 150, name: { en: "Grill lane", tr: "Izgara sokağı" }, note: { en: "dinner bites", tr: "akşam lokmaları" } },
        { x: 370, y: 118, name: { en: "Rooftop of bells", tr: "Çan çatısı" }, note: { en: "finish at dusk", tr: "alacakaranlıkta bitiş" } }
      ]
    }
  ];

  // Full grid: 6 walks (2 per neighbourhood).
  var TOURS = [
    { title: "Old Harbour Table", catKey: "flavour", cat: { en: "Flavour", tr: "Lezzet" }, dur: "3 h", grp: "≤8", km: "2.4 km", when: { en: "mornings", tr: "sabahları" },
      desc: { en: "Three market kitchens, one bakery and a tea room the guidebooks miss — the harbour, eaten street by street.", tr: "Üç çarşı mutfağı, bir fırın ve rehber kitapların atladığı bir çay evi — limanı sokak sokak tatmak." } },
    { title: "Tanners' Hill Canvas", catKey: "canvas", cat: { en: "Canvas", tr: "Sanat" }, dur: "2.5 h", grp: "≤10", km: "3.1 km", when: { en: "afternoons", tr: "öğleden sonraları" },
      desc: { en: "Murals with real stories, a working print studio and the hill's best rooftop — street art, up close and unhurried.", tr: "Gerçek hikâyeli duvar resimleri, çalışan bir baskı atölyesi ve tepenin en iyi çatısı — sokak sanatı, yakından ve telaşsız." } },
    { title: "Spice Quarter at Dusk", catKey: "flavour", cat: { en: "Flavour", tr: "Lezzet" }, dur: "2 h", grp: "≤8", km: "1.8 km", when: { en: "evenings", tr: "akşamları" },
      desc: { en: "The old market as the lamps come on: spice weighers, a grill lane and a rooftop of bells to finish.", tr: "Lambalar yanarken eski çarşı: baharat tartıcıları, bir ızgara sokağı ve bitişte çan çatısı." } },
    { title: "Hidden Courtyards", catKey: "canvas", cat: { en: "Canvas", tr: "Sanat" }, dur: "2 h", grp: "≤6", km: "2.0 km", when: { en: "flexible", tr: "esnek" },
      desc: { en: "Six gated courtyards you'd never push open alone — architecture, quiet, and the odd resident cat.", tr: "Yalnızken açmaya çekineceğin altı kapılı avlu — mimari, sessizlik ve ara sıra bir mahalle kedisi." } },
    { title: "Sunday Fish Market", catKey: "flavour", cat: { en: "Flavour", tr: "Lezzet" }, dur: "2.5 h", grp: "≤8", km: "1.6 km", when: { en: "Sun only", tr: "yalnız Paz" },
      desc: { en: "The week's loudest, freshest morning — how to read the stalls, haggle kindly and eat what's just off the boat.", tr: "Haftanın en gürültülü, en taze sabahı — tezgâhları okumak, kibarca pazarlık ve tekneden yeni ineni yemek." } },
    { title: "Bell Towers & Rooftops", catKey: "canvas", cat: { en: "Canvas", tr: "Sanat" }, dur: "2 h", grp: "≤8", km: "2.2 km", when: { en: "golden hour", tr: "altın saat" },
      desc: { en: "Climb three quiet towers for the city's oldest skyline, timed so the last one lands at golden hour.", tr: "Şehrin en eski silüeti için üç sessiz kuleye çık; sonuncusu altın saate denk gelecek şekilde ayarlı." } }
  ];

  var CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '&".split("");

  /* ---------------- split-flap ---------------- */
  function ensureCells(container, n) {
    var cells = container.children;
    while (cells.length < n) {
      var f = document.createElement("span");
      f.className = "flap";
      f.setAttribute("aria-hidden", "true");
      var c = document.createElement("span");
      c.className = "ch";
      c.textContent = " ";
      f.appendChild(c);
      container.appendChild(f);
    }
    while (cells.length > n) container.removeChild(container.lastChild);
  }

  var flapTokens = new WeakMap();

  function setFlaps(container, text) {
    text = text.toUpperCase();
    ensureCells(container, text.length);
    container.setAttribute("aria-label", text);
    var token = (flapTokens.get(container) || 0) + 1;
    flapTokens.set(container, token);
    var cells = container.children;

    for (var i = 0; i < text.length; i++) {
      var ch = cells[i].querySelector(".ch");
      var target = text[i];
      if (reduce) { ch.textContent = target; continue; }
      rollCell(container, token, cells[i], ch, target, i);
    }
  }

  function rollCell(container, token, cell, ch, target, index) {
    var steps = 3 + (index % 3);          // 3..5 intermediate flips
    var step = 0;
    var delay = index * 45;               // stagger across the row

    setTimeout(function tick() {
      if (flapTokens.get(container) !== token) return; // superseded
      cell.classList.remove("flipping");
      // force reflow so the animation can restart
      void cell.offsetWidth;
      cell.classList.add("flipping");
      if (step >= steps) {
        ch.textContent = target;
        setTimeout(function () { cell.classList.remove("flipping"); }, 90);
        return;
      }
      ch.textContent = CHARSET[(Math.random() * CHARSET.length) | 0];
      step++;
      setTimeout(tick, 85);
    }, delay);
  }

  /* ---------------- route drawing ---------------- */
  var rtPath = document.getElementById("rtPath");
  var rtStops = document.getElementById("rtStops");
  var stopsList = document.getElementById("stopsList");
  var routeName = document.getElementById("routeName");
  var routeCat = document.getElementById("routeCat");
  var routeTrigger = null;
  var activeHood = 0;

  function drawRoute(hood, animate) {
    var h = HOODS[hood];
    rtPath.setAttribute("d", h.path);

    // stops on the map
    rtStops.innerHTML = "";
    h.stops.forEach(function (s, i) {
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("class", "stop");
      c.setAttribute("cx", s.x); c.setAttribute("cy", s.y); c.setAttribute("r", 5);
      c.style.setProperty("--d", i);
      rtStops.appendChild(c);
      var tl = document.createElementNS("http://www.w3.org/2000/svg", "text");
      tl.setAttribute("class", "stop-lbl");
      tl.setAttribute("x", s.x + 8); tl.setAttribute("y", s.y - 8);
      tl.textContent = String(i + 1).padStart(2, "0");
      rtStops.appendChild(tl);
    });

    // stops list
    stopsList.innerHTML = "";
    h.stops.forEach(function (s) {
      var li = document.createElement("li");
      var nm = document.createElement("span"); nm.className = "st-name"; nm.textContent = s.name[L()];
      var nt = document.createElement("span"); nt.className = "st-note"; nt.textContent = s.note[L()];
      li.appendChild(nm); li.appendChild(nt);
      stopsList.appendChild(li);
    });

    routeName.textContent = h.routeName;
    routeCat.textContent = h.cat[L()];

    animateRoute(animate);
  }

  function animateRoute(animate) {
    var len = rtPath.getTotalLength();
    var stopEls = rtStops.querySelectorAll(".stop");
    var lblEls = rtStops.querySelectorAll(".stop-lbl");

    if (reduce || !hasGSAP || !animate) {
      rtPath.style.strokeDasharray = "none";
      rtPath.style.strokeDashoffset = "0";
      stopEls.forEach(function (s) { s.style.opacity = 1; });
      lblEls.forEach(function (l) { l.style.opacity = 1; });
      return;
    }
    rtPath.style.strokeDasharray = len;
    rtPath.style.strokeDashoffset = len;
    stopEls.forEach(function (s) { s.style.opacity = 0; });
    lblEls.forEach(function (l) { l.style.opacity = 0; });

    if (routeTrigger) { routeTrigger.kill(); routeTrigger = null; }
    var tl = window.gsap.timeline({
      scrollTrigger: { trigger: ".route", start: "top 70%" }
    });
    routeTrigger = tl.scrollTrigger;
    tl.to(rtPath, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" })
      .to(stopEls, { opacity: 1, duration: 0.3, stagger: 0.12 }, "-=0.9")
      .to(lblEls, { opacity: 1, duration: 0.3, stagger: 0.12 }, "<");
  }

  /* ---------------- neighbourhood selection ---------------- */
  function selectHood(hood, animateRouteFlag) {
    activeHood = hood;
    var h = HOODS[hood];
    var root = document.documentElement.style;
    var at = ACCENT_TEXT[h.accent] || ACCENT_TEXT[RED];
    root.setProperty("--accent", h.accent);
    root.setProperty("--accent-tl", at.tl);
    root.setProperty("--accent-td", at.td);
    root.setProperty("--accent-ink", "#fff");

    setFlaps(document.getElementById("flapNeigh"), h.name);
    setFlaps(document.getElementById("flapTour"), h.walk);

    document.querySelectorAll(".chip[data-neigh]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(+b.getAttribute("data-neigh") === hood));
    });

    drawRoute(hood, animateRouteFlag);
  }

  /* ---------------- tour grid ---------------- */
  function cardSVG(catKey) {
    var stroke = catKey === "flavour" ? RED : BLUE;
    return '<svg viewBox="0 0 300 200" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="300" height="200" fill="#E7E4DA"/>' +
      '<g stroke="#9A968C" stroke-width="1" opacity="0.5">' +
      '<path d="M0 60 H300 M0 120 H300 M80 0 V200 M180 0 V200"/></g>' +
      '<path d="M20 170 L80 130 L140 150 L200 90 L260 110 L290 40" fill="none" stroke="' + stroke + '" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="20" cy="170" r="5" fill="' + stroke + '"/><circle cx="290" cy="40" r="5" fill="' + stroke + '"/>' +
      '</svg>';
  }

  function renderTours() {
    var grid = document.getElementById("tourGrid");
    if (!grid) return;
    grid.innerHTML = "";
    TOURS.forEach(function (t, i) {
      var el = document.createElement("article");
      el.className = "tour-card";
      var num = String(i + 1).padStart(2, "0");
      el.innerHTML =
        '<div class="tc-top"><span class="tc-num">' + num + ' / 06</span>' +
        '<span class="cat ' + t.catKey + '">' + t.cat[L()] + '</span></div>' +
        '<h3>' + t.title + '</h3>' +
        '<p class="tc-desc">' + t.desc[L()] + '</p>' +
        '<div class="tc-meta"><span><b>' + t.dur + '</b></span><span><b>' + t.grp + '</b></span>' +
        '<span><b>' + t.km + '</b></span><span>' + t.when[L()] + '</span></div>' +
        '<div class="tc-img">' + cardSVG(t.catKey) + '</div>';
      grid.appendChild(el);
    });
  }

  function fillTourSelect() {
    var sel = document.getElementById("bf-tour");
    if (!sel) return;
    sel.innerHTML = "";
    TOURS.forEach(function (t) {
      var o = document.createElement("option");
      o.value = t.title; o.textContent = t.title;
      sel.appendChild(o);
    });
  }

  /* ---------------- form ---------------- */
  function wireForm() {
    var form = document.getElementById("bookForm");
    if (!form) return;
    var status = document.getElementById("formStatus");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#bf-name").value.trim();
      var date = form.querySelector("#bf-date").value;
      if (!name || !date) {
        status.dataset.ok = "0";
        status.textContent = i18n.t("status.err");
        (name ? form.querySelector("#bf-date") : form.querySelector("#bf-name")).focus();
        return;
      }
      status.dataset.ok = "1";
      status.textContent = i18n.t("status.ok");
      form.reset();
    });
  }

  /* ---------------- mobile menu ---------------- */
  function wireMenu() {
    var btn = document.getElementById("menuToggle");
    var links = document.getElementById("navLinks");
    if (!btn || !links) return;
    btn.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- reveal-on-scroll (progressive) ---------------- */
  function wireReveals() {
    if (reduce || !hasGSAP) return;
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.utils.toArray(".tour-card, .step, .review, .guide-credentials > div").forEach(function (el) {
      window.gsap.from(el, {
        opacity: 0, y: 26, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });
  }

  /* ---------------- init ---------------- */
  function init() {
    var yr = document.getElementById("yr");
    if (yr) yr.textContent = String(new Date().getFullYear());

    renderTours();
    fillTourSelect();
    wireForm();
    wireMenu();

    document.querySelectorAll(".chip[data-neigh]").forEach(function (b) {
      b.addEventListener("click", function () { selectHood(+b.getAttribute("data-neigh"), true); });
    });

    selectHood(0, false);   // initial board flip + route (no scroll anim yet)
    wireReveals();
    if (hasGSAP && !reduce) { animateRoute(true); } // arm route scroll animation

    // re-render language-dependent content on toggle, keep selection
    document.addEventListener("langchange", function () {
      renderTours();
      drawRoute(activeHood, false);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
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
