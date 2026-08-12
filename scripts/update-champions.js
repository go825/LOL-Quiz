import { mkdir, writeFile } from 'node:fs/promises';
import { normalizeChampion } from '../src/core/data/normalize-champion.js';

const CDN = 'https://ddragon.leagueoflegends.com';
const version = process.env.DDRAGON_VERSION || await getLatestVersion();
console.log(`Updating champions from Data Dragon ${version}`);

const index = await getJson(`${CDN}/cdn/${version}/data/ja_JP/champion.json`);
const keys = Object.keys(index.data).sort();
const champions = await mapWithConcurrency(keys, 8, async (key) => {
  const [jaPayload, enPayload] = await Promise.all([
    getJson(`${CDN}/cdn/${version}/data/ja_JP/champion/${key}.json`),
    getJson(`${CDN}/cdn/${version}/data/en_US/champion/${key}.json`),
  ]);
  return normalizeChampion({ ja: jaPayload.data[key], en: enPayload.data[key], version });
});

champions.sort((a, b) => a.id - b.id);
const payload = {
  metadata: { schemaVersion: 1, dataDragonVersion: version, locales: ['ja_JP', 'en_US'], generatedAt: new Date().toISOString(), championCount: champions.length },
  champions,
};
const output = new URL('../src/data/champions.json', import.meta.url);
await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(output, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

const jhin = champions.find(({ key }) => key === 'Jhin');
if (!jhin) throw new Error('Jhin verification failed');
console.log(`Generated ${champions.length} champions`);
console.log(`Jhin: ${jhin.id} / ${jhin.nameJa} / ${jhin.nameEn} / R=${jhin.abilities.R.name}`);

async function getLatestVersion() {
  const versions = await getJson(`${CDN}/api/versions.json`);
  if (!versions[0]) throw new Error('No Data Dragon version found');
  return versions[0];
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} failed (${response.status})`);
  return response.json();
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      try { results[index] = await mapper(items[index]); }
      catch (error) { console.error(`[Champion update] ${items[index]} failed`, error); throw error; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
