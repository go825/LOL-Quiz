import { QUIZZES, findQuiz } from './quizzes/catalog.js';
import { DIFFICULTIES, QUESTION_COUNTS, advanceSession, createSession, endSession, getResult, recordAnswer } from './core/quiz/session.js';

const app = document.querySelector('#app');
const demoChampionIds = Array.from({ length: 60 }, (_, index) => index + 1);
const state = { screen: 'home', quizId: null, difficulty: 'easy', questionCount: 5, session: null, answered: false };

function navigate(screen) {
  state.screen = screen;
  window.location.hash = screen;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function render() {
  const views = { home: renderHome, settings: renderSettings, quiz: renderQuiz, result: renderResult };
  app.innerHTML = `<div class="app-shell"><header class="site-header"><button class="brand" data-action="home"><span class="brand-mark">LQ</span><span>LoL QUIZ</span></button><span class="phase-badge">PHASE 1</span></header><main>${(views[state.screen] || renderHome)()}</main><footer>LoL Quiz は Riot Games によって承認されたものではなく、Riot Games またはその関係者の見解や意見を反映するものではありません。</footer></div>`;
  bindEvents();
}

function renderHome() {
  return `<section class="hero"><p class="eyebrow">KNOW YOUR CHAMPION</p><h1>知識を、試練へ。</h1><p>League of Legendsのチャンピオンを、7つのクイズで極めよう。</p></section><section class="quiz-grid">${QUIZZES.map((quiz) => `<button class="quiz-card" data-quiz="${quiz.id}"><span class="card-icon">${quiz.icon}</span><span><strong>${quiz.title}</strong><small>${quiz.description}</small></span><span class="arrow">→</span></button>`).join('')}</section><p class="demo-note">現在は共通ゲーム基盤のプレビューです。問題はPhase 2以降で順次実装します。</p>`;
}

function renderSettings() {
  const quiz = findQuiz(state.quizId);
  return `<section class="panel"><button class="text-button" data-action="home">← クイズ一覧</button><p class="eyebrow">QUIZ SETTINGS</p><h1>${quiz.title}</h1><p>${quiz.description}</p><fieldset><legend>難易度</legend><div class="choice-grid">${Object.entries(DIFFICULTIES).map(([id, item]) => `<button class="choice ${state.difficulty === id ? 'selected' : ''}" data-difficulty="${id}"><strong>${item.label}</strong><small>${item.answerMode}</small></button>`).join('')}</div></fieldset><fieldset><legend>問題数</legend><div class="count-grid">${QUESTION_COUNTS.map((count) => `<button class="choice ${state.questionCount === count ? 'selected' : ''}" data-count="${count}">${count}</button>`).join('')}</div></fieldset><button class="primary" data-action="start">START</button><p class="demo-note">Phase 1では共通フロー確認用のダミー問題が出題されます。</p></section>`;
}

function renderQuiz() {
  const quiz = findQuiz(state.quizId);
  const questionNumber = state.session.currentIndex + 1;
  const lastAnswer = state.session.answers.at(-1);
  return `<section class="quiz-layout"><div class="quiz-top"><div><span class="eyebrow">${quiz.title.toUpperCase()}</span><strong>${questionNumber} <small>/ ${state.session.questionCount}</small></strong></div><button class="danger" data-action="finish">終了</button></div><div class="progress"><span style="width:${questionNumber / state.session.questionCount * 100}%"></span></div><article class="question-panel"><span class="demo-orb">?</span><p class="eyebrow">DEMO QUESTION</p><h1>共通クイズ画面</h1><p>回答、正誤表示、手動での「次の問題」、途中終了を確認するためのダミー問題です。</p></article>${state.answered ? `<section class="feedback ${lastAnswer.correct ? 'correct' : 'wrong'}"><strong>${lastAnswer.correct ? '正解' : '不正解'}</strong><p>Phase 2以降で実際のChampionデータに置き換わります。</p><button class="primary" data-action="next">${questionNumber === state.session.questionCount ? 'RESULT' : '次の問題'}</button></section>` : `<section class="answer-grid"><button class="answer" data-answer="true">正解として回答</button><button class="answer" data-answer="false">不正解として回答</button></section>`}</section>`;
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
  document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => handleAction(button.dataset.action)));
}

function handleAction(action) {
  if (action === 'home') navigate('home');
  if (action === 'settings') navigate('settings');
  if (action === 'start' || action === 'retry') {
    state.session = createSession({ quizType: state.quizId, difficulty: state.difficulty, questionCount: state.questionCount, championIds: demoChampionIds });
    state.answered = false;
    navigate('quiz');
  }
  if (action === 'next') {
    state.session = advanceSession(state.session);
    state.answered = false;
    navigate(state.session.status === 'completed' ? 'result' : 'quiz');
  }
  if (action === 'finish') { state.session = endSession(state.session); navigate('result'); }
}

window.addEventListener('hashchange', () => {
  const requested = window.location.hash.slice(1);
  if (requested === 'home' || (requested === 'settings' && state.quizId) || (requested === 'quiz' && state.session) || (requested === 'result' && state.session)) { state.screen = requested; render(); }
});

render();
