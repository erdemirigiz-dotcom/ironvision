"use strict";
/* ============================================================================
   SITE-HUNİ.JS (HUNİ TASLAK ÇATALI, 15.08.2026) — js/site.js'nin kopyası.
   js/site.js (canlı sitede kullanılan) DOKUNULMADI.

   Sürü DEĞİŞİKLİĞİ (Demir revize 15.08 — ekran kaydı): kuş/parçacık canvas'ı
   artık YALNIZCA hero'nun içinde yaşıyor — DOM'da #suru artık #hero'nun
   çocuğu (index-huni-taslak.html), CSS'te position:absolute + .hero{overflow:
   hidden} (huni-taslak.css). Bu; hero altındaki bölümlerin (Ajans usulü,
   ürün rafı vb.) üstüne parçacık bulutu çizilmesini KÖKTEN keser — hero
   scroll'la sayfa akışının parçası olarak kayıp gider, kapanış/duvar/form
   sahneleri ve "roam" (serbest gezinme) mantığına artık gerek yok, hepsi
   kaldırıldı. Tek sahne: hero görünürken kur, görünmeyince dağıt + seyrelt.

   Yazı-başlık çakışması (Demir revize 15.08): "IRON VISION" harfleri artık
   hero'nun ÜST kısmında kuruluyor (yFrac 0.22, eskisi 0.42) — başlık bloğu
   (.hero-alt) flex ile ALTA yaslı durduğu için dikey olarak ayrışıyorlar.
   Ayrıca koruma kutusu (korumaKutusu) sürekli .hero-alt'a bağlı kalıyor ve
   #suru'nun z-index'i .hero-alt'ınkinden DÜŞÜK (huni-taslak.css) — metin
   her zaman kuşların ÜSTÜNDE render edilir.
   ========================================================================== */
