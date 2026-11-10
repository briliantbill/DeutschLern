/* =========================================================
   DeutschLern — speech.js
   Suara pengucapan lewat Web Speech API (speechSynthesis, de-DE).

   Tombol [data-speak] dan pilihan kecepatan [data-speech-speed] (lihat
   DL.components) ditangani oleh satu listener di document, jadi halaman
   tidak perlu memasang apa pun, termasuk setelah buku disusun ulang.

   Kelas di <html>:
     no-speech  tidak ada suara Jerman: tombol speaker & kecepatan disembunyikan
     no-listen  browser tanpa SpeechRecognition: tombol mikrofon disembunyikan
   ========================================================= */
(function (DL) {
  'use strict';

  const c = DL.components;

  const LANG = 'de-DE';
  const RATES = Object.freeze({ normal: 1, lambat: 0.7 });
  const VOICE_WAIT_MS = 2500;     // sebagian browser tidak pernah mengirim voiceschanged
  const START_TIMEOUT_MS = 5000;  // suara online bisa macet tanpa pesan error
  const START_TIMEOUT_AFTER_CANCEL_MS = 2500;  // macet tepat setelah cancel(): cepat diulang, biasanya langsung jalan
  const CANCEL_GAP_MS = 60;       // beberapa browser membuang ucapan bila speak() tepat setelah cancel()
  const AFTER_CANCEL_MS = 1500;   // gagal dalam rentang ini setelah cancel(): belum tentu suaranya yang rusak
  const VOICE_RETRY_MS = 60000;   // suara yang gagal boleh dicoba lagi setelah ini (mis. internet sudah kembali)
  const TOAST_MS = 7000;

  const FAIL_MESSAGE = 'Suara Jerman gagal diputar. Periksa suara perangkat atau koneksi internet, lalu coba lagi.';

  const synth = window.speechSynthesis || null;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  /* ---------- Daftar suara ----------
     Keadaan: memuat | siap | tanpa-daftar | tanpa-suara-jerman | tidak-didukung
     "tanpa-daftar" = browser tidak memberi daftar suara; tetap dicoba dengan lang saja. */

  let voiceState = synth ? 'memuat' : 'tidak-didukung';
  let germanVoices = [];
  const failedVoices = new Map();  // nama suara → waktu boleh dicoba lagi

  function isGerman(voice) {
    return /^de([-_]|$)/i.test(voice.lang);
  }

  /** Utamakan de-DE, lalu suara natural, Google, dan suara lokal. */
  function voiceRank(voice) {
    let rank = /^de[-_]de$/i.test(voice.lang) ? 100 : 0;
    if (/natural/i.test(voice.name) && !/multilingual|mehrsprachig/i.test(voice.name)) rank += 30;
    else if (/google/i.test(voice.name)) rank += 20;
    else if (voice.localService) rank += 10;
    return rank;
  }

  function readVoices() {
    const voices = synth.getVoices();
    if (!voices.length) return;
    germanVoices = voices.filter(isGerman).sort((a, b) => voiceRank(b) - voiceRank(a));
    voiceState = germanVoices.length ? 'siap' : 'tanpa-suara-jerman';
    applyState();
  }

  /** Suara online butuh internet; saat offline langsung pakai suara lokal. */
  function pickVoice() {
    const now = Date.now();
    const usable = germanVoices.filter((voice) => !(failedVoices.get(voice.name) > now));
    const online = navigator.onLine !== false;
    return usable.find((voice) => online || voice.localService) || usable[0] || null;
  }

  /* ---------- Kemampuan browser ---------- */

  function canSpeak() {
    return voiceState !== 'tidak-didukung' && voiceState !== 'tanpa-suara-jerman';
  }

  function canListen() {
    return Boolean(Recognition);
  }

  /** Catatan untuk pengguna bila ada tombol yang disembunyikan. Kosong = semua didukung. */
  function noteText() {
    const parts = [];
    if (voiceState === 'tidak-didukung') {
      parts.push('Browser ini belum bisa memutar suara, jadi tombol speaker disembunyikan. Coba Chrome atau Edge terbaru.');
    } else if (voiceState === 'tanpa-suara-jerman') {
      parts.push('Perangkat ini belum punya suara Jerman, jadi tombol speaker disembunyikan agar kamu tidak mendengar pelafalan yang keliru. Tambahkan paket suara Bahasa Jerman di pengaturan bahasa perangkat, atau coba Chrome atau Edge.');
    }
    if (!canListen()) {
      parts.push('Browser ini belum mendukung Latih ucapan, jadi tombol mikrofon disembunyikan. Coba Chrome atau Edge.');
    }
    return parts.join(' ');
  }

  function applyState() {
    const root = document.documentElement;
    root.classList.toggle('no-speech', !canSpeak());
    root.classList.toggle('no-listen', !canListen());

    const text = noteText();
    document.querySelectorAll('[data-speech-note]').forEach((note) => {
      note.textContent = text;
      note.hidden = !text;
    });
  }

  /** Pengenal suara siap pakai, atau null bila tidak didukung. Dipakai js/practice.js. */
  function createRecognizer() {
    if (!Recognition) return null;
    const recognizer = new Recognition();
    recognizer.lang = LANG;
    recognizer.continuous = false;
    recognizer.interimResults = true;
    recognizer.maxAlternatives = 5;
    return recognizer;
  }

  /* ---------- Pesan singkat ----------
     Modal terbuka berada di lapisan paling atas, jadi pesan ikut masuk ke dalamnya. */

  let toast = null;
  let toastTimer = 0;

  function showToast(message) {
    if (!toast) {
      toast = document.createElement('p');
      toast.className = 'speech-toast';
      toast.setAttribute('role', 'status');
    }
    (document.querySelector('dialog[open]') || document.body).appendChild(toast);
    toast.hidden = false;
    toast.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, TOAST_MS);
  }

  /* ---------- Memutar suara ---------- */

  let session = 0;
  let lastCancelAt = 0;
  let active = null;  // { utterance, button, timer }. Disimpan juga agar utterance tidak dibuang Chrome sebelum selesai.

  function clearActive() {
    if (!active) return;
    clearTimeout(active.timer);
    if (active.button) active.button.classList.remove('is-speaking');
    active = null;
  }

  function stop() {
    session += 1;
    clearActive();
    if (synth && (synth.speaking || synth.pending)) {
      synth.cancel();
      lastCancelAt = Date.now();
    }
  }

  /** Tandai suara gagal. Satu suara online gagal biasanya berarti semuanya, jadi langsung ke suara lokal. */
  function markFailed(voice, reason) {
    console.warn('[speech] Suara dilewati sementara:', voice.name, reason);
    const until = Date.now() + VOICE_RETRY_MS;
    const group = voice.localService ? [voice] : germanVoices.filter((item) => !item.localService);
    group.forEach((item) => failedVoices.set(item.name, until));
  }

  function utter(text, token, options) {
    if (token !== session) return;
    const voice = pickVoice();

    // Semua suara sudah dicoba: beri tahu, dan klik berikutnya mulai lagi dari awal.
    if (germanVoices.length && !voice) {
      failedVoices.clear();
      showToast(FAIL_MESSAGE);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice ? voice.lang : LANG;
    if (voice) utterance.voice = voice;
    const rate = RATES[DL.storage.getSpeechSpeed()];
    utterance.rate = rate;

    const isCurrent = () => active && active.utterance === utterance;

    function fail(reason) {
      clearActive();
      synth.cancel();
      if (!voice) {
        showToast(FAIL_MESSAGE);
        return;
      }
      // Edge: ucapan tepat setelah suara online dibatalkan bisa ikut gagal, padahal
      // suaranya baik-baik saja (mis. klik ganda). Ulangi sekali dengan suara yang sama.
      if (options.afterCancel) {
        setTimeout(() => utter(text, token, Object.assign({}, options, { afterCancel: false })), CANCEL_GAP_MS);
        return;
      }
      markFailed(voice, reason);
      setTimeout(() => utter(text, token, options), CANCEL_GAP_MS);
    }

    utterance.onstart = () => {
      if (!isCurrent()) return;
      clearTimeout(active.timer);
      // Jaga-jaga: event "end" kadang tidak pernah datang, jangan biarkan tombol terus berdenyut.
      active.timer = setTimeout(() => {
        if (isCurrent()) clearActive();
      }, Math.max(8000, (text.length * 250) / rate));
    };
    utterance.onend = () => {
      if (isCurrent()) clearActive();
    };
    utterance.onerror = (event) => {
      if (!isCurrent()) return;
      if (event.error === 'interrupted' || event.error === 'canceled') {
        clearActive();
      } else if (event.error === 'not-allowed') {
        clearActive();
        showToast('Browser menolak memutar suara. Klik tombolnya sekali lagi.');
      } else {
        fail(event.error);
      }
    };

    active = {
      utterance,
      button: options.button || null,
      timer: setTimeout(() => {
        if (isCurrent()) fail('tidak kunjung mulai');
      }, options.afterCancel ? START_TIMEOUT_AFTER_CANCEL_MS : START_TIMEOUT_MS)
    };
    if (active.button) active.button.classList.add('is-speaking');

    synth.resume();   // Chrome kadang tertahan dalam keadaan "paused"
    synth.speak(utterance);
  }

  /**
   * Ucapkan teks Jerman dengan kecepatan pilihan profil aktif.
   * @param {string} text
   * @param {Object} [options]
   * @param {HTMLElement} [options.button] Tombol yang diberi kelas is-speaking selama suara berbunyi.
   */
  function speak(text, options = {}) {
    if (!synth) return;
    const clean = c.speakableText(text);
    if (!clean) return;

    stop();
    const token = session;
    const sinceCancel = Date.now() - lastCancelAt;
    const next = Object.assign({}, options, { afterCancel: sinceCancel < AFTER_CANCEL_MS });
    if (sinceCancel < CANCEL_GAP_MS) setTimeout(() => utter(clean, token, next), CANCEL_GAP_MS - sinceCancel);
    else utter(clean, token, next);
  }

  /* ---------- Listener & awal ---------- */

  function onDocumentClick(event) {
    const button = event.target.closest('[data-speak]');
    if (button) speak(button.dataset.speak, { button });
  }

  function onDocumentChange(event) {
    if (!event.target.matches('[data-speech-speed]')) return;
    const speed = event.target.value;
    DL.storage.setSpeechSpeed(speed);
    document.querySelectorAll('[data-speech-speed]').forEach((input) => {
      input.checked = input.value === speed;
    });
  }

  function init() {
    if (synth) {
      synth.onvoiceschanged = readVoices;
      readVoices();
      setTimeout(() => {
        if (voiceState === 'memuat') voiceState = 'tanpa-daftar';
      }, VOICE_WAIT_MS);
      // Chrome tetap bersuara walau halaman dimuat ulang.
      window.addEventListener('pagehide', stop);
    }
    applyState();
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('change', onDocumentChange);
  }

  DL.speech = { LANG, init, speak, stop, canSpeak, canListen, createRecognizer, noteText };
})(window.DL = window.DL || {});
