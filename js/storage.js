/* =========================================================
   DeutschLern — storage.js
   Satu-satunya file yang menyentuh localStorage.
   Menyimpan 2 profil (nama), profil aktif, dan progres per profil.

   Kunci (semua berawalan "deutschlern:v1:"):
     profiles          [{ id, name }]
     activeProfile     "p1" | "p2"
     progress:<id>     { lastChapter, lastChapterAt,
                         chapters: { "k1": { status, page, completedAt } } }
     speechSpeed:<id>  "normal" | "lambat"

   Event di document:
     "dl:profile-change"   profil/nama berubah → halaman digambar ulang
     "dl:progress-change"  progres berubah → hanya penanda status (menu) yang diperbarui,
                           halaman tidak digambar ulang agar posisi buku tidak hilang

   Mode Guru disimpan di sessionStorage (mati lagi saat tab ditutup).
   ========================================================= */
(function (DL) {
  'use strict';

  const PREFIX = 'deutschlern:v1:';
  const EVENT = 'dl:profile-change';
  const PROGRESS_EVENT = 'dl:progress-change';
  const NAME_MAX = 20;
  const CHAPTER_STATUSES = ['belum', 'sedang', 'selesai'];

  // Avatar & warna tiket tetap di kode; yang disimpan hanya nama.
  const DEFAULT_PROFILES = [
    { id: 'p1', name: 'Pelajar 1', avatar: 'bear', tone: 'cream' },
    { id: 'p2', name: 'Pelajar 2', avatar: 'pretzel', tone: 'rose' }
  ];

  /* localStorage bisa ditolak (mode privat, pengaturan browser).
     Dicek sekali; kalau gagal, data hanya disimpan di memori selama halaman terbuka. */
  const memory = new Map();
  const persistent = (function () {
    try {
      const probe = PREFIX + '__probe';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return true;
    } catch (error) {
      return false;
    }
  })();

  function read(key, fallback) {
    try {
      const raw = persistent ? window.localStorage.getItem(PREFIX + key) : memory.get(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (error) {
      console.warn('[storage] Data tidak terbaca, memakai nilai bawaan:', key, error);
      return fallback;
    }
  }

  function write(key, value) {
    const raw = JSON.stringify(value);
    memory.set(key, raw);
    if (!persistent) return;
    try {
      window.localStorage.setItem(PREFIX + key, raw);
    } catch (error) {
      console.warn('[storage] Gagal menyimpan:', key, error);
    }
  }

  function notify() {
    document.dispatchEvent(new CustomEvent(EVENT));
  }

  function notifyProgress() {
    document.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
  }

  function isKnownId(id) {
    return DEFAULT_PROFILES.some((profile) => profile.id === id);
  }

  /** Rapikan nama: spasi ganda dibuang, maksimal NAME_MAX huruf. */
  function cleanName(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
  }

  /* ---------- Profil ---------- */

  function getProfiles() {
    const saved = read('profiles', []);
    return DEFAULT_PROFILES.map((base) => {
      const match = Array.isArray(saved) ? saved.find((item) => item && item.id === base.id) : null;
      const name = match ? cleanName(match.name) : '';
      return Object.assign({}, base, { name: name || base.name });
    });
  }

  /** @returns {boolean} false bila nama kosong setelah dirapikan. */
  function renameProfile(id, name) {
    const clean = cleanName(name);
    if (!clean || !isKnownId(id)) return false;
    const profiles = getProfiles().map((profile) => ({
      id: profile.id,
      name: profile.id === id ? clean : profile.name
    }));
    write('profiles', profiles);
    notify();
    return true;
  }

  function getActiveId() {
    const id = read('activeProfile', null);
    return isKnownId(id) ? id : null;
  }

  function getActiveProfile() {
    const id = getActiveId();
    return id ? getProfiles().find((profile) => profile.id === id) : null;
  }

  function setActiveId(id) {
    if (!isKnownId(id)) return;
    write('activeProfile', id);
    notify();
  }

  /* ---------- Progres ---------- */

  function getProgress(id) {
    const value = read('progress:' + id, {});
    return value && typeof value === 'object' ? value : {};
  }

  function updateProgress(id, patch) {
    if (!isKnownId(id)) return;
    write('progress:' + id, Object.assign(getProgress(id), patch));
    notifyProgress();
  }

  /* ---------- Progres per bab (profil aktif) ----------
     status: "belum" (belum dibuka) | "sedang" (sudah dibuka) | "selesai"
     page  : halaman buku terakhir yang dibuka, untuk melanjutkan */

  function chapterEntries(progress) {
    return progress.chapters && typeof progress.chapters === 'object' ? progress.chapters : {};
  }

  /** @returns {{status: string, page: number, completedAt: (string|null)}} */
  function getChapterProgress(chapterId, profileId) {
    const id = profileId || getActiveId();
    const progress = id ? getProgress(id) : {};
    const entry = chapterEntries(progress)[String(chapterId)];
    const safe = entry && typeof entry === 'object' ? entry : {};
    // Data lama (sebelum ada status per bab) hanya mencatat bab terakhir yang dibuka.
    const fallback = progress.lastChapter === chapterId ? 'sedang' : 'belum';
    return {
      status: CHAPTER_STATUSES.includes(safe.status) ? safe.status : fallback,
      page: Number.isInteger(safe.page) && safe.page >= 0 ? safe.page : 0,
      completedAt: typeof safe.completedAt === 'string' ? safe.completedAt : null
    };
  }

  function updateChapter(chapterId, patch, extra) {
    const id = getActiveId();
    if (!id) return;
    const entries = Object.assign({}, chapterEntries(getProgress(id)));
    const key = String(chapterId);
    entries[key] = Object.assign({}, entries[key], patch);
    updateProgress(id, Object.assign({ chapters: entries }, extra));
  }

  /** Dipanggil saat sebuah bab dibuka; dipakai kartu "Lanjutkan belajar" dan status bab. */
  function recordChapterVisit(chapterId) {
    const current = getChapterProgress(chapterId);
    updateChapter(
      chapterId,
      { status: current.status === 'selesai' ? 'selesai' : 'sedang' },
      { lastChapter: chapterId, lastChapterAt: new Date().toISOString() }
    );
  }

  function saveChapterPage(chapterId, page) {
    if (Number.isInteger(page) && page >= 0) updateChapter(chapterId, { page });
  }

  function completeChapter(chapterId) {
    updateChapter(chapterId, { status: 'selesai', completedAt: new Date().toISOString() });
  }

  /** Batalkan tanda selesai. */
  function reopenChapter(chapterId) {
    updateChapter(chapterId, { status: 'sedang', completedAt: null });
  }

  /* ---------- Kecepatan suara (per profil) ---------- */

  function speechSpeedKey() {
    return 'speechSpeed:' + (getActiveId() || 'tamu');
  }

  /** @returns {string} "normal" | "lambat" */
  function getSpeechSpeed() {
    return read(speechSpeedKey(), 'normal') === 'lambat' ? 'lambat' : 'normal';
  }

  /** Tidak memicu event: pilihan ini tidak mengubah isi halaman. */
  function setSpeechSpeed(speed) {
    write(speechSpeedKey(), speed === 'lambat' ? 'lambat' : 'normal');
  }

  /* ---------- Mode Guru ---------- */

  let teacherMemory = false;

  function getTeacherMode() {
    try {
      return window.sessionStorage.getItem(PREFIX + 'teacherMode') === '1';
    } catch (error) {
      return teacherMemory;
    }
  }

  function setTeacherMode(on) {
    teacherMemory = Boolean(on);
    try {
      if (on) window.sessionStorage.setItem(PREFIX + 'teacherMode', '1');
      else window.sessionStorage.removeItem(PREFIX + 'teacherMode');
    } catch (error) {
      console.warn('[storage] Mode Guru tidak bisa disimpan:', error);
    }
  }

  // Perubahan dari tab lain. event.key kosong = seluruh localStorage dihapus.
  window.addEventListener('storage', (event) => {
    if (event.key === null) {
      notify();
      notifyProgress();
    } else if (event.key.startsWith(PREFIX + 'progress:')) {
      notifyProgress();
    } else if (event.key.startsWith(PREFIX)) {
      notify();
    }
  });

  DL.storage = {
    EVENT,
    PROGRESS_EVENT,
    NAME_MAX,
    isPersistent: persistent,
    getProfiles,
    renameProfile,
    getActiveId,
    getActiveProfile,
    setActiveId,
    getProgress,
    updateProgress,
    getChapterProgress,
    recordChapterVisit,
    saveChapterPage,
    completeChapter,
    reopenChapter,
    getSpeechSpeed,
    setSpeechSpeed,
    getTeacherMode,
    setTeacherMode
  };
})(window.DL = window.DL || {});
