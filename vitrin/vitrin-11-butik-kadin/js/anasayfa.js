/* Ana sayfa — öne çıkan ürün ızgarası */
(function () {
  'use strict';

  var kap = document.querySelector('[data-urun-izgara]');
  if (!kap) { return; }

  var sinir = parseInt(kap.getAttribute('data-limit'), 10) || 8;

  window.AB.katalog().then(function (veri) {
    var liste = (veri.urunler || []).slice(0, sinir);
    if (!liste.length) {
      kap.innerHTML = '<p class="yertutucu-not">Şu anda gösterilecek ürün yok.</p>';
      return;
    }
    kap.innerHTML = liste.map(function (u) {
      return window.AB.kartHtml(u, veri);
    }).join('');
  }).catch(function (h) {
    kap.innerHTML = '<p class="yertutucu-not">Ürünler yüklenemedi: ' +
      window.AB.kacis(h.message) + '</p>';
  });
})();
