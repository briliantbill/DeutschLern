/* =========================================================
   DeutschLern — practice.js
   "Latih ucapan": tombol [data-practice] membuka modal berisi kalimat
   target, merekam ucapan lewat SpeechRecognition (de-DE), lalu memberi
   nilai 0–100 dari kata yang tertangkap. Nilai ini perkiraan: yang
   dibandingkan adalah tulisan hasil pengenalan, bukan logat.
   Dukungan browser dicek di js/speech.js.
   ========================================================= */
(function (DL) {
  'use strict';

  const c = DL.components;
  const esc = c.escapeHtml;

  const MAX_LISTEN_MS = 15000;
  const NEAR_SIMILARITY = 0.7;     // ≥ ini: kata dianggap hampir benar (setengah nilai)
  const JOINED_SIMILARITY = 0.85;  // untuk kata yang dipisah/digabung pengenal suara

  const GRADES = [
    { min: 90, tone: 'good', de: 'Sehr gut!', id: 'Sangat bagus!' },
    { min: 60, tone: 'close', de: 'Fast richtig!', id: 'Hampir! Perhatikan kata yang ditandai, lalu coba lagi.' },
    { min: 0, tone: 'again', de: 'Noch einmal!', id: 'Dengarkan contohnya dulu, lalu coba lagi.' }
  ];

  const WORD_STATES = {
    ok: { mark: '✓', text: 'tertangkap' },
    near: { mark: '≈', text: 'hampir' },
    miss: { mark: '✗', text: 'belum tertangkap' }
  };

  const ERROR_MESSAGES = {
    'not-allowed': 'Mikrofon belum diizinkan. Klik ikon di kiri alamat situs, izinkan mikrofon, lalu coba lagi.',
    'service-not-allowed': 'Browser ini menolak layanan pengenalan suara. Periksa izin mikrofon, atau coba Chrome atau Edge.',
    'audio-capture': 'Mikrofon tidak ditemukan. Periksa mikrofon perangkatmu, lalu coba lagi.',
    'no-speech': 'Tidak terdengar suara. Coba bicara lebih dekat ke mikrofon.',
    network: 'Layanan pengenalan suara tidak bisa dihubungi. Periksa internet, lalu coba lagi. Kalau tetap gagal, coba Chrome atau Edge.',
    'language-not-supported': 'Browser ini tidak bisa mengenali Bahasa Jerman. Coba Chrome atau Edge.'
  };
  const NOTHING_HEARD = 'Belum ada kata yang tertangkap. Coba lagi dengan lebih jelas.';

  /* ---------- Penilaian ---------- */

  const ONES = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf',
    'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
  const TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];

  /** 25 → "fünfundzwanzig", 100 → "hundert". Pengenal suara sering menulis angka sebagai digit. */
  function numberWord(n) {
    if (n < 20) return ONES[n];
    if (n < 100) {
      const one = n % 10;
      const ten = TENS[Math.floor(n / 10)];
      return one ? (one === 1 ? 'ein' : ONES[one]) + 'und' + ten : ten;
    }
    if (n < 1000) {
      const hundred = Math.floor(n / 100);
      const rest = n % 100;
      return (hundred === 1 ? '' : ONES[hundred]) + 'hundert' + (rest ? numberWord(rest) : '');
    }
    const thousand = Math.floor(n / 1000);
    const rest = n % 1000;
    return (thousand === 1 ? '' : ONES[thousand]) + 'tausend' + (rest ? numberWord(rest) : '');
  }

  /**
   * Teks → daftar kata untuk dibandingkan. Huruf besar, tanda baca, dan ß/ss
   * disamakan. Umlaut TIDAK disamakan: "schon" dan "schön" memang kata berbeda.
   */
  function tokensOf(text) {
    return String(text)
      .toLocaleLowerCase('de-DE')
      .replace(/['’`´]/g, '')
      .replace(/(\d)\.(?=\d{3}\b)/g, '$1')   // "1.000" → "1000"
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean)
      .map((token) => (/^\d{1,4}$/.test(token) ? numberWord(Number(token)) : token))
      .map((token) => token.replace(/ß/g, 'ss').replace(/^ein(hundert|tausend)/, '$1'));
  }

  function editDistance(a, b) {
    let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      const row = [i];
      for (let j = 1; j <= b.length; j += 1) {
        row[j] = Math.min(previous[j] + 1, row[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      previous = row;
    }
    return previous[b.length];
  }

  function similarity(a, b) {
    if (a === b) return 1;
    return 1 - editDistance(a, b) / Math.max(a.length, b.length, 1);
  }

  /** 1 = sama, 0.5 = hampir, 0 = beda. */
  function wordValue(a, b) {
    if (a === b) return 1;
    return similarity(a, b) >= NEAR_SIMILARITY ? 0.5 : 0;
  }

  /** Pasangkan kata target & kata terdengar sesuai urutan, dengan total nilai terbesar. */
  function align(target, heard) {
    const rows = target.length;
    const columns = heard.length;
    const best = Array.from({ length: rows + 1 }, () => new Array(columns + 1).fill(0));

    for (let i = rows - 1; i >= 0; i -= 1) {
      for (let j = columns - 1; j >= 0; j -= 1) {
        const value = wordValue(target[i], heard[j]);
        best[i][j] = Math.max(best[i + 1][j], best[i][j + 1], value ? value + best[i + 1][j + 1] : 0);
      }
    }

    const states = target.map(() => 'miss');
    let i = 0;
    let j = 0;
    while (i < rows && j < columns) {
      const value = wordValue(target[i], heard[j]);
      if (value && best[i][j] === value + best[i + 1][j + 1]) {
        states[i] = value === 1 ? 'ok' : 'near';
        i += 1;
        j += 1;
      } else if (best[i + 1][j] >= best[i][j + 1]) {
        i += 1;
      } else {
        j += 1;
      }
    }
    return { states, total: best[0][0] };
  }

  /**
   * Bandingkan ucapan dengan teks target.
   * @param {string} targetText
   * @param {string} heardText
   * @returns {{score: number, words: Array<{text: string, state: string}>}}
   *          score 0–100; state tiap kata target: ok | near | miss.
   */
  function compare(targetText, heardText) {
    const shown = String(targetText).split(/\s+/)
      .map((text) => ({ text, tokens: tokensOf(text) }))
      .filter((word) => word.tokens.length);
    const target = shown.reduce((all, word) => all.concat(word.tokens), []);
    const heard = tokensOf(heardText);
    const joinedTarget = target.join('');
    const joinedHeard = heard.join('');

    let states;
    let score;
    if (joinedTarget && joinedTarget === joinedHeard) {
      states = target.map(() => 'ok');
      score = 100;
    } else {
      const result = align(target, heard);
      states = result.states;
      score = (100 * result.total) / Math.max(target.length, heard.length, 1);
      // "Haus Aufgabe" untuk "Hausaufgabe": jumlah katanya beda, bunyinya sama.
      if (target.length !== heard.length) {
        const joined = similarity(joinedTarget, joinedHeard);
        if (joined >= JOINED_SIMILARITY) score = Math.max(score, joined * 100);
      }
    }

    let index = 0;
    const words = shown.map((word) => {
      const own = word.tokens.map(() => states[index++]);
      const state = own.includes('miss') ? 'miss' : (own.includes('near') ? 'near' : 'ok');
      return { text: word.text, state };
    });
    return { score: Math.round(score), words };
  }

  /* ---------- Modal ---------- */

  let dialog = null;
  let opener = null;
  let target = null;   // { text, meaning }
  let attempt = null;  // { recognizer, finals, interim, error, timer }

  function renderDialog() {
    const meaning = target.meaning ? `<p class="practice__meaning">${esc(target.meaning)}</p>` : '';
    const html = `
      <button class="dialog__close" type="button" data-dialog-close aria-label="Tutup"><span aria-hidden="true">×</span></button>
      <p class="profile-dialog__kicker" lang="de">Sprich nach!</p>
      <h2 class="profile-dialog__title" id="practice-dialog-title">Latih ucapan</h2>
      <div class="practice__target">
        <p class="practice__text" lang="de">${esc(target.text)}</p>
        ${meaning}
      </div>
      <div class="practice__listen">
        <button class="btn" type="button" data-speak="${esc(target.text)}">
          ${c.sticker('speaker', { decorative: true, size: '26px' })}
          Dengarkan dulu
        </button>
        ${c.speedControl()}
      </div>
      <div class="practice__mic">
        ${c.ticketButton({ label: 'Mulai bicara', direction: 'none', tone: 'yellow', tilt: '-0.5deg', attrs: { 'data-practice-mic': '' } })}
      </div>
      <p class="practice__heard" data-practice-heard hidden></p>
      <div class="practice__live" aria-live="polite" data-practice-live></div>
      <p class="practice__note">Butuh izin mikrofon dan biasanya internet, karena suaramu dikirim ke layanan pengenalan suara milik pembuat browser. Nilai dihitung dari kata yang tertangkap, jadi anggap sebagai perkiraan, bukan penilaian logat.</p>`;
    dialog.innerHTML = c.paper({ html, tape: 'dots', seed: 'latih-ucapan', tilt: '0.3deg', className: 'profile-dialog__paper practice' });
  }

  function micButton() {
    return dialog.querySelector('[data-practice-mic]');
  }

  function setMic(label, listening) {
    const button = micButton();
    button.querySelector('.ticket__label').textContent = label;
    button.classList.toggle('is-listening', listening);
  }

  function setLive(html) {
    dialog.querySelector('[data-practice-live]').innerHTML = html;
  }

  function setStatus(text) {
    setLive(`<p class="practice__status">${esc(text)}</p>`);
  }

  function setHeard(text) {
    const heard = dialog.querySelector('[data-practice-heard]');
    heard.hidden = !text;
    heard.innerHTML = text ? `Terdengar: <span lang="de">${esc(text)}</span>` : '';
  }

  function showResult(heardText, result) {
    const grade = GRADES.find((item) => result.score >= item.min);
    const words = result.words.map((word) => {
      const state = WORD_STATES[word.state];
      return `
        <li class="practice-word practice-word--${word.state}">
          <span aria-hidden="true">${state.mark}</span>
          <span lang="de">${esc(word.text)}</span>
          <span class="visually-hidden">(${state.text})</span>
        </li>`;
    }).join('');

    setHeard(heardText);
    setLive(`
      <div class="practice-result practice-result--${grade.tone}">
        <p class="practice-result__stamp">
          <span class="visually-hidden">Nilai </span>
          <span class="practice-result__score">${result.score}</span>
          <span class="practice-result__max"><span class="visually-hidden"> dari </span><span aria-hidden="true">/</span>100</span>
        </p>
        <div class="practice-result__text">
          <p class="practice-result__grade" lang="de">${grade.de}</p>
          <p class="practice-result__note">${esc(grade.id)}</p>
        </div>
      </div>
      <ul class="practice-words" aria-label="Hasil per kata">${words}</ul>`);
  }

  /* ---------- Merekam ---------- */

  function readResults(current, event) {
    const finals = [];
    let interim = '';
    for (let i = 0; i < event.results.length; i += 1) {
      const result = event.results[i];
      if (result.isFinal) {
        finals.push(Array.from({ length: result.length }, (_, index) => result[index].transcript));
      } else {
        interim += result[0].transcript;
      }
    }
    current.finals = finals;
    current.interim = interim.trim();
  }

  /** Semua kemungkinan tulisan hasil pengenalan. */
  function candidatesOf(current) {
    if (current.finals.length === 1) return current.finals[0];
    if (current.finals.length > 1) return [current.finals.map((alternatives) => alternatives[0]).join(' ')];
    return current.interim ? [current.interim] : [];
  }

  function finishListening(current) {
    clearTimeout(current.timer);
    attempt = null;
    setMic('Coba lagi', false);

    const scored = candidatesOf(current)
      .map((heard) => ({ heard: heard.trim(), result: compare(target.text, heard) }))
      .filter((item) => item.heard);

    if (scored.length) {
      // Alternatif yang paling cocok yang dipakai, supaya nilainya tidak dirugikan pengenal suara.
      const best = scored.reduce((top, item) => (item.result.score > top.result.score ? item : top));
      showResult(best.heard, best.result);
      return;
    }
    setHeard('');
    setStatus(ERROR_MESSAGES[current.error] || NOTHING_HEARD);
    if (current.error) console.warn('[practice] Pengenalan suara gagal:', current.error);
  }

  function startListening() {
    DL.speech.stop();
    const recognizer = DL.speech.createRecognizer();
    const current = { recognizer, finals: [], interim: '', error: null, timer: 0 };
    attempt = current;

    recognizer.onaudiostart = () => {
      if (attempt !== current) return;
      setStatus('Silakan bicara sekarang…');
      // Waktu dihitung setelah mikrofon menyala, bukan selama browser meminta izin.
      current.timer = setTimeout(() => recognizer.stop(), MAX_LISTEN_MS);
    };
    recognizer.onresult = (event) => {
      if (attempt !== current) return;
      readResults(current, event);
      setHeard(current.interim || (current.finals[0] && current.finals[0][0]) || '');
    };
    recognizer.onerror = (event) => {
      if (attempt === current) current.error = event.error;
    };
    recognizer.onend = () => {
      if (attempt === current) finishListening(current);
    };

    setHeard('');
    setMic('Selesai bicara', true);
    setStatus('Menyiapkan mikrofon… Izinkan bila browser memintanya.');

    try {
      recognizer.start();
    } catch (error) {
      console.warn('[practice] Mikrofon gagal dimulai:', error);
      attempt = null;
      setMic('Coba lagi', false);
      setStatus('Mikrofon gagal dimulai. Coba lagi sebentar lagi.');
    }
  }

  function cancelListening() {
    if (!attempt) return;
    const current = attempt;
    attempt = null;
    clearTimeout(current.timer);
    try {
      current.recognizer.abort();
    } catch (error) {
      console.warn('[practice] Gagal menghentikan mikrofon:', error);
    }
  }

  /* ---------- Listener ---------- */

  function open(button) {
    if (!DL.speech.canListen()) return;
    cancelListening();
    DL.speech.stop();
    opener = button;
    target = {
      text: c.speakableText(button.dataset.practice),
      meaning: button.dataset.practiceMeaning || ''
    };
    renderDialog();
    dialog.showModal();
    micButton().focus();
  }

  function onDocumentClick(event) {
    const button = event.target.closest('[data-practice]');
    if (button) open(button);
  }

  function onDialogClick(event) {
    if (event.target === dialog || event.target.closest('[data-dialog-close]')) {
      dialog.close();
      return;
    }
    if (event.target.closest('[data-practice-mic]')) {
      if (attempt) attempt.recognizer.stop();
      else startListening();
    }
  }

  function onDialogClose() {
    // Event close datang belakangan; modal mungkin sudah dibuka lagi untuk kalimat lain.
    if (dialog.open) return;
    cancelListening();
    DL.speech.stop();
    if (opener && opener.isConnected) opener.focus();
    opener = null;
    target = null;
    dialog.innerHTML = '';
  }

  function init() {
    dialog = document.getElementById('practice-dialog');
    dialog.addEventListener('click', onDialogClick);
    dialog.addEventListener('close', onDialogClose);
    document.addEventListener('click', onDocumentClick);
    // Pindah halaman (mis. tombol Back) dengan modal masih terbuka.
    window.addEventListener('hashchange', () => {
      if (dialog.open) dialog.close();
    });
    window.addEventListener('pagehide', cancelListening);
  }

  DL.practice = { init, open, compare };
})(window.DL = window.DL || {});
