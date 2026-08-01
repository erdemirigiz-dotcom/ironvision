/* Teşekkür sayfası — son siparişin özeti */
(function () {
  'use strict';

  var kap = document.querySelector('[data-tesekkur-kap]');
  if (!kap) { return; }

  var E = window.AB.kacis;
  var F = window.AB.fiyat;

  var s = window.AB.oku(window.AB.ANAHTAR.sonSiparis, null);

  if (!s || !s.no) {
    kap.innerHTML = '' +
      '<div class="bos-durum">' +
        '<h1>Görüntülenecek sipariş yok</h1>' +
        '<p>Bu sayfa, ödeme adımı tamamlandıktan sonra sipariş özetini gösterir. Şu anda bu tarayıcıda kayıtlı bir sipariş bulunmuyor.</p>' +
        '<a class="btn" href="koleksiyon.html">Koleksiyona git</a>' +
      '</div>';
    return;
  }

  var m = s.musteri || {};

  kap.innerHTML = '' +
    '<div class="tesekkur">' +
      '<p class="uststart" style="justify-content:center">Siparişiniz alındı</p>' +
      '<h1>Teşekkür ederiz, ' + E(m.ad || '') + '</h1>' +
      '<p style="color:var(--gri)">Siparişiniz kaydedildi. Hazırlığa başladığımızda ve kargoya verdiğimizde ' +
        E(m.telefon || 'telefonunuzdan') + ' numarasından size haber vereceğiz.</p>' +

      '<p class="tesekkur__no">Sipariş No: ' + E(s.no) + '</p>' +

      '<div class="ozet" style="text-align:left">' +
        '<h2>Sipariş özeti</h2>' +
        s.kalemler.map(function (k) {
          return '<div class="ozet__satir"><span>' + E(k.ad) + ' · ' + E(k.beden) + ' × ' + k.adet + '</span><strong>' + F(k.tutar) + '</strong></div>';
        }).join('') +
        '<div class="ozet__satir" style="border-top:1px solid var(--cizgi);margin-top:.6rem;padding-top:1rem"><span>Ara toplam</span><strong>' + F(s.araToplam) + '</strong></div>' +
        '<div class="ozet__satir"><span>Kargo</span><strong>' + (s.kargo === 0 ? 'Ücretsiz' : F(s.kargo)) + '</strong></div>' +
        '<div class="ozet__toplam"><span>Toplam</span><span>' + F(s.toplam) + '</span></div>' +
      '</div>' +

      '<div class="kart-kutu" style="text-align:left;margin-top:1.6rem">' +
        '<dl class="bilgi-liste">' +
          '<div><dt>Sipariş tarihi</dt><dd>' + E(window.AB.tarih(s.tarih)) + '</dd></div>' +
          '<div><dt>Teslimat adresi</dt><dd><strong>' + E((m.ad || '') + ' ' + (m.soyad || '')) + '</strong><br>' +
            E(m.adres || '') + '<br>' + E((m.ilce || '') + ' / ' + (m.il || '')) + '</dd></div>' +
          '<div><dt>Ödeme</dt><dd>Kart ile · **** ' + E(s.kartSon4 || '0000') + ' <em>(demo — tahsilat yapılmadı)</em></dd></div>' +
          (m.not ? '<div><dt>Sipariş notu</dt><dd>' + E(m.not) + '</dd></div>' : '') +
        '</dl>' +
      '</div>' +

      '<p style="margin-top:2rem"><a class="btn btn--hat" href="koleksiyon.html">Alışverişe devam edin</a></p>' +
      '<p class="ozet__not" style="margin-top:1.4rem">Bu bir vitrin demosudur; gerçek bir ödeme alınmamış ve gerçek bir sipariş oluşturulmamıştır. Sipariş kaydı yalnızca bu tarayıcıda tutulur.</p>' +
    '</div>';
})();
