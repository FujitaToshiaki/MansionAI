import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("manager"),
  createdAt: timestamp("created_at").defaultNow()
});

export const condominiums = pgTable("condominiums", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  units: integer("units").notNull(),
  buildYear: integer("build_year").notNull(),
  managementStartDate: timestamp("management_start_date").notNull(),
  currentRegulationVersion: text("current_regulation_version").default("1.0"),
  lawRevisionStatus: text("law_revision_status").notNull().default("pending"), // completed, in_progress, pending, not_required
  lastActivity: timestamp("last_activity").defaultNow(),
  assignedManager: text("assigned_manager"),
  createdAt: timestamp("created_at").defaultNow(),
  // 拡張カラム（Task-17）
  structureType: text("structure_type"),              // RC造, SRC造, 木造 etc.
  floors: integer("floors"),                          // 階数
  managementType: text("management_type"),            // 全部委託, 一部委託, 自主管理
  reserveFundBalance: integer("reserve_fund_balance"),// 積立金残高（万円）
  reserveFundMonthly: integer("reserve_fund_monthly"),// 月額積立金（円/戸）
  managementFeeMonthly: integer("management_fee_monthly"), // 月額管理費（円/戸）
  delinquencyRate: numeric("delinquency_rate", { precision: 5, scale: 2 }), // 滞納率（%）
  properEvaluationScore: integer("proper_evaluation_score"), // 適正評価点数
  properEvaluationStar: integer("proper_evaluation_star"),   // 適正評価星（1-5）
  longTermPlanVersion: text("long_term_plan_version"),       // 長計バージョン
  longTermPlanDate: date("long_term_plan_date"),             // 長計策定日
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condominiumId: varchar("condominium_id").references(() => condominiums.id).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // minutes, regulation, decision, report
  filePath: text("file_path"),
  originalFileName: text("original_file_name"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  ocrStatus: text("ocr_status").default("pending"), // pending, processing, completed, failed
  ocrAccuracy: integer("ocr_accuracy"),
  ocrText: text("ocr_text"),
  meetingDate: timestamp("meeting_date"), // 議事録の開催日
  pageCount: integer("page_count").default(1), // ページ数
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  processedAt: timestamp("processed_at")
});

// OCR処理された各ページの情報
export const document_pages = pgTable("document_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => documents.id).notNull(),
  pageNumber: integer("page_number").notNull(),
  imagePath: text("image_path").notNull(), // 画像ファイルのパス
  ocrText: text("ocr_text"), // このページのOCRテキスト
  ocrAccuracy: integer("ocr_accuracy"), // このページの精度（0-100）
  lowConfidenceRegions: jsonb("low_confidence_regions"), // 精度が低い領域の座標とテキスト
  createdAt: timestamp("created_at").defaultNow()
});

export const decisions = pgTable("decisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condominiumId: varchar("condominium_id").references(() => condominiums.id).notNull(),
  documentId: varchar("document_id").references(() => documents.id),
  title: text("title").notNull(),
  description: text("description"),
  result: text("result").notNull(), // approved, rejected, deferred
  votingResults: jsonb("voting_results"), // {favor: number, against: number, abstain: number}
  relatedRegulationArticle: text("related_regulation_article"),
  category: text("category").notNull(), // regulation_management, financial, facilities, operations, other
  meetingDate: timestamp("meeting_date").notNull(),
  isAutoExtracted: boolean("is_auto_extracted").default(false),
  confidence: integer("confidence"),
  createdAt: timestamp("created_at").defaultNow()
});

export const regulations = pgTable("regulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condominiumId: varchar("condominium_id").references(() => condominiums.id).notNull(),
  version: text("version").notNull(),
  article: text("article").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  revisionReason: text("revision_reason"),
  effectiveDate: timestamp("effective_date"),
  isActive: boolean("is_active").default(true),
  aiGeneratedSuggestion: text("ai_generated_suggestion"),
  approvalStatus: text("approval_status").default("draft"), // draft, pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow()
});

