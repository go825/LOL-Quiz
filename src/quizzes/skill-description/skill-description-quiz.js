import { createChampionQuestion } from '../champion/champion-quiz.js';

const POSITIONS = ['P', 'Q', 'W', 'E', 'R'];
const NAME_OPTION_COUNTS = { easy: 4, normal: 8, hard: 4 };

export function createSkillDescriptionQuestion({ champion, champions, difficulty, random = Math.random }) {
  const positions = difficulty === 'easy' ? POSITIONS.filter((position) => position !== 'P') : POSITIONS;
  const eligible = positions.map((position) => ({ position, ...champion.abilities?.[position] }))
    .filter((ability) => ability.name && ability.icon && ability.description && !revealsChampion(ability.description, champion));
  if (eligible.length === 0) throw new Error(`${champion.key} has no eligible descriptions`);
  const ability = eligible[Math.floor(random() * eligible.length)];
  const base = createChampionQuestion({ champion, champions, difficulty, random });
  const nameOptions = difficulty === 'hard' ? [] : createNameOptions(ability.name, champions, NAME_OPTION_COUNTS[difficulty], random);
  const descriptionOptions = difficulty === 'hard' ? createDescriptionOptions(ability.description, champions, 4, random) : [];
  return {
    ...base,
    type: 'skill-description',
    image: ability.icon,
    ability: { position: ability.position, name: ability.name, description: ability.description },
    nameOptions,
    descriptionOptions,
  };
}

export function checkSkillDescriptionAnswer(question, answer) {
  return question.descriptionOptions.length > 0
    ? stripMarkup(answer) === stripMarkup(question.ability.description)
    : String(answer) === question.ability.name;
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

function createNameOptions(correctName, champions, count, random) {
  const names = [...new Set(champions.flatMap((candidate) => Object.values(candidate.abilities || {}).map((candidateAbility) => candidateAbility.name).filter(Boolean)))];
  const distractors = shuffle(names.filter((name) => name !== correctName), random).slice(0, count - 1);
  if (distractors.length < count - 1) throw new Error(`Skill Description requires ${count} unique skill names`);
  return shuffle([correctName, ...distractors], random);
}

function createDescriptionOptions(correctDescription, champions, count, random) {
  const correct = stripMarkup(correctDescription);
  const descriptions = [...new Set(champions.flatMap((candidate) => Object.values(candidate.abilities || {}).map((candidateAbility) => stripMarkup(candidateAbility.description)).filter(Boolean)))];
  const distractors = shuffle(descriptions.filter((description) => description !== correct), random).slice(0, count - 1);
  if (distractors.length < count - 1) throw new Error(`Skill Description Hard requires ${count} unique descriptions`);
  return shuffle([correct, ...distractors], random);
}

function shuffle(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}
