# データベース移行・復元ガイド

## 概要

このプロジェクトのDBスキーマとデータは、gitで管理された2種類の方法で復元できます。
新しい環境へ移行する際は、**方法A（推奨）** を使用してください。

---

## 方法A: SQL ファイルによる完全復元（推奨）

`db/` ディレクトリに、現在のDB構造とデータを完全に収録したSQLファイルがあります。

| ファイル | 内容 |
|---------|------|
| `db/schema.sql` | 全テーブルのDDL（CREATE TABLE文） |
| `db/seed.sql` | 全データのINSERT文（7テーブル、71件） |

### 手順

```bash
# 1. リポジトリをクローン
git clone <リポジトリURL>
cd <プロジェクトディレクトリ>

# 2. 依存パッケージをインストール
npm install

# 3. 環境変数を設定（.envファイル or 環境変数）
DATABASE_URL=postgresql://user:password@host:port/database

# 4. スキーマを作成（テーブル・インデックス・外部キーを一括作成）
psql $DATABASE_URL < db/schema.sql

# 5. データを投入
psql $DATABASE_URL < db/seed.sql

# 6. アプリケーション起動
npm run dev
```

> **注意**: `db/seed.sql` には FK 順序が考慮されており、そのまま実行できます。

---

## 方法B: TypeScriptシードスクリプトによる復元

`server/seed.ts` マスタースクリプトを使った復元方法です。
**この方法は `regulation_revisions` テーブルの一部データのみ復元されます。方法Aを推奨します。**

### シードスクリプト一覧

| ファイル | テーブル | レコード数 |
|---------|---------|-----------|
| `server/seedCondominiums.ts` | condominiums | 2件 |
| `server/seedRevisionHeaders.ts` | revision_headers | 3件 |
| `server/seedDocuments.ts` | documents | 8件 |
| `server/seedRegulationRevisions.ts` | revision_groups, regulation_revisions | 39件 |
| `server/seedRegulationAnalysisResults.ts` | regulation_analysis_results | 10件 |

### 手順

```bash
# 1. テーブル作成
npm run db:push

# 2. シード実行
npx tsx server/seed.ts
```

---

## 復元されるデータ内訳

| テーブル | 件数 | 内容 |
|---------|------|------|
| `condominiums` | 2件 | マンション物件マスター |
| `revision_headers` | 3件 | 年度別改訂ヘッダ（R5・R6・R7） |
| `documents` | 8件 | 議事録・図面等の文書 |
| `revision_groups` | 1件 | 標準管理規約改訂グループ |
| `regulation_revisions` | 39件 | 標準管理規約の改訂項目（令和7年対応） |
| `regulation_analysis_results` | 10件 | 規約分析結果 |
| `knowledge_documents` | 8件 | RAG知識ベース文書 |

> `knowledge_chunks`（ベクトル検索用チャンク）は再生成可能なため除外しています。

---

## 注意事項

### スキーマの整合性
- `regulation_revisions` テーブルは `schema.ts` と実際のDB構造が一部異なります
- 方法Bの `npm run db:push` は schema.ts ベースのテーブルを作成するため、完全な復元には**方法Aを推奨**します

### べき等性（安全な再実行）
- TypeScriptシーダーはデータが既に存在する場合はスキップします
- SQLシードは重複を避けるため、事前にテーブルが空の状態で実行してください

### アプリケーション起動時の自動シード
- `npm run dev` 起動時にも自動的にシードが実行されます
- DBが空の環境では初回起動時に自動でデータが投入されます

---

## db/ ファイルの更新方法

現在のDBの状態を `db/` ファイルに反映するには：

```bash
# スキーマのみエクスポート
pg_dump $DATABASE_URL --schema-only --no-owner --no-acl | grep -v '^\\\restrict' > db/schema.sql

# データのみエクスポート（knowledge_chunks除外）
pg_dump $DATABASE_URL --data-only --no-owner --no-acl --inserts | \
  grep -v '^\\\restrict' | \
  grep -v 'INSERT INTO public.knowledge_chunks' > db/seed.sql
```

---

## トラブルシューティング

### テーブルが既に存在する場合
```bash
# スキーマ適用時にエラーが出た場合は IF NOT EXISTS を付けて個別実行
# または既存テーブルを確認
psql $DATABASE_URL -c "\dt"
```

### 特定テーブルだけリセットして再投入したい場合
```bash
# 対象テーブルをクリア（例: regulation_analysis_results）
psql $DATABASE_URL -c "DELETE FROM regulation_analysis_results;"

# シードを再実行
npx tsx server/seed.ts
```
