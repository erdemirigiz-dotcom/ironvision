/* ==========================================================================
   Atölye Butik — "gösteri" katmanı (03.09.2026, tasarım kaynağı turu)
   Üç bileşen: bölünmüş başlık (hero) + orkestre giriş + ürün ızgarası stagger.
   Kütüphane: yerel GSAP (js/vendor/gsap.min.js) — CDN'e çıkılmaz.
   Kural: hiçbir içerik CSS ile gizlenip JS'in açmasına bırakılmaz. GSAP
   koşmazsa ya da bu dosya hiç yüklenmezse sayfa zaten tam görünürdür —
   aşağıdaki fonksiyonlar yalnız "görünüyken nasıl belirdiğini" değiştirir.
   ========================================================================== */
(function () {
  'use strict';

  var azaltilmisHareket = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsapVar = window.gsap;

  /* -------------------------------------------------- bölünmüş başlık ---- 
     bilesenler/bolunmus-baslik — React Bits "Split Text" fikrinin vanilla
     GSAP karşılığı. Her [data-split-baslik] elemanı kelime kelime bölünüp
     aşağıdan yukarı belirir. */
  function boluBirlestir(el) {
    var kelimeler = el.textContent.trim().split(/\s+/);
    el.innerHTML = kelimeler.map(function (k) {
      return '<span class="kelime"><span class="kelime-ic">' + k + '</span></span>';
    }).join(' ');
    return el.querySelectorAll('.kelime-ic');
  }

  function splitBasliklariOynat() {
    var basliklar = document.querySelectorAll('[data-split-baslik]');
    if (!basliklar.length) { return []; }
    var tumKelimeIcler = [];
    basliklar.forEach(function (el) {
      var icler = boluBirlestir(el);
      tumKelimeIcler.push(icler);
      if (!gsapVar || azaltilmisHareket) {
        icler.forEach(function (k) { k.style.opacity = 1; k.style.transform = 'none'; });
      }
    });
    return tumKelimeIcler;
  }

  /* ------------------------------------------------------- orkestre giriş
     Hero: üst etiket → başlık satırları (stagger) → alt metin → düğmeler,
     sırayla belirir. gsap.from() kullanılır — CSS'te kalıcı opacity:0 YOK,
     GSAP koşmazsa bu öğeler zaten normal opaklıkta durur. */
  function heroGirisiniOynat(kelimeGruplari) {
    var hero = document.querySelector('.hero');
    if (!hero || !gsapVar || azaltilmisHareket) { return; }

    var etiket = hero.querySelector('.uststart');
    var alt = hero.querySelector('.hero__alt');
    var dugmeler = hero.querySelectorAll('.hero__dugmeler > *');
    var gorsel = hero.querySelector('.hero__gorsel img, .hero__gorsel picture');

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (gorsel) {
      tl.from(gorsel, { scale: 1.08, duration: 1.1, ease: 'power2.out' }, 0);
    }
    if (etiket) {
      tl.from(etiket, { y: 14, opacity: 0, duration: .6 }, .15);
    }
    var tumKelimeIcler = [];
    kelimeGruplari.forEach(function (icler) { icler.forEach(function (k) { tumKelimeIcler.push(k); }); });
    if (tumKelimeIcler.length) {
      tl.set(tumKelimeIcler, { opacity: 0, y: '100%' }, .28)
        .to(tumKelimeIcler, { y: '0%', opacity: 1, duration: .7, stagger: .045 }, .28);
    }
    if (alt) {
      tl.from(alt, { y: 14, opacity: 0, duration: .6 }, .55);
    }
    if (dugmeler.length) {
      tl.from(dugmeler, { y: 14, opacity: 0, duration: .5, stagger: .08 }, .68);
    }
  }

  /* --------------------------------------------------- ürün ızgarası stagger
     Ana sayfa ve koleksiyon sayfası ürün kartlarını js/anasayfa.js ve
     js/koleksiyon.js DOM'a sonradan (fetch bitince) yazıyor. Kartların
     kendisini değiştirmeden, ızgarayı bir MutationObserver ile izleyip her
     dolduruşta kartlara stagger giriş uyguluyoruz — anayasa kuralı gereği
     kartlar bu script hiç çalışmasa da normal opaklıkta, tıklanabilir kalır. */
  function izgaraStaggerKur() {
    if (!gsapVar || azaltilmisHareket) { return; }
    var izgaralar = document.querySelectorAll('[data-urun-izgara], [data-urun-izgara-liste]');
    if (!izgaralar.length) { return; }

    izgaralar.forEach(function (izgara) {
      var oynat = function () {
        var kartlar = izgara.querySelectorAll('.urun-kart');
        if (!kartlar.length) { return; }
        gsap.set(kartlar, { clearProps: 'all' });
        gsap.from(kartlar, {
          y: 22, opacity: 0, duration: .55, ease: 'power2.out',
          stagger: { each: .06, grid: 'auto', from: 'start' }
        });
      };
      var gozlemci = new MutationObserver(function () { oynat(); });
      gozlemci.observe(izgara, { childList: true });
      // İlk render, sayfa çok hızlı yüklenmiş olabileceğinden kısa gecikmeyle de denenir.
      if (izgara.querySelector('.urun-kart')) { oynat(); }
    });
  }

  function baslat() {
    var kelimeGruplari = splitBasliklariOynat();
    heroGirisiniOynat(kelimeGruplari);
    izgaraStaggerKur();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', baslat);
  } else {
    baslat();
  }
})();
