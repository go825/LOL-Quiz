import { createChampionQuestion } from '../champion/champion-quiz.js';

export function createZoomQuestion({ champion, champions, difficulty, random = Math.random }) {
  const base = createChampionQuestion({ champion, champions, difficulty, random });
  return {
    ...base,
    type: 'zoom',
    image: champion.splash,
    zoom: 2.4,
    position: { x: Math.round(15 + random() * 70), y: Math.round(15 + random() * 70) },
  };
}