(function () {
  const CONFIG = window.IV_CONFIG || {};
  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.toggle("rm", !!reduceMotion);

  // ---- 1) Sürü motoru — SADECE hero, kur / dağıt --------------------------
  const suru = document.getElementById("suru");
  const hero = document.getElementById("hero");
  const heroAlt = document.querySelector(".hero-alt");

  const HERO_YFRAC = 0.22;   // üstte, .hero-alt (alta yaslı) ile çakışmasın — sadece güvenli-bant hesaplanamazsa yedek
  const MAJOR = 0.5;         // hero'nun bu oranı görünürken "kurulu" say
  const METIN_BOSLUK = 16;   // kuş yazısı ile başlık bloğu arasında bırakılan pay (px)

  function heroKutusuGuncelle() {
    if (window.SahneMotoru && heroGorunur && heroAlt) {
      SahneMotoru.korumaKutusu(heroAlt.getBoundingClientRect());
    }
  }

  // Kuş yazısı ("IRON VISION") güvenli bant daralınca hiç kurulamayabilir
  // (bkz. surumotoru-huni.js buildTargets — MIN_AVAIL). O durumda üstündeki
  // ince "TOOLS" etiketi hiçbir şeyi etiketlemeyen yetim bir kelime gibi
  // kalıyordu (Demir revize 15.08). SahneMotoru.metinVarMi() gerçek durumu
  // okur; JS tahmine gerek yok, .hero-tools CSS'te bu class'a göre gizlenir.
  function toolsEtiketiTazele() {
    if (!hero || !window.SahneMotoru) return;
    hero.classList.toggle("yazi-yok", !SahneMotoru.metinVarMi());
  }

  // Kuş yazısının ("IRON VISION") ASLA aşamayacağı alt sınırı hesaplar: hero-alt
  // başlık bloğunun hero'ya göre YEREL üst kenarı, eksi bir nefes payı. Hangi
  // viewport'ta (1440, 375, kısa/alçak pencere...) olursa olsun yazı bu Y'nin
  // altına kurulamaz — çakışma matematiksel olarak imkansız (Demir revize 15.08).
  function heroSiniriUygula() {
    if (!window.SahneMotoru || !hero || !heroAlt) return;
    const heroRect = hero.getBoundingClientRect();
    const altRect = heroAlt.getBoundingClientRect();
    const yerelUst = altRect.top - heroRect.top;
    SahneMotoru.metinSiniri(yerelUst - METIN_BOSLUK);
  }

  let heroGorunur = false;

  function kararVer() {
    if (!window.SahneMotoru) return;
    if (heroGorunur) {
      heroSiniriUygula();
      SahneMotoru.yogunluk(1);
      SahneMotoru.kur("IRON\nVISION", { yFrac: HERO_YFRAC });
      heroKutusuGuncelle();
      toolsEtiketiTazele();
    } else {
      SahneMotoru.korumaKutusu(null);
      SahneMotoru.dagit();
      SahneMotoru.yogunluk(0.05); // asgari — hero dışında görünürlüğü sıfıra yakın
    }
  }

  if (!reduceMotion && suru && window.SahneMotoru) {
    SahneMotoru.init(suru);
    heroGorunur = true;
    kararVer();

    // Fontlar yüklenince hero yazısını yeniden kur (keskin harf kenarları) —
    // font yüklenmesi başlık bloğunun yüksekliğini de değiştirebileceğinden
    // güvenli-bant sınırı da BURADA yeniden hesaplanır.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (heroGorunur) {
          heroSiniriUygula();
          SahneMotoru.kur("IRON\nVISION", { yFrac: HERO_YFRAC });
          heroKutusuGuncelle();
          toolsEtiketiTazele();
        }
      });
    }

    if (hero) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          heroGorunur = e.isIntersecting && e.intersectionRatio >= MAJOR;
        });
        kararVer();
      }, { threshold: [0, 0.25, MAJOR, 0.8, 1] }).observe(hero);
    }

    // Hero görünürken slogan kutusu scroll/resize ile kayar: itme bölgesini tazele
    window.addEventListener("scroll", function () {
      if (heroGorunur) heroKutusuGuncelle();
    }, { passive: true });
    // Resize: hero-alt'ın yerel konumu (dolayısıyla güvenli-bant sınırı) viewport
    // boyutuna göre değişir — SahneMotoru'nun kendi (debounce'lu) resize'ından
    // ÖNCE senkron olarak tazelenir ki yazı hiçbir ara karede eski (yanlış)
    // sınırla kurulmasın.
    window.addEventListener("resize", function () {
      if (heroGorunur) { heroSiniriUygula(); heroKutusuGuncelle(); toolsEtiketiTazele(); }
    });

    // Bölüm başlıklarının yanından süzülürken kısa parlaklık dalgası
    // (canvas artık hero dışında görünmese de motor pulse çağrısını yutar — zararsız)
    const basliklar = document.querySelectorAll(".nabiz");
    if (basliklar.length) {
      const nabizObs = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) SahneMotoru.nabiz(); });
      }, { threshold: 0.6 });
      basliklar.forEach(function (el) { nabizObs.observe(el); });
    }
  }

  // ---- 2) Hero "TOOLS" ibaresi -------------------------------------------
  // (Logo bütünlüğü: IRON VISION'ın altındaki ince "TOOLS" satırı artık saf
  //  CSS akışıyla sloganın üstünde durur — JS konumlandırma gerekmez.)

  // ---- 3) Video duvarı: tembel yükleme + hover/tap oynatma ------------------
  const kartlar = document.querySelectorAll(".kart[data-src]");
  if (kartlar.length) {
    // Yaklaşınca kaynağı ata (preload=none olduğundan indirme yine play'de başlar)
    const yukObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        const kart = e.target;
        const video = kart.querySelector("video");
        if (video && !video.getAttribute("src")) {
          video.setAttribute("src", kart.getAttribute("data-src"));
        }
        yukObs.unobserve(kart);
      });
    }, { rootMargin: "300px 0px" });

    kartlar.forEach(function (kart) {
      yukObs.observe(kart);
      const video = kart.querySelector("video");
      if (!video) return;

      function oynat() {
        if (reduceMotion) return;
        if (!video.getAttribute("src")) video.setAttribute("src", kart.getAttribute("data-src"));
        const p = video.play();
        if (p && p.catch) p.catch(function () {});
        kart.classList.add("oynuyor");
      }
      function durdur() {
        video.pause();
        kart.classList.remove("oynuyor");
      }

      kart.addEventListener("pointerenter", oynat);
      kart.addEventListener("pointerleave", durdur);
      kart.addEventListener("focusin", oynat);
      kart.addEventListener("focusout", durdur);
      // Dokunmatik: tıklamayla aç/kapa
      kart.addEventListener("click", function () {
        if (kart.classList.contains("oynuyor")) durdur(); else oynat();
      });
    });
  }

  // ---- 4) Video duvarı: fare/parmakla hafif derinlik (parallax tilt) -------
  const duvarSahne = document.getElementById("duvar-sahne");
  if (!reduceMotion && duvarSahne) {
    let raf = 0;
    duvarSahne.addEventListener("pointermove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        const r = duvarSahne.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        duvarSahne.style.setProperty("--tilt-x", (ny * -6).toFixed(2) + "deg");
        duvarSahne.style.setProperty("--tilt-y", (nx * 8).toFixed(2) + "deg");
        raf = 0;
      });
    });
    duvarSahne.addEventListener("pointerleave", function () {
      duvarSahne.style.setProperty("--tilt-x", "0deg");
      duvarSahne.style.setProperty("--tilt-y", "0deg");
    });
  }

  // ---- 5) İletişim formu → ortak form motoru (app.py /api/form) ------------
  const form = document.getElementById("iletisim-form");
  if (form) {
    const durumEl = document.getElementById("form-durum");
    const btn = form.querySelector("button[type=submit]");

    function durum(mesaj, tip) {
      if (!durumEl) return;
      durumEl.textContent = mesaj;
      durumEl.className = "form-durum " + (tip || "");
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Honeypot: doluysa sessizce "başarılı" de, hiçbir şey gönderme
      const tuzak = form.querySelector('input[name="website"]');
      if (tuzak && tuzak.value.trim()) {
        durum("Teşekkürler, mesajınız bize ulaştı.", "ok");
        form.reset();
        return;
      }

      const ad = form.querySelector('[name="name"]').value.trim();
      const eposta = form.querySelector('[name="email"]').value.trim();
      const mesaj = form.querySelector('[name="message"]').value.trim();

      if (!ad || !eposta || !mesaj) {
        durum("Lütfen adınızı, e-postanızı ve mesajınızı doldurun.", "hata");
        return;
      }

      if (btn) { btn.disabled = true; btn.dataset.eski = btn.textContent; btn.textContent = "Gönderiliyor…"; }
      durum("Gönderiliyor…", "");

      try {
        const res = await fetch(CONFIG.FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: ad, email: eposta, message: mesaj,
            _site: CONFIG.SITE_ETIKETI || "ironvisiontools-show-site"
          })
        });
        if (res.ok) {
          durum("Teşekkürler. Mesajınız bize ulaştı; en kısa sürede dönüş yapacağız.", "ok");
          form.reset();
        } else if (res.status === 429) {
          durum("Kısa sürede çok fazla gönderim oldu. Lütfen birazdan tekrar deneyin.", "hata");
        } else {
          durum("Bir aksilik oldu. Lütfen tekrar deneyin ya da doğrudan yazın.", "hata");
        }
      } catch (err) {
        durum("Bağlantı kurulamadı. İnternetinizi kontrol edip tekrar deneyin.", "hata");
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.eski || "Gönder"; }
      }
    });
  }
})();
