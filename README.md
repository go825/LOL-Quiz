# LoL Quiz

League of Legendsのチャンピオン情報を使った、日本語向けクイズWebアプリです。Champion、Zoom、Skill Icon、Skill Name、Skill Description、Voice、Mixedの7形式を、PCとスマートフォンの両方で遊べる構成を目指しています。

現在は **Phase 8（Voice Quiz）** まで完了しています。Mixedを除く6形式をEasy 4択、Normal 8択、Hardの日英名入力で遊べます。Voiceでは日本語Pick/Banボイスを自由に再生できます。詳しい進行状況は [WORKLOG.md](./WORKLOG.md) を参照してください。

## ローカル起動

Node.js 20以降を用意し、次を実行します。外部パッケージのインストールは不要です。

```bash
npm run dev
```

## テストとビルド

```bash
npm test
npm run build
```

ビルド成果物は `dist/` に生成されます。

## Championデータ更新

Data Dragonの最新バージョンから `ja_JP` / `en_US`、CommunityDragonから日本語Pick/Ban音声一覧を取得して `src/data/champions.json` を再生成します。

```bash
npm run data:update
```

特定バージョンを使う場合は `DDRAGON_VERSION` 環境変数を指定します。生成JSONにはバージョン、生成日時、Champion件数も記録されます。

## データソース

- [Riot Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon)
- [CommunityDragon](https://www.communitydragon.org/)

大容量画像・音声はリポジトリに保存せず、URLを保持して必要時に読み込みます。音声更新時はCommunityDragonのPick/Ban両ディレクトリを照合し、実在するChampion IDだけを採用します。

## Render公開（予定）

- Build Command: `npm run build`
- Publish Directory: `dist`

実際の公開設定、SPA Rewrite、外部アセットのCORS確認はPhase 11で確定します。

## 開発方針

- 外部データは共通Champion Repositoryへ正規化する
- 各クイズは独立モジュールとして実装する
- Mixedは各クイズの問題生成機能を再利用する
- 1セッション内で同じChampionを重複出題しない
- 取得失敗した問題は未出題Championへ安全に差し替える
- Gitコミットごとに `WORKLOG.md` を更新する

## Legal

LoL Quiz is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
