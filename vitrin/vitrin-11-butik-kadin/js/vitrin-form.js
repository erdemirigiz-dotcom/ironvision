/* Örnek çalışma formu: bu site kurgu bir markaya aittir, form hiçbir yere gönderilmez. */
(function () {
  "use strict";
  var TR = (document.documentElement.lang || "tr").toLowerCase().indexOf("tr") === 0;
  var METIN = TR
    ? "Bu site bir örnek çalışmadır; form gerçek bir işletmeye gönderilmez. Kendi siteniz için founder@ironvisiontools.com adresine yazabilirsiniz."
    : "This is a sample site; the form isn't sent to a real business. For your own site, write to founder@ironvisiontools.com.";
  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form || form.tagName !== "FORM") return;
    e.preventDefault();
    e.stopImmediatePropagation();
    var k = form.querySelector(".vf-durum");
    if (!k) {
      k = document.createElement("p");
      k.className = "vf-durum";
      k.setAttribute("role", "status");
      k.style.cssText = "margin:.9rem 0 0;font-size:.95rem;line-height:1.5;padding:.7rem .9rem;border-radius:.5rem;border:1px solid currentColor";
      form.appendChild(k);
    }
    k.textContent = METIN;
  }, true);
})();
