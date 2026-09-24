/* gokyuzu.js — KERVANKIRAN gece çizelgesi motoru
 *
 * NE YAPAR: verilen bir takvim günü için Karapınar koordinatlarında gecenin
 * gerçek astronomik olaylarını hesaplar — güneş batışı, üç alacakaranlık evresi,
 * ay doğuş/batışı, ay evresi ve aydınlanma oranı, Samanyolu çekirdeğinin
 * (Galaktik merkez) ufkun üstünde kaldığı pencere, ve bunlardan türetilen
 * "gerçek karanlık saat" sayısı (astronomik karanlık ∩ ay yok).
 *
 * NEDEN ELDE YAZILDI: bu sayfanın imza öğesi. Hazır bir gökyüzü kütüphanesi
 * (~100 KB+) sayfa bütçesini yer, üstelik tek bir konum için gereksiz.
 *
 * DOĞRULUK: düşük hassasiyetli efemeris (Astronomical Almanac / Meeus özet
 * formülleri). Güneş olayları ±1 dk, ay doğuş/batışı ±5 dk, ay aydınlanması
 * ±%1 civarında. Sayfada bu belirsizlik AÇIKÇA yazılır — gözlem planı için
 * yeterli, teleskop kurulumu için değil.
 *
 * SAAT DİLİMİ: hesap UTC'de yapılır, çıktı SABİT UTC+3 (Türkiye) olarak verilir.
 * Ziyaretçinin tarayıcı saati kullanılmaz — yurt dışından bakan biri de kampın
 * yerel saatini görmeli.
 */
