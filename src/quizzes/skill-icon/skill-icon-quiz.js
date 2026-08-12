import { createChampionQuestion } from '../champion/champion-quiz.js';

const POSITIONS = ['P', 'Q', 'W', 'E', 'R'];

export function createSkillIconQuestion({ champion, champions, difficulty, random = Math.random }) {
  const base = createChampionQuestion({ champion, champions, difficulty, random });
  const position = POSITIONS[Math.floor(random() * POSITIONS.length)];
  const ability = champion.abilities?.[position];
  if (!ability?.icon || !ability?.name) throw new Error(`${champion.key} ${position} ability is unavailable`);
  return { ...base, type: 'skill-icon', image: ability.icon, ability: { position, name: ability.name } };
}
