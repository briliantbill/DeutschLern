/* =========================================================
   DeutschLern — pages/progres.js
   Halaman Progres Belajar (#/progres). Masih halaman sementara.
   ========================================================= */
(function (DL) {
  'use strict';

  DL.router.add('/progres', {
    title: 'Progres Belajar',
    nav: 'progres',
    render() {
      return DL.components.pagePlaceholder({
        title: 'Progres Belajar',
        de: 'der Lernfortschritt',
        meaning: 'kemajuan belajar',
        note: 'Statistik dan cap perjalanan tiap bab akan muncul di sini.',
        tilt: '0.8deg'
      });
    }
  });
})(window.DL = window.DL || {});
