import test from 'node:test';
import assert from 'node:assert/strict';
import { createZoomQuestion } from '../src/quizzes/zoom/zoom-quiz.js';

const champions = Array.from({ length: 10 }, (_, index) => ({ id: index + 1, nameJa: `名前${index}`, nameEn: `Name${index}`, icon: `${index}.png`, splash: `${index}.jpg` }));

test('Zoom問題はSplashと安全なランダム表示位置を持つ', () => {
  const question = createZoomQuestion({ champion: champions[0], champions, difficulty: 'easy', random: () => 0.5 });
  assert.equal(question.type, 'zoom');
  assert.equal(question.image, '0.jpg');
  assert.deepEqual(question.position, { x: 50, y: 50 });
  assert.equal(question.options.length, 4);
});

test('同じChampionでも乱数により表示位置が変化する', () => {
  const first = createZoomQuestion({ champion: champions[0], champions, difficulty: 'hard', random: () => 0 });
  const second = createZoomQuestion({ champion: champions[0], champions, difficulty: 'hard', random: () => 1 });
  assert.notDeepEqual(first.position, second.position);
  assert.deepEqual(first.position, { x: 15, y: 15 });
  assert.deepEqual(second.position, { x: 85, y: 85 });
});
