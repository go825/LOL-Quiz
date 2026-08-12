export async function loadQuestionWithFallback({ candidateIds, createQuestion, onError = console.error }) {
  for (const championId of candidateIds) {
    try {
      return await createQuestion(championId);
    } catch (error) {
      if (import.meta.env?.DEV) onError(`[LoL Quiz] Champion ${championId} を差し替えます`, error);
    }
  }
  throw new Error('出題可能な候補がありません');
}
