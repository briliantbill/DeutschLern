/* =========================================================
   DeutschLern — pages/materi.js
   #/materi      Empat "perjalanan" berupa halaman paspor: masing-masing
                 berisi 3 tiket Kapitel + 1 tiket Plattform (emas), lengkap
                 dengan status (belum diisi / belum / sedang / selesai).
   #/materi/:id  Diteruskan ke pages/kapitel.js ("k1") atau pages/plattform.js ("p1").
   File ini juga menyediakan bagian yang dipakai bersama keduanya (DL.materi).
   ========================================================= */
(function (DL) {
  'use strict';

  const c = DL.components;
  const esc = c.escapeHtml;

  const TICKET_TONES = ['cream', 'kraft', 'rose'];

  /* =========================================================
     Bagian bersama Kapitel & Plattform
     ========================================================= */

  function stickerName(entry) {
    return entry.stiker && c.stickers[entry.stiker] ? entry.stiker : 'star';
  }

  /** Kerangka tanpa isi berstatus "kosong"; selebihnya mengikuti progres profil aktif. */
  function statusOf(entry) {
    return DL.data.isFilled(entry) ? DL.storage.getChapterProgress(entry.id).status : 'kosong';
  }

  function entryTitle(entry) {
    return entry.jenis === 'kapitel' ? entry.judul_de : entry.judul;
  }

  /** Kepala halaman Kapitel/Plattform. Saat dibuka, "belum" dihitung "sedang". */
  function head(entry) {
    const status = statusOf(entry);
    const shown = status === 'belum' ? 'sedang' : status;
    const isKapitel = entry.jenis === 'kapitel';
    const subtitle = isKapitel
      ? entry.judul_id
      : 'Kuis campuran Kapitel ' + entry.kapitel[0] + '–' + entry.kapitel[entry.kapitel.length - 1];

    return `
      <header class="chapter-head">
        <a class="link-btn chapter-head__back" href="#/materi"><span aria-hidden="true">‹</span> Semua perjalanan</a>
        <div class="chapter-head__main">
          ${c.sticker(stickerName(entry), { decorative: true, className: 'chapter-head__icon', seed: 'kepala' + entry.id })}
          <div class="chapter-head__titles">
            <h1 class="chapter-head__title" id="page-title" tabindex="-1">
              ${isKapitel ? `<span class="chapter-head__num">${esc(entry.label)}</span>` : ''}
              <span lang="de">${esc(entryTitle(entry))}</span>
            </h1>
            ${subtitle ? `<p class="chapter-head__subtitle">${esc(subtitle)}</p>` : ''}
            <p class="chapter-head__ref">
              ${c.bookRef({ halaman: entry.halaman_buku })}
              <span class="chapter-head__journey">Perjalanan ${entry.perjalanan}</span>
            </p>
          </div>
          ${c.statusStamp(shown, ' data-chapter-status')}
        </div>
      </header>`;
  }

  function setStamp(outlet, status) {
    const stamp = outlet.querySelector('[data-chapter-status]');
    if (!stamp) return;
    stamp.className = 'status-stamp status-stamp--' + status;
    stamp.textContent = status === 'selesai' ? 'Selesai' : 'Sedang dipelajari';
  }

  /* ---------- Soal isian (grammatik.latihan) ---------- */

  const BLANK = '<span class="quiz__blank" data-quiz-blank><span class="visually-hidden" lang="id">titik-titik</span></span>';

  /**
   * Satu soal isian. Kunci jawaban selalu ada di HTML tetapi hanya tampil di Mode Guru.
   * @param {string} key    Penanda unik soal.
   * @param {Object} item   { soal, jawaban }
   * @param {Object} [saved] Keadaan tersimpan { value, solved } agar tidak hilang saat buku disusun ulang.
   */
  function exerciseItem(key, item, saved) {
    const state = saved || {};
    const inputId = 'latihan-' + key;
    const answers = [].concat(item.jawaban);
    const parts = item.soal.split('___').map(esc);
    const blank = state.solved && parts.length === 2
      ? `<span class="quiz__blank is-filled">${esc(normalizeAnswer(state.value))}</span>`
      : BLANK;
    const question = parts.join(blank);
    const value = state.value ? ` value="${esc(state.value)}"` : '';
    const solved = state.solved ? ' readonly' : '';

    return `
      <li class="quiz exercise${state.solved ? ' is-solved' : ''}">
        <form data-exercise="${esc(key)}" novalidate>
          <p class="quiz__question" lang="de">${question}</p>
          <div class="exercise__row">
            <label class="visually-hidden" for="${inputId}">Jawaban</label>
            <input class="exercise__input" id="${inputId}" name="answer" type="text" lang="de"
              autocomplete="off" autocapitalize="off" spellcheck="false"${value}${solved}>
            <button class="btn" type="submit"${state.solved ? ' disabled' : ''}>Periksa</button>
          </div>
          <p class="quiz__feedback${state.solved ? ' is-correct' : ''}" data-exercise-feedback aria-live="polite">${state.solved ? '<span lang="de">Richtig!</span>' : ''}</p>
          <p class="quiz__key teacher-only">Kunci: <b lang="de">${answers.map(esc).join(' / ')}</b></p>
        </form>
      </li>`;
  }

  /** Tanda baca di akhir dan spasi berlebih tidak dihitung salah. */
  function normalizeAnswer(text) {
    return String(text).trim().replace(/\s+/g, ' ').replace(/[.!?,;:]+$/, '');
  }

  /**
   * Periksa jawaban dan perbarui tampilan soal.
   * @returns {boolean} true bila benar.
   */
  function checkExercise(form, item) {
    const input = form.elements.answer;
    const feedback = form.querySelector('[data-exercise-feedback]');
    const typed = normalizeAnswer(input.value);
    const answers = [].concat(item.jawaban).map(normalizeAnswer);

    const show = (className, html) => {
      feedback.className = 'quiz__feedback ' + className;
      feedback.innerHTML = html;
    };

    if (!typed) {
      show('is-wrong', 'Isi jawabanmu dulu.');
      return false;
    }
    if (answers.includes(typed)) {
      show('is-correct', '<span lang="de">Richtig!</span>');
      form.closest('.quiz').classList.add('is-solved');
      input.readOnly = true;
      form.querySelector('button[type="submit"]').disabled = true;
      const blanks = form.querySelectorAll('[data-quiz-blank]');
      if (blanks.length === 1) {
        blanks[0].textContent = typed;
        blanks[0].classList.add('is-filled');
      }
      return true;
    }
    if (answers.some((answer) => answer.toLowerCase() === typed.toLowerCase())) {
      show('is-wrong', 'Hampir! Perhatikan huruf besar dan kecilnya.');
      return false;
    }
    show('is-wrong', '<span aria-hidden="true">✗</span> Belum tepat, coba lagi!');
    return false;
  }

  DL.materi = { stickerName, statusOf, entryTitle, head, setStamp, exerciseItem, checkExercise, BLANK };

  /* =========================================================
     Daftar perjalanan (#/materi)
     ========================================================= */

  function kapitelCounts(entry) {
    if (!DL.data.isFilled(entry)) return 'Materi menyusul';
    const parts = [];
    if (entry.kosakata.length) parts.push(entry.kosakata.length + ' kata');
    if (entry.dialog.length) parts.push(entry.dialog.length + ' dialog');
    if (entry.grammatik.length) parts.push(entry.grammatik.length + ' grammar');
    return parts.join(' · ');
  }

  function entryTicket(entry) {
    const isKapitel = entry.jenis === 'kapitel';
    const pages = entry.halaman_buku ? 'hlm. ' + entry.halaman_buku : '';
    const kicker = isKapitel ? [entry.label, pages].filter(Boolean).join(' · ') : pages;
    const subtitle = isKapitel
      ? entry.judul_id
      : 'Kuis campuran Kapitel ' + entry.kapitel[0] + '–' + entry.kapitel[entry.kapitel.length - 1];
    const meta = isKapitel
      ? kapitelCounts(entry)
      : (DL.data.isFilled(entry) ? 'Tanpa kosakata baru' : 'Kuis muncul setelah Kapitel diisi');

    return `
      <li class="passport__stop">
        ${c.ticket({
          href: '#/materi/' + entry.id,
          tone: isKapitel ? TICKET_TONES[(entry.nomor - 1) % TICKET_TONES.length] : 'gold',
          seed: 'materi-' + entry.id,
          tilt: c.tilt('materi-' + entry.id, 0.8),
          className: 'chapter-ticket',
          html: `
            <span class="chapter-ticket__icon">${c.sticker(stickerName(entry), { decorative: true, seed: entry.id })}</span>
            <span class="chapter-ticket__text">
              <span class="ticket__kicker">${esc(kicker)}</span>
              <span class="ticket__title" lang="de">${esc(entryTitle(entry))}</span>
              ${subtitle ? `<span class="chapter-ticket__subtitle">${esc(subtitle)}</span>` : ''}
              <span class="ticket__meta">${esc(meta)}</span>
            </span>
            <span class="chapter-ticket__status">${c.statusStamp(statusOf(entry))}</span>`
        })}
      </li>`;
  }

  function passportPage(journey) {
    const done = journey.entries.filter((entry) => statusOf(entry) === 'selesai').length;
    const titleId = 'perjalanan-' + journey.nomor;
    const pages = journey.halaman ? `Kursbuch hlm. ${esc(journey.halaman)} · ` : '';

    const html = `
      <header class="passport__head">
        <div>
          <p class="passport__kicker" lang="de">Reisepass</p>
          <h2 class="passport__title" id="${titleId}">Perjalanan ${journey.nomor}</h2>
          <p class="passport__meta">${pages}selesai ${done} dari ${journey.entries.length}</p>
        </div>
        <span class="passport__stamp" aria-hidden="true">
          <span class="passport__stamp-word" lang="de">Reise</span>
          <span class="passport__stamp-number">${journey.nomor}</span>
        </span>
      </header>
      <ol class="passport__route">${journey.entries.map(entryTicket).join('')}</ol>`;

    return `
      <section class="passport-slot" aria-labelledby="${titleId}">
        ${c.paper({ html, torn: 'none', tape: 'planes', seed: titleId, tilt: c.tilt(titleId, 0.5), className: 'passport' })}
      </section>`;
  }

  function listPage() {
    const entries = DL.data.entries;
    const statuses = entries.map(statusOf);
    const done = statuses.filter((status) => status === 'selesai').length;
    const filled = DL.data.kapitel.filter(DL.data.isFilled).length;
    const warning = DL.data.problems.length
      ? '<p class="lessons__warning" role="status">Ada masalah di <code>data/lessons.js</code>. Buka Console (F12) untuk detailnya.</p>'
      : '';
    const progressBar = statuses
      .map((status) => `<span class="lessons__bar-step lessons__bar-step--${status}"></span>`)
      .join('');

    const headHtml = `
      <p class="lessons__kicker" lang="de">Die Lektionen</p>
      <h1 class="lessons__title" id="page-title" tabindex="-1">Materi</h1>
      <p class="lessons__intro">Mengikuti buku <span lang="de">Netzwerk neu A1</span>: ${DL.data.perjalanan.length} perjalanan, ${DL.data.kapitel.length} Kapitel, dan ${DL.data.plattform.length} Plattform. Pilih tiket untuk membukanya.</p>
      <p class="lessons__summary">
        <span>Selesai: <strong>${done} dari ${entries.length}</strong></span>
        <span>Materi terisi: <strong>${filled} dari ${DL.data.kapitel.length} Kapitel</strong></span>
        <span class="lessons__bar" aria-hidden="true">${progressBar}</span>
      </p>
      ${warning}`;

    return `
      <section class="lessons" aria-labelledby="page-title">
        ${c.paper({ html: headHtml, tape: 'rainbow', seed: 'daftar-materi', tilt: '-0.6deg', className: 'lessons__head' })}
        ${c.sticker('compass', { size: '78px', decorative: true, className: 'lessons__compass', tilt: '8deg' })}
        <div class="passport-grid">${DL.data.perjalanan.map(passportPage).join('')}</div>
      </section>`;
  }

  function notFound() {
    return c.pagePlaceholder({
      title: 'Materi tidak ditemukan',
      de: 'Hoppla!',
      meaning: 'ups!',
      note: 'Halaman ini belum ada di jurnal kita.',
      tilt: '1deg',
      actionHtml: '<a class="placeholder__action" href="#/materi"><span aria-hidden="true">‹</span> Lihat semua perjalanan</a>'
    });
  }

  /* =========================================================
     Rute
     ========================================================= */

  function pageFor(entry) {
    return entry.jenis === 'kapitel' ? DL.materi.kapitel : DL.materi.plattform;
  }

  DL.router.add('/materi', {
    title: 'Materi',
    nav: 'materi',
    render: listPage
  });

  DL.router.add('/materi/:id', {
    title: (params) => {
      const entry = DL.data.getEntry(params.id);
      if (!entry) return 'Materi tidak ditemukan';
      return entry.jenis === 'kapitel' ? entry.label + ': ' + entry.judul_de : entry.judul;
    },
    nav: 'materi',
    render(params) {
      const entry = DL.data.getEntry(params.id);
      return entry ? pageFor(entry).render(entry) : notFound();
    },
    mount(outlet, params) {
      const entry = DL.data.getEntry(params.id);
      return entry ? pageFor(entry).mount(outlet, entry) : null;
    }
  });
})(window.DL = window.DL || {});
