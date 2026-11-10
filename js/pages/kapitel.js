/* =========================================================
   DeutschLern — pages/kapitel.js
   Halaman satu Kapitel (#/materi/k1): buku terbuka (js/book.js) dengan
   tab washi Wortschatz · Grammatik · Dialog · Aussprache · Landeskunde.
   Tab melompat ke bagiannya; tombol tiket, panah keyboard, dan geser
   membalik halaman. Setiap kosakata, dialog, dan grammar menampilkan
   referensi Kursbuch. Kosakata, contoh kalimat, dan baris dialog punya
   tombol audio (js/speech.js, js/practice.js). Mode Guru menampilkan
   tips_guru & kunci jawaban.
   ========================================================= */
(function (DL) {
  'use strict';

  const c = DL.components;
  const esc = c.escapeHtml;

  const WORDS_PER_PAGE = 6;
  const SECTIONS = [
    { key: 'wortschatz', tab: 'Wortschatz', title: 'Kosakata' },
    { key: 'grammatik', tab: 'Grammatik', title: 'Catatan grammar' },
    { key: 'dialog', tab: 'Dialog', title: 'Percakapan' },
    { key: 'aussprache', tab: 'Aussprache', title: 'Pelafalan' },
    { key: 'landeskunde', tab: 'Landeskunde', title: 'Wawasan budaya' }
  ];

  function pageTitle(section) {
    return `<h2 class="book-page__title">${section.title} <span class="book-page__de" lang="de">${section.tab}</span></h2>`;
  }

  /** Kotak ringkasan dari daftar isi buku. */
  function note(label, lines) {
    if (!lines.length) return '';
    return `
      <div class="book-note">
        <p class="book-note__label">${esc(label)}</p>
        ${lines.map((line) => `<p class="book-note__text">${c.richText(line)}</p>`).join('')}
      </div>`;
  }

  function emptyText(entry) {
    return `
      <p class="book-page__empty">Bagian ini belum diisi.</p>
      <p>${c.bookRef({ halaman: entry.halaman_buku })}</p>`;
  }

  /** Sisi kosong lawan halaman ganjil: ruang catatan, dilewati di HP. */
  function fillerPage(section) {
    return {
      section: section.key,
      label: '',
      filler: true,
      html: `
        <div class="notes-page">
          <p class="notes-page__hand" lang="de">Platz für Notizen</p>
          <p class="notes-page__id">Ruang untuk catatanmu sendiri.</p>
        </div>`
    };
  }

  /** Tiap bagian mulai dari halaman kiri, jadi jumlah halamannya harus genap. */
  function evenPages(pages, section) {
    return pages.length % 2 ? pages.concat(fillerPage(section)) : pages;
  }

  /* ---------- Wortschatz ---------- */

  function vocabItem(word) {
    const star = word.wichtig
      ? c.sticker('star', { alt: 'Kata penting', className: 'vocab__star', seed: word.de, tilt: '-6deg' })
      : '';
    const plural = word.jamak
      ? `<span class="vocab__info">jamak: <span lang="de">${esc(c.pluralForm(word.jamak))}</span></span>`
      : '';
    const example = word.contoh_de
      ? `<p class="vocab__example">
          <span class="vocab__example-de">
            <span lang="de">${esc(word.contoh_de)}</span>
            ${c.audioTools({ text: word.contoh_de, meaning: word.contoh_id })}
          </span>
          ${word.contoh_id ? `<span class="vocab__example-id">${esc(word.contoh_id)}</span>` : ''}
        </p>`
      : '';
    const ref = c.bookRef({ halaman: word.halaman, aufgabe: word.aufgabe });

    return `
      <li class="vocab${word.artikel ? ' vocab--' + word.artikel : ''}">
        <p class="vocab__head">
          ${star}
          ${c.germanTerm(word, { className: 'vocab__term' })}
          ${c.audioTools({ text: c.wordSpeech(word), meaning: word.id })}
          <span class="vocab__meaning">= ${esc(word.id)}</span>
          ${plural}
          ${ref ? `<span class="vocab__ref">${ref}</span>` : ''}
        </p>
        ${example}
      </li>`;
  }

  function vocabPages(entry, section, onlyWichtig) {
    const words = onlyWichtig ? entry.kosakata.filter((word) => word.wichtig) : entry.kosakata;
    const notes = note('Topik di buku', entry.ringkasan.wortschatz) + note('Strategi belajar', entry.ringkasan.strategie);

    if (!words.length) {
      return evenPages([{ section: section.key, label: section.tab, html: pageTitle(section) + notes + emptyText(entry) }], section);
    }

    const chunks = [];
    for (let i = 0; i < words.length; i += WORDS_PER_PAGE) chunks.push(words.slice(i, i + WORDS_PER_PAGE));

    const pages = chunks.map((chunk, index) => ({
      section: section.key,
      label: chunks.length > 1 ? `${section.tab} ${index + 1}/${chunks.length}` : section.tab,
      html: `
        ${pageTitle(section)}
        ${chunks.length > 1 ? `<p class="book-page__part">Bagian ${index + 1} dari ${chunks.length}</p>` : ''}
        ${index === 0 ? notes : ''}
        <ul class="vocab-list">${chunk.map(vocabItem).join('')}</ul>`
    }));
    return evenPages(pages, section);
  }

  /* ---------- Grammatik: tiap materi = satu pasang halaman ---------- */

  function grammarTable(table, caption) {
    const langs = table.bahasa || table.kolom.map(() => 'de');
    const articleOf = (label) => (['der', 'die', 'das'].includes(label) ? label : null);

    const head = table.kolom.map((label) => {
      const article = articleOf(label);
      const content = article
        ? `<span class="article article--${article}" lang="de">${article}</span>`
        : esc(label);
      return `<th scope="col">${content}</th>`;
    }).join('');

    const rows = table.baris.map((row) => {
      const cells = row.map((cell, index) => {
        const article = articleOf(table.kolom[index]);
        const classes = article ? ` class="cell--${article}"` : '';
        const lang = langs[index] === 'de' ? ' lang="de"' : '';
        return index === 0
          ? `<th scope="row"${lang}${classes}>${esc(cell)}</th>`
          : `<td${lang}${classes}>${esc(cell)}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    return `
      <div class="scroll-x grammar__table-wrap" role="region" aria-label="Tabel ${esc(caption)}" tabindex="0">
        <table class="grammar-table">
          <thead><tr>${head}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function exampleItem(item) {
    const example = typeof item === 'string' ? { de: item } : item;
    return `
      <li>
        <span lang="de">${esc(example.de)}</span>
        ${c.audioTools({ text: example.de, meaning: example.id })}
        ${example.id ? `<span class="grammar__example-id">${esc(example.id)}</span>` : ''}
      </li>`;
  }

  function mistakeItem(item) {
    if (typeof item === 'string') return `<li>${c.richText(item)}</li>`;
    return `
      <li>
        <span class="visually-hidden">Salah: </span><span aria-hidden="true">✗</span>
        <span class="grammar__wrong" lang="de">${esc(item.salah)}</span>
        <span class="visually-hidden">Benar: </span><span aria-hidden="true">✓</span>
        <span class="grammar__right" lang="de">${esc(item.benar)}</span>
      </li>`;
  }

  function grammarPagesFor(entry, grammar, index, section, exercises) {
    const count = entry.grammatik.length;
    const label = count > 1 ? `${section.tab} ${index + 1}/${count}` : section.tab;

    const left = `
      ${pageTitle(section)}
      <h3 class="grammar__title">${c.richText(grammar.judul)}</h3>
      <p class="grammar__ref">${c.bookRef({ halaman: grammar.halaman })}</p>
      ${grammar.ringkasan ? `<p class="grammar__text">${c.richText(grammar.ringkasan)}</p>` : ''}
      ${grammar.tabel ? grammarTable(grammar.tabel, grammar.judul) : ''}
      ${grammar.contoh.length ? `
        <h4 class="grammar__label">Contoh</h4>
        <ul class="grammar__examples">${grammar.contoh.map(exampleItem).join('')}</ul>` : ''}`;

    const compare = grammar.perbandingan_indonesia
      ? `<h4 class="grammar__label">Bandingkan dengan Bahasa Indonesia</h4>
         <p class="grammar__text">${c.richText(grammar.perbandingan_indonesia)}</p>`
      : '';
    const mistakes = grammar.kesalahan_umum.length
      ? `<h4 class="grammar__label">Kesalahan umum</h4>
         <ul class="grammar__mistakes">${grammar.kesalahan_umum.map(mistakeItem).join('')}</ul>`
      : '';
    const practice = grammar.latihan.length
      ? `<h4 class="grammar__label">Latihan</h4>
         <ol class="quiz-list">${grammar.latihan.map((item, itemIndex) => {
           const key = `g${index}-${itemIndex}`;
           return DL.materi.exerciseItem(key, item, exercises[key]);
         }).join('')}</ol>`
      : '';

    // Animasi (js/anim.js) di atas halaman kanan, bila materi punya "animasi".
    const animation = grammar.animasi && DL.anim ? DL.anim.render(grammar.animasi) : '';
    const rightHtml = animation + compare + mistakes + practice;
    const pages = [{ section: section.key, label, html: left }];
    pages.push(rightHtml
      ? { section: section.key, label: label + ' (lanjutan)', html: rightHtml }
      : fillerPage(section));
    return pages;
  }

  function grammarPages(entry, section, exercises) {
    const notes = note('Topik di buku', entry.ringkasan.grammatik);
    if (!entry.grammatik.length) {
      return evenPages([{ section: section.key, label: section.tab, html: pageTitle(section) + notes + emptyText(entry) }], section);
    }
    return entry.grammatik.reduce((pages, grammar, index) => {
      return pages.concat(grammarPagesFor(entry, grammar, index, section, exercises));
    }, []);
  }

  /* ---------- Dialog: satu dialog per halaman ---------- */

  function dialogPage(dialog, section, index, count) {
    const speakers = [];
    const lines = dialog.baris.map((line) => {
      if (!speakers.includes(line.pembicara)) speakers.push(line.pembicara);
      const voice = ['a', 'b', 'c'][Math.min(speakers.indexOf(line.pembicara), 2)];
      return `
        <li class="dialogue__line dialogue__line--${voice}">
          <span class="dialogue__who">${esc(line.pembicara)}</span>
          <span class="dialogue__de" lang="de">${esc(line.de)}</span>
          ${c.audioTools({ text: line.de, meaning: line.id })}
          <span class="dialogue__id">${esc(line.id)}</span>
        </li>`;
    }).join('');

    return {
      section: section.key,
      label: count > 1 ? `${section.tab} ${index + 1}/${count}` : section.tab,
      html: `
        ${pageTitle(section)}
        ${dialog.judul ? `<h3 class="dialogue__title">${c.richText(dialog.judul)}</h3>` : ''}
        <p class="grammar__ref">${c.bookRef({ halaman: dialog.halaman, aufgabe: dialog.aufgabe, track: dialog.track })}</p>
        <ol class="dialogue">${lines}</ol>`
    };
  }

  function dialogPages(entry, section) {
    if (!entry.dialog.length) {
      return evenPages([{ section: section.key, label: section.tab, html: pageTitle(section) + emptyText(entry) }], section);
    }
    const count = entry.dialog.length;
    return evenPages(entry.dialog.map((dialog, index) => dialogPage(dialog, section, index, count)), section);
  }

  /* ---------- Aussprache & Landeskunde: dari kotak ringkasan ---------- */

  function summaryPage(entry, section, blocks) {
    const body = blocks.map((block) => note(block.label, block.lines)).join('');
    return evenPages([{
      section: section.key,
      label: section.tab,
      html: `
        ${pageTitle(section)}
        ${body || emptyText(entry)}
        ${body ? `<p>${c.bookRef({ halaman: entry.halaman_buku })}</p>` : ''}`
    }], section);
  }

  /** Susun semua halaman buku sesuai urutan tab. */
  function bookPages(entry, onlyWichtig, exercises) {
    const [wortschatz, grammatik, dialog, aussprache, landeskunde] = SECTIONS;
    return [].concat(
      vocabPages(entry, wortschatz, onlyWichtig),
      grammarPages(entry, grammatik, exercises),
      dialogPages(entry, dialog),
      summaryPage(entry, aussprache, [{ label: 'Topik di buku', lines: entry.ringkasan.aussprache }]),
      summaryPage(entry, landeskunde, [
        { label: 'Topik di buku', lines: entry.ringkasan.landeskunde },
        { label: 'Netzwerk-WG', lines: entry.ringkasan.netzwerk_wg }
      ])
    );
  }

  /* ---------- Bagian di luar buku ---------- */

  function goalsNote(entry) {
    if (!entry.lernziele.length) return '';
    return `
      <section class="goals chapter__goals" aria-labelledby="goals-title">
        ${c.washi({ motif: 'stars-red', className: 'goals__tape', tilt: '-4deg' })}
        <h2 class="goals__title" id="goals-title">Yang dipelajari di Kapitel ini <span class="book-page__de" lang="de">Lernziele</span></h2>
        <ul class="goals__list">
          ${entry.lernziele.map((goal) => `<li><span lang="de">${esc(goal.de)}</span> <span class="goals__id">— ${esc(goal.id)}</span></li>`).join('')}
        </ul>
      </section>`;
  }

  function teacherNotes(entry) {
    const tips = entry.tips_guru.length
      ? `<ul class="teacher-notes__list">${entry.tips_guru.map((tip) => `<li>${c.richText(tip)}</li>`).join('')}</ul>`
      : '<p class="teacher-notes__empty">Belum ada tips guru untuk Kapitel ini.</p>';
    return `
      <section class="teacher-notes teacher-only" aria-labelledby="teacher-notes-title">
        <h2 class="teacher-notes__title" id="teacher-notes-title">Tips guru</h2>
        ${tips}
      </section>`;
  }

  function render(entry) {
    const wichtigCount = entry.kosakata.filter((word) => word.wichtig).length;
    const filter = wichtigCount
      ? `
        <label class="wichtig-filter" data-wichtig-wrap>
          <input type="checkbox" data-wichtig-filter>
          ${c.sticker('star', { decorative: true, className: 'wichtig-filter__star', tilt: '-6deg' })}
          Hanya kata penting (${wichtigCount})
        </label>`
      : '';
    const doneButton = DL.data.isFilled(entry)
      ? '<button class="btn" type="button" data-chapter-done></button>'
      : '';

    const legend = `
      <p class="article-legend">
        <span class="article-legend__label">Warna kata benda:</span>
        <span><span class="article article--der" lang="de">der</span> maskulin</span>
        <span><span class="article article--die" lang="de">die</span> feminin</span>
        <span><span class="article article--das" lang="de">das</span> netral</span>
      </p>`;

    return `
      <article class="chapter" aria-labelledby="page-title">
        ${DL.materi.head(entry)}
        ${goalsNote(entry)}
        ${teacherNotes(entry)}
        <div class="chapter-tools">
          <div class="chapter-tools__left">${filter}</div>
          <div class="chapter-tools__right">
            ${DL.teacher.toggleButton()}
            ${doneButton}
          </div>
        </div>
        ${DL.data.isFilled(entry) ? c.audioBar() : ''}
        ${legend}
        ${c.washiTabs({
          label: 'Bagian Kapitel',
          tabs: SECTIONS.map((section) => ({ key: section.key, label: section.tab, lang: 'de', hint: section.title }))
        })}
        <div class="book-stage book-stage--below">
          <div class="book-stage__book" data-book-slot></div>
          <div class="book-stage__prev">
            ${c.ticketButton({ label: 'Sebelumnya', direction: 'prev', attrs: { 'data-book-prev': '' } })}
          </div>
          <div class="book-stage__next">
            ${c.ticketButton({ label: 'Selanjutnya', direction: 'next', attrs: { 'data-book-next': '' } })}
          </div>
          <p class="book-stage__status" data-book-status aria-live="polite"></p>
        </div>
        <p class="chapter__tip">Tips: tekan tombol panah <kbd>←</kbd> <kbd>→</kbd> di keyboard, atau geser halaman di HP.</p>
      </article>`;
  }

  /* ---------- Interaksi ---------- */

  function setLabel(button, text) {
    const label = button.querySelector('.ticket__label');
    if (label) label.textContent = text;
  }

  function mount(outlet, entry) {
    const filled = DL.data.isFilled(entry);
    const progress = DL.storage.getChapterProgress(entry.id);
    // Lanjutkan dari halaman terakhir bila Kapitel belum selesai.
    const start = progress.status === 'sedang' ? progress.page : 0;
    if (filled) DL.storage.recordChapterVisit(entry.id);

    const slot = outlet.querySelector('[data-book-slot]');
    const prevButton = outlet.querySelector('[data-book-prev]');
    const nextButton = outlet.querySelector('[data-book-next]');
    const status = outlet.querySelector('[data-book-status]');
    const tabs = Array.from(outlet.querySelectorAll('[data-tab]'));
    const filterWrap = outlet.querySelector('[data-wichtig-wrap]');
    const doneButton = outlet.querySelector('[data-chapter-done]');
    const nextEntry = DL.data.neighbor(entry, 1);

    const exercises = {};     // keadaan soal latihan, tetap ada saat buku disusun ulang
    let onlyWichtig = false;
    let book = null;
    let current = null;
    let sectionStart = {};

    function onBookChange(state) {
      current = state;
      DL.speech.stop();  // tombol yang sedang berbunyi bisa jadi sudah tidak terlihat
      const range = state.range.length > 1 ? state.range.join('–') : String(state.range[0]);
      status.innerHTML = `
        <span class="book-stage__pages">Halaman ${range} dari ${state.pages}</span>
        <span class="book-stage__labels">${state.labels.map(esc).join(' · ')}</span>`;

      tabs.forEach((tab) => {
        if (tab.dataset.tab === state.section) tab.setAttribute('aria-current', 'true');
        else tab.removeAttribute('aria-current');
      });
      if (filterWrap) filterWrap.hidden = state.section !== 'wortschatz';

      // Di ujung buku, tombol tiket berpindah ke daftar perjalanan / materi berikutnya.
      setLabel(prevButton, state.first ? 'Semua perjalanan' : 'Sebelumnya');
      setLabel(nextButton, state.last ? (nextEntry ? nextEntry.label : 'Semua perjalanan') : 'Selanjutnya');

      // Nomor halaman berubah saat disaring, jadi hanya tampilan penuh yang disimpan.
      if (filled && !onlyWichtig) DL.storage.saveChapterPage(entry.id, state.page);
    }

    function buildBook(startPage) {
      if (book) book.destroy();
      const pages = bookPages(entry, onlyWichtig, exercises);
      sectionStart = {};
      pages.forEach((page, index) => {
        if (sectionStart[page.section] === undefined) sectionStart[page.section] = index;
      });
      slot.innerHTML = DL.book.markup({ pages, className: 'chapter-book' });
      book = DL.book.create(slot.querySelector('[data-book]'), { start: startPage, onChange: onBookChange });
    }

    function updateDoneButton() {
      if (!doneButton) return;
      const done = DL.storage.getChapterProgress(entry.id).status === 'selesai';
      doneButton.textContent = done ? 'Batalkan tanda selesai' : 'Tandai selesai';
    }

    function onClick(event) {
      const tab = event.target.closest('[data-tab]');
      if (tab) {
        book.goTo(sectionStart[tab.dataset.tab]);
        return;
      }
      if (event.target.closest('[data-book-prev]')) {
        if (current.first) DL.router.navigate('/materi');
        else book.prev();
        return;
      }
      if (event.target.closest('[data-book-next]')) {
        if (current.last) DL.router.navigate(nextEntry ? '/materi/' + nextEntry.id : '/materi');
        else book.next();
        return;
      }
      if (event.target.closest('[data-chapter-done]')) {
        const done = DL.storage.getChapterProgress(entry.id).status === 'selesai';
        if (done) DL.storage.reopenChapter(entry.id);
        else DL.storage.completeChapter(entry.id);
        DL.materi.setStamp(outlet, done ? 'sedang' : 'selesai');
        updateDoneButton();
      }
    }

    function onInputChange(event) {
      if (!event.target.matches('[data-wichtig-filter]')) return;
      onlyWichtig = event.target.checked;
      buildBook(0);
    }

    function onSubmit(event) {
      const form = event.target.closest('[data-exercise]');
      if (!form) return;
      event.preventDefault();
      const [grammarIndex, itemIndex] = form.dataset.exercise.slice(1).split('-').map(Number);
      const item = entry.grammatik[grammarIndex].latihan[itemIndex];
      const solved = DL.materi.checkExercise(form, item);
      exercises[form.dataset.exercise] = { value: form.elements.answer.value, solved };
    }

    outlet.addEventListener('click', onClick);
    outlet.addEventListener('change', onInputChange);
    outlet.addEventListener('submit', onSubmit);
    updateDoneButton();
    buildBook(start);

    return () => {
      if (book) book.destroy();
      outlet.removeEventListener('click', onClick);
      outlet.removeEventListener('change', onInputChange);
      outlet.removeEventListener('submit', onSubmit);
    };
  }

  DL.materi.kapitel = { render, mount };
})(window.DL = window.DL || {});
