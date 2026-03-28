# 設計書

マンション管理AIプラットフォーム

---

## 1. システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                        クライアント層                            │
│  React 18 / Vite / TailwindCSS / shadcn/ui / TanStack Query     │
│  Wouter（ルーティング）                                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP / REST API
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        バックエンド層                            │
│  Express.js（Node.js / TypeScript）                              │
│  server/routes.ts  server/storage.ts  server/knowledgeService.ts│
└────────────┬──────────────┬──────────────────────────────────────┘
             │ SQL（Drizzle ORM / pool.query）  │ REST
             ▼                                 ▼
┌─────────────────────┐          ┌─────────────────────────────────┐
│     データ層         │          │         AIサービス層             │
│  PostgreSQL（Neon）  │          │  Gemini 1.5 Flash（OCR）         │
│  pgTable定義         │          │  Gemini 2.0 Flash（議事録生成）  │
│  uploads/ ディスク   │          │  OpenAI Whisper-1（音声変換）    │
└─────────────────────┘          └─────────────────────────────────┘
```

---

## 2. データベース設計

### 2.1 テーブル一覧

| テーブル名 | 用途 |
|------------|------|
| users | ユーザー管理 |
| condominiums | マンション（物件）管理 |
| documents | 文書管理（議事録画像等） |
| document_pages | OCR処理済みページ情報 |
| regulations | 規約条文 |
| revision_headers | 年度別改訂ヘッダー |
| revision_groups | 改訂グループ |
| regulation_revisions | 改訂項目詳細 |
| decisions | 決議事項 |
| activities | 操作ログ・活動履歴 |
| knowledge_documents | RAGナレッジ文書 |
| knowledge_chunks | RAGチャンク |
| ai_search_history | AIナレッジ検索履歴 |
| long_term_plans | 長期修繕計画 |
| repair_items | 修繕項目 |
| repair_history | 修繕履歴 |
| consultation_logs | 相談ログ |
| meeting_recordings | 議事録音声録音 |
| proposals | 議案書 |
| proposal_related_decisions | 議案-関連決議（中間テーブル） |
| action_items | アクションアイテム |
| ai_tasks | AIタスク管理 |
| regulation_analysis_results | 規約分析結果 |
| evaluation_checks | 適正評価チェック |
| evaluation_items_master | 評価項目マスタ |

---

### 2.2 テーブル詳細定義

#### users（ユーザー）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK, DEFAULT gen_random_uuid() | ユーザーID |
| username | text | NOT NULL, UNIQUE | ログイン名 |
| password | text | NOT NULL | パスワード（ハッシュ） |
| role | text | NOT NULL, DEFAULT 'manager' | ロール |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |

#### condominiums（マンション）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK, DEFAULT gen_random_uuid() | 物件ID |
| name | text | NOT NULL | マンション名 |
| address | text | NOT NULL | 所在地 |
| units | integer | NOT NULL | 戸数 |
| build_year | integer | NOT NULL | 竣工年 |
| management_start_date | timestamp | NOT NULL | 管理開始日 |
| current_regulation_version | text | DEFAULT '1.0' | 現行規約バージョン |
| law_revision_status | text | NOT NULL, DEFAULT 'pending' | 法改正対応状況（completed / in_progress / pending / not_required） |
| last_activity | timestamp | DEFAULT NOW() | 最終活動日 |
| assigned_manager | text | NULL | 担当者名 |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |
| structure_type | text | NULL | 構造種別（RC造 / SRC造 / 木造 等） |
| floors | integer | NULL | 階数 |
| management_type | text | NULL | 管理形態（全部委託 / 一部委託 / 自主管理） |
| reserve_fund_balance | integer | NULL | 積立金残高（万円） |
| reserve_fund_monthly | integer | NULL | 月額積立金（円/戸） |
| management_fee_monthly | integer | NULL | 月額管理費（円/戸） |
| delinquency_rate | numeric(5,2) | NULL | 滞納率（%） |
| proper_evaluation_score | integer | NULL | 適正評価点数 |
| proper_evaluation_star | integer | NULL | 適正評価星（1〜5） |
| long_term_plan_version | text | NULL | 長計バージョン |
| long_term_plan_date | date | NULL | 長計策定日 |

#### documents（文書）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | 文書ID |
| condominium_id | varchar | FK → condominiums.id, NOT NULL | 物件ID |
| title | text | NOT NULL | タイトル |
| type | text | NOT NULL | 種別（minutes / regulation / decision / report / other） |
| file_path | text | NULL | ファイルパス |
| original_file_name | text | NULL | 元ファイル名 |
| file_size | integer | NULL | ファイルサイズ（バイト） |
| mime_type | text | NULL | MIMEタイプ |
| ocr_status | text | DEFAULT 'pending' | OCRステータス（pending / processing / completed / failed） |
| ocr_accuracy | integer | NULL | OCR精度（0〜100） |
| ocr_text | text | NULL | OCR結果テキスト |
| meeting_date | timestamp | NULL | 議事録開催日 |
| page_count | integer | DEFAULT 1 | ページ数 |
| uploaded_at | timestamp | DEFAULT NOW() | アップロード日時 |
| processed_at | timestamp | NULL | OCR処理完了日時 |

#### document_pages（文書ページ）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | ページID |
| document_id | varchar | FK → documents.id, NOT NULL | 文書ID |
| page_number | integer | NOT NULL | ページ番号 |
| image_path | text | NOT NULL | 画像ファイルパス |
| ocr_text | text | NULL | このページのOCRテキスト |
| ocr_accuracy | integer | NULL | このページのOCR精度（0〜100） |
| low_confidence_regions | jsonb | NULL | 低精度領域リスト（座標・テキスト） |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |

#### regulations（規約条文）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | 規約ID |
| condominium_id | varchar | FK → condominiums.id, NOT NULL | 物件ID |
| version | text | NOT NULL | バージョン |
| article | text | NOT NULL | 条文番号 |
| title | text | NOT NULL | 条文タイトル |
| content | text | NOT NULL | 条文本文 |
| revision_reason | text | NULL | 改訂理由 |
| effective_date | timestamp | NULL | 施行日 |
| is_active | boolean | DEFAULT true | 有効フラグ |
| ai_generated_suggestion | text | NULL | AI改訂提案 |
| approval_status | text | DEFAULT 'draft' | 承認状態（draft / pending / approved / rejected） |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |

#### revision_headers（年度別改訂ヘッダー）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | ヘッダーID |
| year | integer | NOT NULL | 令和年度 |
| title | text | NOT NULL | タイトル（例：令和7年度改訂対応） |
| description | text | NULL | 概要説明 |
| status | text | NOT NULL, DEFAULT 'planning' | ステータス（planning / in_progress / completed / cancelled） |
| total_items | integer | DEFAULT 0 | 総改訂項目数 |
| completed_items | integer | DEFAULT 0 | 完了済み項目数 |
| start_date | timestamp | NULL | 開始日 |
| target_completion_date | timestamp | NULL | 目標完了日 |
| actual_completion_date | timestamp | NULL | 実際の完了日 |
| revision_type | text | NOT NULL, DEFAULT 'law_compliance' | 種別（law_compliance / internal_improvement / emergency） |
| priority_level | text | NOT NULL, DEFAULT 'medium' | 優先度（high / medium / low） |
| assigned_manager | text | NULL | 担当者 |
| notes | text | NULL | 備考 |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |
| updated_at | timestamp | DEFAULT NOW() | 更新日時 |

#### revision_groups（改訂グループ）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | グループID |
| title | text | NOT NULL | グループタイトル |
| version | text | NOT NULL | バージョン |
| description | text | NULL | 説明 |
| status | text | NOT NULL, DEFAULT 'active' | ステータス |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |
| updated_at | timestamp | DEFAULT NOW() | 更新日時 |

#### regulation_revisions（改訂項目）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | 改訂項目ID |
| revision_header_id | varchar | FK → revision_headers.id, NULL | ヘッダーID |
| group_id | varchar | FK → revision_groups.id, NULL | グループID |
| category | text | NOT NULL | カテゴリ |
| title | text | NOT NULL | タイトル |
| change_description | text | NOT NULL | 変更内容説明 |
| before_text | text | NULL | 変更前テキスト |
| after_text | text | NULL | 変更後テキスト |
| article_number | text | NULL | 条文番号 |
| reference_section | text | NULL | 参照節 |
| change_type | text | NOT NULL | 変更種別 |
| priority | text | DEFAULT 'medium' | 優先度（high / medium / low） |
| status | text | DEFAULT 'pending' | ステータス（pending / in_progress / completed / cancelled） |
| assigned_to | text | NULL | 担当者 |
| reviewed_by | text | NULL | レビュー者 |
| completed_at | timestamp | NULL | 完了日時 |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |
| updated_at | timestamp | DEFAULT NOW() | 更新日時 |

#### decisions（決議事項）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | 決議ID |
| condominium_id | varchar | FK → condominiums.id, NOT NULL | 物件ID |
| document_id | varchar | FK → documents.id, NULL | 関連文書ID |
| title | text | NOT NULL | タイトル |
| description | text | NULL | 説明 |
| result | text | NOT NULL | 結果（approved / rejected / deferred） |
| voting_results | jsonb | NULL | 採決結果 {favor, against, abstain} |
| related_regulation_article | text | NULL | 関連条文 |
| category | text | NOT NULL | カテゴリ（regulation_management / financial / facilities / operations / other） |
| meeting_date | timestamp | NOT NULL | 開催日 |
| is_auto_extracted | boolean | DEFAULT false | AI自動抽出フラグ |
| confidence | integer | NULL | 抽出信頼度（0〜100） |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |

#### activities（活動ログ）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | ログID |
| condominium_id | varchar | FK → condominiums.id, NOT NULL | 物件ID |
| type | text | NOT NULL | 種別（document_upload / ocr_processing / decision_extraction / ai_analysis / regulation_revision） |
| description | text | NOT NULL | 説明文 |
| status | text | NOT NULL | ステータス（success / error / in_progress） |
| user_id | varchar | FK → users.id, NULL | 操作ユーザーID |
| metadata | jsonb | NULL | 追加情報 |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |

#### knowledge_documents（RAGナレッジ文書）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | 文書ID |
| condominium_id | varchar | FK → condominiums.id, NOT NULL | 物件ID |
| title | text | NOT NULL | タイトル |
| type | text | NOT NULL | 種別（current_regulation / meeting_minutes / standard_regulation / decision_history / amendment_proposal） |
| content | text | NOT NULL | 全文テキスト |
| metadata | jsonb | NULL | メタ情報（source, version, date 等） |
| original_file_name | text | NULL | 元ファイル名 |
| uploaded_at | timestamp | DEFAULT NOW() | アップロード日時 |
| updated_at | timestamp | DEFAULT NOW() | 更新日時 |

#### knowledge_chunks（RAGチャンク）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | チャンクID |
| document_id | varchar | FK → knowledge_documents.id, NOT NULL | 文書ID |
| chunk_index | integer | NOT NULL | チャンク連番 |
| content | text | NOT NULL | チャンクテキスト（最大2,000文字） |
| embedding | text | NULL | エンベディング（将来的にベクトル型に変更予定） |
| metadata | jsonb | NULL | チャンクメタ情報（page, section, startChar, endChar, type） |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |

#### ai_search_history（AI検索履歴）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | 検索ID |
| condominium_id | varchar | FK → condominiums.id, NOT NULL | 物件ID |
| query | text | NOT NULL | 検索クエリ |
| results | jsonb | NULL | 検索結果チャンク・スコア |
| context | text | NULL | 生成されたコンテキスト |
| user_id | varchar | FK → users.id, NULL | 検索ユーザーID |
| created_at | timestamp | DEFAULT NOW() | 検索日時 |

#### long_term_plans（長期修繕計画）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | 計画ID |
| condominium_id | varchar | FK → condominiums.id, NOT NULL | 物件ID |
| version | text | NOT NULL | バージョン（例：第2版） |
| plan_start_year | integer | NOT NULL | 計画開始年 |
| plan_end_year | integer | NOT NULL | 計画終了年 |
| total_amount | integer | NULL | 計画総額（万円） |
| approved_date | date | NULL | 承認日 |
| notes | text | NULL | 備考 |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |
| updated_at | timestamp | DEFAULT NOW() | 更新日時 |

#### repair_items（修繕項目）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | 項目ID |
| condominium_id | varchar | FK → condominiums.id, NOT NULL | 物件ID |
| long_term_plan_id | varchar | FK → long_term_plans.id, NULL | 計画ID |
| category | text | NOT NULL | カテゴリ（外壁 / 屋根 / 給排水 / EV / 電気 等） |
| item_name | text | NOT NULL | 修繕項目名 |
| planned_year | integer | NULL | 予定実施年 |
| planned_amount | integer | NULL | 予定金額（万円） |
| cycle_years | integer | NULL | 修繕周期（年） |
| priority | text | DEFAULT 'medium' | 優先度（high / medium / low） |
| status | text | DEFAULT 'planned' | ステータス（planned / completed / deferred / cancelled） |
| notes | text | NULL | 備考 |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |

#### repair_history（修繕履歴）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | 履歴ID |
| condominium_id | varchar | FK → condominiums.id, NOT NULL | 物件ID |
| repair_item_id | varchar | FK → repair_items.id, NULL | 修繕項目ID |
| title | text | NOT NULL | 工事名称 |
| category | text | NOT NULL | カテゴリ |
| implemented_date | date | NOT NULL | 実施日 |
| amount | integer | NULL | 実施金額（万円） |
| contractor | text | NULL | 施工会社 |
| outcome | text | NULL | 実施結果・特記事項 |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |

#### consultation_logs（相談ログ）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | ログID |
| condominium_id | varchar | FK → condominiums.id, NOT NULL | 物件ID |
| category | text | NOT NULL | カテゴリ（クレーム / 法令解釈 / 運用判断 / 設備 等） |
| title | text | NOT NULL | タイトル |
| content | text | NOT NULL | 相談内容 |
| response | text | NULL | 回答内容 |
| responded_by | text | NULL | 回答者 |
| status | text | DEFAULT 'open' | ステータス（open / in_progress / resolved / escalated） |
| priority | text | DEFAULT 'medium' | 優先度（high / medium / low） |
| consulted_at | timestamp | DEFAULT NOW() | 相談日時 |
| resolved_at | timestamp | NULL | 解決日時 |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |

#### meeting_recordings（議事録音声録音）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | 録音ID |
| condominium_id | varchar | FK → condominiums.id, NOT NULL | 物件ID |
| document_id | varchar | FK → documents.id, NULL | 関連文書ID |
| title | text | NOT NULL | タイトル |
| meeting_date | date | NOT NULL | 会議日 |
| file_path | text | NULL | 音声ファイルパス |
| duration | integer | NULL | 録音時間（秒） |
| transcription_status | text | DEFAULT 'pending' | 文字起こし状態（pending / processing / completed / failed） |
| transcription_text | text | NULL | 文字起こしテキスト |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |

#### proposals（議案書）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | 議案ID |
| condominium_id | varchar | FK → condominiums.id, NOT NULL | 物件ID |
| title | text | NOT NULL | タイトル |
| category | text | NOT NULL | カテゴリ（規約改訂 / 修繕 / 管理費 / 役員選任 等） |
| meeting_type | text | DEFAULT 'general' | 会議種別（general / extraordinary） |
| scheduled_date | date | NULL | 予定日 |
| content | text | NULL | 議案内容 |
| background | text | NULL | 経緯・背景 |
| result | text | NULL | 決議結果（approved / rejected / deferred / pending） |
| voting_results | jsonb | NULL | 採決結果 {favor, against, abstain} |
| attachment_path | text | NULL | 添付ファイルパス |
| status | text | DEFAULT 'draft' | ステータス（draft / submitted / decided / archived） |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |
| updated_at | timestamp | DEFAULT NOW() | 更新日時 |

#### proposal_related_decisions（議案-関連決議 中間テーブル）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| proposal_id | varchar | FK → proposals.id, NOT NULL | 議案ID |
| decision_id | varchar | NOT NULL | 決議ID（FK制約なし、モックIDにも対応） |
| decision_title | text | NULL | 決議タイトル（スナップショット） |
| decision_meeting_date | text | NULL | 開催日（スナップショット） |
| decision_result | text | NULL | 結果（スナップショット） |
| decision_category | text | NULL | カテゴリ（スナップショット） |
| decision_voting_results | jsonb | NULL | 採決結果（スナップショット） |

**複合主キー**：(proposal_id, decision_id)

#### action_items（アクションアイテム）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | アイテムID |
| condominium_id | varchar | FK → condominiums.id, NOT NULL | 物件ID |
| source_type | text | NULL | 参照元種別（proposal / meeting_minutes / consultation 等） |
| source_id | varchar | NULL | 参照元ID |
| title | text | NOT NULL | タイトル |
| description | text | NULL | 詳細説明 |
| assignee | text | NULL | 担当者 |
| due_date | date | NULL | 期限 |
| status | text | DEFAULT 'open' | ステータス（open / in_progress / completed / cancelled） |
| priority | text | DEFAULT 'medium' | 優先度（high / medium / low） |
| completed_at | timestamp | NULL | 完了日時 |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |
| updated_at | timestamp | DEFAULT NOW() | 更新日時 |

#### ai_tasks（AIタスク管理）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | レコードID |
| task_id | text | UNIQUE, NOT NULL | タスクID（例：REG_ANALYSIS_1712345678） |
| task_type | text | NOT NULL | タスク種別（規約改定分析 / 議事録分析 等） |
| agent_type | text | NOT NULL | エージェント種別 |
| condominium_id | varchar | FK → condominiums.id, NULL | 物件ID |
| status | text | NOT NULL, DEFAULT 'queued' | ステータス（queued / running / completed / failed / cancelled） |
| progress | integer | DEFAULT 0 | 進捗（0〜100） |
| current_step | text | NULL | 現在の処理ステップ |
| settings | jsonb | NULL | タスク設定 |
| result | jsonb | NULL | 実行結果 |
| error_message | text | NULL | エラーメッセージ |
| estimated_duration | integer | NULL | 推定所要時間（分） |
| started_at | timestamp | NULL | 開始日時 |
| completed_at | timestamp | NULL | 完了日時 |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |

#### regulation_analysis_results（規約分析結果）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | 分析結果ID |
| condominium_id | varchar | FK → condominiums.id, NOT NULL | 物件ID |
| task_id | varchar | FK → ai_tasks.id, NULL | 関連AIタスクID |
| priority | text | NOT NULL | 優先度（high / medium / low） |
| article | text | NOT NULL | 対象条文番号 |
| title | text | NOT NULL | 分析タイトル |
| reason | text | NOT NULL | 改訂理由 |
| current_text | text | NULL | 現行テキスト |
| proposed_text | text | NULL | 改訂案テキスト |
| legal_basis | text | NULL | 法的根拠 |
| standard_regulation_ref | text | NULL | 標準管理規約参照 |
| related_decision_id | varchar | FK → decisions.id, NULL | 関連決議ID |
| law_revision_required | boolean | DEFAULT false | 法改正対応要否 |
| impact | text | NOT NULL | 影響度（high / medium / low） |
| implementation_notes | text | NULL | 実施注意事項 |
| data_sources | jsonb | NULL | 根拠データソース |
| change_history | jsonb | NULL | 時系列変更履歴 |
| status | text | DEFAULT 'draft' | ステータス（draft / approved / implemented / rejected） |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |
| updated_at | timestamp | DEFAULT NOW() | 更新日時 |

#### evaluation_checks（適正評価チェック）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | チェックID |
| condominium_id | varchar | FK → condominiums.id, NOT NULL | 物件ID |
| check_date | date | NOT NULL | 評価実施日 |
| total_score | integer | NOT NULL | 合計スコア |
| star_rating | integer | NULL | 星評価（1〜5） |
| check_results | jsonb | NULL | 項目別結果 [{itemId, score, notes}] |
| checked_by | text | NULL | 実施者 |
| notes | text | NULL | 備考 |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |

#### evaluation_items_master（評価項目マスタ）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | varchar | PK | マスタID |
| category | text | NOT NULL | カテゴリ（財務 / 修繕 / 管理運営 / 法令 / 居住環境） |
| item_code | text | NOT NULL, UNIQUE | 項目コード（例：F-01） |
| item_name | text | NOT NULL | 項目名 |
| description | text | NULL | 説明 |
| max_score | integer | NOT NULL | 最大点数 |
| evaluation_criteria | text | NULL | 評価基準 |
| sort_order | integer | DEFAULT 0 | 表示順 |
| is_active | boolean | DEFAULT true | 有効フラグ |
| created_at | timestamp | DEFAULT NOW() | 作成日時 |

---

## 3. 画面遷移設計

> **注意**：左サイドメニューはUI表示のみの用途で、ページ遷移のトリガーとして機能しない。画面遷移はヘッダーナビゲーションおよび物件詳細内のリンクから行う。

### 3.1 エントリポイント

```
アプリ起動
  ├─ / → ダッシュボード
  └─ /condominiums → マンション一覧（中心機能エントリポイント）
