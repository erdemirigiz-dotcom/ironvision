/* KERVAN Walks — i18n (EN default, TR full). Proper nouns stay untranslated. */
(function () {
  "use strict";
  var DICT = {
    "skip":        { en: "Skip to tours", tr: "Turlara geç" },
    "nav.tours":   { en: "Tours", tr: "Turlar" },
    "nav.route":   { en: "Route", tr: "Rota" },
    "nav.guide":   { en: "Guide", tr: "Rehber" },
    "nav.faq":     { en: "FAQ", tr: "SSS" },
    "nav.book":    { en: "Join a walk", tr: "Yürüyüşe katıl" },
    "nav.menu":    { en: "Menu", tr: "Menü" },

    "hero.eyebrow":{ en: "Licensed local guide · old city", tr: "Lisanslı yerel rehber · eski şehir" },
    "hero.h1a":    { en: "Turn the corner", tr: "Köşeyi dön," },
    "hero.h1b":    { en: "with a", tr: "bir" },
    "hero.h1c":    { en: "local", tr: "yerliyle" },
    "hero.lead":   { en: "Small-group walks through the old city's market kitchens, painted lanes and hidden courtyards. No coach, no crowd — just the streets, at a walking pace, with someone who lives here.", tr: "Eski şehrin çarşı mutfaklarında, boyalı sokaklarında ve gizli avlularında küçük gruplu yürüyüşler. Otobüs yok, kalabalık yok — yalnızca sokaklar, yürüyüş temposunda, burada yaşayan biriyle." },
    "hero.cta":    { en: "Join a walk", tr: "Yürüyüşe katıl" },
    "hero.proof":  { en: "320+ walkers hosted", tr: "320+ yürüyüşçü ağırlandı" },
    "badge.sample":{ en: "sample", tr: "örnek" },
    "badge.demo":  { en: "demo clip", tr: "demo klip" },

    "board.title": { en: "Today's departure", tr: "Bugünün kalkışı" },
    "board.live":  { en: "Now boarding", tr: "Biniş başladı" },
    "board.neigh": { en: "Neighbourhood", tr: "Mahalle" },
    "board.walk":  { en: "Walk", tr: "Yürüyüş" },
    "board.hint":  { en: "Pick a neighbourhood — the board flips, the route redraws.", tr: "Bir mahalle seç — pano çevrilir, rota yeniden çizilir." },

    "tours.eyebrow":{ en: "The walks", tr: "Yürüyüşler" },
    "tours.h":     { en: "Six routes, one pace: yours.", tr: "Altı rota, tek tempo: seninki." },
    "tours.lead":  { en: "Every walk is capped small and led on foot. Red is a flavour walk, blue is a canvas walk — pick by appetite.", tr: "Her yürüyüş küçük gruplu ve yürüyerek. Kırmızı lezzet yürüyüşü, mavi sokak-sanatı yürüyüşü — iştahına göre seç." },

    "route.eyebrow":{ en: "Selected route", tr: "Seçili rota" },
    "route.h":     { en: "Where today's walk goes.", tr: "Bugünkü yürüyüş nereye gidiyor?" },
    "route.cap":   { en: "Schematic route — not to scale", tr: "Şematik rota — ölçekli değil" },

    "guide.capk":  { en: "Your guide", tr: "Rehberin" },
    "guide.eyebrow":{ en: "Who you walk with", tr: "Kiminle yürüyorsun" },
    "guide.lead":  { en: "I've spent fifteen years learning this city on foot — which baker opens first, which courtyard is worth the detour, which mural has a story the guidebooks skip. I keep groups tiny so the walk stays a conversation, not a broadcast.", tr: "Bu şehri on beş yıldır yürüyerek öğreniyorum — hangi fırın önce açılır, hangi avlu sapmaya değer, hangi duvar resminin rehber kitapların atladığı bir hikâyesi var. Grupları küçük tutuyorum ki yürüyüş bir yayın değil, bir sohbet olarak kalsın." },
    "guide.k1":    { en: "Years guiding", tr: "Yıllık rehberlik" },
    "guide.k2":    { en: "Walkers per group", tr: "Grup başına kişi" },
    "guide.k3":    { en: "Licence no. [demo]", tr: "Lisans no. [demo]" },

    "how.eyebrow": { en: "How it works", tr: "Nasıl işler" },
    "how.h":       { en: "Three steps to the street.", tr: "Sokağa üç adım." },
    "how.s1h":     { en: "Pick a walk", tr: "Bir yürüyüş seç" },
    "how.s1p":     { en: "Choose a neighbourhood and a date. Tell me how many are coming and any food or mobility notes.", tr: "Bir mahalle ve tarih seç. Kaç kişi geleceğinizi, yemek ya da hareket kısıtı notlarını yaz." },
    "how.s2h":     { en: "I confirm by hand", tr: "Elle onaylıyorum" },
    "how.s2p":     { en: "Within a day you get a personal reply with the meeting point, what to wear, and a weather plan B.", tr: "Bir gün içinde buluşma noktası, ne giyeceğin ve hava için B planıyla kişisel bir yanıt alırsın." },
    "how.s3h":     { en: "We walk", tr: "Yürüyoruz" },
    "how.s3p":     { en: "We meet, we walk, we stop where it's worth stopping. Pay on the day, cash or card — no deposit.", tr: "Buluşuyoruz, yürüyoruz, durmaya değer yerde duruyoruz. Ödeme gün içinde, nakit ya da kart — kapora yok." },

    "rev.eyebrow": { en: "Walkers say", tr: "Yürüyüşçüler diyor ki" },
    "rev.h":       { en: "Small group, long memory.", tr: "Küçük grup, uzun hatıra." },
    "rev.q1":      { en: "“We ate in three kitchens no map would have found. Deniz knows everyone's name.”", tr: "“Hiçbir haritanın bulamayacağı üç mutfakta yemek yedik. Deniz herkesin adını biliyor.”" },
    "rev.w1":      { en: "Marta & Jan · Old Harbour Table", tr: "Marta & Jan · Old Harbour Table" },
    "rev.q2":      { en: "“The street-art walk felt like a private tour. Eight people, zero rush.”", tr: "“Sokak sanatı yürüyüşü özel tur gibiydi. Sekiz kişi, hiç acele yok.”" },
    "rev.w2":      { en: "Priya · Tanners' Hill Canvas", tr: "Priya · Tanners' Hill Canvas" },
    "rev.q3":      { en: "“Rained the whole afternoon and it was still the best day of the trip.”", tr: "“Öğleden sonra hiç durmadan yağdı, yine de gezinin en iyi günüydü.”" },
    "rev.w3":      { en: "The Okafor family · Spice Quarter at Dusk", tr: "Okafor ailesi · Spice Quarter at Dusk" },
    "rev.note":    { en: "Quotes shown are sample content for this demo build and carry no real guest data.", tr: "Gösterilen alıntılar bu demo yapımı için örnek içeriktir; gerçek misafir verisi taşımaz." },

    "faq.eyebrow": { en: "Before you book", tr: "Rezervasyondan önce" },
    "faq.h":       { en: "Questions, answered.", tr: "Sorular, yanıtları." },
    "faq.q1":      { en: "How big are the groups?", tr: "Gruplar ne kadar büyük?" },
    "faq.a1":      { en: "Every walk is capped at eight people. Most run with four to six, so you can actually hear, ask and stop when something catches your eye.", tr: "Her yürüyüş en fazla sekiz kişiyle sınırlı. Çoğu dört ila altı kişiyle yürür; böylece duyabilir, sorabilir ve gözüne bir şey takılınca durabilirsin." },
    "faq.q2":      { en: "What happens if it rains?", tr: "Yağmur yağarsa ne olur?" },
    "faq.a2":      { en: "We walk in light rain — bring a layer. In heavy weather I shift to a covered-market and courtyard version of the route, or we reschedule at no cost. You decide the morning of.", tr: "Hafif yağmurda yürürüz — yanına bir kat al. Sert havada rotayı kapalı çarşı ve avlu versiyonuna çeviririm ya da ücretsiz erteleriz. Kararı o sabah sen verirsin." },
    "faq.q3":      { en: "Which languages do you guide in?", tr: "Hangi dillerde rehberlik yapıyorsun?" },
    "faq.a3":      { en: "Walks run in English and Turkish. German, Spanish and French can be arranged for private groups — just ask when you book.", tr: "Yürüyüşler İngilizce ve Türkçe yapılır. Almanca, İspanyolca ve Fransızca özel gruplar için ayarlanabilir — rezervasyonda belirtmen yeterli." },
    "faq.q4":      { en: "Can I cancel or change my booking?", tr: "Rezervasyonu iptal edebilir ya da değiştirebilir miyim?" },
    "faq.a4":      { en: "Free cancellation up to 24 hours before the walk. There's no deposit — you pay on the day, cash or card — so changing plans is simple.", tr: "Yürüyüşten 24 saat öncesine kadar ücretsiz iptal. Kapora yok — ödemeyi o gün nakit ya da kartla yaparsın — bu yüzden plan değiştirmek kolay." },
    "faq.q5":      { en: "Is the walk suitable for kids or slower walkers?", tr: "Yürüyüş çocuklar ya da yavaş yürüyenler için uygun mu?" },
    "faq.a5":      { en: "Most routes are two to three kilometres at an easy pace with plenty of stops. Tell me about young children or mobility needs and I'll pick or adapt a route to match.", tr: "Rotaların çoğu, bol duraklı ve rahat tempolu iki-üç kilometredir. Küçük çocukları ya da hareket ihtiyaçlarını bana yaz; uygun bir rota seçer ya da uyarlarım." },
    "faq.q6":      { en: "Are food and drinks included?", tr: "Yeme-içme dahil mi?" },
    "faq.a6":      { en: "On flavour walks a few tastings are included; anything you order beyond that is your own. Canvas walks include a coffee stop. Prices are confirmed in your booking reply.", tr: "Lezzet yürüyüşlerinde birkaç tadım dahildir; ötesinde sipariş ettiğin sana aittir. Sanat yürüyüşlerinde bir kahve molası vardır. Fiyatlar rezervasyon yanıtında netleşir." },

    "book.eyebrow":{ en: "Join a walk", tr: "Yürüyüşe katıl" },
    "book.h":      { en: "Tell me when — I'll do the rest.", tr: "Ne zaman olduğunu söyle — gerisi bende." },
    "book.lead":   { en: "Send the date, the walk and how many are coming. You'll get a personal reply within a day — no accounts, no upfront payment.", tr: "Tarihi, yürüyüşü ve kaç kişi geleceğini gönder. Bir gün içinde kişisel bir yanıt alırsın — hesap yok, peşin ödeme yok." },
    "book.t1":     { en: "Licensed guide · small groups capped at eight", tr: "Lisanslı rehber · en fazla sekiz kişilik gruplar" },
    "book.t2":     { en: "Free cancellation up to 24 hours before", tr: "24 saat öncesine kadar ücretsiz iptal" },
    "book.t3":     { en: "Pay on the day — no deposit, no card details online", tr: "Ödeme gün içinde — kapora yok, çevrimiçi kart bilgisi yok" },
    "book.wa":     { en: "Prefer to message? ", tr: "Mesaj mı tercih edersin? " },
    "book.walink": { en: "Reach me on WhatsApp →", tr: "WhatsApp'tan yaz →" },

    "form.name":   { en: "Your name", tr: "Adın" },
    "form.date":   { en: "Date", tr: "Tarih" },
    "form.people": { en: "Walkers", tr: "Kişi" },
    "form.tour":   { en: "Which walk?", tr: "Hangi yürüyüş?" },
    "form.note":   { en: "Anything I should know? (optional)", tr: "Bilmem gereken bir şey? (isteğe bağlı)" },
    "form.submit": { en: "Request this walk", tr: "Bu yürüyüşü iste" },
    "form.microcopy":{ en: "No payment now. I reply personally within a day.", tr: "Şimdi ödeme yok. Bir gün içinde kişisel yanıt veririm." },

    "foot.tag":    { en: "Licensed small-group walks through the old city. Run by one guide, on foot, at a human pace.", tr: "Eski şehirde lisanslı, küçük gruplu yürüyüşler. Tek rehber, yürüyerek, insan temposunda." },
    "foot.explore":{ en: "Explore", tr: "Keşfet" },
    "foot.book":   { en: "Book", tr: "Rezervasyon" },
    "foot.rehber": { en: "How it was made (TR)", tr: "Nasıl yapıldı? (TR)" },
    "foot.fiction":{ en: "Fictional demo brand — VYRON showcase", tr: "Kurgusal demo marka — VYRON vitrini" },
    "foot.built":  { en: "Built by VYRON Site Fabrikası", tr: "VYRON Site Fabrikası yapımı" },

    /* form status strings (used by main.js) */
    "status.err":  { en: "Please fill in your name and a date.", tr: "Lütfen adını ve bir tarih gir." },
    "status.ok":   { en: "Thanks! This is a demo form — in the live site your request would reach the guide directly.", tr: "Teşekkürler! Bu bir demo form — canlı sitede isteğin doğrudan rehbere ulaşırdı." }
  };

  var current = "en";

  function t(key) {
    var e = DICT[key];
    return e ? (e[current] || e.en) : "";
  }

  function apply(lang) {
    if (lang !== "en" && lang !== "tr") lang = "en";
    current = lang;
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (DICT[k]) el.textContent = t(k);
    });
    document.querySelectorAll(".lang [data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
    try { localStorage.setItem("patika-lang", lang); } catch (e) {}
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang, t: t } }));
  }

  // expose for main.js
  window.PATIKA_I18N = { t: t, get lang() { return current; } };

  function init() {
    var saved = null;
    try { saved = localStorage.getItem("patika-lang"); } catch (e) {}
    var param = new URLSearchParams(location.search).get("lang");
    apply(param || saved || "en");
    document.querySelectorAll(".lang [data-lang]").forEach(function (b) {
      b.addEventListener("click", function () { apply(b.getAttribute("data-lang")); });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
