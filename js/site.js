"use strict";
/* ============================================================================
   SITE.JS — orkestrasyon
   Sürü motoru + demir tozu efektini scroll'a bağlar, video duvarını tembel
   yükler/oynatır, iletişim formunu ortak form motoruna POST eder.
   ========================================================================== */
(function () {
  const CONFIG = window.IV_CONFIG || {};
  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.toggle("rm", !!reduceMotion);

  // ---- 1) Sürü motoru + scroll sahneleri -----------------------------------
  // Kural (telefon kaydındaki hataya karşı): YAZI yalnız hero YA DA kapanış
  // bölümü viewport'un ÇOĞUNLUĞUNU kaplarken kurulur. Bölüm çıkınca hemen
  // dağılır; ara bölümlerin (hizmet/tools/duvar) üstünde ASLA yazı kurulmaz.
  // Otomatik kur-dağıt döngüsü YOK. Form alanı odaktayken sürü hiç yazı kurmaz
  // ve seyrelir.
  const suru = document.getElementById("suru");
  const hero = document.getElementById("hero");
  // Kapanış sözü, forma binmesin diye SADECE üstteki boş banda kurulur.
  const kapanis = document.getElementById("kapanis-hero");
  const duvar = document.getElementById("duvar");
  const heroAlt = document.querySelector(".hero-alt");
  const formSar = document.querySelector(".form-sar");

  const MAJOR = 0.62;       // "çoğunluğu kaplıyor" eşiği — yazı, bölümden çıkarken
                            // daha ERKEN dağılmaya başlar (Demir 28.07: geç kalıyordu)
  // Mobilde serbest sürü SEYREK gezer (Demir 28.07: telefonda içerik üstünde
  // çok fazla nokta). Yazı kurulumu (hero/kapanış) dokunulmadı — harf dolu kalır.
  function roamYogunlugu() {
    const m = window.innerWidth < 600;
    return duvarGorunur ? (m ? 0.20 : 0.50) : (m ? 0.26 : 0.65);
  }
  let sahne = null;
  let heroRatio = 0, kapanisRatio = 0, duvarGorunur = false;
  let formOdakta = false;

  function heroKutusuGuncelle() {
    if (window.SahneMotoru && sahne === "hero" && heroAlt) {
      SahneMotoru.korumaKutusu(heroAlt.getBoundingClientRect());
    }
  }

  // Form odaktayken sürü form panelinin üstüne binmesin (ama sayfada uçmaya devam)
  function formKutusuGuncelle() {
    if (window.SahneMotoru && sahne === "form" && formSar) {
      SahneMotoru.korumaKutusu(formSar.getBoundingClientRect());
    }
  }

  function setSahne(s) {
    if (s === sahne || !window.SahneMotoru) return;
    sahne = s;
    if (s === "hero") {
      SahneMotoru.yogunluk(1);
      SahneMotoru.kur("IRON\nVISION", { yFrac: 0.42 });
      heroKutusuGuncelle();
    } else if (s === "kapanis") {
      SahneMotoru.korumaKutusu(null);
      SahneMotoru.yogunluk(1);
      SahneMotoru.kur("SIRA\nSİZDE", { yFrac: 0.40 });
    } else if (s === "form") {
      // Form odaktayken: sürü seyrelir AMA sayfada uçmaya devam eder; form
      // panelinin üstüne binmesin diye panel çevresine itme kutusu bağlanır.
      SahneMotoru.dagit();
      SahneMotoru.yogunluk(window.innerWidth < 600 ? 0.22 : 0.35);
      formKutusuGuncelle();
    } else { // roam — MURMUR gibi ÖN yüzde küme küme dolaşır (seyrelme büyük oranda kalktı)
      SahneMotoru.korumaKutusu(null);
      SahneMotoru.dagit();
      SahneMotoru.yogunluk(roamYogunlugu());
    }
  }

  // Tek karar noktası: oranlar + form odağı → sahne
  function kararVer() {
    if (formOdakta) { setSahne("form"); return; }
    if (heroRatio >= MAJOR) setSahne("hero");
    else if (kapanisRatio >= MAJOR) setSahne("kapanis");
    else setSahne("roam");
  }

  if (!reduceMotion && suru && window.SahneMotoru) {
    SahneMotoru.init(suru);
    setSahne("hero");

    // Fontlar yüklenince hero yazısını yeniden kur (keskin harf kenarları)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (sahne === "hero") { SahneMotoru.kur("IRON\nVISION", { yFrac: 0.42 }); heroKutusuGuncelle(); }
      });
    }

    const esik = [0, 0.25, MAJOR, 0.8, 1];

    if (hero) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { heroRatio = e.isIntersecting ? e.intersectionRatio : 0; });
        kararVer();
      }, { threshold: esik }).observe(hero);
    }

    if (kapanis) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { kapanisRatio = e.isIntersecting ? e.intersectionRatio : 0; });
        kararVer();
      }, { threshold: esik }).observe(kapanis);
    }

    // Video duvarı görünürken sürü daha çok seyrelir
    if (duvar) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { duvarGorunur = e.isIntersecting; });
        if (sahne === "roam") SahneMotoru.yogunluk(roamYogunlugu());
      }, { threshold: 0.3 }).observe(duvar);
    }

    // Hero görünürken slogan kutusu scroll'la kayar: itme bölgesini tazele
    window.addEventListener("scroll", function () {
      if (sahne === "hero") heroKutusuGuncelle();
      else if (sahne === "form") formKutusuGuncelle();
    }, { passive: true });
    window.addEventListener("resize", function () { heroKutusuGuncelle(); formKutusuGuncelle(); });

    // Form alanı odaktayken (yazarken) sürü asla yazı kurmaz, seyrelir
    const formEl = document.getElementById("iletisim-form");
    if (formEl) {
      formEl.addEventListener("focusin", function () { formOdakta = true; kararVer(); });
      formEl.addEventListener("focusout", function () {
        // Odak forma geri dönmüyorsa serbest bırak
        setTimeout(function () {
          if (!formEl.contains(document.activeElement)) { formOdakta = false; kararVer(); }
        }, 0);
      });
    }

    // Bölüm başlıklarının yanından süzülürken kısa parlaklık dalgası
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
