import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceSession, createSession, endSession, getResult, recordAnswer } from '../src/core/quiz/session.js';

test('セッション候補のChampionは重複しない', () => {
  const session = createSession({ quizType: 'champion', difficulty: 'easy', questionCount: 5, championIds: [1, 1, 2, 3, 4, 5, 6] });
  assert.equal(session.candidateIds.length, 5);
  assert.equal(new Set(session.candidateIds).size, 5);
});

test('回答前は次の問題へ進めない', () => {
  const session = createSession({ quizType: 'champion', difficulty: 'easy', questionCount: 5, championIds: [1, 2, 3, 4, 5] });
  assert.equal(advanceSession(session).currentIndex, 0);
});

test('途中終了は回答済み問題だけで成績を算出する', () => {
  let session = createSession({ quizType: 'champion', difficulty: 'normal', questionCount: 20, championIds: Array.from({ length: 20 }, (_, index) => index) });
  for (let index = 0; index < 8; index += 1) {
    session = recordAnswer(session, { correct: index < 6 });
    if (index < 7) session = advanceSession(session);
  }
  assert.deepEqual(getResult(endSession(session)), { answered: 8, correct: 6, accuracy: 75, configured: 20, endedEarly: true, byType: { champion: { answered: 8, correct: 6 } } });
});

test('Mixed向けに問題形式別成績を保持する', () => {
  let session = createSession({ quizType: 'mixed', difficulty: 'easy', questionCount: 5, championIds: [1, 2, 3, 4, 5] });
  session = recordAnswer(session, { correct: true, quizType: 'zoom' });
  session = advanceSession(session);
  session = recordAnswer(session, { correct: false, quizType: 'voice' });
  assert.deepEqual(getResult(session).byType, { zoom: { answered: 1, correct: 1 }, voice: { answered: 1, correct: 0 } });
});
