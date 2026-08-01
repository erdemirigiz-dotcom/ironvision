/* Sepet sayfası — kalem listesi, adet düzenleme ve iki sipariş yolu */
(function () {
  'use strict';

  var kap = document.querySelector('[data-sepet-kap]');
  if (!kap) { return; }

  var E = window.AB.kacis;
  var F = window.AB.fiyat;
  var VERI = null;

  function bosCiz() {
    kap.innerHTML = '' +
      '<div class="bos-durum">' +
        '<h2>Sepetiniz henüz boş</h2>' +
        '<p>Koleksiyondaki bir parçayı beğendiğinizde bedenini seçip sepete ekleyebilirsiniz. Sepetiniz bu tarayıcıda saklanır.</p>' +
        '<a class="btn" href="koleksiyon.html">Koleksiyona git</a>' +
      '</div>';
  }

  function satirHtml(k) {
    return '' +
      '<div class="satir">' +
        '<div class="satir__gorsel">' +
          '<a href="urun.html?id=' + encodeURIComponent(k.id) + '">' +
            '<img src="' + E(window.AB.kucukGorsel(k.gorsel)) + '" alt="' + E(k.gorselAlt) + '" loading="lazy" decoding="async" width="92" height="123">' +
          '</a>' +
        '</div>' +
        '<div>' +
          '<h2 class="satir__ad"><a href="urun.html?id=' + encodeURIComponent(k.id) + '">' + E(k.ad) + '</a></h2>' +
          '<p class="satir__meta">Beden: ' + E(k.beden) + ' · Birim ' + F(k.birimFiyat) + '</p>' +
          '<div class="adet-kutu" role="group" aria-label="' + E(k.ad) + ' adedi">' +
            '<button type="button" data-degistir="-1" data-id="' + E(k.id) + '" data-beden="' + E(k.beden) + '" aria-label="Adedi azalt">&minus;</button>' +
            '<span class="deger">' + k.adet + '</span>' +
            '<button type="button" data-degistir="1" data-id="' + E(k.id) + '" data-beden="' + E(k.beden) + '" aria-label="Adedi artır">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="satir__sag">' +
          '<span class="satir__tutar">' + F(k.tutar) + '</span>' +
          '<button class="sil-btn" type="button" data-sil data-id="' + E(k.id) + '" data-beden="' + E(k.beden) + '">Kaldır</button>' +
        '</div>' +
      '</div>';
  }

  function ciz() {
    var h = window.AB.sepetHesapla(VERI);

    if (!h.kalemler.length) { bosCiz(); return; }

    var esik = window.AB.ayar.ucretsizKargoEsigi || 0;
    var kargoMetni = h.kargo === 0
      ? 'Ücretsiz'
      : F(h.kargo);

    kap.innerHTML = '' +
      '<div class="sepet-duzen">' +

        '<div>' +
          h.kalemler.map(satirHtml).join('') +
          '<p style="margin-top:1.6rem"><a class="baglanti" href="koleksiyon.html">Alışverişe devam edin</a></p>' +
        '</div>' +

        '<aside class="ozet" aria-label="Sipariş özeti">' +
          '<h2>Sipariş özeti</h2>' +
          '<div class="ozet__satir"><span>Ara toplam</span><strong>' + F(h.araToplam) + '</strong></div>' +
          '<div class="ozet__satir"><span>Kargo</span><strong>' + kargoMetni + '</strong></div>' +
          '<div class="ozet__toplam"><span>Toplam</span><span>' + F(h.toplam) + '</span></div>' +

          (h.ucretsizKargo
            ? '<p class="ozet__not">Kargo bu siparişte ücretsiz.</p>'
            : '<p class="ozet__not">' + F(esik) + ' ve üzeri siparişlerde kargo ücretsizdir.</p>') +

          '<div class="ozet__dugmeler">' +
            '<a class="btn btn--wa" data-wa href="' + E(window.AB.whatsappBaglantisi(h)) + '" target="_blank" rel="noopener">WhatsApp ile Sipariş Ver</a>' +
            '<a class="btn" href="odeme.html">Kartla Öde</a>' +
          '</div>' +

          '<p class="ozet__not">WhatsApp yolunda sepetiniz hazır bir mesaja dönüşür; gönder tuşuna basmadan önce mesajı düzenleyebilirsiniz.</p>' +
        '</aside>' +

      '</div>';
  }

  kap.addEventListener('click', function (e) {
    var degistir = e.target.closest('[data-degistir]');
    if (degistir) {
      var id = degistir.getAttribute('data-id');
      var beden = degistir.getAttribute('data-beden');
      var fark = parseInt(degistir.getAttribute('data-degistir'), 10) || 0;
      var mevcut = 1;
      window.AB.sepetOku().forEach(function (k) {
        if (k.id === id && k.beden === beden) { mevcut = k.adet; }
      });
      window.AB.sepetAdet(id, beden, mevcut + fark);
      ciz();
      return;
    }

    var sil = e.target.closest('[data-sil]');
    if (sil) {
      window.AB.sepetSil(sil.getAttribute('data-id'), sil.getAttribute('data-beden'));
      window.AB.bildir('Ürün sepetten kaldırıldı.');
      ciz();
    }
  });

  window.AB.katalog().then(function (veri) {
    VERI = veri;
    ciz();
  }).catch(function (h) {
    window.AB.hataGoster(kap, 'Sepet yüklenemedi: ' + h.message);
  });
})();
