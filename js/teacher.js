/* =========================================================
   DeutschLern — teacher.js
   Mode Guru: toggle dengan PIN sederhana. Saat aktif, <html> mendapat
   kelas "is-teacher" sehingga elemen .teacher-only (tips_guru, kunci
   jawaban) tampil. Halaman tidak perlu digambar ulang.
   Status disimpan per tab lewat DL.storage (mati lagi saat tab ditutup).
   ========================================================= */
(function (DL) {
  'use strict';

  const c = DL.components;

  // Ganti PIN di sini. Ini hanya tirai agar kunci jawaban tidak terlihat sekilas,
  // bukan pengaman: siapa pun yang membuka file situs ini bisa membacanya.
  const TEACHER_PIN = '4711';

  let dialog = null;
  let opener = null;

  function isOn() {
    return DL.storage.getTeacherMode();
  }

  function apply() {
    const on = isOn();
    document.documentElement.classList.toggle('is-teacher', on);
    document.querySelectorAll('[data-teacher-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', String(on));
    });
  }

  function setOn(on) {
    DL.storage.setTeacherMode(on);
    apply();
  }

  /** Tombol toggle untuk ditaruh di halaman; kliknya ditangani di sini. */
  function toggleButton() {
    return `
      <button class="teacher-toggle" type="button" aria-pressed="${isOn()}" data-teacher-toggle>
        <span class="teacher-toggle__switch" aria-hidden="true"></span>
        Mode Guru
      </button>`;
  }

  /* ---------- Modal PIN ---------- */

  function renderDialog(hasError) {
    const invalid = hasError ? ' aria-invalid="true" aria-describedby="teacher-pin-error"' : '';
    const html = `
      <button class="dialog__close" type="button" data-dialog-close aria-label="Tutup"><span aria-hidden="true">×</span></button>
      <h2 class="profile-dialog__title" id="teacher-dialog-title">Mode Guru</h2>
      <p class="profile-dialog__note">Menampilkan tips mengajar dan kunci jawaban latihan. Masukkan PIN untuk melanjutkan.</p>
      <form class="profile-rename" data-teacher-form novalidate>
        <label class="profile-rename__label" for="teacher-pin">PIN</label>
        <input class="profile-rename__input" id="teacher-pin" name="pin" type="password"
          inputmode="numeric" autocomplete="off" maxlength="12"${invalid}>
        ${hasError ? '<p class="profile-rename__error" id="teacher-pin-error">PIN salah, coba lagi.</p>' : ''}
        <div class="profile-rename__actions">
          <button class="btn btn--primary" type="submit">Masuk</button>
          <button class="btn" type="button" data-dialog-close>Batal</button>
        </div>
      </form>`;
    dialog.innerHTML = c.paper({ html, tape: 'stars', seed: 'mode-guru', tilt: '0.4deg', className: 'profile-dialog__paper' });
    dialog.querySelector('#teacher-pin').focus();
  }

  function openDialog(button) {
    opener = button;
    dialog.showModal();
    renderDialog(false);
  }

  function onDocumentClick(event) {
    const button = event.target.closest('[data-teacher-toggle]');
    if (!button) return;
    // Mematikan tidak perlu PIN.
    if (isOn()) setOn(false);
    else openDialog(button);
  }

  function onDialogClick(event) {
    if (event.target === dialog || event.target.closest('[data-dialog-close]')) dialog.close();
  }

  function onDialogSubmit(event) {
    const form = event.target.closest('[data-teacher-form]');
    if (!form) return;
    event.preventDefault();
    if (form.elements.pin.value.trim() === TEACHER_PIN) {
      setOn(true);
      dialog.close();
    } else {
      renderDialog(true);
    }
  }

  function onDialogClose() {
    if (opener && opener.isConnected) opener.focus();
    opener = null;
    dialog.innerHTML = '';
  }

  function init() {
    dialog = document.getElementById('teacher-dialog');
    dialog.addEventListener('click', onDialogClick);
    dialog.addEventListener('submit', onDialogSubmit);
    dialog.addEventListener('close', onDialogClose);
    document.addEventListener('click', onDocumentClick);
    apply();
  }

  DL.teacher = { init, isOn, toggleButton };
})(window.DL = window.DL || {});
