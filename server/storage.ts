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
  
  // Database query method
  query(sql: string, params?: any[]): Promise<any>;
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
        id: "a7af9126-67ff-47d9-9c24-cf4054aeb63c",
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
      // 図面・建築関連資料
      {
        id: randomUUID(),
        condominiumId: firstCondoId,
        title: "建築確認申請書",
        type: "other",
        filePath: "/uploads/building_permit_application.pdf",
        originalFileName: "building_permit_application.pdf",
        fileSize: 3200000,
        mimeType: "application/pdf",
        ocrStatus: "completed",
        ocrAccuracy: 94.5,
        ocrText: "建築確認申請書　申請番号：第H11-0234号　建築主：株式会社メゾンデベロッパー　所在地：東京都○○区××1-2-3　建築物の概要：共同住宅（分譲マンション）　構造：鉄筋コンクリート造　階数：地上12階　延べ面積：8,500.25㎡　建築面積：720.50㎡　最高高さ：36.8m　住戸数：120戸",
        uploadedAt: new Date(Date.now() - 259200000),
        processedAt: new Date(Date.now() - 255600000)
      },
      {
        id: randomUUID(),
        condominiumId: firstCondoId,
        title: "各階平面図（1F-12F）",
        type: "other",
        filePath: "/uploads/floor_plans_detailed.pdf",
        originalFileName: "floor_plans_detailed.pdf",
        fileSize: 5800000,
        mimeType: "application/pdf",
        ocrStatus: "completed",
        ocrAccuracy: 89.2,
        ocrText: "各階平面図　1階：エントランスホール、管理人室、集会室、駐車場入口、住戸8戸　2階-11階：各階10戸（3LDK×6戸、2LDK×4戸）　12階：ペントハウス2戸　共用部：エレベーター2基、階段2箇所、ゴミ置場（各階）、宅配ボックス（1階）　住戸面積：3LDK=85.2㎡、2LDK=65.8㎡、ペントハウス=120.5㎡",
        uploadedAt: new Date(Date.now() - 345600000),
        processedAt: new Date(Date.now() - 342000000)
      },
      {
        id: randomUUID(),
        condominiumId: firstCondoId,
        title: "構造図・基礎配筋図",
        type: "other",
        filePath: "/uploads/structural_drawings.pdf",
        originalFileName: "structural_drawings.pdf",
        fileSize: 4600000,
        mimeType: "application/pdf",
        ocrStatus: "completed",
        ocrAccuracy: 91.8,
        ocrText: "構造図・基礎配筋図　構造種別：鉄筋コンクリート造（RC造）　基礎：杭基礎（既製コンクリート杭φ600×32本）　支持層：洪積砂質土層（N値≧50）　杭先端深度：GL-28.5m　構造耐力：新耐震基準適合　設計基準強度：Fc=27N/mm²　主筋：D19以上　帯筋：D10@200以下",
        uploadedAt: new Date(Date.now() - 432000000),
        processedAt: new Date(Date.now() - 428400000)
      },
      {
        id: randomUUID(),
        condominiumId: firstCondoId,
        title: "給排水衛生設備図",
        type: "other",
        filePath: "/uploads/plumbing_systems.pdf",
        originalFileName: "plumbing_systems.pdf",
        fileSize: 3400000,
        mimeType: "application/pdf",
        ocrStatus: "completed",
        ocrAccuracy: 93.7,
        ocrText: "給排水衛生設備図　給水方式：受水槽+高架水槽方式　受水槽容量：40㎥（FRP製）　高架水槽容量：20㎥（SUS製）　給水ポンプ：2台（交互運転）　排水方式：汚水・雑排水合流式　雨水排水：独立配管　浄化槽：不要（下水道直結）　各戸メーター：13mm　共用部散水栓：各階1箇所",
        uploadedAt: new Date(Date.now() - 518400000),
        processedAt: new Date(Date.now() - 514800000)
      },
      // マンション管理関連資料
      {
        id: randomUUID(),
        condominiumId: firstCondoId,
        title: "管理組合設立届出書",
        type: "other",
        filePath: "/uploads/management_association_registration.pdf",
        originalFileName: "management_association_registration.pdf",
        fileSize: 1200000,
        mimeType: "application/pdf",
        ocrStatus: "completed",
        ocrAccuracy: 96.8,
        ocrText: "管理組合設立届出書　管理組合名：メゾンドオプテージ管理組合　設立年月日：2000年4月1日　組合員数：120名　理事長：田中太郎　副理事長：佐藤花子　理事：5名　監事：2名　管理会社：東京マンション管理株式会社　管理形態：全部委託　所轄官庁：○○区役所",
        uploadedAt: new Date(Date.now() - 604800000),
        processedAt: new Date(Date.now() - 601200000)
      },
      {
        id: randomUUID(),
        condominiumId: firstCondoId,
        title: "建物状況調査報告書",
        type: "other",
        filePath: "/uploads/building_condition_survey.pdf",
        originalFileName: "building_condition_survey.pdf",
        fileSize: 2800000,
        mimeType: "application/pdf",
        ocrStatus: "completed",
        ocrAccuracy: 95.4,
        ocrText: "建物状況調査報告書　調査実施日：2025年7月20日　調査機関：一般社団法人○○建物調査センター　調査結果：構造耐力（良好）、雨水侵入（一部要観察）、給排水管（良好）、電気設備（良好）　特記事項：屋上防水層に軽微なひび割れ2箇所確認、今後3年以内の補修推奨　総合評価：B（良好な維持管理状態）",
        uploadedAt: new Date(Date.now() - 1296000000),
        processedAt: new Date(Date.now() - 1292400000)
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

  async query(sql: string, params: any[] = []): Promise<any> {
    // Mock implementation for demonstration
    // In real implementation, this would connect to the actual database
    throw new Error('Database query method not implemented in MemStorage');
  }
}

export const storage = new MemStorage();
