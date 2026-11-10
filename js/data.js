/* =========================================================
   DeutschLern — data.js
   Membaca materi dari data/lessons.js (window.DL_DATA), memeriksa
   kelengkapannya, dan menyediakan fungsi bantu untuk halaman.
   Isi yang masih kosong itu wajar (materi diisi bertahap). Bagian
   yang salah format dibuang (tidak ditampilkan); masalahnya
   dikumpulkan di DL.data.problems dan dicatat di Console.
   ========================================================= */
(function (DL) {
  'use strict';

  const ARTICLES = ['der', 'die', 'das'];
  const LANGS = ['de', 'id'];
  const JOURNEYS = [1, 2, 3, 4];
  const SUMMARY_KEYS = ['wortschatz', 'grammatik', 'aussprache', 'strategie', 'landeskunde', 'netzwerk_wg'];

  const raw = window.DL_DATA || {};
  const problems = [];

  if (!window.DL_DATA) {
    problems.push('File data/lessons.js tidak termuat. Cek tag <script> di index.html dan cari salah ketik (mis. koma) di file itu.');
  }

  const isText = (value) => typeof value === 'string' && value.trim() !== '';
  const isOptionalText = (value) => value == null || isText(value);
  const isPageRef = (value) => value == null || isText(value) || Number.isInteger(value);
  const list = (value) => (Array.isArray(value) ? value : []);

  /* ---------- Pemeriksaan per bagian ---------- */

  function isWord(word) {
    return Boolean(word) && isText(word.de) && isText(word.id) &&
      (word.artikel == null || ARTICLES.includes(word.artikel)) &&
      isOptionalText(word.jamak) && isOptionalText(word.aufgabe) && isPageRef(word.halaman) &&
      isOptionalText(word.contoh_de) && isOptionalText(word.contoh_id);
  }

  function isDialog(dialog) {
    return Boolean(dialog) && isOptionalText(dialog.judul) && isOptionalText(dialog.track) &&
      isOptionalText(dialog.aufgabe) && isPageRef(dialog.halaman) &&
      Array.isArray(dialog.baris) && dialog.baris.length > 0 &&
      dialog.baris.every((line) => line && isText(line.pembicara) && isText(line.de) && isText(line.id));
  }

  function isTable(table) {
    if (!table || !Array.isArray(table.kolom) || !table.kolom.length) return false;
    const width = table.kolom.length;
    if (!table.kolom.every((cell) => typeof cell === 'string')) return false;
    if (table.bahasa != null && !(Array.isArray(table.bahasa) && table.bahasa.length === width && table.bahasa.every((lang) => LANGS.includes(lang)))) {
      return false;
    }
    return Array.isArray(table.baris) && table.baris.length > 0 &&
      table.baris.every((row) => Array.isArray(row) && row.length === width && row.every((cell) => typeof cell === 'string'));
  }

  function isExercise(item) {
    if (!item || !isText(item.soal)) return false;
    return isText(item.jawaban) || (Array.isArray(item.jawaban) && item.jawaban.length > 0 && item.jawaban.every(isText));
  }

  function isGrammar(entry) {
    return Boolean(entry) && isText(entry.judul) && isPageRef(entry.halaman) &&
      isOptionalText(entry.ringkasan) && isOptionalText(entry.perbandingan_indonesia) &&
      (entry.tabel == null || isTable(entry.tabel)) &&
      list(entry.latihan).every(isExercise);
  }

  /** Ambil item yang benar saja; catat nomor item yang salah. */
  function keepValid(items, check, label) {
    return list(items).filter((item, index) => {
      const ok = check(item);
      if (!ok) problems.push(`${label} nomor ${index + 1} tidak lengkap atau formatnya salah.`);
      return ok;
    });
  }

  /** Kotak ringkasan boleh teks atau daftar teks; hasilnya selalu daftar. */
  function readSummary(summary) {
    const source = summary && typeof summary === 'object' ? summary : {};
    const result = {};
    SUMMARY_KEYS.forEach((key) => {
      result[key] = [].concat(source[key] == null ? [] : source[key]).filter(isText);
    });
    return result;
  }

  function readKapitel(item, index) {
    if (!item || !isText(item.id) || !Number.isInteger(item.nomor) || !isText(item.judul_de) || !JOURNEYS.includes(item.perjalanan)) {
      problems.push(`Kapitel ke-${index + 1} tidak lengkap (butuh id, nomor, judul_de, perjalanan 1–4).`);
      return null;
    }
    const name = 'Kapitel ' + item.nomor;

    return Object.assign({}, item, {
      jenis: 'kapitel',
      label: name,
      lernziele: keepValid(item.lernziele, (goal) => goal && isText(goal.de) && isText(goal.id), `${name}: lernziele`),
      ringkasan: readSummary(item.ringkasan),
      kosakata: keepValid(item.kosakata, isWord, `${name}: kosakata`),
      dialog: keepValid(item.dialog, isDialog, `${name}: dialog`),
      grammatik: keepValid(item.grammatik, isGrammar, `${name}: grammatik`).map((entry) => Object.assign({}, entry, {
        contoh: list(entry.contoh),
        kesalahan_umum: list(entry.kesalahan_umum),
        latihan: list(entry.latihan)
      })),
      tips_guru: list(item.tips_guru).filter(isText)
    });
  }

  const kapitel = list(raw.kapitel)
    .map(readKapitel)
    .filter(Boolean)
    .sort((a, b) => a.nomor - b.nomor);

  function readPlattform(item, index) {
    if (!item || !isText(item.id) || !isText(item.judul) || !JOURNEYS.includes(item.perjalanan)) {
      problems.push(`Plattform ke-${index + 1} tidak lengkap (butuh id, judul, perjalanan 1–4).`);
      return null;
    }
    const numbers = list(item.kapitel);
    numbers.forEach((nomor) => {
      if (!kapitel.some((entry) => entry.nomor === nomor)) problems.push(`${item.judul}: Kapitel ${nomor} tidak ada.`);
    });
    return Object.assign({}, item, {
      jenis: 'plattform',
      label: item.judul,
      kapitel: numbers,
      landeskunde: [].concat(item.landeskunde == null ? [] : item.landeskunde).filter(isText)
    });
  }

  const plattform = list(raw.plattform).map(readPlattform).filter(Boolean);

  // Empat perjalanan, masing-masing: Kapitel berurutan lalu Plattform-nya.
  const perjalanan = JOURNEYS.map((nomor) => {
    const entries = kapitel.filter((entry) => entry.perjalanan === nomor)
      .concat(plattform.filter((entry) => entry.perjalanan === nomor));
    return { nomor, entries, halaman: pageRange(entries) };
  });

  const entries = perjalanan.reduce((all, journey) => all.concat(journey.entries), []);

  entries.forEach((entry, index) => {
    if (entries.findIndex((other) => other.id === entry.id) !== index) {
      problems.push(`Ada dua materi dengan id "${entry.id}".`);
    }
  });

  if (problems.length) {
    console.warn('[data] Ada masalah di data/lessons.js:\n- ' + problems.join('\n- '));
  }

  /** "8–17" + … + "38–43" → "8–43". */
  function pageRange(items) {
    if (!items.length) return '';
    const numbers = (item) => String(item.halaman_buku || '').match(/\d+/g) || [];
    const first = numbers(items[0])[0];
    const lastNumbers = numbers(items[items.length - 1]);
    const last = lastNumbers[lastNumbers.length - 1];
    if (!first || !last) return '';
    return first === last ? first : first + '–' + last;
  }

  /* ---------- Fungsi bantu ---------- */

  /** Kapitel atau Plattform menurut id ("k1", "p1"). */
  function getEntry(id) {
    return entries.find((entry) => entry.id === id) || null;
  }

  /** Materi sesudah/sebelum materi ini, urut sesuai buku (null bila tidak ada). */
  function neighbor(entry, step) {
    const index = entries.indexOf(entry);
    return index === -1 ? null : entries[index + step] || null;
  }

  /** Tiga Kapitel sumber sebuah Plattform. */
  function plattformKapitel(entry) {
    return entry.kapitel
      .map((nomor) => kapitel.find((item) => item.nomor === nomor))
      .filter(Boolean);
  }

  /** Sudah ada isinya? Kerangka kosong tidak dihitung; kuis Plattform butuh minimal 4 kata. */
  function isFilled(entry) {
    if (entry.jenis === 'plattform') {
      return plattformKapitel(entry).reduce((total, item) => total + item.kosakata.length, 0) >= 4;
    }
    return entry.kosakata.length > 0 || entry.dialog.length > 0 || entry.grammatik.length > 0;
  }

  // Semua kosakata dari semua Kapitel, untuk "Kata hari ini".
  const allWords = kapitel.reduce((words, item) => {
    item.kosakata.forEach((word) => words.push({ word, kapitel: item }));
    return words;
  }, []);

  /** Nomor hari menurut tanggal lokal; berganti tepat tengah malam. */
  function dayNumber(date) {
    return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  }

  function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
  }

  /**
   * Kata hari ini: sama untuk semua profil, berganti setiap hari.
   * Melompat dengan langkah yang tidak membagi jumlah kata, jadi hari
   * berturut-turut mengambil kata dari Kapitel yang berbeda-beda.
   * @returns {{word: Object, kapitel: Object}|null}
   */
  function wordOfTheDay(date) {
    const total = allWords.length;
    if (!total) return null;
    let step = 37;
    while (gcd(step, total) !== 1) step += 1;
    return allWords[(dayNumber(date || new Date()) * step) % total];
  }

  DL.data = { kapitel, plattform, perjalanan, entries, problems, getEntry, neighbor, plattformKapitel, isFilled, wordOfTheDay };
})(window.DL = window.DL || {});
