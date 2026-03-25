# データベース移行・復元ガイド

## 概要

このプロジェクトのDBデータは、gitで管理されたシードスクリプトから復元できます。
新しい環境へ移行する際は、以下の手順に従ってください。

---

## シードスクリプト一覧

| ファイル | テーブル | レコード数 |
|---------|---------|-----------|
| `server/seedCondominiums.ts` | condominiums | 2件 |
| `server/seedRevisionHeaders.ts` | revision_headers | 3件 |
| `server/seedDocuments.ts` | documents | 8件 |
| `server/seedRegulationRevisions.ts` | revision_groups, regulation_revisions | 39件 |
| `server/seedRegulationAnalysisResults.ts` | regulation_analysis_results | 10件 |

**マスタースクリプト**: `server/seed.ts`（上記を全て順番に実行）

---

## 移行手順

### 1. リポジトリをクローン
```bash
git clone <リポジトリURL>
cd <プロジェクトディレクトリ>
```

### 2. 依存パッケージをインストール
```bash
npm install
```

### 3. 環境変数を設定

`.env` ファイルを作成するか、環境変数を設定：

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

### 4. DBテーブルを作成（マイグレーション実行）
```bash
npm run db:push
```

### 5. シードスクリプトを実行
```bash
npx tsx server/seed.ts
```

**実行結果の例:**
```
=================================================
[SEED] マスターシード開始
=================================================
[SEED] Starting condominiums seed check...
[SEED] Found 0 existing condominiums records
[SEED] Seeding condominiums data...
[SEED] Successfully seeded 2 condominiums.
[SEED] Starting revision_headers seed check...
...
[SEED] 完了: 成功=5 失敗=0
=================================================
```

### 6. アプリケーション起動
```bash
npm run dev
```

---

## 注意事項

### べき等性（安全な再実行）
- 各シーダーはデータが既に存在する場合はスキップします
- 何度実行しても安全です（重複データは作成されません）

### 外部キー制約による実行順序
シードは以下の順番で実行する必要があります：
```
condominiums
  └─ revision_headers
  └─ documents
  └─ regulation_revisions（regulation_groups が先に作成される）
  └─ regulation_analysis_results（condominiums に依存）
```

`npx tsx server/seed.ts` を使えば、順序は自動的に管理されます。

### アプリケーション起動時の自動シード
アプリケーション (`npm run dev`) 起動時にも自動的にシードが実行されます。
DBが空の環境では初回起動時に自動でデータが投入されます。

---

## 新規シーダーを追加する方法

1. `server/seedXxx.ts` を作成（既存シーダーを参考に）
2. `server/seed.ts` の `steps` 配列に追記
3. `server/index.ts` のシード呼び出しに追記

---

## トラブルシューティング

### シードが失敗する場合
```bash
# DBの接続確認
psql $DATABASE_URL -c "\dt"

# テーブルが存在しない場合はマイグレーションを実行
npm run db:push

# 再度シードを実行
npx tsx server/seed.ts
```

### 特定テーブルだけリセットして再シードしたい場合
```bash
# 対象テーブルをクリア（例: regulation_analysis_results）
psql $DATABASE_URL -c "DELETE FROM regulation_analysis_results;"

# シードを再実行
npx tsx server/seed.ts
```
