import { db } from "./db";
import { knowledgeDocuments, knowledgeChunks, aiSearchHistory } from "@shared/schema";
import type { InsertKnowledgeDocument, InsertKnowledgeChunk, KnowledgeDocument, KnowledgeChunk } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

export class KnowledgeService {
  // Upload and process a knowledge document
  async uploadKnowledgeDocument(data: InsertKnowledgeDocument): Promise<KnowledgeDocument> {
    console.log("Creating knowledge document with data:", {
      condominiumId: data.condominiumId,
      title: data.title,
      type: data.type,
      contentLength: data.content.length
    });

    const documentData = {
      ...data,
      id: uuidv4(),
      uploadedAt: new Date(),
      updatedAt: new Date()
    };

    console.log("Inserting document with ID:", documentData.id);

    const [document] = await db
      .insert(knowledgeDocuments)
      .values(documentData)
      .returning();
    
    console.log("Document inserted successfully:", document.id);

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
        id: uuidv4(),
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

  // Get all knowledge documents for a condominium with chunk count
  async getKnowledgeDocuments(condominiumId: string): Promise<any[]> {
    const documents = await db
      .select()
      .from(knowledgeDocuments)
      .where(eq(knowledgeDocuments.condominiumId, condominiumId))
      .orderBy(desc(knowledgeDocuments.uploadedAt));

    // Add chunk count for each document
    const documentsWithChunkCount = await Promise.all(
      documents.map(async (doc) => {
        const chunks = await db
          .select({ count: sql<number>`count(*)` })
          .from(knowledgeChunks)
          .where(eq(knowledgeChunks.documentId, doc.id));
        
        return {
          ...doc,
          chunkCount: chunks[0]?.count || 0
        };
      })
    );

    return documentsWithChunkCount;
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
    console.log("Searching knowledge base:", { condominiumId, query, type });
    
    try {
      let whereCondition = eq(knowledgeDocuments.condominiumId, condominiumId);
      
      if (type) {
        whereCondition = and(whereCondition, eq(knowledgeDocuments.type, type));
      }

      console.log("Getting relevant documents...");
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

      console.log("Found documents:", documents.length);

      console.log("Getting relevant chunks...");
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

      console.log("Found chunks:", chunks.length);
      return { chunks, documents };
    } catch (error) {
      console.error("Error in searchKnowledge:", error);
      throw error;
    }
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
    try {
      await db.insert(aiSearchHistory).values({
        id: uuidv4(),
        condominiumId,
        query,
        results,
        context,
        userId: null, // Set to null for now, will be implemented when user auth is added
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Failed to save search history:", error);
      // Don't throw error to prevent search from failing
    }
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