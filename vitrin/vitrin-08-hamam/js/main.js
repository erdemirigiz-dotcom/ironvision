/* =========================================================================
   TAS Hamam — main.js
   İmza anı: ritüel bölümünde scroll ilerledikçe --heat (0→1) yükselir;
   ısı eğrisi çizilir, gösterge dolar, vurgu rengi buhar mavisi→bakır ısınır.
   Animasyon disiplini: SADECE CSS custom property + transform/opacity.
   Her şey GSAP olmadan da çalışır (no-gsap → içerik görünür, ?noanim testi).
   ========================================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var params = new URLSearchParams(location.search);
  var noanim = params.has("noanim");

  /* ---------- yıl ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- header stuck ---------- */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 24);
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- mobil nav ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  /* ---------- mobil yapışkan CTA (hero geçilince görün, form açıkken gizle) ---------- */
  var mobileCta = document.getElementById("mobileCta");
  var reserve = document.getElementById("reserve");
  var heroEl = document.querySelector(".hero");
  if (mobileCta && "IntersectionObserver" in window) {
    var pastHero = false, reserveVisible = false;
    function syncCta() {
      var show = pastHero && !reserveVisible && (!nav || !nav.classList.contains("is-open"));
      mobileCta.classList.toggle("is-on", show);
      mobileCta.setAttribute("aria-hidden", show ? "false" : "true");
    }
    if (heroEl) new IntersectionObserver(function (es) {
      pastHero = !es[0].isIntersecting; syncCta();
    }, { rootMargin: "-40% 0px 0px 0px" }).observe(heroEl);
    if (reserve) new IntersectionObserver(function (es) {
      reserveVisible = es[0].isIntersecting; syncCta();
    }, { threshold: 0.12 }).observe(reserve);
    if (nav) nav.addEventListener("transitionend", syncCta);
  }

  /* ---------- form (demo — backend yok) ---------- */
  var form = document.getElementById("reserveForm");
  var status = document.getElementById("formStatus");
  if (form && status) {
    var dateInput = form.querySelector("#f-date");
    if (dateInput) {
      var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
      dateInput.min = t.toISOString().slice(0, 10);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !okEmail) {
        status.dataset.state = "err";
        status.textContent = !name
          ? "Please add your name so we know who to greet."
          : "Please check your email address.";
        (!name ? form.name : form.email).focus();
        return;
      }
      status.dataset.state = "ok";
      status.textContent = "Thank you, " + name + ". Your request is noted — we'll confirm by email shortly. (Demo form: no data is sent.)";
      form.reset();
    });
  }

  /* ---------- İMZA ANI: ısı motoru ---------- */
  // Ritüel bölümünün görünürlük ilerlemesini --heat'e bağlar.
  var ritual = document.getElementById("ritual");

  function setHeat(v) {
    v = v < 0 ? 0 : v > 1 ? 1 : v;
    root.style.setProperty("--heat", v.toFixed(3));
  }

  var booted = false;
  function bootGSAP() {
    if (booted) return;
    booted = true;
    var hasGSAP = window.gsap && window.ScrollTrigger && !noanim;
    if (hasGSAP) {
      gsap.registerPlugin(ScrollTrigger);
      document.body.classList.add("gsap-on");

      // ısı: ritüel bölümü ekranı doldururken 0→1 (scrub)
      if (ritual) {
        ScrollTrigger.create({
          trigger: ritual,
          start: "top 78%",
          end: "bottom 60%",
          onUpdate: function (self) { setHeat(self.progress); }
        });
      }

      // kenar ısı gösterge rayı: hero'dan sonra görün
      var rail = document.getElementById("heatRail");
      if (rail && heroEl) {
        ScrollTrigger.create({
          trigger: heroEl, start: "bottom 40%",
          onEnter: function () { rail.classList.add("is-on"); },
          onLeaveBack: function () { rail.classList.remove("is-on"); }
        });
      }

      // reveal blokları
      gsap.utils.toArray(".reveal").forEach(function (el) {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" }
        });
      });
      // stagger grupları
      gsap.utils.toArray(".reveal-stagger").forEach(function (group) {
        gsap.to(group.children, {
          opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.09,
          scrollTrigger: { trigger: group, start: "top 84%" }
        });
      });

      ScrollTrigger.refresh();
    } else {
      // no-gsap / reduced-motion / ?noanim: içerik zaten görünür.
      // İmza anını yine de eriş: hafif scroll dinleyicisiyle --heat (rAF batch'li).
      if (ritual && !reduce) {
        var ticking = false;
        function calc() {
          ticking = false;
          var r = ritual.getBoundingClientRect();
          var vh = window.innerHeight;
          var p = (vh * 0.78 - r.top) / (r.height * 0.6 + vh * 0.18);
          setHeat(p);
        }
        window.addEventListener("scroll", function () {
          if (!ticking) { ticking = true; requestAnimationFrame(calc); }
        }, { passive: true });
        calc();
      } else if (reduce) {
        setHeat(0.72); // sabit sıcak durum
      }
    }
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", bootGSAP);
  } else {
    bootGSAP();
  }
  // GSAP defer ile geç yüklenebilir; yükleme tamamlanınca da dene.
  window.addEventListener("load", function () {
    if (!document.body.classList.contains("gsap-on")) bootGSAP();
  });
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
