import test from 'node:test';
import assert from 'node:assert/strict';
import { checkSkillNameAnswer, createSkillNameQuestion } from '../src/quizzes/skill-name/skill-name-quiz.js';

const champions = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  key: `C${index}`,
  nameJa: `名前${index}`,
  nameEn: `Name${index}`,
  icon: `${index}.png`,
  abilities: Object.fromEntries(['P', 'Q', 'W', 'E', 'R'].map((position) => [position, { name: `${position}の日本語スキル名${index}`, icon: `${position}.png` }])),
}));

test('日本語Skill Nameとスロットを問題データに保持する', () => {
  const question = createSkillNameQuestion({ champion: champions[0], champions, difficulty: 'easy', random: () => 0.5 });
  assert.equal(question.type, 'skill-name');
  assert.deepEqual(question.ability, { position: 'W', name: 'Wの日本語スキル名0' });
  assert.equal(question.image, 'W.png');
  assert.equal(question.options.length, 4);
  assert.equal(question.nameOptions.length, 4);
  assert.ok(question.nameOptions.includes(question.ability.name));
});

test('Normalでは正解と実在する別スキル名を含む重複なし8択を作る', () => {
  const question = createSkillNameQuestion({ champion: champions[0], champions, difficulty: 'normal', random: () => 0.5 });
  const allNames = new Set(champions.flatMap((champion) => Object.values(champion.abilities).map((ability) => ability.name)));
  assert.equal(question.nameOptions.length, 8);
  assert.equal(new Set(question.nameOptions).size, 8);
  assert.ok(question.nameOptions.includes(question.ability.name));
  assert.ok(question.nameOptions.every((name) => allNames.has(name)));
});

test('Hardでは正解と似た名前を含む重複なし4択を作る', () => {
  const question = createSkillNameQuestion({ champion: champions[0], champions, difficulty: 'hard', random: () => 0.999 });
  assert.equal(question.ability.position, 'R');
  assert.deepEqual(question.options, []);
  assert.equal(question.nameOptions.length, 4);
  assert.equal(new Set(question.nameOptions).size, 4);
  assert.ok(question.nameOptions.includes(question.ability.name));
  assert.equal(checkSkillNameAnswer(question, question.ability.name), true);
  assert.equal(checkSkillNameAnswer(question, question.nameOptions.find((name) => name !== question.ability.name)), false);
});
