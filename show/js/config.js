"use strict";
/* IRON VISION show-site — genel ayarlar.
   Tek yerden değiştirilebilen sabitler. Form endpoint'i yayında değişebilir. */
window.IV_CONFIG = {
  // Form backend — VYRON Site Fabrikası ortak form motoru (app.py /api/form).
  // Göreli yol: yayında ters proxy ya da gerçek HTTPS endpoint bağlanacak.
  // IP/hostname bu dosyaya ASLA yazılmaz (sızıntı yasağı).
  FORM_ENDPOINT: "/api/form",
  // Kayıtta hangi siteden geldiğini işaretler (backend _site alanını okur).
  SITE_ETIKETI: "ironvisiontools-show-site"
};
