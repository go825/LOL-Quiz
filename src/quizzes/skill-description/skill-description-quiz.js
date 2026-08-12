import { createChampionQuestion } from '../champion/champion-quiz.js';

const POSITIONS = ['P', 'Q', 'W', 'E', 'R'];

export function createSkillDescriptionQuestion({ champion, champions, difficulty, random = Math.random }) {
  const positions = difficulty === 'easy' ? POSITIONS.filter((position) => position !== 'P') : POSITIONS;
  const eligible = positions.map((position) => ({ position, ...champion.abilities?.[position] }))
    .filter((ability) => ability.name && ability.icon && ability.description && !revealsChampion(ability.description, champion));
  if (eligible.length === 0) throw new Error(`${champion.key} has no eligible descriptions`);
  const ability = eligible[Math.floor(random() * eligible.length)];
  const base = createChampionQuestion({ champion, champions, difficulty, random });
  return {
    ...base,
    type: 'skill-description',
    image: ability.icon,
    ability: { position: ability.position, name: ability.name, description: ability.description },
  };
}

export function revealsChampion(description, champion) {
  const text = stripMarkup(description).normalize('NFKC').toLocaleLowerCase('en-US');
  if (champion.nameJa && text.includes(champion.nameJa.normalize('NFKC').toLocaleLowerCase('en-US'))) return true;
  return [champion.nameEn, champion.key].filter(Boolean).some((name) => {
    const normalized = name.normalize('NFKC').toLocaleLowerCase('en-US');
    return new RegExp(`(^|[^a-z])${escapeRegex(normalized)}([^a-z]|$)`, 'i').test(text);
  });
}

export function stripMarkup(value) {
  return String(value).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