```

### 3.2 物件選択フロー

```
マンション一覧（/condominiums）
  └─ [詳細ボタン] → 物件詳細（/condominiums/:id）
                      └─ ヘッダーに物件名バッジ表示
                      └─ ヘッダーナビゲーションバーに機能ボタン表示
```

### 3.3 ヘッダーナビゲーション（物件選択時のみ表示）

物件が選択されている状態（URLに`condominiumId`パラメータまたは`/condominiums/:id`配下）のとき、ヘッダー第2行に以下のボタンが表示される。

| ボタン | 遷移先 |
|--------|--------|
| 物件詳細 | `/condominiums/:id` |
| 議案管理 | `/proposals/list?condominiumId=:id` |
| 議事録管理 | `/minutes/list?condominiumId=:id` |
| 長期修繕計画管理 | `/longterm/dashboard?condominiumId=:id` |
| 管理適正評価 | `/evaluation/check?condominiumId=:id` |
| 規約改訂 | `/condominiums/:id/analysis` |
| 問合せ管理 | `/condominiums/:id/issues` |
| AIチャット | `/consultation/chat?condominiumId=:id` |

### 3.4 各機能グループ内のサブページ遷移

#### 議案管理

```
/proposals/list?condominiumId=:id
  ├─ [詳細] → /proposals/:id（詳細・関連決議）
  ├─ [AI生成] → /proposals/generate
  └─ [編集] → /proposals/edit?id=:proposalId
