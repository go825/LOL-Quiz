export const QUIZZES = Object.freeze([
  { id: 'champion', title: 'Champion', icon: 'C', description: 'チャンピオンの姿から名前を当てる' },
  { id: 'zoom', title: 'Zoom', icon: 'Z', description: 'Splash Artの一部分から見抜く' },
  { id: 'skill-icon', title: 'Skill Icon', icon: 'I', description: 'スキルアイコンから使い手を当てる' },
  { id: 'skill-name', title: 'Skill Name', icon: 'N', description: 'チャンピオンのスキル名を当てる' },
  { id: 'skill-description', title: 'Skill Description', icon: 'D', description: 'スキル説明文を手掛かりに答える' },
  { id: 'voice', title: 'Voice', icon: 'V', description: 'Pick / Banボイスから聞き分ける' },
  { id: 'mixed', title: 'Mixed', icon: 'M', description: 'すべての形式に挑戦する' },
]);

export function findQuiz(id) {
  return QUIZZES.find((quiz) => quiz.id === id);
}
