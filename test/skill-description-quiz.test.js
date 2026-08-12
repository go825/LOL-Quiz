import test from 'node:test';
import assert from 'node:assert/strict';
import { createSkillDescriptionQuestion, revealsChampion, stripMarkup } from '../src/quizzes/skill-description/skill-description-quiz.js';

const ability = (position, description) => ({ name: `${position} Skill`, icon: `${position}.png`, description });
const abilities = { P: ability('P', '通常攻撃が追加ダメージを与える。'), Q: ability('Q', '対象へ弾を放つ。'), W: ability('W', '移動速度が増加する。'), E: ability('E', '範囲内の敵をスロウにする。'), R: ability('R', '遠距離から強力な一撃を放つ。') };
const champion = { id: 202, key: 'Jhin', nameJa: 'ジン', nameEn: 'Jhin', icon: 'Jhin.png', abilities };
const champions = Array.from({ length: 10 }, (_, index) => index === 0 ? champion : ({ ...champion, id: 202 + index, key: `C${index}`, nameJa: `名前${index}`, nameEn: `Name${index}` }));

test('説明文と回答後情報を保持した問題を作る', () => {
  const question = createSkillDescriptionQuestion({ champion, champions, difficulty: 'normal', random: () => 0 });
  assert.equal(question.type, 'skill-description');
  assert.equal(question.ability.position, 'P');
  assert.match(question.ability.description, /追加ダメージ/);
  assert.equal(question.options.length, 8);
});

test('EasyではPassiveを出題しない', () => {
  const question = createSkillDescriptionQuestion({ champion, champions, difficulty: 'easy', random: () => 0 });
  assert.equal(question.ability.position, 'Q');
});

test('Champion名を直接含む説明は除外する', () => {
  assert.equal(revealsChampion('ジンが敵を攻撃する。', champion), true);
  assert.equal(revealsChampion('<font>JHIN</font> gains speed.', champion), true);
  assert.equal(revealsChampion('神秘的な弾丸を放つ。', champion), false);
  const invalid = { ...champion, abilities: Object.fromEntries(Object.entries(abilities).map(([key, value]) => [key, { ...value, description: `ジンが${key}を使う。` }])) };
  assert.throws(() => createSkillDescriptionQuestion({ champion: invalid, champions, difficulty: 'hard' }), /no eligible/);
});

test('Data Dragonの装飾タグは内容を変えず表示用テキストへ変換する', () => {
  assert.equal(stripMarkup("一行目<br><font color='#fff'>二行目</font>"), '一行目\n二行目');
});
