"use strict";
/* ============================================================================
   I18N-URUN-TASLAK.JS — 17.08.2026 urun-dili taslagi, IKINCI SURUM (CANLI
   i18n.js DEGIL). Kaynak: index-urun-taslak.html (ikinci surum).
   Demir emri (gece konusmasi sonrasi): LAV/StonkLab vitrinden TAMAMEN
   cikti (trade/finans urunleri kredi basvurusu icin kullanilmiyor); yeni
   sira AgentOS (18 arac tek tek) -> Sesli Sef Arayuzu -> Randevu Botu ->
   Try-On -> AURELIA. Omurga: URUN degil HIZ ("ihtiyac cikar, ayni gun
   ureiriz"). Yapi/anahtar isimleri index-urun-taslak.html ile TAM
   eslesecek sekilde kuruldu (90 anahtar, python ile dogrulandi).
   ========================================================================== */
(function () {
  var DEPO = "shows_lang";

  var SOZLUK = {
    tr: {
      _title: "IRON VISION — Aynı gün üreten yazılım stüdyosu",
      _lang: "tr",

      sr_h1: "IRON VISION — ihtiyaç çıktığında aynı gün üreten bir yazılım stüdyosu: AgentOS, sesli şef arayüzü ve daha fazlası",

      // HERO
      slogan: "İhtiyaç çıkar.<br>Biz aynı gün üretiriz.",
      video_daveti: "<b>Kanıt mı istiyorsunuz?</b> Sesli hattımız 2 saatte kuruldu, 654 belgelik hafıza motorumuzu kendimiz yazdık.",
      scroll_ipucu: "Aşağı kaydırın",

      // AGENTOS — 18 ARAÇ
      hizmet_kicker: "Esas büyük iş",
      hizmet_baslik: "AgentOS: 18 araç, tek çatı.",
      iki_yol: "Her araç <span>kendi başına</span> çalışan ayrı bir uygulama; hepsi birleşince ortaya çıkan şey bir işletim sistemi. Pazarlama süsü değil, gerçek mimari.",

      agentos1_h: "Mail Kutusu Botu",
      agentos1_p: "Gelen postayı otomatik okur, önemli olanı bildirir; dışarı gönderim öncesi bizim onayımızdan geçer.",
      agentos2_h: "Bildirim Ağı",
      agentos2_p: "Dokuz ayrı gözcü sistemi 7/24 izler; bir şey bozulunca ya da bir yenileme yaklaşınca anında haber verir.",
      agentos3_h: "Uzaktan Komuta",
      agentos3_p: "Telefondan mesajla sunucuya komut veririz; bilgisayar başında olmadan iş yaptırabiliyoruz.",
      agentos4_h: "Maliyet Panosu",
      agentos4_p: "Gelir ve gider tek ekranda; hangi işin ne kadara mal olduğunu anlık görürüz.",
      agentos5_h: "Abonelik Takipçisi",
      agentos5_p: "Hangi aboneliğin ne zaman yenileneceğini kendisi hatırlar, yaklaşınca önceden uyarır.",
      agentos6_h: "Fiş Okuyucu",
      agentos6_p: "Fişin fotoğrafını çekiyoruz, yapay zeka tutarı ve kalemi okuyup formu otomatik dolduruyor.",
      agentos7_h: "Patron Masası",
      agentos7_p: "Bize verilen işlerin hepsi tek listede toplanır, hiçbiri unutulmaz.",
      agentos8_h: "Görev Takip Panosu",
      agentos8_p: "Yürütülen her işin durumu (acil / yarım / bitti) tek ekranda görünür.",
      agentos9_h: "Kanal Takip Botu",
      agentos9_p: "İzlediğimiz YouTube kanallarını haftada bir tarar, yeni video varsa özetini kendisi çıkarır.",
      agentos10_h: "Video Arşiv Hafızası",
      agentos10_p: "Binin üzerinde video kaydında anlamıyla arama yaparız; kelimeyi değil konuyu ararız.",
      agentos11_h: "Panel İçi Kod Editörü",
      agentos11_p: "Tarayıcıdan, telefon dahil, doğrudan koda girip düzenleme ve komut satırı erişimi sağlıyoruz.",
      agentos12_h: "Bedava Yapay Zeka Şeridi",
      agentos12_p: "Sekiz farklı ücretsiz yapay zeka sağlayıcısını sıraya diziyoruz; biri dolunca sıradaki devreye girer, kesinti dışarı yansımaz.",
      agentos13_h: "Belge Hafızası",
      agentos13_p: "650'den fazla iç belgemizde anlamıyla arama yapan bir motor; dosya adını bilmesek de doğru belgeyi buluruz.",
      agentos14_h: "Gece Öz-Değerlendirmesi",
      agentos14_p: "Sistem her gece kendi verilerini tarayıp kısa bir öz-değerlendirme raporu yazar.",
      agentos15_h: "Fırsat Tarayıcı",
      agentos15_p: "İnternette araçlarımıza gerçekten ihtiyacı olan insanları bulur, açık kimlikli bir cevap taslağı hazırlar; gönderim hep bizde kalır.",
      agentos16_h: "Güvenlik Gözcüsü",
      agentos16_p: "Güvenlik dünyasını günlük tarar, kendi sistemimize dokunan riskleri sade Türkçe özetler.",
      agentos17_h: "Teknoloji Gözcüsü",
      agentos17_p: "Yapay zeka ve geliştirici dünyasındaki gelişmeleri günlük süzer, işimize yarayanı öne çıkarır.",
      agentos18_h: "Otomatik Yedekleme",
      agentos18_p: "Her gece kendi kendine yedeğini alır; veri kaybı riskini insan hatasından çıkarır.",

      // DİĞER ÜRÜNLERİMİZ
      diger_kicker: "Sırada",
      diger_baslik: "Geliştirdiğimiz diğer ürünler.",
      diger_alt: "Hepsi kendi ihtiyacımızdan doğdu, hâlâ gelişiyor. Kusursuzluk iddiamız yok — büyüyen bir işi arıyorsanız doğru yerdesiniz.",
      sesli_h: "Sesli Şef Arayüzü",
      sesli_p: "Sesle konuşarak yönettiğimiz, gerçek zamanlı cevap veren bir arayüz; benzerine rastlamadık.",
      randevu_h: "Randevu Botu",
      randevu_p: "Mesaj üzerinden otomatik randevu alan bir bot; geliştirme aşamasında.",
      tryon_h: "Try-On (Kombin Deneme)",
      tryon_p: "Fotoğrafınızla kombin denemenizi sağlayan görsel bir araç; üstünde çalışıyoruz.",
      aurelia_h: "AURELIA",
      aurelia_p: "Küçük işletmeler için markaya özel web sitelerini uçtan uca üreten kendi site üretim hattımız.",

      // ATÖLYE + ARAÇLAR
      atolye_kicker: "Atölye bölümümüz",
      atolye_baslik: "Gezin, deneyin.",
      atolye_alt: "Kartlardaki görüntü canlı önizlemedir; tıklayın, sayfanın kendisi açılsın. Araçlarımız ücretsiz, üyeliksiz, tarayıcınızda çalışır.",
      butik_ad: "Atölye Butik<small>Esnaf paketi — küçük işletmeye özel butik site vitrini</small>",
      atolye_ad: "ATÖLYE VYRON<small>Örnek atölye sitemiz</small>",
      arac2_ad: "Vergi &amp; Net Maaş<small>Brütten nete, 2026 oranları</small>",
      arac3_ad: "LLM Token Maliyeti<small>Model başına istek maliyeti</small>",

      // AURELIA ÇIKTILARI
      duvar_kicker: "AURELIA'nın çıktıları",
      duvar_baslik: "AURELIA'nın ürettiği siteler.",
      duvar_alt: "Konsept değil; AURELIA üretim hattımızın yayındaki sonuçları. Kartın üzerine gelin sahne oynasın, tıklayın işin kendisine gidin.",
      duvar_tum: "Tüm AURELIA sitelerini görün →",

      // AURELIA ILE SITE
      site_kur_kicker: "AURELIA ile site",
      site_kur_baslik: "Siteniz mi lazım? İki yol var.",
      kurulum_ust: "Sitenizi iki şekilde ayağa kaldırırız:",
      yol1_no: "Yol 1",
      yol1_h: "Tam hazır paket",
      yol1_p: "Alan adı, sunucu ve bakım tek bir yıllık abonelikte toplanır; hiçbir teknik yükü siz taşımazsınız. Alan adı her zaman sizin adınıza alınır: tapu sizde, anahtar sizde — biz yalnızca bakım ustanızız.",
      yol2_no: "Yol 2",
      yol2_h: "Kendi alan adınızla",
      yol2_p: "Kendi alan adınız zaten varsa siz getirin; biz sitenizi kurar, canlıya alır ve bakımını sürdürürüz. Sahiplik baştan sona sizde kalır.",

      // FORM
      form_kicker: "Sıra sizde",
      form_baslik: "Bize yazın.",
      form_giris: "Ürünlerimiz, iş birlikleri ya da bir site fikriniz için adınızı, e-postanızı ve mesajınızı bırakın.",
      form_ad: "Adınız",
      form_ad_ph: "Adınız",
      form_eposta: "E-posta",
      form_eposta_ph: "ornek@eposta.com",
      form_mesaj: "Mesajınız",
      form_mesaj_ph: "Aklınızdaki işi birkaç cümleyle anlatın.",
      form_gonder: "Gönder",
      form_guven: "Mesajınız yalnızca e-postamıza düşer; hiçbir yerde saklanmaz, üçüncü kişilerle paylaşılmaz. 24 saat içinde size döneriz.",

      // FOOTER
      footer: "<b>IRON VISION</b> · Ürün stüdyosu · AgentOS · Sesli Şef · AURELIA"
    },

    en: {
      _title: "IRON VISION — The software studio that ships in a day",
      _lang: "en",

      sr_h1: "IRON VISION — a software studio that builds the same day a need appears: AgentOS, a voice interface and more",

      // HERO
      slogan: "A need appears.<br>We build it the same day.",
      video_daveti: "<b>Want proof?</b> Our voice line went live in 2 hours; we wrote our own 654-document memory engine ourselves.",
      scroll_ipucu: "Scroll down",

      // AGENTOS — 18 TOOLS
      hizmet_kicker: "The big thing",
      hizmet_baslik: "AgentOS: 18 tools, one roof.",
      iki_yol: "Every tool is <span>a separate app</span> that runs on its own; put together, the result is an operating system. Not a marketing line — real architecture.",

      agentos1_h: "Inbox Bot",
      agentos1_p: "Reads incoming mail automatically and flags what matters; anything going out still passes through our approval.",
      agentos2_h: "Notification Network",
      agentos2_p: "Nine separate watchers run around the clock; the moment something breaks or a renewal is close, we hear about it instantly.",
      agentos3_h: "Remote Command",
      agentos3_p: "We send commands to the server from a phone message; work gets done without sitting at a computer.",
      agentos4_h: "Cost Dashboard",
      agentos4_p: "Income and spend on one screen; we see what each piece of work actually costs, in real time.",
      agentos5_h: "Subscription Tracker",
      agentos5_p: "It remembers when every subscription renews and warns us well before it happens.",
      agentos6_h: "Receipt Reader",
      agentos6_p: "We photograph a receipt and AI reads the amount and category, filling the form in automatically.",
      agentos7_h: "Owner's Desk",
      agentos7_p: "Every task handed to us lands in one list; nothing gets forgotten.",
      agentos8_h: "Task Tracking Board",
      agentos8_p: "The status of every running job (urgent / half-done / finished) shows on one screen.",
      agentos9_h: "Channel Watch Bot",
      agentos9_p: "It scans the YouTube channels we follow weekly and writes its own summary when a new video appears.",
      agentos10_h: "Video Archive Memory",
      agentos10_p: "We search over a thousand video recordings by meaning; we look for the topic, not the exact words.",
      agentos11_h: "In-Panel Code Editor",
      agentos11_p: "From a browser, even a phone, we get straight into code with full editing and command-line access.",
      agentos12_h: "Free AI Lane",
      agentos12_p: "We line up eight different free AI providers; when one runs out, the next takes over — no interruption reaches the outside.",
      agentos13_h: "Document Memory",
      agentos13_p: "A search engine that understands the meaning across 650+ internal documents; we find the right one even without knowing its file name.",
      agentos14_h: "Nightly Self-Review",
      agentos14_p: "Every night the system scans its own data and writes a short self-review report.",
      agentos15_h: "Opportunity Scanner",
      agentos15_p: "It finds people online who genuinely need our tools and drafts an openly-identified reply; sending is always up to us.",
      agentos16_h: "Security Watchdog",
      agentos16_p: "It scans the security world daily and summarizes, in plain language, what actually touches our own systems.",
      agentos17_h: "Technology Watchdog",
      agentos17_p: "It filters daily developments in AI and developer tooling and surfaces what's actually useful to us.",
      agentos18_h: "Automatic Backups",
      agentos18_p: "It backs itself up every night, taking human error out of the risk of losing data.",

      // OTHER PRODUCTS
      diger_kicker: "Coming up",
      diger_baslik: "Other products we're building.",
      diger_alt: "Every one of these grew out of our own need and is still evolving. We don't claim perfection — if you're looking for a growing business, you're in the right place.",
      sesli_h: "Voice Interface",
      sesli_p: "An interface we run entirely by voice, answering in real time; we haven't seen anything quite like it.",
      randevu_h: "Booking Bot",
      randevu_p: "A bot that books appointments automatically over chat; currently in development.",
      tryon_h: "Try-On (Outfit Preview)",
      tryon_p: "A visual tool that lets you preview an outfit on your own photo; we're actively building it.",
      aurelia_h: "AURELIA",
      aurelia_p: "Our own production line that builds brand-true websites for small businesses, start to finish.",

      // WORKSHOP + TOOLS
      atolye_kicker: "Our workshop floor",
      atolye_baslik: "Wander in, try things.",
      atolye_alt: "Every card is a live preview — click one and the page itself opens. Our tools are free, need no sign-up and run right in your browser.",
      butik_ad: "Atölye Butik<small>Small-business package — a boutique site showcase</small>",
      atolye_ad: "ATÖLYE VYRON<small>Our showcase workshop site</small>",
      arac2_ad: "Tax &amp; Net Salary<small>Gross to net, 2026 rates</small>",
      arac3_ad: "LLM Token Cost<small>Per-request cost by model</small>",

      // AURELIA'S OUTPUT
      duvar_kicker: "AURELIA's output",
      duvar_baslik: "Sites AURELIA has built.",
      duvar_alt: "Not concepts — live results from our AURELIA production line. Hover a card to let the scene play, click it to open the site itself.",
      duvar_tum: "See every AURELIA site →",

      // A SITE WITH AURELIA
      site_kur_kicker: "A site with AURELIA",
      site_kur_baslik: "Need a site? There are two paths.",
      kurulum_ust: "There are two ways we bring your site to life:",
      yol1_no: "Path 1",
      yol1_h: "The full turnkey package",
      yol1_p: "Domain, hosting and maintenance bundled into a single yearly subscription — none of the technical weight ever lands on you. The domain is always registered in your name: the deed is yours, the key is yours — we are simply your maintenance crew.",
      yol2_no: "Path 2",
      yol2_h: "Bring your own domain",
      yol2_p: "Already own a domain? Bring it along; we build your site, take it live and keep it maintained. Ownership stays fully yours, start to finish.",

      // FORM
      form_kicker: "Your move",
      form_baslik: "Write to us.",
      form_giris: "Drop your name, email and message — about our products, a collaboration, or a site idea.",
      form_ad: "Your name",
      form_ad_ph: "Your name",
      form_eposta: "Email",
      form_eposta_ph: "you@email.com",
      form_mesaj: "Your message",
      form_mesaj_ph: "Tell us about the work you have in mind, in a few lines.",
      form_gonder: "Send",
      form_guven: "Your message reaches our inbox only — it is stored nowhere and never shared with third parties. We reply within 24 hours.",

      // FOOTER
      footer: "<b>IRON VISION</b> · Product studio · AgentOS · Voice Interface · AURELIA"
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
