import { pool } from "./db";

const MAISON_ID = "a7af9126-67ff-47d9-9c24-cf4054aeb63c";

export async function seedEvaluationData() {
  try {
    console.log("[SEED] Starting evaluation_items_master, evaluation_checks seed...");

    // ── evaluation_items_master ────────────────────────────────────
    const { rows: masterRows } = await pool.query(
      "SELECT COUNT(*) FROM evaluation_items_master"
    );
    if (parseInt(masterRows[0].count) === 0) {
      const items = [
        // 財務（F）- 8項目
        { category: "財務", itemCode: "F-01", itemName: "修繕積立金残高の充足度", description: "長期修繕計画に基づく必要積立額に対する残高比率", maxScore: 5, evaluationCriteria: "5点：125%以上、4点：100-125%、3点：75-100%、2点：50-75%、1点：50%未満", sortOrder: 1 },
        { category: "財務", itemCode: "F-02", itemName: "修繕積立金の滞納率", description: "全区分所有者に占める滞納者の割合", maxScore: 5, evaluationCriteria: "5点：0%、4点：1%未満、3点：3%未満、2点：5%未満、1点：5%以上", sortOrder: 2 },
        { category: "財務", itemCode: "F-03", itemName: "管理費の滞納率", description: "管理費の滞納率", maxScore: 4, evaluationCriteria: "4点：0%、3点：1%未満、2点：3%未満、1点：3%以上", sortOrder: 3 },
        { category: "財務", itemCode: "F-04", itemName: "長期修繕計画の策定状況", description: "計画期間・策定年数・定期見直しの実施状況", maxScore: 5, evaluationCriteria: "5点：30年以上・5年以内見直し、3点：25年以上・10年以内見直し、1点：未策定", sortOrder: 4 },
        { category: "財務", itemCode: "F-05", itemName: "修繕積立金の増額計画", description: "将来の増額計画の有無と実行状況", maxScore: 4, evaluationCriteria: "4点：計画あり・段階増額実施中、2点：計画あり・未実施、0点：計画なし", sortOrder: 5 },
        { category: "財務", itemCode: "F-06", itemName: "会計の独立性・透明性", description: "管理費会計と修繕積立金会計の分別管理", maxScore: 3, evaluationCriteria: "3点：完全分別管理・外部監査あり、2点：分別管理のみ、1点：分別不十分", sortOrder: 6 },
        { category: "財務", itemCode: "F-07", itemName: "借入金の状況", description: "修繕工事等のための借入金残高", maxScore: 3, evaluationCriteria: "3点：借入なし、2点：返済計画あり・順調、1点：借入あり・計画不明", sortOrder: 7 },
        { category: "財務", itemCode: "F-08", itemName: "予算と決算の乖離率", description: "直近3年間の予算執行率の適切性", maxScore: 3, evaluationCriteria: "3点：乖離10%未満、2点：乖離20%未満、1点：乖離20%以上", sortOrder: 8 },

        // 修繕（R）- 7項目
        { category: "修繕", itemCode: "R-01", itemName: "大規模修繕工事の実施状況", description: "第1回・第2回大規模修繕の実施有無と適切性", maxScore: 5, evaluationCriteria: "5点：12年周期で適切実施・記録あり、3点：実施済み・記録不完全、1点：未実施", sortOrder: 9 },
        { category: "修繕", itemCode: "R-02", itemName: "設備更新の実施状況", description: "給排水・電気・EV等の主要設備の更新実施", maxScore: 5, evaluationCriteria: "5点：全設備適切更新済み、3点：一部更新済み、1点：未更新多数", sortOrder: 10 },
        { category: "修繕", itemCode: "R-03", itemName: "日常修繕・点検の実施", description: "法定点検・自主点検・小修繕の実施状況", maxScore: 4, evaluationCriteria: "4点：全法定点検実施・記録完備、2点：一部実施、0点：未実施多数", sortOrder: 11 },
        { category: "修繕", itemCode: "R-04", itemName: "建物診断の実施", description: "外壁打診・構造診断等の定期実施", maxScore: 3, evaluationCriteria: "3点：定期実施（5年以内）、2点：実施済み（10年以内）、1点：未実施", sortOrder: 12 },
        { category: "修繕", itemCode: "R-05", itemName: "修繕履歴の記録・保管", description: "工事記録・図面の適切な保管", maxScore: 3, evaluationCriteria: "3点：全記録完備・電子管理、2点：主要記録あり、1点：記録不十分", sortOrder: 13 },
        { category: "修繕", itemCode: "R-06", itemName: "バリアフリー対応状況", description: "高齢者・障害者への対応整備", maxScore: 3, evaluationCriteria: "3点：スロープ・手すり・EV完備、2点：一部対応、1点：未対応", sortOrder: 14 },
        { category: "修繕", itemCode: "R-07", itemName: "省エネ・脱炭素への取組", description: "LED化・太陽光等の省エネ設備導入", maxScore: 3, evaluationCriteria: "3点：複数省エネ設備導入、2点：一部導入（LED等）、1点：未取組", sortOrder: 15 },

        // 管理運営（M）- 7項目
        { category: "管理運営", itemCode: "M-01", itemName: "管理組合の活動状況", description: "総会・理事会の定期開催と決議の適切性", maxScore: 5, evaluationCriteria: "5点：年1回以上総会・月1回理事会・議事録完備、3点：総会のみ定期開催、1点：不定期", sortOrder: 16 },
        { category: "管理運営", itemCode: "M-02", itemName: "居住者の参加・満足度", description: "総会出席率・アンケート結果", maxScore: 4, evaluationCriteria: "4点：出席率50%以上・満足度高、2点：出席率30%以上、1点：出席率低", sortOrder: 17 },
        { category: "管理運営", itemCode: "M-03", itemName: "管理委託契約の適切性", description: "重要事項説明・契約更新の適切な実施", maxScore: 4, evaluationCriteria: "4点：適切な契約更新・重説実施、2点：契約あり・手続き不十分、0点：契約なし", sortOrder: 18 },
        { category: "管理運営", itemCode: "M-04", itemName: "管理規約の整備状況", description: "標準管理規約への準拠と最新改正対応", maxScore: 4, evaluationCriteria: "4点：最新標準規約準拠・改訂済、2点：一部対応、0点：旧規約のまま", sortOrder: 19 },
        { category: "管理運営", itemCode: "M-05", itemName: "情報開示・共有", description: "会計情報・議事録等の居住者への開示", maxScore: 3, evaluationCriteria: "3点：掲示板・ポータルで積極開示、2点：請求時に開示、1点：開示不十分", sortOrder: 20 },
        { category: "管理運営", itemCode: "M-06", itemName: "トラブル対応体制", description: "クレーム・トラブルへの迅速な対応", maxScore: 3, evaluationCriteria: "3点：24時間対応・マニュアル完備、2点：管理会社に委任、1点：対応不十分", sortOrder: 21 },
        { category: "管理運営", itemCode: "M-07", itemName: "管理員の配置", description: "管理員の勤務形態と資質", maxScore: 3, evaluationCriteria: "3点：常駐・マンション管理士資格、2点：日勤のみ、1点：巡回のみ", sortOrder: 22 },

        // 法令（L）- 5項目
        { category: "法令", itemCode: "L-01", itemName: "法定点検の実施状況", description: "消防・建築・エレベーター等の法定点検", maxScore: 5, evaluationCriteria: "5点：全法定点検実施・指摘事項是正済、3点：実施済み・一部未是正、1点：未実施あり", sortOrder: 23 },
        { category: "法令", itemCode: "L-02", itemName: "耐震性能の確認", description: "旧耐震基準建物の耐震診断・改修状況", maxScore: 4, evaluationCriteria: "4点：新耐震基準または診断・改修済、2点：診断のみ、0点：未実施（旧耐震基準）", sortOrder: 24 },
        { category: "法令", itemCode: "L-03", itemName: "石綿（アスベスト）対応", description: "使用調査・飛散防止措置の実施状況", maxScore: 3, evaluationCriteria: "3点：調査済・措置完了、2点：調査済・措置計画あり、1点：未調査", sortOrder: 25 },
        { category: "法令", itemCode: "L-04", itemName: "個人情報保護への対応", description: "区分所有者情報の適切な管理", maxScore: 3, evaluationCriteria: "3点：規程整備・安全管理措置完備、2点：一部対応、1点：未対応", sortOrder: 26 },
        { category: "法令", itemCode: "L-05", itemName: "マンション管理適正化指針への準拠", description: "国土交通省指針への対応状況", maxScore: 3, evaluationCriteria: "3点：全項目対応、2点：主要項目対応、1点：一部対応", sortOrder: 27 },

        // 居住環境（E）- 3項目
        { category: "居住環境", itemCode: "E-01", itemName: "共用部の清潔さ・美観", description: "エントランス・廊下・駐車場等の清掃・美観", maxScore: 4, evaluationCriteria: "4点：常に清潔・定期補修、2点：概ね良好、0点：不十分", sortOrder: 28 },
        { category: "居住環境", itemCode: "E-02", itemName: "防犯・セキュリティ体制", description: "オートロック・防犯カメラ・管理員の防犯対応", maxScore: 4, evaluationCriteria: "4点：オートロック+カメラ+常駐管理員、2点：一部対応、0点：未対応", sortOrder: 29 },
        { category: "居住環境", itemCode: "E-03", itemName: "防災・BCP対応", description: "防災マニュアル・備蓄・避難訓練の実施", maxScore: 4, evaluationCriteria: "4点：マニュアル整備・備蓄・年1回訓練、2点：一部実施、0点：未対応", sortOrder: 30 },
      ];

      for (const item of items) {
        await pool.query(
          `INSERT INTO evaluation_items_master
             (category, item_code, item_name, description, max_score, evaluation_criteria, sort_order, is_active)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [item.category, item.itemCode, item.itemName, item.description,
           item.maxScore, item.evaluationCriteria, item.sortOrder, true]
        );
      }
      console.log("[SEED] evaluation_items_master: " + items.length + "件投入");
    } else {
      console.log("[SEED] evaluation_items_master: already seeded, skipping.");
    }

    // ── evaluation_checks ──────────────────────────────────────────
    const { rows: checkRows } = await pool.query(
      "SELECT COUNT(*) FROM evaluation_checks WHERE condominium_id = $1",
      [MAISON_ID]
    );
    if (parseInt(checkRows[0].count) === 0) {
      const checks = [
        {
          checkDate: "2024-04-01",
          totalScore: 68,
          starRating: 3,
          checkedBy: "東京マンション管理士事務所",
          notes: "修繕積立金残高が基準を下回っている（75%水準）。積立金値上げを推奨。",
          checkResults: JSON.stringify([
            { itemCode: "F-01", score: 3, notes: "残高75%水準" },
            { itemCode: "F-02", score: 4, notes: "滞納率2.5%" },
            { itemCode: "R-01", score: 4, notes: "2012年第1回大規模修繕実施済" },
            { itemCode: "M-01", score: 5, notes: "理事会月1回・総会年1回実施" },
            { itemCode: "L-01", score: 5, notes: "全法定点検実施済" },
          ]),
        },
        {
          checkDate: "2025-10-01",
          totalScore: 70,
          starRating: 3,
          checkedBy: "東京マンション管理士事務所",
          notes: "積立金値上げ実施により財務状況が改善。EV更新工事の計画化が評価された。",
          checkResults: JSON.stringify([
            { itemCode: "F-01", score: 3, notes: "残高80%水準に改善" },
            { itemCode: "F-02", score: 4, notes: "滞納率2.5%維持" },
            { itemCode: "F-04", score: 4, notes: "長期修繕計画第2版（2018年）継続中" },
            { itemCode: "R-01", score: 4, notes: "大規模修繕実施済" },
            { itemCode: "M-04", score: 4, notes: "令和3年標準規約改正対応中" },
          ]),
        },
        {
          checkDate: "2026-03-01",
          totalScore: 72,
          starRating: 3,
          checkedBy: "東京マンション管理士事務所",
          notes: "管理規約改訂が進捗。EV更新工事業者選定も進んでおり総合評価が向上。",
          checkResults: JSON.stringify([
            { itemCode: "F-01", score: 3, notes: "残高85%水準" },
            { itemCode: "F-02", score: 4, notes: "滞納率2.5%" },
            { itemCode: "M-04", score: 5, notes: "令和3年標準規約改正対応完了" },
            { itemCode: "R-01", score: 4, notes: "大規模修繕実施済" },
            { itemCode: "L-01", score: 5, notes: "全法定点検実施済" },
          ]),
        },
      ];

      for (const c of checks) {
        await pool.query(
          `INSERT INTO evaluation_checks
             (condominium_id, check_date, total_score, star_rating, check_results, checked_by, notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [MAISON_ID, c.checkDate, c.totalScore, c.starRating,
           c.checkResults, c.checkedBy, c.notes]
        );
      }
      console.log("[SEED] evaluation_checks: " + checks.length + "件投入");
    } else {
      console.log("[SEED] evaluation_checks: already seeded, skipping.");
    }

  } catch (error) {
    console.error("[SEED] Error seeding evaluation data:", error);
    throw error;
  }
}
