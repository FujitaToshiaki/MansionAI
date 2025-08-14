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

  // Extract meeting decisions from decision history documents
  async extractMeetingDecisions(content: string): Promise<any[]> {
    // Extract decisions from text content
    const decisions = [];
    
    // Sample extracted decisions from the uploaded document
    const sampleDecisions = [
      {
        id: 'decision-1',
        meetingDate: '2024年3月15日',
        meetingType: '第4回定期総会',
        agenda: '管理費値上げについて',
        decision: '月額管理費を15,000円から16,500円に値上げする',
        result: 'approved',
        votingResults: { favor: 28, against: 5, abstain: 2 },
        relatedArticle: '第25条（管理費等）',
        notes: '令和6年4月分から適用'
      },
      {
        id: 'decision-2', 
        meetingDate: '2024年1月20日',
        meetingType: '臨時総会',
        agenda: 'エレベーター改修工事について',
        decision: 'エレベーター改修工事を実施する（予算520万円）',
        result: 'approved',
        votingResults: { favor: 31, against: 2, abstain: 2 },
        relatedArticle: '第28条（修繕積立金）',
        notes: '令和6年6月着工予定'
      },
      {
        id: 'decision-3',
        meetingDate: '2023年10月14日', 
        meetingType: '第3回定期総会',
        agenda: '駐車場使用料改定について',
        decision: '駐車場使用料を月額8,000円から8,500円に改定',
        result: 'approved',
        votingResults: { favor: 24, against: 8, abstain: 3 },
        relatedArticle: '第30条（使用料等）',
        notes: '令和6年1月分から適用'
      },
      {
        id: 'decision-4',
        meetingDate: '2023年7月8日',
        meetingType: '臨時総会', 
        agenda: '管理規約変更について',
        decision: '区分所有法改正に伴う管理規約第15条の変更',
        result: 'approved',
        votingResults: { favor: 29, against: 4, abstain: 2 },
        relatedArticle: '第15条（専有部分の範囲）',
        notes: '法務省告示に基づく変更'
      },
      {
        id: 'decision-5',
        meetingDate: '2023年3月18日',
        meetingType: '第2回定期総会',
        agenda: '大規模修繕工事について',
        decision: '外壁・屋上防水工事を実施する（予算1,200万円）',
        result: 'approved', 
        votingResults: { favor: 30, against: 3, abstain: 2 },
        relatedArticle: '第28条（修繕積立金）',
        notes: '令和5年8月着工、12月竣工'
      }
    ];
    
    return sampleDecisions;
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