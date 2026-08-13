import test from 'node:test';
import assert from 'node:assert/strict';
import { createZoomQuestion } from '../src/quizzes/zoom/zoom-quiz.js';

const champions = Array.from({ length: 10 }, (_, index) => ({ id: index + 1, nameJa: `名前${index}`, nameEn: `Name${index}`, icon: `${index}.png`, splash: `${index}.jpg` }));

test('Zoom問題はSplashと安全なランダム表示位置を持つ', () => {
  const question = createZoomQuestion({ champion: champions[0], champions, difficulty: 'easy', random: () => 0.5 });
  assert.equal(question.type, 'zoom');
  assert.equal(question.image, '0.jpg');
  assert.equal(question.zoom, 2.4);
  assert.deepEqual(question.position, { x: 50, y: 50 });
  assert.equal(question.options.length, 4);
});

test('難易度が上がるほど拡大率が上がる', () => {
  const easy = createZoomQuestion({ champion: champions[0], champions, difficulty: 'easy', random: () => 0.5 });
  const normal = createZoomQuestion({ champion: champions[0], champions, difficulty: 'normal', random: () => 0.5 });
  const hard = createZoomQuestion({ champion: champions[0], champions, difficulty: 'hard', random: () => 0.5 });
  assert.deepEqual([easy.zoom, normal.zoom, hard.zoom], [2.4, 3, 4.5]);
});

test('同じChampionでも乱数により表示位置が変化する', () => {
  const first = createZoomQuestion({ champion: champions[0], champions, difficulty: 'hard', random: () => 0 });
  const second = createZoomQuestion({ champion: champions[0], champions, difficulty: 'hard', random: () => 1 });
  assert.notDeepEqual(first.position, second.position);
  assert.deepEqual(first.position, { x: 0, y: 0 });
  assert.deepEqual(second.position, { x: 65, y: 65 });
});

test('Hardは中央帯を避けて外側から表示位置を選ぶ', () => {
  const positions = Array.from({ length: 20 }, (_, index) => {
    const values = [index / 20, (index + 0.5) / 20];
    let cursor = 0;
    return createZoomQuestion({ champion: champions[0], champions, difficulty: 'hard', random: () => values[cursor++ % values.length] }).position;
  });
  assert.ok(positions.every(({ x, y }) => (x <= 35 || x >= 65) && (y <= 35 || y >= 65)));
});

test('Easyは中央固定、NormalとHardは表示位置をランダム化する', () => {
  const easy = createZoomQuestion({ champion: champions[0], champions, difficulty: 'easy', random: () => 0 });
  const normalStart = createZoomQuestion({ champion: champions[0], champions, difficulty: 'normal', random: () => 0 });
  const normalEnd = createZoomQuestion({ champion: champions[0], champions, difficulty: 'normal', random: () => 1 });
  const hardStart = createZoomQuestion({ champion: champions[0], champions, difficulty: 'hard', random: () => 0 });
  const hardEnd = createZoomQuestion({ champion: champions[0], champions, difficulty: 'hard', random: () => 1 });
  assert.deepEqual(easy.position, { x: 50, y: 50 });
  assert.notDeepEqual(normalStart.position, normalEnd.position);
  assert.notDeepEqual(hardStart.position, hardEnd.position);
});
