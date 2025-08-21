import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").defaultNow()
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
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  processedAt: timestamp("processed_at")
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

// Revision Groups Table - 複数の改訂項目をまとめて管理
export const revisionGroups = pgTable("revision_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(), // 令和7年度改訂対応
  version: text("version").notNull(), // r7, r6, etc.
  description: text("description"),
  totalItems: integer("total_items").default(0),
  completedItems: integer("completed_items").default(0),
  status: text("status").notNull().default("draft"), // draft, in_progress, completed, approved
  effectiveDate: timestamp("effective_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Regulation Revisions Table - 個別の改訂項目 (既存テーブル構造を維持)
export const regulationRevisions = pgTable("regulation_revisions", {
  id: serial("id").primaryKey(), // serialの型を正確に維持
  groupId: varchar("group_id", { length: 100 }).references(() => revisionGroups.id), // 新しく追加するカラム
  category: varchar("category", { length: 100 }).notNull(), // 既存の長さ制限を維持
  title: varchar("title", { length: 200 }).notNull(), // 既存の長さ制限を維持
  changeDescription: text("change_description").notNull(),
  beforeText: text("before_text"),
  afterText: text("after_text"),
  articleNumber: varchar("article_number", { length: 50 }), // 既存の長さ制限を維持
  referenceSection: varchar("reference_section", { length: 100 }), // 既存の長さ制限を維持
  changeType: varchar("change_type", { length: 50 }).notNull(), // 既存の長さ制限を維持
  creationDate: timestamp("creation_date") // 既存カラム名を維持
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertRevisionGroupSchema = createInsertSchema(revisionGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertRegulationRevisionSchema = createInsertSchema(regulationRevisions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Types
export type RevisionGroup = typeof revisionGroups.$inferSelect;
export type RegulationRevision = typeof regulationRevisions.$inferSelect;
export type InsertRevisionGroup = z.infer<typeof insertRevisionGroupSchema>;
export type InsertRegulationRevision = z.infer<typeof insertRegulationRevisionSchema>;

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