```

#### 議事録管理

```
/minutes/list?condominiumId=:id
  ├─ [詳細] → /condominiums/:id/minutes/:minuteId
  ├─ [OCR・音声取込] → /minutes/import
  └─ [AI生成] → /minutes/generate
```

#### 長期修繕計画管理

```
/longterm/dashboard?condominiumId=:id
  ├─ /longterm/items（修繕項目一覧）
  ├─ /longterm/history（修繕履歴）
  ├─ /longterm/simulation（積立金シミュレーション）
  └─ /longterm/analysis（AI見直し分析）
```

#### 管理適正評価

```
/evaluation/check?condominiumId=:id
  ├─ /evaluation/score（スコア詳細・改善提案）
  └─ /evaluation/history（評価履歴・推移）
```

#### 規約改訂

```
/condominiums/:id/analysis（規約改訂分析）
  ├─ /condominiums/:id/regulation-analysis/:revisionId（分析結果詳細）
  ├─ /condominiums/:id/ai-revision（AI改訂案生成）
  ├─ /condominiums/:id/wiki（規約Wiki）
  ├─ /condominiums/:id/knowledge（ナレッジベース）
  ├─ /standard-regulations（標準管理規約一覧）
  │    └─ /standard-regulations/:versionId → /standard-regulations/:versionId/:id
  └─ /revision-years（年度別改訂管理）
       └─ /revision-years/:id（年度別詳細）
