import { createChampionQuestion } from '../champion/champion-quiz.js';

export function createVoiceQuestion({ champion, champions, difficulty, random = Math.random }) {
  if (!champion.voice?.pick || !champion.voice?.ban) throw new Error(`${champion.key} Japanese voice is unavailable`);
  const base = createChampionQuestion({ champion, champions, difficulty, random });
  return { ...base, type: 'voice', image: champion.icon, voice: { ...champion.voice } };
}
