import { createChampionQuestion } from '../champion/champion-quiz.js';

export function createZoomQuestion({ champion, champions, difficulty, random = Math.random }) {
  const base = createChampionQuestion({ champion, champions, difficulty, random });
  const zoomByDifficulty = { easy: 2.4, normal: 3, hard: 4.5 };
  const position = difficulty === 'easy'
    ? { x: 50, y: 50 }
    : difficulty === 'hard'
      ? { x: hardPosition(random), y: hardPosition(random) }
      : { x: Math.round(10 + random() * 80), y: Math.round(10 + random() * 80) };
  return {
    ...base,
    type: 'zoom',
    image: champion.splash,
    zoom: zoomByDifficulty[difficulty],
    position,
  };
}

function hardPosition(random) {
  const outerBandSize = 35;
  return random() < 0.5
    ? Math.round(random() * outerBandSize)
    : Math.round(100 - random() * outerBandSize);
}
