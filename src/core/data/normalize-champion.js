const POSITIONS = ['Q', 'W', 'E', 'R'];

export function normalizeChampion({ ja, en, version }) {
  if (!ja?.id || !en?.id || ja.id !== en.id) throw new Error('Locale data mismatch');
  const abilities = { P: normalizeAbility(ja.passive, 'P', version) };
  POSITIONS.forEach((position, index) => { abilities[position] = normalizeAbility(ja.spells?.[index], position, version); });
  if (Object.values(abilities).some((ability) => !ability.name || !ability.icon)) throw new Error(`${ja.id} has incomplete ability data`);
  return {
    id: Number(ja.key), key: ja.id, nameJa: ja.name, nameEn: en.name, titleJa: ja.title,
    icon: assetUrl(version, 'champion', ja.image.full),
    splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${ja.id}_0.jpg`,
    abilities, voice: { pick: null, ban: null },
  };
}

function normalizeAbility(ability, position, version) {
  if (!ability) return { position, name: '', description: '', icon: '' };
  return { position, name: ability.name, description: ability.description || '', icon: assetUrl(version, ability.image.group === 'passive' ? 'passive' : 'spell', ability.image.full) };
}

function assetUrl(version, group, filename) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/${group}/${filename}`;
}
