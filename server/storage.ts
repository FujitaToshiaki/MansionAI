import { 
  type User, 
  type InsertUser,
  type Condominium,
  type InsertCondominium,
  type Document,
  type InsertDocument,
  type Decision,
  type InsertDecision,
  type Regulation,
  type InsertRegulation,
  type Activity,
  type InsertActivity
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Condominium methods
  getAllCondominiums(): Promise<Condominium[]>;
  getCondominiumById(id: string): Promise<Condominium | undefined>;
  createCondominium(condominium: InsertCondominium): Promise<Condominium>;
  updateCondominium(id: string, updates: Partial<Condominium>): Promise<Condominium>;
  
  // Document methods
  getDocumentsByCondominiumId(condominiumId: string): Promise<Document[]>;
  getDocumentById(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocumentOCRStatus(id: string, status: string, ocrData?: { ocrText?: string; ocrAccuracy?: number }): Promise<void>;
  
  // Decision methods
  getDecisionsByCondominiumId(condominiumId: string): Promise<Decision[]>;
  createDecision(decision: InsertDecision): Promise<Decision>;
  
  // Regulation methods
  getRegulationsByCondominiumId(condominiumId: string): Promise<Regulation[]>;
  createRegulation(regulation: InsertRegulation): Promise<Regulation>;
  
  // Activity methods
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Dashboard methods
  getDashboardStats(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private condominiums: Map<string, Condominium>;
  private documents: Map<string, Document>;
  private decisions: Map<string, Decision>;
  private regulations: Map<string, Regulation>;
  private activities: Map<string, Activity>;

  constructor() {
    this.users = new Map();
    this.condominiums = new Map();
    this.documents = new Map();
    this.decisions = new Map();
    this.regulations = new Map();
    this.activities = new Map();
    
    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create mock condominiums
    const mockCondominiums: Condominium[] = [
      {
        id: randomUUID(),
        name: "メゾンドオプテージ",
        address: "東京都○○区××1-2-3",
        units: 120,
        buildYear: 1999,
        managementStartDate: new Date("2020-04-01"),
        currentRegulationVersion: "5.0",
        lawRevisionStatus: "completed",
        lastActivity: new Date(),
        assignedManager: "田中太郎",
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        name: "グランマンションB",
        address: "神奈川県××市△△2-3-4",
        units: 85,
        buildYear: 2006,
        managementStartDate: new Date("2018-01-01"),
        currentRegulationVersion: "3.2",
        lawRevisionStatus: "in_progress",
        lastActivity: new Date(),
        assignedManager: "佐藤花子",
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        name: "サンライズC",
        address: "千葉県△△町▽▽3-4-5",
        units: 200,
        buildYear: 1992,
        managementStartDate: new Date("2015-03-01"),
        currentRegulationVersion: "2.1",
        lawRevisionStatus: "pending",
        lastActivity: new Date(Date.now() - 86400000),
        assignedManager: "山田次郎",
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        name: "レジデンスD",
        address: "埼玉県▽▽区◆◆4-5-6",
        units: 95,
        buildYear: 2012,
        managementStartDate: new Date("2022-06-01"),
        currentRegulationVersion: "1.0",
        lawRevisionStatus: "not_required",
        lastActivity: new Date(Date.now() - 172800000),
        assignedManager: "鈴木三郎",
        createdAt: new Date()
      }
    ];

    mockCondominiums.forEach(condo => {
      this.condominiums.set(condo.id, condo);
    });

    // Create mock activities for the first condominium
    const firstCondoId = Array.from(this.condominiums.values())[0].id;
    const mockActivities: Activity[] = [
      {
        id: randomUUID(),
        condominiumId: firstCondoId,
        type: "regulation_revision",
        description: "メゾンドオプテージの規約改訂が完了しました",
        status: "success",
        userId: "mock-user",
        metadata: {},
        createdAt: new Date(Date.now() - 7200000) // 2 hours ago
      },
      {
        id: randomUUID(),
        condominiumId: mockCondominiums[1].id,
        type: "ocr_processing",
        description: "グランマンションBの議事録をOCR処理しました",
        status: "success",
        userId: "mock-user",
        metadata: {},
        createdAt: new Date(Date.now() - 14400000) // 4 hours ago
      },
      {
        id: randomUUID(),
        condominiumId: mockCondominiums[2].id,
        type: "ai_analysis",
        description: "サンライズCのAI分析を開始しました",
        status: "in_progress",
        userId: "mock-user",
        metadata: {},
        createdAt: new Date(Date.now() - 21600000) // 6 hours ago
      }
    ];

    mockActivities.forEach(activity => {
      this.activities.set(activity.id, activity);
    });

    // Create mock documents
    const mockDocuments: Document[] = [
      {
        id: randomUUID(),
        condominiumId: firstCondoId,
        title: "理事会議事録_2024_03",
        type: "minutes",
        filePath: "/uploads/minutes_2024_03.pdf",
        originalFileName: "理事会議事録_2024_03.pdf",
        fileSize: 2048000,
        mimeType: "application/pdf",
        ocrStatus: "completed",
        ocrAccuracy: 94,
        ocrText: "第25回定期理事会議事録\n開催日時：令和6年3月15日(金) 午後7時00分～午後8時30分\n開催場所：集会室\n出席者：理事長 田中一郎、副理事長 佐藤花子\n\n【議題】\n1. 管理規約改正について\n【決議内容】\n賛成5票、反対0票、棄権1票で可決",
        uploadedAt: new Date(Date.now() - 86400000),
        processedAt: new Date(Date.now() - 82800000)
      },
      {
        id: randomUUID(),
        condominiumId: firstCondoId,
        title: "総会議事録_2024",
        type: "minutes",
        filePath: "/uploads/general_meeting_2024.pdf",
        originalFileName: "総会議事録_2024.pdf",
        fileSize: 1800000,
        mimeType: "application/pdf",
        ocrStatus: "completed",
        ocrAccuracy: 97,
        ocrText: "第20回定期総会議事録...",
        uploadedAt: new Date(Date.now() - 172800000),
        processedAt: new Date(Date.now() - 169200000)
      }
    ];

    mockDocuments.forEach(doc => {
      this.documents.set(doc.id, doc);
    });

    // Create mock decisions
    const mockDecisions: Decision[] = [
      {
        id: randomUUID(),
        condominiumId: firstCondoId,
        documentId: mockDocuments[0].id,
        title: "管理規約改正（ペット飼育規定）",
        description: "専有部分におけるペット飼育に関する規定の改正",
        result: "approved",
        votingResults: { favor: 5, against: 0, abstain: 1 },
        relatedRegulationArticle: "第3条",
        category: "regulation_management",
        meetingDate: new Date("2024-03-15"),
        isAutoExtracted: true,
        confidence: 95,
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        condominiumId: firstCondoId,
        documentId: mockDocuments[0].id,
        title: "修繕積立金値上げ",
        description: "月額修繕積立金の値上げについて",
        result: "approved",
        votingResults: { favor: 4, against: 1, abstain: 1 },
        relatedRegulationArticle: "第25条",
        category: "financial",
        meetingDate: new Date("2024-03-15"),
        isAutoExtracted: true,
        confidence: 88,
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        condominiumId: firstCondoId,
        documentId: mockDocuments[0].id,
        title: "防犯カメラ設置",
        description: "共用部分への防犯カメラ設置について",
        result: "rejected",
        votingResults: { favor: 2, against: 3, abstain: 1 },
        relatedRegulationArticle: "第12条",
        category: "facilities",
        meetingDate: new Date("2024-03-15"),
        isAutoExtracted: true,
        confidence: 82,
        createdAt: new Date()
      }
    ];

    mockDecisions.forEach(decision => {
      this.decisions.set(decision.id, decision);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Condominium methods
  async getAllCondominiums(): Promise<Condominium[]> {
    return Array.from(this.condominiums.values());
  }

  async getCondominiumById(id: string): Promise<Condominium | undefined> {
    return this.condominiums.get(id);
  }

  async createCondominium(insertCondominium: InsertCondominium): Promise<Condominium> {
    const id = randomUUID();
    const condominium: Condominium = { 
      ...insertCondominium, 
      id, 
      createdAt: new Date(),
      lastActivity: new Date()
    };
    this.condominiums.set(id, condominium);
    return condominium;
  }

  async updateCondominium(id: string, updates: Partial<Condominium>): Promise<Condominium> {
    const existing = this.condominiums.get(id);
    if (!existing) {
      throw new Error("Condominium not found");
    }
    const updated = { ...existing, ...updates };
    this.condominiums.set(id, updated);
    return updated;
  }

  // Document methods
  async getDocumentsByCondominiumId(condominiumId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      doc => doc.condominiumId === condominiumId
    );
  }

  async getDocumentById(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = { 
      ...insertDocument, 
      id, 
      uploadedAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocumentOCRStatus(
    id: string, 
    status: string, 
    ocrData?: { ocrText?: string; ocrAccuracy?: number }
  ): Promise<void> {
    const document = this.documents.get(id);
    if (!document) {
      throw new Error("Document not found");
    }
    
    const updated = {
      ...document,
      ocrStatus: status,
      ...(ocrData && ocrData.ocrText && { ocrText: ocrData.ocrText }),
      ...(ocrData && ocrData.ocrAccuracy && { ocrAccuracy: ocrData.ocrAccuracy }),
      ...(status === 'completed' && { processedAt: new Date() })
    };
    
    this.documents.set(id, updated);
  }

  // Decision methods
  async getDecisionsByCondominiumId(condominiumId: string): Promise<Decision[]> {
    return Array.from(this.decisions.values()).filter(
      decision => decision.condominiumId === condominiumId
    );
  }

  async createDecision(insertDecision: InsertDecision): Promise<Decision> {
    const id = randomUUID();
    const decision: Decision = { ...insertDecision, id, createdAt: new Date() };
    this.decisions.set(id, decision);
    return decision;
  }

  // Regulation methods
  async getRegulationsByCondominiumId(condominiumId: string): Promise<Regulation[]> {
    return Array.from(this.regulations.values()).filter(
      regulation => regulation.condominiumId === condominiumId
    );
  }

  async createRegulation(insertRegulation: InsertRegulation): Promise<Regulation> {
    const id = randomUUID();
    const regulation: Regulation = { ...insertRegulation, id, createdAt: new Date() };
    this.regulations.set(id, regulation);
    return regulation;
  }

  // Activity methods
  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    // Add time ago calculation
    return activities.map(activity => ({
      ...activity,
      timeAgo: this.getTimeAgo(activity.createdAt)
    }));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = { ...insertActivity, id, createdAt: new Date() };
    this.activities.set(id, activity);
    return activity;
  }

  // Dashboard methods
  async getDashboardStats(): Promise<any> {
    const condos = Array.from(this.condominiums.values());
    const totalCondominiums = condos.length;
    const completed = condos.filter(c => c.lawRevisionStatus === 'completed').length;
    const inProgress = condos.filter(c => c.lawRevisionStatus === 'in_progress').length;
    const pending = condos.filter(c => c.lawRevisionStatus === 'pending').length;
    const totalUnits = condos.reduce((sum, c) => sum + c.units, 0);

    return {
      totalCondominiums,
      completed,
      inProgress,
      pending,
      totalUnits,
      completionRate: totalCondominiums > 0 ? Math.round((completed / totalCondominiums) * 100) : 0,
      progressRate: totalCondominiums > 0 ? Math.round((inProgress / totalCondominiums) * 100) : 0,
      pendingRate: totalCondominiums > 0 ? Math.round((pending / totalCondominiums) * 100) : 0
    };
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}日前`;
    } else if (diffHours > 0) {
      return `${diffHours}時間前`;
    } else {
      return "1時間以内";
    }
  }
}

export const storage = new MemStorage();
