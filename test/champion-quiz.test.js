import test from 'node:test';
import assert from 'node:assert/strict';
import { ChampionRepository } from '../src/core/data/champion-repository.js';
import { championSuggestions, checkChampionAnswer, createChampionQuestion } from '../src/quizzes/champion/champion-quiz.js';

const champions = Array.from({ length: 10 }, (_, index) => ({ id: index + 1, key: `Champion${index + 1}`, nameJa: index === 0 ? 'ジン' : `チャンピオン${index + 1}`, nameEn: index === 0 ? 'Jhin' : `Champion ${index + 1}`, icon: `${index + 1}.png` }));
const repository = new ChampionRepository(champions);

test('Easyは正解を含む重複なし4択を作る', () => {
  const question = createChampionQuestion({ champion: champions[0], champions, difficulty: 'easy', random: () => 0.25 });
  assert.equal(question.options.length, 4);
  assert.equal(new Set(question.options.map(({ id }) => id)).size, 4);
  assert.ok(question.options.some(({ id }) => id === 1));
});

test('Normalは正解を含む8択を作る', () => {
  const question = createChampionQuestion({ champion: champions[0], champions, difficulty: 'normal', random: () => 0.5 });
  assert.equal(question.options.length, 8);
});

test('Hard回答は日英名と英字大小を許容する', () => {
  const question = createChampionQuestion({ champion: champions[0], champions, difficulty: 'hard' });
  assert.equal(checkChampionAnswer(question, 'ジン', repository), true);
  assert.equal(checkChampionAnswer(question, 'jHiN', repository), true);
  assert.equal(checkChampionAnswer(question, 'Jinx', repository), false);
  assert.equal(championSuggestions(repository, 'jh')[0].nameJa, 'ジン');
});
