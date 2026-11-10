/* =========================================================
   DeutschLern — app.js
   Titik awal aplikasi: menyalakan navbar (menu HP + dropdown
   daftar bab), profil, lalu router. Dimuat paling akhir di index.html.
   ========================================================= */
(function (DL) {
  'use strict';

  const SITE_NAME = 'DeutschLern';
  // Harus sama dengan breakpoint menu HP di components.css (max-width: 879px).
  const desktopNav = window.matchMedia('(min-width: 880px)');

  const header = document.querySelector('[data-site-header]');
  const navToggle = header.querySelector('[data-nav-toggle]');
  const dropdownToggles = Array.from(header.querySelectorAll('[data-dropdown-toggle]'));
  const chapterMenu = header.querySelector('[data-chapter-menu]');
  const addressBar = document.querySelector('[data-address-bar]');
  const skipLink = document.querySelector('[data-skip-link]');
  const outlet = document.getElementById('app');

  /* ---------- Menu HP (hamburger) ---------- */

  function isNavOpen() {
    return navToggle.getAttribute('aria-expanded') === 'true';
  }

  function setNavOpen(open) {
    navToggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('is-nav-open', open);
    if (!open) closeDropdowns();
  }

  /* ---------- Dropdown (Materi) ---------- */

  function menuOf(toggle) {
    return document.getElementById(toggle.getAttribute('aria-controls'));
  }

  function isDropdownOpen(toggle) {
    return toggle.getAttribute('aria-expanded') === 'true';
  }

  function setDropdownOpen(toggle, open) {
    toggle.setAttribute('aria-expanded', String(open));
    menuOf(toggle).hidden = !open;
  }

  function closeDropdowns(except) {
    dropdownToggles.forEach((toggle) => {
      if (toggle !== except) setDropdownOpen(toggle, false);
    });
  }

  function initDropdown(toggle) {
    const item = toggle.parentElement;
    const menu = menuOf(toggle);

    toggle.addEventListener('click', () => {
      const open = !isDropdownOpen(toggle);
      closeDropdowns(toggle);
      setDropdownOpen(toggle, open);
    });

    // Panah bawah membuka menu dan langsung fokus ke item pertama.
    toggle.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      setDropdownOpen(toggle, true);
      const first = menu.querySelector('a[href], button');
      if (first) first.focus();
    });

    // Panah atas/bawah berpindah antar tautan di dalam menu.
    menu.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const links = Array.from(menu.querySelectorAll('a[href], button:not([disabled])'));
      const index = links.indexOf(document.activeElement);
      if (index === -1) return;
      event.preventDefault();
      const target = event.key === 'ArrowDown' ? links[Math.min(index + 1, links.length - 1)] : links[index - 1];
      (target || toggle).focus();
    });

    // Tutup saat fokus keyboard (Tab) pindah ke luar menu.
    item.addEventListener('focusout', (event) => {
      if (event.relatedTarget && !item.contains(event.relatedTarget)) {
        setDropdownOpen(toggle, false);
      }
    });
  }

  /* ---------- Isi dropdown Materi: per perjalanan, dengan status profil aktif ---------- */

  const MENU_STATUS = {
    sedang: { mark: '•', text: 'sedang dipelajari' },
    selesai: { mark: '✓', text: 'selesai' }
  };

  function chapterMenuLink(entry, path) {
    const esc = DL.components.escapeHtml;
    const key = DL.storage.getChapterProgress(entry.id).status;
    const status = MENU_STATUS[key];
    const mark = status
      ? `<span class="chapter-menu__mark chapter-menu__mark--${key}" aria-hidden="true">${status.mark}</span><span class="visually-hidden">, ${status.text}</span>`
      : '';
    const current = path === '/materi/' + entry.id ? ' aria-current="page"' : '';
    const isKapitel = entry.jenis === 'kapitel';
    const badge = isKapitel
      ? `<span class="chapter-menu__num"><span class="visually-hidden">Kapitel </span>${entry.nomor}</span>`
      : '<span class="chapter-menu__num chapter-menu__num--gold" aria-hidden="true">★</span>';
    const title = isKapitel ? entry.judul_de : entry.judul;

    return `
      <li>
        <a class="chapter-menu__link" href="#/materi/${esc(entry.id)}"${current}>
          ${badge}
          <span class="chapter-menu__title" lang="de">${esc(title)}</span>
          ${mark}
        </a>
      </li>`;
  }

  function renderChapterMenu() {
    if (!chapterMenu) return;
    const path = DL.router.currentPath();

    chapterMenu.innerHTML = DL.data.perjalanan.map((journey) => `
      <div class="chapter-menu__group">
        <p class="chapter-menu__heading" id="menu-perjalanan-${journey.nomor}">Perjalanan ${journey.nomor}</p>
        <ol class="chapter-menu__list" aria-labelledby="menu-perjalanan-${journey.nomor}">
          ${journey.entries.map((entry) => chapterMenuLink(entry, path)).join('')}
        </ol>
      </div>`).join('');
  }

  /* ---------- Menutup menu: klik di luar, Escape, layar melebar ---------- */

  document.addEventListener('click', (event) => {
    dropdownToggles.forEach((toggle) => {
      if (!toggle.parentElement.contains(event.target)) setDropdownOpen(toggle, false);
    });
    if (isNavOpen() && !header.contains(event.target)) setNavOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openToggle = dropdownToggles.find(isDropdownOpen);
    if (openToggle) {
      setDropdownOpen(openToggle, false);
      openToggle.focus();
    } else if (isNavOpen()) {
      setNavOpen(false);
      navToggle.focus();
    }
  });

  desktopNav.addEventListener('change', (event) => {
    if (event.matches) setNavOpen(false);
  });

  // Klik tautan ke halaman yang sedang dibuka tidak memicu hashchange,
  // jadi menu ditutup langsung di sini. Begitu juga saat chip profil diklik.
  header.addEventListener('click', (event) => {
    if (event.target.closest('a[href^="#/"], [data-profile-chip]')) setNavOpen(false);
  });

  /* ---------- Fokus & tautan "Langsung ke konten" ---------- */

  function focusPageHeading(preventScroll) {
    const target = outlet.querySelector('h1') || outlet;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll });
  }

  skipLink.addEventListener('click', (event) => {
    event.preventDefault(); // jangan ubah hash, karena hash dipakai router
    focusPageHeading(false);
  });

  /* ---------- Saat halaman berganti ---------- */

  function updateActiveNav(path, page) {
    header.querySelectorAll('[data-nav]').forEach((element) => {
      element.classList.toggle('is-active', element.dataset.nav === page.nav);
    });
    header.querySelectorAll('a[href^="#/"]').forEach((link) => {
      if (link.getAttribute('href') === '#' + path) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function onRouteChange(route) {
    DL.speech.stop();

    const title = typeof route.page.title === 'function'
      ? route.page.title(route.params)
      : route.page.title;

    document.title = title ? title + ' · ' + SITE_NAME : SITE_NAME;
    addressBar.textContent = ['deutschlern'].concat(route.path.split('/').filter(Boolean)).join(' › ');
    updateActiveNav(route.path, route.page);

    // Gambar ulang karena profil berganti: jangan ganggu fokus & posisi gulir.
    if (route.isRefresh) return;
    setNavOpen(false);

    // Saat pindah halaman (bukan saat pertama dibuka), mulai dari atas dan
    // pindahkan fokus ke judul agar pembaca layar mengumumkan halaman baru.
    if (!route.isFirst) {
      window.scrollTo(0, 0);
      focusPageHeading(true);
    }
  }

  /* ---------- Mulai ---------- */

  DL.router.setNotFound({
    title: 'Halaman tidak ditemukan',
    nav: null,
    render() {
      return DL.components.pagePlaceholder({
        title: 'Halaman tidak ditemukan',
        de: 'Hoppla!',
        meaning: 'ups!',
        note: 'Alamat ini tidak ada di jurnal kita.',
        tilt: '1.2deg',
        actionHtml: '<a class="placeholder__action" href="#/beranda"><span aria-hidden="true">‹</span> Kembali ke beranda</a>'
      });
    }
  });

  navToggle.addEventListener('click', () => setNavOpen(!isNavOpen()));
  dropdownToggles.forEach(initDropdown);

  // Profil: chip di navbar + modal. Saat profil/nama berubah, halaman digambar ulang.
  DL.profile.init();
  DL.teacher.init();
  // Audio: tombol speaker & mikrofon di semua halaman.
  DL.speech.init();
  DL.practice.init();
  document.addEventListener(DL.storage.EVENT, () => {
    renderChapterMenu();
    DL.router.refresh();
  });

  // Progres berubah (bab dibuka, halaman dibalik, latihan selesai): cukup perbarui
  // tanda status di menu. Halaman tidak digambar ulang agar posisi buku tetap.
  document.addEventListener(DL.storage.PROGRESS_EVENT, renderChapterMenu);
  renderChapterMenu();

  DL.router.start({ outlet, defaultPath: '/beranda', onChange: onRouteChange });

  // Pertama kali dibuka (belum ada profil aktif): tanya siapa yang belajar.
  if (!DL.storage.getActiveProfile()) {
    DL.profile.open({ required: true });
  }
})(window.DL = window.DL || {});
