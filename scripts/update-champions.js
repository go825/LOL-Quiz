import { mkdir, writeFile } from 'node:fs/promises';
import { normalizeChampion } from '../src/core/data/normalize-champion.js';

const CDN = 'https://ddragon.leagueoflegends.com';
const COMMUNITY_ROOT = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/ja_jp/v1';
const version = process.env.DDRAGON_VERSION || await getLatestVersion();
console.log(`Updating champions from Data Dragon ${version}`);

const index = await getJson(`${CDN}/cdn/${version}/data/ja_JP/champion.json`);
const [pickIds, banIds] = await Promise.all([
  getVoiceIds(`${COMMUNITY_ROOT}/champion-choose-vo/`),
  getVoiceIds(`${COMMUNITY_ROOT}/champion-ban-vo/`),
]);
const keys = Object.keys(index.data).sort();
const champions = await mapWithConcurrency(keys, 8, async (key) => {
  const [jaPayload, enPayload] = await Promise.all([
    getJson(`${CDN}/cdn/${version}/data/ja_JP/champion/${key}.json`),
    getJson(`${CDN}/cdn/${version}/data/en_US/champion/${key}.json`),
  ]);
  const champion = normalizeChampion({ ja: jaPayload.data[key], en: enPayload.data[key], version });
  const id = String(champion.id);
  champion.voice = {
    pick: pickIds.has(id) ? `${COMMUNITY_ROOT}/champion-choose-vo/${id}.ogg` : null,
    ban: banIds.has(id) ? `${COMMUNITY_ROOT}/champion-ban-vo/${id}.ogg` : null,
  };
  return champion;
});

champions.sort((a, b) => a.id - b.id);
const missingVoices = champions.filter(({ voice }) => !voice.pick || !voice.ban);
if (missingVoices.length > 0) {
  throw new Error(`Japanese Pick/Ban voice mapping is incomplete: ${missingVoices.map(({ key }) => key).join(', ')}`);
}
const payload = {
  metadata: { schemaVersion: 1, dataDragonVersion: version, communityDragonVersion: 'latest', locales: ['ja_JP', 'en_US'], generatedAt: new Date().toISOString(), championCount: champions.length, voiceChampionCount: champions.filter(({ voice }) => voice.pick && voice.ban).length },
  champions,
};
const output = new URL('../src/data/champions.json', import.meta.url);
await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(output, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

const jhin = champions.find(({ key }) => key === 'Jhin');
if (!jhin) throw new Error('Jhin verification failed');
console.log(`Generated ${champions.length} champions`);
console.log(`Jhin: ${jhin.id} / ${jhin.nameJa} / ${jhin.nameEn} / R=${jhin.abilities.R.name}`);
console.log(`Japanese Pick/Ban voices: ${payload.metadata.voiceChampionCount}`);

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

async function getVoiceIds(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} directory failed (${response.status})`);
  const html = await response.text();
  return new Set([...html.matchAll(/href="(\d+)\.ogg"/g)].map((match) => match[1]));
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
