import { createChampionQuestion } from '../champion/champion-quiz.js';

const POSITIONS = ['P', 'Q', 'W', 'E', 'R'];

export function createSkillNameQuestion({ champion, champions, difficulty, random = Math.random }) {
  const base = createChampionQuestion({ champion, champions, difficulty, random });
  const position = POSITIONS[Math.floor(random() * POSITIONS.length)];
  const ability = champion.abilities?.[position];
  if (!ability?.name || !ability?.icon) throw new Error(`${champion.key} ${position} ability is unavailable`);
  return { ...base, type: 'skill-name', image: ability.icon, ability: { position, name: ability.name } };
}
