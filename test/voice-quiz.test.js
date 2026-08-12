import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoiceQuestion } from '../src/quizzes/voice/voice-quiz.js';

const champions = Array.from({ length: 10 }, (_, index) => ({ id: index + 1, key: `C${index}`, nameJa: `名前${index}`, nameEn: `Name${index}`, icon: `${index}.png`, voice: { pick: `${index}-pick.ogg`, ban: `${index}-ban.ogg` } }));

test('Pick/Ban URLを持つVoice問題を作る', () => {
  const question = createVoiceQuestion({ champion: champions[0], champions, difficulty: 'easy', random: () => 0.4 });
  assert.equal(question.type, 'voice');
  assert.deepEqual(question.voice, { pick: '0-pick.ogg', ban: '0-ban.ogg' });
  assert.equal(question.options.length, 4);
});

test('Pick/Banいずれかが欠損したChampionを除外する', () => {
  const champion = { ...champions[0], voice: { pick: 'pick.ogg', ban: null } };
  assert.throws(() => createVoiceQuestion({ champion, champions, difficulty: 'hard' }), /unavailable/);
});
