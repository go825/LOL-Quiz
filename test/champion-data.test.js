import test from 'node:test';
import assert from 'node:assert/strict';
import { ChampionRepository } from '../src/core/data/champion-repository.js';
import { normalizeChampion } from '../src/core/data/normalize-champion.js';

const ability = (name, file, group = 'spell') => ({ name, description: `${name} description`, image: { full: file, group } });
const ja = { id: 'Jhin', key: '202', name: 'ジン', title: '孤高の芸術家', image: { full: 'Jhin.png' }, passive: ability('この銃の名は｢囁き｣', 'Jhin_Passive.png', 'passive'), spells: [ability('踊る手榴弾', 'JhinQ.png'), ability('｢死者への狂奏曲｣', 'JhinW.png'), ability('女神の抱擁', 'JhinE.png'), ability('終演 -フィナーレ-', 'JhinR.png')] };
const en = { ...ja, name: 'Jhin' };

test('Data DragonのChampionを共通形式へ正規化する', () => {
  const champion = normalizeChampion({ ja, en, version: '1.2.3' });
  assert.equal(champion.id, 202);
  assert.equal(champion.nameJa, 'ジン');
  assert.equal(champion.nameEn, 'Jhin');
  assert.equal(champion.abilities.R.position, 'R');
  assert.match(champion.icon, /1\.2\.3\/img\/champion\/Jhin\.png$/);
});

test('RepositoryはID・内部名・日英名から検索できる', () => {
  const champion = normalizeChampion({ ja, en, version: '1.2.3' });
  const repository = new ChampionRepository([champion]);
  assert.equal(repository.getById(202).key, 'Jhin');
  assert.equal(repository.getByKey('jHiN').id, 202);
  assert.equal(repository.searchName('JHIN')[0].nameJa, 'ジン');
  assert.equal(repository.searchName('ジン')[0].nameEn, 'Jhin');
});

test('日本語名はひらがなの途中入力でも検索できる', () => {
  const kogMaw = normalizeChampion({ ja: { ...ja, id: 'KogMaw', key: '96', name: 'コグ＝マウ' }, en: { ...en, id: 'KogMaw', key: '96', name: "Kog'Maw" }, version: '1.2.3' });
  const repository = new ChampionRepository([kogMaw]);
  assert.equal(repository.searchName('こぐ')[0].nameJa, 'コグ＝マウ');
  assert.equal(repository.searchName('Kog')[0].nameEn, "Kog'Maw");
});