(function (global) {
  'use strict';

  var DER = Math.PI / 180;
  var TSI = 3;                 // Türkiye saat dilimi, sabit UTC+3 (yaz saati yok)

  // Karapınar volkanik platosu (Meke / Acıgöl maar krateri bölgesi)
  var KONUM = { enlem: 37.716, boylam: 33.551, rakim: 1004 };

  // Galaktik merkez (Sgr A*) — Samanyolu'nun en parlak, en fotoğraflanabilir kısmı
  var GALAKTIK_MERKEZ = { sa: (17 + 45 / 60 + 40 / 3600) * 15 * DER, dek: -29.008 * DER };

  function jd(tarihUTC) { return tarihUTC.getTime() / 86400000 + 2440587.5; }
  function normDer(x) { return ((x % 360) + 360) % 360; }

  /* --- Güneş: düşük hassasiyetli görünür konum ------------------------- */
  function gunes(j) {
    var n = j - 2451545.0;
    var L = normDer(280.460 + 0.9856474 * n);
    var g = normDer(357.528 + 0.9856003 * n) * DER;
    var lam = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * DER;
    var eps = (23.439 - 0.0000004 * n) * DER;
    return {
      sa: Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)),
      dek: Math.asin(Math.sin(eps) * Math.sin(lam)),
      boylam: lam
    };
  }

  /* --- Ay: Meeus'un kısaltılmış serisi (birkaç ana terim) --------------- */
  function ay(j) {
    var T = (j - 2451545.0) / 36525;
    var L = normDer(218.316 + 481267.8813 * T);            // ortalama boylam
    var M = normDer(134.963 + 477198.8676 * T) * DER;      // ay ortalama anomali
    var Ms = normDer(357.529 + 35999.0503 * T) * DER;      // güneş ortalama anomali
    var F = normDer(93.272 + 483202.0175 * T) * DER;       // enlem argümanı
    var D = normDer(297.850 + 445267.1115 * T) * DER;      // ay-güneş açıklığı

    var lam = (L
      + 6.289 * Math.sin(M)
      - 1.274 * Math.sin(M - 2 * D)
      + 0.658 * Math.sin(2 * D)
      + 0.214 * Math.sin(2 * M)
      - 0.186 * Math.sin(Ms)
      - 0.114 * Math.sin(2 * F)) * DER;
    var bet = (5.128 * Math.sin(F)
      + 0.281 * Math.sin(M + F)
      - 0.278 * Math.sin(F - M)
      - 0.173 * Math.sin(F - 2 * D)) * DER;
    var uzaklik = 385001 - 20905 * Math.cos(M) - 3699 * Math.cos(2 * D - M)
      - 2956 * Math.cos(2 * D);                            // km

    var eps = 23.439 * DER;
    var sa = Math.atan2(
      Math.sin(lam) * Math.cos(eps) - Math.tan(bet) * Math.sin(eps),
      Math.cos(lam));
    var dek = Math.asin(Math.sin(bet) * Math.cos(eps)
      + Math.cos(bet) * Math.sin(eps) * Math.sin(lam));
    return { sa: sa, dek: dek, uzaklik: uzaklik, boylam: lam };
  }

  /* --- Greenwich ortalama yıldız zamanı (derece) ------------------------ */
  function gmst(j) {
    return normDer(280.46061837 + 360.98564736629 * (j - 2451545.0));
  }

  /* --- Bir gök cisminin verilen anda ufuk üstü yüksekliği (derece) ------ */
  function yukseklik(sa, dek, j) {
    var lst = (gmst(j) + KONUM.boylam) * DER;
    var H = lst - sa;
    var e = KONUM.enlem * DER;
    return Math.asin(
      Math.sin(e) * Math.sin(dek) + Math.cos(e) * Math.cos(dek) * Math.cos(H)) / DER;
  }

  /* --- Bir eşiği kesme anını ikili aramayla bul ------------------------- */
  function gecisAra(fn, j1, j2, esik, tirmanan) {
    for (var i = 0; i < 26; i++) {                 // ~26 yineleme = saniye altı
      var jm = (j1 + j2) / 2;
      var ustunde = fn(jm) > esik;
      if (ustunde === tirmanan) j2 = jm; else j1 = jm;
    }
    return (j1 + j2) / 2;
  }

  /* Bir zaman aralığını tarayıp esiği kesen tüm anları döndürür.
     adimDk: tarama çözünürlüğü (dakika). */
  function gecisler(fn, jBas, jSon, esik, adimDk) {
    var adim = adimDk / 1440, cikti = [];
    var onceki = fn(jBas) > esik, j = jBas;
    while (j < jSon) {
      var jSonraki = Math.min(j + adim, jSon);
      var simdi = fn(jSonraki) > esik;
      if (simdi !== onceki) {
        cikti.push({ j: gecisAra(fn, j, jSonraki, esik, simdi), yukseliyor: simdi });
        onceki = simdi;
      }
      j = jSonraki;
    }
    return cikti;
  }

  /* --- UTC+3 gösterim yardımcıları ------------------------------------- */
  function saatMetni(j) {
    var d = new Date((j - 2440587.5) * 86400000 + TSI * 3600000);
    var s = d.getUTCHours(), dk = d.getUTCMinutes();
    return (s < 10 ? '0' : '') + s + ':' + (dk < 10 ? '0' : '') + dk;
  }
  // Verilen yerel (UTC+3) takvim gününün 12:00'sine karşılık gelen Julian gün
  function yerelOgleJD(yil, ayNo, gun) {
    return jd(new Date(Date.UTC(yil, ayNo, gun, 12 - TSI, 0, 0)));
  }

  /* --- Ay evresi -------------------------------------------------------- */
  var EVRE_ADLARI = ['Yeni ay', 'Hilal (büyüyen)', 'İlk dördün', 'Şişkin (büyüyen)',
    'Dolunay', 'Şişkin (küçülen)', 'Son dördün', 'Hilal (küçülen)'];

  function evre(j) {
    var g = gunes(j), a = ay(j);
    // aydınlanma oranı: güneş–ay açısal ayrımından
    var kosinus = Math.sin(g.dek) * Math.sin(a.dek)
      + Math.cos(g.dek) * Math.cos(a.dek) * Math.cos(g.sa - a.sa);
    var ayrim = Math.acos(Math.max(-1, Math.min(1, kosinus)));
    var oran = (1 - Math.cos(ayrim)) / 2;
    // büyüyor mu küçülüyor mu: ekliptik boylam farkı 0..2π
    var fark = ((a.boylam - g.boylam) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    var dilim = Math.floor((fark / (2 * Math.PI)) * 8 + 0.5) % 8;
    return { oran: oran, ad: EVRE_ADLARI[dilim], buyuyor: fark < Math.PI, aci: fark };
  }

  /* --- Bir gece için tam çizelge ---------------------------------------- */
  /* tarih: JS Date (yerel takvim günü olarak yorumlanır — o günün AKŞAMI başlayan gece) */
  function gece(tarih) {
    var jOgle = yerelOgleJD(tarih.getFullYear(), tarih.getMonth(), tarih.getDate());
    var jBas = jOgle;                 // yerel 12:00
    var jSon = jOgle + 1;             // ertesi gün yerel 12:00

    var gunesYuk = function (j) { var s = gunes(j); return yukseklik(s.sa, s.dek, j); };
    var ayYuk = function (j) { var m = ay(j); return yukseklik(m.sa, m.dek, j); };
    var gmYuk = function (j) {
      return yukseklik(GALAKTIK_MERKEZ.sa, GALAKTIK_MERKEZ.dek, j);
    };

    function tekGecis(fn, esik, yukseliyor) {
      var g = gecisler(fn, jBas, jSon, esik, 4).filter(function (x) {
        return x.yukseliyor === yukseliyor;
      });
      return g.length ? g[0].j : null;
    }

    var batis = tekGecis(gunesYuk, -0.833, false);
    var dogus = tekGecis(gunesYuk, -0.833, true);
    var alacaSon = tekGecis(gunesYuk, -18, false);   // astronomik karanlık BAŞLAR
    var alacaBas = tekGecis(gunesYuk, -18, true);    // astronomik karanlık BİTER
    var sivilSon = tekGecis(gunesYuk, -6, false);
    var denizSon = tekGecis(gunesYuk, -12, false);

    // Ay: gece boyunca ufkun üstünde kaldığı aralık(lar)
    var ayGecisleri = gecisler(ayYuk, jBas, jSon, 0.125, 4);
    var ayUstte = [];
    var acik = ayYuk(jBas) > 0.125 ? jBas : null;
    for (var i = 0; i < ayGecisleri.length; i++) {
      if (ayGecisleri[i].yukseliyor) acik = ayGecisleri[i].j;
      else if (acik !== null) { ayUstte.push([acik, ayGecisleri[i].j]); acik = null; }
    }
    if (acik !== null) ayUstte.push([acik, jSon]);

    // Samanyolu çekirdeği: 15° üstü = fotoğraflanabilir / gözle belirgin
    var gmGecisleri = gecisler(gmYuk, jBas, jSon, 15, 4);
    var gmUstte = [];
    var gmAcik = gmYuk(jBas) > 15 ? jBas : null;
    for (var k = 0; k < gmGecisleri.length; k++) {
      if (gmGecisleri[k].yukseliyor) gmAcik = gmGecisleri[k].j;
      else if (gmAcik !== null) { gmUstte.push([gmAcik, gmGecisleri[k].j]); gmAcik = null; }
    }
    if (gmAcik !== null) gmUstte.push([gmAcik, jSon]);

    // Gerçek karanlık: astronomik karanlık ∩ ay ufkun altında
    var karanlikSaat = 0;
    if (alacaSon !== null && alacaBas !== null && alacaBas > alacaSon) {
      karanlikSaat = (alacaBas - alacaSon) * 24;
      for (var m = 0; m < ayUstte.length; m++) {
        var kesBas = Math.max(alacaSon, ayUstte[m][0]);
        var kesSon = Math.min(alacaBas, ayUstte[m][1]);
        if (kesSon > kesBas) karanlikSaat -= (kesSon - kesBas) * 24;
      }
    }

    // Samanyolu çekirdeğinin gerçek karanlıkta ve aysız geçen süresi
    var samanyoluSaat = 0;
    for (var p = 0; p < gmUstte.length; p++) {
      var b = gmUstte[p][0], s = gmUstte[p][1];
      if (alacaSon !== null) b = Math.max(b, alacaSon);
      if (alacaBas !== null) s = Math.min(s, alacaBas);
      if (s <= b) continue;
      var pay = (s - b) * 24;
      for (var r = 0; r < ayUstte.length; r++) {
        var kb = Math.max(b, ayUstte[r][0]), ks = Math.min(s, ayUstte[r][1]);
        if (ks > kb) pay -= (ks - kb) * 24;
      }
      samanyoluSaat += Math.max(0, pay);
    }

    var ortaGece = (batis !== null && dogus !== null) ? (batis + dogus) / 2 : jOgle + 0.5;
    var e = evre(ortaGece);

    return {
      konum: KONUM,
      jBas: batis !== null ? batis - 20 / 1440 : jOgle + 0.25,
      jSon: dogus !== null ? dogus + 20 / 1440 : jOgle + 0.9,
      gunesBatisi: batis,
      gunesDogusu: dogus,
      sivilSonu: sivilSon,
      denizciSonu: denizSon,
      karanlikBaslangic: alacaSon,
      karanlikBitis: alacaBas,
      ayUstte: ayUstte,
      samanyoluUstte: gmUstte,
      samanyoluZirve: gmUstte.length
        ? (function () {                       // pencerenin en yüksek anı
          var en = -90, enJ = gmUstte[0][0];
          for (var t = gmUstte[0][0]; t <= gmUstte[gmUstte.length - 1][1]; t += 6 / 1440) {
            var y = gmYuk(t);
            if (y > en) { en = y; enJ = t; }
          }
          return { j: enJ, yukseklik: en };
        })()
        : null,
      evre: e,
      karanlikSaat: Math.max(0, karanlikSaat),
      samanyoluSaat: samanyoluSaat
    };
  }

  global.Gokyuzu = {
    KONUM: KONUM,
    gece: gece,
    evre: evre,
    saatMetni: saatMetni,
    jd: jd,
    yerelOgleJD: yerelOgleJD
  };
})(window);
