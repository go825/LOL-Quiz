import { QUIZZES, findQuiz } from './quizzes/catalog.js';
import { ChampionRepository } from './core/data/champion-repository.js';
import { checkChampionAnswer, createChampionQuestion } from './quizzes/champion/champion-quiz.js';
import { createZoomQuestion } from './quizzes/zoom/zoom-quiz.js';
import { createSkillIconQuestion } from './quizzes/skill-icon/skill-icon-quiz.js';
import { createSkillNameQuestion } from './quizzes/skill-name/skill-name-quiz.js';
import { createSkillDescriptionQuestion, stripMarkup } from './quizzes/skill-description/skill-description-quiz.js';
import { createVoiceQuestion } from './quizzes/voice/voice-quiz.js';
import { DIFFICULTIES, QUESTION_COUNTS, advanceSession, createSession, endSession, getResult, recordAnswer } from './core/quiz/session.js';

const app = document.querySelector('#app');
const repositoryPromise = ChampionRepository.load().catch((error) => {
  console.error('[LoL Quiz] Champion Repository initialization failed', error);
  return null;
});
const state = { screen: 'home', quizId: null, difficulty: 'easy', questionCount: 5, session: null, answered: false, repository: null, question: null, excludedIds: new Set() };

function navigate(screen) {
  state.screen = screen;
  window.location.hash = screen;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function render() {
  const views = { home: renderHome, settings: renderSettings, quiz: renderQuiz, result: renderResult };
  app.innerHTML = `<div class="app-shell"><header class="site-header"><button class="brand" data-action="home"><span class="brand-mark">LQ</span><span>LoL QUIZ</span></button><span class="phase-badge">PHASE 8</span></header><main>${(views[state.screen] || renderHome)()}</main><footer>LoL Quiz は Riot Games によって承認されたものではなく、Riot Games またはその関係者の見解や意見を反映するものではありません。</footer></div>`;
  bindEvents();
}

function renderHome() {
  return `<section class="hero"><p class="eyebrow">KNOW YOUR CHAMPION</p><h1>知識を、試練へ。</h1><p>League of Legendsのチャンピオンを、7つのクイズで極めよう。</p></section><section class="quiz-grid">${QUIZZES.map((quiz) => `<button class="quiz-card" data-quiz="${quiz.id}"><span class="card-icon">${quiz.icon}</span><span><strong>${quiz.title}</strong><small>${quiz.description}</small></span><span class="arrow">→</span></button>`).join('')}</section><p class="demo-note">6種類のQuizを実装済みです。Mixedは次のPhaseで追加します。</p>`;
}

function renderSettings() {
  const quiz = findQuiz(state.quizId);
  return `<section class="panel"><button class="text-button" data-action="home">← クイズ一覧</button><p class="eyebrow">QUIZ SETTINGS</p><h1>${quiz.title}</h1><p>${quiz.description}</p><fieldset><legend>難易度</legend><div class="choice-grid">${Object.entries(DIFFICULTIES).map(([id, item]) => `<button class="choice ${state.difficulty === id ? 'selected' : ''}" data-difficulty="${id}"><strong>${item.label}</strong><small>${item.answerMode}</small></button>`).join('')}</div></fieldset><fieldset><legend>問題数</legend><div class="count-grid">${QUESTION_COUNTS.map((count) => `<button class="choice ${state.questionCount === count ? 'selected' : ''}" data-count="${count}">${count}</button>`).join('')}</div></fieldset><button class="primary" data-action="start">START</button><p class="demo-note">Phase 1では共通フロー確認用のダミー問題が出題されます。</p></section>`;
}

function renderQuiz() {
  if (state.quizId === 'champion') return renderChampionQuiz();
  if (state.quizId === 'zoom') return renderZoomQuiz();
  if (state.quizId === 'skill-icon') return renderSkillIconQuiz();
  if (state.quizId === 'skill-name') return renderSkillNameQuiz();
  if (state.quizId === 'skill-description') return renderSkillDescriptionQuiz();
  if (state.quizId === 'voice') return renderVoiceQuiz();
  const quiz = findQuiz(state.quizId);
  const questionNumber = state.session.currentIndex + 1;
  const lastAnswer = state.session.answers.at(-1);
  return `<section class="quiz-layout"><div class="quiz-top"><div><span class="eyebrow">${quiz.title.toUpperCase()}</span><strong>${questionNumber} <small>/ ${state.session.questionCount}</small></strong></div><button class="danger" data-action="finish">終了</button></div><div class="progress"><span style="width:${questionNumber / state.session.questionCount * 100}%"></span></div><article class="question-panel"><span class="demo-orb">?</span><p class="eyebrow">DEMO QUESTION</p><h1>共通クイズ画面</h1><p>回答、正誤表示、手動での「次の問題」、途中終了を確認するためのダミー問題です。</p></article>${state.answered ? `<section class="feedback ${lastAnswer.correct ? 'correct' : 'wrong'}"><strong>${lastAnswer.correct ? '正解' : '不正解'}</strong><p>Phase 2以降で実際のChampionデータに置き換わります。</p><button class="primary" data-action="next">${questionNumber === state.session.questionCount ? 'RESULT' : '次の問題'}</button></section>` : `<section class="answer-grid"><button class="answer" data-answer="true">正解として回答</button><button class="answer" data-answer="false">不正解として回答</button></section>`}</section>`;
}

function renderZoomQuiz() {
  const questionNumber = state.session.currentIndex + 1;
  const champion = state.repository.getById(state.question.championId);
  const lastAnswer = state.session.answers.at(-1);
  const answerArea = state.answered
    ? `<section class="feedback ${lastAnswer.correct ? 'correct' : 'wrong'}"><strong>${lastAnswer.correct ? '正解' : '不正解'}</strong><div class="answer-reveal"><img src="${champion.icon}" alt=""><div><span>正解</span><h2>${champion.nameJa}</h2><p>${champion.nameEn}</p></div></div><button class="primary" data-action="next">${questionNumber === state.session.questionCount ? 'RESULT' : '次の問題'}</button></section>`
    : renderChampionAnswerArea();
  const style = `background-image:url('${state.question.image}');background-size:${state.question.zoom * 100}% auto;background-position:${state.question.position.x}% ${state.question.position.y}%`;
  return `<section class="quiz-layout"><div class="quiz-top"><div><span class="eyebrow">ZOOM</span><strong>${questionNumber} <small>/ ${state.session.questionCount}</small></strong></div><button class="danger" data-action="finish">終了</button></div><div class="progress"><span style="width:${questionNumber / state.session.questionCount * 100}%"></span></div><article class="question-panel zoom-question"><p class="eyebrow">WHO IS THIS CHAMPION?</p><div class="zoom-crop" role="img" aria-label="拡大されたChampion Splash Art" style="${style}"></div><h1>このChampionは？</h1></article>${answerArea}</section>`;
}

function renderSkillIconQuiz() {
  const questionNumber = state.session.currentIndex + 1;
  const champion = state.repository.getById(state.question.championId);
  const lastAnswer = state.session.answers.at(-1);
  const answerArea = state.answered
    ? `<section class="feedback ${lastAnswer.correct ? 'correct' : 'wrong'}"><strong>${lastAnswer.correct ? '正解' : '不正解'}</strong><div class="answer-reveal skill-reveal"><img src="${champion.icon}" alt=""><div><span>正解 · ${state.question.ability.position}</span><h2>${champion.nameJa}</h2><p>${state.question.ability.name}</p></div></div><button class="primary" data-action="next">${questionNumber === state.session.questionCount ? 'RESULT' : '次の問題'}</button></section>`
    : renderChampionAnswerArea();
  return `<section class="quiz-layout"><div class="quiz-top"><div><span class="eyebrow">SKILL ICON</span><strong>${questionNumber} <small>/ ${state.session.questionCount}</small></strong></div><button class="danger" data-action="finish">終了</button></div><div class="progress"><span style="width:${questionNumber / state.session.questionCount * 100}%"></span></div><article class="question-panel skill-icon-question"><p class="eyebrow">WHO USES THIS SKILL?</p><img class="skill-icon-large" src="${state.question.image}" alt="Championを当てるスキルアイコン"><h1>このスキルのChampionは？</h1></article>${answerArea}</section>`;
}

function renderSkillNameQuiz() {
  const questionNumber = state.session.currentIndex + 1;
  const champion = state.repository.getById(state.question.championId);
  const lastAnswer = state.session.answers.at(-1);
  const answerArea = state.answered
    ? `<section class="feedback ${lastAnswer.correct ? 'correct' : 'wrong'}"><strong>${lastAnswer.correct ? '正解' : '不正解'}</strong><div class="answer-reveal skill-name-reveal"><img src="${state.question.image}" alt="${state.question.ability.name}"><div><span>正解 · ${state.question.ability.position}</span><h2>${champion.nameJa}</h2><p>${state.question.ability.name}</p></div></div><button class="primary" data-action="next">${questionNumber === state.session.questionCount ? 'RESULT' : '次の問題'}</button></section>`
    : renderChampionAnswerArea();
  return `<section class="quiz-layout"><div class="quiz-top"><div><span class="eyebrow">SKILL NAME</span><strong>${questionNumber} <small>/ ${state.session.questionCount}</small></strong></div><button class="danger" data-action="finish">終了</button></div><div class="progress"><span style="width:${questionNumber / state.session.questionCount * 100}%"></span></div><article class="question-panel skill-name-question"><p class="eyebrow">WHO USES THIS SKILL?</p><span class="slot-mystery">?</span><h1>${state.question.ability.name}</h1><p>このスキルを使うChampionは？</p></article>${answerArea}</section>`;
}

function renderSkillDescriptionQuiz() {
  const questionNumber = state.session.currentIndex + 1;
  const champion = state.repository.getById(state.question.championId);
  const lastAnswer = state.session.answers.at(-1);
  const description = escapeHtml(stripMarkup(state.question.ability.description)).replace(/\n/g, '<br>');
  const answerArea = state.answered
    ? `<section class="feedback ${lastAnswer.correct ? 'correct' : 'wrong'}"><strong>${lastAnswer.correct ? '正解' : '不正解'}</strong><div class="answer-reveal description-reveal"><img src="${state.question.image}" alt="${escapeHtml(state.question.ability.name)}"><div><span>正解 · ${state.question.ability.position}</span><h2>${champion.nameJa}</h2><p>${escapeHtml(state.question.ability.name)}</p></div></div><p class="description-review">${description}</p><button class="primary" data-action="next">${questionNumber === state.session.questionCount ? 'RESULT' : '次の問題'}</button></section>`
    : renderChampionAnswerArea();
  return `<section class="quiz-layout"><div class="quiz-top"><div><span class="eyebrow">SKILL DESCRIPTION</span><strong>${questionNumber} <small>/ ${state.session.questionCount}</small></strong></div><button class="danger" data-action="finish">終了</button></div><div class="progress"><span style="width:${questionNumber / state.session.questionCount * 100}%"></span></div><article class="question-panel skill-description-question"><p class="eyebrow">WHO USES THIS SKILL?</p><span class="slot-mystery">?</span><div class="description-text">${description}</div><p>このスキルを使うChampionは？</p></article>${answerArea}</section>`;
}

function renderVoiceQuiz() {
  const questionNumber = state.session.currentIndex + 1;
  const champion = state.repository.getById(state.question.championId);
  const lastAnswer = state.session.answers.at(-1);
  const answerArea = state.answered
    ? `<section class="feedback ${lastAnswer.correct ? 'correct' : 'wrong'}"><strong>${lastAnswer.correct ? '正解' : '不正解'}</strong><div class="answer-reveal"><img src="${champion.icon}" alt=""><div><span>正解</span><h2>${champion.nameJa}</h2><p>${champion.nameEn}</p></div></div><button class="primary" data-action="next">${questionNumber === state.session.questionCount ? 'RESULT' : '次の問題'}</button></section>`
    : renderChampionAnswerArea();
  return `<section class="quiz-layout"><div class="quiz-top"><div><span class="eyebrow">VOICE</span><strong>${questionNumber} <small>/ ${state.session.questionCount}</small></strong></div><button class="danger" data-action="finish">終了</button></div><div class="progress"><span style="width:${questionNumber / state.session.questionCount * 100}%"></span></div><article class="question-panel voice-question"><p class="eyebrow">LISTEN AND IDENTIFY</p><span class="voice-emblem">♪</span><h1>この声のChampionは？</h1><div class="voice-controls"><button class="voice-button" data-voice="pick"><strong>▶ Pickを聞く</strong><small>選択時のボイス</small></button><button class="voice-button" data-voice="ban"><strong>▶ Banを聞く</strong><small>Ban時のボイス</small></button></div><p class="voice-status" aria-live="polite">何度でも再生できます</p></article>${answerArea}</section>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function renderChampionQuiz() {
  const questionNumber = state.session.currentIndex + 1;
  const champion = state.repository.getById(state.question.championId);
  const lastAnswer = state.session.answers.at(-1);
  const answerArea = state.answered
    ? `<section class="feedback ${lastAnswer.correct ? 'correct' : 'wrong'}"><strong>${lastAnswer.correct ? '正解' : '不正解'}</strong><div class="answer-reveal"><img src="${champion.icon}" alt=""><div><span>正解</span><h2>${champion.nameJa}</h2><p>${champion.nameEn}</p></div></div><button class="primary" data-action="next">${questionNumber === state.session.questionCount ? 'RESULT' : '次の問題'}</button></section>`
    : renderChampionAnswerArea();
  return `<section class="quiz-layout"><div class="quiz-top"><div><span class="eyebrow">CHAMPION</span><strong>${questionNumber} <small>/ ${state.session.questionCount}</small></strong></div><button class="danger" data-action="finish">終了</button></div><div class="progress"><span style="width:${questionNumber / state.session.questionCount * 100}%"></span></div><article class="question-panel champion-question"><p class="eyebrow">WHO IS THIS CHAMPION?</p><img class="champion-portrait" src="${state.question.image}" alt="名前を当てるチャンピオンのアイコン"><h1>このChampionは？</h1></article>${answerArea}</section>`;
}

function renderChampionAnswerArea() {
  if (state.difficulty !== 'hard') {
    return `<section class="answer-grid champion-options">${state.question.options.map((champion) => `<button class="answer" data-champion-answer="${champion.id}">${champion.nameJa}<small>${champion.nameEn}</small></button>`).join('')}</section>`;
  }
  const suggestions = state.repository.all().flatMap((champion) => [`<option value="${champion.nameJa}">${champion.nameEn}</option>`, `<option value="${champion.nameEn}">${champion.nameJa}</option>`]).join('');
  return `<form class="hard-answer" data-hard-answer><label for="champion-input">Champion名を入力</label><div><input id="champion-input" name="champion" list="champion-suggestions" autocomplete="off" placeholder="日本語名 / English name" required><button class="primary" type="submit">回答する</button></div><datalist id="champion-suggestions">${suggestions}</datalist></form>`;
}

function renderResult() {
  const quiz = findQuiz(state.quizId);
  const result = getResult(state.session);
  return `<section class="panel result"><p class="eyebrow">RESULT · ${quiz.title.toUpperCase()}</p><h1>${result.correct} <small>/ ${result.answered}</small></h1><div class="accuracy"><strong>${result.accuracy}%</strong><span>正答率</span></div><dl><div><dt>設定問題数</dt><dd>${result.configured}</dd></div><div><dt>回答済み</dt><dd>${result.answered}</dd></div><div><dt>ステータス</dt><dd>${result.endedEarly ? '途中終了' : '完走'}</dd></div></dl><div class="result-actions"><button class="primary" data-action="retry">もう一度</button><button class="secondary" data-action="settings">設定を変更</button><button class="text-button" data-action="home">HOME</button></div></section>`;
}

function bindEvents() {
  document.querySelectorAll('[data-quiz]').forEach((button) => button.addEventListener('click', () => { state.quizId = button.dataset.quiz; navigate('settings'); }));
  document.querySelectorAll('[data-difficulty]').forEach((button) => button.addEventListener('click', () => { state.difficulty = button.dataset.difficulty; render(); }));
  document.querySelectorAll('[data-count]').forEach((button) => button.addEventListener('click', () => { state.questionCount = Number(button.dataset.count); render(); }));
  document.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', () => { state.session = recordAnswer(state.session, { correct: button.dataset.answer === 'true', quizType: state.quizId }); state.answered = true; render(); }));
  document.querySelectorAll('[data-champion-answer]').forEach((button) => button.addEventListener('click', () => submitChampionAnswer(Number(button.dataset.championAnswer))));
  document.querySelector('[data-hard-answer]')?.addEventListener('submit', (event) => { event.preventDefault(); submitChampionAnswer(new FormData(event.currentTarget).get('champion')); });
  document.querySelectorAll('[data-voice]').forEach((button) => button.addEventListener('click', () => playVoice(button.dataset.voice, button)));
  document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => handleAction(button.dataset.action)));
}

async function playVoice(kind, button) {
  const status = document.querySelector('.voice-status');
  button.disabled = true;
  if (status) status.textContent = `${kind === 'pick' ? 'Pick' : 'Ban'}を再生中…`;
  try {
    const audio = new Audio(state.question.voice[kind]);
    await audio.play();
    audio.addEventListener('ended', () => { button.disabled = false; if (status) status.textContent = '何度でも再生できます'; }, { once: true });
  } catch (error) {
    const champion = state.repository.getById(state.question.championId);
    state.excludedIds.add(champion.id);
    console.error(`[Voice Quiz] ${champion.key} ${kind} audio failed; replacing question`, error);
    await prepareQuestion();
    render();
  }
}

function submitChampionAnswer(answer) {
  if (state.answered) return;
  const correct = checkChampionAnswer(state.question, answer, state.repository);
  state.session = recordAnswer(state.session, { correct, quizType: state.quizId, championId: state.question.championId, answer });
  state.answered = true;
  render();
}

async function handleAction(action) {
  if (action === 'home') navigate('home');
  if (action === 'settings') navigate('settings');
  if (action === 'start' || action === 'retry') {
    const repository = await repositoryPromise;
    if (!repository) return;
    state.repository = repository;
    state.excludedIds = new Set();
    state.session = createSession({ quizType: state.quizId, difficulty: state.difficulty, questionCount: state.questionCount, championIds: repository.ids() });
    state.answered = false;
    await prepareQuestion();
    navigate('quiz');
  }
  if (action === 'next') {
    state.session = advanceSession(state.session);
    state.answered = false;
    if (state.session.status !== 'completed') await prepareQuestion();
    navigate(state.session.status === 'completed' ? 'result' : 'quiz');
  }
  if (action === 'finish') { state.session = endSession(state.session); navigate('result'); }
}

async function prepareQuestion() {
  state.question = null;
  if (!['champion', 'zoom', 'skill-icon', 'skill-name', 'skill-description', 'voice'].includes(state.quizId)) return;
  const index = state.session.currentIndex;
  const usedIds = new Set(state.session.candidateIds.slice(0, index));
  const candidates = [state.session.candidateIds[index], ...state.repository.ids().filter((id) => !state.session.candidateIds.includes(id))];
  for (const championId of candidates) {
    if (usedIds.has(championId) || state.excludedIds.has(championId)) continue;
    const champion = state.repository.getById(championId);
    const factories = { champion: createChampionQuestion, zoom: createZoomQuestion, 'skill-icon': createSkillIconQuestion, 'skill-name': createSkillNameQuestion, 'skill-description': createSkillDescriptionQuestion, voice: createVoiceQuestion };
    const factory = factories[state.quizId];
    try {
      const question = factory({ champion, champions: state.repository.all(), difficulty: state.difficulty });
      if (state.quizId !== 'voice') await preloadImage(question.image);
      const candidateIds = [...state.session.candidateIds];
      candidateIds[index] = championId;
      state.session = { ...state.session, candidateIds };
      state.question = question;
      return;
    } catch (error) {
      state.excludedIds.add(championId);
      console.error(`[${state.quizId} Quiz] ${champion.key} question failed; replacing question`, error);
    }
  }
  throw new Error(`${state.quizId} Quizに使用できる画像がありません`);
}

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = () => reject(new Error(`Image load failed: ${url}`));
    image.src = url;
  });
}

window.addEventListener('hashchange', () => {
  const requested = window.location.hash.slice(1);
  if (requested === 'home' || (requested === 'settings' && state.quizId) || (requested === 'quiz' && state.session) || (requested === 'result' && state.session)) { state.screen = requested; render(); }
});

render();
