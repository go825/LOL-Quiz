import { normalizeChampionSearchText } from '../../core/data/champion-repository.js';

const OPTION_COUNTS = { easy: 4, normal: 8 };

export function createChampionQuestion({ champion, champions, difficulty, random = Math.random }) {
  if (!champion) throw new Error('Champion question requires a champion');
  const optionCount = OPTION_COUNTS[difficulty];
  const options = optionCount
    ? shuffle([...shuffle(champions.filter(({ id }) => id !== champion.id), random).slice(0, optionCount - 1), champion], random)
    : [];
  return { type: 'champion', championId: champion.id, image: champion.icon, options };
}

export function checkChampionAnswer(question, answer, repository) {
  const champion = repository.getById(question.championId);
  if (!champion) return false;
  if (typeof answer === 'number') return answer === champion.id;
  const normalized = normalize(answer);
  return normalized === normalize(champion.nameJa) || normalized === normalize(champion.nameEn);
}

export function championSuggestions(repository, input, limit = 8) {
  if (!String(input).trim()) return [];
  return repository.searchName(input).slice(0, limit);
}

function normalize(value) {
  return normalizeChampionSearchText(value);
}

function shuffle(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}
