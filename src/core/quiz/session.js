export const DIFFICULTIES = Object.freeze({
  easy: { label: 'Easy', answerMode: '4択' },
  normal: { label: 'Normal', answerMode: '8択' },
  hard: { label: 'Hard', answerMode: '入力' },
});

export const QUESTION_COUNTS = Object.freeze([5, 10, 20, 30, 50]);

export function createSession({ quizType, difficulty, questionCount, championIds }) {
  if (!DIFFICULTIES[difficulty]) throw new Error('未対応の難易度です');
  if (!QUESTION_COUNTS.includes(questionCount)) throw new Error('未対応の問題数です');

  const uniqueIds = [...new Set(championIds)];
  return {
    quizType,
    difficulty,
    questionCount,
    candidateIds: shuffle(uniqueIds).slice(0, questionCount),
    currentIndex: 0,
    answers: [],
    status: 'playing',
    endedEarly: false,
  };
}

export function recordAnswer(session, answer) {
  if (session.status !== 'playing') return session;
  if (session.answers.some(({ index }) => index === session.currentIndex)) return session;

  return {
    ...session,
    answers: [...session.answers, { ...answer, index: session.currentIndex }],
  };
}

export function advanceSession(session) {
  if (!session.answers.some(({ index }) => index === session.currentIndex)) return session;
  const nextIndex = session.currentIndex + 1;
  if (nextIndex >= session.questionCount) return { ...session, status: 'completed' };
  return { ...session, currentIndex: nextIndex };
}

export function endSession(session) {
  return { ...session, status: 'completed', endedEarly: session.answers.length < session.questionCount };
}

export function getResult(session) {
  const answered = session.answers.length;
  const correct = session.answers.filter(({ correct: isCorrect }) => isCorrect).length;
  return {
    answered,
    correct,
    accuracy: answered === 0 ? 0 : Math.round((correct / answered) * 100),
    configured: session.questionCount,
    endedEarly: session.endedEarly,
  };
}

function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}
