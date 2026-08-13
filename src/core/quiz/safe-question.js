export async function loadQuestionWithFallback({ candidateIds, createQuestion, validateQuestion = async () => {}, onError = () => {} }) {
  for (const championId of candidateIds) {
    try {
      const question = await createQuestion(championId);
      await validateQuestion(question);
      return { championId, question };
    } catch (error) {
      onError(championId, error);
    }
  }
  throw new Error('出題可能な候補がありません');
}
