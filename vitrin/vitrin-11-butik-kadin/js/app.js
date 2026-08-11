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

  /* ------------------------------------------------------ ürün kartı HTML */
  function kartHtml(u, veri) {
    var g = (u.gorseller && u.gorseller[0]) || { src: 'img/detay-rafta.jpg', alt: u.ad };
    return '' +
      '<a class="urun-kart" href="urun.html?id=' + encodeURIComponent(u.id) + '">' +
        '<div class="urun-kart__gorsel">' +
          '<img src="' + kacis(g.src) + '"' + srcset(g.src) +
            ' sizes="(min-width: 1240px) 285px, (min-width: 900px) 24vw, (min-width: 620px) 32vw, 46vw"' +
            ' alt="' + kacis(g.alt) + '" loading="lazy" decoding="async" width="1067" height="1422">' +
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

  /* --------------------------------------------------------- WhatsApp */
  function whatsappBaglantisi(hesap) {
    var no = String(AYAR.whatsapp || '').replace(/[^0-9]/g, '');
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
    return 'https://wa.me/' + no + '?text=' + encodeURIComponent(satirlar.join('\n'));
  }

  /* Altbilgideki genel iletişim bağlantısı — sepetten bağımsız, tek satır
     karşılama mesajıyla. Numara AYNI kaynaktan (config.js whatsapp) gelir,
     sepetteki/ödemedeki WhatsApp düğmesiyle tutarlı kalır. */
  function whatsappGenelBaglanti() {
    var no = String(AYAR.whatsapp || '').replace(/[^0-9]/g, '');
    var mesaj = 'Merhaba, ' + (AYAR.isletmeAdi || 'butik') + ' hakkında bilgi almak istiyorum.';
    return 'https://wa.me/' + no + '?text=' + encodeURIComponent(mesaj);
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

    var yil = document.querySelectorAll('[data-yil]');
    for (var i = 0; i < yil.length; i++) {
      yil[i].textContent = new Date().getFullYear();
    }

    /* Altbilgi WhatsApp bağlantısı — sayfa yüklenince tek sefer yazılır. */
    var waGenel = document.querySelectorAll('[data-wa-genel]');
    if (waGenel.length) {
      var waHref = whatsappGenelBaglanti();
      for (var w = 0; w < waGenel.length; w++) { waGenel[w].setAttribute('href', waHref); }
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
    srcset: srcset, kucukGorsel: kucukGorsel,
    siparisleriOku: siparisleriOku, siparisleriYaz: siparisleriYaz,
    siparisNo: siparisNo, siparisKaydet: siparisKaydet,
    whatsappBaglantisi: whatsappBaglantisi,
    whatsappGenelBaglanti: whatsappGenelBaglanti,
    hataGoster: hataGoster
  };
})();
