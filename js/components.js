/* =========================================================
   DeutschLern — components.js
   Fungsi kecil yang mengembalikan string HTML untuk komponen
   yang dipakai berulang. Gayanya ada di css/components.css,
   contoh pemakaiannya di halaman uji #/komponen.

   Aturan: parameter bernama `html`, `left`, `right`, dan
   `actionHtml` berisi HTML jadi (tidak di-escape). Parameter
   teks lain selalu di-escape.
   ========================================================= */
(function (DL) {
  'use strict';

  /* ---------- Utilitas ---------- */

  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  /** Amankan teks sebelum disisipkan ke HTML. */
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
  }

  /** Hash FNV-1a: teks yang sama selalu menghasilkan angka yang sama. */
  function hashString(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  /**
   * Kemiringan "acak" yang tetap: seed yang sama selalu menghasilkan sudut
   * yang sama, jadi kertas & stiker tidak berubah posisi setiap render.
   * @param {string} seed
   * @param {number} [max=2] Batas sudut dalam derajat (hasil: −max s/d +max).
   * @returns {string} mis. "-1.27deg"
   */
  function tilt(seed, max) {
    const limit = typeof max === 'number' ? max : 2;
    const unit = hashString(String(seed)) / 4294967295;
    return ((unit * 2 - 1) * limit).toFixed(2) + 'deg';
  }

  function classNames(list) {
    return list.filter(Boolean).join(' ');
  }

  /**
   * Teks biasa dengan penanda Jerman: *Ich heiße* → <b lang="de">Ich heiße</b>.
   * Dipakai untuk "tujuan" dan "penjelasan" di data/lessons.js.
   */
  function richText(text) {
    return escapeHtml(text).replace(/\*([^*]+)\*/g, '<b class="de-mark" lang="de">$1</b>');
  }

  /**
   * Kata Jerman siap tampil. Kata benda mendapat artikel dan warna
   * sesuai artikelnya (der = biru, die = merah, das = hijau).
   * @param {Object} word  Item kosakata: { de, artikel }
   * @param {Object} [options]
   * @param {string} [options.className]
   */
  function germanTerm(word, options = {}) {
    const classes = classNames(['term', word.artikel && 'term--' + word.artikel, options.className]);
    const article = word.artikel
      ? `<span class="article article--${word.artikel}">${word.artikel}</span> `
      : '';
    return `<span class="${classes}" lang="de">${article}<span class="term__word">${escapeHtml(word.de)}</span></span>`;
  }

  /** Bentuk jamak siap tampil: "Namen" atau "die Namen" → "die Namen"; "-n" (gaya Wortliste) tetap. */
  function pluralForm(jamak) {
    const text = String(jamak).trim();
    return /^(die\s|[-–¨])/i.test(text) ? text : 'die ' + text;
  }

  /**
   * Referensi ke buku, mis. "Kursbuch hlm. 12 · 4a · Track 1.1".
   * @param {Object} ref
   * @param {number|string} [ref.halaman]  Halaman Kursbuch.
   * @param {string} [ref.aufgabe]         "4a", atau "1/2a" = Kapitel 1, Aufgabe 2a.
   * @param {string} [ref.track]           Nomor track audio.
   * @returns {string} HTML; kosong bila tidak ada data.
   */
  function bookRef(ref) {
    const parts = /^(\d+)\/(.+)$/.exec(ref.aufgabe || '');
    const kapitel = parts ? parts[1] : null;
    const aufgabe = parts ? parts[2] : ref.aufgabe;
    const hasPage = ref.halaman != null && ref.halaman !== '';
    if (!hasPage && !kapitel && !aufgabe && !ref.track) return '';

    let where = 'Kursbuch';
    if (hasPage) where += ' hlm. ' + ref.halaman;
    else if (kapitel) where += ' Kap. ' + kapitel;
    const text = [where, aufgabe, ref.track && 'Track ' + ref.track].filter(Boolean).join(' · ');
    return `<span class="book-ref">${escapeHtml(text)}</span>`;
  }

  /* ---------- Cap status materi ---------- */

  const STATUS_LABELS = Object.freeze({
    kosong: 'Belum diisi',
    belum: 'Belum dibuka',
    sedang: 'Sedang dipelajari',
    selesai: 'Selesai'
  });

  /**
   * @param {string} status  kosong | belum | sedang | selesai
   * @param {string} [attrs] Atribut tambahan (HTML jadi), mis. ' data-chapter-status'.
   */
  function statusStamp(status, attrs) {
    return `<span class="status-stamp status-stamp--${status}"${attrs || ''}>${STATUS_LABELS[status]}</span>`;
  }

  /* ---------- Stiker ----------
     Semua path stiker ada di sini. Saat aset asli datang (mis. PNG),
     cukup ganti nama file di daftar ini. */

  const STICKER_DIR = 'assets/stickers/';
  const STICKERS = Object.freeze({
    bear: { file: 'bear-mascot.svg', alt: 'Maskot beruang DeutschLern bersyal hitam-merah-emas' },
    pretzel: { file: 'pretzel.svg', alt: 'Pretzel (Brezel)' },
    tor: { file: 'brandenburger-tor.svg', alt: 'Gerbang Brandenburg (Brandenburger Tor) di Berlin' },
    flag: { file: 'flag-de.svg', alt: 'Bendera Jerman' },
    stamp: { file: 'travel-stamp.svg', alt: 'Cap perjalanan bertuliskan Travel Stamp Deutschland' },
    compass: { file: 'compass.svg', alt: 'Kompas' },
    pinRed: { file: 'pin-red.svg', alt: 'Pin merah' },
    pinYellow: { file: 'pin-yellow.svg', alt: 'Paku payung kuning' },
    paperclip: { file: 'paperclip.svg', alt: 'Klip kertas' },
    star: { file: 'star.svg', alt: 'Bintang' },
    heart: { file: 'heart.svg', alt: 'Hati' },
    // Ikon Kapitel
    apple: { file: 'apple.svg', alt: 'Apel merah' },
    clock: { file: 'clock.svg', alt: 'Jam weker menunjukkan pukul setengah sembilan' },
    house: { file: 'house.svg', alt: 'Rumah kayu bergaya Jerman (Fachwerkhaus)' },
    coffee: { file: 'coffee-mug.svg', alt: 'Cangkir kopi bergaris hitam-merah-emas' },
    bag: { file: 'shopping-bag.svg', alt: 'Kantong belanja berisi roti dan sayur' },
    train: { file: 'train.svg', alt: 'Kereta merah di atas rel' },
    // Tombol audio
    speaker: { file: 'speaker.svg', alt: 'Speaker' },
    microphone: { file: 'microphone.svg', alt: 'Mikrofon' }
  });

  /**
   * Stiker dengan pinggiran putih.
   * @param {string} name Kunci di STICKERS, mis. "bear".
   * @param {Object} [options]
   * @param {string} [options.size]        Lebar, mis. "120px" (default 96px).
   * @param {boolean} [options.decorative] true = hiasan saja (alt kosong).
   * @param {string} [options.alt]         Teks alternatif pengganti bawaan.
   * @param {string} [options.tilt]        Kemiringan; default dari nama + seed.
   * @param {string} [options.seed]
   * @param {string} [options.className]
   */
  function sticker(name, options = {}) {
    const info = STICKERS[name];
    if (!info) {
      console.warn('[components] Stiker tidak dikenal:', name);
      return '';
    }
    const alt = options.decorative ? '' : (options.alt || info.alt);
    const style = ['--tilt: ' + (options.tilt || tilt(name + (options.seed || '')))];
    if (options.size) style.push('--sticker-size: ' + options.size);

    return `<img class="${classNames(['sticker', options.className])}" src="${STICKER_DIR + info.file}" alt="${escapeHtml(alt)}" style="${style.join('; ')}" draggable="false">`;
  }

  /* ---------- Audio pengucapan ----------
     Hanya membuat HTML. Kliknya ditangani js/speech.js dan js/practice.js. */

  /** Teks siap diucapkan: "die Eltern (Pl.)" → "die Eltern", "Ich heiße …" → "Ich heiße". */
  function speakableText(text) {
    return String(text == null ? '' : text)
      .replace(/\*/g, '')
      .replace(/\([^)]*\)/g, ' ')
      .replace(/_{2,}|…|\.{3,}/g, ' ')
      .replace(/\s*\/\s*/g, ', ')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.!?;:])/g, '$1')
      .replace(/^[,\s]+|[,\s]+$/g, '');
  }

  /** Yang diucapkan untuk satu kosakata: kata benda selalu bersama artikelnya. */
  function wordSpeech(word) {
    return word.artikel ? word.artikel + ' ' + word.de : word.de;
  }

  /**
   * Tombol stiker speaker: memutar teks Jerman.
   * @param {Object} options
   * @param {string} options.text
   * @param {string} [options.className]
   */
  function speakButton(options) {
    const text = speakableText(options.text);
    if (!text) return '';
    return `
      <button class="${classNames(['say-btn', options.className])}" type="button" data-speak="${escapeHtml(text)}" aria-label="Dengarkan: ${escapeHtml(text)}" title="Dengarkan">
        ${sticker('speaker', { decorative: true, seed: text })}
      </button>`;
  }

  /**
   * Tombol stiker mikrofon: membuka modal Latih ucapan.
   * @param {Object} options
   * @param {string} options.text
   * @param {string} [options.meaning]  Arti dalam Bahasa Indonesia, tampil di modal.
   * @param {string} [options.className]
   */
  function practiceButton(options) {
    const text = speakableText(options.text);
    if (!text) return '';
    const meaning = options.meaning ? ` data-practice-meaning="${escapeHtml(options.meaning)}"` : '';
    return `
      <button class="${classNames(['say-btn', options.className])}" type="button" data-practice="${escapeHtml(text)}"${meaning} aria-label="Latih ucapan: ${escapeHtml(text)}" title="Latih ucapan">
        ${sticker('microphone', { decorative: true, seed: text })}
      </button>`;
  }

  /**
   * Sepasang tombol speaker + mikrofon untuk ditaruh setelah teks Jerman.
   * @param {Object} options
   * @param {string} options.text
   * @param {string} [options.meaning]
   */
  function audioTools(options) {
    const buttons = speakButton(options) + practiceButton(options);
    return buttons ? `<span class="say-tools">${buttons}</span>` : '';
  }

  let speedControlCount = 0;

  /** Pilihan kecepatan suara Normal/Lambat, tersimpan per profil. */
  function speedControl() {
    speedControlCount += 1;
    const id = 'speech-speed-' + speedControlCount;
    const current = DL.storage.getSpeechSpeed();
    const option = (value, label) => `
      <label class="speed-control__option">
        <input type="radio" name="${id}" value="${value}" data-speech-speed${current === value ? ' checked' : ''}>
        <span>${label}</span>
      </label>`;
    return `
      <div class="speed-control" role="radiogroup" aria-labelledby="${id}">
        <span class="speed-control__label" id="${id}">Kecepatan suara</span>
        <span class="speed-control__options">${option('normal', 'Normal')}${option('lambat', 'Lambat')}</span>
      </div>`;
  }

  /** Catatan bila browser tidak mendukung suara/mikrofon. Kosong: tersembunyi. */
  function speechNote() {
    const text = DL.speech.noteText();
    return `<p class="speech-note" data-speech-note${text ? '' : ' hidden'}>${escapeHtml(text)}</p>`;
  }

  /** Baris pengantar di atas materi: kecepatan, arti kedua stiker, dan catatan dukungan. */
  function audioBar() {
    return `
      <div class="audio-bar">
        ${speedControl()}
        <p class="audio-bar__legend">
          <span class="audio-bar__key audio-bar__key--speak">${sticker('speaker', { decorative: true })} dengarkan</span>
          <span class="audio-bar__key audio-bar__key--practice">${sticker('microphone', { decorative: true })} latih ucapan</span>
        </p>
        ${speechNote()}
      </div>`;
  }

  /* ---------- Washi tape ---------- */

  /**
   * Potongan washi tape (dekorasi, disembunyikan dari pembaca layar).
   * @param {Object} [options]
   * @param {string} [options.motif] Motif: rainbow | dots | planes | planes-cream | stars-red | stars
   *                                 Polos: kraft (default) | cream | blue | green
   * @param {string} [options.tilt]
   * @param {string} [options.className] Kelas yang mengatur ukuran & posisi.
   */
  function washi(options = {}) {
    const style = options.tilt ? ` style="--tilt: ${options.tilt}"` : '';
    return `<span class="${classNames(['washi', 'washi--' + (options.motif || 'kraft'), options.className])}"${style} aria-hidden="true"></span>`;
  }

  /* ---------- Kertas ---------- */

  /**
   * Lembar kertas.
   * @param {Object} options
   * @param {string} options.html             Isi kertas (HTML).
   * @param {string} [options.variant]        plain | lined | grid | aged
   * @param {string} [options.torn]           bottom (default) | top | both | none
   * @param {boolean} [options.holes]         Lubang spiral di tepi kiri.
   * @param {boolean} [options.folded]        Sudut kanan atas terlipat (pakai torn bottom/none).
   * @param {string} [options.tape]           Motif washi, mis. "kraft". Kosong = tanpa tape.
   * @param {string} [options.tapePosition]   top (default) | corner
   * @param {string} [options.seed]           Penentu kemiringan & pola sobek.
   * @param {string} [options.tilt]           Kemiringan tetap (mengalahkan seed).
   * @param {string} [options.tag]            Elemen pembungkus (default div).
   * @param {string} [options.className]
   */
  function paper(options = {}) {
    const seed = String(options.seed || options.html || 'paper');
    const torn = options.torn || 'bottom';
    const tag = options.tag || 'div';
    const tapePosition = options.tapePosition || 'top';

    const classes = classNames([
      'paper',
      'paper--' + (options.variant || 'plain'),
      torn !== 'none' && 'paper--torn-' + torn,
      options.holes && 'paper--holes',
      options.folded && 'paper--folded',
      options.className
    ]);
    const style = `--tilt: ${options.tilt || tilt(seed)}; --torn-offset: ${hashString('torn' + seed) % 480}px`;

    // Tape atas ikut miring acak; tape sudut memakai sudut dari CSS.
    const tape = options.tape
      ? washi({
        motif: options.tape,
        className: 'paper__tape paper__tape--' + tapePosition,
        tilt: tapePosition === 'top' ? tilt('tape' + seed, 3) : ''
      })
      : '';

    return `<${tag} class="${classes}" style="${style}">${tape}<div class="paper__sheet">${options.html || ''}</div></${tag}>`;
  }

  /* ---------- Tiket ---------- */

  /**
   * Kartu tiket vintage (tepi bergerigi, garis bingkai ganda).
   * @param {Object} options
   * @param {string} options.html          Isi tiket (HTML). Gunakan .ticket__kicker,
   *                                       .ticket__title, .ticket__meta untuk kartu bab.
   * @param {string} [options.tone]        cream (default) | kraft | rose | yellow
   * @param {string} [options.line]        ink (default) | red | blue
   * @param {boolean} [options.perforated] Garis sobekan putus-putus di kedua ujung.
   * @param {string} [options.href]        Jika diisi, tiket menjadi tautan.
   * @param {string} [options.seed]
   * @param {string} [options.tilt]
   * @param {string} [options.className]
   */
  function ticket(options = {}) {
    const classes = classNames([
      'ticket',
      'ticket--' + (options.tone || 'cream'),
      options.line && options.line !== 'ink' && 'ticket--line-' + options.line,
      options.perforated && 'ticket--perforated',
      options.className
    ]);
    const style = `--tilt: ${options.tilt || tilt(options.seed || options.html || 'ticket', 1.5)}`;
    const body = `<span class="ticket__body">${options.html || ''}</span>`;

    if (options.href) {
      return `<a class="${classes}" href="${escapeHtml(options.href)}" style="${style}">${body}</a>`;
    }
    return `<div class="${classes}" style="${style}">${body}</div>`;
  }

  /**
   * Tombol berbentuk tiket, mis. "‹ Sebelumnya" dan "Selanjutnya ›".
   * State hover, active, focus, dan disabled diatur di CSS (.ticket--btn).
   * @param {Object} options
   * @param {string} options.label
   * @param {string} [options.direction]  next (default, panah kanan) | prev (panah kiri) | none
   * @param {string} [options.href]       Ada = <a>, tidak ada = <button type="button">.
   * @param {string} [options.tone]       cream | kraft | rose | yellow. Default: prev = cream, lainnya = yellow.
   * @param {boolean} [options.disabled]  Tombol nonaktif. Untuk tautan: href dibuang + aria-disabled.
   * @param {Object} [options.attrs]      Atribut tambahan, mis. { 'data-action': 'next' }.
   * @param {string} [options.tilt]
   */
  function ticketButton(options = {}) {
    const direction = options.direction || 'next';
    const isPrev = direction === 'prev';
    const tone = options.tone || (isPrev ? 'cream' : 'yellow');
    const classes = classNames(['ticket', 'ticket--btn', 'ticket--' + tone, options.className]);
    const style = `--tilt: ${options.tilt || (isPrev ? '-1deg' : '1deg')}`;
    const extra = Object.entries(options.attrs || {})
      .map(([key, value]) => ` ${key}="${escapeHtml(value)}"`)
      .join('');

    const label = `<span class="ticket__label">${escapeHtml(options.label)}</span>`;
    let inner = label;
    if (direction !== 'none') {
      const arrow = `<span class="ticket__arrow" aria-hidden="true">${isPrev ? '‹' : '›'}</span>`;
      inner = isPrev ? arrow + label : label + arrow;
    }
    const body = `<span class="ticket__body">${inner}</span>`;

    if (options.href) {
      // Tautan nonaktif tidak punya href, jadi tidak bisa diklik maupun difokus.
      const target = options.disabled
        ? ' role="link" aria-disabled="true"'
        : ` href="${escapeHtml(options.href)}"`;
      return `<a class="${classes}"${target} style="${style}"${extra}>${body}</a>`;
    }
    const disabled = options.disabled ? ' disabled' : '';
    return `<button class="${classes}" type="button" style="${style}"${extra}${disabled}>${body}</button>`;
  }

  /* ---------- Tab washi tape ---------- */

  /**
   * Deretan tab berbentuk potongan washi tape. Tombol biasa dengan aria-current,
   * karena panah kiri/kanan sudah dipakai untuk membalik halaman buku.
   * @param {Object} options
   * @param {Array<{key: string, label: string, lang: (string|undefined), hint: (string|undefined)}>} options.tabs
   * @param {string} options.label  Nama deretan tab untuk pembaca layar.
   */
  function washiTabs(options) {
    const tabs = options.tabs.map((tab, index) => {
      const lang = tab.lang ? ` lang="${escapeHtml(tab.lang)}"` : '';
      const hint = tab.hint ? ` title="${escapeHtml(tab.hint)}"` : '';
      return `
        <button class="washi-tab washi-tab--${index + 1}" type="button" data-tab="${escapeHtml(tab.key)}"${hint}>
          ${washi({ motif: 'cream', className: 'washi-tab__tape', tilt: tilt('tab' + tab.key, 1.5) })}
          <span class="washi-tab__label"${lang}>${escapeHtml(tab.label)}</span>
        </button>`;
    }).join('');
    return `<nav class="washi-tabs" aria-label="${escapeHtml(options.label)}">${tabs}</nav>`;
  }

  /* ---------- Polaroid ---------- */

  /**
   * Bingkai polaroid dengan tape di sudut.
   * @param {Object} [options]
   * @param {string} [options.src]          Gambar foto. Kosong = area kosong bertulisan.
   * @param {string} [options.alt]          Wajib diisi bila foto bermakna.
   * @param {boolean} [options.contain]     Gambar dimuat utuh (cocok untuk stiker).
   * @param {string} [options.placeholder]  Tulisan di area kosong.
   * @param {string} [options.caption]      Tulisan tangan di bawah foto.
   * @param {string} [options.captionLang]  mis. "de" bila keterangan berbahasa Jerman.
   * @param {boolean} [options.clip]        Tambah klip kertas di atas.
   * @param {boolean} [options.tape]        false = tanpa tape.
   * @param {string} [options.seed]
   * @param {string} [options.tilt]
   * @param {string} [options.className]
   */
  function polaroid(options = {}) {
    const seed = options.seed || options.caption || options.src || 'polaroid';
    const photo = options.src
      ? `<img src="${escapeHtml(options.src)}" alt="${escapeHtml(options.alt || '')}"${options.contain ? ' class="is-contain"' : ''}>`
      : `<span class="polaroid__empty">${escapeHtml(options.placeholder || 'Tempel foto di sini')}</span>`;
    const lang = options.captionLang ? ` lang="${escapeHtml(options.captionLang)}"` : '';
    const caption = options.caption
      ? `<figcaption class="polaroid__caption"${lang}>${escapeHtml(options.caption)}</figcaption>`
      : '<div class="polaroid__caption" aria-hidden="true"></div>';
    const tapes = options.tape === false
      ? ''
      : washi({ motif: 'cream', className: 'polaroid__tape polaroid__tape--tr' }) +
        washi({ motif: 'cream', className: 'polaroid__tape polaroid__tape--bl' });
    const clip = options.clip ? sticker('paperclip', { className: 'polaroid__clip', decorative: true, tilt: '-8deg' }) : '';

    return `
      <figure class="${classNames(['polaroid', options.className])}" style="--tilt: ${options.tilt || tilt(seed)}">
        ${clip}${tapes}
        <div class="polaroid__photo">${photo}</div>
        ${caption}
      </figure>`;
  }

  /* ---------- Gelembung bicara ---------- */

  /**
   * @param {Object} options
   * @param {string} options.text
   * @param {string} [options.tone]  yellow (default) | pink | blue
   * @param {string} [options.lang]  mis. "de" untuk teks Jerman.
   * @param {string} [options.tilt]
   * @param {string} [options.className]
   */
  function speechBubble(options = {}) {
    const lang = options.lang ? ` lang="${escapeHtml(options.lang)}"` : '';
    return `<span class="${classNames(['bubble', 'bubble--' + (options.tone || 'yellow'), options.className])}" style="--tilt: ${options.tilt || tilt(options.text)}"${lang}>${escapeHtml(options.text)}</span>`;
  }

  /* ---------- Buku catatan spiral ---------- */

  /**
   * Buku terbuka dua halaman. Di layar ≤ 879px menjadi satu halaman.
   * @param {Object} options
   * @param {string} options.left   Isi halaman kiri (HTML).
   * @param {string} options.right  Isi halaman kanan (HTML).
   * @param {string} [options.className]
   */
  function notebook(options = {}) {
    return `
      <div class="${classNames(['notebook', options.className])}">
        <div class="notebook__page notebook__page--left">${options.left || ''}</div>
        <div class="notebook__spiral" aria-hidden="true"></div>
        <div class="notebook__page notebook__page--right">${options.right || ''}</div>
      </div>`;
  }

  /* ---------- Halaman sementara ---------- */

  /**
   * Halaman sementara: kertas berisi judul, satu kata Jerman beserta
   * artinya, dan catatan tulisan tangan.
   * @param {Object} options
   * @param {string} options.title        Judul halaman (Bahasa Indonesia), menjadi <h1>.
   * @param {string} options.de           Kata atau frasa Jerman.
   * @param {string} options.meaning      Arti dalam Bahasa Indonesia.
   * @param {string} options.note         Catatan tulisan tangan.
   * @param {string} [options.tilt]       Kemiringan kertas (−2deg s/d 2deg).
   * @param {string} [options.actionHtml] HTML tambahan di bawah catatan.
   */
  function pagePlaceholder(options) {
    const actions = options.actionHtml
      ? `<div class="placeholder__actions">${options.actionHtml}</div>`
      : '';
    const body = `
      <h1 class="placeholder__title" id="page-title" tabindex="-1">${escapeHtml(options.title)}</h1>
      <span class="flag-rule" aria-hidden="true"></span>
      <p class="placeholder__de">
        <span lang="de">${escapeHtml(options.de)}</span>
        <span class="placeholder__meaning">= ${escapeHtml(options.meaning)}</span>
      </p>
      <p class="placeholder__note">${escapeHtml(options.note)}</p>
      ${actions}`;

    return `
      <section class="placeholder" aria-labelledby="page-title">
        ${paper({ html: body, tape: 'kraft', seed: options.title, tilt: options.tilt, className: 'placeholder__paper' })}
      </section>`;
  }

  DL.components = {
    escapeHtml,
    richText,
    germanTerm,
    pluralForm,
    bookRef,
    statusStamp,
    tilt,
    stickers: STICKERS,
    sticker,
    speakableText,
    wordSpeech,
    speakButton,
    practiceButton,
    audioTools,
    speedControl,
    speechNote,
    audioBar,
    washi,
    paper,
    ticket,
    ticketButton,
    washiTabs,
    polaroid,
    speechBubble,
    notebook,
    pagePlaceholder
  };
})(window.DL = window.DL || {});