```

#### 問合せ管理

```
/condominiums/:id/issues
  └─ （相談一覧・相談詳細は同一ページ内で管理）
```

#### AIチャット

```
/consultation/chat?condominiumId=:id
  └─ /consultation/history（相談履歴）
```

### 3.5 グローバルルート

```
/                       ダッシュボード
/ai-agent-history       AIエージェント実行履歴
/ai-agent-history/:id   AI実行詳細
/data-import            データ取込（OCR処理）
/reports                レポート
/settings               設定
```

---

## 4. API設計

### 4.1 ダッシュボード

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| GET | /api/dashboard/stats | ダッシュボード統計情報取得 | 不要 |
| GET | /api/dashboard/activities | 最近の活動一覧取得 | 不要 |

### 4.2 マンション（物件）

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| GET | /api/condominiums | マンション一覧取得 | 不要 |
| GET | /api/condominiums/:id | マンション詳細取得 | 不要 |
| POST | /api/condominiums/:id/upload | 文書アップロード（モック） | 不要 |
| POST | /api/condominiums/:id/start-ocr | OCR処理開始 | 不要 |

### 4.3 文書・OCR

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| GET | /api/condominiums/:id/documents | 文書一覧取得 | 不要 |
| GET | /api/documents/:id | 文書詳細取得 | 不要 |
| GET | /api/documents/:id/ocr | OCRデータ取得 | 不要 |
| POST | /api/documents/process-ocr | リアルタイムOCR処理（マルチパート画像） | 不要 |
| POST | /api/documents/ocr-upload | OCR結果を文書として保存 | 不要 |

**POST /api/documents/process-ocr リクエスト**

```
Content-Type: multipart/form-data
files: [画像ファイル（複数可）]
```

**レスポンス**

```json
{
  "success": true,
  "results": [
    {
      "pageNumber": 1,
      "text": "抽出テキスト",
      "accuracy": 95,
      "lowConfidenceRegions": [
        {
          "text": "不明瞭テキスト",
          "confidence": 60,
          "coordinates": { "x": 100, "y": 200, "width": 50, "height": 20 }
        }
      ]
    }
  ]
}
```

### 4.4 議事録

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| GET | /api/condominiums/:id/minutes | 議事録一覧取得 | 不要 |
| GET | /api/condominiums/:id/minutes/:minuteId | 議事録詳細取得 | 不要 |
| POST | /api/minutes/generate | AI議事録生成 | 不要 |
| POST | /api/minutes/transcribe | 音声文字起こし（Whisper） | 不要 |
| POST | /api/condominiums/:id/load-minutes | 議事録データをRAGに登録 | 不要 |

**POST /api/minutes/generate リクエスト**

```json
{
  "meetingType": "通常総会",
  "meetingDate": "2025-03-15",
  "location": "集会室",
  "participants": "田中理事長、鈴木副理事長 ほか",
  "notes": "議題1: 収支報告\n議題2: 修繕計画確認"
}
```

**POST /api/minutes/transcribe リクエスト**

```
Content-Type: multipart/form-data
audio: [音声ファイル（MP3/WAV/M4A, 最大25MB）]
```

### 4.5 決議事項

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| GET | /api/condominiums/:id/decisions | 決議事項一覧取得 | 不要 |
| POST | /api/condominiums/:id/confirm-decisions | 決議事項確定 | 不要 |

### 4.6 規約・改訂

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| GET | /api/condominiums/:id/regulations | 規約条文一覧取得 | 不要 |
| GET | /api/condominiums/:id/regulation-analysis | 規約分析結果一覧取得 | 不要 |
| GET | /api/condominiums/:id/regulation-analysis/:revisionId | 規約分析結果詳細取得 | 不要 |
| POST | /api/condominiums/:id/start-regulation-analysis | 規約分析開始 | 不要 |
| GET | /api/regulation-revisions | 改訂項目一覧取得 | 不要 |
| GET | /api/regulation-revisions/:id | 改訂項目詳細取得 | 不要 |
| PATCH | /api/regulation-revisions/:id | 改訂項目更新 | 不要 |
| GET | /api/revision-headers | 年度別改訂ヘッダー一覧取得 | 不要 |
| GET | /api/revision-headers/:id | 年度別改訂ヘッダー詳細取得（改訂項目含む） | 不要 |
| GET | /api/standard-regulations | 標準管理規約取得 | 不要 |
| GET | /api/condominiums/:id/analysis | 規約分析エイリアス（/regulation-analysis にリダイレクト） | 不要 |
| GET | /api/condominiums/:id/extraction-results | 決議抽出結果サマリー取得 | 不要 |
| GET | /api/condominiums/:id/ai-revision-options | AI改訂オプション取得 | 不要 |
| GET | /api/condominiums/:id/ai-generation-status | AI生成ステータス取得 | 不要 |
| POST | /api/condominiums/:id/generate-ai-revision | AI改訂案生成開始 | 不要 |
| POST | /api/condominiums/:id/confirm-revision | 改訂案確定 | 不要 |

### 4.7 ナレッジベース

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| GET | /api/condominiums/:id/knowledge | ナレッジ文書一覧取得 | 不要 |
| GET | /api/condominiums/:id/knowledge/:type | 種別別ナレッジ文書取得 | 不要 |
| POST | /api/condominiums/:id/knowledge/upload | ナレッジ文書アップロード | 不要 |
| POST | /api/condominiums/:id/knowledge/search | ナレッジ検索 | 不要 |
| GET | /api/condominiums/:id/knowledge/search-history | 検索履歴取得 | 不要 |
| DELETE | /api/knowledge/:documentId | ナレッジ文書削除 | 不要 |
| POST | /api/condominiums/:id/load-assets | 添付資産をRAGに一括登録 | 不要 |

**POST /api/condominiums/:id/knowledge/search リクエスト**

```json
{
  "query": "ペット飼育規則",
  "type": "current_regulation"
}
```

### 4.8 長期修繕計画

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| GET | /api/condominiums/:id/long-term-plans | 長期修繕計画一覧取得 | 不要 |
| GET | /api/long-term-plans/:id | 長期修繕計画詳細取得 | 不要 |
| POST | /api/condominiums/:id/long-term-plans | 長期修繕計画作成 | 不要 |
| PATCH | /api/long-term-plans/:id | 長期修繕計画更新 | 不要 |
| GET | /api/condominiums/:id/repair-items | 修繕項目一覧取得 | 不要 |
| GET | /api/repair-items/:id | 修繕項目詳細取得 | 不要 |
| POST | /api/condominiums/:id/repair-items | 修繕項目作成 | 不要 |
| PATCH | /api/repair-items/:id | 修繕項目更新 | 不要 |
| GET | /api/condominiums/:id/repair-history | 修繕履歴一覧取得 | 不要 |
| POST | /api/condominiums/:id/repair-history | 修繕履歴作成 | 不要 |

### 4.9 相談ログ

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| GET | /api/condominiums/:id/consultation-logs | 相談ログ一覧取得 | 不要 |
| GET | /api/consultation-logs/:id | 相談ログ詳細取得 | 不要 |
| POST | /api/condominiums/:id/consultation-logs | 相談ログ作成 | 不要 |
| PATCH | /api/consultation-logs/:id | 相談ログ更新 | 不要 |

### 4.10 議事録録音

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| GET | /api/condominiums/:id/meeting-recordings | 録音一覧取得 | 不要 |
| POST | /api/condominiums/:id/meeting-recordings | 録音登録 | 不要 |

### 4.11 議案書

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| GET | /api/condominiums/:id/proposals | 議案一覧取得 | 不要 |
| GET | /api/proposals/:id | 議案詳細取得（関連決議含む） | 不要 |
| POST | /api/condominiums/:id/proposals | 議案作成 | 不要 |
| PATCH | /api/proposals/:id | 議案更新 | 不要 |
| GET | /api/proposals/:id/related-decisions | 関連決議一覧取得 | 不要 |
| POST | /api/proposals/:id/related-decisions | 関連決議追加 | 不要 |
| DELETE | /api/proposals/:id/related-decisions/:decisionId | 関連決議削除 | 不要 |

### 4.12 アクションアイテム

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| GET | /api/condominiums/:id/action-items | アクションアイテム一覧取得 | 不要 |
| GET | /api/action-items/:id | アクションアイテム詳細取得 | 不要 |
| POST | /api/condominiums/:id/action-items | アクションアイテム作成 | 不要 |
| PATCH | /api/action-items/:id | アクションアイテム更新 | 不要 |

### 4.13 適正評価

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| GET | /api/condominiums/:id/evaluation-checks | 評価チェック一覧取得 | 不要 |
| POST | /api/condominiums/:id/evaluation-checks | 評価チェック作成 | 不要 |
| GET | /api/evaluation-items-master | 評価項目マスタ取得（?category= でフィルタ可） | 不要 |
| POST | /api/evaluation-items-master | 評価項目マスタ作成 | 不要 |

---

## 5. AIエージェント設計

### 5.1 OCRエージェント シーケンス図

```
クライアント → POST /api/documents/process-ocr（画像ファイル）
  → server/routes.ts: uploadMemory.array()でメモリ受信
  → server/gemini.ts: extractTextFromMultipleImages()
      → 各ページ: extractTextFromImage()
          → Gemini 1.5 Flash API (gemini-1.5-flash)
              → responseMimeType: "application/json"
              → responseSchema: {text, accuracy, lowConfidenceRegions}
          → JSONパース
              ├─ 成功: {text, accuracy(80-100), lowConfidenceRegions}
              └─ 失敗: 正規表現フォールバック → accuracy=85
          → エラー: {text:"[エラーメッセージ]", accuracy:0, regions:[]}
      → 500ms待機（レート制限回避）
  → クライアントへ {success:true, results:[...]}