// 改訂グループテーブル（revision_groups）
export const revision_groups = pgTable("revision_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  version: text("version").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// 年度別改訂ヘッダテーブル
export const revision_headers = pgTable("revision_headers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  year: integer("year").notNull(), // 令和年度（例：7 = 令和7年度）
  title: text("title").notNull(), // 例：「令和7年度改訂対応」
  description: text("description"), // 改訂の概要説明
  status: text("status").notNull().default("planning"), // planning, in_progress, completed, cancelled
  totalItems: integer("total_items").default(0), // 総改訂項目数
  completedItems: integer("completed_items").default(0), // 完了済み項目数
  startDate: timestamp("start_date"),
  targetCompletionDate: timestamp("target_completion_date"),
  actualCompletionDate: timestamp("actual_completion_date"),
  revisionType: text("revision_type").notNull().default("law_compliance"), // law_compliance, internal_improvement, emergency
  priorityLevel: text("priority_level").notNull().default("medium"), // high, medium, low
  assignedManager: text("assigned_manager"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// 既存の regulation_revisions テーブルに revision_header_id を追加
export const regulation_revisions = pgTable("regulation_revisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  revision_header_id: varchar("revision_header_id").references(() => revision_headers.id),
  group_id: varchar("group_id").references(() => revision_groups.id),
  category: text("category").notNull(),
  title: text("title").notNull(),
  change_description: text("change_description").notNull(),
  before_text: text("before_text"),
  after_text: text("after_text"),
  article_number: text("article_number"),
  reference_section: text("reference_section"),
  change_type: text("change_type").notNull(),
  priority: text("priority").default("medium"),
  status: text("status").default("pending"), // pending, in_progress, completed, cancelled
  assignedTo: text("assigned_to"),
  reviewedBy: text("reviewed_by"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condominiumId: varchar("condominium_id").references(() => condominiums.id).notNull(),
  type: text("type").notNull(), // document_upload, ocr_processing, decision_extraction, ai_analysis, regulation_revision
  description: text("description").notNull(),
  status: text("status").notNull(), // success, error, in_progress
  userId: varchar("user_id").references(() => users.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow()
});

// RAG Knowledge Base Tables
export const knowledgeDocuments = pgTable("knowledge_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condominiumId: varchar("condominium_id").references(() => condominiums.id).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // current_regulation, meeting_minutes, standard_regulation
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // {source: string, version: string, date: string, etc}
  originalFileName: text("original_file_name"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const knowledgeChunks = pgTable("knowledge_chunks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => knowledgeDocuments.id).notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  embedding: text("embedding"), // Store embedding as JSON string for now
  metadata: jsonb("metadata"), // {page: number, section: string, etc}
  createdAt: timestamp("created_at").defaultNow()
});

export const aiSearchHistory = pgTable("ai_search_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condominiumId: varchar("condominium_id").references(() => condominiums.id).notNull(),
  query: text("query").notNull(),
  results: jsonb("results"), // Relevant chunks and scores
  context: text("context"), // Generated context from search
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});

// =====================================================================
// 長期修繕計画テーブル（Task-17）
// =====================================================================

export const long_term_plans = pgTable("long_term_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condominiumId: varchar("condominium_id").references(() => condominiums.id).notNull(),
  version: text("version").notNull(),                    // 例: "第2版"
  planStartYear: integer("plan_start_year").notNull(),   // 計画開始年
  planEndYear: integer("plan_end_year").notNull(),       // 計画終了年
  totalAmount: integer("total_amount"),                  // 計画総額（万円）
  approvedDate: date("approved_date"),                   // 策定・承認日
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// 修繕項目テーブル
export const repair_items = pgTable("repair_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condominiumId: varchar("condominium_id").references(() => condominiums.id).notNull(),
  longTermPlanId: varchar("long_term_plan_id").references(() => long_term_plans.id),
  category: text("category").notNull(),        // 外壁, 屋根, 給排水, EV, 電気, etc.
  itemName: text("item_name").notNull(),        // 修繕項目名
  plannedYear: integer("planned_year"),         // 予定実施年
  plannedAmount: integer("planned_amount"),     // 予定金額（万円）
  cycleYears: integer("cycle_years"),           // 修繕周期（年）
  priority: text("priority").default("medium"), // high, medium, low
  status: text("status").default("planned"),   // planned, completed, deferred, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// 修繕履歴テーブル
export const repair_history = pgTable("repair_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condominiumId: varchar("condominium_id").references(() => condominiums.id).notNull(),
  repairItemId: varchar("repair_item_id").references(() => repair_items.id),
  title: text("title").notNull(),              // 工事名称
  category: text("category").notNull(),        // 外壁, 屋根, 給排水, EV, 電気, etc.
  implementedDate: date("implemented_date").notNull(), // 実施日（年）
  amount: integer("amount"),                   // 実施金額（万円）
  contractor: text("contractor"),              // 施工会社
  outcome: text("outcome"),                    // 実施結果・特記事項
  createdAt: timestamp("created_at").defaultNow()
});

// 相談ログテーブル
export const consultation_logs = pgTable("consultation_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condominiumId: varchar("condominium_id").references(() => condominiums.id).notNull(),
  category: text("category").notNull(),        // クレーム, 法令解釈, 運用判断, 設備, etc.
  title: text("title").notNull(),
  content: text("content").notNull(),          // 相談内容
  response: text("response"),                  // 対応内容・回答
  respondedBy: text("responded_by"),           // 対応者
  status: text("status").default("open"),      // open, in_progress, resolved, escalated
  priority: text("priority").default("medium"), // high, medium, low
  consultedAt: timestamp("consulted_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// 議事録音声録音テーブル
export const meeting_recordings = pgTable("meeting_recordings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condominiumId: varchar("condominium_id").references(() => condominiums.id).notNull(),
  documentId: varchar("document_id").references(() => documents.id),
  title: text("title").notNull(),
  meetingDate: date("meeting_date").notNull(),
  filePath: text("file_path"),
  duration: integer("duration"),               // 録音時間（秒）
  transcriptionStatus: text("transcription_status").default("pending"), // pending, processing, completed, failed
  transcriptionText: text("transcription_text"),
  createdAt: timestamp("created_at").defaultNow()
});

// 議案書テーブル
export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condominiumId: varchar("condominium_id").references(() => condominiums.id).notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),        // 規約改訂, 修繕, 管理費, 役員選任, etc.
  meetingType: text("meeting_type").default("general"), // general（通常総会）, extraordinary（臨時総会）
  scheduledDate: date("scheduled_date"),
  content: text("content"),                    // 議案内容
  result: text("result"),                      // 決議結果: approved, rejected, deferred, pending
  votingResults: jsonb("voting_results"),       // {favor, against, abstain}
  attachmentPath: text("attachment_path"),
  status: text("status").default("draft"),     // draft, submitted, decided, archived
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// アクションアイテムテーブル
export const action_items = pgTable("action_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condominiumId: varchar("condominium_id").references(() => condominiums.id).notNull(),
  sourceType: text("source_type"),             // proposal, meeting_minutes, consultation, etc.
  sourceId: varchar("source_id"),              // 参照元ID
  title: text("title").notNull(),
  description: text("description"),
  assignee: text("assignee"),                  // 担当者
  dueDate: date("due_date"),
  status: text("status").default("open"),      // open, in_progress, completed, cancelled
  priority: text("priority").default("medium"), // high, medium, low
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// 適正評価チェックテーブル
export const evaluation_checks = pgTable("evaluation_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condominiumId: varchar("condominium_id").references(() => condominiums.id).notNull(),
  checkDate: date("check_date").notNull(),
  totalScore: integer("total_score").notNull(),
  starRating: integer("star_rating"),          // 1-5
  checkResults: jsonb("check_results"),        // [{itemId, score, notes}]
  checkedBy: text("checked_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// 評価項目マスタテーブル
export const evaluation_items_master = pgTable("evaluation_items_master", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(),        // 財務, 修繕, 管理運営, 法令, 居住環境
  itemCode: text("item_code").notNull().unique(), // 例: F-01, R-03
  itemName: text("item_name").notNull(),
  description: text("description"),
  maxScore: integer("max_score").notNull(),    // 最大点数
  evaluationCriteria: text("evaluation_criteria"), // 評価基準テキスト
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertCondominiumSchema = createInsertSchema(condominiums).omit({
  id: true,
  createdAt: true,
  lastActivity: true
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
  processedAt: true
});

export const insertDecisionSchema = createInsertSchema(decisions).omit({
  id: true,
  createdAt: true
});

export const insertRegulationSchema = createInsertSchema(regulations).omit({
  id: true,
  createdAt: true
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true
});

export const insertKnowledgeDocumentSchema = createInsertSchema(knowledgeDocuments).omit({
  id: true,
  uploadedAt: true,
  updatedAt: true
});

export const insertKnowledgeChunkSchema = createInsertSchema(knowledgeChunks).omit({
  id: true,
  createdAt: true
});

// Revision Header スキーマ
export const insertRevisionHeaderSchema = createInsertSchema(revision_headers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Regulation Revision スキーマ（更新）
export const insertRegulationRevisionSchema = createInsertSchema(regulation_revisions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// AI Agent Task Management
export const aiTasks = pgTable("ai_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: text("task_id").unique().notNull(),
  taskType: text("task_type").notNull(), // 規約改定分析, 議事録分析, etc
  agentType: text("agent_type").notNull(), // 規約分析エージェント, etc
  condominiumId: varchar("condominium_id").references(() => condominiums.id),
  status: text("status").notNull().default("queued"), // queued, running, completed, failed, cancelled
  progress: integer("progress").default(0), // 0-100
  currentStep: text("current_step"),
  settings: jsonb("settings"), // 分析設定内容
  result: jsonb("result"), // 分析結果
  errorMessage: text("error_message"),
  estimatedDuration: integer("estimated_duration"), // 分単位
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// Regulation Revision Analysis Results
export const regulationAnalysisResults = pgTable("regulation_analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condominiumId: varchar("condominium_id").references(() => condominiums.id).notNull(),
  taskId: varchar("task_id").references(() => aiTasks.id),
  priority: text("priority").notNull(), // high, medium, low
  article: text("article").notNull(),
  title: text("title").notNull(),
  reason: text("reason").notNull(),
  currentText: text("current_text"),
  proposedText: text("proposed_text"),
  legalBasis: text("legal_basis"),
  standardRegulationRef: text("standard_regulation_ref"),
  relatedDecisionId: varchar("related_decision_id").references(() => decisions.id),
  lawRevisionRequired: boolean("law_revision_required").default(false),
  impact: text("impact").notNull(), // high, medium, low
  implementationNotes: text("implementation_notes"),
  dataSources: jsonb("data_sources"), // 根拠となるデータソース
  changeHistory: jsonb("change_history"), // 時系列変更履歴
  status: text("status").default("draft"), // draft, approved, implemented, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertAiSearchHistorySchema = createInsertSchema(aiSearchHistory).omit({
  id: true,
  createdAt: true
});

export const insertAiTaskSchema = createInsertSchema(aiTasks).omit({
  id: true,
  createdAt: true
});

export const insertRegulationAnalysisResultSchema = createInsertSchema(regulationAnalysisResults).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Condominium = typeof condominiums.$inferSelect;
export type InsertCondominium = z.infer<typeof insertCondominiumSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Decision = typeof decisions.$inferSelect;
export type InsertDecision = z.infer<typeof insertDecisionSchema>;

export type Regulation = typeof regulations.$inferSelect;
export type InsertRegulation = z.infer<typeof insertRegulationSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type KnowledgeDocument = typeof knowledgeDocuments.$inferSelect;
export type InsertKnowledgeDocument = z.infer<typeof insertKnowledgeDocumentSchema>;

export type KnowledgeChunk = typeof knowledgeChunks.$inferSelect;
export type InsertKnowledgeChunk = z.infer<typeof insertKnowledgeChunkSchema>;

export type AiSearchHistory = typeof aiSearchHistory.$inferSelect;
export type InsertAiSearchHistory = z.infer<typeof insertAiSearchHistorySchema>;

export type AiTask = typeof aiTasks.$inferSelect;
export type InsertAiTask = z.infer<typeof insertAiTaskSchema>;

export type RegulationAnalysisResult = typeof regulationAnalysisResults.$inferSelect;
export type InsertRegulationAnalysisResult = z.infer<typeof insertRegulationAnalysisResultSchema>;

export type RevisionHeader = typeof revision_headers.$inferSelect;
export type InsertRevisionHeader = z.infer<typeof insertRevisionHeaderSchema>;

export type RegulationRevision = typeof regulation_revisions.$inferSelect;
export type InsertRegulationRevision = z.infer<typeof insertRegulationRevisionSchema>;

// =====================================================================
// Task-17 新テーブル Insert Schemas
// =====================================================================

export const insertLongTermPlanSchema = createInsertSchema(long_term_plans).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertRepairItemSchema = createInsertSchema(repair_items).omit({
  id: true,
  createdAt: true
});

export const insertRepairHistorySchema = createInsertSchema(repair_history).omit({
  id: true,
  createdAt: true
});

export const insertConsultationLogSchema = createInsertSchema(consultation_logs).omit({
  id: true,
  createdAt: true
});

export const insertMeetingRecordingSchema = createInsertSchema(meeting_recordings).omit({
  id: true,
  createdAt: true
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertActionItemSchema = createInsertSchema(action_items).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertEvaluationCheckSchema = createInsertSchema(evaluation_checks).omit({
  id: true,
  createdAt: true
});

export const insertEvaluationItemMasterSchema = createInsertSchema(evaluation_items_master).omit({
  id: true,
  createdAt: true
});

// Task-17 Types
export type LongTermPlan = typeof long_term_plans.$inferSelect;
export type InsertLongTermPlan = z.infer<typeof insertLongTermPlanSchema>;

export type RepairItem = typeof repair_items.$inferSelect;
export type InsertRepairItem = z.infer<typeof insertRepairItemSchema>;

export type RepairHistory = typeof repair_history.$inferSelect;
export type InsertRepairHistory = z.infer<typeof insertRepairHistorySchema>;

export type ConsultationLog = typeof consultation_logs.$inferSelect;
export type InsertConsultationLog = z.infer<typeof insertConsultationLogSchema>;

export type MeetingRecording = typeof meeting_recordings.$inferSelect;
export type InsertMeetingRecording = z.infer<typeof insertMeetingRecordingSchema>;

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;

export type ActionItem = typeof action_items.$inferSelect;
export type InsertActionItem = z.infer<typeof insertActionItemSchema>;

export type EvaluationCheck = typeof evaluation_checks.$inferSelect;
export type InsertEvaluationCheck = z.infer<typeof insertEvaluationCheckSchema>;

export type EvaluationItemMaster = typeof evaluation_items_master.$inferSelect;
export type InsertEvaluationItemMaster = z.infer<typeof insertEvaluationItemMasterSchema>;
