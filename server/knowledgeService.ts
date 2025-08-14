import { db } from "./db";
import { knowledgeDocuments, knowledgeChunks, aiSearchHistory } from "@shared/schema";
import type { InsertKnowledgeDocument, InsertKnowledgeChunk, KnowledgeDocument, KnowledgeChunk } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export class KnowledgeService {
  // Upload and process a knowledge document
  async uploadKnowledgeDocument(data: InsertKnowledgeDocument): Promise<KnowledgeDocument> {
    const [document] = await db
      .insert(knowledgeDocuments)
      .values(data)
      .returning();
    
    // Process the document into chunks
    await this.processDocumentIntoChunks(document);
    
    return document;
  }

  // Process document content into smaller chunks for RAG
  private async processDocumentIntoChunks(document: KnowledgeDocument): Promise<void> {
    const chunkSize = 1000; // Characters per chunk
    const overlap = 200; // Overlap between chunks
    
    const content = document.content;
    const chunks: InsertKnowledgeChunk[] = [];
    
    for (let i = 0; i < content.length; i += chunkSize - overlap) {
      const chunkContent = content.slice(i, i + chunkSize);
      
      chunks.push({
        documentId: document.id,
        chunkIndex: Math.floor(i / (chunkSize - overlap)),
        content: chunkContent,
        embedding: null, // Will be populated by AI service
        metadata: {
          startChar: i,
          endChar: i + chunkContent.length,
          type: document.type
        }
      });
    }

    if (chunks.length > 0) {
      await db.insert(knowledgeChunks).values(chunks);
    }
  }

  // Get all knowledge documents for a condominium
  async getKnowledgeDocuments(condominiumId: string): Promise<KnowledgeDocument[]> {
    return await db
      .select()
      .from(knowledgeDocuments)
      .where(eq(knowledgeDocuments.condominiumId, condominiumId))
      .orderBy(desc(knowledgeDocuments.uploadedAt));
  }

  // Get knowledge documents by type
  async getKnowledgeDocumentsByType(condominiumId: string, type: string): Promise<KnowledgeDocument[]> {
    return await db
      .select()
      .from(knowledgeDocuments)
      .where(
        and(
          eq(knowledgeDocuments.condominiumId, condominiumId),
          eq(knowledgeDocuments.type, type)
        )
      )
      .orderBy(desc(knowledgeDocuments.uploadedAt));
  }

  // Get chunks for a document
  async getDocumentChunks(documentId: string): Promise<KnowledgeChunk[]> {
    return await db
      .select()
      .from(knowledgeChunks)
      .where(eq(knowledgeChunks.documentId, documentId))
      .orderBy(knowledgeChunks.chunkIndex);
  }

  // Search knowledge base (simple text search for now)
  async searchKnowledge(condominiumId: string, query: string, type?: string): Promise<{
    chunks: KnowledgeChunk[],
    documents: KnowledgeDocument[]
  }> {
    let whereCondition = eq(knowledgeDocuments.condominiumId, condominiumId);
    
    if (type) {
      whereCondition = and(whereCondition, eq(knowledgeDocuments.type, type));
    }

    // Get relevant documents
    const documents = await db
      .select()
      .from(knowledgeDocuments)
      .where(
        and(
          whereCondition,
          sql`${knowledgeDocuments.content} ILIKE ${'%' + query + '%'}`
        )
      )
      .limit(10);

    // Get relevant chunks
    const chunks = await db
      .select({
        id: knowledgeChunks.id,
        documentId: knowledgeChunks.documentId,
        chunkIndex: knowledgeChunks.chunkIndex,
        content: knowledgeChunks.content,
        embedding: knowledgeChunks.embedding,
        metadata: knowledgeChunks.metadata,
        createdAt: knowledgeChunks.createdAt,
      })
      .from(knowledgeChunks)
      .innerJoin(knowledgeDocuments, eq(knowledgeChunks.documentId, knowledgeDocuments.id))
      .where(
        and(
          whereCondition,
          sql`${knowledgeChunks.content} ILIKE ${'%' + query + '%'}`
        )
      )
      .limit(20);

    return { chunks, documents };
  }

  // Update document content
  async updateKnowledgeDocument(documentId: string, content: string, metadata?: any): Promise<KnowledgeDocument> {
    const [document] = await db
      .update(knowledgeDocuments)
      .set({
        content,
        metadata,
        updatedAt: new Date()
      })
      .where(eq(knowledgeDocuments.id, documentId))
      .returning();

    // Reprocess chunks
    await db.delete(knowledgeChunks).where(eq(knowledgeChunks.documentId, documentId));
    await this.processDocumentIntoChunks(document);

    return document;
  }

  // Delete knowledge document
  async deleteKnowledgeDocument(documentId: string): Promise<void> {
    await db.delete(knowledgeChunks).where(eq(knowledgeChunks.documentId, documentId));
    await db.delete(knowledgeDocuments).where(eq(knowledgeDocuments.id, documentId));
  }

  // Save search history
  async saveSearchHistory(condominiumId: string, query: string, results: any, context: string, userId?: string): Promise<void> {
    await db.insert(aiSearchHistory).values({
      condominiumId,
      query,
      results,
      context,
      userId
    });
  }

  // Get search history
  async getSearchHistory(condominiumId: string, limit: number = 10): Promise<any[]> {
    return await db
      .select()
      .from(aiSearchHistory)
      .where(eq(aiSearchHistory.condominiumId, condominiumId))
      .orderBy(desc(aiSearchHistory.createdAt))
      .limit(limit);
  }
}

export const knowledgeService = new KnowledgeService();