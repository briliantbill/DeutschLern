/* =========================================================
   DeutschLern — anim.js
   Animasi grammar di halaman Kapitel. Sebuah materi grammar di
   data/lessons.js boleh punya "animasi": "<jenis>"; kapitel.js lalu
   menaruh DL.anim.render(jenis) di halaman kanan materi itu.

   Jenis yang tersedia:
     akhiran        buang -en, tempel akhiran (ich/du/er/sie/Sie) + mode latihan
     akhiran-jamak  sama, ditambah wir/ihr/sie (mereka)
     sein           kartu balik: bentuk sein yang harus dihafal
     dusie          kartu balik: situasi → du atau Sie?
     posisi2        kalimat biasa → kalimat tanya W, kata kerja tetap di posisi 2
     ersie          nama diganti er/sie dalam teks
     aus            negara → aus / aus der / aus den + bahasa
     angka          21–99: satuan pindah ke depan + und + puluhan

   Semua klik ditangani satu listener di document (seperti speech.js),
   jadi tetap jalan setelah buku disusun ulang. Keadaan disimpan di
   elemen [data-anim] masing-masing. Hormati prefers-reduced-motion.
   ========================================================= */
(function (DL) {
  'use strict';

  const c = DL.components;
  const esc = c.escapeHtml;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, reduced.matches ? 0 : ms));
  const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
  const say = (text) => { if (DL.speech && DL.speech.canSpeak && DL.speech.canSpeak()) DL.speech.speak(text); };

  /** Mulai urutan baru; urutan lama berhenti di await berikutnya. */
  function newRun(root) {
    root._run = (root._run || 0) + 1;
    const id = root._run;
    return () => root._run === id;
  }

  function frame(type, title, hint, body) {
    return `
      <div class="anim anim--${type}" data-anim="${type}">
        ${c.washi({ motif: 'kraft', className: 'anim__tape', tilt: '-3deg' })}
        <p class="anim__label">${esc(title)}</p>
        ${hint ? `<p class="anim__hint">${hint}</p>` : ''}
        ${body}
      </div>`;
  }

  const chip = (label, attrs, pressed) =>
    `<button type="button" class="anim-chip" ${attrs} aria-pressed="${pressed ? 'true' : 'false'}">${label}</button>`;
  const steps = (items) =>
    `<ol class="anim-steps" data-steps>${items.map((text, i) => `<li class="is-on"><b>${i + 1}</b><span>${text}</span></li>`).join('')}</ol>`;

  function setSteps(root, n) {
    root.querySelectorAll('[data-steps] li').forEach((li, i) => {
      li.classList.toggle('is-on', i <= n);
      li.classList.toggle('is-now', i === n);
    });
  }

  function press(group, button) {
    group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
  }

  /** Pindahkan elemen ke wadah baru dengan gerakan melengkung (FLIP). */
  function flipMove(moves, lift) {
    const first = moves.map(([el]) => el.getBoundingClientRect());
    moves.forEach(([el, target, before]) => target.insertBefore(el, before || null));
    moves.forEach(([el], i) => {
      if (reduced.matches || !el.animate) return;
      const last = el.getBoundingClientRect();
      const dx = first[i].left - last.left;
      const dy = first[i].top - last.top;
      const arc = (lift && lift[i]) || 0;
      el.animate([
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: `translate(${dx / 2}px, ${dy / 2 + arc}px)`, offset: 0.5 },
        { transform: 'translate(0, 0)' }
      ], { duration: 900, easing: 'ease-in-out' });
    });
  }

  /* =========================================================
     akhiran / akhiran-jamak
     ========================================================= */

  const PRON = [
    { p: 'ich', id: 'Saya', e: 'e' },
    { p: 'du', id: 'Kamu', e: 'st' },
    { p: 'er', id: 'Dia (laki-laki)', e: 't' },
    { p: 'sie', id: 'Dia (perempuan)', e: 't', label: 'sie (dia pr.)' },
    { p: 'Sie', id: 'Anda', e: 'en', label: 'Sie (Anda)' },
    { p: 'wir', id: 'Kami', e: 'en', pl: true },
    { p: 'ihr', id: 'Kalian', e: 't', pl: true },
    { p: 'sie', id: 'Mereka', e: 'en', label: 'sie (mereka)', pl: true }
  ];
  const VERBS = {
    wohnen: { stem: 'wohn', de: 'in Jakarta', id: 'tinggal di Jakarta' },
    kommen: { stem: 'komm', de: 'aus Indonesien', id: 'berasal dari Indonesia' },
    lernen: { stem: 'lern', de: 'Deutsch', id: 'belajar bahasa Jerman' },
    'heißen': { stem: 'heiß', names: ['Dewi', 'Budi', 'Jan', 'Nina', 'Weber', 'Müller', 'Lisa und Tom', 'Ana und Luis'] }
  };
  const NAME_ID = ['Nama saya', 'Namamu', 'Namanya', 'Namanya', 'Nama Anda', 'Nama (keluarga) kami', 'Nama kalian', 'Nama mereka'];

  function endingOf(verb, pron) {
    return verb === 'heißen' && pron.e === 'st' ? 't' : pron.e;
  }

  function akhiranSentence(verb, index) {
    const v = VERBS[verb];
    const pron = PRON[index];
    const form = v.stem + endingOf(verb, pron);
    if (verb === 'heißen') {
      const name = v.names[index];
      return { de: `${cap(pron.p)} ${form} ${name}.`, id: `${NAME_ID[index]} ${name.replace(' und ', ' dan ')}.` };
    }
    return { de: `${cap(pron.p)} ${form} ${v.de}.`, id: `${pron.id} ${v.id}.` };
  }

  function akhiranNote(verb, index) {
    const pron = PRON[index];
    const notes = [];
    if (verb === 'heißen' && pron.e === 'st') notes.push('heiß- sudah berakhir dengan ß, jadi untuk du cukup tambah -t (bukan „heißst“).');
    if (pron.p === 'sie' && !pron.pl) notes.push(`Di awal kalimat sie juga ditulis Sie. Bedakan lewat akhirannya: Sie ${VERBS[verb].stem}t (dia) · Sie ${VERBS[verb].stem}en (Anda / mereka).`);
    if (pron.pl) notes.push('wir, sie (mereka) dan Sie selalu -en. ihr selalu -t.');
    return notes.join(' ');
  }

  function akhiranResult(verb, index) {
    const s = akhiranSentence(verb, index);
    const note = akhiranNote(verb, index);
    return `
      <p class="anim-line"><span lang="de">${esc(s.de)}</span>${c.audioTools({ text: s.de, meaning: s.id })}</p>
      <p class="anim-line__id">${esc(s.id)}</p>
      ${note ? `<p class="anim-note">${esc(note)}</p>` : ''}`;
  }

  function renderAkhiran(type) {
    const plural = type === 'akhiran-jamak';
    const prons = PRON.map((p, i) => ({ p, i })).filter(({ p }) => plural || !p.pl);
    const verb = 'wohnen';
    const index = plural ? 5 : 1;
    const pron = PRON[index];
    const body = `
      <div class="anim-row">
        <span class="anim-seg" data-a-mode>
          ${chip('Tunjukkan', 'data-v="show"', true)}${chip('Latihan', 'data-v="quiz"', false)}
        </span>
      </div>
      <div class="anim-chips" data-a-verbs>${Object.keys(VERBS).map((v) => chip(`<span lang="de">${v}</span>`, `data-v="${v}"`, v === verb)).join('')}</div>
      <div class="anim-chips" data-a-prons>${prons.map(({ p, i }) => chip(`<span lang="de">${esc(p.label || p.p)}</span>`, `data-i="${i}"`, i === index)).join('')}</div>
      <p class="anim-stage s2" data-stage lang="de">
        <span class="anim-pron" data-pron>${esc(pron.p)}</span>
        <span class="anim-word"><span data-stem>${VERBS[verb].stem}</span><span class="anim-inf">en</span><span class="anim-slot" aria-hidden="true"></span><span class="anim-end" data-end>${endingOf(verb, pron)}</span></span>
      </p>
      ${steps([
        `Bentuk dasar: <b lang="de" data-x0>${verb}</b>`,
        `Buang <s class="anim-cut">-en</s>, sisanya akar kata: <b lang="de" data-x1>${VERBS[verb].stem}-</b>`,
        `Tempel akhiran untuk <b lang="de" data-x2>${esc(pron.label || pron.p)} → -${endingOf(verb, pron)}</b>`
      ])}
      <div class="anim-pick" data-pick hidden>
        ${['e', 'st', 't', 'en'].map((e) => `<button type="button" class="anim-token-btn" data-e="${e}" lang="de">-${e}</button>`).join('')}
      </div>
      <div class="anim-feedback" data-feedback aria-live="polite"></div>
      <div class="anim-out" data-out>${akhiranResult(verb, index)}</div>
      <div class="anim-row">
        <button type="button" class="btn btn--primary anim-btn" data-a-play>Putar animasi</button>
        <button type="button" class="btn anim-btn" data-a-rand>Acak</button>
      </div>`;
    return frame(type, 'Animasi: buang -en, tempel akhiran',
      'Pilih kata kerja dan pelakunya. Mode <b>Latihan</b>: murid menebak akhirannya dulu.', body);
  }

  function akhiranState(root) {
    const verbBtn = root.querySelector('[data-a-verbs] [aria-pressed="true"]');
    const pronBtn = root.querySelector('[data-a-prons] [aria-pressed="true"]');
    const modeBtn = root.querySelector('[data-a-mode] [aria-pressed="true"]');
    return { verb: verbBtn.dataset.v, index: Number(pronBtn.dataset.i), quiz: modeBtn.dataset.v === 'quiz' };
  }

  function setStage(stage, cls) {
    stage.classList.remove('s0', 's1', 's2', 'ask');
    stage.classList.add(cls);
  }

  async function playAkhiran(root) {
    const alive = newRun(root);
    const { verb, index, quiz } = akhiranState(root);
    const pron = PRON[index];
    const end = endingOf(verb, pron);
    const stage = root.querySelector('[data-stage]');
    root.querySelector('[data-pron]').textContent = pron.p;
    root.querySelector('[data-stem]').textContent = VERBS[verb].stem;
    root.querySelector('[data-end]').textContent = end;
    root.querySelector('[data-x0]').textContent = verb;
    root.querySelector('[data-x1]').textContent = VERBS[verb].stem + '-';
    root.querySelector('[data-x2]').textContent = (pron.label || pron.p) + (quiz ? ' → ?' : ' → -' + end);
    root.querySelector('[data-out]').innerHTML = '';
    root.querySelector('[data-feedback]').innerHTML = '';
    root.querySelector('[data-pick]').hidden = true;

    stage.classList.add('no-anim');
    setStage(stage, 's0');
    setSteps(root, 0);
    void stage.offsetWidth;
    stage.classList.remove('no-anim');

    await wait(900); if (!alive()) return;
    setStage(stage, 's1');
    setSteps(root, 1);
    await wait(1400); if (!alive()) return;
    setSteps(root, 2);
    if (quiz) {
      stage.classList.add('ask');
      root.querySelector('[data-pick]').hidden = false;
      root.querySelector('[data-feedback]').innerHTML = `<p class="anim-note">Akhiran apa untuk <b lang="de">${esc(pron.label || pron.p)}</b>? Murid jawab dulu, lalu klik.</p>`;
      return;
    }
    finishAkhiran(root, false);
  }

  function finishAkhiran(root, fromQuiz) {
    const { verb, index } = akhiranState(root);
    const pron = PRON[index];
    const stage = root.querySelector('[data-stage]');
    stage.classList.remove('ask');
    setStage(stage, 's2');
    setSteps(root, 2);
    root.querySelector('[data-pick]').hidden = true;
    root.querySelector('[data-x2]').textContent = (pron.label || pron.p) + ' → -' + endingOf(verb, pron);
    root.querySelector('[data-feedback]').innerHTML = fromQuiz ? '<p class="anim-good" lang="de">Richtig! <span lang="id">Benar.</span></p>' : '';
    root.querySelector('[data-out]').innerHTML = akhiranResult(verb, index);
  }

  function clickAkhiran(root, target) {
    const group = target.closest('[data-a-verbs], [data-a-prons], [data-a-mode]');
    const button = target.closest('button');
    if (group && button) { press(group, button); playAkhiran(root); return; }
    if (target.closest('[data-a-play]')) { playAkhiran(root); return; }
    if (target.closest('[data-a-rand]')) {
      const verbs = root.querySelectorAll('[data-a-verbs] button');
      const prons = root.querySelectorAll('[data-a-prons] button');
      press(root.querySelector('[data-a-verbs]'), verbs[Math.floor(Math.random() * verbs.length)]);
      press(root.querySelector('[data-a-prons]'), prons[Math.floor(Math.random() * prons.length)]);
      playAkhiran(root);
      return;
    }
    const pick = target.closest('[data-pick] [data-e]');
    if (pick) {
      const { verb, index } = akhiranState(root);
      const pron = PRON[index];
      if (pick.dataset.e === endingOf(verb, pron)) {
        finishAkhiran(root, true);
        say(pron.p + ' ' + VERBS[verb].stem + endingOf(verb, pron));
      } else {
        let hint = 'Ingat polanya: ich -e · du -st · er/sie -t · Sie -en.';
        if (verb === 'heißen' && pron.e === 'st' && pick.dataset.e === 'st') hint = 'Hampir! heiß- sudah berakhir dengan ß, jadi tidak perlu s lagi.';
        if (pron.pl) hint = 'Jamak: wir -en · ihr -t · sie (mereka) -en.';
        root.querySelector('[data-feedback]').innerHTML = `<p class="anim-bad">Belum tepat. ${esc(hint)}</p>`;
        const stage = root.querySelector('[data-stage]');
        stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
      }
    }
  }

  /* =========================================================
     Kartu balik: sein & dusie
     ========================================================= */

  const CARDS = {
    sein: {
      title: 'Kartu tebak: bentuk sein',
      hint: 'sein tidak punya pola. Murid menebak dulu, lalu kartu dibalik.',
      items: [
        { front: 'ich + sein', back: 'ich bin', ex: 'Ich bin Julia.', id: 'Aku Julia.' },
        { front: 'du + sein', back: 'du bist', ex: 'Wer bist du?', id: 'Kamu siapa?' },
        { front: 'er / sie + sein', back: 'er / sie ist', ex: 'Das ist Jan.', id: 'Ini Jan.' },
        { front: 'Sie + sein', back: 'Sie sind', ex: 'Wer sind Sie?', id: 'Anda siapa?' },
        { front: 'wir + sein', back: 'wir sind', ex: 'Wir sind im Deutschkurs.', id: 'Kami di kursus bahasa Jerman.', extra: true },
        { front: 'ihr + sein', back: 'ihr seid', ex: 'Ihr seid super!', id: 'Kalian hebat!', extra: true }
      ]
    },
    dusie: {
      title: 'Kartu tebak: du atau Sie?',
      hint: 'Murid menjawab dulu di chat, lalu kartu dibalik.',
      items: [
        { front: 'Teman sekelas di kursus', back: 'du', why: 'teman, umur sebaya' },
        { front: 'Resepsionis hotel', back: 'Sie', why: 'resmi, belum kenal' },
        { front: 'Adik atau sepupu', back: 'du', why: 'keluarga' },
        { front: 'Bos baru di kantor', back: 'Sie', why: 'situasi kerja' },
        { front: 'Anak tetangga, 7 tahun', back: 'du', why: 'ke anak-anak selalu du' },
        { front: 'Petugas di bandara', back: 'Sie', why: 'petugas resmi' },
        { front: 'Teman baru di Instagram, umur sama', back: 'du', why: 'anak muda biasanya langsung du' },
        { front: 'Guru bahasa Jerman', back: 'Sie', why: 'kecuali guru bilang: Wir können du sagen.' }
      ]
    }
  };

  function renderCards(type) {
    const set = CARDS[type];
    const cards = set.items.map((item, i) => {
      const back = type === 'sein'
        ? `<span class="flip-card__big" lang="de">${esc(item.back)}</span><span class="flip-card__small" lang="de">${esc(item.ex)}</span><span class="flip-card__id">${esc(item.id)}</span>`
        : `<span class="flip-card__big flip-card__big--${item.back === 'du' ? 'du' : 'sie'}" lang="de">${esc(item.back)}</span><span class="flip-card__id">${esc(item.why)}</span>`;
      return `
        <button type="button" class="flip-card${item.extra ? ' flip-card--extra' : ''}" data-card="${i}" aria-pressed="false" aria-label="${esc(item.front)}: balik kartu">
          <span class="flip-card__in">
            <span class="flip-card__face flip-card__front"><span${type === 'sein' ? ' lang="de"' : ''}>${esc(item.front)}</span><span class="flip-card__q">?</span></span>
            <span class="flip-card__face flip-card__back">${back}</span>
          </span>
        </button>`;
    }).join('');
    const extraNote = type === 'sein' ? '<p class="anim-note">Kartu bergaris putus-putus (wir, ihr) adalah tambahan dari modul. Di Netzwerk neu dilatih di Kapitel 2.</p>' : '';
    return frame(type, set.title, esc(set.hint), `
      <div class="flip-grid">${cards}</div>
      ${extraNote}
      <div class="anim-row">
        <button type="button" class="btn btn--primary anim-btn" data-cards-open>Buka semua</button>
        <button type="button" class="btn anim-btn" data-cards-close>Tutup semua</button>
      </div>`);
  }

  function clickCards(root, target, type) {
    const card = target.closest('[data-card]');
    if (card) {
      const open = card.getAttribute('aria-pressed') !== 'true';
      card.setAttribute('aria-pressed', String(open));
      if (open && type === 'sein') say(CARDS.sein.items[Number(card.dataset.card)].ex);
      return;
    }
    if (target.closest('[data-cards-open]')) root.querySelectorAll('[data-card]').forEach((b) => b.setAttribute('aria-pressed', 'true'));
    if (target.closest('[data-cards-close]')) root.querySelectorAll('[data-card]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  }

  /* =========================================================
     posisi2
     ========================================================= */

  const W_EX = [
    { b: 'Woher?', s: ['Du', 'kamu', 'du?'], v: ['kommst', 'berasal'], i: ['aus Bali.', 'dari Bali'], q: ['Woher', 'dari mana'], st: 'Kamu berasal dari Bali.', qt: 'Kamu berasal dari mana?', a: 'Woher kommst du?' },
    { b: 'Wo?', s: ['Sie', 'dia (pr.)', 'sie?'], v: ['wohnt', 'tinggal'], i: ['in Bandung.', 'di Bandung'], q: ['Wo', 'di mana'], st: 'Dia tinggal di Bandung.', qt: 'Dia tinggal di mana?', a: 'Wo wohnt sie?' },
    { b: 'Wie?', s: ['Du', 'kamu', 'du?'], v: ['heißt', 'bernama'], i: ['Budi.', 'Budi'], q: ['Wie', 'bagaimana'], st: 'Namamu Budi.', qt: 'Siapa namamu?', a: 'Wie heißt du?', n: 'Nama ditanya dengan wie (bagaimana), bukan was.' },
    { b: 'Wer?', s: ['Sie', 'Anda', 'Sie?'], v: ['sind', '(adalah)'], i: ['Herr Weber.', 'Pak Weber'], q: ['Wer', 'siapa'], st: 'Anda Pak Weber.', qt: 'Anda siapa?', a: 'Wer sind Sie?', n: 'Sie (Anda) tetap huruf besar, walaupun di akhir kalimat.' },
    { b: 'Welche Sprachen?', s: ['Du', 'kamu', 'du?'], v: ['sprichst', 'berbicara'], i: ['Deutsch und Englisch.', 'bahasa Jerman dan Inggris'], q: ['Welche Sprachen', 'bahasa apa'], st: 'Kamu bisa bahasa Jerman dan Inggris.', qt: 'Kamu bisa bahasa apa?', a: 'Welche Sprachen sprichst du?', n: '„Welche Sprachen“ terdiri dari dua kata, tapi dihitung satu posisi.' },
    { b: 'Wie alt?', s: ['Du', 'kamu', 'du?'], v: ['bist', '(adalah)'], i: ['24 Jahre alt.', 'umur 24 tahun'], q: ['Wie alt', 'berapa umur'], st: 'Umurmu 24 tahun.', qt: 'Berapa umurmu?', a: 'Wie alt bist du?', n: '„Wie alt“ dihitung satu posisi.' }
  ];

  const token = (de, id, cls) =>
    `<span class="anim-tok${cls ? ' ' + cls : ''}"><span class="anim-tok__de" lang="de">${esc(de)}</span><span class="anim-tok__id">${esc(id)}</span></span>`;

  function posisiLine(label, de, id) {
    return `<p class="anim-note">${label}</p>
      <p class="anim-line"><span lang="de">${esc(de)}</span>${c.audioTools({ text: de, meaning: id })}</p>
      <p class="anim-line__id">${esc(id)}</p>`;
  }

  function renderPosisi2() {
    const x = W_EX[0];
    const body = `
      <div class="anim-chips" data-w-ex>${W_EX.map((e, i) => chip(`<span lang="de">${esc(e.b)}</span>`, `data-i="${i}"`, i === 0)).join('')}</div>
      <div class="slot-board" data-board>
        <div class="slot-board__col"><p class="slot-board__head">Posisi 1<br>&nbsp;</p><div class="slot-board__slot" data-slot="1">${token(x.q[0], x.q[1], 'is-q')}</div></div>
        <div class="slot-board__col slot-board__col--verb"><p class="slot-board__head">Posisi 2<br>kata kerja</p><div class="slot-board__slot" data-slot="2">${token(x.v[0], x.v[1])}</div></div>
        <div class="slot-board__col"><p class="slot-board__head">Sisanya<br>&nbsp;</p><div class="slot-board__slot" data-slot="3">${token(x.s[2], x.s[1])}</div></div>
      </div>
      ${steps([
        'Kalimat biasa: pelaku di posisi 1, kata kerja di posisi 2.',
        'Informasi yang ingin ditanyakan diganti dengan <b class="anim-red">kata tanya</b>.',
        'Kata tanya pindah ke posisi 1, pelaku pindah ke belakang. <b>Kata kerja tidak bergerak.</b>'
      ])}
      <div class="anim-out" data-out>${posisiLine('Kalimat tanya', x.a, x.qt)}</div>
      <div class="anim-row">
        <span class="anim-seg" data-w-mode>${chip('Otomatis', 'data-v="auto"', true)}${chip('Per langkah', 'data-v="step"', false)}</span>
        <button type="button" class="btn btn--primary anim-btn" data-w-play>Putar animasi</button>
        <button type="button" class="btn anim-btn" data-w-next hidden>Lanjut</button>
      </div>`;
    return frame('posisi2', 'Animasi: kata kerja tetap di posisi 2',
      'Dari kalimat biasa ke kalimat tanya. Mode <b>Per langkah</b>: klik Lanjut di setiap langkah.', body);
  }

  function wState(root) {
    return {
      x: W_EX[Number(root.querySelector('[data-w-ex] [aria-pressed="true"]').dataset.i)],
      step: root.querySelector('[data-w-mode] [aria-pressed="true"]').dataset.v === 'step'
    };
  }

  function makeTok(de, id, cls) {
    const span = document.createElement('span');
    span.innerHTML = token(de, id, cls);
    return span.firstElementChild;
  }

  function resetPosisi(root) {
    newRun(root);
    const { x } = wState(root);
    const slots = [1, 2, 3].map((n) => root.querySelector(`[data-slot="${n}"]`));
    slots.forEach((slot) => { slot.innerHTML = ''; });
    root._w = { stage: 0, x, slots, s: makeTok(x.s[0], x.s[1]), v: makeTok(x.v[0], x.v[1]), i: makeTok(x.i[0], x.i[1]), q: null };
    slots[0].appendChild(root._w.s);
    slots[1].appendChild(root._w.v);
    slots[2].appendChild(root._w.i);
    setSteps(root, 0);
    root.querySelector('[data-board]').classList.remove('is-hold');
    root.querySelector('[data-out]').innerHTML = posisiLine('Kalimat biasa', `${x.s[0]} ${x.v[0]} ${x.i[0]}`, x.st);
    root.querySelector('[data-w-next]').disabled = false;
  }

  function placeQuestion(root) {
    const w = root._w;
    if (w.q) return;
    if (w.i.parentNode) w.i.remove();
    w.q = makeTok(w.x.q[0], w.x.q[1], 'is-q' + (reduced.matches ? '' : ' is-pop'));
    w.slots[2].appendChild(w.q);
  }

  async function advancePosisi(root) {
    const w = root._w;
    const alive = () => root._w === w;
    if (w.stage === 0) {
      w.stage = 1;
      setSteps(root, 1);
      w.i.classList.add('is-asked');
      await wait(800); if (!alive()) return;
      w.i.classList.add('is-out');
      await wait(450); if (!alive()) return;
      placeQuestion(root);
    } else if (w.stage === 1) {
      placeQuestion(root);
      w.stage = 2;
      setSteps(root, 2);
      w.s.querySelector('.anim-tok__de').textContent = w.x.s[2];
      flipMove([[w.q, w.slots[0]], [w.s, w.slots[2]]], [-48, 48]);
      const board = root.querySelector('[data-board]');
      board.classList.remove('is-hold'); void board.offsetWidth; board.classList.add('is-hold');
    } else if (w.stage === 2) {
      w.stage = 3;
      root.querySelector('[data-out]').innerHTML = posisiLine('Kalimat tanya', w.x.a, w.x.qt) +
        `<p class="anim-good">Kata kerja „<span lang="de">${esc(w.x.v[0])}</span>“ tidak pindah: tetap di posisi 2.</p>` +
        (w.x.n ? `<p class="anim-note">${esc(w.x.n)}</p>` : '');
      root.querySelector('[data-w-next]').disabled = true;
    }
  }

  async function playPosisi(root) {
    resetPosisi(root);
    if (wState(root).step) return;
    const w = root._w;
    for (const pause of [1500, 2300, 1400]) {
      await wait(pause);
      if (root._w !== w) return;
      await advancePosisi(root);
    }
  }

  function clickPosisi(root, target) {
    const group = target.closest('[data-w-ex], [data-w-mode]');
    const button = target.closest('button');
    if (group && button) {
      press(group, button);
      root.querySelector('[data-w-next]').hidden = !wState(root).step;
      playPosisi(root);
      return;
    }
    if (target.closest('[data-w-play]')) { playPosisi(root); return; }
    if (target.closest('[data-w-next]')) {
      if (!root._w) resetPosisi(root);
      advancePosisi(root);
    }
  }

  /* =========================================================
     ersie
     ========================================================= */

  const ES_EX = [
    { name: 'Frau Lang', pron: 'Sie', rest: 'kommt aus Deutschland.', id1: 'Ini Bu Lang.', id2: 'Ia berasal dari Jerman.', why: 'Frau Lang perempuan → sie' },
    { name: 'Jan', pron: 'Er', rest: 'wohnt in Zürich.', id1: 'Ini Jan.', id2: 'Ia tinggal di Zürich.', why: 'Jan laki-laki → er' },
    { name: 'Budi', pron: 'Er', rest: 'kommt aus Indonesien.', id1: 'Ini Budi.', id2: 'Ia berasal dari Indonesia.', why: 'Budi laki-laki → er' },
    { name: 'Dewi', pron: 'Sie', rest: 'wohnt in Jakarta.', id1: 'Ini Dewi.', id2: 'Ia tinggal di Jakarta.', why: 'Dewi perempuan → sie' },
    { name: 'Herr Hansen', pron: 'Er', rest: 'spricht Deutsch und Englisch.', id1: 'Ini Pak Hansen.', id2: 'Ia berbicara bahasa Jerman dan Inggris.', why: 'Herr Hansen laki-laki → er' }
  ];

  function ersieMarkup(x, replaced) {
    return `
      <p class="es-line"><span lang="de">Das ist <b class="es-name">${esc(x.name)}</b>.</span> <span class="anim-line__id">${esc(x.id1)}</span></p>
      <p class="es-line" lang="de">
        <span class="es-slot" data-es-slot>${replaced
          ? `<b class="es-pron">${esc(x.pron)}</b><span class="es-tag">= ${esc(x.name)}</span>`
          : `<b class="es-name" data-es-name>${esc(x.name)}</b>`}</span>
        <span>${esc(x.rest)}</span>
      </p>
      <p class="anim-line__id">${esc(x.id2)}</p>`;
  }

  function renderErsie() {
    const x = ES_EX[0];
    return frame('ersie', 'Animasi: nama diganti er / sie', 'Supaya nama tidak diulang, kalimat kedua memakai <b lang="de">er</b> atau <b lang="de">sie</b>.', `
      <div class="anim-chips" data-es-ex>${ES_EX.map((e, i) => chip(`<span lang="de">${esc(e.name)}</span>`, `data-i="${i}"`, i === 0)).join('')}</div>
      <div class="es-board" data-es-board>${ersieMarkup(x, true)}</div>
      <div class="anim-out" data-out><p class="anim-good">${esc(x.why)}</p>${c.audioTools({ text: `Das ist ${x.name}. ${x.pron} ${x.rest}`, meaning: `${x.id1} ${x.id2}` })}</div>
      <div class="anim-row"><button type="button" class="btn btn--primary anim-btn" data-es-play>Putar animasi</button></div>`);
  }

  async function playErsie(root) {
    const alive = newRun(root);
    const x = ES_EX[Number(root.querySelector('[data-es-ex] [aria-pressed="true"]').dataset.i)];
    const board = root.querySelector('[data-es-board]');
    board.innerHTML = ersieMarkup(x, false);
    root.querySelector('[data-out]').innerHTML = '<p class="anim-note">Nama yang sama muncul dua kali. Terlalu panjang!</p>';
    await wait(1300); if (!alive()) return;
    const name = board.querySelector('[data-es-name]');
    name.classList.add('is-asked');
    await wait(700); if (!alive()) return;
    name.classList.add('is-out');
    await wait(400); if (!alive()) return;
    const slot = board.querySelector('[data-es-slot]');
    slot.innerHTML = `<b class="es-pron${reduced.matches ? '' : ' is-pop'}">${esc(x.pron)}</b><span class="es-tag">= ${esc(x.name)}</span>`;
    root.querySelector('[data-out]').innerHTML = `<p class="anim-good">${esc(x.why)}</p>${c.audioTools({ text: `Das ist ${x.name}. ${x.pron} ${x.rest}`, meaning: `${x.id1} ${x.id2}` })}`;
  }

  function clickErsie(root, target) {
    const group = target.closest('[data-es-ex]');
    const button = target.closest('button');
    if (group && button) { press(group, button); playErsie(root); return; }
    if (target.closest('[data-es-play]')) playErsie(root);
  }

  /* =========================================================
     aus
     ========================================================= */

  const LAND = [
    { land: 'Indonesien', art: '', lang: 'Indonesisch', id: 'Indonesia' },
    { land: 'Deutschland', art: '', lang: 'Deutsch', id: 'Jerman' },
    { land: 'Österreich', art: '', lang: 'Deutsch', id: 'Austria' },
    { land: 'Japan', art: '', lang: 'Japanisch', id: 'Jepang' },
    { land: 'Spanien', art: '', lang: 'Spanisch', id: 'Spanyol' },
    { land: 'Schweiz', art: 'der', lang: 'Deutsch, Französisch, Italienisch', id: 'Swiss', base: 'die Schweiz' },
    { land: 'Türkei', art: 'der', lang: 'Türkisch', id: 'Turki', base: 'die Türkei' },
    { land: 'USA', art: 'den', lang: 'Englisch', id: 'Amerika Serikat', base: 'die USA (jamak)' }
  ];

  function ausMarkup(x, pop) {
    const p = pop && !reduced.matches ? ' is-pop' : '';
    const de1 = `Ich komme aus ${x.art ? x.art + ' ' : ''}${x.land}.`;
    const de2 = `Man spricht ${x.lang}.`;
    return `
      <p class="anim-line"><span lang="de">Ich komme <b class="aus-aus">aus</b> ${x.art ? `<b class="aus-art${p}">${x.art}</b> ` : ''}<b class="aus-land">${esc(x.land)}</b>.</span>${c.audioTools({ text: de1, meaning: 'Saya berasal dari ' + x.id + '.' })}</p>
      <p class="anim-line__id">Saya berasal dari ${esc(x.id)}.</p>
      <p class="anim-line"><span lang="de">Man spricht <b class="aus-lang${p}">${esc(x.lang)}</b>.</span>${c.audioTools({ text: de2, meaning: 'Di sana orang berbicara bahasa ' + x.lang + '.' })}</p>
      <p class="anim-line__id">Di sana orang berbicara bahasa itu.</p>
      ${x.art
        ? `<p class="anim-note">Negara ini punya artikel: <b lang="de">${esc(x.base)}</b>. Jadi setelah aus menjadi <b lang="de">aus ${x.art}</b>.</p>`
        : '<p class="anim-note">Kebanyakan negara tanpa artikel: cukup <b lang="de">aus</b> + nama negara.</p>'}`;
  }

  function renderAus() {
    return frame('aus', 'Coba: aus + negara', 'Klik negara. Perhatikan negara yang memakai artikel.', `
      <div class="anim-chips" data-aus>${LAND.map((l, i) => chip(`<span lang="de">${esc(l.base ? l.base.replace(' (jamak)', '') : l.land)}</span>`, `data-i="${i}"`, i === 5)).join('')}</div>
      <div class="aus-board" data-aus-board>${ausMarkup(LAND[5], false)}</div>`);
  }

  function clickAus(root, target) {
    const group = target.closest('[data-aus]');
    const button = target.closest('button');
    if (!group || !button) return;
    press(group, button);
    root.querySelector('[data-aus-board]').innerHTML = ausMarkup(LAND[Number(button.dataset.i)], true);
  }

  /* =========================================================
     angka 21–99
     ========================================================= */

  const UNITS = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
  const TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
  const ID_UNITS = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];

  function numParts(n) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    return { t, u, ten: TENS[t], one: u === 1 ? 'ein' : UNITS[u], idTen: ID_UNITS[t] + ' puluh', idOne: ID_UNITS[u] };
  }

  function angkaNote(n) {
    const { t, u } = numParts(n);
    const notes = [];
    if (u === 1) notes.push('eins menjadi ein di depan und.');
    if (t === 3) notes.push('dreißig memakai -ßig, bukan -zig.');
    if (t === 6) notes.push('sechzig: sechs kehilangan huruf s.');
    if (t === 7) notes.push('siebzig: sieben kehilangan -en.');
    return notes.join(' ');
  }

  function angkaFinal(n) {
    const p = numParts(n);
    return `<span class="num-word" lang="de"><span class="num-one">${p.one}</span><span class="num-und">und</span><span class="num-ten">${p.ten}</span></span>`;
  }

  function renderAngka() {
    const n = 25;
    const p = numParts(n);
    return frame('angka', 'Animasi: angka 21–99', 'Bahasa Indonesia: puluhan dulu. Bahasa Jerman: <b>satuan dulu</b>, lalu und, lalu puluhan.', `
      <div class="anim-row">
        <label class="anim-num"><span class="visually-hidden">Angka 21 sampai 99</span><input type="number" min="21" max="99" value="${n}" data-n-in lang="de"></label>
        <button type="button" class="btn anim-btn" data-n-rand>Acak</button>
        <button type="button" class="btn btn--primary anim-btn" data-n-play>Putar animasi</button>
      </div>
      <p class="num-digit" data-n-digit>${n}</p>
      <div class="num-board" data-n-board>${angkaFinal(n)}</div>
      ${steps([
        `Bahasa Indonesia: <b data-n-id>${p.idTen} ${p.idOne}</b> (puluhan dulu).`,
        'Bahasa Jerman membalik urutannya: satuan pindah ke depan.',
        'Tambahkan <b lang="de">und</b> di tengah, lalu tulis jadi satu kata.'
      ])}
      <div class="anim-out" data-out>${c.audioTools({ text: String(n), meaning: p.idTen + ' ' + p.idOne })}<p class="anim-note">${esc(angkaNote(n))}</p></div>`);
  }

  function angkaValue(root) {
    const input = root.querySelector('[data-n-in]');
    let n = parseInt(input.value, 10);
    if (isNaN(n) || n < 21) n = 21;
    if (n > 99) n = 99;
    if (n % 10 === 0) n += 1;
    input.value = n;
    return n;
  }

  async function playAngka(root) {
    const alive = newRun(root);
    const n = angkaValue(root);
    const p = numParts(n);
    const board = root.querySelector('[data-n-board]');
    root.querySelector('[data-n-digit]').textContent = n;
    root.querySelector('[data-n-id]').textContent = `${p.idTen} ${p.idOne}`;
    root.querySelector('[data-out]').innerHTML = '';
    board.innerHTML = `<span class="num-row">${token(p.ten, p.idTen, 'num-tok num-tok--ten')}${token(p.one, p.idOne, 'num-tok num-tok--one')}</span>`;
    setSteps(root, 0);
    await wait(1400); if (!alive()) return;
    setSteps(root, 1);
    const row = board.querySelector('.num-row');
    const ten = row.querySelector('.num-tok--ten');
    const one = row.querySelector('.num-tok--one');
    flipMove([[one, row, ten]], [-40]);
    await wait(1200); if (!alive()) return;
    setSteps(root, 2);
    const und = makeTok('und', 'dan', 'num-tok num-tok--und' + (reduced.matches ? '' : ' is-pop'));
    row.insertBefore(und, ten);
    await wait(1000); if (!alive()) return;
    row.classList.add('is-join');
    await wait(700); if (!alive()) return;
    board.innerHTML = angkaFinal(n);
    root.querySelector('[data-out]').innerHTML = `${c.audioTools({ text: String(n), meaning: p.idTen + ' ' + p.idOne })}${angkaNote(n) ? `<p class="anim-note">${esc(angkaNote(n))}</p>` : ''}`;
    say(String(n));
  }

  function clickAngka(root, target) {
    if (target.closest('[data-n-play]')) { playAngka(root); return; }
    if (target.closest('[data-n-rand]')) {
      let n;
      do { n = 21 + Math.floor(Math.random() * 79); } while (n % 10 === 0);
      root.querySelector('[data-n-in]').value = n;
      playAngka(root);
    }
  }

  /* =========================================================
     Pendaftaran
     ========================================================= */

  const TYPES = {
    akhiran: { render: () => renderAkhiran('akhiran'), click: clickAkhiran },
    'akhiran-jamak': { render: () => renderAkhiran('akhiran-jamak'), click: clickAkhiran },
    sein: { render: () => renderCards('sein'), click: (root, t) => clickCards(root, t, 'sein') },
    dusie: { render: () => renderCards('dusie'), click: (root, t) => clickCards(root, t, 'dusie') },
    posisi2: { render: renderPosisi2, click: clickPosisi },
    ersie: { render: renderErsie, click: clickErsie },
    aus: { render: renderAus, click: clickAus },
    angka: { render: renderAngka, click: clickAngka }
  };

  /** HTML animasi; kosong bila jenisnya tidak dikenal. */
  function render(type) {
    const entry = TYPES[type];
    if (!entry) {
      if (type) console.warn(`[anim] Jenis animasi "${type}" tidak dikenal.`);
      return '';
    }
    return entry.render();
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-speak], [data-practice]')) return;
    const root = event.target.closest('[data-anim]');
    if (!root) return;
    const entry = TYPES[root.dataset.anim];
    if (entry) entry.click(root, event.target);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const input = event.target.closest && event.target.closest('[data-n-in]');
    if (!input) return;
    event.preventDefault();
    playAngka(input.closest('[data-anim]'));
  });

  DL.anim = { render, types: Object.keys(TYPES) };
})(window.DL = window.DL || {});
