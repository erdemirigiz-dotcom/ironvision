/* ==========================================================================
   Atölye Butik — site ayarları
   Bu dosya, siteyi bir müşteriye teslim ederken düzenlenecek TEK dosyadır.
   Aşağıdaki "DÜZENLE" işaretli satırları gerçek bilgilerle değiştirin.
   ========================================================================== */

window.SITE_AYAR = {

  /* DÜZENLE: İşletme adı. Sayfa başlıklarında kullanılır. */
  isletmeAdi: 'Atölye Butik',

  /* 03.09.2026 düzeltmesi: sahte telefon/WhatsApp numarası (905000000000) ve
     .example e-posta alanı KALDIRILDI (denetim bulgusu — sahte iletişim bilgisi
     yayında duruyordu). Bu demo için gerçek, çalışan tek iletişim kanalı
     e-postadır. Gerçek bir müşteriye teslimde bu alanlar kendi bilgileriyle
     değiştirilir; uydurma bir telefon/WhatsApp numarası KOYULMAZ. */
  eposta: 'founder@ironvisiontools.com',
  adres: 'Serdar-ı Ekrem Sokak No: 14, Galata, Beyoğlu / İstanbul',
  calismaSaati: 'Pazartesi – Cumartesi, 10.00 – 19.00',

  /* Harita (yalnızca tıklanınca yüklenir — bkz. js/app.js haritaKur). Kurgu
     marka için Galata bölgesinde makul bir koordinat; gerçek işletme değil. */
  harita: { enlem: 41.0256, boylam: 28.9744 },

  /* DÜZENLE: Kargo kuralları. */
  kargoUcreti: 89,          // TL
  ucretsizKargoEsigi: 1500, // Bu tutarın üzerindeki siparişlerde kargo ücretsiz

  /* Sipariş numarası ön eki */
  siparisOnEki: 'AB',

  /* Yönetim paneli (admin.html) bu yayın kopyasına DAHİL EDİLMEDİ;
     panel ve şifresi yalnızca yerel geliştirme kopyasında durur. */

  /* "Üzerinde Dene" (sanal deneme) widget'i.
     Bu vitrin kopyasında KAPALI: aktif:false iken ürün sayfasında düğme hiç
     çizilmez, widget dosyası indirilmez — site eksiksiz çalışır.
     Servis adresi yayın kopyasına YAZILMAZ (iç ağ adresi sızdırılmaz);
     müşteri kurulumunda kendi HTTPS adresi buraya girilir. */
  uzerindeDene: {
    aktif: false,
    servis: ''
  }
};
