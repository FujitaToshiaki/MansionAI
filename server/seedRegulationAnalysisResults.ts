import { pool } from "./db";

export async function seedRegulationAnalysisResults() {
  try {
    console.log("[SEED] Starting regulation_analysis_results seed check...");
    
    // Check if data already exists
    const { rows } = await pool.query('SELECT COUNT(*) FROM regulation_analysis_results');
    const count = parseInt(rows[0].count);
    
    console.log(`[SEED] Found ${count} existing regulation_analysis_results records`);
    
    if (count > 0) {
      console.log(`[SEED] regulation_analysis_results already has ${count} records. Skipping seed.`);
      return;
    }

    console.log("[SEED] Starting to seed regulation_analysis_results data...");

    // First, ensure the condominium exists
    const condominiumId = "a7af9126-67ff-47d9-9c24-cf4054aeb63c";
    console.log(`[SEED] Ensuring condominium ${condominiumId} exists...`);
    
    try {
      await pool.query(`
        INSERT INTO condominiums (id, name, address, total_units, completion_date, management_company, created_at, updated_at)
        VALUES ($1, 'メゾンドオプテージ', '東京都港区', 50, '2010-01-01', '株式会社オプテージマネジメント', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [condominiumId]);
      console.log(`[SEED] Condominium insert/update completed`);
    } catch (condoError) {
      console.error("[SEED] Error inserting condominium:", condoError);
      throw condoError;
    }

    const analysisResults = [
      {
        id: "a4745a0d-a619-4eac-9235-2fccc778e53e",
        condominium_id: condominiumId,
        priority: "high",
        article: "第15条",
        title: "個人情報保護規定の追加",
        reason: "改正個人情報保護法への対応が必要",
        current_text: "第15条 管理組合は、区分所有者および居住者の個人情報を適切に管理する。",
        proposed_text: "第15条 管理組合は、個人情報の保護に関する法律に基づき、区分所有者および居住者の個人情報を適正に取り扱う。",
        legal_basis: "個人情報保護法改正(2024年)",
        law_revision_required: true,
        impact: "high",
        implementation_notes: "既存の個人情報取扱規程との整合性確認\n区分所有者への事前周知期間の確保\n管理会社との契約書見直しの必要性",
        data_sources: JSON.stringify(["標準管理規約 第15条 (2024年改定版)", "2023年度定期総会議事録 第3号議案", "個人情報保護法改正資料（国交省）", "類似管理組合事例（3件）"]),
        change_history: JSON.stringify([
          {"date": "2024-12-15", "type": "required", "details": "根拠: 個人情報保護法改正", "description": "法改正による必要性判定"},
          {"date": "2023-03-15", "type": "approved", "details": "決議内容: プライバシー方針策定", "description": "定期総会にて個人情報保護強化を決議"},
          {"date": "2022-06-10", "type": "modified", "details": "変更箇所: 第15条第2項追加", "description": "個人情報の定義を明確化"},
          {"date": "2020-04-01", "type": "initial", "description": "管理規約制定時の原文"}
        ]),
        status: "completed"
      },
      {
        id: "c5e27b35-8478-4fac-b34e-d148f22354be",
        condominium_id: condominiumId,
        priority: "medium",
        article: "第8条",
        title: "外部専門家活用規定",
        reason: "管理組合運営の専門性向上のため",
        current_text: "第8条 管理組合の役員は区分所有者から選任する。",
        proposed_text: "第8条 管理組合の役員は区分所有者から選任する。ただし、専門的知識を要する業務については外部専門家を活用することができる。",
        legal_basis: "標準管理規約改正",
        law_revision_required: false,
        impact: "medium",
        implementation_notes: "外部専門家の選定基準策定\n費用負担の明確化\n責任範囲の規定",
        data_sources: JSON.stringify(["標準管理規約 第8条改正", "管理組合運営実態調査", "他組合事例調査"]),
        change_history: JSON.stringify([
          {"date": "2024-10-15", "type": "proposal", "description": "専門家活用に関する検討開始"},
          {"date": "2024-06-01", "type": "survey", "description": "組合員アンケート実施"}
        ]),
        status: "completed"
      },
      {
        id: "b8678475-ef18-4e92-8721-9a59966fd746",
        condominium_id: condominiumId,
        priority: "high",
        article: "第20条",
        title: "ペット飼育規定の見直し",
        reason: "近年のペット飼育に関する住民ニーズの変化と、標準管理規約の改訂に対応するため、現行のペット飼育禁止規定を緩和し、適切な管理の下でのペット飼育を認める規定に変更する必要があります。",
        current_text: "第20条 専有部分における動物の飼育は、これを禁止する。",
        proposed_text: "第20条 専有部分における動物の飼育は、理事会の事前承認を得た場合に限り、小型犬又は猫（体重10kg以下）1匹まで認める。ただし、飼育者は管理組合に対し敷金として月額共益費の3ヶ月分を預託し、近隣住民への迷惑防止に努めなければならない。",
        legal_basis: "標準管理規約第21条、動物愛護法",
        law_revision_required: true,
        impact: "high",
        implementation_notes: "理事会での承認基準策定、ペット飼育細則の制定、敷金管理体制の確立が必要",
        status: "completed"
      },
      {
        id: "8dc23a57-dbb2-404c-a777-172865d5dff2",
        condominium_id: condominiumId,
        priority: "high",
        article: "第30条",
        title: "大規模修繕工事の合意形成手続き",
        reason: "建物の老朽化に伴い、大規模修繕工事の実施が必要となる時期を迎えています。工事の合意形成過程を明確化し、適切な修繕計画の策定と実施体制を整備する必要があります。",
        current_text: "第30条 大規模修繕工事は、総会の決議により実施する。",
        proposed_text: "第30条 大規模修繕工事は、理事会が作成した修繕計画案について、事前に組合員説明会を開催し、総会の普通決議により実施する。工事費が共用部分の年間予算の50%を超える場合は、特別決議を要する。",
        legal_basis: "区分所有法第17条、標準管理規約第48条",
        law_revision_required: false,
        impact: "high",
        implementation_notes: "修繕計画策定手順の明文化、組合員説明会実施要領の策定が必要",
        status: "completed"
      },
      {
        id: "0d4aab44-1af3-42d3-8191-8e6da9cd6259",
        condominium_id: condominiumId,
        priority: "high",
        article: "第12条",
        title: "役員の任期と選任方法の改定",
        reason: "現行の役員任期が短く、継続性のある管理組合運営に支障をきたしています。また、役員の担い手不足も深刻化しており、選任方法の見直しとともに任期の延長を検討する必要があります。",
        current_text: "第12条 役員の任期は1年とし、再任を妨げない。",
        proposed_text: "第12条 役員の任期は2年とし、連続3期まで再任することができる。ただし、理事長については連続2期までとする。役員の選任は、区分所有者による推薦制を併用することができる。",
        legal_basis: "区分所有法第25条、標準管理規約第35条",
        law_revision_required: false,
        impact: "high",
        implementation_notes: "規約変更の総会承認必要、現役員との調整、選任規程の見直しが必要",
        status: "under_review"
      },
      {
        id: "c0dbd9b8-8a94-4897-b846-cc4f1814af9d",
        condominium_id: condominiumId,
        priority: "medium",
        article: "第45条",
        title: "災害時の対応規定の整備",
        reason: "近年の自然災害の頻発を受け、緊急時の管理組合としての対応体制と役割分担を明確化する必要があります。居住者の安全確保と建物の被害対応について具体的な規定を設ける必要があります。",
        current_text: "第45条 緊急時の対応については、別途定める。",
        proposed_text: "第45条 地震、火災等の災害発生時は、理事長が対策本部を設置し、居住者の安否確認、建物の被害調査、関係機関との連絡調整を行う。各区分所有者は管理組合の指示に協力するものとする。",
        legal_basis: "災害対策基本法、標準管理規約第50条",
        law_revision_required: false,
        impact: "medium",
        implementation_notes: "災害時対応マニュアルの策定、緊急連絡網の整備、備蓄品の確保が必要",
        status: "completed"
      },
      {
        id: "f93ec76b-bbf0-47a9-a20c-e96cd46f54a0",
        condominium_id: condominiumId,
        priority: "high",
        article: "第62条",
        title: "建替え・大規模修繕の決議要件緩和",
        reason: "2025年区分所有法改正により、決議要件が5分の4（80%）から4分の3（75%）に緩和されます。適用条件として耐震性不足・バリアフリー未対応等の客観的要件を満たす場合に限定されます。",
        current_text: "第62条 建物の建替えは、区分所有者及び議決権の各5分の4以上の多数による集会の決議で決する。",
        proposed_text: "第62条 建物の建替えは、区分所有者及び議決権の各4分の3以上の多数による集会の決議で決することができる。ただし、耐震性不足その他客観的要件を満たす場合に限る。",
        legal_basis: "改正区分所有法第62条（2025年施行）",
        law_revision_required: true,
        impact: "high",
        implementation_notes: "耐震診断の実施、客観的要件の確認、総会決議手続きの見直しが必要",
        status: "in_progress"
      },
      {
        id: "a8164149-d481-4612-a091-04f351ff9872",
        condominium_id: condominiumId,
        priority: "high",
        article: "第65条",
        title: "所在不明所有者への対処制度",
        reason: "所在不明所有者に対する新設内容として、裁判所の決定で所在不明者を決議から除外可能となり、連絡の取れない所有者がいても合意形成がスムーズになります。",
        current_text: "第65条 所在不明の区分所有者がある場合の特別の定めはない。",
        proposed_text: "第65条 区分所有者の所在が不明である場合において、裁判所の決定を受けたときは、当該区分所有者を集会の決議から除外することができる。",
        legal_basis: "改正区分所有法第65条（2025年施行）",
        law_revision_required: true,
        impact: "high",
        implementation_notes: "所在確認手続きの整備、裁判所申立て手続きの準備、除外基準の明文化が必要",
        status: "pending"
      },
      {
        id: "131b7f05-385c-4050-b4c5-5fae0b31caaf",
        condominium_id: condominiumId,
        priority: "medium",
        article: "第66条",
        title: "管理不全マンションへの行政介入",
        reason: "管理不全マンションに対する新設権限として、自治体が是正勧告・命令を発出可能になり、適切な管理が行われていないマンションの住環境改善の防止と改善の強制力が確保されます。",
        current_text: "第66条 行政による管理不全マンションへの介入規定はない。",
        proposed_text: "第66条 管理不全の状態にあるマンションについて、地方公共団体は管理組合に対し、必要な措置を講ずべきことを勧告し、又は命ずることができる。",
        legal_basis: "改正区分所有法第66条（2025年施行）",
        law_revision_required: true,
        impact: "medium",
        implementation_notes: "管理状況の自己点検体制確立、行政連携体制の構築、改善計画策定手順の整備が必要",
        status: "completed"
      },
      {
        id: "eca9785b-2082-4599-b782-814f94d0398e",
        condominium_id: condominiumId,
        priority: "medium",
        article: "第17条",
        title: "一棟リノベーション要件の緩和",
        reason: "建物全体の大規模改修工事について、より少ない賛成数で建物の価値向上が可能になり、老朽化マンションの再生促進が図られます。",
        current_text: "第17条 共用部分の変更は、区分所有者及び議決権の各4分の3以上の多数による集会の決議で決する。",
        proposed_text: "第17条 建物全体に係る大規模な改修工事については、区分所有者及び議決権の各3分の2以上の多数による集会の決議で決することができる。",
        legal_basis: "改正区分所有法第17条（2025年施行）",
        law_revision_required: true,
        impact: "medium",
        implementation_notes: "リノベーション計画策定手順の整備、工事範囲の明確化、合意形成プロセスの見直しが必要",
        status: "completed"
      }
    ];

    // Insert all analysis results
    console.log(`[SEED] Inserting ${analysisResults.length} regulation_analysis_results records...`);
    let insertedCount = 0;
    
    for (const result of analysisResults) {
      try {
        await pool.query(`
          INSERT INTO regulation_analysis_results (
            id, condominium_id, priority, article, title, reason, 
            current_text, proposed_text, legal_basis, law_revision_required, 
            impact, implementation_notes, data_sources, change_history, status, 
            created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
        `, [
          result.id,
          result.condominium_id,
          result.priority,
          result.article,
          result.title,
          result.reason,
          result.current_text,
          result.proposed_text,
          result.legal_basis,
          result.law_revision_required,
          result.impact,
          result.implementation_notes,
          result.data_sources || null,
          result.change_history || null,
          result.status
        ]);
        insertedCount++;
        console.log(`[SEED] Inserted record ${insertedCount}/${analysisResults.length}: ${result.title}`);
      } catch (insertError: any) {
        console.error(`[SEED] Failed to insert record ${result.title}:`, insertError.message);
        throw insertError;
      }
    }

    console.log(`[SEED] Successfully seeded ${insertedCount} regulation_analysis_results records.`);
  } catch (error) {
    console.error('Error seeding regulation_analysis_results:', error);
    throw error;
  }
}
