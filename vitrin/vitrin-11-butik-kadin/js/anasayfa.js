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

/* "Atölyeden" şeridi — ok düğmeleri bir kart genişliği kadar kaydırır.
   Şeridin kendisi native overflow-x + scroll-snap ile zaten dokunma/
   sürükleme ve klavye okla (tabindex) kaydırılabilir; düğmeler yalnızca
   fare kullanıcısı için ek bir kestirme. */
(function () {
  'use strict';

  var serit = document.querySelector('[data-atolye-serit]');
  var oklar = document.querySelectorAll('[data-atolye-ok]');
  if (!serit || !oklar.length) { return; }

  var azaltilmisHareket = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  for (var i = 0; i < oklar.length; i++) {
    oklar[i].addEventListener('click', function (e) {
      var yon = parseInt(e.currentTarget.getAttribute('data-atolye-ok'), 10) || 1;
      var ilkKart = serit.querySelector('li');
      var adim = ilkKart ? ilkKart.getBoundingClientRect().width + 18 : 300;
      serit.scrollBy({ left: yon * adim, behavior: azaltilmisHareket ? 'auto' : 'smooth' });
    });
  }
})();
