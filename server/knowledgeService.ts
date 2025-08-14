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
    // Parse actual uploaded decision history content
    if (!content || content.trim() === '') {
      return [];
    }

    const decisions = [];
    
    // Parse the structured data from the uploaded file
    const lines = content.split('\n');
    let currentSection = '';
    let decisionCounter = 1;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('---') || trimmedLine.startsWith('###') || trimmedLine.startsWith('####')) {
        continue;
      }
      
      // Skip table headers
      if (trimmedLine.includes('|') && (trimmedLine.includes('回') || trimmedLine.includes('内容') || trimmedLine.includes(':---'))) {
        continue;
      }
      
      // Parse table rows with meeting information
      if (trimmedLine.includes('|')) {
        const parts = trimmedLine.split('|').map(p => p.trim()).filter(p => p);
        if (parts.length >= 3) {
          const meetingInfo = parts[0];
          const agenda = parts[1];
          const relatedArticle = parts[2];
          
          // Extract date and meeting type
          let meetingDate = '';
          let meetingType = '';
          
          const dateMatch = meetingInfo.match(/(\d{4})年(\d{1,2})月?/);
          if (dateMatch) {
            meetingDate = `${dateMatch[1]}年${dateMatch[2]}月`;
          }
          
          if (meetingInfo.includes('定期総会')) {
            meetingType = '定期総会';
          } else if (meetingInfo.includes('臨時総会')) {
            meetingType = '臨時総会';
          } else if (meetingInfo.includes('理事会')) {
            meetingType = '理事会';
          }
          
          if (meetingDate && agenda && agenda !== '内容' && agenda !== 'ée') {
            decisions.push({
              id: `decision-${decisionCounter++}`,
              meetingDate: meetingDate,
              meetingType: meetingType || '定期総会',
              agenda: agenda.replace(/<br>/g, ' '),
              decision: agenda.replace(/<br>/g, ' ') + 'について承認',
              result: 'approved',
              votingResults: null,
              relatedArticle: relatedArticle && relatedArticle !== '対象条文' ? relatedArticle : '',
              notes: ''
            });
          }
        }
      }
    }
    
    return decisions;
  }

  // Extract meeting minutes from uploaded meeting minutes documents
  async extractMeetingMinutes(content: string): Promise<any[]> {
    if (!content || content.trim() === '') {
      return [];
    }

    const minutes = [];
    const lines = content.split('\n');
    let currentMinute: any = null;
    let sectionContent = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Detect meeting headers containing 第...期...総会 or 第...回...理事会
      if (trimmedLine.includes('第') && 
          ((trimmedLine.includes('期') && trimmedLine.includes('総会')) ||
           (trimmedLine.includes('回') && trimmedLine.includes('理事会')))) {
        
        // Save previous minute if exists
        if (currentMinute) {
          currentMinute.content = sectionContent.trim();
          minutes.push(currentMinute);
        }
        
        // Start new minute
        currentMinute = {
          id: `minute-${minutes.length + 1}`,
          title: trimmedLine,
          content: '',
          date: this.extractDateFromContent(trimmedLine, lines),
          meetingType: this.extractMeetingType(trimmedLine),
          rawContent: trimmedLine
        };
        sectionContent = '';
      } else if (currentMinute) {
        sectionContent += line + '\n';
      }
    }
    
    // Add last minute
    if (currentMinute) {
      currentMinute.content = sectionContent.trim();
      minutes.push(currentMinute);
    }
    
    console.log(`Extracted ${minutes.length} meeting minutes from content`);
    return minutes;
  }

  private extractDateFromContent(title: string, allLines: string[]): string {
    // Try to extract date from surrounding lines or title
    const dateRegex = /(\d{4})年(\d{1,2})月(\d{1,2})日/;
    const match = title.match(dateRegex);
    if (match) {
      return `${match[1]}年${match[2]}月${match[3]}日`;
    }
    
    // Look in surrounding lines for date
    for (const line of allLines.slice(0, 5)) {
      const lineMatch = line.match(dateRegex);
      if (lineMatch) {
        return `${lineMatch[1]}年${lineMatch[2]}月${lineMatch[3]}日`;
      }
    }
    
    return '日付未記載';
  }

  private extractMeetingType(title: string): string {
    if (title.includes('通常総会')) return '通常総会';
    if (title.includes('臨時総会')) return '臨時総会';
    if (title.includes('理事会')) return '理事会';
    if (title.includes('総会')) return '総会';
    return 'その他会議';
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
        whereCondition = and(whereCondition, eq(knowledgeDocuments.type, type)) as any;
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