/* site.js — KERVANKIRAN arayüzü
 * Bölümler: tema · hero videosu · gece çizelgesi (imza) · gök olayları ·
 *           Bortle şeridi · rezervasyon formu · harita · giriş animasyonu ·
 *           scroll hareketleri (03.09 gösteri turu)
 * Kural: JS düşerse sayfa okunur kalır — hiçbir içerik JS'e bağlı değildir,
 * yalnız çizelge/şerit gibi hesaplanan bölümler boş kalır ve yerlerine not düşer.
 */
(function () {
  'use strict';

  var $ = function (s, k) { return (k || document).querySelector(s); };
  var azHareket = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var noanim = /[?&]noanim\b/.test(location.search);

  /* ─── TEMA ────────────────────────────────────────────────────────────
   * Varsayılan gece. Ziyaretçinin seçimi localStorage'da; okunamazsa
   * (gizli sekme, kapatılmış depolama) sessizce gece temasında kalınır. */
  var temaDugme = $('#tema-dugme');
  var temaEtiket = $('.tema-etiket', temaDugme);

  function temaUygula(t) {
    document.documentElement.setAttribute('data-tema', t);
    var gunduz = t === 'gunduz';
    temaDugme.setAttribute('aria-pressed', gunduz ? 'true' : 'false');
    temaEtiket.textContent = gunduz ? 'Gece' : 'Gündüz';
    temaDugme.setAttribute('aria-label',
      gunduz ? 'Gece temasına geç' : 'Gündüz temasına geç');
    var tc = document.querySelector('meta[name="theme-color"]');
    if (tc) tc.setAttribute('content', gunduz ? '#EDE7DA' : '#1A2331');
  }
  try { temaUygula(localStorage.getItem('kk-tema') === 'gunduz' ? 'gunduz' : 'gece'); }
  catch (e) { temaUygula('gece'); }

  temaDugme.addEventListener('click', function () {
    var yeni = document.documentElement.getAttribute('data-tema') === 'gunduz' ? 'gece' : 'gunduz';
    temaUygula(yeni);
    try { localStorage.setItem('kk-tema', yeni); } catch (e) { /* depolama kapalı */ }
  });

  /* ─── HERO VİDEOSU ────────────────────────────────────────────────────
   * <video> HTML'de KAYNAKSIZ duruyor — hiç istek gitmiyor. Koşullar uygunsa
   * (hareket kısıtlı değil, geniş ekran, veri tasarrufu kapalı) burada bir
   * <source> eklenip yükleniyor. Herhangi bir sebeple başarısız olursa poster
   * zaten görünür durumda kalıyor, konsola hata düşmüyor (error olayı yakalanıp
   * yutuluyor — bu bilinçli, kullanıcıya gösterilecek bir hata değil). */
  (function heroVideo() {
    var video = $('#hero-video');
    if (!video) return;
    var darEkran = window.matchMedia('(max-width: 640px)').matches;
    var veriTasarrufu = !!(navigator.connection && navigator.connection.saveData);
    if (azHareket || darEkran || veriTasarrufu || noanim) return; // poster tek başına kalır

    video.addEventListener('playing', function () { video.classList.add('oynuyor'); });
    video.addEventListener('error', function () { /* poster zaten görünür, sessizce vazgeç */ }, true);

    // Video indirmesi (2+ MB) kritik yola SOKULMUYOR — sayfa tamamen yüklenip
    // "load" olayı ateşlenene kadar bekliyor. Poster zaten anında görünür
    // olduğu için kullanıcı hiçbir şey kaybetmiyor, sadece ilk ağ yükünü
    // (CSS/JS/görsel) videoyla yarıştırmıyoruz.
    function baslat() {
      var kaynak = document.createElement('source');
      kaynak.src = 'video/hero-gece.webm';
      kaynak.type = 'video/webm';
      video.appendChild(kaynak);
      video.load();
      var soz = video.play();
      if (soz && soz.catch) soz.catch(function () { /* otoynatma engellendi, poster kalır */ });
    }
    if (document.readyState === 'complete') baslat();
    else window.addEventListener('load', baslat);
  })();

  /* ─── GECE ÇİZELGESİ (imza) ──────────────────────────────────────────── */
  var AYLAR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  var GUNLER = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

  /* Güneşin ufuk altı derinliği → gökyüzü rengi.
     Renkler gerçek alacakaranlık evrelerine göre seçildi; şeridin zemini
     süs değil, verinin kendisidir. */
  var GOK_RENKLERI = [
    [2, [122, 66, 40]], [0, [110, 59, 38]], [-3, [74, 51, 80]], [-6, [44, 58, 85]],
    [-9, [27, 42, 67]], [-12, [18, 29, 51]], [-15, [13, 21, 38]], [-18, [10, 15, 26]],
    [-30, [8, 12, 21]]
  ];

  function gokRengi(yuk) {
    for (var i = 0; i < GOK_RENKLERI.length - 1; i++) {
      var a = GOK_RENKLERI[i], b = GOK_RENKLERI[i + 1];
      if (yuk <= a[0] && yuk >= b[0]) {
        var t = (a[0] - yuk) / (a[0] - b[0]);
        return 'rgb(' + Math.round(a[1][0] + (b[1][0] - a[1][0]) * t) + ','
          + Math.round(a[1][1] + (b[1][1] - a[1][1]) * t) + ','
          + Math.round(a[1][2] + (b[1][2] - a[1][2]) * t) + ')';
      }
    }
    return yuk > 2 ? 'rgb(122,66,40)' : 'rgb(8,12,21)';
  }

  var serit = $('#serit'), eksen = $('#serit-eksen'), tarihSerit = $('#tarih-serit');
  var G = window.Gokyuzu;

  function oran(g, j) { return (j - g.jBas) / (g.jSon - g.jBas); }
  function yuzde(x) { return (Math.max(0, Math.min(1, x)) * 100).toFixed(2) + '%'; }

  function seritCiz(g) {
    serit.textContent = '';

    // 1) Zemin: gecenin gerçek karanlık eğrisi, 64 durakta örneklenmiş gradyan
    var duraklar = [], N = 64;
    for (var i = 0; i <= N; i++) {
      var j = g.jBas + (g.jSon - g.jBas) * (i / N);
      var s = window.__gunesYuk(j);
      duraklar.push(gokRengi(s) + ' ' + (i / N * 100).toFixed(1) + '%');
    }
    var zemin = document.createElement('div');
    zemin.className = 'serit-katman';
    zemin.style.background = 'linear-gradient(90deg,' + duraklar.join(',') + ')';
    serit.appendChild(zemin);

    // 2) Samanyolu çekirdeği penceresi (gece aralığına kırpılmış)
    g.samanyoluUstte.forEach(function (p) {
      var b = Math.max(p[0], g.jBas), s = Math.min(p[1], g.jSon);
      if (s <= b) return;
      var el = document.createElement('div');
      el.className = 'serit-sy';
      el.style.left = yuzde(oran(g, b));
      el.style.width = yuzde(oran(g, s) - oran(g, b));
      serit.appendChild(el);
    });

    // 3) Ay ufkun üstündeyken: taralı bölge
    g.ayUstte.forEach(function (p) {
      var b = Math.max(p[0], g.jBas), s = Math.min(p[1], g.jSon);
      if (s <= b) return;
      var el = document.createElement('div');
      el.className = 'serit-ay';
      el.style.left = yuzde(oran(g, b));
      el.style.width = yuzde(oran(g, s) - oran(g, b));
      serit.appendChild(el);
    });

    // 4) İşaretler
    var isaretler = [
      [g.gunesBatisi, 'batış', 0],
      [g.karanlikBaslangic, 'karanlık başlar', 1],
      [g.karanlikBitis, 'karanlık biter', 1],
      [g.gunesDogusu, 'doğuş', 0]
    ];
    isaretler.forEach(function (x) {
      if (x[0] === null) return;
      var o = oran(g, x[0]);
      if (o < 0.005 || o > 0.995) return;
      var c = document.createElement('div');
      c.className = 'serit-isaret';
      c.setAttribute('data-vurgu', String(x[2]));
      c.style.left = yuzde(o);
      serit.appendChild(c);
      var y = document.createElement('span');
      y.className = 'serit-yazi' + (x[2] ? ' serit-yazi--ust' : '');
      y.textContent = G.saatMetni(x[0]) + ' ' + x[1];
      y.style.left = yuzde(Math.min(0.9, Math.max(0.08, o)));
      serit.appendChild(y);
    });

    // Eksen: gece boyunca saat başları
    eksen.textContent = '';
    [0, 0.25, 0.5, 0.75, 1].forEach(function (t) {
      var s = document.createElement('span');
      s.textContent = G.saatMetni(g.jBas + (g.jSon - g.jBas) * t);
      eksen.appendChild(s);
    });
  }

  function sureMetni(saat) {
    if (saat <= 0.02) return 'yok';
    var s = Math.floor(saat), d = Math.round((saat - s) * 60);
    if (d === 60) { s += 1; d = 0; }
    return s + ' sa ' + (d < 10 ? '0' : '') + d + ' dk';
  }

  function karneYaz(g) {
    $('#k-karanlik').textContent = sureMetni(g.karanlikSaat);
    $('#k-karanlik-not').textContent = g.karanlikSaat <= 0.02
      ? 'Bu gece ay, astronomik karanlığın tamamında ufkun üstünde.'
      : 'Ay yokken ve güneş −18°\'nin altındayken geçen süre.';

    var e = g.evre;
    $('#k-ay').textContent = '%' + Math.round(e.oran * 100);
    var simge = $('#k-ay-simge');
    simge.style.setProperty('--oran', (1 - e.oran).toFixed(2));
    simge.style.setProperty('--yon', e.buyuyor ? '-1' : '1');
    var ayAralik = g.ayUstte.map(function (p) {
      var b = Math.max(p[0], g.jBas), s = Math.min(p[1], g.jSon);
      return s > b ? G.saatMetni(b) + '–' + G.saatMetni(s) : null;
    }).filter(Boolean);
    $('#k-ay-not').textContent = e.ad + (ayAralik.length
      ? ' · ufkun üstünde ' + ayAralik.join(', ') : ' · gece boyunca ufkun altında');

    var syPencere = g.samanyoluUstte.map(function (p) {
      var b = Math.max(p[0], g.karanlikBaslangic || g.jBas);
      var s = Math.min(p[1], g.karanlikBitis || g.jSon);
      return s > b ? G.saatMetni(b) + '–' + G.saatMetni(s) : null;
    }).filter(Boolean);
    $('#k-sy').textContent = g.samanyoluSaat > 0.02 ? sureMetni(g.samanyoluSaat) : 'ufkun altında';
    $('#k-sy-not').textContent = g.samanyoluSaat > 0.02
      ? 'Karanlıkta ve aysız: ' + syPencere.join(', ') + ' · en yüksek '
        + Math.round(g.samanyoluZirve.yukseklik) + '°'
      : 'Çekirdek bu gece karanlık saatlerde ufkun altında — sezonu mart sonu–ekim başı.';

    $('#k-gunes').textContent = G.saatMetni(g.gunesBatisi) + ' → ' + G.saatMetni(g.gunesDogusu);
  }

  var seciliDugme = null;
  function geceSec(dugme, g) {
    if (seciliDugme) seciliDugme.setAttribute('aria-pressed', 'false');
    dugme.setAttribute('aria-pressed', 'true');
    seciliDugme = dugme;
    seritCiz(g);
    karneYaz(g);
  }

  function cizelgeKur() {
    // gokyuzu.js iç fonksiyonunu dışa vermiyor; şerit zemini için güneş
    // yüksekliğini burada aynı formülle bir kez daha kurmak yerine modülden
    // gelen gece verisiyle örnekliyoruz (aşağıda __gunesYuk tanımlanıyor).
    var bugun = new Date();
    var frag = document.createDocumentFragment();
    var ilk = null, ilkG = null;

    for (var i = 0; i < 14; i++) {
      var t = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate() + i);
      var g = G.gece(t);
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'tarih-chip';
      d.setAttribute('aria-pressed', 'false');
      d.innerHTML = '<span class="chip-ay">' + GUNLER[t.getDay()] + '</span>'
        + '<span class="chip-gun">' + t.getDate() + '</span>'
        + '<span class="chip-ay">' + AYLAR[t.getMonth()] + '</span>'
        + '<span class="chip-saat">' + (g.karanlikSaat > 0.02
          ? g.karanlikSaat.toFixed(1).replace('.', ',') + ' sa' : '—') + '</span>';
      d.setAttribute('aria-label', t.getDate() + ' ' + AYLAR[t.getMonth()]
        + ' gecesi, gerçek karanlık ' + sureMetni(g.karanlikSaat));
      (function (dd, gg) {
        dd.addEventListener('click', function () { geceSec(dd, gg); });
      })(d, g);
      frag.appendChild(d);
      if (i === 0) { ilk = d; ilkG = g; }
    }
    tarihSerit.appendChild(frag);
    geceSec(ilk, ilkG);
  }

  /* Şerit zemini için güneş yüksekliği — gokyuzu.js ile aynı düşük hassasiyetli
     formül. Modül bunu dışa vermiyor; burada 8 satırla tekrar kurmak, modülün
     iç API'sini genişletmekten daha az kırılgan. */
  window.__gunesYuk = (function () {
    var DER = Math.PI / 180, K = G.KONUM;
    return function (j) {
      var n = j - 2451545.0;
      var L = (280.460 + 0.9856474 * n) % 360;
      var g = ((357.528 + 0.9856003 * n) % 360) * DER;
      var lam = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * DER;
      var eps = 23.439 * DER;
      var sa = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
      var dek = Math.asin(Math.sin(eps) * Math.sin(lam));
      var lst = ((280.46061837 + 360.98564736629 * n) % 360 + K.boylam) * DER;
      var e = K.enlem * DER;
      return Math.asin(Math.sin(e) * Math.sin(dek)
        + Math.cos(e) * Math.cos(dek) * Math.cos(lst - sa)) / DER;
    };
  })();

  if (G && serit) {
    try { cizelgeKur(); }
    catch (e) {
      serit.innerHTML = '';
      $('#k-karanlik').textContent = '—';
      $('#k-karanlik-not').textContent =
        'Çizelge bu tarayıcıda hesaplanamadı. Geleceğiniz geceyi yazın, biz hesaplayıp yazalım.';
    }
  }

  /* ─── GÖK OLAYLARI (sabit liste, gün-ay bazlı) ───────────────────────── */
  var OLAYLAR = [
    [1, 3, 'Kadrantid meteor yağmuru', 'Kısa ve keskin zirve; saatte 60–100 meteor, ama zirve birkaç saat sürer.'],
    [3, 20, 'Samanyolu çekirdeği sezonu açılır', 'Şafaktan önce güneydoğu ufkunda belirir; haziranda gece boyu görünür.'],
    [4, 22, 'Lyrid meteor yağmuru', 'Saatte 15–20 meteor; parlak ateş toplarıyla tanınır.'],
    [5, 6, 'Eta Akuarid meteor yağmuru', 'Halley kuyrukluyıldızının tozu. Şafaktan önce, alçak ufukta.'],
    [7, 29, 'Delta Akuarid meteor yağmuru', 'Zayıf ama uzun; ağustos başına kadar sürer, Perseidlerle üst üste biner.'],
    [8, 12, 'Perseid meteor yağmuru', 'Yılın en yoğunu. Karanlık gökte saatte 80–100. Kampın dolduğu gece.'],
    [10, 8, 'Drakonid meteor yağmuru', 'Akşam erken saatlerde, sabaha karşı değil — nadir yağmurlardan.'],
    [10, 21, 'Orionid meteor yağmuru', 'Yine Halley tozu; hızlı ve iz bırakan meteorlar.'],
    [11, 5, 'Taurid ateş topları', 'Sayı az ama gördüğünüz meteor çok parlak olur.'],
    [11, 17, 'Leonid meteor yağmuru', 'Saatte 15 civarı; 33 yılda bir fırtınaya dönüşür.'],
    [12, 13, 'Geminid meteor yağmuru', 'Perseidlerin kış rakibi, çoğu yıl daha yoğun. Soğuk ama berrak.'],
    [12, 22, 'Ursid meteor yağmuru', 'Yılın son yağmuru, Demirkazık çevresinden yayılır.']
  ];

  (function olaylariYaz() {
    var liste = $('#olay-liste');
    if (!liste) return;
    var bugun = new Date();
    var yil = bugun.getFullYear();
    var sirali = OLAYLAR.map(function (o) {
      var t = new Date(yil, o[0] - 1, o[1]);
      if (t < new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate())) {
        t = new Date(yil + 1, o[0] - 1, o[1]);
      }
      return { t: t, o: o };
    }).sort(function (a, b) { return a.t - b.t; }).slice(0, 6);

    sirali.forEach(function (x) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="olay-tarih">' + x.t.getDate() + ' '
        + AYLAR[x.t.getMonth()] + ' ' + x.t.getFullYear() + '</span>'
        + '<span class="olay-ad"></span><span class="olay-not"></span>';
      li.querySelector('.olay-ad').textContent = x.o[2];
      li.querySelector('.olay-not').textContent = x.o[3];
      liste.appendChild(li);
    });
  })();

  /* ─── BORTLE ŞERİDİ ──────────────────────────────────────────────────── */
  (function bortleCiz() {
    var kok = $('#bortle-serit');
    if (!kok) return;
    var zeminler = ['#05070C', '#0A1018', '#131C26', '#1F2A33', '#2E3A42',
      '#414C54', '#585F66', '#71777D', '#8B9196'];
    var parlama = ['transparent', 'transparent', 'rgba(194,96,58,.10)', 'rgba(194,96,58,.16)',
      'rgba(194,96,58,.22)', 'rgba(214,140,80,.28)', 'rgba(224,164,107,.32)',
      'rgba(232,190,140,.36)', 'rgba(240,210,170,.40)'];
    for (var i = 1; i <= 9; i++) {
      var li = document.createElement('li');
      li.className = 'bortle-basamak';
      li.textContent = i;
      var yildizSayisi = Math.max(0, 11 - i);
      var yildizlar = [];
      for (var k = 0; k < yildizSayisi; k++) {
        var x = (k * 37 + i * 13) % 92 + 4, y = (k * 53 + i * 29) % 66 + 8;
        var r = k % 3 === 0 ? 1.3 : 0.9;
        yildizlar.push('radial-gradient(circle ' + r + 'px at ' + x + '% ' + y + '%, '
          + 'rgba(232,226,214,' + (0.95 - i * 0.07).toFixed(2) + ') 99%, transparent 100%)');
      }
      li.style.background = yildizlar.concat([
        'linear-gradient(to top,' + parlama[i - 1] + ', transparent 55%)',
        zeminler[i - 1]
      ]).join(',');
      if (i === 2) {
        li.setAttribute('data-isaretli', '1');
        var et = document.createElement('span');
        et.className = 'bortle-etiket';
        et.textContent = 'burası';
        li.appendChild(et);
      }
      kok.appendChild(li);
    }
  })();

  /* ─── REZERVASYON FORMU ──────────────────────────────────────────────
   * Örnek site: form bir yere gönderilmez; js/vitrin-form.js bunu ziyaretçiye söyler. */
  var UC_NOKTA = '';
  var EPOSTA = 'founder@ironvisiontools.com';
  var form = $('#rez-form'), durum = $('#form-durum'), gonder = $('#rez-gonder');

  var tarihAlani = $('#f-tarih');
  if (tarihAlani) {
    var b = new Date();
    var iki = function (n) { return (n < 10 ? '0' : '') + n; };
    tarihAlani.min = b.getFullYear() + '-' + iki(b.getMonth() + 1) + '-' + iki(b.getDate());
  }

  function durumYaz(metin, tur) {
    durum.textContent = metin;
    if (tur) durum.setAttribute('data-tur', tur); else durum.removeAttribute('data-tur');
  }

  function epostaYedegi(konu, govde) {
    durum.textContent = '';
    var p = document.createElement('span');
    p.textContent = 'İstek gönderilemedi. ';
    var a = document.createElement('a');
    a.href = 'mailto:' + EPOSTA + '?subject=' + encodeURIComponent(konu)
      + '&body=' + encodeURIComponent(govde);
    a.textContent = 'Aynı bilgileri e-postayla gönderin';
    p.appendChild(a);
    p.appendChild(document.createTextNode(' — bilgileriniz hazır, tek yapmanız gereken göndermek.'));
    durum.appendChild(p);
    durum.setAttribute('data-tur', 'hata');
  }

  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ad = $('#f-ad').value.trim();
      var eposta = $('#f-eposta').value.trim();

      $('#f-ad').setAttribute('aria-invalid', ad ? 'false' : 'true');
      $('#f-eposta').setAttribute('aria-invalid', /.+@.+\..+/.test(eposta) ? 'false' : 'true');
      if (!ad) { durumYaz('Ad soyad alanı boş.', 'hata'); $('#f-ad').focus(); return; }
      if (!/.+@.+\..+/.test(eposta)) {
        durumYaz('E-posta adresi geçerli görünmüyor.', 'hata'); $('#f-eposta').focus(); return;
      }

      var veri = {
        site: 'astro-kamp (KERVANKIRAN)',
        ad: ad,
        iletisim: eposta,
        telefon: $('#f-tel').value.trim(),
        tarih: $('#f-tarih').value,
        kisi: $('#f-kisi').value,
        bungalov: $('#f-bungalov').value,
        mesaj: $('#f-mesaj').value.trim(),
        website: $('#f-website').value
      };
      var ozet = 'Ad: ' + ad + '\nE-posta: ' + eposta
        + '\nTelefon: ' + (veri.telefon || '-')
        + '\nGeliş gecesi: ' + (veri.tarih || '-')
        + '\nKişi: ' + veri.kisi + '\nBungalov: ' + veri.bungalov
        + '\n\n' + (veri.mesaj || '');

      gonder.disabled = true;
      durumYaz('Gönderiliyor…');

      fetch(UC_NOKTA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(veri)
      }).then(function (y) {
        if (!y.ok) throw new Error('HTTP ' + y.status);
        durumYaz('Rezervasyon isteğiniz kamp yönetimine ulaştı. Aynı gün dönüyoruz.', 'ok');
        form.reset();
      }).catch(function () {
        epostaYedegi('KERVANKIRAN rezervasyon isteği', ozet);
      }).then(function () { gonder.disabled = false; });
    });
  }

  /* ─── HARİTA: tıklayınca yüklenir (istek, kullanıcı istemeden gitmez) ─── */
  var haritaDugme = $('#harita-ac');
  if (haritaDugme) {
    haritaDugme.addEventListener('click', function () {
      var cerceve = document.createElement('iframe');
      cerceve.src = 'https://www.google.com/maps?q=37.716,33.551&z=11&output=embed';
      cerceve.title = 'Karapınar, Konya — kampın konumu';
      cerceve.loading = 'lazy';
      cerceve.referrerPolicy = 'no-referrer-when-downgrade';
      haritaDugme.replaceWith(cerceve);
    });
  }

  /* ─── GİRİŞ ANİMASYONU ───────────────────────────────────────────────
   * .gsap-on yalnız GSAP gerçekten yüklendiyse eklenir; aksi hâlde CSS
   * gizleme kuralları hiç devreye girmez ve sayfa tam görünür kalır. */
  if (window.gsap && !azHareket && !noanim) {
    document.body.classList.add('gsap-on');
    var gs = window.gsap;

    // bilesenler/bolunmus-baslik: başlık kelime kelime bölünür, her kelime
    // kendi maskesinin altından yukarı çıkar. Bölme JS ile yapılır — JS yoksa
    // başlık olduğu gibi, tek parça ve tam görünür kalır.
    document.querySelectorAll('[data-bolunmus]').forEach(function (b) {
      var parcalar = [];
      Array.prototype.slice.call(b.childNodes).forEach(function (d) {
        if (d.nodeType === 3) {
          d.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w.trim()) { parcalar.push(document.createTextNode(w)); return; }
            var dis = document.createElement('span');
            dis.className = 'kelime';
            var ic = document.createElement('span');
            ic.textContent = w;
            dis.appendChild(ic);
            parcalar.push(dis);
          });
        } else { parcalar.push(d.cloneNode(true)); }
      });
      b.textContent = '';
      parcalar.forEach(function (p) { b.appendChild(p); });
    });

    // from() kullanılıyor: başlangıç durumunu GSAP'in kendisi koyar. Tween hiç
    // koşmazsa kelimeler doğal yerinde kalır — CSS ile gizleyip JS'e bel bağlamak
    // 03.09'da başlığın tamamen boş kalmasına yol açmıştı.
    gs.set('.giris-satir', { opacity: 0, y: 22 });
    gs.timeline({ defaults: { ease: 'power3.out' } })
      .from('.kelime > span', { yPercent: 105, duration: .95, stagger: .07, delay: .1 })
      .to('.giris-satir', { opacity: 1, y: 0, duration: .8, stagger: .13 }, '-=0.55');

    // 03.09 GÖSTERİ TURU — dört hareket, hepsi ScrollTrigger ile. Tümü
    // transform/opacity (bilinçli istisna: acilan görselinde clip-path) ve
    // tümü gsap.from()/fromTo() — GSAP hiç koşmazsa (?noanim, hata,
    // reduced-motion) CSS'te bunlara karşılık gelen hiçbir gizleme kuralı
    // yok, sayfa olduğu gibi tam görünür kalır (rapor.md 4/1 dersi).
    if (window.ScrollTrigger) {
      gs.registerPlugin(window.ScrollTrigger);

      // 1) HERO PARALAKSI — görsel/video katmanı yavaş, başlık içeriği daha
      // hızlı kayar; hero alta doğru hafifçe solarak sonraki bölüme geçer.
      var heroEl = $('.hero');
      if (heroEl) {
        gs.to('.hero-gorsel', {
          yPercent: 16, ease: 'none',
          scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true }
        });
        gs.to('.hero-icerik', {
          yPercent: -10, opacity: .25, ease: 'none',
          scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true }
        });
      }

      // 2) GECE ÇİZELGESİ ŞERİDİ — imza öğe scroll'a girince soldan sağa
      // "gece ilerliyor" gibi açılıyor (scaleX); tarih çipleri arkasından
      // sıralı beliriyor. Veri/hesap değişmiyor, yalnız açılış hareketleniyor.
      var seritSarmalEl = $('.serit-sarmal');
      if (seritSarmalEl) {
        gs.from(seritSarmalEl, {
          scaleX: 0, transformOrigin: 'left center', duration: 1.3, ease: 'power2.out',
          scrollTrigger: { trigger: '#cizelge', start: 'top 70%' }
        });
      }
      if (document.querySelector('.tarih-chip')) {
        gs.from('.tarih-chip', {
          opacity: 0, y: 14, duration: .55, stagger: .045, ease: 'power2.out',
          scrollTrigger: { trigger: '#tarih-serit', start: 'top 85%' }
        });
      }

      // 3) BUNGALOV KARTLARI — kaydırmada stagger ile yükselip beliriyor.
      if (document.querySelector('.kart')) {
        gs.from('.kart', {
          opacity: 0, y: 36, duration: .75, stagger: .14, ease: 'power2.out',
          scrollTrigger: { trigger: '.kartlar', start: 'top 82%' }
        });
      }

      // 4) YILDIZ İZİ (acilma-gorseli) — clip-path açılışı artık scroll
      // pozisyonuna DOĞRUDAN bağlı (scrub); üstüne "dönme izi" hissini
      // güçlendiren hafif bir ölçek/kayma eklendi. clip-path burada bilinçli
      // bir istisna (bilesenler/acilma-gorseli KULLANIM.md, aynı gerekçe).
      document.querySelectorAll('.acilan img').forEach(function (img) {
        gs.fromTo(img,
          { clipPath: 'inset(0 0 100% 0)', scale: 1.08, y: -16 },
          {
            clipPath: 'inset(0 0 0% 0)', scale: 1, y: 0, ease: 'none',
            scrollTrigger: { trigger: img, start: 'top 88%', end: 'top 35%', scrub: .6 }
          });
      });
    } else {
      // ScrollTrigger yüklenmediyse acilma-gorseli en azından görünür kalsın —
      // clip-path hiçbir yerde CSS'ten gelmiyor, ekstra bir şey yapmaya gerek yok,
      // <img> zaten doğal hâliyle tam görünür.
    }
  }
})();
