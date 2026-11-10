/* =========================================================
   DeutschLern — pages/beranda.js
   Halaman Beranda (#/beranda): buku catatan terbuka.
   Kiri  : judul, "Willkommen!", maskot beruang & stiker.
   Kanan : sapaan profil, "Lanjutkan belajar", "Kata hari ini".
   Tombol tiket Sebelumnya/Selanjutnya di sisi kiri-kanan buku.
   ========================================================= */
(function (DL) {
  'use strict';

  const c = DL.components;
  const esc = c.escapeHtml;

  const germanDate = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  const shortDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long' });

  // Coretan "semangat" di kiri-kanan tulisan Willkommen!
  const spark = (side) => `
    <svg class="home__spark home__spark--${side}" viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <path d="M5 14h9M8 5l6 6M8 23l6-6"/>
    </svg>`;

  /** "hari ini", "kemarin", atau tanggal pendek. */
  function whenText(isoDate) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return '';
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'hari ini';
    if (date.toDateString() === yesterday.toDateString()) return 'kemarin';
    return shortDate.format(date);
  }

  /* ---------- Halaman kiri ---------- */

  function leftPage() {
    return `
      ${c.washi({ motif: 'dots', className: 'home__corner-tape', tilt: '-38deg' })}
      ${c.sticker('stamp', { size: '66px', decorative: true, className: 'home__stamp', tilt: '9deg' })}
      <h1 class="home__title" id="page-title" tabindex="-1">Belajar Bahasa Jerman</h1>
      <p class="home__welcome">
        ${spark('left')}<span class="squiggle" lang="de">Willkommen!</span>${spark('right')}
      </p>
      <div class="home-scene">
        <div class="home-scene__bear">
          ${c.speechBubble({ text: 'Hallo!', lang: 'de', className: 'home-scene__hallo', tilt: '-3deg' })}
          ${c.sticker('bear', { size: '150px', alt: 'Maskot beruang DeutschLern melambai' })}
        </div>
        ${c.sticker('pretzel', { size: '78px', className: 'home-scene__pretzel' })}
        ${c.sticker('tor', { size: '150px', className: 'home-scene__tor' })}
        ${c.speechBubble({ text: 'Danke!', lang: 'de', tone: 'pink', className: 'home-scene__danke', tilt: '2deg' })}
      </div>`;
  }

  /* ---------- Halaman kanan ---------- */

  function continueCard(profile) {
    const progress = profile ? DL.storage.getProgress(profile.id) : {};
    const last = DL.data.getEntry(progress.lastChapter);
    const entry = last || DL.data.kapitel[0];
    if (!entry) {
      return '<p class="home__empty">Daftar Kapitel belum tersedia.</p>';
    }

    const isKapitel = entry.jenis === 'kapitel';
    const when = last && progress.lastChapterAt ? whenText(progress.lastChapterAt) : '';
    const status = last
      ? `Terakhir dibuka ${when || 'sebelumnya'}`
      : 'Belum ada materi yang dibuka. Mulai dari sini!';

    return c.ticket({
      href: '#/materi/' + entry.id,
      tone: 'yellow',
      line: 'blue',
      perforated: true,
      seed: 'lanjutkan',
      className: 'home-continue',
      html: `
        <span class="ticket__kicker">${esc(entry.label)}</span>
        <span class="ticket__title" lang="de">${esc(isKapitel ? entry.judul_de : entry.judul)}</span>
        ${isKapitel && entry.judul_id ? `<span class="ticket__meta">${esc(entry.judul_id)}</span>` : ''}
        <span class="home-continue__status">${status}</span>
        <span class="home-continue__cta">${last ? 'Lanjutkan' : 'Mulai ' + esc(entry.label)} <span aria-hidden="true">›</span></span>`
    });
  }

  function wordCard() {
    const today = new Date();
    const pick = DL.data.wordOfTheDay(today);
    if (!pick) {
      return '<p class="home__empty">Kata hari ini muncul setelah kosakata Kapitel diisi.</p>';
    }

    const word = pick.word;
    const plural = word.jamak
      ? `<p class="word-card__extra">Jamak: <span lang="de">${esc(c.pluralForm(word.jamak))}</span></p>`
      : '';
    const example = word.contoh_de
      ? `<div class="word-card__example">
          <p><span lang="de">${esc(word.contoh_de)}</span> ${c.audioTools({ text: word.contoh_de, meaning: word.contoh_id })}</p>
          ${word.contoh_id ? `<p class="word-card__example-id">${esc(word.contoh_id)}</p>` : ''}
        </div>`
      : '';

    return c.paper({
      variant: 'grid',
      tape: 'stars',
      seed: 'wort-des-tages',
      tilt: '0.6deg',
      className: 'word-card',
      html: `
        <p class="word-card__date" lang="de">${germanDate.format(today)}</p>
        <p class="word-card__term">${c.germanTerm(word)} ${c.audioTools({ text: c.wordSpeech(word), meaning: word.id })}</p>
        ${plural}
        <p class="word-card__meaning">= ${esc(word.id)}</p>
        ${example}
        ${c.speechNote()}
        <a class="word-card__source" href="#/materi/${pick.kapitel.id}">Dari Kapitel ${pick.kapitel.nomor}: <span lang="de">${esc(pick.kapitel.judul_de)}</span> <span aria-hidden="true">›</span></a>`
    });
  }

  function rightPage(profile) {
    const hello = profile ? `Hallo, ${esc(profile.name)}!` : 'Hallo!';
    const warning = DL.data.problems.length
      ? `<p class="home__warning" role="status">Ada masalah di <code>data/lessons.js</code>. Buka Console (F12) untuk detailnya.</p>`
      : '';

    return `
      ${c.sticker('flag', { size: '54px', decorative: true, className: 'home__flag' })}
      <p class="home__hello" lang="de">${hello}</p>
      <p class="home__hello-sub"><span lang="de">Schön, dass du da bist!</span> — Senang kamu ada di sini!</p>
      ${warning}
      <section class="home__block" aria-labelledby="home-continue-title">
        <h2 class="home__label" id="home-continue-title">Lanjutkan belajar</h2>
        ${continueCard(profile)}
      </section>
      <section class="home__block" aria-labelledby="home-word-title">
        <h2 class="home__label" id="home-word-title">Kata hari ini <span class="home__label-de" lang="de">Wort des Tages</span></h2>
        ${wordCard()}
      </section>`;
  }

  /* ---------- Rute ---------- */

  DL.router.add('/beranda', {
    title: 'Beranda',
    nav: null,
    render() {
      const profile = DL.storage.getActiveProfile();
      // Beranda halaman pertama jurnal: "Sebelumnya" nonaktif, "Selanjutnya" ke daftar bab.
      return `
        <div class="home book-stage">
          <div class="book-stage__book">
            ${c.notebook({ left: leftPage(), right: rightPage(profile), className: 'home-notebook' })}
          </div>
          <div class="book-stage__prev">
            ${c.ticketButton({ label: 'Sebelumnya', direction: 'prev', href: '#/beranda', disabled: true })}
          </div>
          <div class="book-stage__next">
            ${c.ticketButton({ label: 'Selanjutnya', direction: 'next', href: '#/materi' })}
          </div>
        </div>`;
    }
  });
})(window.DL = window.DL || {});
