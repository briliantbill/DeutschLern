/* =========================================================
   DeutschLern — profile.js
   Modal "Siapa yang belajar hari ini?" dan chip profil di navbar.
   - Dua profil berbentuk tiket (avatar stiker + nama).
   - Nama bisa diubah langsung di modal, disimpan lewat DL.storage.
   - Chip di pojok navbar menampilkan profil aktif; klik untuk mengganti.
   ========================================================= */
(function (DL) {
  'use strict';

  const c = DL.components;
  const esc = c.escapeHtml;

  let dialog = null;
  let chip = null;
  let opener = null;
  let required = false;   // true = belum ada profil aktif, modal tidak boleh ditutup begitu saja
  let editingId = null;   // profil yang namanya sedang diubah
  let renameError = '';

  /* ---------- Isi modal ---------- */

  function renameForm(profile) {
    const inputId = 'profile-name-' + profile.id;
    const errorId = inputId + '-error';
    const invalid = renameError ? ` aria-invalid="true" aria-describedby="${errorId}"` : '';
    return `
      <form class="profile-rename" data-profile-rename="${profile.id}" novalidate>
        <label class="profile-rename__label" for="${inputId}">Nama baru</label>
        <input class="profile-rename__input" id="${inputId}" name="name" type="text"
          value="${esc(profile.name)}" maxlength="${DL.storage.NAME_MAX}" autocomplete="off" spellcheck="false"${invalid}>
        ${renameError ? `<p class="profile-rename__error" id="${errorId}">${esc(renameError)}</p>` : ''}
        <div class="profile-rename__actions">
          <button class="btn btn--primary" type="submit">Simpan</button>
          <button class="btn" type="button" data-profile-cancel="${profile.id}">Batal</button>
        </div>
      </form>`;
  }

  function profileCard(profile, activeId) {
    const isActive = profile.id === activeId;
    const ticket = `
      <button class="ticket ticket--btn ticket--${profile.tone} profile-ticket${isActive ? ' is-active' : ''}"
        type="button" data-profile-select="${profile.id}" style="--tilt: ${c.tilt('profil-' + profile.id, 1.5)}">
        <span class="ticket__body">
          ${c.sticker(profile.avatar, { decorative: true, size: '72px', className: 'profile-ticket__avatar' })}
          <span class="profile-ticket__name">${esc(profile.name)}</span>
          ${isActive ? '<span class="profile-ticket__badge">sedang aktif</span>' : ''}
        </span>
      </button>`;

    const editor = editingId === profile.id
      ? renameForm(profile)
      : `<button class="link-btn" type="button" data-profile-edit="${profile.id}">
           <span aria-hidden="true">✎</span> Ubah nama<span class="visually-hidden"> ${esc(profile.name)}</span>
         </button>`;

    return `<li class="profile-card">${ticket}${editor}</li>`;
  }

  function render(focusSelector) {
    const profiles = DL.storage.getProfiles();
    const activeId = DL.storage.getActiveId();
    const note = DL.storage.isPersistent
      ? 'Pilih tiketmu. Nama dan progres disimpan di browser ini.'
      : 'Perhatian: browser ini menolak penyimpanan, jadi nama dan progres hilang saat halaman ditutup.';

    const html = `
      ${required ? '' : '<button class="dialog__close" type="button" data-dialog-close aria-label="Tutup"><span aria-hidden="true">×</span></button>'}
      <p class="profile-dialog__kicker" lang="de">Wer lernt heute?</p>
      <h2 class="profile-dialog__title" id="profile-dialog-title">Siapa yang belajar hari ini?</h2>
      <ul class="profile-list">${profiles.map((profile) => profileCard(profile, activeId)).join('')}</ul>
      <p class="profile-dialog__note">${note}</p>`;

    dialog.innerHTML = c.paper({ html, tape: 'planes', seed: 'profil', tilt: '-0.4deg', className: 'profile-dialog__paper' });

    if (focusSelector) {
      const target = dialog.querySelector(focusSelector);
      if (target) {
        target.focus();
        if (typeof target.select === 'function') target.select();
      }
    }
  }

  /* ---------- Buka / tutup ---------- */

  /**
   * @param {Object} [options]
   * @param {boolean} [options.required] Wajib memilih (belum ada profil aktif).
   */
  function open(options = {}) {
    required = Boolean(options.required);
    editingId = null;
    renameError = '';
    opener = document.activeElement;
    render();
    if (!dialog.open) dialog.showModal();

    const first = dialog.querySelector('.profile-ticket.is-active') || dialog.querySelector('.profile-ticket');
    if (first) first.focus();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  function stopEditing(id) {
    editingId = null;
    renameError = '';
    render(`[data-profile-edit="${id}"]`);
  }

  /* ---------- Chip profil di navbar ---------- */

  function updateChip() {
    const profile = DL.storage.getActiveProfile();
    if (!profile) {
      chip.hidden = true;
      return;
    }
    chip.hidden = false;
    chip.innerHTML = `
      ${c.sticker(profile.avatar, { decorative: true, size: '32px', className: 'profile-chip__avatar', tilt: '-4deg' })}
      <span class="profile-chip__name">${esc(profile.name)}</span>`;
    chip.setAttribute('aria-label', 'Ganti profil. Sedang belajar: ' + profile.name);
    chip.title = 'Ganti profil';
  }

  /* ---------- Event ---------- */

  function onDialogClick(event) {
    // Klik di luar kertas (latar gelap) menutup modal, kecuali saat wajib memilih.
    if (event.target === dialog) {
      if (!required) close();
      return;
    }

    const select = event.target.closest('[data-profile-select]');
    if (select) {
      DL.storage.setActiveId(select.dataset.profileSelect);
      close();
      return;
    }

    const edit = event.target.closest('[data-profile-edit]');
    if (edit) {
      editingId = edit.dataset.profileEdit;
      renameError = '';
      render('#profile-name-' + editingId);
      return;
    }

    const cancel = event.target.closest('[data-profile-cancel]');
    if (cancel) {
      stopEditing(cancel.dataset.profileCancel);
      return;
    }

    if (event.target.closest('[data-dialog-close]')) close();
  }

  function onDialogSubmit(event) {
    const form = event.target.closest('[data-profile-rename]');
    if (!form) return;
    event.preventDefault();

    const id = form.dataset.profileRename;
    const value = form.elements.name.value;
    if (!DL.storage.renameProfile(id, value)) {
      renameError = 'Nama tidak boleh kosong.';
      render('#profile-name-' + id);
      return;
    }
    stopEditing(id);
  }

  // Escape saat mengubah nama: batalkan ubahan saja, modal tetap terbuka.
  // Escape lainnya menutup modal (browser memang tidak mengizinkan modal "mengunci"
  // pengguna); kalau belum memilih, profil pertama dipakai (lihat onDialogClose).
  function onDialogCancel(event) {
    if (editingId) {
      event.preventDefault();
      stopEditing(editingId);
    }
  }

  function onDialogClose() {
    // Cadangan: kalau modal tertutup tanpa memilih, pakai profil pertama.
    if (!DL.storage.getActiveId()) {
      DL.storage.setActiveId(DL.storage.getProfiles()[0].id);
    }
    required = false;
    editingId = null;
    if (opener && opener.isConnected && opener !== document.body) opener.focus();
    opener = null;
  }

  /* ---------- Mulai ---------- */

  function init() {
    dialog = document.getElementById('profile-dialog');
    chip = document.querySelector('[data-profile-chip]');

    dialog.addEventListener('click', onDialogClick);
    dialog.addEventListener('submit', onDialogSubmit);
    dialog.addEventListener('cancel', onDialogCancel);
    dialog.addEventListener('close', onDialogClose);
    chip.addEventListener('click', () => open());

    document.addEventListener(DL.storage.EVENT, () => {
      updateChip();
      // Nama berubah dari tab lain saat modal terbuka (dan tidak sedang mengedit)
      if (dialog.open && !editingId) render();
    });

    updateChip();
  }

  DL.profile = { init, open, close };
})(window.DL = window.DL || {});
