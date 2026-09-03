/*!
 * vitrin-form.js — VYRON vitrin siteleri ortak form göndericisi.
 *
 * NEDEN VAR (02.09.2026 denetimi, bulgu S-1): 13 vitrin sitesinin formu yalnız
 * e.preventDefault() çağırıp "teşekkürler" gösteriyordu; talep hiçbir yere
 * düşmüyordu. Bu dosya formu gerçek uç noktaya bağlar ve **2xx gelmedikçe
 * ASLA teşekkür etmez** — hata durumunda kullanıcıya doğrudan e-posta yolu verir.
 *
 * Sayfanın kendi submit dinleyicisi capture aşamasında kesilir
 * (stopImmediatePropagation) — yani eski sahte "teşekkürler" akışı çalışmaz.
 *
 * Kurulum: <script src="js/vitrin-form.js" data-site="MARKA (vitrin-XX-slug)"
 *          defer></script>   (sitenin kendi main.js'inden SONRA)
 */
(function () {
  "use strict";

  var UC_NOKTA = "https://vitrin-form.erdemirigiz.workers.dev/";
  var EPOSTA = "founder@ironvisiontools.com";

  var script = document.currentScript ||
    document.querySelector('script[src*="vitrin-form.js"]');
  var SITE = (script && script.getAttribute("data-site")) || document.title;
  var TR = (document.documentElement.getAttribute("lang") || "en").toLowerCase().indexOf("tr") === 0;

  var METIN = TR ? {
    gonderiliyor: "Gönderiliyor…",
    tamam: "Talebiniz bize ulaştı. En kısa sürede döneceğiz.",
    hata: "Talep gönderilemedi. Lütfen doğrudan " + EPOSTA + " adresine yazın.",
    hiz: "Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar deneyin.",
    eksik: "Lütfen en az bir iletişim bilgisi (ad ve e-posta/telefon) girin."
  } : {
    gonderiliyor: "Sending…",
    tamam: "Your request reached us. We will get back to you shortly.",
    hata: "Could not send your request. Please email " + EPOSTA + " directly.",
    hiz: "Too many attempts. Please try again in a few minutes.",
    eksik: "Please enter at least a name and an email or phone number."
  };

  function durumKutusu(form) {
    var k = form.querySelector(".vf-durum");
    if (!k) {
      k = document.createElement("p");
      k.className = "vf-durum";
      k.setAttribute("role", "status");
      k.setAttribute("aria-live", "polite");
      k.hidden = true;
      form.appendChild(k);
    }
    return k;
  }

  function bal(form) {
    if (form.querySelector('input[name="website"]')) return;
    var i = document.createElement("input");
    i.type = "text";
    i.name = "website";
    i.tabIndex = -1;
    i.autocomplete = "off";
    i.setAttribute("aria-hidden", "true");
    i.style.cssText = "position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0;pointer-events:none";
    form.appendChild(i);
  }

  function stil() {
    if (document.getElementById("vf-stil")) return;
    var s = document.createElement("style");
    s.id = "vf-stil";
    s.textContent =
      ".vf-durum{margin:.9rem 0 0;font-size:.95rem;line-height:1.5;padding:.7rem .9rem;" +
      "border-radius:.5rem;border:1px solid currentColor;background:rgba(127,127,127,.08)}" +
      ".vf-durum[data-hal=bekliyor]{opacity:.75}" +
      ".vf-durum[data-hal=tamam]{color:#1d7a4c}" +
      ".vf-durum[data-hal=hata]{color:#b3261e}";
    document.head.appendChild(s);
  }

  function formlar() {
    return Array.prototype.slice.call(document.querySelectorAll("form"))
      .filter(function (f) { return !f.hasAttribute("data-vf-atla"); });
  }

  function hazirla() {
    stil();
    formlar().forEach(function (f) { bal(f); durumKutusu(f); });
  }

  function gonder(form) {
    var kutu = durumKutusu(form);
    var dugme = form.querySelector('button[type="submit"], input[type="submit"], button:not([type])');
    var veri = { site: SITE };
    new FormData(form).forEach(function (v, k) {
      if (typeof v !== "string") return;
      veri[k] = veri[k] ? veri[k] + ", " + v : v;
    });

    var anlamli = Object.keys(veri).some(function (k) {
      return k !== "site" && k !== "website" &&
        /ad|isim|name|mail|eposta|e-posta|tel|phone|iletisim|contact|mesaj|message/i.test(k) &&
        String(veri[k]).trim() !== "";
    });
    if (!anlamli) {
      kutu.hidden = false; kutu.dataset.hal = "hata"; kutu.textContent = METIN.eksik;
      return;
    }

    kutu.hidden = false; kutu.dataset.hal = "bekliyor"; kutu.textContent = METIN.gonderiliyor;
    if (dugme) dugme.disabled = true;

    fetch(UC_NOKTA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(veri)
    }).then(function (y) {
      if (y.ok) {
        kutu.dataset.hal = "tamam";
        kutu.textContent = METIN.tamam;
        form.reset();
      } else {
        kutu.dataset.hal = "hata";
        kutu.textContent = y.status === 429 ? METIN.hiz : METIN.hata;
      }
    }).catch(function () {
      kutu.dataset.hal = "hata";
      kutu.textContent = METIN.hata;
    }).then(function () {
      if (dugme) dugme.disabled = false;
    });
  }

  // Capture aşaması: sitenin kendi sahte "teşekkürler" dinleyicisi hiç çalışmaz.
  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form || form.tagName !== "FORM" || form.hasAttribute("data-vf-atla")) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    gonder(form);
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hazirla);
  } else {
    hazirla();
  }
})();
