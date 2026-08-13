export const MIXED_TYPES = Object.freeze(['champion', 'zoom', 'skill-icon', 'skill-name', 'skill-description', 'voice']);

export function createMixedQuestion({ champion, champions, difficulty, factories, random = Math.random }) {
  const start = Math.floor(random() * MIXED_TYPES.length);
  const orderedTypes = [...MIXED_TYPES.slice(start), ...MIXED_TYPES.slice(0, start)];
  const errors = [];
  for (const type of orderedTypes) {
    try {
      const question = factories[type]({ champion, champions, difficulty, random });
      return { ...question, mixed: true };
    } catch (error) {
      errors.push(`${type}: ${error.message}`);
    }
  }
  throw new Error(`${champion.key} has no Mixed question (${errors.join('; ')})`);
}
