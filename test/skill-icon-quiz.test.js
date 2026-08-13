import test from 'node:test';
import assert from 'node:assert/strict';
import { createSkillIconQuestion } from '../src/quizzes/skill-icon/skill-icon-quiz.js';

const abilities = Object.fromEntries(['P', 'Q', 'W', 'E', 'R'].map((position) => [position, { name: `${position} Skill`, icon: `${position}.png` }]));
const champions = Array.from({ length: 10 }, (_, index) => ({ id: index + 1, key: `C${index}`, nameJa: `名前${index}`, nameEn: `Name${index}`, icon: `${index}.png`, abilities }));

test('P/Q/W/E/Rから1つのSkill Icon問題を作る', () => {
  const p = createSkillIconQuestion({ champion: champions[0], champions, difficulty: 'easy', random: () => 0 });
  const r = createSkillIconQuestion({ champion: champions[0], champions, difficulty: 'normal', random: () => 0.999 });
  assert.deepEqual(p.ability, { position: 'P', name: 'P Skill' });
  assert.deepEqual(r.ability, { position: 'R', name: 'R Skill' });
  assert.equal(p.image, 'P.png');
  assert.equal(r.options.length, 8);
});

test('欠損Skillは問題として採用しない', () => {
  const champion = { ...champions[0], abilities: { ...abilities, P: { name: '', icon: '' } } };
  assert.throws(() => createSkillIconQuestion({ champion, champions, difficulty: 'hard', random: () => 0 }), /unavailable/);
});
