/* ==========================================================================
   MERCEK STUDIO — app.js
   İmza anı: scroll HIZI → (1) Anybody variable font wght/wdth breathes,
   (2) yatay kontakt-baskı galerisi motion-blur alır, durunca cama kilitlenir.
   Anayasa: transform/opacity + font-variation-settings (sınırlı el);
   prefers-reduced-motion tam durdurur. GSAP yoksa da metin/erişim çalışır.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var noanim = /(?:\?|&)noanim\b/.test(location.search); // test kapısı

  // ---- rest / hedef değerleri (imza) ------------------------------------
  var REST = { wght: 560, wdth: 108, blur: 0 };
  var MAX  = { wght: 885, wdth: 132, blur: 5 };
  var cur = { wght: REST.wght, wdth: REST.wdth, blur: REST.blur };
  var target = { wght: REST.wght, wdth: REST.wdth, blur: REST.blur };

  var veloFill = document.querySelector(".js-velo");
  var veloRead = document.querySelector(".js-velo-read");
  var SHUTTERS = ["4s", "1s", "1/30", "1/125", "1/500", "1/2000", "1/8000"];

  // ---- scroll hızı ölçümü (kendi ölçümüm; GSAP'e bağlı değil) -------------
  var lastY = window.pageYOffset || 0;
  var lastT = performance.now();
  var speed = 0; // px/ms (mutlak)

  function onScroll() {
    var y = window.pageYOffset || 0;
    var t = performance.now();
    var dt = Math.max(t - lastT, 1);
    var v = Math.abs(y - lastY) / dt; // px/ms
    speed = v;
    lastY = y;
    lastT = t;
    // hız → hedef (0.. ~3 px/ms aralığını 0..1'e sıkıştır)
    var k = Math.min(v / 2.6, 1);
    target.wght = REST.wght + (MAX.wght - REST.wght) * k;
    target.wdth = REST.wdth + (MAX.wdth - REST.wdth) * k;
    target.blur = MAX.blur * k;
  }

  function lerp(a, b, n) { return a + (b - a) * n; }

  var lastReadIdx = -1;
  function frame() {
    // hedef, scroll durunca dinlenmeye geri döner
    target.wght += (REST.wght - target.wght) * 0.06;
    target.wdth += (REST.wdth - target.wdth) * 0.06;
    target.blur += (REST.blur - target.blur) * 0.06;

    cur.wght = lerp(cur.wght, target.wght, 0.18);
    cur.wdth = lerp(cur.wdth, target.wdth, 0.18);
    cur.blur = lerp(cur.blur, target.blur, 0.18);

    root.style.setProperty("--v-wght", cur.wght.toFixed(0));
    root.style.setProperty("--v-wdth", cur.wdth.toFixed(1));
    root.style.setProperty("--blur", cur.blur.toFixed(2) + "px");

    // velocity meter + shutter okuma
    var k = (cur.wght - REST.wght) / (MAX.wght - REST.wght);
    if (veloFill) veloFill.style.right = (100 - k * 100).toFixed(0) + "%";
    if (veloRead) {
      var idx = Math.round(k * (SHUTTERS.length - 1));
      if (idx !== lastReadIdx) { veloRead.textContent = SHUTTERS[idx]; lastReadIdx = idx; }
    }
    requestAnimationFrame(frame);
  }

  // ---- imza motoru: reduced-motion / noanim'de kapalı --------------------
  if (!reduce && !noanim) {
    window.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(frame);
  } else {
    // sabit dinlenme değerleri
    root.style.setProperty("--v-wght", REST.wght);
    root.style.setProperty("--v-wdth", REST.wdth);
    root.style.setProperty("--blur", "0px");
    if (veloFill) veloFill.style.right = "0%";
  }

  // ---- GSAP: galeri pin + reveal (varsa ve hareket açıksa) ---------------
  function initGsap() {
    if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;
    if (reduce || noanim) return;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    body.classList.remove("no-gsap");
    body.classList.add("gsap-on");

    // reveal girişleri
    gsap.utils.toArray(".reveal").forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 86%" }
      });
    });

    // yatay kontakt-baskı — sadece masaüstünde pin'le
    var mq = window.matchMedia("(min-width: 861px)");
    var section = document.querySelector("#work");
    var track = document.querySelector(".js-track");
    var vp = document.querySelector(".js-gv");
    if (section && track && vp && mq.matches) {
      gsap.to(track, {
        x: function () { return -(track.scrollWidth - vp.clientWidth); },
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: function () { return "+=" + (track.scrollWidth - vp.clientWidth); },
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });
    }
  }

  if (document.readyState === "complete") initGsap();
  else window.addEventListener("load", initGsap);

  // ---- hero video: sadece görünürken oynat (preload=none korunur) --------
  var hv = document.querySelector(".js-hero-video");
  // yalnızca gerçek bir <source src> varsa gözlemle/oynat (skeleton'da yok → poster kalır)
  if (hv && hv.querySelector("source[src]") && !reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) { hv.play && hv.play().catch(function () {}); }
        else { hv.pause && hv.pause(); }
      });
    }, { threshold: 0.2 });
    io.observe(hv);
  }

  // ---- form: istemci doğrulama + aria-live durum (backend yok) -----------
  var form = document.querySelector(".js-form");
  if (form) {
    var status = form.querySelector("#form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var missing = [];
      ["date", "type", "place", "name", "email"].forEach(function (n) {
        var el = form.elements[n];
        if (el && !String(el.value).trim()) missing.push(n);
      });
      var email = form.elements["email"];
      var emailOk = email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value);
      if (missing.length) {
        status.textContent = "Please fill the required fields: " + missing.join(", ") + ".";
        var first = form.elements[missing[0]]; first && first.focus();
        return;
      }
      if (!emailOk) { status.textContent = "That email looks off — check it and resend."; email.focus(); return; }
      status.textContent = "Thanks — your enquiry is queued. On the live site I'd reply within two working days.";
      form.reset();
    });
  }
})();
