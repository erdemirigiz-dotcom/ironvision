/* Koleksiyon sayfası — kategori süzgeci (tarayıcı tarafında) */
(function () {
  'use strict';

  var filtreKap = document.querySelector('[data-filtre]');
  var listeKap = document.querySelector('[data-liste]');
  if (!filtreKap || !listeKap) { return; }

  /* Kategori süzgeci ?k=... ile URL'i değiştirir (history.replaceState) ama
     bu SUNUCU sayfası değil, aynı belgenin görünüm durumudur. canonical/og:url
     bilerek SÜZGEÇSİZ koleksiyon.html'i göstermeye devam eder — filtre
     varyantlarının hepsi tek sayfada birleşir, Google'a "14 ayrı sayfa"
     yerine "1 koleksiyon sayfası" sinyali gider. Etiketler burada SORGUSUZ
     adrese sabitlenir; ileride başka bir kod parçası yanlışlıkla
     window.location.href'i canonical'a yazarsa bile bu satır düzeltir. */
  (function sabitleCanonical() {
    var link = document.querySelector('link[rel="canonical"]');
    var ogUrl = document.querySelector('meta[property="og:url"]');
    if (link && link.href) {
      var temiz = link.href.split('?')[0].split('#')[0];
      link.setAttribute('href', temiz);
      if (ogUrl) { ogUrl.setAttribute('content', temiz); }
    }
  })();

  var VERI = null;
  var secili = 'hepsi';

  function urlKategori() {
    var p = new URLSearchParams(window.location.search).get('k');
    return p ? p.trim() : 'hepsi';
  }

  function filtreCiz(veri) {
    var kats = [{ kod: 'hepsi', ad: 'Hepsi' }].concat(veri.kategoriler || []);
    filtreKap.innerHTML = kats.map(function (k) {
      return '<button type="button" data-kod="' + window.AB.kacis(k.kod) + '" aria-pressed="false">' +
        window.AB.kacis(k.ad) + '</button>';
    }).join('') + '<p class="filtre-sayac" data-sayac aria-live="polite"></p>';

    filtreKap.addEventListener('click', function (e) {
      var d = e.target.closest('button[data-kod]');
      if (!d) { return; }
      secili = d.getAttribute('data-kod');
      uygula();
      var yeni = secili === 'hepsi'
        ? window.location.pathname
        : window.location.pathname + '?k=' + encodeURIComponent(secili);
      window.history.replaceState({}, '', yeni);
    });
  }

  function uygula() {
    var hepsi = VERI.urunler || [];
    var liste = (secili === 'hepsi')
      ? hepsi
      : hepsi.filter(function (u) { return u.kategori === secili; });

    var dugmeler = filtreKap.querySelectorAll('button[data-kod]');
    for (var i = 0; i < dugmeler.length; i++) {
      dugmeler[i].setAttribute('aria-pressed',
        dugmeler[i].getAttribute('data-kod') === secili ? 'true' : 'false');
    }

    var sayac = filtreKap.querySelector('[data-sayac]');
    if (sayac) {
      sayac.textContent = liste.length + ' ürün';
    }

    if (!liste.length) {
      listeKap.innerHTML = '<p class="yertutucu-not">Bu kategoride şu anda ürün bulunmuyor.</p>';
    } else {
      listeKap.innerHTML = liste.map(function (u) {
        return window.AB.kartHtml(u, VERI);
      }).join('');
    }
    listeKap.setAttribute('aria-busy', 'false');
  }

  window.AB.katalog().then(function (veri) {
    VERI = veri;
    filtreCiz(veri);

    var istenen = urlKategori();
    var gecerli = (veri.kategoriler || []).some(function (k) { return k.kod === istenen; });
    secili = gecerli ? istenen : 'hepsi';

    uygula();
  }).catch(function (h) {
    filtreKap.innerHTML = '';
    listeKap.innerHTML = '<p class="yertutucu-not">Ürünler yüklenemedi: ' +
      window.AB.kacis(h.message) + '</p>';
    listeKap.setAttribute('aria-busy', 'false');
  });
})();
