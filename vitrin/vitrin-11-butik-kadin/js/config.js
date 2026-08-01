/* ==========================================================================
   Atölye Butik — site ayarları
   Bu dosya, siteyi bir müşteriye teslim ederken düzenlenecek TEK dosyadır.
   Aşağıdaki "DÜZENLE" işaretli satırları gerçek bilgilerle değiştirin.
   ========================================================================== */

window.SITE_AYAR = {

  /* DÜZENLE: İşletme adı. Sayfa başlıklarında ve WhatsApp mesajında kullanılır. */
  isletmeAdi: 'Atölye Butik',

  /* DÜZENLE: WhatsApp sipariş numarası.
     Biçim: ülke kodu + numara, başında "+" veya boşluk OLMADAN.
     Türkiye örneği: 905321234567
     Aşağıdaki 905000000000 bir YER TUTUCUDUR, gerçek numara değildir. */
  whatsapp: '905000000000',

  /* DÜZENLE: Vitrinde gösterilen iletişim bilgileri (hepsi yer tutucudur). */
  telefonGorunen: '0500 000 00 00',
  eposta: 'siparis@ornek-butik.example',
  adres: 'Örnek Mahallesi, Numune Caddesi No: 00, İlçe / Şehir',
  calismaSaati: 'Pazartesi – Cumartesi, 10.00 – 19.00',

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
