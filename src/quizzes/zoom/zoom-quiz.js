import { createChampionQuestion } from '../champion/champion-quiz.js';

export function createZoomQuestion({ champion, champions, difficulty, random = Math.random }) {
  const base = createChampionQuestion({ champion, champions, difficulty, random });
  const zoomByDifficulty = { easy: 2.4, normal: 3, hard: 3.6 };
  const position = difficulty === 'easy'
    ? { x: 50, y: 50 }
    : { x: Math.round(10 + random() * 80), y: Math.round(10 + random() * 80) };
  return {
    ...base,
    type: 'zoom',
    image: champion.splash,
    zoom: zoomByDifficulty[difficulty],
    position,
  };
}
