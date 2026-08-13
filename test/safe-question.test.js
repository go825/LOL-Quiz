import test from 'node:test';
import assert from 'node:assert/strict';
import { loadQuestionWithFallback } from '../src/core/quiz/safe-question.js';

test('問題生成・Asset検証失敗時に次候補へ差し替える', async () => {
  const failures = [];
  const result = await loadQuestionWithFallback({
    candidateIds: [1, 2, 3],
    createQuestion: async (id) => ({ championId: id, image: `${id}.png` }),
    validateQuestion: async ({ championId }) => { if (championId < 3) throw new Error('asset failed'); },
    onError: (id) => failures.push(id),
  });
  assert.equal(result.championId, 3);
  assert.deepEqual(failures, [1, 2]);
});

test('全候補失敗時は安全に終了する', async () => {
  await assert.rejects(() => loadQuestionWithFallback({ candidateIds: [1], createQuestion: async () => { throw new Error('bad data'); } }), /出題可能/);
});
