## 作業方針

- 軽微で元に戻せる判断は自律的に進める。
- 既存コードや資料で確認できることは自分で調べる。
- 重要な仕様に関わる不明点だけユーザーに質問する。

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

- `feature/*` → `develop` → `main` の順でPRを出す
