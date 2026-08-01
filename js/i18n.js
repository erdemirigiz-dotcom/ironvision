"use strict";
/* ============================================================================
   I18N.JS — TR/EN dil anahtarı (bağımsız modül)
   Sürü motoruna (surumotoru.js) ve orkestrasyona (site.js) DOKUNMADAN çalışır.
   Metin taşıyan öğeler data-i18n / data-i18n-html / data-i18n-ph ile işaretli.
   Varsayılan dil TR; seçim localStorage("shows_lang") ile hatırlanır.
   Ton: atölye ustası — iddiasız ama özgüvenli, abartısız, düz Türkçe;
   atölye/usta metaforu ölçülü. EN: pazarlama İngilizcesi (yurt dışı turizm
   işletmecileri), yumuşak zanaat dili (craft / shape / workshop).
   ========================================================================== */
(function () {
  var DEPO = "shows_lang";

  var SOZLUK = {
    tr: {
      _title: "IRON VISION — Hayalinizi anlatın, atölyemizde şekillensin",
      _lang: "tr",

      sr_h1: "IRON VISION — size özel web siteleri, bakım ustalığı ve dijital ürünler",

      // HERO
      slogan: "Hayalinizi anlatın.<br>Atölyemizde şekillensin.",
      video_daveti: "<b>Videolarınız mı var?</b> İsterseniz tasarımınızda kullanırız.",
      scroll_ipucu: "Aşağı kaydırın",

      // NE YAPIYORUZ
      hizmet_kicker: "Ne yapıyoruz",
      hizmet_baslik: "Üç işte ustayız.",
      hizmet1_h: "Size özel web sitesi",
      hizmet1_p: "Hayalinizdeki site, atölyemizde size özel işlenir. Şablon değil; markanıza, hikâyenize ve müşterinize göre tek tek şekillendirilir.",
      hizmet2_h: "Aylık bakım ustalığı",
      hizmet2_p: "Siteniz hep bakımlı, hep güncel. Kilit değil, abonelik: güncelleme, iyileştirme ve gözetim bizden.",
      hizmet3_h: "Kişiye özel dijital ürünler",
      hizmet3_p: "Aile arşivinden kutlama şarkısına: size ait, sizden başkasında olmayan dijital işler.",
      iki_yol: "Size hep <span>iki yol</span> sunarız, artısını eksisini dürüstçe anlatırız; karar sizin, tavsiyemiz kayda geçer.",

      // KURULUM YOLLARI (satış felsefesi)
      kurulum_ust: "Sitenizi iki şekilde ayağa kaldırırız:",
      yol1_no: "Yol 1",
      yol1_h: "Tam hazır paket",
      yol1_p: "Alan adı, sunucu ve bakım tek bir yıllık abonelikte toplanır; hiçbir teknik yükü siz taşımazsınız. Alan adı her zaman sizin adınıza alınır: tapu sizde, anahtar sizde — biz yalnızca bakım ustanızız.",
      yol2_no: "Yol 2",
      yol2_h: "Kendi alan adınızla",
      yol2_p: "Kendi alan adınız zaten varsa siz getirin; biz sitenizi kurar, canlıya alır ve bakımını sürdürürüz. Sahiplik baştan sona sizde kalır.",

      // TOOLS
      tools_sr: "Kendi ürünlerimiz.",
      tools_kicker: "Araçlar",
      tools_alt: "Bir fikir olarak başlayan işler, sabırla çalışan ürünlere dönüşür. İşte rafımızdakiler.",
      urun1_rozet: "Canlı ürün",
      urun1_h: "Aile Arşivi",
      urun1_p: "3B anı duvarı, film şeridi ve akıllı albüm tarifi. Ailenin fotoğrafları, özenle dizilmiş yaşayan bir arşive dönüşür.",
      urun1_link: "Ailelere özel erişim",
      urun2_rozet: "Yakında",
      urun2_h: "Kutlama Şarkısı Atölyesi",
      urun2_p: "Düğün, nişan, doğum günü… Türk törenlerine özel, isme ve ana yazılmış kutlama şarkıları. Atölye hazırlanıyor.",
      urun3_rozet: "Sırada ne var?",
      urun3_h: "Boş yuva",
      urun3_p: "Bir sonraki ürün burada şekillenecek. Fikriniz varsa yeri hazır.",

      // ATÖLYE + ARAÇLAR
      atolye_kicker: "Atölye bölümümüz",
      atolye_baslik: "Gezin, deneyin.",
      atolye_alt: "Kartlardaki görüntü canlı önizlemedir; tıklayın, sayfanın kendisi açılsın. Araçlarımız ücretsiz, üyeliksiz, tarayıcınızda çalışır.",
      butik_ad: "Atölye Butik<small>Esnaf paketi — küçük işletmeye özel butik site vitrini</small>",
      atolye_ad: "ATÖLYE VYRON<small>Örnek atölye sitemiz</small>",
      arac1_ad: "Kripto Kâr/Zarar<small>Komisyon dahil net hesap</small>",
      arac2_ad: "Vergi &amp; Net Maaş<small>Brütten nete, 2026 oranları</small>",
      arac3_ad: "LLM Token Maliyeti<small>Model başına istek maliyeti</small>",

      // VIDEO DUVARI
      duvar_kicker: "İşte kanıt",
      duvar_baslik: "Atölyeden çıkan işler.",
      duvar_alt: "Konsept değil; çalışan, canlı işler. Kartın üzerine gelin sahne oynasın, tıklayın işin kendisine gidin.",
      duvar_tum: "Tüm vitrin sitelerini görün →",

      // FORM
      form_kicker: "Sıra sizde",
      form_baslik: "Bir fikir anlatın, gerisini konuşalım.",
      form_giris: "Adınızı, e-postanızı ve aklınızdaki işi yazın. Size iki yol sunalım, kararı birlikte verelim.",
      form_ad: "Adınız",
      form_ad_ph: "Adınız",
      form_eposta: "E-posta",
      form_eposta_ph: "ornek@eposta.com",
      form_mesaj: "Mesajınız",
      form_mesaj_ph: "Aklınızdaki işi birkaç cümleyle anlatın.",
      form_gonder: "Gönder",
      form_guven: "Mesajınız yalnızca e-postamıza düşer; hiçbir yerde saklanmaz, üçüncü kişilerle paylaşılmaz. 24 saat içinde size döneriz.",

      // FOOTER
      footer: "<b>IRON VISION</b> · Yapay zekâ atölyesi · Size özel siteler, bakım, dijital ürünler"
    },

    en: {
      _title: "IRON VISION — Tell us your dream, we shape the rest",
      _lang: "en",

      sr_h1: "IRON VISION — bespoke websites, master-grade maintenance and custom digital products",

      // HERO
      slogan: "Tell us your dream.<br>We shape it in our workshop.",
      video_daveti: "<b>Got footage?</b> We'll weave it into your design.",
      scroll_ipucu: "Scroll down",

      // NE YAPIYORUZ
      hizmet_kicker: "What we do",
      hizmet_baslik: "Masters of three crafts.",
      hizmet1_h: "Bespoke websites",
      hizmet1_p: "The site you imagine, shaped for you in our workshop. No templates — crafted one by one around your brand, your story and your guests.",
      hizmet2_h: "Monthly maintenance",
      hizmet2_p: "Your site always cared for, always current. Not a lock-in — a subscription: updates, refinements and watchful care, all on us.",
      hizmet3_h: "Custom digital products",
      hizmet3_p: "From a family archive to a celebration song: digital work that is yours alone, found nowhere else.",
      iki_yol: "We always lay out <span>two paths</span>, weigh the upside and the downside honestly; the call is yours, our counsel is on the record.",

      // KURULUM YOLLARI (sales philosophy)
      kurulum_ust: "There are two ways we bring your site to life:",
      yol1_no: "Path 1",
      yol1_h: "The full turnkey package",
      yol1_p: "Domain, hosting and maintenance bundled into a single yearly subscription — none of the technical weight ever lands on you. The domain is always registered in your name: the deed is yours, the key is yours — we are simply your maintenance crew.",
      yol2_no: "Path 2",
      yol2_h: "Bring your own domain",
      yol2_p: "Already own a domain? Bring it along; we build your site, take it live and keep it maintained. Ownership stays fully yours, start to finish.",

      // TOOLS
      tools_sr: "Our own products.",
      tools_kicker: "Tools",
      tools_alt: "Work that starts as a single idea grows, patiently, into products that actually run. Here's what's on our shelf.",
      urun1_rozet: "Live product",
      urun1_h: "Family Archive",
      urun1_p: "A 3D memory wall, a film reel and a smart album recipe. Your family photos become a living, lovingly arranged archive.",
      urun1_link: "Private family access",
      urun2_rozet: "Coming soon",
      urun2_h: "Celebration Song Studio",
      urun2_p: "Weddings, engagements, birthdays… celebration songs written for the name and the moment, tuned to Turkish traditions. The studio is in the works.",
      urun3_rozet: "What's next?",
      urun3_h: "Open slot",
      urun3_p: "The next product will take shape right here. If you have an idea, the spot is ready.",

      // ATÖLYE + ARAÇLAR
      atolye_kicker: "Our workshop floor",
      atolye_baslik: "Wander in, try things.",
      atolye_alt: "Every card is a live preview — click one and the page itself opens. Our tools are free, need no sign-up and run right in your browser.",
      butik_ad: "Atölye Butik<small>Small-business package — a boutique site showcase</small>",
      atolye_ad: "ATÖLYE VYRON<small>Our showcase workshop site</small>",
      arac1_ad: "Crypto Profit/Loss<small>Net result, fees included</small>",
      arac2_ad: "Tax &amp; Net Salary<small>Gross to net, 2026 rates</small>",
      arac3_ad: "LLM Token Cost<small>Per-request cost by model</small>",

      // VIDEO DUVARI
      duvar_kicker: "The proof",
      duvar_baslik: "Work straight from the workshop.",
      duvar_alt: "Not concepts — real, live work. Hover a card to let the scene play, click it to open the site itself.",
      duvar_tum: "See every showcase site →",

      // FORM
      form_kicker: "Your move",
      form_baslik: "Tell us an idea, we'll take it from there.",
      form_giris: "Drop your name, your email and the work on your mind. We'll lay out two paths and decide together.",
      form_ad: "Your name",
      form_ad_ph: "Your name",
      form_eposta: "Email",
      form_eposta_ph: "you@email.com",
      form_mesaj: "Your message",
      form_mesaj_ph: "Tell us about the work you have in mind, in a few lines.",
      form_gonder: "Send",
      form_guven: "Your message reaches our inbox only — it is stored nowhere and never shared with third parties. We reply within 24 hours.",

      // FOOTER
      footer: "<b>IRON VISION</b> · An AI workshop · Bespoke sites, maintenance, digital products"
    }
  };

  function gecerliDil(d) {
    return (d === "en") ? "en" : "tr";
  }

  function uygula(dil) {
    dil = gecerliDil(dil);
    var sozluk = SOZLUK[dil];

    // 1) textContent taşıyanlar
    var duz = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < duz.length; i++) {
      var k = duz[i].getAttribute("data-i18n");
      if (sozluk[k] != null) duz[i].textContent = sozluk[k];
    }
    // 2) HTML taşıyanlar (<br>, <b>, <span> içerenler)
    var html = document.querySelectorAll("[data-i18n-html]");
    for (var j = 0; j < html.length; j++) {
      var kh = html[j].getAttribute("data-i18n-html");
      if (sozluk[kh] != null) html[j].innerHTML = sozluk[kh];
    }
    // 3) placeholder taşıyanlar
    var ph = document.querySelectorAll("[data-i18n-ph]");
    for (var p = 0; p < ph.length; p++) {
      var kp = ph[p].getAttribute("data-i18n-ph");
      if (sozluk[kp] != null) ph[p].setAttribute("placeholder", sozluk[kp]);
    }

    // 4) belge dili + başlık
    document.documentElement.setAttribute("lang", sozluk._lang || dil);
    if (sozluk._title) document.title = sozluk._title;

    // 5) düğme durumları
    var btnler = document.querySelectorAll(".dil-btn");
    for (var b = 0; b < btnler.length; b++) {
      var aktif = btnler[b].getAttribute("data-lang") === dil;
      btnler[b].setAttribute("aria-pressed", aktif ? "true" : "false");
      btnler[b].classList.toggle("aktif", aktif);
    }

    // 6) hatırla
    try { localStorage.setItem(DEPO, dil); } catch (e) {}
  }

  function baslat() {
    var kayitli;
    try { kayitli = localStorage.getItem(DEPO); } catch (e) { kayitli = null; }
    uygula(gecerliDil(kayitli));

    var btnler = document.querySelectorAll(".dil-btn");
    for (var b = 0; b < btnler.length; b++) {
      btnler[b].addEventListener("click", function () {
        uygula(this.getAttribute("data-lang"));
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", baslat);
  } else {
    baslat();
  }
})();
