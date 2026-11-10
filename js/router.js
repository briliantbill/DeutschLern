/* =========================================================
   DeutschLern — router.js
   Router berbasis hash (#/materi/1). Tidak butuh server, jadi
   tetap jalan saat index.html dibuka langsung (file://).

   Pemakaian:
     DL.router.add('/materi/:id', {
       title: (params) => 'Bab ' + params.id,  // string atau fungsi
       nav: 'materi',                           // menu yang ditandai aktif
       render: (params) => '<h1>…</h1>',        // mengembalikan HTML
       mount: (outlet, params) => cleanupFn      // opsional: pasang event
     });
     DL.router.start({ outlet, defaultPath: '/beranda', onChange });
   ========================================================= */
(function (DL) {
  'use strict';

  const routes = [];
  let notFoundPage = {
    title: 'Halaman tidak ditemukan',
    render: () => '<h1>Halaman tidak ditemukan</h1>'
  };
  let options = null;
  let cleanup = null;
  let isFirstRender = true;

  /** Ubah pola "/materi/:id" menjadi regex + daftar nama parameter. */
  function compile(pattern) {
    const keys = [];
    const source = pattern
      .replace(/\/+$/, '')
      .split('/')
      .map((segment) => {
        if (segment.startsWith(':')) {
          keys.push(segment.slice(1));
          return '([^/]+)';
        }
        return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      })
      .join('/');
    return { regex: new RegExp('^' + source + '/?$'), keys };
  }

  function add(pattern, page) {
    routes.push(Object.assign({ pattern, page }, compile(pattern)));
    return DL.router;
  }

  function setNotFound(page) {
    notFoundPage = page;
  }

  function safeDecode(value) {
    try {
      return decodeURIComponent(value);
    } catch (error) {
      return value;
    }
  }

  /** "#/materi/1" → "/materi/1". Hash yang bukan rute (kosong, "#app") → null. */
  function currentPath() {
    const hash = window.location.hash;
    if (!hash.startsWith('#/')) return null;
    const path = hash.slice(1).split('?')[0].replace(/\/+$/, '');
    return path || null;
  }

  function match(path) {
    for (const route of routes) {
      const result = route.regex.exec(path);
      if (result) {
        const params = {};
        route.keys.forEach((key, index) => {
          params[key] = safeDecode(result[index + 1]);
        });
        return { page: route.page, params };
      }
    }
    return null;
  }

  /** Pindah halaman. replace:true mengganti riwayat (tombol Back tidak kembali ke sini). */
  function navigate(path, navOptions) {
    const hash = '#' + path;
    if (navOptions && navOptions.replace) {
      // location.replace dipakai, bukan history.replaceState, karena
      // replaceState diblokir Chrome untuk halaman file://.
      window.location.replace(hash);
    } else {
      window.location.hash = path;
    }
  }

  /** @param {{refresh?: boolean}} [renderOptions] refresh = gambar ulang halaman yang sama. */
  function render(renderOptions) {
    const isRefresh = Boolean(renderOptions && renderOptions.refresh);
    const path = currentPath();
    if (path === null) {
      navigate(options.defaultPath, { replace: true });
      return;
    }

    const found = match(path) || { page: notFoundPage, params: {} };
    const outlet = options.outlet;

    if (typeof cleanup === 'function') {
      try {
        cleanup();
      } catch (error) {
        console.error('[router] Gagal membersihkan halaman sebelumnya', error);
      }
    }
    cleanup = null;

    try {
      outlet.innerHTML = found.page.render(found.params);
      if (typeof found.page.mount === 'function') {
        cleanup = found.page.mount(outlet, found.params) || null;
      }
    } catch (error) {
      console.error('[router] Gagal menampilkan ' + path, error);
      outlet.innerHTML =
        '<div class="placeholder"><h1 class="placeholder__title">Terjadi kesalahan</h1>' +
        '<p>Halaman ini gagal ditampilkan. Buka Console di browser (F12) untuk melihat detailnya.</p></div>';
    }

    options.onChange({ path, page: found.page, params: found.params, isFirst: isFirstRender, isRefresh });
    isFirstRender = false;
  }

  /** Gambar ulang halaman sekarang (mis. setelah profil berganti) tanpa memindah fokus. */
  function refresh() {
    if (options) render({ refresh: true });
  }

  function start(startOptions) {
    options = Object.assign({ defaultPath: '/beranda', onChange() {} }, startOptions);
    window.addEventListener('hashchange', () => render());
    render();
  }

  DL.router = { add, setNotFound, start, navigate, refresh, currentPath };
})(window.DL = window.DL || {});
