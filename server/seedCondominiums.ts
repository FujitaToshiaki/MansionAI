import { pool } from "./db";

export async function seedCondominiums() {
  try {
    console.log("[SEED] Starting condominiums seed check...");

    const { rows } = await pool.query("SELECT COUNT(*) FROM condominiums");
    const count = parseInt(rows[0].count);
    console.log(`[SEED] Found ${count} existing condominiums records`);

    if (count > 0) {
      // 既存レコードに新カラムを UPDATE
      await pool.query(`
        UPDATE condominiums SET
          structure_type = 'RC',
          floors = 15,
          management_type = 'full',
          reserve_fund_balance = 96000000,
          reserve_fund_monthly = 12000,
          management_fee_monthly = 15000,
          delinquency_rate = 2.5,
          proper_evaluation_score = 72,
          proper_evaluation_star = 3,
          long_term_plan_version = '2018年度版（30年計画）',
          long_term_plan_date = '2018-03-31'::timestamp
        WHERE id = 'a7af9126-67ff-47d9-9c24-cf4054aeb63c'
      `);
      await pool.query(`
        UPDATE condominiums SET
          structure_type = 'RC',
          floors = 8,
          management_type = 'full',
          reserve_fund_balance = 32000000,
          reserve_fund_monthly = 8000,
          management_fee_monthly = 12000,
          delinquency_rate = 1.2,
          proper_evaluation_score = 65,
          proper_evaluation_star = 3,
          long_term_plan_version = '2022年度版（30年計画）',
          long_term_plan_date = '2022-04-01'::timestamp
        WHERE id = 'b8bf0237-78ee-48ea-ad35-df5165bfb74d'
      `);
      console.log(`[SEED] Updated condominiums with new columns.`);
      return;
    }

    console.log("[SEED] Seeding condominiums data...");

    const condominiums = [
      {
        id: "a7af9126-67ff-47d9-9c24-cf4054aeb63c",
        name: "メゾンドオプテージ",
        address: "大阪府大阪市中央区本町1-2-3",
        units: 120,
        build_year: 2007,
        management_start_date: "2020-04-01",
        current_regulation_version: "5.0",
        law_revision_status: "completed",
        assigned_manager: "修繕 未来",
        structure_type: "RC",
        floors: 15,
        management_type: "full",
        reserve_fund_balance: 96000000,
        reserve_fund_monthly: 12000,
        management_fee_monthly: 15000,
        delinquency_rate: 2.5,
        proper_evaluation_score: 72,
        proper_evaluation_star: 3,
        long_term_plan_version: "2018年度版（30年計画）",
        long_term_plan_date: "2018-03-31",
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
        structure_type: "RC",
        floors: 8,
        management_type: "full",
        reserve_fund_balance: 32000000,
        reserve_fund_monthly: 8000,
        management_fee_monthly: 12000,
        delinquency_rate: 1.2,
        proper_evaluation_score: 65,
        proper_evaluation_star: 3,
        long_term_plan_version: "2022年度版（30年計画）",
        long_term_plan_date: "2022-04-01",
      },
    ];

    for (const c of condominiums) {
      await pool.query(
        `INSERT INTO condominiums
           (id, name, address, units, build_year, management_start_date,
            current_regulation_version, law_revision_status, assigned_manager,
            structure_type, floors, management_type,
            reserve_fund_balance, reserve_fund_monthly, management_fee_monthly,
            delinquency_rate, proper_evaluation_score, proper_evaluation_star,
            long_term_plan_version, long_term_plan_date, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          c.id, c.name, c.address, c.units, c.build_year,
          c.management_start_date, c.current_regulation_version,
          c.law_revision_status, c.assigned_manager,
          c.structure_type, c.floors, c.management_type,
          c.reserve_fund_balance, c.reserve_fund_monthly, c.management_fee_monthly,
          c.delinquency_rate, c.proper_evaluation_score, c.proper_evaluation_star,
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
