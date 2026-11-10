/* =========================================================
   DeutschLern — pages/kuis.js
   Halaman Kuis (#/kuis). Masih halaman sementara.
   ========================================================= */
(function (DL) {
  'use strict';

  DL.router.add('/kuis', {
    title: 'Kuis',
    nav: 'kuis',
    render() {
      return DL.components.pagePlaceholder({
        title: 'Kuis',
        de: 'das Quiz',
        meaning: 'kuis',
        note: 'Kuis interaktif sedang disiapkan.',
        tilt: '1deg'
      });
    }
  });
})(window.DL = window.DL || {});
