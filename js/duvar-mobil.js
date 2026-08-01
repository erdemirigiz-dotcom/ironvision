/* ==========================================================================
   duvar-mobil.js — Video duvarı: dokunmatik cihazlarda otomatik oynatma
   --------------------------------------------------------------------------
   Sorun: js/site.js kartların videosunu yalnızca pointerenter / focusin ile
   başlatıyor. Telefonda hover yok; kartlar donuk poster olarak kalıyordu.

   Bu dosya site.js'e DOKUNMADAN, yalnızca "(hover: none)" ortamlarda devreye
   girer: görünür alana giren kartın videosunu data-src'den yükleyip sessiz,
   satır içi ve döngülü oynatır; görünümden çıkanı durdurur. Pil ve veri
   dostu olsun diye aynı anda en fazla ÜÇ video oynar. Masaüstü davranışı
   hiç değişmez (orada bu dosya erken çıkar).
   ========================================================================== */
(function () {
  "use strict";

  var dokunmatik = window.matchMedia && window.matchMedia("(hover: none)").matches;
  if (!dokunmatik) { return; }                       // masaüstü: site.js aynen çalışsın

  var azHareket = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (azHareket) { return; }                          // kullanıcı hareket istemiyorsa poster kalsın

  var EN_FAZLA = 3;                                   // aynı anda oynayacak video sayısı

  function basla() {
    var kartlar = [].slice.call(document.querySelectorAll(".kart[data-src]"));
    if (!kartlar.length || !("IntersectionObserver" in window)) { return; }

    var kayit = kartlar.map(function (kart) {
      return { kart: kart, video: kart.querySelector("video"), oran: 0, oynuyor: false };
    }).filter(function (k) { return !!k.video; });

    if (!kayit.length) { return; }

    function bul(kart) {
      for (var i = 0; i < kayit.length; i++) { if (kayit[i].kart === kart) { return kayit[i]; } }
      return null;
    }

    function oynat(k) {
      var v = k.video;
      // site.js'in pointerleave/focusout yolu videoyu durdurmuş olabilir;
      // bayrağa değil, videonun gerçek durumuna bakılır.
      if (k.oynuyor && !v.paused) { return; }
      if (!v.getAttribute("src")) { v.setAttribute("src", k.kart.getAttribute("data-src")); }
      v.muted = true;                                  // otomatik oynatma şartı
      v.loop = true;
      v.setAttribute("playsinline", "");
      var s = v.play();
      if (s && s.catch) { s.catch(function () { /* tarayıcı izin vermediyse poster kalır */ }); }
      k.oynuyor = true;
      k.kart.classList.add("oynuyor");
    }

    function durdur(k) {
      if (!k.oynuyor) { return; }
      try { k.video.pause(); } catch (e) { /* yoksay */ }
      k.oynuyor = false;
      k.kart.classList.remove("oynuyor");
    }

    var zamanlayici = 0;
    function dengele() {
      if (zamanlayici) { return; }
      zamanlayici = setTimeout(function () {
        zamanlayici = 0;
        var gorunur = kayit.filter(function (k) { return k.oran > 0.35; })
                           .sort(function (a, b) { return b.oran - a.oran; });
        var secili = gorunur.slice(0, EN_FAZLA);
        kayit.forEach(function (k) {
          if (secili.indexOf(k) === -1) { durdur(k); }
        });
        secili.forEach(oynat);
      }, 120);
    }

    var goz = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        var k = bul(g.target);
        if (!k) { return; }
        k.oran = g.isIntersecting ? g.intersectionRatio : 0;
      });
      dengele();
    }, { threshold: [0, 0.35, 0.6, 0.9] });

    kayit.forEach(function (k) { goz.observe(k.kart); });

    // Kaydırma sırasında da tazele (site.js'in dokunma yolu araya girebiliyor)
    window.addEventListener("scroll", dengele, { passive: true });

    // Sekme arkaya alınınca hepsini durdur (pil dostu)
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { kayit.forEach(durdur); } else { dengele(); }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", basla);
  } else {
    basla();
  }
})();
