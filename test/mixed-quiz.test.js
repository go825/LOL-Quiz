import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { MIXED_TYPES, createMixedQuestion } from '../src/quizzes/mixed/mixed-quiz.js';
import { createChampionQuestion } from '../src/quizzes/champion/champion-quiz.js';
import { createZoomQuestion } from '../src/quizzes/zoom/zoom-quiz.js';
import { createSkillIconQuestion } from '../src/quizzes/skill-icon/skill-icon-quiz.js';
import { createSkillNameQuestion } from '../src/quizzes/skill-name/skill-name-quiz.js';
import { createSkillDescriptionQuestion } from '../src/quizzes/skill-description/skill-description-quiz.js';
import { createVoiceQuestion } from '../src/quizzes/voice/voice-quiz.js';

const champion = { id: 1, key: 'Test' };
const factories = Object.fromEntries(MIXED_TYPES.map((type) => [type, () => ({ type, championId: 1 })]));

test('Mixedは既存Quiz factoryをランダム選択して再利用する', () => {
  const first = createMixedQuestion({ champion, champions: [champion], difficulty: 'easy', factories, random: () => 0 });
  const last = createMixedQuestion({ champion, champions: [champion], difficulty: 'easy', factories, random: () => 0.999 });
  assert.equal(first.type, 'champion');
  assert.equal(last.type, 'voice');
  assert.equal(first.mixed, true);
});

test('選択形式が失敗しても別の既存factoryへ差し替える', () => {
  const fallbackFactories = { ...factories, champion: () => { throw new Error('asset failed'); } };
  const question = createMixedQuestion({ champion, champions: [champion], difficulty: 'hard', factories: fallbackFactories, random: () => 0 });
  assert.equal(question.type, 'zoom');
});

test('実データ50体で重複なしMixed問題を生成できる', async () => {
  const payload = JSON.parse(await readFile(new URL('../src/data/champions.json', import.meta.url), 'utf8'));
  const realFactories = { champion: createChampionQuestion, zoom: createZoomQuestion, 'skill-icon': createSkillIconQuestion, 'skill-name': createSkillNameQuestion, 'skill-description': createSkillDescriptionQuestion, voice: createVoiceQuestion };
  const questions = payload.champions.slice(0, 50).map((selected, index) => createMixedQuestion({ champion: selected, champions: payload.champions, difficulty: 'normal', factories: realFactories, random: () => (index % 6 + 0.1) / 6 }));
  assert.equal(questions.length, 50);
  assert.equal(new Set(questions.map(({ championId }) => championId)).size, 50);
  assert.ok(new Set(questions.map(({ type }) => type)).size >= 5);
});
