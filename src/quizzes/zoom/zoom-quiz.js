import { createChampionQuestion } from '../champion/champion-quiz.js';

export function createZoomQuestion({ champion, champions, difficulty, random = Math.random }) {
  const base = createChampionQuestion({ champion, champions, difficulty, random });
  const zoomByDifficulty = { easy: 2.4, normal: 3, hard: 3.6 };
  return {
    ...base,
    type: 'zoom',
    image: champion.splash,
    zoom: zoomByDifficulty[difficulty],
    position: { x: Math.round(15 + random() * 70), y: Math.round(15 + random() * 70) },
  };
}
