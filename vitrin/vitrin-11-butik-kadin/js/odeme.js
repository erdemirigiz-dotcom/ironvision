/* Ödeme sayfası — teslimat + kart formu (vitrin; gerçek tahsilat yapılmaz) */
(function () {
  'use strict';

  var kap = document.querySelector('[data-odeme-kap]');
  if (!kap) { return; }

  var E = window.AB.kacis;
  var F = window.AB.fiyat;

  function ciz(veri) {
    var h = window.AB.sepetHesapla(veri);

    if (!h.kalemler.length) {
      kap.innerHTML = '' +
        '<div class="bos-durum">' +
          '<h2>Ödenecek bir sipariş yok</h2>' +
          '<p>Sepetiniz boş olduğu için ödeme adımına geçilemiyor. Önce koleksiyondan bir parça seçin.</p>' +
          '<a class="btn" href="koleksiyon.html">Koleksiyona git</a>' +
        '</div>';
      return;
    }

    kap.innerHTML = '' +
      '<div class="sepet-duzen">' +

        '<form novalidate data-form>' +
          '<p class="demo-rozet">Demo ödeme — tahsilat yapılmaz, kart bilgisi hiçbir yere gönderilmez.</p>' +

          '<div class="form-bolum">' +
            '<h2>Teslimat bilgileri</h2>' +
            '<div class="form-izgara">' +
              '<div class="alan"><label for="ad">Ad</label><input id="ad" name="ad" type="text" autocomplete="given-name" required></div>' +
              '<div class="alan"><label for="soyad">Soyad</label><input id="soyad" name="soyad" type="text" autocomplete="family-name" required></div>' +
              '<div class="alan"><label for="telefon">Telefon</label><input id="telefon" name="telefon" type="tel" inputmode="tel" autocomplete="tel" placeholder="05XX XXX XX XX" required></div>' +
              '<div class="alan"><label for="eposta">E-posta</label><input id="eposta" name="eposta" type="email" autocomplete="email" placeholder="ornek@eposta.com" required></div>' +
              '<div class="alan"><label for="il">İl</label><input id="il" name="il" type="text" autocomplete="address-level1" required></div>' +
              '<div class="alan"><label for="ilce">İlçe</label><input id="ilce" name="ilce" type="text" autocomplete="address-level2" required></div>' +
              '<div class="alan alan--tam"><label for="adres">Açık adres</label><textarea id="adres" name="adres" rows="3" autocomplete="street-address" required></textarea></div>' +
              '<div class="alan alan--tam"><label for="not">Sipariş notu (isteğe bağlı)</label><input id="not" name="not" type="text" placeholder="Kapıda bırakılmasın, hediye paketi olsun gibi"></div>' +
            '</div>' +
          '</div>' +

          '<div class="form-bolum">' +
            '<h2>Kart bilgileri</h2>' +
            '<div class="form-izgara">' +
              '<div class="alan alan--tam"><label for="kartAd">Kart üzerindeki isim</label><input id="kartAd" name="kartAd" type="text" autocomplete="off" required></div>' +
              '<div class="alan alan--tam"><label for="kartNo">Kart numarası</label><input id="kartNo" name="kartNo" type="text" inputmode="numeric" autocomplete="off" placeholder="0000 0000 0000 0000" maxlength="19" required><small>Demo alan — gerçek kart numarası girmeyin; hiçbir bilgi kaydedilmez veya gönderilmez.</small></div>' +
              '<div class="alan"><label for="sonKullanim">Son kullanma</label><input id="sonKullanim" name="sonKullanim" type="text" inputmode="numeric" autocomplete="off" placeholder="AA/YY" maxlength="5" required></div>' +
              '<div class="alan"><label for="cvv">CVV</label><input id="cvv" name="cvv" type="text" inputmode="numeric" autocomplete="off" placeholder="000" maxlength="4" required></div>' +
            '</div>' +
            '<p class="uyari" data-uyari role="alert"></p>' +
          '</div>' +

          '<button class="btn btn--tam" type="submit">Ödemeyi Tamamla — ' + F(h.toplam) + '</button>' +
          '<p class="ozet__not">Bu düğme gerçek bir ödeme başlatmaz. Siparişiniz yalnızca bu tarayıcıda kaydedilir; hiçbir bilgi gönderilmez.</p>' +
        '</form>' +

        '<aside class="ozet" aria-label="Sipariş özeti">' +
          '<h2>Sipariş özeti</h2>' +
          h.kalemler.map(function (k) {
            return '<div class="ozet__satir"><span>' + E(k.ad) + ' · ' + E(k.beden) + ' × ' + k.adet + '</span><strong>' + F(k.tutar) + '</strong></div>';
          }).join('') +
          '<div class="ozet__satir" style="border-top:1px solid var(--cizgi);margin-top:.6rem;padding-top:1rem"><span>Ara toplam</span><strong>' + F(h.araToplam) + '</strong></div>' +
          '<div class="ozet__satir"><span>Kargo</span><strong>' + (h.kargo === 0 ? 'Ücretsiz' : F(h.kargo)) + '</strong></div>' +
          '<div class="ozet__toplam"><span>Toplam</span><span>' + F(h.toplam) + '</span></div>' +
          '<p class="ozet__not"><a href="sepet.html">Sepeti düzenleyin</a></p>' +
        '</aside>' +

      '</div>';

    kartMaskesi();
    formuKur(h);
  }

  /* Kart numarası ve tarih için görsel maskeleme (yalnızca biçim yardımı) */
  function kartMaskesi() {
    var no = kap.querySelector('#kartNo');
    if (no) {
      no.addEventListener('input', function () {
        var s = this.value.replace(/\D/g, '').slice(0, 16);
        this.value = s.replace(/(.{4})/g, '$1 ').trim();
      });
    }
    var sk = kap.querySelector('#sonKullanim');
    if (sk) {
      sk.addEventListener('input', function () {
        var s = this.value.replace(/\D/g, '').slice(0, 4);
        this.value = s.length > 2 ? s.slice(0, 2) + '/' + s.slice(2) : s;
      });
    }
    var cvv = kap.querySelector('#cvv');
    if (cvv) {
      cvv.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 4);
      });
    }
  }

  function formuKur(h) {
    var form = kap.querySelector('[data-form]');
    var uyari = kap.querySelector('[data-uyari]');
    if (!form) { return; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var eksik = [];
      var alanlar = form.querySelectorAll('[required]');
      for (var i = 0; i < alanlar.length; i++) {
        if (!alanlar[i].value.trim()) {
          eksik.push(alanlar[i]);
        }
      }

      if (eksik.length) {
        uyari.textContent = 'Lütfen zorunlu alanların tamamını doldurun (' + eksik.length + ' alan eksik).';
        eksik[0].focus();
        return;
      }

      var kartNo = form.querySelector('#kartNo').value.replace(/\D/g, '');
      if (kartNo.length < 12) {
        uyari.textContent = 'Kart numarası eksik görünüyor. Demo için 16 haneli herhangi bir sayı yazabilirsiniz.';
        form.querySelector('#kartNo').focus();
        return;
      }

      uyari.textContent = '';

      var d = new FormData(form);
      var siparis = {
        no: window.AB.siparisNo(),
        tarih: new Date().toISOString(),
        durum: 'Hazırlanıyor',
        musteri: {
          ad: d.get('ad').trim(),
          soyad: d.get('soyad').trim(),
          telefon: d.get('telefon').trim(),
          eposta: d.get('eposta').trim(),
          il: d.get('il').trim(),
          ilce: d.get('ilce').trim(),
          adres: d.get('adres').trim(),
          not: (d.get('not') || '').trim()
        },
        /* Kart bilgisi bilinçli olarak KAYDEDİLMEZ; yalnızca son 4 hane gösterilir. */
        kartSon4: kartNo.slice(-4),
        kalemler: h.kalemler.map(function (k) {
          return {
            id: k.id, ad: k.ad, beden: k.beden, adet: k.adet,
            birimFiyat: k.birimFiyat, tutar: k.tutar
          };
        }),
        araToplam: h.araToplam,
        kargo: h.kargo,
        toplam: h.toplam
      };

      window.AB.siparisKaydet(siparis);
      window.AB.sepetBosalt();
      window.location.href = 'tesekkur.html';
    });
  }

  window.AB.katalog().then(ciz).catch(function (h) {
    window.AB.hataGoster(kap, 'Ödeme sayfası yüklenemedi: ' + h.message);
  });
})();