```

**プロンプト構造**

```
systemPrompt: 日本語議事録専門OCRシステムとして:
  1. すべてのテキストを正確に抽出
  2. 手書き文字を含めて読み取り
  3. 空白・改行・インデントを完全保持
  4. 表形式・レイアウト構造を維持
  5. 読み取り困難箇所は[?]表記

responseSchema: {text, accuracy, lowConfidenceRegions[{text,confidence,coordinates}]}
```

### 5.2 音声文字起こしエージェント シーケンス図

```
クライアント → POST /api/minutes/transcribe（音声ファイル）
  → server/routes.ts: uploadAudio.single()でディスク保存（uploads/audio/）
  → server/openai.ts: transcribeAudio(fileBuffer, filename, mimeType)
      → OpenAI.toFile()でFileオブジェクト生成
      → openai.audio.transcriptions.create({
            file, model:"whisper-1", language:"ja", response_format:"text"
         })
      → 文字起こしテキスト返却
  → 一時ファイル削除（finally句）
  → クライアントへ {text: "..."}
```

**エラーハンドリング**

- OPENAI_API_KEY未設定: Error("OPENAI_API_KEY environment variable is not set")スロー
- ファイルサイズ超過（25MB超）: 400エラー
- 非対応形式: 400エラー
- APIエラー: 500エラー

### 5.3 議事録生成エージェント シーケンス図

```
クライアント → POST /api/minutes/generate
  → Zodバリデーション: {meetingType, meetingDate, location, participants, notes}
  → Promise.all([generateMinutes(input), setTimeout(5500ms)])
      → server/gemini.ts: generateMinutes()
          → GEMINI_API_KEY あり:
              → Gemini 2.0 Flash API (gemini-2.0-flash)
                  → prompt: 議事録フォーマット指定 + 入力情報
              → response.text
          → GEMINI_API_KEY なし or エラー:
              → buildDemoMinutes(input) でテンプレート議事録返却
  → クライアントへ {minutes: "..."}
