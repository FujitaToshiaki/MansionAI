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

  // Add knowledge document (convenience method)
  async addKnowledgeDocument(
    condominiumId: string, 
    title: string, 
    content: string, 
    type: string, 
    metadata?: any
  ): Promise<KnowledgeDocument> {
    return this.uploadKnowledgeDocument({
      condominiumId,
      title,
      content,
      type,
      metadata
    });
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
    console.log('Starting decision extraction from decision history...');
    if (!content || content.trim() === '') {
      console.log('Empty decision history content');
      return [];
    }

    const decisions = [];
    const lines = content.split('\n');
    let decisionCounter = 1;
    
    console.log(`Processing ${lines.length} lines from decision history`);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines, headers, and separators
      if (!line || line.startsWith('---') || line.startsWith('###') || line.startsWith('####') || 
          line.startsWith('**') || line.includes(':---')) {
        continue;
      }
      
      // Parse table rows with meeting information
      if (line.startsWith('|') && line.includes('|')) {
        const parts = line.split('|').map(p => p.trim()).filter(p => p);
        
        // Skip table headers
        if (parts.some(p => p.includes('開催日') || p.includes('内容') || p.includes('期'))) {
          continue;
        }
        
        if (parts.length >= 3) {
          const meetingInfo = parts[0];
          const agenda = parts[1];
          const relatedArticle = parts[2];
          
          console.log(`Found decision row: ${meetingInfo} | ${agenda}`);
          
          // Extract meeting date and type from patterns like "35期通常総会<br>2019年9月"
          let meetingDate = '';
          let meetingType = '通常総会';
          
          // Look for year and month pattern
          const dateMatch = meetingInfo.match(/(\d{4})年(\d{1,2})月/);
          if (dateMatch) {
            meetingDate = `${dateMatch[1]}年${dateMatch[2]}月`;
          } else {
            // Try to extract from period info like "35期"
            const periodMatch = meetingInfo.match(/(\d+)期/);
            if (periodMatch) {
              meetingDate = `第${periodMatch[1]}期`;
            }
          }
          
          // Determine meeting type
          if (meetingInfo.includes('通常総会')) {
            meetingType = '通常総会';
          } else if (meetingInfo.includes('臨時総会')) {
            meetingType = '臨時総会'; 
          } else if (meetingInfo.includes('理事会')) {
            meetingType = '理事会';
          }
          
          // Categorize decisions based on agenda content
          let category = 'その他';
          if (agenda.includes('管理規約')) category = '管理規約改定';
          else if (agenda.includes('駐車') || agenda.includes('車庫')) category = '駐車場';
          else if (agenda.includes('バイク')) category = 'バイク置場';
          else if (agenda.includes('自転車') || agenda.includes('駐輪')) category = '駐輪場';
          else if (agenda.includes('防犯')) category = '防犯設備';
          else if (agenda.includes('宅配')) category = '設備追加';
          else if (agenda.includes('ペット')) category = 'ペット飼育';
          else if (agenda.includes('賃貸')) category = '賃貸使用';
          else if (agenda.includes('住宅宿泊')) category = '住宅宿泊';
          else if (agenda.includes('総会')) category = '総会運営';
          
          if (agenda && agenda.length > 3 && !agenda.includes('内容')) {
            console.log(`Adding decision: ${meetingDate} - ${category} - ${agenda}`);
            decisions.push({
              id: `decision-${decisionCounter++}`,
              meetingDate: meetingDate,
              meetingType: meetingType,
              category: category,
              agenda: agenda.replace(/<br>/g, ' ').replace(/\n/g, ' '),
              decision: agenda.replace(/<br>/g, ' ').replace(/\n/g, ' ') + 'について承認',
              result: 'approved',
              votingResults: null,
              relatedArticle: relatedArticle && relatedArticle !== '対象条項' ? relatedArticle : '',
              notes: ''
            });
          }
        }
      }
    }
    
    console.log(`Extracted ${decisions.length} decisions from decision history`);
    return decisions;
  }

  // Extract meeting minutes from uploaded meeting minutes documents
  async extractMeetingMinutes(content: string): Promise<any[]> {
    console.log('Starting meeting minutes extraction...');
    if (!content || content.trim() === '') {
      console.log('Empty content provided');
      return [];
    }

    console.log(`Content length: ${content.length} characters`);
    const minutes = [];
    const lines = content.split('\n');
    console.log(`Total lines: ${lines.length}`);
    
    // More flexible pattern matching for Japanese meeting minutes
    const meetingPatterns = [
      /第\d+期.*?総会/,
      /第\d+回.*?理事会/,
      /第\d+期.*?理事会/,
      /総会.*?議事録/,
      /理事会.*?議事録/,
      /議事録/  // Fallback pattern
    ];
    
    let currentMinute: any = null;
    let sectionContent = '';
    let meetingCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      if (!trimmedLine) continue;
      
      // Check if this line contains a meeting header
      const isHeader = meetingPatterns.some(pattern => pattern.test(trimmedLine));
      
      if (isHeader || trimmedLine.includes('議事録')) {
        console.log(`Found potential meeting header: "${trimmedLine}"`);
        
        // Save previous minute if exists
        if (currentMinute) {
          currentMinute.content = sectionContent.trim();
          minutes.push(currentMinute);
          console.log(`Saved meeting: ${currentMinute.title}`);
        }
        
        // Start new minute
        meetingCount++;
        currentMinute = {
          id: `minute-${meetingCount}`,
          title: trimmedLine,
          content: '',
          date: this.extractDateFromContent(trimmedLine, lines.slice(Math.max(0, i-5), i+10)),
          meetingType: this.extractMeetingType(trimmedLine),
          rawContent: trimmedLine
        };
        sectionContent = '';
        
        console.log(`Started new meeting: ${currentMinute.title} (${currentMinute.meetingType})`);
      } else if (currentMinute) {
        sectionContent += line + '\n';
      } else if (trimmedLine.length > 10) {
        // If no header found yet but we have substantial content, create a general minute
        if (!currentMinute) {
          console.log('Creating fallback meeting minute from content');
          currentMinute = {
            id: 'minute-general',
            title: '議事録データ',
            content: '',
            date: this.extractDateFromContent('', lines.slice(0, 20)),
            meetingType: '総会',
            rawContent: '議事録データ'
          };
        }
        sectionContent += line + '\n';
      }
    }
    
    // Add last minute
    if (currentMinute) {
      currentMinute.content = sectionContent.trim();
      minutes.push(currentMinute);
      console.log(`Saved final meeting: ${currentMinute.title}`);
    }
    
    console.log(`Final result: Extracted ${minutes.length} meeting minutes from content`);
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