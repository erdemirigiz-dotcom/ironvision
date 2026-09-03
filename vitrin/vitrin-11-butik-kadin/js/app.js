/* ==========================================================================
   Atölye Butik — ortak katman
   Depolama, ürün kaynağı, sepet, biçimlendirme, başlık ve açılış hareketleri.
   Harici kütüphane kullanılmaz.
   ========================================================================== */
(function () {
  'use strict';

  var AYAR = window.SITE_AYAR || {};

  var ANAHTAR = {
    sepet: 'ab_sepet',
    siparisler: 'ab_siparisler',
    urunler: 'ab_urunler',
    sonSiparis: 'ab_son_siparis'
  };

  /* ------------------------------------------------------------ depolama */
  function oku(anahtar, varsayilan) {
    try {
      var ham = window.localStorage.getItem(anahtar);
      return ham ? JSON.parse(ham) : varsayilan;
    } catch (e) {
      return varsayilan;
    }
  }

  function yaz(anahtar, deger) {
    try {
      window.localStorage.setItem(anahtar, JSON.stringify(deger));
      return true;
    } catch (e) {
      return false;
    }
  }

  function temizle(anahtar) {
    try { window.localStorage.removeItem(anahtar); } catch (e) { /* yok say */ }
  }

  /* ------------------------------------------------------ biçimlendirme */
  function fiyat(sayi) {
    var n = Number(sayi) || 0;
    return n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' ₺';
  }

  function tarih(isoMetin) {
    var d = isoMetin ? new Date(isoMetin) : new Date();
    if (isNaN(d.getTime())) { return '—'; }
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }

  function kacis(metin) {
    return String(metin === undefined || metin === null ? '' : metin)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------------------------------------------------------- ürün kaynağı
     Öncelik: yönetim panelinde düzenlenmiş liste (localStorage)
     Yoksa:   data/products.json
     ------------------------------------------------------------------- */
  var _bellek = null;

  function katalogYolu() {
    // Alt klasörden çağrılmaz; tüm sayfalar site kökündedir.
    return 'data/products.json';
  }

  function katalog() {
    if (_bellek) { return Promise.resolve(_bellek); }

    var yerel = oku(ANAHTAR.urunler, null);
    if (yerel && yerel.urunler && yerel.urunler.length) {
      _bellek = yerel;
      return Promise.resolve(_bellek);
    }

    return fetch(katalogYolu(), { cache: 'no-cache' })
      .then(function (y) {
        if (!y.ok) { throw new Error('Katalog okunamadı (' + y.status + ')'); }
        return y.json();
      })
      .then(function (veri) {
        _bellek = veri;
        return veri;
      });
  }

  function katalogYaz(veri) {
    _bellek = veri;
    yaz(ANAHTAR.urunler, veri);
  }

  function katalogSifirla() {
    _bellek = null;
    temizle(ANAHTAR.urunler);
  }

  function urunBul(veri, id) {
    var liste = (veri && veri.urunler) || [];
    for (var i = 0; i < liste.length; i++) {
      if (liste[i].id === id) { return liste[i]; }
    }
    return null;
  }

  function kategoriAdi(veri, kod) {
    var liste = (veri && veri.kategoriler) || [];
    for (var i = 0; i < liste.length; i++) {
      if (liste[i].kod === kod) { return liste[i].ad; }
    }
    return kod || '';
  }

  /* ---------------------------------------------------------------- sepet */
  function sepetOku() {
    var s = oku(ANAHTAR.sepet, []);
    return Array.isArray(s) ? s : [];
  }

  function sepetYaz(liste) {
    yaz(ANAHTAR.sepet, liste);
    rozetGuncelle();
  }

  function sepetEkle(id, beden, adet) {
    var liste = sepetOku();
    var n = Math.max(1, parseInt(adet, 10) || 1);
    for (var i = 0; i < liste.length; i++) {
      if (liste[i].id === id && liste[i].beden === beden) {
        liste[i].adet = Math.min(20, liste[i].adet + n);
        sepetYaz(liste);
        return liste;
      }
    }
    liste.push({ id: id, beden: beden, adet: Math.min(20, n) });
    sepetYaz(liste);
    return liste;
  }

  function sepetAdet(id, beden, yeniAdet) {
    var liste = sepetOku();
    for (var i = 0; i < liste.length; i++) {
      if (liste[i].id === id && liste[i].beden === beden) {
        var n = Math.max(1, Math.min(20, parseInt(yeniAdet, 10) || 1));
        liste[i].adet = n;
        break;
      }
    }
    sepetYaz(liste);
    return liste;
  }

  function sepetSil(id, beden) {
    var liste = sepetOku().filter(function (k) {
      return !(k.id === id && k.beden === beden);
    });
    sepetYaz(liste);
    return liste;
  }

  function sepetBosalt() {
    sepetYaz([]);
  }

  function sepetToplamAdet() {
    return sepetOku().reduce(function (t, k) { return t + (parseInt(k.adet, 10) || 0); }, 0);
  }

  /* Sepeti ürün bilgileriyle zenginleştirir ve tutarları hesaplar. */
  function sepetHesapla(veri) {
    var kalemler = [];
    var araToplam = 0;

    sepetOku().forEach(function (k) {
      var u = urunBul(veri, k.id);
      if (!u) { return; } // katalogdan kaldırılmış ürün — sessizce atlanır
      var adet = Math.max(1, parseInt(k.adet, 10) || 1);
      var tutar = (Number(u.fiyat) || 0) * adet;
      araToplam += tutar;
      kalemler.push({
        id: u.id,
        ad: u.ad,
        kategori: u.kategori,
        beden: k.beden,
        adet: adet,
        birimFiyat: Number(u.fiyat) || 0,
        tutar: tutar,
        gorsel: (u.gorseller && u.gorseller[0] && u.gorseller[0].src) || 'img/detay-rafta.jpg',
        gorselAlt: (u.gorseller && u.gorseller[0] && u.gorseller[0].alt) || u.ad
      });
    });

    var esik = Number(AYAR.ucretsizKargoEsigi) || 0;
    var kargo = 0;
    if (araToplam > 0 && araToplam < esik) { kargo = Number(AYAR.kargoUcreti) || 0; }

    return {
      kalemler: kalemler,
      araToplam: araToplam,
      kargo: kargo,
      toplam: araToplam + kargo,
      ucretsizKargo: araToplam > 0 && kargo === 0
    };
  }

  /* --------------------------------------------------------------- rozet */
  function rozetGuncelle() {
    var adet = sepetToplamAdet();
    var kutular = document.querySelectorAll('[data-sepet-sayi]');
    for (var i = 0; i < kutular.length; i++) {
      kutular[i].textContent = adet;
      kutular[i].setAttribute('data-bos', adet === 0 ? '1' : '0');
      var etiket = kutular[i].closest('a');
      if (etiket) {
        etiket.setAttribute('aria-label', 'Sepet, ' + adet + ' ürün');
      }
    }
  }

  /* ---------------------------------------------------------- bildirim */
  var _bildirimZaman = null;
  function bildir(metin) {
    var kutu = document.getElementById('bildirim');
    if (!kutu) {
      kutu = document.createElement('div');
      kutu.id = 'bildirim';
      kutu.className = 'bildirim';
      kutu.setAttribute('role', 'status');
      kutu.setAttribute('aria-live', 'polite');
      document.body.appendChild(kutu);
    }
    kutu.textContent = metin;
    kutu.setAttribute('data-gor', '1');
    window.clearTimeout(_bildirimZaman);
    _bildirimZaman = window.setTimeout(function () {
      kutu.setAttribute('data-gor', '0');
    }, 3200);
  }

  /* ------------------------------------------------------------- başlık */
  function basligiKur() {
    var dugme = document.querySelector('.menu-ac');
    var menu = document.getElementById('ana-menu');
    if (!dugme || !menu) { return; }

    dugme.addEventListener('click', function () {
      var acik = dugme.getAttribute('aria-expanded') === 'true';
      dugme.setAttribute('aria-expanded', acik ? 'false' : 'true');
      menu.setAttribute('data-acik', acik ? '0' : '1');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dugme.getAttribute('aria-expanded') === 'true') {
        dugme.setAttribute('aria-expanded', 'false');
        menu.setAttribute('data-acik', '0');
        dugme.focus();
      }
    });
  }

  /* Geçerli sayfayı menüde işaretler. */
  function menuIsaretle() {
    /* Ana sayfa iki biçimde gelebilir ("/" ya da "/index.html" — nav
       bağlantıları artık kök biçim "./"yi kullanıyor), ikisi de "./"ye
       eşitlenir ki "Ana Sayfa" öğesi işaretlensin. */
    var dosya = window.location.pathname.split('/').pop() || 'index.html';
    if (dosya === 'index.html') { dosya = './'; }
    var baglar = document.querySelectorAll('#ana-menu a');
    for (var i = 0; i < baglar.length; i++) {
      var hedef = baglar[i].getAttribute('href');
      if (hedef === dosya) { baglar[i].setAttribute('aria-current', 'page'); }
    }
  }

  /* ------------------------------------------------------ açılış izleri */
  function izleriKur(kok) {
    var hedefler = (kok || document).querySelectorAll('.iz:not(.iz--gor)');
    if (!hedefler.length) { return; }

    var kisit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (kisit || !('IntersectionObserver' in window)) {
      for (var j = 0; j < hedefler.length; j++) { hedefler[j].classList.add('iz--gor'); }
      return;
    }

    var gozlemci = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        if (g.isIntersecting) {
          g.target.classList.add('iz--gor');
          gozlemci.unobserve(g.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    for (var i = 0; i < hedefler.length; i++) { gozlemci.observe(hedefler[i]); }
  }

  /* ------------------------------------------------- duyarlı görsel yolu --
     img/ altındaki her yerel görselin -480 ve -960 genişlik türevi vardır.
     Panelden elle girilen dış adreslerde türev üretilmez; srcset atlanır.
     ------------------------------------------------------------------- */
  function yerelGorsel(src) {
    return /^img\/[^/]+\.jpg$/.test(String(src || ''));
  }

  function srcset(src) {
    if (!yerelGorsel(src)) { return ''; }
    var t = src.slice(0, -4);
    return ' srcset="' + kacis(t) + '-480.jpg 480w, ' + kacis(t) + '-960.jpg 960w, ' + kacis(src) + ' 1400w"';
  }

  function kucukGorsel(src) {
    return yerelGorsel(src) ? src.slice(0, -4) + '-480.jpg' : src;
  }

  /* 03.09.2026: aynı görselin yanına konmuş .webp türevlerini <picture><source>
     olarak sunar — JPG hiçbir yerden silinmez/değişmez, yalnızca EK olarak
     destekleyen tarayıcıya daha küçük dosya iner (ağırlık düzeltmesi, S-8). */
  function srcsetWebp(src) {
    if (!yerelGorsel(src)) { return ''; }
    var t = src.slice(0, -4);
    return kacis(t) + '-480.webp 480w, ' + kacis(t) + '-960.webp 960w, ' + kacis(t) + '.webp 1400w';
  }

  /* kucukGorsel'in webp karşılığı — ürün detay galerisindeki küçük resim
     düğmeleri için (03.09.2026, ürün detay ağırlık düzeltmesi). */
  function kucukGorselWebp(src) {
    return yerelGorsel(src) ? src.slice(0, -4) + '-480.webp' : '';
  }

  /* ------------------------------------------------------ ürün kartı HTML */
  function kartHtml(u, veri) {
    var g = (u.gorseller && u.gorseller[0]) || { src: 'img/detay-rafta.jpg', alt: u.ad };
    var boyutlar = '(min-width: 1240px) 285px, (min-width: 900px) 24vw, (min-width: 620px) 32vw, 46vw';
    var webpSet = srcsetWebp(g.src);
    return '' +
      '<a class="urun-kart" href="urun.html?id=' + encodeURIComponent(u.id) + '">' +
        '<div class="urun-kart__gorsel">' +
          '<picture>' +
            (webpSet ? '<source type="image/webp" srcset="' + webpSet + '" sizes="' + boyutlar + '">' : '') +
            '<img src="' + kacis(g.src) + '"' + srcset(g.src) +
              ' sizes="' + boyutlar + '"' +
              ' alt="' + kacis(g.alt) + '" loading="lazy" decoding="async" width="1067" height="1422">' +
          '</picture>' +
          '<span class="cerceve" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
        '</div>' +
        '<div class="urun-kart__bilgi">' +
          '<p class="urun-kart__kategori">' + kacis(kategoriAdi(veri, u.kategori)) + '</p>' +
          '<h3 class="urun-kart__ad">' + kacis(u.ad) + '</h3>' +
          '<p class="urun-kart__fiyat">' + fiyat(u.fiyat) + '</p>' +
        '</div>' +
      '</a>';
  }

  /* ------------------------------------------------------------ siparişler */
  function siparisleriOku() {
    var s = oku(ANAHTAR.siparisler, []);
    return Array.isArray(s) ? s : [];
  }

  function siparisleriYaz(liste) { yaz(ANAHTAR.siparisler, liste); }

  function siparisNo() {
    var on = AYAR.siparisOnEki || 'AB';
    var d = new Date();
    var gun = String(d.getFullYear()).slice(2) +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0');
    var rastgele = String(Math.floor(Math.random() * 9000) + 1000);
    return on + '-' + gun + '-' + rastgele;
  }

  function siparisKaydet(siparis) {
    var liste = siparisleriOku();
    liste.unshift(siparis);
    siparisleriYaz(liste);
    yaz(ANAHTAR.sonSiparis, siparis);
    return siparis;
  }

  /* --------------------------------------------------------- e-posta ile sipariş
     03.09.2026: WhatsApp yolu kaldırıldı — config.js'teki numara yer tutucuydu
     (905000000000) ve denetimde "sahte iletişim" olarak işaretlendi. Gerçek,
     çalışan tek kanal e-posta olduğu için sepet/ödemedeki "diğer yol" artık
     mailto: bağlantısı üretir; kullanıcının e-posta istemcisi sipariş
     dökümüyle önceden doldurulmuş halde açılır. */
  function mailtoSiparisBaglantisi(hesap) {
    var eposta = AYAR.eposta || 'founder@ironvisiontools.com';
    var konu = (AYAR.isletmeAdi || 'butik') + ' — sipariş talebi';
    var satirlar = [];
    satirlar.push('Merhaba, ' + (AYAR.isletmeAdi || 'butik') + ' sitesinden sipariş vermek istiyorum.');
    satirlar.push('');
    hesap.kalemler.forEach(function (k, i) {
      satirlar.push((i + 1) + ') ' + k.ad + ' — Beden: ' + k.beden + ' — ' + k.adet + ' adet — ' + fiyat(k.tutar));
    });
    satirlar.push('');
    satirlar.push('Ara toplam: ' + fiyat(hesap.araToplam));
    satirlar.push('Kargo: ' + (hesap.kargo === 0 ? 'Ücretsiz' : fiyat(hesap.kargo)));
    satirlar.push('Toplam: ' + fiyat(hesap.toplam));
    satirlar.push('');
    satirlar.push('Ad Soyad:');
    satirlar.push('Telefon:');
    satirlar.push('Teslimat adresi:');
    return 'mailto:' + encodeURIComponent(eposta) + '?subject=' + encodeURIComponent(konu) +
      '&body=' + encodeURIComponent(satirlar.join('\n'));
  }

  /* ---------------------------------------------------------------- harita
     Tıklanmadan hiçbir istek Google'a gitmez (KVKK + ağırlık). config.js'teki
     `harita` alanı yoksa buton sessizce hiçbir şey yapmaz. */
  function haritaKur() {
    var dugme = document.getElementById('harita-ac');
    if (!dugme) { return; }
    var h = AYAR.harita;
    if (!h || typeof h.enlem !== 'number' || typeof h.boylam !== 'number') { return; }
    dugme.addEventListener('click', function () {
      var cerceve = document.createElement('iframe');
      cerceve.src = 'https://www.google.com/maps?q=' + h.enlem + ',' + h.boylam + '&z=15&output=embed';
      cerceve.title = 'Atölye Butik — konum';
      cerceve.loading = 'lazy';
      cerceve.referrerPolicy = 'no-referrer-when-downgrade';
      dugme.replaceWith(cerceve);
    });
  }

  /* --------------------------------------------------------------- hata */
  function hataGoster(kap, mesaj) {
    if (!kap) { return; }
    kap.innerHTML =
      '<div class="bos-durum">' +
        '<h2>Bir şeyler ters gitti</h2>' +
        '<p>' + kacis(mesaj) + '</p>' +
        '<a class="btn btn--hat" href="./">Ana sayfaya dön</a>' +
      '</div>';
  }

  /* config.js'teki bilgileri [data-ayar] taşıyan öğelere yerleştirir. */
  function ayarlariYaz() {
    var kutular = document.querySelectorAll('[data-ayar]');
    for (var i = 0; i < kutular.length; i++) {
      var anahtar = kutular[i].getAttribute('data-ayar');
      var deger = AYAR[anahtar];
      if (deger === undefined || deger === null) { continue; }
      kutular[i].textContent = (anahtar === 'ucretsizKargoEsigi' || anahtar === 'kargoUcreti')
        ? fiyat(deger)
        : String(deger);
    }
  }

  /* --------------------------------------------------------------- açılış */
  function baslat() {
    basligiKur();
    menuIsaretle();
    ayarlariYaz();
    rozetGuncelle();
    izleriKur(document);
    haritaKur();

    var yil = document.querySelectorAll('[data-yil]');
    for (var i = 0; i < yil.length; i++) {
      yil[i].textContent = new Date().getFullYear();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', baslat);
  } else {
    baslat();
  }

  /* Sekmeler arası senkron */
  window.addEventListener('storage', function (e) {
    if (e.key === ANAHTAR.sepet) { rozetGuncelle(); }
  });

  /* ------------------------------------------------------------ dış arayüz */
  window.AB = {
    ANAHTAR: ANAHTAR,
    ayar: AYAR,
    oku: oku, yaz: yaz, temizle: temizle,
    fiyat: fiyat, tarih: tarih, kacis: kacis,
    katalog: katalog, katalogYaz: katalogYaz, katalogSifirla: katalogSifirla,
    urunBul: urunBul, kategoriAdi: kategoriAdi,
    sepetOku: sepetOku, sepetEkle: sepetEkle, sepetAdet: sepetAdet,
    sepetSil: sepetSil, sepetBosalt: sepetBosalt, sepetHesapla: sepetHesapla,
    rozetGuncelle: rozetGuncelle,
    kartHtml: kartHtml, izleriKur: izleriKur, bildir: bildir,
    srcset: srcset, kucukGorsel: kucukGorsel, kucukGorselWebp: kucukGorselWebp,
    siparisleriOku: siparisleriOku, siparisleriYaz: siparisleriYaz,
    siparisNo: siparisNo, siparisKaydet: siparisKaydet,
    mailtoSiparisBaglantisi: mailtoSiparisBaglantisi,
    srcsetWebp: srcsetWebp,
    hataGoster: hataGoster
  };
})();
