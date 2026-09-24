/* SAHAN — site.js
   1) açık/kapalı göstergesi (Europe/Istanbul, tarayıcıda hesaplanır)
   2) gsap-giris-sablonu deseni: hero orkestrasyonu, güvenlik zaman aşımı
   3) acilma-gorseli mantığı: IntersectionObserver ile .acil reveal
   JS hiç çalışmazsa / GSAP engellenirse: CSS'te hiçbir şey kalıcı gizli
   değildir — sayfa daima tam içerikle görünür. */
(function () {
  "use strict";

  var azHareket = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var noanim = /[?&]noanim\b/.test(location.search);

  /* ─── AÇIK/KAPALI ────────────────────────────────────────────────────
   * Servis: Sal-Paz 12:00-15:00 ve 19:00-23:00, Pazartesi kapalı.
   * Europe/Istanbul saatine göre hesaplanır (tarayıcının kendi saat
   * dilimi AYARINDAN bağımsız — Intl ile açıkça o dilime çevrilir). */
  var OGLE = { baslar: 12 * 60, biter: 15 * 60 };
  var AKSAM = { baslar: 19 * 60, biter: 23 * 60 };

  function istanbulSaati() {
    var fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Istanbul",
      weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
    });
    var parcalar = fmt.formatToParts(new Date());
    var gun, saat, dakika;
    parcalar.forEach(function (p) {
      if (p.type === "weekday") gun = p.value;
      if (p.type === "hour") saat = parseInt(p.value, 10);
      if (p.type === "minute") dakika = parseInt(p.value, 10);
    });
    return { gun: gun, dakika: saat * 60 + dakika };
  }

  function durumHesapla() {
    var GUN_ADI = { Mon: "Pazartesi", Tue: "Salı", Wed: "Çarşamba", Thu: "Perşembe", Fri: "Cuma", Sat: "Cumartesi", Sun: "Pazar" };
    var s;
    try { s = istanbulSaati(); } catch (e) { return { acik: null, metin: "Saat hesaplanamadı" }; }

    if (s.gun === "Mon") {
      return { acik: false, metin: "Bugün kapalı — yarın 12:00'de açılıyor" };
    }
    if (s.dakika >= OGLE.baslar && s.dakika < OGLE.biter) {
      return { acik: true, metin: "Açık — öğle servisi 15:00'e kadar" };
    }
    if (s.dakika >= AKSAM.baslar && s.dakika < AKSAM.biter) {
      return { acik: true, metin: "Açık — akşam servisi 23:00'e kadar" };
    }
    if (s.dakika < OGLE.baslar) {
      return { acik: false, metin: "Kapalı — bugün 12:00'de açılıyor" };
    }
    if (s.dakika >= OGLE.biter && s.dakika < AKSAM.baslar) {
      return { acik: false, metin: "Kapalı — bugün 19:00'da açılıyor" };
    }
    // 23:00 sonrası
    var yarinGun = s.gun === "Sun" ? "Pazartesi" : null;
    if (yarinGun === "Pazartesi") {
      return { acik: false, metin: "Kapalı — Pazartesi kapalı, Salı 12:00'de açılıyor" };
    }
    return { acik: false, metin: "Kapalı — yarın 12:00'de açılıyor" };
  }

  function durumUygula() {
    var d = durumHesapla();
    document.querySelectorAll("[data-durum-etiket]").forEach(function (el) {
      el.setAttribute("data-acik", d.acik === true ? "1" : d.acik === false ? "0" : "?");
    });
    document.querySelectorAll("[data-durum-metin]").forEach(function (el) {
      el.textContent = d.metin;
    });
  }
  durumUygula();
  setInterval(durumUygula, 60000);

  /* ─── HERO GİRİŞ (gsap-giris-sablonu deseni) ─────────────────────── */
  function heroTimeline() {
    if (!window.gsap || azHareket || noanim) {
      document.documentElement.classList.remove("gsap-bekliyor");
      return;
    }
    var gs = window.gsap;
    var tl = gs.timeline({
      defaults: { ease: "power2.out" },
      onComplete: function () { document.documentElement.classList.remove("gsap-bekliyor"); }
    });
    tl.to("[data-gsap]", { opacity: 1, y: 0, duration: .8, stagger: .12 });
  }

  // Güvenlik zaman aşımı: GSAP sessizce çalışmazsa 2 sn sonra içerik açılır.
  setTimeout(function () {
    document.documentElement.classList.remove("gsap-bekliyor");
  }, 2000);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", heroTimeline);
  } else {
    heroTimeline();
  }

  /* ─── SCROLL REVEAL (.acil) ──────────────────────────────────────── */
  if (!azHareket && "IntersectionObserver" in window) {
    var gozlemci = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        if (g.isIntersecting) {
          g.target.classList.add("gorundu");
          gozlemci.unobserve(g.target);
        }
      });
    }, { threshold: .15, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".acil").forEach(function (el) { gozlemci.observe(el); });
  } else {
    document.querySelectorAll(".acil").forEach(function (el) { el.classList.add("gorundu"); });
  }

  /* ─── TIKLA-YÜKLE HARİTA ─────────────────────────────────────────── */
  var haritaBtn = document.getElementById("harita-yukle-btn");
  var haritaKutu = document.getElementById("harita-kutu");
  if (haritaBtn && haritaKutu) {
    haritaBtn.addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.google.com/maps?q=Karak%C3%B6y,%20%C4%B0stanbul&output=embed";
      iframe.loading = "lazy";
      iframe.title = "SAHAN konumu — Karaköy, İstanbul";
      iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
      haritaKutu.innerHTML = "";
      haritaKutu.appendChild(iframe);
    });
  }
})();
