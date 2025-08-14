import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { knowledgeService } from "./knowledgeService";
import { z } from "zod";
import { insertKnowledgeDocumentSchema } from "@shared/schema";
import multer from "multer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Dashboard activities endpoint
  app.get("/api/dashboard/activities", async (req, res) => {
    try {
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Condominiums endpoints
  app.get("/api/condominiums", async (req, res) => {
    try {
      const condominiums = await storage.getAllCondominiums();
      res.json(condominiums);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch condominiums" });
    }
  });

  app.get("/api/condominiums/:id", async (req, res) => {
    try {
      const condominium = await storage.getCondominiumById(req.params.id);
      if (!condominium) {
        return res.status(404).json({ error: "Condominium not found" });
      }
      res.json(condominium);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch condominium" });
    }
  });

  // Documents endpoints
  app.get("/api/condominiums/:id/documents", async (req, res) => {
    try {
      const documents = await storage.getDocumentsByCondominiumId(req.params.id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/condominiums/:id/upload", async (req, res) => {
    try {
      // In a real implementation, this would handle file upload
      const mockDocument = await storage.createDocument({
        condominiumId: req.params.id,
        title: "議事録_" + new Date().toISOString().split('T')[0],
        type: "minutes",
        filePath: "/uploads/mock-file.pdf",
        originalFileName: "minutes.pdf",
        fileSize: 2048000,
        mimeType: "application/pdf",
        ocrStatus: "pending"
      });
      
      // Create activity record
      await storage.createActivity({
        condominiumId: req.params.id,
        type: "document_upload",
        description: "議事録をアップロードしました",
        status: "success",
        userId: "mock-user-id",
        metadata: { documentId: mockDocument.id }
      });

      res.json(mockDocument);
    } catch (error) {
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  app.post("/api/condominiums/:id/start-ocr", async (req, res) => {
    try {
      // Mock OCR processing
      const documents = await storage.getDocumentsByCondominiumId(req.params.id);
      const pendingDocs = documents.filter(doc => doc.ocrStatus === 'pending');
      
      for (const doc of pendingDocs) {
        await storage.updateDocumentOCRStatus(doc.id, 'processing');
        // Simulate OCR completion after a delay
        setTimeout(async () => {
          await storage.updateDocumentOCRStatus(doc.id, 'completed', {
            ocrText: "模擬OCRテキスト：第25回定期理事会議事録...",
            ocrAccuracy: Math.floor(Math.random() * 20) + 80 // 80-100%
          });
        }, 3000);
      }

      await storage.createActivity({
        condominiumId: req.params.id,
        type: "ocr_processing",
        description: `${pendingDocs.length}件のファイルのOCR処理を開始しました`,
        status: "in_progress",
        userId: "mock-user-id",
        metadata: { documentCount: pendingDocs.length }
      });

      res.json({ message: "OCR processing started", count: pendingDocs.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to start OCR processing" });
    }
  });

  // Decisions endpoints
  app.get("/api/condominiums/:id/decisions", async (req, res) => {
    try {
      const decisions = await storage.getDecisionsByCondominiumId(req.params.id);
      res.json(decisions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch decisions" });
    }
  });

  app.post("/api/condominiums/:id/confirm-decisions", async (req, res) => {
    try {
      const { decisions } = req.body;
      // Mock decision confirmation processing
      await storage.createActivity({
        condominiumId: req.params.id,
        type: "decision_extraction",
        description: `${decisions.length}件の決議事項を確定しました`,
        status: "success",
        userId: "mock-user-id",
        metadata: { decisionCount: decisions.length }
      });

      res.json({ message: "Decisions confirmed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to confirm decisions" });
    }
  });

  // AI Analysis endpoints
  app.get("/api/condominiums/:id/regulation-analysis", async (req, res) => {
    try {
      // Mock analysis results
      const analysisResults = {
        totalIssues: 4,
        issues: [
          {
            article: "第3条",
            title: "動物飼育規定",
            reason: "決議内容との不整合",
            priority: "high",
            relatedDecision: { date: "2024/3/15", type: "理事会" },
            lawRevision: { required: false },
            impact: "medium"
          },
          {
            article: "第15条",
            title: "決議要件",
            reason: "5分の4→4分の3変更",
            priority: "high",
            relatedDecision: null,
            lawRevision: { required: true },
            impact: "high"
          },
          {
            article: "第25条",
            title: "修繕積立金",
            reason: "値上げ反映",
            priority: "medium",
            relatedDecision: { date: "2024/3/15", type: "理事会" },
            lawRevision: { required: false },
            impact: "low"
          },
          {
            article: "第30条",
            title: "理事会開催",
            reason: "オンライン対応",
            priority: "low",
            relatedDecision: null,
            lawRevision: { required: false },
            impact: "low"
          }
        ]
      };
      res.json(analysisResults);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analysis results" });
    }
  });

  app.get("/api/condominiums/:id/extraction-results", async (req, res) => {
    try {
      const results = { totalDecisions: 3 };
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch extraction results" });
    }
  });

  // AI Revision endpoints
  app.get("/api/condominiums/:id/ai-revision-options", async (req, res) => {
    try {
      // Mock revision options would be returned here
      const options = [];
      res.json(options);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revision options" });
    }
  });

  app.get("/api/condominiums/:id/ai-generation-status", async (req, res) => {
    try {
      const status = {
        isProcessing: false,
        currentTask: null,
        progress: 100
      };
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch generation status" });
    }
  });

  app.post("/api/condominiums/:id/generate-ai-revision", async (req, res) => {
    try {
      const { article } = req.body;
      
      await storage.createActivity({
        condominiumId: req.params.id,
        type: "ai_analysis",
        description: `${article}のAI改訂案生成を開始しました`,
        status: "in_progress",
        userId: "mock-user-id",
        metadata: { article }
      });

      res.json({ message: "AI revision generation started" });
    } catch (error) {
      res.status(500).json({ error: "Failed to start AI revision generation" });
    }
  });

  app.post("/api/condominiums/:id/confirm-revision", async (req, res) => {
    try {
      const { selectedOption, customEdit, article } = req.body;
      
      await storage.createActivity({
        condominiumId: req.params.id,
        type: "regulation_revision",
        description: `${article}の改訂案を確定しました`,
        status: "success",
        userId: "mock-user-id",
        metadata: { selectedOption, article }
      });

      res.json({ message: "Revision confirmed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to confirm revision" });
    }
  });

  // Regulations endpoints
  app.get("/api/condominiums/:id/regulations", async (req, res) => {
    try {
      const regulations = await storage.getRegulationsByCondominiumId(req.params.id);
      res.json(regulations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch regulations" });
    }
  });

  app.get("/api/standard-regulations", async (req, res) => {
    try {
      // Mock standard regulations
      const standardRegs = [];
      res.json(standardRegs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch standard regulations" });
    }
  });

  // Document specific endpoints
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocumentById(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.get("/api/documents/:id/ocr", async (req, res) => {
    try {
      const document = await storage.getDocumentById(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      // Return OCR specific data
      res.json({
        ocrText: document.ocrText,
        ocrAccuracy: document.ocrAccuracy,
        ocrStatus: document.ocrStatus
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch OCR data" });
    }
  });

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });

  // Knowledge Base APIs
  app.get("/api/condominiums/:id/knowledge", async (req, res) => {
    try {
      const documents = await knowledgeService.getKnowledgeDocuments(req.params.id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch knowledge documents" });
    }
  });

  app.get("/api/condominiums/:id/knowledge/:type", async (req, res) => {
    try {
      const documents = await knowledgeService.getKnowledgeDocumentsByType(req.params.id, req.params.type);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch knowledge documents by type" });
    }
  });

  app.post("/api/condominiums/:id/knowledge/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { type, title } = req.body;
      if (!type || !title) {
        return res.status(400).json({ error: "Type and title are required" });
      }

      // Convert buffer to text (assuming text files for now)
      let content: string;
      try {
        content = req.file.buffer.toString('utf-8');
      } catch (error) {
        // Try other encodings if UTF-8 fails
        try {
          content = req.file.buffer.toString('shift_jis');
        } catch (error) {
          return res.status(400).json({ error: "Unable to decode file. Please ensure it's a text file." });
        }
      }

      const document = await knowledgeService.uploadKnowledgeDocument({
        condominiumId: req.params.id,
        title,
        type,
        content,
        originalFileName: req.file.originalname,
        metadata: {
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          uploadDate: new Date().toISOString()
        }
      });

      // Create activity record
      await storage.createActivity({
        condominiumId: req.params.id,
        type: "document_upload",
        description: `ナレッジドキュメント「${title}」をアップロードしました`,
        status: "success",
        userId: "mock-user-id",
        metadata: { documentId: document.id, type }
      });

      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to upload knowledge document" });
    }
  });

  app.post("/api/condominiums/:id/knowledge/search", async (req, res) => {
    try {
      const { query, type } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const results = await knowledgeService.searchKnowledge(req.params.id, query, type);
      
      // Save search history
      await knowledgeService.saveSearchHistory(req.params.id, query, results, "AI search context", "mock-user-id");

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to search knowledge base" });
    }
  });

  app.get("/api/condominiums/:id/knowledge/search-history", async (req, res) => {
    try {
      const history = await knowledgeService.getSearchHistory(req.params.id, 20);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch search history" });
    }
  });

  app.delete("/api/knowledge/:documentId", async (req, res) => {
    try {
      await knowledgeService.deleteKnowledgeDocument(req.params.documentId);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
