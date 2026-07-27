/* FLEET RING — Atölye VYRON'un filo geçidi.
   GSAP halka galerisi (Inkwell tekniği) vanilla porta uyarlandı:
   kartlar gerçek site ekran görüntüleri, tıklama = zoom + o siteye geçiş. */
(function () {
  "use strict";
  if (!window.gsap) return;

  var BASE = "../";
  var FLEET = [
    { dir: "vitrin-hub", title: "Vitrin Hub" },
    { dir: "odul-02-meridyen-orbit", title: "Meridyen Orbit" },
    { dir: "vitrin-01-alp-kayak", title: "IGLU Alpine Lodge" },
    { dir: "vitrin-02-col-glamping", title: "HALLEY Desert Camp" },
    { dir: "vitrin-03-bag-sarap", title: "SALKIM Bağ Evi" },
    { dir: "vitrin-04-rafting", title: "DALGA Outdoor" },
    { dir: "vitrin-05-tas-konak", title: "KALEHAN Konak" },
    { dir: "vitrin-06-yayla-ekolodge", title: "RAKIM Eco-Lodge" },
    { dir: "vitrin-07-sehir-yuruyus", title: "KERVAN Walks" },
    { dir: "vitrin-08-hamam", title: "TAS Hammam" },
    { dir: "vitrin-09-fotografci", title: "MERCEK Studio" },
    { dir: "vitrin-10-zeytinyagi", title: "SAFİ Olive Oil" },
  ];

  var section = document.getElementById("fleet");
  var container = section && section.querySelector(".fleet-container");
  var ring = section && section.querySelector(".fleet-ring");
  var titleBox = section && section.querySelector(".fleet-title");
  var veil = section && section.querySelector(".fleet-veil");
  var intro = section && section.querySelector(".fleet-intro");
  if (!section || !container || !ring || !titleBox || !veil) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var config = {
    count: FLEET.length,
    radius: 290,
    sensitivity: 500,
    effectFalloff: 250,
    cardMoveAmount: 50,
    lerpFactor: 0.15,
    isMobile: window.innerWidth < 1000,
  };
  var parallax = { tx: 0, ty: 0, tz: 0, cx: 0, cy: 0, cz: 0 };
  var cards = [];
  var state = [];
  var previewActive = false;
  var transitioning = false;
  var introActive = false;
  var introPlayed = false;
  var navTimer = null;
  var currentTitle = null;

  function ringScale(vw) {
    vw = vw || window.innerWidth;
    if (vw < 768) return 0.55;
    if (vw < 1200) return 0.8;
    return 1;
  }

  for (var i = 0; i < config.count; i++) {
    (function (i) {
      var angle = (i / config.count) * Math.PI * 2;
      var x = config.radius * Math.cos(angle);
      var y = config.radius * Math.sin(angle);

      var card = document.createElement("div");
      card.className = "fleet-card";
      card.dataset.index = String(i);
      var img = document.createElement("img");
      img.src = "assets/fleet/" + FLEET[i].dir + ".jpeg";
      img.alt = FLEET[i].title;
      img.loading = "eager";
      card.appendChild(img);

      gsap.set(card, {
        x: x, y: y,
        rotation: (angle * 180) / Math.PI + 90,
        transformPerspective: 800,
        transformOrigin: "center center",
      });
      ring.appendChild(card);
      cards.push(card);
      state.push({ cr: 0, tr: 0, cxx: 0, txx: 0, cyy: 0, tyy: 0, cs: 1, ts: 1, angle: angle });

      card.addEventListener("click", function (e) {
        if (!previewActive && !transitioning && !introActive) {
          openPreview(i);
          e.stopPropagation();
        }
      });
    })(i);
  }

  function openPreview(index) {
    previewActive = true;
    transitioning = true;
    /* zoom sırasında tanıtım yazısı kartla üst üste binmesin */
    if (intro) gsap.to(intro, { autoAlpha: 0, duration: 0.4, ease: "power2.out" });
    var angle = state[index].angle;
    var target = (Math.PI * 3) / 2;
    var rot = target - angle;
    if (rot > Math.PI) rot -= Math.PI * 2;
    else if (rot < -Math.PI) rot += Math.PI * 2;

    state.forEach(function (s) {
      s.cr = s.tr = 0; s.cs = s.ts = 1; s.cxx = s.txx = 0; s.cyy = s.tyy = 0;
    });

    if (reduced) {
      navigateTo(index, 350);
      return;
    }

    gsap.to(ring, {
      onStart: function () {
        cards.forEach(function (card, i) {
          gsap.to(card, {
            x: config.radius * Math.cos(state[i].angle),
            y: config.radius * Math.sin(state[i].angle),
            rotationY: 0, scale: 1, duration: 1.25, ease: "power4.out",
          });
        });
      },
      scale: 5, y: 1300, rotation: (rot * 180) / Math.PI + 360,
      duration: 2, ease: "power4.inOut",
      onComplete: function () {
        transitioning = false;
        navigateTo(index, 900);
      },
    });

    gsap.to(parallax, {
      cx: 0, cy: 0, cz: 0, duration: 0.5, ease: "power2.out",
      onUpdate: function () {
        gsap.set(container, {
          rotateX: parallax.cx, rotateY: parallax.cy,
          rotation: parallax.cz, transformOrigin: "center center",
        });
      },
    });

    var p = document.createElement("p");
    p.innerHTML = "";
    FLEET[index].title.split(" ").forEach(function (w) {
      var s = document.createElement("span");
      s.className = "fleet-word";
      s.textContent = w;
      p.appendChild(s);
      p.appendChild(document.createTextNode(" "));
    });
    titleBox.appendChild(p);
    currentTitle = p;
    var words = p.querySelectorAll(".fleet-word");
    gsap.set(words, { y: "125%" });
    gsap.to(words, { y: "0%", duration: 0.75, delay: 1.15, stagger: 0.08, ease: "power4.out" });

    var hint = section.querySelector(".fleet-esc");
    if (hint) gsap.fromTo(hint, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, delay: 0.8 });
  }

  function navigateTo(index, delayMs) {
    navTimer = setTimeout(function () {
      gsap.to(veil, {
        autoAlpha: 1, duration: 0.55, ease: "power2.in",
        onComplete: function () {
          window.location.href = BASE + FLEET[index].dir + "/";
        },
      });
    }, delayMs);
  }

  function resetRing() {
    if (transitioning || introActive) return;
    if (navTimer) { clearTimeout(navTimer); navTimer = null; }
    gsap.killTweensOf(veil);
    gsap.set(veil, { autoAlpha: 0 });
    transitioning = true;
    var hint = section.querySelector(".fleet-esc");
    if (hint) gsap.to(hint, { autoAlpha: 0, duration: 0.3 });
    if (currentTitle) {
      var words = currentTitle.querySelectorAll(".fleet-word");
      var el = currentTitle;
      currentTitle = null;
      gsap.to(words, {
        y: "-125%", duration: 0.75, delay: 0.3, stagger: 0.08, ease: "power4.out",
        onComplete: function () { el.remove(); },
      });
    }
    if (intro) gsap.to(intro, { autoAlpha: 1, duration: 0.6, delay: 0.9, ease: "power2.out" });
    gsap.to(ring, {
      scale: ringScale(), y: 0, x: 0, rotation: 0, duration: 2.2, ease: "power4.inOut",
      onComplete: function () {
        previewActive = transitioning = false;
        parallax.tx = parallax.ty = parallax.tz = 0;
        parallax.cx = parallax.cy = parallax.cz = 0;
      },
    });
  }

  function resetTargets() {
    state.forEach(function (s) { s.tr = 0; s.ts = 1; s.txx = 0; s.tyy = 0; });
  }

  function playIntro() {
    if (introPlayed) return;
    introPlayed = true;
    introActive = true;
    resetTargets();

    var finalScale = ringScale();

    function circleX(i) { return config.radius * Math.cos(state[i].angle); }
    function circleY(i) { return config.radius * Math.sin(state[i].angle); }
    function circleRot(i) { return (state[i].angle * 180) / Math.PI + 90; }

    function finalize() {
      cards.forEach(function (card, i) {
        gsap.set(card, {
          x: circleX(i), y: circleY(i), rotation: circleRot(i),
          opacity: 1, scale: 1, rotationY: 0,
        });
      });
      gsap.set(ring, { scale: finalScale });
      introActive = false;
      resetTargets();
    }

    if (reduced) { finalize(); return; }

    var vw = window.innerWidth, vh = window.innerHeight;
    var isM = config.isMobile;
    var gap = isM ? 44 : 74;
    var lineY = isM ? 130 : 200;
    var startX = -((cards.length - 1) * gap) / 2;

    gsap.set(ring, { scale: isM ? finalScale * 0.75 : finalScale });
    cards.forEach(function (card, i) {
      gsap.set(card, {
        x: (Math.random() - 0.5) * vw * (isM ? 0.95 : 0.85),
        y: (Math.random() - 0.5) * vh * (isM ? 0.75 : 0.55),
        opacity: isM ? 1 : 0,
        rotationY: 0, rotation: circleRot(i), scale: isM ? 0.92 : 0.95,
      });
    });

    var tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    tl.timeScale(0.62);
    if (isM) tl.to(ring, { scale: finalScale, duration: 3.1, ease: "power3.inOut" }, 0);
    else tl.to(cards, { opacity: 1, duration: 0.55, stagger: 0.02, ease: "power2.out" });
    tl.to(cards, {
      duration: isM ? 1.55 : 1.35, stagger: isM ? 0.028 : 0.035,
      x: function (i) { return startX + i * gap; },
      y: lineY, scale: 1, rotationY: 0, rotation: 0,
    }, isM ? 0 : "<0.05");
    tl.to(cards, {
      duration: isM ? 1.75 : 1.45, stagger: isM ? 0.02 : 0.025,
      x: function (i) { return circleX(i); },
      y: function (i) { return circleY(i); },
      rotation: function (i) { return circleRot(i); },
      ease: "power4.inOut",
    }, ">-0.15");
    tl.eventCallback("onComplete", finalize);
  }

  /* Geri (back) ile dönüşte bfcache sayfayı zoom+perde açık hâliyle geri getirir;
     pageshow'da her şeyi dinlenme hâline sıfırla. */
  function fullReset() {
    if (navTimer) { clearTimeout(navTimer); navTimer = null; }
    gsap.killTweensOf(veil);
    gsap.killTweensOf(ring);
    cards.forEach(function (c) { gsap.killTweensOf(c); });
    gsap.set(veil, { autoAlpha: 0 });
    if (intro) { gsap.killTweensOf(intro); gsap.set(intro, { autoAlpha: 1 }); }
    titleBox.innerHTML = "";
    currentTitle = null;
    var hint = section.querySelector(".fleet-esc");
    if (hint) gsap.set(hint, { autoAlpha: 0 });
    previewActive = false;
    transitioning = false;
    parallax.tx = parallax.ty = parallax.tz = 0;
    parallax.cx = parallax.cy = parallax.cz = 0;
    gsap.set(container, { rotateX: 0, rotateY: 0, rotation: 0 });
    gsap.set(ring, { scale: ringScale(), x: 0, y: 0, rotation: 0 });
    cards.forEach(function (card, i) {
      gsap.set(card, {
        x: config.radius * Math.cos(state[i].angle),
        y: config.radius * Math.sin(state[i].angle),
        rotation: (state[i].angle * 180) / Math.PI + 90,
        rotationY: 0, scale: 1, opacity: 1,
      });
    });
    resetTargets();
  }
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) fullReset();
  });

  document.addEventListener("click", function () {
    if (previewActive && !transitioning) resetRing();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (navTimer || previewActive) {
      if (navTimer) { clearTimeout(navTimer); navTimer = null; }
      gsap.killTweensOf(veil);
      gsap.set(veil, { autoAlpha: 0 });
      if (previewActive && !transitioning) resetRing();
    }
  });
  document.addEventListener("mousemove", function (e) {
    if (previewActive || transitioning || introActive || config.isMobile || reduced) return;
    var rect = section.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    var cX = window.innerWidth / 2, cY = window.innerHeight / 2;
    var px = (e.clientX - cX) / cX, py = (e.clientY - cY) / cY;
    parallax.ty = px * 15;
    parallax.tx = -py * 15;
    parallax.tz = (px + py) * 5;
    cards.forEach(function (card, i) {
      var r = card.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < config.sensitivity) {
        var f = Math.max(0, 1 - d / config.effectFalloff);
        state[i].tr = 180 * f;
        state[i].ts = 1 + 0.3 * f;
        state[i].txx = config.cardMoveAmount * f * Math.cos(state[i].angle);
        state[i].tyy = config.cardMoveAmount * f * Math.sin(state[i].angle);
      } else {
        state[i].tr = 0; state[i].ts = 1; state[i].txx = 0; state[i].tyy = 0;
      }
    });
  });
  document.addEventListener("mouseout", function (e) {
    if ((e.relatedTarget === null || (e.relatedTarget && e.relatedTarget.nodeName === "HTML")) &&
        !previewActive && !transitioning && !introActive) {
      resetTargets();
      parallax.tx = parallax.ty = parallax.tz = 0;
    }
  });
  window.addEventListener("resize", function () {
    config.isMobile = window.innerWidth < 1000;
    if (!introActive && !previewActive) gsap.set(ring, { scale: ringScale() });
    if (!previewActive && !introActive) {
      parallax.tx = parallax.ty = parallax.tz = 0;
      parallax.cx = parallax.cy = parallax.cz = 0;
      state.forEach(function (s) { s.tr = s.cr = 0; s.ts = s.cs = 1; s.txx = s.cxx = 0; s.tyy = s.cyy = 0; });
    }
  });

  gsap.set(ring, { scale: ringScale() });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { playIntro(); io.disconnect(); }
    });
  }, { threshold: 0.35 });
  io.observe(section);

  if (!reduced) {
    (function animate() {
      if (!previewActive && !transitioning && !introActive) {
        parallax.cx += (parallax.tx - parallax.cx) * config.lerpFactor;
        parallax.cy += (parallax.ty - parallax.cy) * config.lerpFactor;
        parallax.cz += (parallax.tz - parallax.cz) * config.lerpFactor;
        gsap.set(container, {
          rotateX: parallax.cx, rotateY: parallax.cy,
          rotation: parallax.cz, transformOrigin: "center center",
        });
        cards.forEach(function (card, i) {
          var s = state[i];
          s.cr += (s.tr - s.cr) * config.lerpFactor;
          s.cs += (s.ts - s.cs) * config.lerpFactor;
          s.cxx += (s.txx - s.cxx) * config.lerpFactor;
          s.cyy += (s.tyy - s.cyy) * config.lerpFactor;
          gsap.set(card, {
            x: config.radius * Math.cos(s.angle) + s.cxx,
            y: config.radius * Math.sin(s.angle) + s.cyy,
            rotationY: s.cr, scale: s.cs,
            rotation: (s.angle * 180) / Math.PI + 90,
            transformOrigin: "center center", transformPerspective: 1000,
          });
        });
      }
      requestAnimationFrame(animate);
    })();
  }
})();
