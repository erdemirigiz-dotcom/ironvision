/* SAHAN — TADIM ŞERİDİ (imza öğe)
 * Varsayılan HTML/CSS durumu her zaman güvenli: dikey liste, tüm kurslar
 * normal akışta okunabilir. Bu script yalnız üç koşul birden sağlanınca
 * (GSAP+ScrollTrigger yüklü, masaüstü genişliği, hareket kısıtlı değil)
 * şeridi yatay pinlenmiş hâle YÜKSELTİR — kütüphanede karşılığı olmayan,
 * bu site için sıfırdan yazılmış bir bileşendir (bkz. rapor.md).
 */
(function () {
  "use strict";

  var azHareket = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var genisMi = window.matchMedia("(min-width: 641px)").matches;
  var noanim = /[?&]noanim\b/.test(location.search);

  var pin = document.getElementById("serit-pin");
  var track = document.getElementById("serit-track");
  var dolum = document.getElementById("isi-dolum");
  var cizgiAlan = document.querySelector(".isi-cizgi-alan");
  if (!pin || !track) return;

  if (!window.gsap || !window.ScrollTrigger || azHareket || !genisMi || noanim) {
    return; // güvenli varsayılan: dikey liste kalır
  }

  gsap.registerPlugin(ScrollTrigger);
  track.classList.add("yatay");
  pin.classList.add("yatay-pin");
  if (cizgiAlan) cizgiAlan.classList.add("gorunur");

  function kaydirmaMesafesi() {
    return Math.max(0, track.scrollWidth - pin.clientWidth);
  }

  var st = ScrollTrigger.create({
    trigger: pin,
    start: "top top+=72",
    end: function () { return "+=" + (kaydirmaMesafesi() + window.innerHeight * .4); },
    pin: true,
    scrub: .4,
    invalidateOnRefresh: true,
    animation: gsap.to(track, { x: function () { return -kaydirmaMesafesi(); }, ease: "none" }),
    onUpdate: function (self) {
      if (dolum) dolum.style.width = (self.progress * 100).toFixed(1) + "%";
    }
  });

  window.addEventListener("resize", function () {
    st.refresh();
  });
})();