```

**プロンプト構造**

```
role: マンション管理プロフェッショナル
format:
  - タイトル（会議種別・回次）
  - 日時・場所・出席者
  - 議題一覧
  - 審議内容（各議題詳細）
  - 決定事項（番号付きリスト）
  - 次回予定
requirements:
  - 丁寧で正式な日本語
  - メモの整理・補完
  - 決定事項を明確に記載
```

### 5.4 決議抽出エージェント シーケンス図

```
クライアント → GET /api/condominiums/:id/decisions
  → knowledgeService.getKnowledgeDocuments(condominiumId)
  → decision_historyタイプの文書を抽出
  → 現フェーズ: ハードコードされた決議データを返却（エンコード問題の暫定対応）
  → 将来フェーズ:
      → knowledgeService.extractMeetingDecisions(content)
          → テキストを行単位でパース
          → テーブル行（|区切り）から開催日・会議種別・議題・カテゴリを抽出
          → {id, meetingDate, meetingType, category, agenda, decision, result, relatedArticle}[]
  → クライアントへ決議一覧
```

### 5.5 規約分析エージェント シーケンス図

```
クライアント → POST /api/condominiums/:id/start-regulation-analysis
  → AIタスク登録: ai_tasks {taskId, taskType:"規約改定分析", agentType:"規約分析エージェント", status:"running"}
  → setTimeout 3秒後: ai_tasks.status = 'completed'
  → クライアントへ {taskId, message:"分析開始"}

