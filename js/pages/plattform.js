/* =========================================================
   DeutschLern — pages/plattform.js
   Halaman Plattform (#/materi/p1): tanpa kosakata baru. Isinya kuis
   campuran yang dibuat otomatis dari 3 Kapitel sumbernya:
   tebak arti, tebak artikel, dan soal isian dari latihan grammar.
   Semua soal dijawab benar = Plattform selesai.
   ========================================================= */
(function (DL) {
  'use strict';

  const c = DL.components;
  const esc = c.escapeHtml;

  const MEANING_QUESTIONS = 6;
  const ARTICLE_QUESTIONS = 3;
  const TYPED_QUESTIONS = 3;
  const ARTICLES = ['der', 'die', 'das'];

  function shuffle(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /* ---------- Membuat soal ---------- */

  function buildQuestions(entry) {
    const sources = DL.data.plattformKapitel(entry);
    const words = [];
    const exercises = [];
    sources.forEach((source) => {
      source.kosakata.forEach((word) => words.push({ word, source }));
      source.grammatik.forEach((grammar) => {
        grammar.latihan.forEach((item) => exercises.push({ item, source }));
      });
    });

    // Kata penting didahulukan.
    const mixed = shuffle(words);
    const ordered = mixed.filter((pick) => pick.word.wichtig).concat(mixed.filter((pick) => !pick.word.wichtig));
    const meanings = ordered.slice(0, MEANING_QUESTIONS);
    const articles = ordered
      .filter((pick) => pick.word.artikel && !meanings.includes(pick))
      .slice(0, ARTICLE_QUESTIONS);

    const meaningQuestions = meanings.map((pick) => {
      const others = shuffle(words.map((other) => other.word.id).filter((id) => id !== pick.word.id));
      const unique = others.filter((id, index) => others.indexOf(id) === index).slice(0, 2);
      const options = shuffle(unique.concat(pick.word.id));
      return {
        type: 'choice',
        source: pick.source,
        prompt: c.germanTerm(pick.word),
        hint: 'Apa artinya?',
        options,
        optionLang: null,
        answer: options.indexOf(pick.word.id)
      };
    });

    const articleQuestions = articles.map((pick) => ({
      type: 'choice',
      source: pick.source,
      prompt: `<span lang="de">${DL.materi.BLANK} ${esc(pick.word.de)}</span>`,
      hint: 'Artikel yang benar?',
      options: ARTICLES,
      optionLang: 'de',
      answer: ARTICLES.indexOf(pick.word.artikel)
    }));

    const typedQuestions = shuffle(exercises).slice(0, TYPED_QUESTIONS).map((pick) => ({
      type: 'typed',
      source: pick.source,
      item: pick.item
    }));

    return shuffle(meaningQuestions.concat(articleQuestions, typedQuestions));
  }

  function choiceItem(question, index) {
    const lang = question.optionLang ? ` lang="${question.optionLang}"` : '';
    const options = question.options.map((option, optionIndex) => `
      <button class="quiz__option" type="button"${lang} data-quiz-option="${optionIndex}">${esc(option)}</button>`
    ).join('');

    return `
      <li class="quiz" data-quiz-item="${index}">
        <p class="quiz__question">${question.prompt}</p>
        <p class="quiz__hint">${esc(question.hint)} <span class="quiz__source">${esc(question.source.label)}</span></p>
        <div class="quiz__options" role="group" aria-label="Pilihan jawaban soal ${index + 1}">${options}</div>
        <p class="quiz__feedback" data-quiz-feedback aria-live="polite"></p>
        <p class="quiz__key teacher-only">Kunci: <b>${esc(question.options[question.answer])}</b></p>
      </li>`;
  }

  function quizHtml(questions) {
    return questions.map((question, index) => (question.type === 'choice'
      ? choiceItem(question, index)
      : DL.materi.exerciseItem(String(index), question.item))).join('');
  }

  /* ---------- Halaman ---------- */

  function sourceList(entry) {
    return DL.data.plattformKapitel(entry).map((source) => `
      <li class="source-list__item">
        <a href="#/materi/${esc(source.id)}">${esc(source.label)}: <span lang="de">${esc(source.judul_de)}</span></a>
        ${c.statusStamp(DL.materi.statusOf(source))}
      </li>`).join('');
  }

  function nextLink(entry) {
    const next = DL.data.neighbor(entry, 1);
    return next
      ? `<a class="btn btn--primary" href="#/materi/${esc(next.id)}">Lanjut ke ${esc(next.label)} <span aria-hidden="true">›</span></a>`
      : '<a class="btn btn--primary" href="#/materi">Lihat semua perjalanan <span aria-hidden="true">›</span></a>';
  }

  function render(entry) {
    const landeskunde = entry.landeskunde.length
      ? entry.landeskunde.map((line) => `<p class="grammar__text">${c.richText(line)}</p>`).join('')
      : '<p class="book-page__empty">Bagian ini belum diisi.</p>';

    const left = `
      <h2 class="book-page__title">Wawasan budaya <span class="book-page__de" lang="de">Landeskunde</span></h2>
      ${landeskunde}
      <h2 class="book-page__title plattform__sources-title">Kapitel yang diulang</h2>
      <ul class="source-list">${sourceList(entry)}</ul>`;

    const quiz = DL.data.isFilled(entry)
      ? `
        <p class="quiz-intro">Tidak ada kosakata baru di sini. Soal diambil acak dari tiga Kapitel di samping. Semua benar = Plattform selesai!</p>
        <ol class="quiz-list" data-plattform-quiz></ol>
        <div class="quiz-done" data-quiz-done role="status" hidden>
          <span class="quiz-done__stamp" aria-hidden="true">Gut gemacht!</span>
          <p class="quiz-done__text"><strong>${esc(entry.judul)} selesai.</strong> Semua jawaban benar.</p>
          <div class="quiz-done__actions">
            ${nextLink(entry)}
            <button class="link-btn" type="button" data-quiz-reset>Kuis baru</button>
          </div>
        </div>`
      : `<p class="book-page__empty">Kuis ini muncul setelah kosakata Kapitel ${entry.kapitel.join(', ')} diisi.</p>`;

    const right = `
      <h2 class="book-page__title">Kuis campuran <span class="book-page__de" lang="de">Quiz</span></h2>
      ${quiz}`;

    return `
      <article class="chapter chapter--plattform" aria-labelledby="page-title">
        ${DL.materi.head(entry)}
        <div class="chapter-tools">
          <div class="chapter-tools__left"></div>
          <div class="chapter-tools__right">${DL.teacher.toggleButton()}</div>
        </div>
        ${c.notebook({ left, right, className: 'chapter-book plattform-book' })}
      </article>`;
  }

  function mount(outlet, entry) {
    const list = outlet.querySelector('[data-plattform-quiz]');
    if (!list) return null;
    DL.storage.recordChapterVisit(entry.id);

    const done = outlet.querySelector('[data-quiz-done]');
    let questions = [];
    let solved = new Set();

    function start() {
      questions = buildQuestions(entry);
      solved = new Set();
      list.innerHTML = quizHtml(questions);
      done.hidden = true;
    }

    function markSolved(index) {
      solved.add(index);
      if (solved.size === questions.length) {
        DL.storage.completeChapter(entry.id);
        DL.materi.setStamp(outlet, 'selesai');
        done.hidden = false;
      }
    }

    function answerChoice(itemElement, option) {
      const index = Number(itemElement.dataset.quizItem);
      const question = questions[index];
      if (solved.has(index) || option.getAttribute('aria-disabled') === 'true') return;
      const feedback = itemElement.querySelector('[data-quiz-feedback]');

      if (Number(option.dataset.quizOption) !== question.answer) {
        option.classList.add('is-wrong');
        option.setAttribute('aria-disabled', 'true');
        feedback.className = 'quiz__feedback is-wrong';
        feedback.innerHTML = '<span aria-hidden="true">✗</span> Belum tepat, coba lagi!';
        return;
      }

      itemElement.classList.add('is-solved');
      option.classList.add('is-correct');
      itemElement.querySelectorAll('[data-quiz-option]').forEach((button) => button.setAttribute('aria-disabled', 'true'));
      itemElement.querySelectorAll('[data-quiz-blank]').forEach((blank) => {
        blank.textContent = question.options[question.answer];
        blank.classList.add('is-filled');
      });
      feedback.className = 'quiz__feedback is-correct';
      feedback.innerHTML = '<span lang="de">Richtig!</span>';
      markSolved(index);
    }

    function onClick(event) {
      const option = event.target.closest('[data-quiz-option]');
      if (option) {
        answerChoice(option.closest('[data-quiz-item]'), option);
        return;
      }
      if (event.target.closest('[data-quiz-reset]')) {
        start();
        const first = list.querySelector('button, input');
        if (first) first.focus();
      }
    }

    function onSubmit(event) {
      const form = event.target.closest('[data-exercise]');
      if (!form) return;
      event.preventDefault();
      const index = Number(form.dataset.exercise);
      if (DL.materi.checkExercise(form, questions[index].item)) markSolved(index);
    }

    outlet.addEventListener('click', onClick);
    outlet.addEventListener('submit', onSubmit);
    start();

    return () => {
      outlet.removeEventListener('click', onClick);
      outlet.removeEventListener('submit', onSubmit);
    };
  }

  DL.materi.plattform = { render, mount };
})(window.DL = window.DL || {});
