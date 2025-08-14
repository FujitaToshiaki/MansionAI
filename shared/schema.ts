import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
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
