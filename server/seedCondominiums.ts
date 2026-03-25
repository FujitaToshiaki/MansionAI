import { pool } from "./db";

export async function seedCondominiums() {
  try {
    console.log("[SEED] Starting condominiums seed check...");

    const { rows } = await pool.query("SELECT COUNT(*) FROM condominiums");
    const count = parseInt(rows[0].count);
    console.log(`[SEED] Found ${count} existing condominiums records`);

    if (count > 0) {
      console.log(`[SEED] condominiums already has ${count} records. Skipping seed.`);
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
      },
    ];

    for (const c of condominiums) {
      await pool.query(
        `INSERT INTO condominiums
           (id, name, address, units, build_year, management_start_date,
            current_regulation_version, law_revision_status, assigned_manager, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          c.id, c.name, c.address, c.units, c.build_year,
          c.management_start_date, c.current_regulation_version,
          c.law_revision_status, c.assigned_manager,
        ]
      );
    }

    console.log(`[SEED] Successfully seeded ${condominiums.length} condominiums.`);
  } catch (error) {
    console.error("[SEED] Error seeding condominiums:", error);
    throw error;
  }
}
