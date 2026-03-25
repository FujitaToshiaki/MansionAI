import { pool } from "./db";

export async function seedCondominiums() {
  try {
    console.log("[SEED] Starting condominiums seed check...");

    const { rows } = await pool.query("SELECT COUNT(*) FROM condominiums");
    const count = parseInt(rows[0].count);
    console.log(`[SEED] Found ${count} existing condominiums records`);

    if (count > 0) {
      // 既存データがある場合、メゾンドオプテージの新カラムを更新
      console.log("[SEED] condominiums already has records. Updating extended columns for メゾンドオプテージ...");
      await pool.query(
        `UPDATE condominiums SET
           structure_type = $1,
           floors = $2,
           management_type = $3,
           reserve_fund_balance = $4,
           reserve_fund_monthly = $5,
           management_fee_monthly = $6,
           delinquency_rate = $7,
           proper_evaluation_score = $8,
           proper_evaluation_star = $9,
           long_term_plan_version = $10,
           long_term_plan_date = $11
         WHERE id = $12`,
        [
          "RC造", 12, "全部委託",
          9600,    // 積立金残高9,600万円
          12000,   // 月額積立金12,000円/戸
          8500,    // 月額管理費8,500円/戸
          "2.5",   // 滞納率2.5%
          72,      // 適正評価72点
          3,       // 適正評価★3
          "第2版", // 長計バージョン
          "2018-10-01", // 長計策定日
          "a7af9126-67ff-47d9-9c24-cf4054aeb63c",
        ]
      );
      console.log("[SEED] condominiums: extended columns updated for メゾンドオプテージ.");
      return;
    }

    console.log("[SEED] Seeding condominiums data...");

    const condominiums = [
      {
        id: "a7af9126-67ff-47d9-9c24-cf4054aeb63c",
        name: "メゾンドオプテージ",
        address: "東京都江東区木場1-2-3",
        units: 437,
        build_year: 1985,
        management_start_date: "2020-04-01",
        current_regulation_version: "5.0",
        law_revision_status: "completed",
        assigned_manager: "修繕 未来",
        // 拡張カラム
        structure_type: "RC造",
        floors: 12,
        management_type: "全部委託",
        reserve_fund_balance: 9600,
        reserve_fund_monthly: 12000,
        management_fee_monthly: 8500,
        delinquency_rate: "2.5",
        proper_evaluation_score: 72,
        proper_evaluation_star: 3,
        long_term_plan_version: "第2版",
        long_term_plan_date: "2018-10-01",
      },
      {
        id: "b8bf0237-78ee-48ea-ad35-df5165bfb74d",
        name: "グランマンションB",
        address: "神奈川県横浜市港北区2-3-4",
        units: 85,
        build_year: 2006,
        management_start_date: "2018-01-01",
        current_regulation_version: "3.2",
        law_revision_status: "in_progress",
        assigned_manager: "佐藤花子",
        structure_type: null,
        floors: null,
        management_type: null,
        reserve_fund_balance: null,
        reserve_fund_monthly: null,
        management_fee_monthly: null,
        delinquency_rate: null,
        proper_evaluation_score: null,
        proper_evaluation_star: null,
        long_term_plan_version: null,
        long_term_plan_date: null,
      },
    ];

    for (const c of condominiums) {
      await pool.query(
        `INSERT INTO condominiums
           (id, name, address, units, build_year, management_start_date,
            current_regulation_version, law_revision_status, assigned_manager,
            structure_type, floors, management_type, reserve_fund_balance,
            reserve_fund_monthly, management_fee_monthly, delinquency_rate,
            proper_evaluation_score, proper_evaluation_star,
            long_term_plan_version, long_term_plan_date, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          c.id, c.name, c.address, c.units, c.build_year,
          c.management_start_date, c.current_regulation_version,
          c.law_revision_status, c.assigned_manager,
          c.structure_type, c.floors, c.management_type, c.reserve_fund_balance,
          c.reserve_fund_monthly, c.management_fee_monthly, c.delinquency_rate,
          c.proper_evaluation_score, c.proper_evaluation_star,
          c.long_term_plan_version, c.long_term_plan_date,
        ]
      );
    }

    console.log(`[SEED] Successfully seeded ${condominiums.length} condominiums.`);
  } catch (error) {
    console.error("[SEED] Error seeding condominiums:", error);
    throw error;
  }
}
