/* Ürün detay sayfası — galeri, beden ve adet seçimi, sepete ekleme */
(function () {
  'use strict';

  var kap = document.querySelector('[data-urun-kap]');
  if (!kap) { return; }

  var E = window.AB.kacis;
  var id = new URLSearchParams(window.location.search).get('id');

  var secilenBeden = null;
  var adet = 1;
  var URUN = null;

  /* "Üzerinde Dene" widget'i — yalnız config.js'te açıksa devreye girer.
     Kapalıyken sayfa hiç düğme çizmez, hiçbir dış dosya indirmez. */
  var UD = (window.SITE_AYAR && window.SITE_AYAR.uzerindeDene) || null;
  var UD_ACIK = !!(UD && UD.aktif && UD.servis);
  var udYukleme = null;

  /* Widget dosyası ancak düğmeye BASILINCA indirilir (tembel yükleme):
     sayfa açılışında ne istek atılır ne de bayt harcanır. */
  function widgetYukle() {
    if (window.UzerindeDene) { return Promise.resolve(); }
    if (udYukleme) { return udYukleme; }
    udYukleme = new Promise(function (tamam, hata) {
      var s = document.createElement('script');
      s.src = String(UD.servis).replace(/\/+$/, '') + '/widget.js';
      s.async = true;
      s.onload = function () {
        if (window.UzerindeDene) { tamam(); } else { hata(new Error('widget yüklenmedi')); }
      };
      s.onerror = function () {
        udYukleme = null;                 // bir sonraki tıklamada yeniden denensin
        hata(new Error('widget yüklenemedi'));
      };
      document.head.appendChild(s);
    });
    return udYukleme;
  }

  function ciz(u, veri) {
    var katAd = window.AB.kategoriAdi(veri, u.kategori);
    var gorseller = u.gorseller && u.gorseller.length
      ? u.gorseller
      : [{ src: 'img/detay-rafta.jpg', alt: u.ad }];
    var bedenler = u.bedenler && u.bedenler.length ? u.bedenler : ['Tek beden'];
    secilenBeden = bedenler.length === 1 ? bedenler[0] : null;

    document.title = u.ad + ' — Atölye Butik';
    var aciklamaEtiketi = document.querySelector('meta[name="description"]');
    if (aciklamaEtiketi) { aciklamaEtiketi.setAttribute('content', u.aciklama || ''); }
    var ogBaslik = document.querySelector('meta[property="og:title"]');
    if (ogBaslik) { ogBaslik.setAttribute('content', u.ad + ' — Atölye Butik'); }
    var ogAcik = document.querySelector('meta[property="og:description"]');
    if (ogAcik) { ogAcik.setAttribute('content', u.aciklama || ''); }
    /* Canonical ve og:url ürün kimliğini taşımalı: aksi halde 14 ürün sayfası
       Google'a "aynı sayfa" görünür ve yalnız biri indekslenir.
       og:image de MUTLAK adres olmalı; göreli yol WhatsApp/Facebook
       önizlemesinde görsel getirmez. Alan adı sayfadaki mevcut canonical
       etiketinden okunur, koda gömülmez. */
    var canonical = document.querySelector('link[rel="canonical"]');
    var temelAdres = (canonical && canonical.href) || window.location.href;
    var urunAdresi = temelAdres.split('?')[0].split('#')[0] +
      '?id=' + encodeURIComponent(u.id);
    if (canonical) { canonical.setAttribute('href', urunAdresi); }
    var ogAdres = document.querySelector('meta[property="og:url"]');
    if (ogAdres) { ogAdres.setAttribute('content', urunAdresi); }

    var ogGorsel = document.querySelector('meta[property="og:image"]');
    if (ogGorsel) {
      ogGorsel.setAttribute('content', new URL(gorseller[0].src, temelAdres).href);
    }

    kap.innerHTML = '' +
      '<nav class="iz-yolu" aria-label="Neredesiniz">' +
        '<a href="./">Ana Sayfa</a><span aria-hidden="true">/</span>' +
        '<a href="koleksiyon.html?k=' + encodeURIComponent(u.kategori) + '">' + E(katAd) + '</a>' +
        '<span aria-hidden="true">/</span>' + E(u.ad) +
      '</nav>' +

      '<div class="urun-detay">' +

        '<div class="galeri">' +
          '<div class="galeri__ana">' +
            '<picture>' +
              (window.AB.srcsetWebp(gorseller[0].src)
                ? '<source data-ana-webp type="image/webp" srcset="' + window.AB.srcsetWebp(gorseller[0].src) + '" sizes="(min-width: 900px) 620px, 92vw">'
                : '') +
              '<img data-ana-gorsel src="' + E(gorseller[0].src) + '"' + window.AB.srcset(gorseller[0].src) +
                ' sizes="(min-width: 900px) 620px, 92vw" alt="' + E(gorseller[0].alt) + '" width="1067" height="1422" fetchpriority="high" decoding="async">' +
            '</picture>' +
          '</div>' +
          (gorseller.length > 1
            ? '<div class="galeri__kucukler" role="group" aria-label="Ürün görselleri">' +
                gorseller.map(function (g, i) {
                  var kucukWebp = window.AB.kucukGorselWebp(g.src);
                  return '<button type="button" data-gorsel="' + i + '" aria-current="' + (i === 0 ? 'true' : 'false') + '">' +
                    '<picture>' +
                      (kucukWebp ? '<source type="image/webp" srcset="' + E(kucukWebp) + '">' : '') +
                      '<img src="' + E(window.AB.kucukGorsel(g.src)) + '" alt="' + E(g.alt) + '" loading="lazy" decoding="async" width="400" height="400">' +
                    '</picture>' +
                    '</button>';
                }).join('') +
              '</div>'
            : '') +
        '</div>' +

        '<div class="urun-yan">' +
          '<p class="urun-kart__kategori">' + E(katAd) + '</p>' +
          '<h1>' + E(u.ad) + '</h1>' +
          '<p class="urun-fiyat">' + window.AB.fiyat(u.fiyat) + '</p>' +
          '<p class="urun-aciklama">' + E(u.aciklama) + '</p>' +

          '<div class="secim">' +
            '<div class="secim__bas">' +
              '<span id="beden-bas">Beden</span>' +
              '<a class="baglanti" href="rehber.html#beden">Beden tablosu</a>' +
            '</div>' +
            '<div class="bedenler" role="group" aria-labelledby="beden-bas" data-bedenler>' +
              bedenler.map(function (b) {
                var sec = (bedenler.length === 1) ? 'true' : 'false';
                return '<button type="button" data-beden="' + E(b) + '" aria-pressed="' + sec + '">' + E(b) + '</button>';
              }).join('') +
            '</div>' +
            '<p class="uyari" data-uyari role="alert"></p>' +
          '</div>' +

          '<div class="secim">' +
            '<div class="secim__bas"><span id="adet-bas">Adet</span></div>' +
            '<div class="adet-kutu" role="group" aria-labelledby="adet-bas">' +
              '<button type="button" data-adet="-1" aria-label="Adedi azalt">&minus;</button>' +
              '<span class="deger" data-adet-deger aria-live="polite">1</span>' +
              '<button type="button" data-adet="1" aria-label="Adedi artır">+</button>' +
            '</div>' +
          '</div>' +

          '<div class="urun-dugmeler">' +
            '<button class="btn btn--tam" type="button" data-ekle>Sepete Ekle</button>' +
            (UD_ACIK
              ? '<button class="btn btn--hat btn--tam" type="button" data-uzerinde-dene>' +
                  'Üzerinde Dene' +
                '</button>' +
                '<p class="urun-notlar__ud">Fotoğrafınızı yükleyin, bu parçayı üzerinizde ' +
                  'görün. Görselleştirmedir, beden garantisi değildir.</p>'
              : '') +
          '</div>' +

          '<div class="urun-notlar">' +
            '<ul>' +
              (u.kumas ? '<li>Kumaş: ' + E(u.kumas) + '</li>' : '') +
              '<li>Kalıp ve dikim kendi atölyemizde yapılır.</li>' +
              '<li>Kargo, sipariş onayından sonraki ilk iş günü çıkar.</li>' +
              '<li>Denenmemiş ve etiketi sökülmemiş ürünlerde 14 gün iade hakkı vardır.</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +

      '</div>';

    baglantilariKur(gorseller, bedenler);
  }

  function baglantilariKur(gorseller, bedenler) {
    var ana = kap.querySelector('[data-ana-gorsel]');
    var anaWebp = kap.querySelector('[data-ana-webp]');
    var kucukler = kap.querySelectorAll('[data-gorsel]');
    for (var i = 0; i < kucukler.length; i++) {
      kucukler[i].addEventListener('click', function () {
        var n = parseInt(this.getAttribute('data-gorsel'), 10) || 0;
        var yeni = gorseller[n];
        ana.removeAttribute('srcset');
        if (window.AB.srcset(yeni.src)) {
          var t = yeni.src.slice(0, -4);
          ana.srcset = t + '-480.jpg 480w, ' + t + '-960.jpg 960w, ' + yeni.src + ' 1400w';
        }
        ana.src = yeni.src;
        ana.alt = yeni.alt;
        /* .galeri__ana <picture><source webp> da tıklanan görsele göre
           güncellenir — aksi halde küçük resme tıklanınca tarayıcı hâlâ
           İLK ürün görselinin webp'sini gösterir (03.09.2026, ağırlık turu). */
        if (anaWebp) {
          var webpSet = window.AB.srcsetWebp(yeni.src);
          if (webpSet) { anaWebp.srcset = webpSet; } else { anaWebp.removeAttribute('srcset'); }
        }
        for (var j = 0; j < kucukler.length; j++) {
          kucukler[j].setAttribute('aria-current', kucukler[j] === this ? 'true' : 'false');
        }
      });
    }

    var bedenKap = kap.querySelector('[data-bedenler]');
    var uyari = kap.querySelector('[data-uyari]');
    if (bedenKap) {
      bedenKap.addEventListener('click', function (e) {
        var d = e.target.closest('button[data-beden]');
        if (!d) { return; }
        secilenBeden = d.getAttribute('data-beden');
        var hepsi = bedenKap.querySelectorAll('button[data-beden]');
        for (var k = 0; k < hepsi.length; k++) {
          hepsi[k].setAttribute('aria-pressed', hepsi[k] === d ? 'true' : 'false');
        }
        if (uyari) { uyari.textContent = ''; }
      });
    }

    var adetDeger = kap.querySelector('[data-adet-deger]');
    var adetDugmeler = kap.querySelectorAll('[data-adet]');
    for (var m = 0; m < adetDugmeler.length; m++) {
      adetDugmeler[m].addEventListener('click', function () {
        var fark = parseInt(this.getAttribute('data-adet'), 10) || 0;
        adet = Math.max(1, Math.min(20, adet + fark));
        adetDeger.textContent = adet;
      });
    }

    var ekle = kap.querySelector('[data-ekle]');
    if (ekle) {
      ekle.addEventListener('click', function () {
        if (!secilenBeden) {
          if (uyari) { uyari.textContent = 'Devam etmek için bir beden seçin.'; }
          if (bedenKap) {
            var ilk = bedenKap.querySelector('button[data-beden]');
            if (ilk) { ilk.focus(); }
          }
          return;
        }
        window.AB.sepetEkle(URUN.id, secilenBeden, adet);
        window.AB.bildir(URUN.ad + ' (' + secilenBeden + ') sepete eklendi.');
      });
    }

    var udDugme = kap.querySelector('[data-uzerinde-dene]');
    if (udDugme && UD_ACIK) {
      udDugme.addEventListener('click', function () {
        var eskiMetin = udDugme.textContent;
        udDugme.disabled = true;
        udDugme.textContent = 'Yükleniyor…';
        widgetYukle().then(function () {
          udDugme.disabled = false;
          udDugme.textContent = eskiMetin;
          var g = (URUN.gorseller && URUN.gorseller[0]) || null;
          window.UzerindeDene.ac({
            servis: UD.servis,
            urunId: URUN.id,
            urunAd: URUN.ad,
            bedenler: bedenler,
            beden: secilenBeden || '',
            /* Servis ürün görselini kendi indirir; mutlak adres şart. */
            urunGorsel: g ? new URL(g.src, window.location.href).href : '',
            bedenTablosu: URUN.bedenTablosu || '',
            bollukNotu: URUN.bollukNotu || '',
            kaynak: udDugme
          });
        }).catch(function () {
          udDugme.disabled = false;
          udDugme.textContent = eskiMetin;
          window.AB.bildir('Deneme servisine şu an ulaşılamıyor, biraz sonra tekrar deneyin.');
        });
      });
    }
  }

  function benzerleriCiz(veri, u) {
    var kutu = document.querySelector('[data-benzer-kap]');
    var izgara = document.querySelector('[data-benzer]');
    if (!kutu || !izgara) { return; }
    var liste = (veri.urunler || []).filter(function (x) {
      return x.kategori === u.kategori && x.id !== u.id;
    }).slice(0, 4);
    if (!liste.length) { return; }
    izgara.innerHTML = liste.map(function (x) { return window.AB.kartHtml(x, veri); }).join('');
    kutu.hidden = false;
  }

  window.AB.katalog().then(function (veri) {
    var u = id ? window.AB.urunBul(veri, id) : null;
    if (!u) {
      kap.innerHTML =
        '<div class="bos-durum">' +
          '<h1>Bu ürünü bulamadık</h1>' +
          '<p>Aradığınız parça kaldırılmış ya da bağlantı hatalı olabilir. Koleksiyonun tamamına göz atabilirsiniz.</p>' +
          '<a class="btn" href="koleksiyon.html">Koleksiyona git</a>' +
        '</div>';
      document.title = 'Ürün bulunamadı — Atölye Butik';
      return;
    }
    URUN = u;
    ciz(u, veri);
    benzerleriCiz(veri, u);
    window.AB.izleriKur(document);
  }).catch(function (h) {
    window.AB.hataGoster(kap, 'Ürün bilgisi yüklenemedi: ' + h.message);
  });
})();
