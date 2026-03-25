import { pool } from "./db";

const MAISON_ID = "a7af9126-67ff-47d9-9c24-cf4054aeb63c";

export async function seedLongTermData() {
  try {
    console.log("[SEED] Starting long_term_plans, repair_items, repair_history seed...");

    // ── long_term_plans ──────────────────────────────────────────────
    const { rows: planRows } = await pool.query(
      "SELECT COUNT(*) FROM long_term_plans WHERE condominium_id = $1",
      [MAISON_ID]
    );
    if (parseInt(planRows[0].count) === 0) {
      const { rows: inserted } = await pool.query(
        `INSERT INTO long_term_plans
           (condominium_id, version, plan_start_year, plan_end_year, total_amount, approved_date, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING id`,
        [MAISON_ID, "第2版", 2018, 2047, 36000, "2018-10-01",
         "2018年総会承認。計画期間30年、計画総額3億6000万円。"]
      );
      const planId = inserted[0].id;
      console.log("[SEED] long_term_plans: 1件投入 id=" + planId);

      // ── repair_items ───────────────────────────────────────────────
      const repairItems = [
        { category: "外壁", itemName: "外壁塗装", plannedYear: 2028, plannedAmount: 2500, cycleYears: 12, priority: "high", status: "planned" },
        { category: "外壁", itemName: "外壁タイル補修", plannedYear: 2030, plannedAmount: 800, cycleYears: 15, priority: "medium", status: "planned" },
        { category: "屋根", itemName: "屋上防水工事（アスファルト防水）", plannedYear: 2026, plannedAmount: 1800, cycleYears: 12, priority: "high", status: "planned" },
        { category: "屋根", itemName: "屋上防水工事（塗膜防水）", plannedYear: 2038, plannedAmount: 1600, cycleYears: 12, priority: "medium", status: "planned" },
        { category: "給排水", itemName: "給水管更新（受水槽～各戸）", plannedYear: 2032, plannedAmount: 4200, cycleYears: 30, priority: "high", status: "planned" },
        { category: "給排水", itemName: "排水管更新", plannedYear: 2034, plannedAmount: 3500, cycleYears: 30, priority: "high", status: "planned" },
        { category: "給排水", itemName: "受水槽・高架水槽更新", plannedYear: 2030, plannedAmount: 1200, cycleYears: 25, priority: "medium", status: "planned" },
        { category: "EV", itemName: "エレベーター更新（1号機）", plannedYear: 2025, plannedAmount: 5000, cycleYears: 25, priority: "high", status: "planned" },
        { category: "EV", itemName: "エレベーター更新（2号機）", plannedYear: 2026, plannedAmount: 5000, cycleYears: 25, priority: "high", status: "planned" },
        { category: "電気", itemName: "高圧受変電設備更新", plannedYear: 2027, plannedAmount: 3000, cycleYears: 30, priority: "high", status: "planned" },
        { category: "電気", itemName: "共用部照明LED化", plannedYear: 2026, plannedAmount: 400, cycleYears: 15, priority: "low", status: "planned" },
        { category: "電気", itemName: "インターホン更新", plannedYear: 2029, plannedAmount: 600, cycleYears: 20, priority: "medium", status: "planned" },
        { category: "消防", itemName: "消防設備更新（スプリンクラー）", plannedYear: 2031, plannedAmount: 1500, cycleYears: 20, priority: "high", status: "planned" },
        { category: "消防", itemName: "消火器・誘導灯交換", plannedYear: 2028, plannedAmount: 200, cycleYears: 8, priority: "low", status: "planned" },
        { category: "駐車場", itemName: "機械式駐車場オーバーホール", plannedYear: 2027, plannedAmount: 800, cycleYears: 10, priority: "medium", status: "planned" },
        { category: "駐車場", itemName: "機械式駐車場更新", plannedYear: 2040, plannedAmount: 6000, cycleYears: 25, priority: "medium", status: "planned" },
        { category: "共用部", itemName: "エントランスホール改修", plannedYear: 2033, plannedAmount: 1000, cycleYears: 20, priority: "low", status: "planned" },
        { category: "共用部", itemName: "廊下・階段防水・塗装", plannedYear: 2029, plannedAmount: 1200, cycleYears: 12, priority: "medium", status: "planned" },
        { category: "外構", itemName: "外構・駐車場舗装補修", plannedYear: 2030, plannedAmount: 500, cycleYears: 15, priority: "low", status: "planned" },
        { category: "設備", itemName: "給湯設備更新（共用部）", plannedYear: 2028, plannedAmount: 300, cycleYears: 15, priority: "low", status: "planned" },
      ];

      for (const item of repairItems) {
        await pool.query(
          `INSERT INTO repair_items
             (condominium_id, long_term_plan_id, category, item_name, planned_year, planned_amount, cycle_years, priority, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [MAISON_ID, planId, item.category, item.itemName, item.plannedYear,
           item.plannedAmount, item.cycleYears, item.priority, item.status]
        );
      }
      console.log("[SEED] repair_items: " + repairItems.length + "件投入");
    } else {
      console.log("[SEED] long_term_plans: already seeded, skipping.");
    }

    // ── repair_history ─────────────────────────────────────────────
    const { rows: histRows } = await pool.query(
      "SELECT COUNT(*) FROM repair_history WHERE condominium_id = $1",
      [MAISON_ID]
    );
    if (parseInt(histRows[0].count) === 0) {
      const histories = [
        { title: "外壁塗装工事", category: "外壁", implementedDate: "2010-09-01", amount: 2200, contractor: "東京塗装株式会社", outcome: "RC外壁全面塗装。弾性塗料使用。" },
        { title: "屋上防水改修工事", category: "屋根", implementedDate: "2012-05-01", amount: 1600, contractor: "日本防水工業株式会社", outcome: "アスファルト防水→改質アスファルト防水に改修。" },
        { title: "エレベーター制御部品交換", category: "EV", implementedDate: "2015-11-01", amount: 800, contractor: "株式会社OTISエレベータ", outcome: "制御基板・ドア開閉機構交換。安全性向上。" },
        { title: "給水管（高架水槽以降）更新", category: "給排水", implementedDate: "2017-06-01", amount: 2800, contractor: "東都設備株式会社", outcome: "塩ビ管→ステンレス管に更新。錆び問題解消。" },
        { title: "外壁タイル補修・シール打ち替え", category: "外壁", implementedDate: "2019-10-01", amount: 900, contractor: "株式会社タイル工業", outcome: "浮きタイル72枚補修、シール打ち替え全面実施。" },
        { title: "機械式駐車場定期オーバーホール", category: "駐車場", implementedDate: "2021-03-01", amount: 750, contractor: "パークシステム株式会社", outcome: "駆動部・チェーン・センサー一式交換。" },
        { title: "消防設備点検・部品交換", category: "消防", implementedDate: "2022-08-01", amount: 350, contractor: "東京防災サービス株式会社", outcome: "スプリンクラーヘッド18個交換、感知器点検。" },
        { title: "共用廊下防水・塗装工事", category: "共用部", implementedDate: "2024-04-01", amount: 1100, contractor: "関東建装株式会社", outcome: "廊下床防水シート全面貼り替え、天井塗装。" },
      ];

      for (const h of histories) {
        await pool.query(
          `INSERT INTO repair_history
             (condominium_id, title, category, implemented_date, amount, contractor, outcome)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [MAISON_ID, h.title, h.category, h.implementedDate, h.amount, h.contractor, h.outcome]
        );
      }
      console.log("[SEED] repair_history: " + histories.length + "件投入");
    } else {
      console.log("[SEED] repair_history: already seeded, skipping.");
    }

  } catch (error) {
    console.error("[SEED] Error seeding long_term_data:", error);
    throw error;
  }
}
