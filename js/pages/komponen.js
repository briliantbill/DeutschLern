/* =========================================================
   DeutschLern — pages/komponen.js
   Style guide #/komponen: semua komponen dekoratif beserta
   cara memanggilnya. Tidak muncul di menu; buka lewat alamat langsung.
   ========================================================= */
(function (DL) {
  'use strict';

  const c = DL.components;

  function section(id, title, code, body) {
    return `
      <section class="kit__section" aria-labelledby="kit-${id}">
        <h2 class="kit__heading" id="kit-${id}"><span class="squiggle">${title}</span></h2>
        <p class="kit__code"><code>${code}</code></p>
        ${body}
      </section>`;
  }

  function subheading(text) {
    return `<h3 class="kit__subheading">${text}</h3>`;
  }

  /* ---------- Kertas ---------- */
  function papers() {
    const samples = [
      { label: 'Polos tua', code: "variant: 'aged', torn: 'both'", de: 'Guten Morgen!', id: 'Selamat pagi!',
        options: { variant: 'aged', torn: 'both' } },
      { label: 'Bergaris + lubang spiral', code: "variant: 'lined', holes: true", de: 'Ich heiße Anna.', id: 'Nama saya Anna.',
        options: { variant: 'lined', holes: true, tape: 'planes-cream' } },
      { label: 'Kotak-kotak', code: "variant: 'grid'", de: 'eins, zwei, drei', id: 'satu, dua, tiga',
        options: { variant: 'grid', torn: 'top', tape: 'rainbow', tapePosition: 'corner' } },
      { label: 'Tepi sobek', code: "torn: 'top' | 'bottom' | 'both'", de: 'Wie geht’s?', id: 'Apa kabar?',
        options: { variant: 'plain', torn: 'both', tape: 'kraft' } },
      { label: 'Sudut terlipat', code: 'folded: true', de: 'Danke schön!', id: 'Terima kasih banyak!',
        options: { variant: 'plain', folded: true } }
    ];

    const cards = samples.map((sample) => c.paper(Object.assign({
      seed: sample.label,
      html: `
        <p class="kit-label">${sample.label}</p>
        <p class="kit-de" lang="de">${sample.de}</p>
        <p class="kit-id">${sample.id}</p>
        <p class="kit-mini"><code>${sample.code}</code></p>`
    }, sample.options))).join('');

    return section('kertas', 'Kertas', 'paper({ variant, holes, torn, folded, tape, tapePosition, html })',
      `<div class="kit__grid">${cards}</div>`);
  }

  /* ---------- Washi tape ---------- */
  function washiTapes() {
    const strip = ([motif, label]) => `
      <div class="kit-washi">
        ${c.washi({ motif, className: 'kit-washi__tape', tilt: c.tilt(motif, 1.5) })}
        <p class="kit-washi__label">${label} <code>${motif}</code></p>
      </div>`;

    const motifs = [
      ['rainbow', 'Garis pelangi'],
      ['dots', 'Polkadot pink'],
      ['planes', 'Pesawat biru muda'],
      ['planes-cream', 'Pesawat krem'],
      ['stars-red', 'Bintang merah'],
      ['stars', 'Bintang warna-warni']
    ];
    const plain = [['kraft', 'Kraft'], ['cream', 'Krem'], ['blue', 'Biru'], ['green', 'Hijau']];

    return section('washi', 'Washi tape', 'washi({ motif, className })', `
      ${subheading('Enam motif')}
      <div class="kit-washi-list">${motifs.map(strip).join('')}</div>
      ${subheading('Warna polos')}
      <div class="kit-washi-list kit-washi-list--plain">${plain.map(strip).join('')}</div>`);
  }

  /* ---------- Tiket ---------- */
  function tickets() {
    const chapters = [
      { tone: 'cream', line: 'red', perforated: true, kicker: 'Kapitel 1', title: 'Hallo!', meta: 'Salam &amp; perkenalan' },
      { tone: 'kraft', perforated: true, kicker: 'Kapitel 2', title: 'Zahlen', meta: 'Angka 0–100' },
      { tone: 'rose', kicker: 'Kapitel 3', title: 'Familie', meta: 'Keluarga' },
      { tone: 'yellow', line: 'blue', kicker: 'Kapitel 4', title: 'Essen &amp; Trinken', meta: 'Makan &amp; minum' },
      { tone: 'gold', kicker: 'Plattform 1', title: 'Plattform 1', meta: 'Kuis campuran' }
    ];

    const cards = chapters.map((chapter) => c.ticket({
      tone: chapter.tone,
      line: chapter.line,
      perforated: chapter.perforated,
      href: '#/materi',
      seed: chapter.kicker,
      html: `
        <span class="ticket__kicker" lang="de">${chapter.kicker}</span>
        <span class="ticket__title" lang="de">${chapter.title}</span>
        <span class="ticket__meta">${chapter.meta} · <em>${chapter.tone}</em></span>`
    })).join('');

    const buttons = `
      <div class="kit-btn-row">
        ${c.ticketButton({ label: 'Sebelumnya', direction: 'prev', tone: 'cream' })}
        ${c.ticketButton({ label: 'Lihat kosakata', direction: 'none', tone: 'kraft', tilt: '-0.5deg' })}
        ${c.ticketButton({ label: 'Ulangi bab', direction: 'none', tone: 'rose', tilt: '0.6deg' })}
        ${c.ticketButton({ label: 'Selanjutnya', direction: 'next', tone: 'yellow' })}
      </div>`;

    const disabled = `
      <div class="kit-btn-row">
        ${c.ticketButton({ label: 'Terkunci', direction: 'none', tone: 'kraft', disabled: true, tilt: '-0.8deg' })}
        ${c.ticketButton({ label: 'Selanjutnya', direction: 'next', href: '#/materi', disabled: true })}
      </div>`;

    const states = `
      <ul class="kit-states">
        <li><strong>Hover</strong> — arahkan mouse: tiket sedikit terangkat.</li>
        <li><strong>Active</strong> — saat diklik: tiket tertekan ke bawah.</li>
        <li><strong>Focus</strong> — tekan Tab: muncul garis putus-putus biru.</li>
        <li><strong>Disabled</strong> — pudar, tidak bisa diklik maupun difokus.</li>
      </ul>`;

    return section('tiket', 'Tiket',
      'ticket({ tone, line, perforated, href, html }) · ticketButton({ label, direction, tone, href, disabled })', `
      ${subheading('Kartu (5 warna, bisa diklik; emas khusus Plattform)')}
      <div class="kit__grid kit__grid--tickets">${cards}</div>
      ${subheading('Tombol (4 warna)')}
      ${buttons}
      ${subheading('Tombol nonaktif')}
      ${disabled}
      ${states}`);
  }

  /* ---------- Polaroid ---------- */
  function polaroids() {
    return section('polaroid', 'Polaroid', 'polaroid({ src, alt, caption, clip, tape })', `
      <div class="kit-row">
        ${c.polaroid({ src: 'assets/stickers/brandenburger-tor.svg', alt: 'Gerbang Brandenburg', contain: true, caption: 'Berlin', captionLang: 'de', clip: true })}
        ${c.polaroid({ caption: 'Foto pertama kita', seed: 'kosong', clip: true })}
      </div>`);
  }

  /* ---------- Stiker, cap, gelembung ---------- */
  function stickers() {
    const all = Object.keys(c.stickers).map((name) => `
      <figure class="kit-sticker">
        ${c.sticker(name, { size: '84px' })}
        <figcaption><code>${c.stickers[name].file}</code></figcaption>
      </figure>`).join('');

    const highlight = `
      <div class="kit-row kit-row--stamp">
        ${c.sticker('stamp', { size: '170px', tilt: '-4deg' })}
        <div class="kit-bubbles">
          ${c.speechBubble({ text: 'Hallo!', lang: 'de' })}
          ${c.speechBubble({ text: 'Danke!', lang: 'de', tone: 'pink' })}
          ${c.speechBubble({ text: 'Tschüss!', lang: 'de', tone: 'blue' })}
        </div>
      </div>`;

    return section('stiker', 'Stiker, cap &amp; gelembung bicara',
      'sticker(name, { size, decorative }) · speechBubble({ text, tone, lang })', `
      ${subheading('Cap “Travel Stamp” &amp; gelembung bicara')}
      ${highlight}
      ${subheading('Semua stiker')}
      <div class="kit-stickers">${all}</div>`);
  }

  /* ---------- Buku catatan ---------- */
  function notebookDemo() {
    const left = `
      <h3 class="kit-nb__title">Belajar Bahasa Jerman</h3>
      <p class="kit-nb__hand"><span class="squiggle" lang="de">Willkommen!</span></p>
      <div class="kit-nb__scene">
        <div class="kit-nb__bear">
          ${c.speechBubble({ text: 'Hallo!', lang: 'de', className: 'kit-nb__hallo' })}
          ${c.sticker('bear', { size: '140px' })}
        </div>
        <div class="kit-nb__props">
          ${c.sticker('pretzel', { size: '84px' })}
          ${c.sticker('tor', { size: '150px' })}
          ${c.speechBubble({ text: 'Danke!', lang: 'de', tone: 'pink' })}
        </div>
      </div>`;

    const right = `
      ${c.sticker('flag', { size: '58px', className: 'kit-nb__flag', decorative: true })}
      <h3 class="kit-nb__title">Bab 1: Perkenalan <span class="kit-nb__sub" lang="de">(Hallo &amp; Wie geht’s?)</span></h3>
      <ul class="kit-nb__list">
        <li><strong lang="de">Hallo!</strong> — Halo!</li>
        <li><strong lang="de">Wie geht’s?</strong> — Apa kabar?</li>
        <li><strong lang="de">Mir geht’s gut, danke.</strong> — Kabar saya baik, terima kasih.</li>
        <li><strong lang="de">Ich heiße …</strong> — Nama saya …</li>
      </ul>
      <p class="kit-nb__hand kit-nb__hand--small">Ayo latihan bersama!</p>`;

    const tabs = c.washiTabs({
      label: 'Contoh tab washi',
      tabs: [
        { key: 'wortschatz', label: 'Wortschatz', lang: 'de' },
        { key: 'grammatik', label: 'Grammatik', lang: 'de' },
        { key: 'dialog', label: 'Dialog', lang: 'de' },
        { key: 'aussprache', label: 'Aussprache', lang: 'de' },
        { key: 'landeskunde', label: 'Landeskunde', lang: 'de' }
      ]
    });

    return section('buku', 'Buku catatan spiral', 'notebook({ left, right }) · washiTabs({ label, tabs }) · bookRef({ halaman, aufgabe, track })', `
      ${tabs}
      ${c.notebook({ left, right })}
      <p class="kit-ref-row">${c.bookRef({ halaman: 12, aufgabe: '4a', track: '1.1' })} ${c.bookRef({ aufgabe: '1/2a' })}</p>
      <div class="ticket-nav kit-ticket-nav">
        ${c.ticketButton({ label: 'Sebelumnya', direction: 'prev' })}
        ${c.ticketButton({ label: 'Selanjutnya', direction: 'next' })}
      </div>`);
  }

  /* ---------- Audio pengucapan ---------- */
  function audioDemo() {
    const words = [
      { de: 'Name', artikel: 'der', id: 'nama' },
      { de: 'Sprache', artikel: 'die', id: 'bahasa' },
      { de: 'Land', artikel: 'das', id: 'negara' },
      { de: 'heißen', artikel: null, id: 'bernama', contoh_de: 'Ich heiße Anna.', contoh_id: 'Nama saya Anna.' }
    ].map((word) => `
      <li class="vocab${word.artikel ? ' vocab--' + word.artikel : ''}">
        <p class="vocab__head">
          ${c.germanTerm(word, { className: 'vocab__term' })}
          ${c.audioTools({ text: c.wordSpeech(word), meaning: word.id })}
          <span class="vocab__meaning">= ${word.id}</span>
        </p>
        ${word.contoh_de ? `
          <p class="vocab__example">
            <span class="vocab__example-de">
              <span lang="de">${word.contoh_de}</span>
              ${c.audioTools({ text: word.contoh_de, meaning: word.contoh_id })}
            </span>
            <span class="vocab__example-id">${word.contoh_id}</span>
          </p>` : ''}
      </li>`).join('');

    const lines = [
      ['a', 'Anna', 'Guten Tag! Wie heißen Sie?', 'Selamat siang! Siapa nama Anda?'],
      ['b', 'Jonas', 'Ich heiße Jonas Weber. Und Sie?', 'Nama saya Jonas Weber. Kalau Anda?'],
      ['a', 'Anna', 'Ich bin Anna. Ich komme aus Indonesien.', 'Saya Anna. Saya berasal dari Indonesia.']
    ].map(([voice, who, de, id]) => `
      <li class="dialogue__line dialogue__line--${voice}">
        <span class="dialogue__who">${who}</span>
        <span class="dialogue__de" lang="de">${de}</span>
        ${c.audioTools({ text: de, meaning: id })}
        <span class="dialogue__id">${id}</span>
      </li>`).join('');

    return section('audio', 'Audio pengucapan',
      'audioTools({ text, meaning }) · speakButton({ text }) · practiceButton({ text, meaning }) · speedControl() · audioBar()', `
      ${c.audioBar()}
      <div class="kit-audio">
        ${c.paper({ seed: 'audio-kata', variant: 'grid', torn: 'none', html: `
          <p class="kit-label">Kosakata &amp; contoh kalimat</p>
          <ul class="vocab-list">${words}</ul>` })}
        ${c.paper({ seed: 'audio-dialog', variant: 'lined', torn: 'none', html: `
          <p class="kit-label">Baris dialog</p>
          <ol class="dialogue">${lines}</ol>` })}
      </div>`);
  }

  DL.router.add('/komponen', {
    title: 'Style Guide',
    nav: null,
    render() {
      const intro = c.paper({
        tape: 'stars',
        seed: 'katalog',
        tilt: '-0.6deg',
        className: 'kit__intro',
        html: `
          <h1 class="kit__title" id="page-title" tabindex="-1">Style Guide</h1>
          <p class="kit__lead">Semua komponen DeutschLern di satu halaman, lengkap dengan cara memanggilnya dari <code>DL.components</code>. Halaman ini tidak muncul di menu.</p>`
      });

      return `
        <div class="kit">
          ${intro}
          ${papers()}
          ${washiTapes()}
          ${tickets()}
          ${polaroids()}
          ${stickers()}
          ${audioDemo()}
          ${notebookDemo()}
        </div>`;
    }
  });
})(window.DL = window.DL || {});
