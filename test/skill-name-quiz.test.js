import test from 'node:test';
import assert from 'node:assert/strict';
import { createSkillNameQuestion } from '../src/quizzes/skill-name/skill-name-quiz.js';

const abilities = Object.fromEntries(['P', 'Q', 'W', 'E', 'R'].map((position) => [position, { name: `${position}の日本語スキル名`, icon: `${position}.png` }]));
const champions = Array.from({ length: 10 }, (_, index) => ({ id: index + 1, key: `C${index}`, nameJa: `名前${index}`, nameEn: `Name${index}`, icon: `${index}.png`, abilities }));

test('日本語Skill Nameとスロットを問題データに保持する', () => {
  const question = createSkillNameQuestion({ champion: champions[0], champions, difficulty: 'easy', random: () => 0.5 });
  assert.equal(question.type, 'skill-name');
  assert.deepEqual(question.ability, { position: 'W', name: 'Wの日本語スキル名' });
  assert.equal(question.image, 'W.png');
  assert.equal(question.options.length, 4);
});

test('Hardでは選択肢を作らず回答共通基盤を利用する', () => {
  const question = createSkillNameQuestion({ champion: champions[0], champions, difficulty: 'hard', random: () => 0.999 });
  assert.equal(question.ability.position, 'R');
  assert.deepEqual(question.options, []);
});
