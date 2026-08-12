# LoL Quiz

League of Legendsのチャンピオン情報を使った、日本語向けクイズWebアプリです。Champion、Zoom、Skill Icon、Skill Name、Skill Description、Voice、Mixedの7形式を、PCとスマートフォンの両方で遊べる構成を目指しています。

現在は **Phase 1（プロジェクト基盤）** です。HOME、クイズ設定、共通Quiz、Result、スコア、重複防止、途中終了、レスポンシブUIを実装済みで、問題部分は共通フロー確認用のダミー表示です。詳しい進行状況は [WORKLOG.md](./WORKLOG.md) を参照してください。

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

Phase 2でData Dragon / CommunityDragonのデータを正規化する更新スクリプトを追加予定です。現時点では更新コマンドはありません。

## データソース

- [Riot Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon)
- [CommunityDragon](https://www.communitydragon.org/)

大容量画像・音声はリポジトリに保存せず、URLを保持して必要時に読み込む方針です。

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
