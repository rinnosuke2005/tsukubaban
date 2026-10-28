## プロジェクト概要

つくばばん — 卒論・授業向けのアンケート募集サイト。

## 技術スタック

- Next.js 16 (App Router, Turbopack) / React 19 / TypeScript
- Tailwind CSS 4
- ESLint 9

## コマンド

- `npm run dev` — 開発サーバー起動
- `npm run build` — 本番ビルド
- `npm run lint` — ESLint

## ブランチ運用・デプロイ

- `feature/*` から `main` へ直接PRを出す
- `supabase/migrations/` の変更は main へのマージ時に GitHub Actions（`migrate.yml`）が本番 DB へ自動で適用する
- マイグレーションはアプリのデプロイと並行して適用されるため、カラムの削除・リネームなど破壊的な変更は「追加 → コード切替 → 削除」の複数PRに分ける
- 適用に失敗したら revert せず、修正用のマイグレーションを追加して直す
- マージ前に main を取り込み、マイグレーションのタイムスタンプが main の最新より新しいことを確認する
