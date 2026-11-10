/* =========================================================
   DeutschLern — pages/kamus.js
   Halaman Kamus (#/kamus). Masih halaman sementara.
   ========================================================= */
(function (DL) {
  'use strict';

  DL.router.add('/kamus', {
    title: 'Kamus',
    nav: 'kamus',
    render() {
      return DL.components.pagePlaceholder({
        title: 'Kamus',
        de: 'das Wörterbuch',
        meaning: 'kamus',
        note: 'Kosakata dari semua bab akan bisa dicari di sini.',
        tilt: '-1deg'
      });
    }
  });
})(window.DL = window.DL || {});
