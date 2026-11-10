/* =========================================================
   DeutschLern — book.js
   Buku catatan spiral yang halamannya bisa dibalik.
   - Layar lebar: dua halaman terbuka (kiri + kanan), dibalik per pasang.
   - Layar ≤ 879px: satu halaman, dibalik ke atas seperti buku catatan.
   Halaman genap (0, 2, 4, …) = kiri, ganjil = kanan.
   Halaman filler (pengisi sisi kosong) dilewati di tampilan satu halaman.

   Pemakaian:
     outlet.innerHTML = DL.book.markup({ pages: [{ html, label, section, filler }, …] });
     const book = DL.book.create(outlet.querySelector('[data-book]'), {
       start: 0,
       onChange(state) { … }      // { page, pages, first, last, single, range, labels, section }
     });
     book.next(); book.prev(); book.goTo(4); book.destroy();
   Gaya ada di css/components.css (.flipbook).
   ========================================================= */
(function (DL) {
  'use strict';

  // Harus sama dengan breakpoint buku satu halaman di components.css.
  const singleQuery = window.matchMedia('(max-width: 879px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const HALF_TURN = 300;     // ms per setengah putaran (dua halaman)
  const SINGLE_TURN = 420;   // ms untuk balik satu halaman di HP
  // Halaman HP jauh lebih tinggi daripada lebarnya: perspektif dibuat lebih jauh
  // agar ujung lembar tidak membesar berlebihan saat terangkat.
  const PERSPECTIVE_SPREAD = 'perspective(1800px) ';
  const PERSPECTIVE_SINGLE = 'perspective(3200px) ';

  /* ---------- Markup ---------- */

  /**
   * @param {Object} options
   * @param {Array<{html: string, label: string, section: (string|undefined), filler: (boolean|undefined)}>} options.pages
   *        Isi tiap halaman (HTML jadi). Jumlah ganjil ditambah satu halaman filler.
   * @param {string} [options.className]
   */
  function markup(options) {
    const pages = options.pages.slice();
    if (pages.length % 2) pages.push({ html: '', label: '', filler: true });

    const sheets = pages.map((page, index) => {
      const side = index % 2 ? 'right' : 'left';
      const esc = DL.components.escapeHtml;
      const section = page.section ? ` data-book-section="${esc(page.section)}"` : '';
      const filler = page.filler ? ' data-book-filler' : '';
      return `
        <section class="notebook__page notebook__page--${side} flipbook__page flipbook__page--${side}"
          data-book-page="${index}" data-book-label="${esc(page.label || '')}"${section}${filler}>
          ${page.html}
          <span class="flipbook__number" aria-hidden="true">${index + 1}</span>
        </section>`;
    }).join('');

    return `
      <div class="notebook flipbook ${options.className || ''}" data-book>
        <div class="notebook__spiral flipbook__spiral" aria-hidden="true"></div>
        ${sheets}
      </div>`;
  }

  /* ---------- Pengendali ---------- */

  function isTypingTarget(element) {
    return Boolean(element && element.closest && element.closest('input, textarea, select, [contenteditable="true"]'));
  }

  /**
   * @param {HTMLElement} root  Elemen [data-book] dari markup().
   * @param {Object} [options]
   * @param {number} [options.start]       Halaman awal.
   * @param {Function} [options.onChange]  Dipanggil saat halaman berganti (dan sekali di awal).
   * @param {boolean} [options.keys]       Panah kiri/kanan membalik halaman (default true).
   */
  function create(root, options = {}) {
    const pages = Array.from(root.querySelectorAll('[data-book-page]'));
    const last = pages.length - 1;
    let page = 0;
    let token = 0;           // berganti setiap animasi baru / dibatalkan
    let busy = false;
    const running = new Set();

    const isSingle = () => singleQuery.matches;
    const isFiller = (index) => pages[index].hasAttribute('data-book-filler');
    const clamp = (index) => Math.min(Math.max(index, 0), last);
    // Halaman yang benar-benar dibaca saat tampil satu per satu.
    const readable = pages.map((sheet, index) => index).filter((index) => !isFiller(index));

    /** Layar lebar: selalu mulai dari halaman kiri. HP: lewati halaman filler. */
    function align(index) {
      if (!isSingle()) return index - (index % 2);
      const after = readable.find((candidate) => candidate >= index);
      return after === undefined ? readable[readable.length - 1] : after;
    }

    function shownIndices(index) {
      return isSingle() ? [index] : [index, index + 1].filter((i) => i <= last);
    }

    /** Halaman tujuan satu langkah maju/mundur; null bila sudah di ujung. */
    function stepFrom(index, direction) {
      if (isSingle()) {
        const position = readable.indexOf(index) + direction;
        return position >= 0 && position < readable.length ? readable[position] : null;
      }
      const target = index + direction * 2;
      return target >= 0 && target <= last ? target : null;
    }

    function state() {
      const shown = shownIndices(page);
      const single = isSingle();
      return {
        page,
        pages: single ? readable.length : pages.length,
        first: stepFrom(page, -1) === null,
        last: stepFrom(page, 1) === null,
        single,
        range: single ? [readable.indexOf(page) + 1] : shown.map((i) => i + 1),
        labels: shown.filter((i) => !isFiller(i)).map((i) => pages[i].dataset.bookLabel),
        section: pages[page].dataset.bookSection || null
      };
    }

    function setShown(indices) {
      pages.forEach((sheet, i) => {
        sheet.classList.toggle('is-shown', indices.includes(i));
        sheet.classList.remove('is-turning');
      });
    }

    function notify() {
      if (typeof options.onChange === 'function') options.onChange(state());
    }

    // Halaman yang sedang difokus ikut tersembunyi → pindahkan fokus ke judul halaman baru.
    function rescueFocus() {
      const active = document.activeElement;
      const lost = !active || active === document.body ||
        pages.some((sheet) => !sheet.classList.contains('is-shown') && sheet.contains(active));
      if (!lost) return;
      const target = pages[page].querySelector('h2, h3') || pages[page];
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }

    /** Putar satu lembar. from/to = transformasi awal & akhir. */
    function turn(sheet, from, to, origin, duration, easing, dim) {
      sheet.classList.add('is-turning');
      sheet.style.transformOrigin = origin;   // poros putar: tepi yang menempel ke spiral
      const perspective = isSingle() ? PERSPECTIVE_SINGLE : PERSPECTIVE_SPREAD;
      const animation = sheet.animate([
        { transform: perspective + from, filter: dim ? 'brightness(1)' : 'brightness(0.86)' },
        { transform: perspective + to, filter: dim ? 'brightness(0.86)' : 'brightness(1)' }
      ], { duration, easing, fill: 'both' });
      running.add(animation);
      // Pengaman: kalau jam animasi berhenti (mis. tab tersembunyi), lanjutkan tanpa menunggu.
      const timeout = new Promise((resolve) => setTimeout(resolve, duration + 250));
      return Promise.race([animation.finished, timeout])
        .catch(() => null)
        .then(() => {
          running.delete(animation);
          animation.cancel();
          sheet.style.transformOrigin = '';
        });
    }

    function stopAnimations() {
      token += 1;
      running.forEach((animation) => animation.cancel());
      running.clear();
      busy = false;
      root.style.minHeight = '';
    }

    async function animate(from, to, id) {
      const forward = to > from;
      const alive = () => id === token;
      // Tinggi buku ditahan selama animasi agar tombol di bawahnya tidak melompat.
      root.style.minHeight = root.offsetHeight + 'px';

      if (isSingle()) {
        // Satu halaman, spiral di atas: lembar dibalik ke atas.
        const oldSheet = pages[from];
        const newSheet = pages[to];
        setShown([from, to]);
        // Lembar yang berputar menumpang (absolute): beri ruang setinggi lembar terpanjang.
        const tallest = Math.max(oldSheet.offsetTop + oldSheet.offsetHeight, newSheet.offsetTop + newSheet.offsetHeight);
        root.style.minHeight = Math.max(root.offsetHeight, tallest + 14) + 'px';
        if (forward) {
          await turn(oldSheet, 'rotateX(0deg)', 'rotateX(90deg)', 'center top', SINGLE_TURN, 'ease-in', true);
        } else {
          await turn(newSheet, 'rotateX(90deg)', 'rotateX(0deg)', 'center top', SINGLE_TURN, 'ease-out', false);
        }
        if (!alive()) return;
      } else {
        // Dua halaman: lembar berputar di poros spiral, setengah putaran per sisi.
        const oldLeft = from;
        const newLeft = to;
        const outgoing = forward ? oldLeft + 1 : oldLeft;      // lembar yang terangkat
        const incoming = forward ? newLeft : newLeft + 1;      // sisi baliknya yang mendarat
        setShown([oldLeft, oldLeft + 1, forward ? newLeft + 1 : newLeft].filter((i) => i <= last));
        if (forward) {
          await turn(pages[outgoing], 'rotateY(0deg)', 'rotateY(-90deg)', 'left center', HALF_TURN, 'ease-in', true);
        } else {
          await turn(pages[outgoing], 'rotateY(0deg)', 'rotateY(90deg)', 'right center', HALF_TURN, 'ease-in', true);
        }
        if (!alive()) return;
        setShown([forward ? oldLeft : oldLeft + 1, newLeft, newLeft + 1].filter((i) => i <= last && i !== outgoing));
        if (pages[incoming]) {
          if (forward) {
            await turn(pages[incoming], 'rotateY(90deg)', 'rotateY(0deg)', 'right center', HALF_TURN, 'ease-out', false);
          } else {
            await turn(pages[incoming], 'rotateY(-90deg)', 'rotateY(0deg)', 'left center', HALF_TURN, 'ease-out', false);
          }
        }
        if (!alive()) return;
      }

      setShown(shownIndices(to));
      root.style.minHeight = '';
      busy = false;
      rescueFocus();
    }

    // Bagian atas buku sudah tergulir lewat: gulir kembali agar halaman baru dibaca dari atas.
    function revealTop() {
      const top = root.getBoundingClientRect().top;
      if (top < 0) {
        window.scrollBy({ top: top - 16, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      }
    }

    function goTo(target) {
      syncMode();
      const to = align(clamp(target));
      if (to === page || busy) return;
      const from = page;
      page = to;
      notify();
      revealTop();

      if (reducedMotion.matches || typeof root.animate !== 'function') {
        setShown(shownIndices(page));
        rescueFocus();
        return;
      }
      busy = true;
      token += 1;
      animate(from, to, token);
    }

    function move(direction) {
      syncMode();
      const target = stepFrom(page, direction);
      if (target !== null) goTo(target);
    }

    const next = () => move(1);
    const prev = () => move(-1);

    /* ---------- Keyboard & geser ---------- */

    function onKeydown(event) {
      if (options.keys === false || event.defaultPrevented) return;
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (isTypingTarget(event.target) || document.querySelector('dialog[open]')) return;
      if (event.target.closest && event.target.closest('[data-site-header], .scroll-x')) return;
      if (!root.isConnected) return;
      event.preventDefault();
      if (event.key === 'ArrowRight') next(); else prev();
    }

    let touch = null;
    function onTouchStart(event) {
      const point = event.touches[0];
      // Tabel yang bisa digeser menyamping tidak ikut membalik halaman.
      touch = event.touches.length === 1 && !event.target.closest('.scroll-x')
        ? { x: point.clientX, y: point.clientY }
        : null;
    }
    function onTouchEnd(event) {
      if (!touch) return;
      const point = event.changedTouches[0];
      const dx = point.clientX - touch.x;
      const dy = point.clientY - touch.y;
      touch = null;
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0) next(); else prev();
    }

    // Lebar layar melewati breakpoint: tampilkan ulang tanpa animasi.
    let single = isSingle();
    function onModeChange() {
      single = isSingle();
      stopAnimations();
      page = align(page);
      setShown(shownIndices(page));
      notify();
    }

    // Cadangan bila event "change" belum sampai (mis. tab tidak sedang digambar).
    function syncMode() {
      if (isSingle() !== single) onModeChange();
    }

    document.addEventListener('keydown', onKeydown);
    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchend', onTouchEnd, { passive: true });
    singleQuery.addEventListener('change', onModeChange);

    page = align(clamp(options.start || 0));
    setShown(shownIndices(page));
    notify();

    return {
      next,
      prev,
      goTo,
      state,
      destroy() {
        stopAnimations();
        document.removeEventListener('keydown', onKeydown);
        root.removeEventListener('touchstart', onTouchStart);
        root.removeEventListener('touchend', onTouchEnd);
        singleQuery.removeEventListener('change', onModeChange);
      }
    };
  }

  DL.book = { markup, create };
})(window.DL = window.DL || {});
