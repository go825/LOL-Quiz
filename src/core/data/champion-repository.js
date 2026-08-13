const DEFAULT_DATA_URL = '/src/data/champions.json';

export function normalizeChampionSearchText(value) {
  return String(value).trim().normalize('NFKC').toLocaleLowerCase('en-US')
    .replace(/[ぁ-ゖ]/g, (character) => String.fromCharCode(character.charCodeAt(0) + 0x60));
}

export class ChampionRepository {
  constructor(champions, metadata = {}) {
    this.champions = Object.freeze([...champions]);
    this.metadata = Object.freeze({ ...metadata });
    this.byId = new Map(this.champions.map((champion) => [champion.id, champion]));
    this.byKey = new Map(this.champions.map((champion) => [champion.key.toLowerCase(), champion]));
  }
  static async load(url = DEFAULT_DATA_URL, fetcher = fetch) {
    const response = await fetcher(url);
    if (!response.ok) throw new Error(`Champion data request failed (${response.status})`);
    const payload = await response.json();
    if (!Array.isArray(payload.champions) || payload.champions.length === 0) throw new Error('Champion data is empty');
    return new ChampionRepository(payload.champions, payload.metadata);
  }
  all() { return [...this.champions]; }
  ids() { return this.champions.map(({ id }) => id); }
  getById(id) { return this.byId.get(Number(id)); }
  getByKey(key) { return this.byKey.get(String(key).toLowerCase()); }
  searchName(input) {
    const normalized = normalizeChampionSearchText(input);
    return this.champions.filter(({ nameJa, nameEn }) => normalizeChampionSearchText(nameJa).includes(normalized) || normalizeChampionSearchText(nameEn).includes(normalized));
  }
}
