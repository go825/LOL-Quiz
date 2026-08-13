import { createChampionQuestion } from '../champion/champion-quiz.js';

const POSITIONS = ['P', 'Q', 'W', 'E', 'R'];
const NAME_OPTION_COUNTS = { easy: 4, normal: 8, hard: 4 };

export function createSkillNameQuestion({ champion, champions, difficulty, random = Math.random }) {
  const base = createChampionQuestion({ champion, champions, difficulty, random });
  const position = POSITIONS[Math.floor(random() * POSITIONS.length)];
  const ability = champion.abilities?.[position];
  if (!ability?.name || !ability?.icon) throw new Error(`${champion.key} ${position} ability is unavailable`);
  const nameOptions = difficulty === 'hard'
    ? createSimilarNameOptions(ability.name, champions, random)
    : createRandomNameOptions(ability.name, champions, NAME_OPTION_COUNTS[difficulty], random);
  return { ...base, type: 'skill-name', image: ability.icon, championImage: champion.icon, ability: { position, name: ability.name }, nameOptions };
}

export function checkSkillNameAnswer(question, answer) {
  return String(answer) === question.ability.name;
}

function createSimilarNameOptions(correctName, champions, random) {
  const names = skillNames(champions);
  const distractors = names
    .filter((name) => name !== correctName)
    .map((name) => ({ name, distance: editDistance(normalize(name), normalize(correctName)), tie: random() }))
    .sort((left, right) => left.distance - right.distance || left.tie - right.tie)
    .slice(0, 3)
    .map(({ name }) => name);
  if (distractors.length < 3) throw new Error('Skill Name Hard requires at least four unique skill names');
  return shuffle([correctName, ...distractors], random);
}

function createRandomNameOptions(correctName, champions, count, random) {
  const distractors = shuffle(skillNames(champions).filter((name) => name !== correctName), random).slice(0, count - 1);
  if (distractors.length < count - 1) throw new Error(`Skill Name requires ${count} unique skill names`);
  return shuffle([correctName, ...distractors], random);
}

function skillNames(champions) {
  return [...new Set(champions.flatMap((candidate) => Object.values(candidate.abilities || {}).map((candidateAbility) => candidateAbility.name).filter(Boolean)))];
}

function normalize(value) {
  return String(value).normalize('NFKC').replace(/[\s・･=＝ー―-]/g, '').toLocaleLowerCase('ja');
}

function editDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(current[rightIndex - 1] + 1, previous[rightIndex] + 1, previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1));
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

function shuffle(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}
