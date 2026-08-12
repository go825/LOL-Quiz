import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createChampionQuestion } from '../src/quizzes/champion/champion-quiz.js';
import { createZoomQuestion } from '../src/quizzes/zoom/zoom-quiz.js';
import { createSkillIconQuestion } from '../src/quizzes/skill-icon/skill-icon-quiz.js';
import { createSkillNameQuestion } from '../src/quizzes/skill-name/skill-name-quiz.js';
import { createSkillDescriptionQuestion } from '../src/quizzes/skill-description/skill-description-quiz.js';
import { createVoiceQuestion } from '../src/quizzes/voice/voice-quiz.js';
import { createMixedQuestion } from '../src/quizzes/mixed/mixed-quiz.js';

const payload = JSON.parse(await readFile(new URL('../src/data/champions.json', import.meta.url), 'utf8'));
const champions = payload.champions;
const factories = { champion: createChampionQuestion, zoom: createZoomQuestion, 'skill-icon': createSkillIconQuestion, 'skill-name': createSkillNameQuestion, 'skill-description': createSkillDescriptionQuestion, voice: createVoiceQuestion };
const allFactories = { ...factories, mixed: (input) => createMixedQuestion({ ...input, factories }) };

test('全7形式×3難易度×5問題数で実データ問題を生成できる', () => {
  const counts = [5, 10, 20, 30, 50];
  const difficulties = ['easy', 'normal', 'hard'];
  for (const [type, factory] of Object.entries(allFactories)) {
    for (const difficulty of difficulties) {
      for (const count of counts) {
        const questions = [];
        for (const champion of champions) {
          try {
            questions.push(factory({ champion, champions, difficulty, random: () => 0.37 }));
          } catch { /* invalid data is intentionally skipped */ }
          if (questions.length === count) break;
        }
        assert.equal(questions.length, count, `${type}/${difficulty}/${count}`);
        assert.equal(new Set(questions.map(({ championId }) => championId)).size, count, `${type}/${difficulty}/${count} duplicate`);
        for (const question of questions) {
          if (difficulty === 'easy') assert.equal(question.options.length, 4);
          if (difficulty === 'normal') assert.equal(question.options.length, 8);
          if (difficulty === 'hard') assert.equal(question.options.length, 0);
        }
      }
    }
  }
});
