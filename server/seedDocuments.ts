import { pool } from "./db";

export async function seedDocuments() {
  try {
    console.log("[SEED] Starting documents seed check...");

    const { rows } = await pool.query("SELECT COUNT(*) FROM documents");
    const count = parseInt(rows[0].count);
    console.log(`[SEED] Found ${count} existing documents records`);

    if (count > 0) {
      console.log(`[SEED] documents already has ${count} records. Skipping seed.`);
      return;
    }

    const condominiumId = "a7af9126-67ff-47d9-9c24-cf4054aeb63c";

    const documents = [
      {
        id: "doc-management-001",
        title: "管理組合設立届出書",
        type: "other",
        file_path: "/uploads/management_association_registration.pdf",
        original_file_name: "management_association_registration.pdf",
        file_size: 1200000,
        mime_type: "application/pdf",
        ocr_status: "completed",
        ocr_accuracy: 97,
        ocr_text: "管理組合設立届出書　管理組合名：サンプルレジデンスJ管理組合　設立年月日：2000年4月1日　組合員数：120名　理事長：田中太郎　副理事長：佐藤花子　理事：5名　監事：2名　管理会社：東京マンション管理株式会社　管理形態：全部委託　所轄官庁：○○区役所",
        uploaded_at: "2025-08-08T10:00:00",
        processed_at: "2025-08-08T11:30:00",
        meeting_date: null,
      },
      {
        id: "doc-management-002",
        title: "建物状況調査報告書",
        type: "other",
        file_path: "/uploads/building_condition_survey.pdf",
        original_file_name: "building_condition_survey.pdf",
        file_size: 2800000,
        mime_type: "application/pdf",
        ocr_status: "completed",
        ocr_accuracy: 95,
        ocr_text: "建物状況調査報告書　調査実施日：2025年7月20日　調査機関：一般社団法人○○建物調査センター　調査結果：構造耐力（良好）、雨水侵入（一部要観察）、給排水管（良好）、電気設備（良好）　特記事項：屋上防水層に軽微なひび割れ2箇所確認、今後3年以内の補修推奨　総合評価：B（良好な維持管理状態）",
        uploaded_at: "2025-07-20T13:30:00",
        processed_at: "2025-07-20T15:00:00",
        meeting_date: null,
      },
      {
        id: "doc-facility-001",
        title: "給排水衛生設備図",
        type: "other",
        file_path: "/uploads/plumbing_systems.pdf",
        original_file_name: "plumbing_systems.pdf",
        file_size: 3400000,
        mime_type: "application/pdf",
        ocr_status: "completed",
        ocr_accuracy: 94,
        ocr_text: "給排水衛生設備図　給水方式：受水槽+高架水槽方式　受水槽容量：40㎥（FRP製）　高架水槽容量：20㎥（SUS製）　給水ポンプ：2台（交互運転）　排水方式：汚水・雑排水合流式　雨水排水：独立配管　浄化槽：不要（下水道直結）　各戸メーター：13mm　共用部散水栓：各階1箇所",
        uploaded_at: "2025-08-10T15:20:00",
        processed_at: "2025-08-10T16:45:00",
        meeting_date: null,
      },
      {
        id: "doc-blueprint-001",
        title: "建築確認申請書",
        type: "other",
        file_path: "/uploads/building_permit_application.pdf",
        original_file_name: "building_permit_application.pdf",
        file_size: 3200000,
        mime_type: "application/pdf",
        ocr_status: "completed",
        ocr_accuracy: 95,
        ocr_text: "建築確認申請書　申請番号：第H11-0234号　建築主：株式会社メゾンデベロッパー　所在地：東京都○○区××1-2-3　建築物の概要：共同住宅（分譲マンション）　構造：鉄筋コンクリート造　階数：地上12階　延べ面積：8,500.25㎡　建築面積：720.50㎡　最高高さ：36.8m　住戸数：120戸",
        uploaded_at: "2025-08-16T09:15:00",
        processed_at: "2025-08-16T10:30:00",
        meeting_date: null,
      },
      {
        id: "doc-blueprint-002",
        title: "各階平面図（1F-12F）",
        type: "other",
        file_path: "/uploads/floor_plans_detailed.pdf",
        original_file_name: "floor_plans_detailed.pdf",
        file_size: 5800000,
        mime_type: "application/pdf",
        ocr_status: "completed",
        ocr_accuracy: 89,
        ocr_text: "各階平面図　1階：エントランスホール、管理人室、集会室、駐車場入口、住戸8戸　2階-11階：各階10戸（3LDK×6戸、2LDK×4戸）　12階：ペントハウス2戸　共用部：エレベーター2基、階段2箇所、ゴミ置場（各階）、宅配ボックス（1階）　住戸面積：3LDK=85.2㎡、2LDK=65.8㎡、ペントハウス=120.5㎡",
        uploaded_at: "2025-08-14T14:30:00",
        processed_at: "2025-08-14T16:00:00",
        meeting_date: null,
      },
      {
        id: "doc-blueprint-003",
        title: "構造図・基礎配筋図",
        type: "other",
        file_path: "/uploads/structural_drawings.pdf",
        original_file_name: "structural_drawings.pdf",
        file_size: 4600000,
        mime_type: "application/pdf",
        ocr_status: "completed",
        ocr_accuracy: 92,
        ocr_text: "構造図・基礎配筋図　構造種別：鉄筋コンクリート造（RC造）　基礎：杭基礎（既製コンクリート杭φ600×32本）　支持層：洪積砂質土層（N値≧50）　杭先端深度：GL-28.5m　構造耐力：新耐震基準適合　設計基準強度：Fc=27N/mm²　主筋：D19以上　帯筋：D10@200以下",
        uploaded_at: "2025-08-12T11:45:00",
        processed_at: "2025-08-12T13:15:00",
        meeting_date: null,
      },
      {
        id: "doc-minutes-new-001",
        title: "第40期通常総会議事録",
        type: "minutes",
        file_path: "/uploads/40th_general_meeting_2024.pdf",
        original_file_name: "40th_general_meeting_2024.pdf",
        file_size: 1950000,
        mime_type: "application/pdf",
        ocr_status: "completed",
        ocr_accuracy: 97,
        ocr_text: "第40期通常総会議事録　開催日時：令和6年10月15日　出席組合員数：87名（委任状含む）　議題第1号：管理規約改正の件（承認）　議題第2号：長期修繕計画見直しの件（承認）　議題第3号：管理費・修繕積立金改定の件（承認）",
        uploaded_at: "2025-08-16T10:00:00",
        processed_at: "2025-08-16T11:30:00",
        meeting_date: "2024-10-15T00:00:00",
      },
      {
        id: "doc-minutes-new-002",
        title: "第25回理事会議事録",
        type: "minutes",
        file_path: "/uploads/25th_board_meeting_2024.pdf",
        original_file_name: "25th_board_meeting_2024.pdf",
        file_size: 1200000,
        mime_type: "application/pdf",
        ocr_status: "completed",
        ocr_accuracy: 94,
        ocr_text: "第25回理事会議事録　開催日時：令和6年8月20日　出席理事：5名　議題：エレベーター保守契約更新について、防犯カメラ増設について、騒音苦情対応について　決議：全議題承認",
        uploaded_at: "2025-08-12T14:00:00",
        processed_at: "2025-08-12T15:30:00",
        meeting_date: "2024-08-20T00:00:00",
      },
    ];

    for (const doc of documents) {
      await pool.query(
        `INSERT INTO documents
           (id, condominium_id, title, type, file_path, original_file_name,
            file_size, mime_type, ocr_status, ocr_accuracy, ocr_text,
            meeting_date, uploaded_at, processed_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO NOTHING`,
        [
          doc.id, condominiumId, doc.title, doc.type, doc.file_path,
          doc.original_file_name, doc.file_size, doc.mime_type,
          doc.ocr_status, doc.ocr_accuracy, doc.ocr_text,
          doc.meeting_date, doc.uploaded_at, doc.processed_at,
        ]
      );
    }

    console.log(`[SEED] Successfully seeded ${documents.length} documents.`);
  } catch (error) {
    console.error("[SEED] Error seeding documents:", error);
    throw error;
  }
}