クライアント → GET /api/condominiums/:id/regulation-analysis
  → regulation_analysis_results テーブルから取得
  → 優先度（high→medium→low）・作成日でソート
  → クライアントへ {totalIssues, issues:[...]}
```

### 5.6 規約改訂案生成エージェント シーケンス図

```
クライアント → POST /api/condominiums/:id/generate-ai-revision
  → activities テーブルに ai_analysis ログ記録
  → 将来実装: 分析結果の各issueに対して複数改訂オプションを生成
      → オプション1: 決議準拠（過去決議データ参照）
      → オプション2: 標準規約準拠（標準管理規約参照）
      → オプション3: 独自維持（現行規約ベース）
  → クライアントへ {message:"生成開始"}
```

### 5.7 RAGパイプライン

```
[文書登録フロー]
クライアント → POST /api/condominiums/:id/knowledge/upload（テキストファイル）
  → knowledgeService.uploadKnowledgeDocument()
      → knowledge_documents テーブルにINSERT
      → processDocumentIntoChunks():
          チャンクサイズ: 2,000文字
          オーバーラップ: 400文字
          → knowledge_chunks テーブルにINSERT
          （embedding: NULL ※将来pgvector対応）

[検索フロー]
クライアント → POST /api/condominiums/:id/knowledge/search
  → knowledgeService.searchKnowledge(condominiumId, query, type?)
      → knowledge_documents: content ILIKE '%query%' でテキスト検索（上位10件）
      → knowledge_chunks: content ILIKE '%query%' でテキスト検索（上位20件）
          ※knowledge_documentsとINNER JOINしてcondominium_idでスコープ
      → {chunks, documents}
  → クライアントへ検索結果

[将来のベクトル検索移行計画]
  embedding カラムに pgvector 型を適用
  → OpenAI text-embedding-3-small などでエンベディング生成
  → cosine similarityによるベクトル検索に移行
```

### 5.8 管理業務相談エージェント シーケンス図

```
クライアント → POST /api/condominiums/:id/consultation-logs（相談内容）
  → consultation_logs にステータス'open'でINSERT
  → RAGナレッジ検索: searchKnowledge(condominiumId, content)
  → [将来実装] Gemini/GPT-4oで回答生成:
      systemPrompt: マンション管理の専門家として回答
      context: RAGで取得したチャンクテキスト
      userMessage: 相談内容
  → consultation_logs.response に回答を保存（PATCH）
  → クライアントへ {response, relatedChunks}
```

---

## 6. フロントエンドコンポーネント設計

### 6.1 レイアウト構造

```
Layout（client/src/components/Layout.tsx）
  ├── Sidebar（client/src/components/Sidebar.tsx）
  │     ├── ロゴ
  │     ├── ナビメニュー（UI表示のみ・遷移なし）
  │     └── 設定リンク
  ├── Header（client/src/components/Header.tsx）
  │     ├── Row1: パンくず / 物件バッジ / 検索 / 通知 / ユーザー
  │     └── Row2: 機能ボタン群（物件選択時のみ表示）
  └── <children>（各ページコンポーネント）
```

### 6.2 主要ページコンポーネントと責務

| コンポーネント | パス | 責務 |
|--------------|------|------|
| Dashboard | `/pages/Dashboard.tsx` | 統計カード・最近の活動一覧 |
| CondominiumList | `/pages/CondominiumList.tsx` | マンション一覧テーブル・検索・フィルタ |
| CondominiumDetail | `/pages/CondominiumDetail.tsx` | 物件詳細5タブ（基本情報・修繕・議案・議事録・評価） |
| MinutesList | `/pages/MinutesList.tsx` | 議事録一覧・RAGデータ表示 |
| MinutesGenerate | `/pages/MinutesGenerate.tsx` | AI議事録生成フォーム・結果表示 |
| MinutesImport | `/pages/MinutesImport.tsx` | OCR・音声ファイル取込 |
| MinuteDetail | `/pages/MinuteDetail.tsx` | 議事録詳細・原文表示 |
| ProposalsList | `/pages/ProposalsList.tsx` | 議案一覧・フィルタ |
| ProposalsEdit | `/pages/ProposalsEdit.tsx` | 議案編集・関連決議リンク管理 |
| RegulationAnalysis | `/pages/RegulationAnalysis.tsx` | 規約分析結果一覧 |
| RegulationRevisionDetail | `/pages/RegulationRevisionDetail.tsx` | 分析結果詳細・改訂案表示 |
| AIRevisionGeneration | `/pages/AIRevisionGeneration.tsx` | AI改訂案生成・オプション選択 |
| LongtermDashboard | `/pages/LongtermDashboard.tsx` | 修繕計画ダッシュボード |
| LongtermSimulation | `/pages/LongtermSimulation.tsx` | 積立金シミュレーション |
| ConsultationChat | `/pages/ConsultationChat.tsx` | AIチャットUI |
| ConsultationHistory | `/pages/ConsultationHistory.tsx` | 相談履歴一覧 |
| EvaluationCheck | `/pages/EvaluationCheck.tsx` | 適正評価チェックリスト入力 |
| EvaluationScore | `/pages/EvaluationScore.tsx` | スコア集計・改善提案 |
| KnowledgeBaseStandalone | `/pages/KnowledgeBaseStandalone.tsx` | RAGナレッジ文書管理・検索 |
| RegulationWiki | `/pages/RegulationWiki.tsx` | 規約Wiki閲覧 |

### 6.3 共有コンポーネントと責務

| コンポーネント | 責務 |
|--------------|------|
| Header | パンくずナビ・物件バッジ・機能ボタンバー |
| Sidebar | サイドメニュー（UI表示のみ） |
| SubNav | 機能グループ内のサブナビゲーション |
| Layout | ページ全体のレイアウト枠組み |

### 6.4 データフェッチパターン

- 読み取り: `useQuery({ queryKey: ['/api/...'] })` — デフォルトfetcherを使用
- 書き込み: `useMutation` + `apiRequest()` + `queryClient.invalidateQueries()`
- 物件コンテキスト: URLパラメータまたは`?condominiumId=`クエリパラメータから取得

---

## 7. セキュリティ設計

### 7.1 認証フロー

- 現フェーズ: 認証なし（すべてのAPIはパブリックアクセス可能）
- 将来フェーズ: Replit Auth / JWT認証を導入予定
- ユーザーIDはモックで `"mock-user-id"` を使用（activityログ等）

### 7.2 APIキー管理

| キー | 管理方法 |
|------|---------|
| GEMINI_API_KEY | サーバー環境変数（フロントエンド非露出） |
| OPENAI_API_KEY | サーバー環境変数（フロントエンド非露出） |
| DATABASE_URL | サーバー環境変数（Neon接続文字列） |

- フロントエンドで使用できる環境変数は `VITE_` プレフィックスが必要（本システムでは該当なし）
- APIキー未設定時はGeminiエージェントがデモモードにフォールバック

### 7.3 ファイルアップロードセキュリティ

- 画像アップロード: MIMEタイプを `image/*` に制限、10MBサイズ制限
- 音声アップロード: `audio/mpeg, audio/wav, audio/x-wav, audio/mp4, audio/m4a` に制限、25MBサイズ制限
- ナレッジ文書: テキストファイル（`.txt`）推奨、エンコーディングはUTF-8
- 一時ファイル（音声）: 処理完了後に `fs.unlink()` で削除

### 7.4 SQLインジェクション対策

- Drizzle ORM使用箇所: プレースホルダーによるパラメータバインド
- pool.query使用箇所: `$1, $2, ...` パラメータバインド
- db.execute使用箇所: UUIDに対して `[^a-f0-9\-]` サニタイズ適用（一部箇所）
- 残課題: db.execute内のテンプレートリテラル埋め込みはパラメータ化を要検討
